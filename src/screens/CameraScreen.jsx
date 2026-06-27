import { useEffect, useRef, useState } from 'react';
import './CameraScreen.css';
import { playShutterSound } from '../lib/audio';

const COUNTDOWN_FROM = 3;
const DELAY_BEFORE_FIRST = 1500;

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
    
    // Grayscale high contrast baked filter
    ctx.filter = 'grayscale(100%) contrast(1.5) brightness(0.8)';

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
        setTimeout(() => setIsFlashing(false), 200);

        const shotFrames = [];
        let framesCaptured = 0;
        const BURST_FRAMES = 10;
        const BURST_INTERVAL = 80; 
        
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
              setTimeout(() => startShot(), 800);
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
  const progressText = `[ ${displayIndex} / 3 ]`;

  return (
    <main className="camera-screen screen-enter">
      <div className="camera-grid">
        {/* Left: viewfinder */}
        <section className="camera-feed-container">
          <div className="feed-hud-border">
            {!isReady && (
              <div className="feed-loading">
                <span className="blink">[ ESTABLISHING CONNECTION ]</span>
              </div>
            )}

            <video
              ref={videoRef}
              className="feed-video"
              autoPlay
              playsInline
              muted
              style={{ opacity: isReady ? 1 : 0 }}
            />

            {countdown !== null && (
              <div className="feed-countdown">
                <span className="countdown-number">T-{countdown}.00</span>
              </div>
            )}

            <div className={`feed-flash ${isFlashing ? 'active' : ''}`} />
          </div>
        </section>

        {/* Right: telemetry */}
        <section className="camera-telemetry">
          <div className="telemetry-header">
            <span>&gt; SENSOR_DATA_FEED</span>
            <span className="blink">REC</span>
          </div>

          <div className="telemetry-status">
            <h2 className="status-label">CAPTURE_PROGRESS</h2>
            <div className="status-value">{progressText}</div>
          </div>

          <div className="telemetry-logs">
            <p>&gt; ALLOCATING BUFFER...</p>
            <p>&gt; LOCKING FOCUS...</p>
            {countdown !== null && <p>&gt; FIRING SEQUENCE ENGAGED</p>}
            {isFlashing && <p style={{color: 'var(--accent-red)'}}>&gt; EXPOSURE MAXIMIZED</p>}
          </div>

          <div className="telemetry-strip">
            <h3 className="strip-label">BUFFER_DUMP:</h3>
            <div className="strip-slots">
              {[0, 1, 2].map(i => (
                <div key={i} className={`strip-slot ${previews[i] ? 'filled' : ''}`}>
                  {previews[i] ? (
                    <img src={previews[i]} alt="captured frame" />
                  ) : (
                    <span>NO_DATA</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  );
}
