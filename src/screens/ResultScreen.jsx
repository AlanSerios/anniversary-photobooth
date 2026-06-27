import { useEffect, useState, useRef } from 'react';
import { savePhoto } from '../lib/supabase';
import GIF from 'gif.js';
import './ResultScreen.css';

/**
 * Canvas-based strip compositor — Tactical Telemetry theme
 */
export async function buildStripCanvas(photos) {
  const PHOTO_SIZE  = 400;
  const GAP         = 20;
  const PADDING_X   = 24;
  const PADDING_TOP = 24;
  const FOOTER_H    = 80;
  const RADIUS      = 0; // Strict square edges

  const totalW = PHOTO_SIZE + PADDING_X * 2;
  const totalH = PADDING_TOP + photos.length * PHOTO_SIZE + (photos.length - 1) * GAP + GAP + FOOTER_H;

  const canvas = document.createElement('canvas');
  const SCALE  = 2;
  canvas.width  = totalW * SCALE;
  canvas.height = totalH * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  // Black background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, totalW, totalH);

  // Grid lines
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  for(let i=0; i<totalW; i+=20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, totalH); ctx.stroke();
  }

  for (let i = 0; i < photos.length; i++) {
    const img = await new Promise((res, rej) => {
      const el = new Image();
      el.onload  = () => res(el);
      el.onerror = rej;
      el.src = photos[i];
    });
    const y = PADDING_TOP + i * (PHOTO_SIZE + GAP);

    ctx.save();
    ctx.beginPath();
    ctx.rect(PADDING_X, y, PHOTO_SIZE, PHOTO_SIZE);
    ctx.clip();
    
    // Grayscale filter for export
    ctx.filter = 'grayscale(100%) contrast(1.2)';
    ctx.drawImage(img, PADDING_X, y, PHOTO_SIZE, PHOTO_SIZE);
    ctx.restore();

    // Red border around photos
    ctx.strokeStyle = '#FF2A2A';
    ctx.lineWidth = 2;
    ctx.strokeRect(PADDING_X, y, PHOTO_SIZE, PHOTO_SIZE);
  }

  // Caption
  ctx.font = `bold 16px 'JetBrains Mono', monospace`;
  ctx.fillStyle = '#EAEAEA';
  ctx.textAlign = 'left';
  const captionY = PADDING_TOP + photos.length * (PHOTO_SIZE + GAP) + 30;
  ctx.fillText('> SESSION_ID: ' + Date.now().toString().slice(-6), PADDING_X, captionY);
  ctx.fillStyle = '#FF2A2A';
  ctx.fillText('STATUS: SUCCESS', PADDING_X, captionY + 20);

  return canvas.toDataURL('image/png');
}

async function buildGifForCloud(burst) {
  return new Promise((resolve, reject) => {
    const gif = new GIF({ workers: 1, quality: 10, workerScript: '/gif.worker.js' });
    let loaded = 0;
    const images = new Array(burst.length);
    burst.forEach((dataUrl, i) => {
      const img = new Image();
      img.onload = () => {
        images[i] = img;
        loaded++;
        if (loaded === burst.length) {
          images.forEach(frameImg => gif.addFrame(frameImg, { delay: 80 }));
          gif.on('finished', blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          gif.render();
        }
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  });
}
export async function buildAnimatedSlip(photos) {
  return new Promise(async (resolve, reject) => {
    try {
      const maxFrames = Math.max(...photos.map(b => b.length));
      const gif = new GIF({ workers: 2, quality: 10, workerScript: '/gif.worker.js' });

      for (let i = 0; i < maxFrames; i++) {
        const framePhotos = [
          photos[0][i % photos[0].length],
          photos[1][i % photos[1].length],
          photos[2][i % photos[2].length]
        ];
        const dataUrl = await buildStripCanvas(framePhotos);
        const img = await new Promise((res, rej) => {
          const el = new Image();
          el.onload = () => res(el);
          el.onerror = rej;
          el.src = dataUrl;
        });
        gif.addFrame(img, { delay: 80 });
      }

      gif.on('finished', blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      gif.render();
    } catch (e) {
      reject(e);
    }
  });
}
export default function ResultScreen({ photos, sessionId, onRetake, onGallery }) {
  const [saveStatus,    setSaveStatus]    = useState('idle');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBuildingGif, setIsBuildingGif] = useState(false);

  useEffect(() => {
    async function uploadPhotos() {
      setSaveStatus('saving');
      try {
        const uploadPromises = photos.map(async (burst, i) => {
          const gifDataUrl = await buildGifForCloud(burst);
          return savePhoto(gifDataUrl, i, sessionId);
        });

        const slipPromise = (async () => {
          try {
            const slipGifUrl = await buildAnimatedSlip(photos);
            return savePhoto(slipGifUrl, 3, sessionId);
          } catch (e) {
            console.error('Failed to generate animated slip for cloud:', e);
            return null;
          }
        })();

        const results = await Promise.all([...uploadPromises, slipPromise]);
        setSaveStatus(results.every(r => r !== null) ? 'saved' : 'idle');
      } catch {
        setSaveStatus('error');
      }
    }
    uploadPhotos();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const staticPhotos = photos.map(burst => burst[Math.floor(burst.length / 2)]);
      const dataUrl = await buildStripCanvas(staticPhotos);
      const a = document.createElement('a');
      a.href     = dataUrl;
      a.download = `telemetry-export-${sessionId}.png`;
      a.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadGif = async () => {
    setIsBuildingGif(true);
    try {
      const maxFrames = Math.max(...photos.map(b => b.length));
      
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: '/gif.worker.js'
      });

      for (let i = 0; i < maxFrames; i++) {
        const framePhotos = [
          photos[0][i % photos[0].length],
          photos[1][i % photos[1].length],
          photos[2][i % photos[2].length]
        ];
        
        const dataUrl = await buildStripCanvas(framePhotos);
        const img = await new Promise((res, rej) => {
          const el = new Image();
          el.onload = () => res(el);
          el.onerror = rej;
          el.src = dataUrl;
        });
        
        gif.addFrame(img, { delay: 80 }); 
      }

      gif.on('finished', function(blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `telemetry-animated-${sessionId}.gif`;
        a.click();
        setIsBuildingGif(false);
      });

      gif.render();
    } catch (e) {
      console.error('GIF generation failed:', e);
      setIsBuildingGif(false);
    }
  };

  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    if (!photos || photos.length === 0 || !Array.isArray(photos[0])) return;
    const maxFrames = Math.max(...photos.map(b => b.length));
    const interval = setInterval(() => {
      setFrameIdx(f => (f + 1) % maxFrames);
    }, 80); 
    return () => clearInterval(interval);
  }, [photos]);

  return (
    <main className="result-screen screen-enter">
      <div className="terminal-border">
        <div className="terminal-header">
          <span className="telemetry-data">[ DATA.EXPORT : RECORD_VIEW ]</span>
          <span className="telemetry-data right blink">UPLOADING_TO_SERVER</span>
        </div>

        <section className="terminal-core result-layout">
          
          {/* Left: Strip */}
          <div className="export-visual">
            <div className="strip-container">
              {photos.map((burst, i) => {
                const src = Array.isArray(burst) ? burst[frameIdx % burst.length] : burst;
                return (
                  <div key={i} className="export-photo">
                    <img src={src} alt={`Record ${i + 1}`} />
                  </div>
                );
              })}
              <div className="export-caption">
                <p>&gt; SESSION_ID: {sessionId.slice(0,8)}</p>
                <p className="red">STATUS: SECURED</p>
              </div>
            </div>
          </div>

          {/* Right: Data Panel */}
          <div className="export-data">
            <h1 className="export-headline">DATA_CAPTURED</h1>
            <div className="export-log">
              <p>[ {new Date().toISOString()} ]</p>
              <p>&gt; THREE_FRAMES EXTRACTED.</p>
              <p>&gt; EIGHT_YEARS ARCHIVED.</p>
              <p>&gt; TARGET IS BEAUTIFUL.</p>
            </div>

            <div className="export-actions">
              <button className="hud-btn primary" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? '[ COMPILING BINARY... ]' : '[ EXPORT STATIC_PNG ]'}
              </button>

              <button className="hud-btn secondary" onClick={handleDownloadGif} disabled={isBuildingGif}>
                {isBuildingGif ? '[ RENDERING SEQUENCE... ]' : '[ EXPORT ANIMATED_GIF ]'}
              </button>

              <div className="export-secondary-actions">
                <button className="hud-btn secondary" onClick={onRetake}>
                  [ RETRY_CAPTURE ]
                </button>
                {onGallery && (
                  <button className="hud-btn secondary" onClick={onGallery}>
                    [ DATABASE_ARCHIVE ]
                  </button>
                )}
                <a href="https://unifab.my.canva.site/" className="hud-btn secondary link-btn">
                  [ ABORT_TO_LETTER ]
                </a>
              </div>
            </div>
          </div>

        </section>

        <div className="terminal-footer">
          <span className="telemetry-data">SYNC_STATUS: {saveStatus.toUpperCase()}</span>
          <span className="telemetry-data right">CLASSIFICATION: TOP_SECRET</span>
        </div>
      </div>
    </main>
  );
}
