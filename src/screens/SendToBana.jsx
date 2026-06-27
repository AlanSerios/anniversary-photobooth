import { useRef, useState, useEffect } from 'react';
import './SendToBana.css';

const LABELS = ['moment one', 'moment two', 'moment three'];

/**
 * MagneticPolaroid — 3D magnetic tilt effect
 * Follows mouse position and pops the card toward the cursor
 */
function MagneticPolaroid({ src, label, baseRotation }) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect  = wrap.getBoundingClientRect();
    const cx    = rect.left + rect.width / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = e.clientX - cx;
    const dy    = e.clientY - cy;
    const maxTilt = 16; // degrees
    const tiltX = -(dy / (rect.height / 2)) * maxTilt;
    const tiltY =  (dx / (rect.width  / 2)) * maxTilt;

    // Magnetic pull: move the whole wrap slightly toward cursor
    const pullX = dx * 0.12;
    const pullY = dy * 0.12;

    wrap.style.transform = `translate(${pullX}px, ${pullY}px)`;
    if (cardRef.current) {
      cardRef.current.style.transform = `rotate(${baseRotation}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.07) translateZ(0)`;
    }
  };

  const handleMouseLeave = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.style.transition = 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)';
    wrap.style.transform = 'translate(0, 0)';
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.3s';
      cardRef.current.style.transform  = `rotate(${baseRotation}deg) scale(1) translateZ(0)`;
    }
    // Remove inline transition after animation
    setTimeout(() => {
      if (wrap) wrap.style.transition = '';
      if (cardRef.current) cardRef.current.style.transition = '';
    }, 600);
  };

  return (
    <div
      ref={wrapRef}
      className="send-polaroid-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}
    >
      <div
        ref={cardRef}
        className="send-polaroid"
        style={{
          transform: `rotate(${baseRotation}deg) translateZ(0)`,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <div className="send-photo-frame">
          {src && <img src={src} alt="" />}
        </div>
        <p className="send-polaroid-label">{label}</p>
      </div>
    </div>
  );
}

const BASE_ROTATIONS = [-5, 0, 5];
const PHOTO_LABELS   = ['moment one', 'moment two', 'moment three'];

export default function SendToBana({ photos, onRetake, onSend }) {
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
    <main className="send-screen screen-enter">
      <span className="send-eyebrow">[ REVIEW DATA PACKAGE ]</span>

      {/* Fan of 3 polaroid photos with magnetic tilt */}
      <div className="send-photos-fan">
        {photos.map((burst, i) => {
          const src = Array.isArray(burst) ? burst[frameIdx % burst.length] : burst;
          return (
            <MagneticPolaroid
              key={i}
              src={src}
              label={PHOTO_LABELS[i]}
              baseRotation={BASE_ROTATIONS[i]}
            />
          );
        })}
      </div>

      {/* Question card */}
      <div className="send-card-outer">
        <div className="send-card-inner">
          <h1 className="send-question">
            TRANSMIT TO <em>BANA</em>?
          </h1>

          <p className="send-sub">
            &gt; SOOOO GWAPAAAAA, YOU LOOK GORGEOUS BABIII!!!
          </p>

          <div className="send-actions">
            <button className="send-yes-btn" onClick={onSend} id="btn-yes-lablab">
              [ TRANSMIT TO: BANA ]
              <span className="send-yes-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>

            <button className="send-retake-btn" onClick={onRetake} id="btn-retake">
              [ ABORT & RECAPTURE ]
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
