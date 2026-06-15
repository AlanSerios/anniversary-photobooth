import { useEffect, useRef, useState } from 'react';
import FloatingPetals from '../components/FloatingPetals';
import './CameraScreen.css';

const COUNTDOWN_FROM = 3;
const DELAY_BEFORE_FIRST = 1500;
const PAUSE_BETWEEN_SHOTS = 1200;

const PROMPTS = [
  'Smile, my Babiii',
  'Now look right here',
  'One last one, gorgeous',
];

const SUBPROMPTS = [
  'Bana is watching you right now',
  'You look so beautiful',
  'Make it your best one',
];

import { playShutterSound } from '../lib/audio';

export default function CameraScreen({ onComplete }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const photoCountRef   = useRef(0);
  const capturedDataRef = useRef([]);
  const isRunningRef    = useRef(false);

  const [isReady,    setIsReady]    = useState(false);
  const [countdown,  setCountdown]  = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [previews,   setPreviews]   = useState([]);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    }).then(stream => {
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsReady(true);
    }).catch(err => console.error('Camera error:', err));

    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!isReady || isRunningRef.current) return;
    isRunningRef.current = true;
    const t = setTimeout(() => startShot(), DELAY_BEFORE_FIRST);
    return () => clearTimeout(t);
  }, [isReady]);

  function captureFrame() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return null;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    
    // Apply vintage filter to baked image
    ctx.filter = 'sepia(0.3) contrast(1.1) brightness(0.95) saturate(1.2)';

    const sx = (video.videoWidth  - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  function startShot() {
    let count = COUNTDOWN_FROM;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);

        setIsFlashing(true);
        playShutterSound();
        setTimeout(() => setIsFlashing(false), 400);

        const shotFrames = [];
        let framesCaptured = 0;
        const BURST_FRAMES = 10;
        const BURST_INTERVAL = 80; // 800ms total
        
        // First frame immediately
        const firstFrame = captureFrame();
        if (firstFrame) shotFrames.push(firstFrame);
        framesCaptured++;

        const burstInterval = setInterval(() => {
          const dataUrl = captureFrame();
          if (dataUrl) shotFrames.push(dataUrl);
          
          framesCaptured++;
          if (framesCaptured >= BURST_FRAMES) {
            clearInterval(burstInterval);
            
            photoCountRef.current += 1;
            capturedDataRef.current = [...capturedDataRef.current, shotFrames];
            const newCount = photoCountRef.current;

            setPreviews(capturedDataRef.current.map(frames => frames[Math.floor(frames.length / 2)]));
            setPhotoIndex(newCount);

            if (newCount < 3) {
              setTimeout(() => startShot(), 800); // Give them 800ms after burst finishes before next countdown starts
            } else {
              if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
              setTimeout(() => onComplete(capturedDataRef.current), 600);
            }
          }
        }, BURST_INTERVAL);
      }
    }, 1000);
  }

  const displayIndex = Math.min(photoIndex, 2);

  return (
    <main className="camera-screen screen-enter">
      <FloatingPetals />

      {/* Left: viewfinder */}
      <section className="camera-viewfinder-side">
        <div className="viewfinder-outer">
          <div className="viewfinder-inner">
            {!isReady && (
              <div className="camera-loading">
                <div className="spinner" />
                <p>starting camera...</p>
              </div>
            )}

            <video
              ref={videoRef}
              className="camera-feed"
              autoPlay
              playsInline
              muted
              style={{ opacity: isReady ? 1 : 0 }}
            />

            {countdown !== null && (
              <div className="countdown-overlay">
                <span className="countdown-numeral" key={countdown}>
                  {countdown}
                </span>
                <span className="countdown-subtext">get ready</span>
              </div>
            )}

            <div className={`flash-overlay ${isFlashing ? 'flashing' : ''}`} />
          </div>
        </div>

        {/* Progress dots under viewfinder */}
        <div className="progress-track">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`progress-dot ${
                i < previews.length ? 'done' :
                i === previews.length ? 'active' : ''
              }`}
            />
          ))}
        </div>
      </section>

      {/* Right: info panel */}
      <section className="camera-info-side">
        <span className="camera-eyebrow">photobooth · anniversary edition</span>

        <div>
          <p className="camera-photo-label">
            photo {Math.min(displayIndex + 1, 3)} of 3
          </p>
          <p className="camera-prompt">
            {PROMPTS[displayIndex]}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            {SUBPROMPTS[displayIndex]}
          </p>
        </div>

        {/* Thumbnail strip */}
        <div className="mini-strip">
          {[0, 1, 2].map(i => (
            <div key={i} className={`mini-slot ${previews[i] ? 'filled' : ''}`}>
              {previews[i] && <img src={previews[i]} alt="" />}
            </div>
          ))}
        </div>

        {/* Decorative botanical in corner */}
        <div className="camera-art-corner">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <g transform="translate(60 100)">
              <ellipse cx="0" cy="-18" rx="8" ry="18" fill="#E8B4B8" transform="rotate(0)"/>
              <ellipse cx="0" cy="-18" rx="8" ry="18" fill="#F2D7D9" transform="rotate(72)"/>
              <ellipse cx="0" cy="-18" rx="8" ry="18" fill="#E8B4B8" transform="rotate(144)"/>
              <ellipse cx="0" cy="-18" rx="8" ry="18" fill="#F2D7D9" transform="rotate(216)"/>
              <ellipse cx="0" cy="-18" rx="8" ry="18" fill="#C8B8D4" transform="rotate(288)"/>
              <circle r="6" fill="#FDF8F5"/>
            </g>
            <path d="M60 100 Q55 70 50 40 Q45 20 55 5" stroke="#C8B8D4" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  );
}
