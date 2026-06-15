import { useEffect, useState, useRef } from 'react';
import FloatingPetals from '../components/FloatingPetals';
import { savePhoto } from '../lib/supabase';
import GIF from 'gif.js';
import './ResultScreen.css';

/**
 * Canvas-based strip compositor — avoids html2canvas blank-image bug.
 * Draws each photo directly via drawImage() and composites a full strip PNG.
 */
export async function buildStripCanvas(photos) {
  const PHOTO_SIZE  = 400;
  const GAP         = 16;
  const PADDING_X   = 24;
  const PADDING_TOP = 24;
  const FOOTER_H    = 56;
  const RADIUS      = 8;

  const totalW = PHOTO_SIZE + PADDING_X * 2;
  const totalH = PADDING_TOP + photos.length * PHOTO_SIZE + (photos.length - 1) * GAP + GAP + FOOTER_H;

  const canvas = document.createElement('canvas');
  const SCALE  = 2;
  canvas.width  = totalW * SCALE;
  canvas.height = totalH * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, totalW, totalH);

  for (let i = 0; i < photos.length; i++) {
    const img = await new Promise((res, rej) => {
      const el = new Image();
      el.onload  = () => res(el);
      el.onerror = rej;
      el.src = photos[i];
    });
    const y = PADDING_TOP + i * (PHOTO_SIZE + GAP);

    // Rounded clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(PADDING_X + RADIUS, y);
    ctx.lineTo(PADDING_X + PHOTO_SIZE - RADIUS, y);
    ctx.arcTo(PADDING_X + PHOTO_SIZE, y, PADDING_X + PHOTO_SIZE, y + RADIUS, RADIUS);
    ctx.lineTo(PADDING_X + PHOTO_SIZE, y + PHOTO_SIZE - RADIUS);
    ctx.arcTo(PADDING_X + PHOTO_SIZE, y + PHOTO_SIZE, PADDING_X + PHOTO_SIZE - RADIUS, y + PHOTO_SIZE, RADIUS);
    ctx.lineTo(PADDING_X + RADIUS, y + PHOTO_SIZE);
    ctx.arcTo(PADDING_X, y + PHOTO_SIZE, PADDING_X, y + PHOTO_SIZE - RADIUS, RADIUS);
    ctx.lineTo(PADDING_X, y + RADIUS);
    ctx.arcTo(PADDING_X, y, PADDING_X + RADIUS, y, RADIUS);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, PADDING_X, y, PHOTO_SIZE, PHOTO_SIZE);
    ctx.restore();
  }

  // Caption
  ctx.font = `italic 20px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = '#C97B84';
  ctx.textAlign = 'center';
  const captionY = PADDING_TOP + photos.length * (PHOTO_SIZE + GAP) + FOOTER_H / 2 + 7;
  ctx.fillText('Happy 8th Anniversary', totalW / 2, captionY);

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

        // Generate and upload the full animated slip as index 3
        const slipPromise = (async () => {
          try {
            const slipGifUrl = await buildAnimatedSlip(photos);
            return savePhoto(slipGifUrl, 3, sessionId);
          } catch (e) {
            console.error('Failed to generate animated slip for cloud:', e);
            return null; // Don't fail the whole upload if slip fails
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
      a.download = `anniversary-photobooth-${sessionId}.png`;
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
      // Find max length in case burst sizes differ slightly
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
        
        gif.addFrame(img, { delay: 80 }); // 80ms to match burst interval
      }

      gif.on('finished', function(blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `anniversary-animated-${sessionId}.gif`;
        a.click();
        setIsBuildingGif(false);
      });

      gif.render();
    } catch (e) {
      console.error('GIF generation failed:', e);
      setIsBuildingGif(false);
    }
  };

  // 3D Magnetic Tilt Effect
  const stripRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!stripRef.current) return;
    const rect = stripRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
  };

  // Live Photo Playback Effect
  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    // Make sure we have bursts to animate
    if (!photos || photos.length === 0 || !Array.isArray(photos[0])) return;
    
    const maxFrames = Math.max(...photos.map(b => b.length));
    const interval = setInterval(() => {
      setFrameIdx(f => (f + 1) % maxFrames);
    }, 80); // 80ms to match capture speed
    return () => clearInterval(interval);
  }, [photos]);

  return (
    <main className="result-screen screen-enter">
      <FloatingPetals explosion={true} />

      {/* Left: Photo strip printing out */}
      <section className="result-strip-side">
        <div className="printer-machine">
          <div className="printer-body">
            <div className="printer-lens"></div>
            <div className="printer-flash"></div>
          </div>
          <div className="printer-slot-area">
            <div className="printer-slot"></div>
          </div>
          <div className="printer-mask">
            <div className="photo-strip-outer">
              <div
                className="photo-strip-inner"
                ref={stripRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={tiltStyle}
              >
                {photos.map((burst, i) => {
                  const src = Array.isArray(burst) ? burst[frameIdx % burst.length] : burst;
                  return (
                    <div key={i} className="strip-photo">
                      <img src={src} alt={`Photo ${i + 1}`} />
                    </div>
                  );
                })}
                <p className="strip-caption">Happy 8th Anniversary</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right: Panel */}
      <section className="result-panel-side">
        <div className="result-card-outer">
          <div className="result-card-inner">
            <span className="result-eyebrow">photobooth · anniversary edition</span>

            <h1 className="result-headline">
              Your moment, <em>captured.</em>
            </h1>

            <p className="result-sub">
              Three frames. Eight years. You looked beautiful in every single one.
            </p>

            <div className="result-actions-clean">
              <button
                className="btn-download-primary"
                onClick={handleDownload}
                disabled={isDownloading}
                id="btn-download-strip"
              >
                {isDownloading ? 'Building...' : 'Save to device'}
                <span className="btn-download-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v7M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>

              <button
                className="btn-download-primary"
                onClick={handleDownloadGif}
                disabled={isBuildingGif}
                id="btn-download-gif"
                style={{ backgroundColor: 'var(--lavender-deep)', borderColor: 'var(--lavender-deep)' }}
              >
                {isBuildingGif ? 'Building GIF...' : 'Save as animated GIF'}
                <span className="btn-download-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v7M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>

              <div className="result-actions-secondary">
                <button className="btn-secondary" onClick={onRetake} id="btn-retake">
                  Take another
                </button>

                {onGallery && (
                  <button className="btn-secondary btn-gallery" onClick={onGallery} id="btn-gallery">
                    View gallery
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
