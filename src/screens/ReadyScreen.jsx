import FloatingPetals from '../components/FloatingPetals';
import { unlockAudio } from '../lib/audio';
import './ReadyScreen.css';

export default function ReadyScreen({ onReady, onGallery }) {
  const handleReadyClick = () => {
    unlockAudio();
    onReady();
  };
  return (
    <main className="ready-screen screen-enter">
      <FloatingPetals />

      {/* Left: pixel art character */}
      <section className="ready-art-side">
        <div className="ready-bana-wrap">
          <img
            src="/bana.png"
            alt="Bana holding flowers"
            className="ready-bana-img"
            draggable="false"
          />
        </div>
        <p className="ready-art-watermark">
          Flowers to my beautiful Wife
        </p>
      </section>

      {/* Right: the card */}
      <section className="ready-card-side">
        <div className="ready-card-outer">
          <div className="ready-card-inner">
            <span className="ready-eyebrow">photobooth · anniversary edition</span>

            <h1 className="ready-headline">
              Are you ready for the picture,{' '}
              <em>my Love?</em>
            </h1>

            <p className="ready-sub">
              Tan-aw sa camera my Babiii — Bana will be watching.
            </p>

            <div className="ready-btn-outer">
              <button className="ready-btn" onClick={handleReadyClick} id="btn-im-ready">
                I'm ready
                <span className="ready-btn-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              
              <button 
                onClick={onGallery}
                style={{
                  marginTop: '12px',
                  background: 'none',
                  border: '1px solid #C97B84',
                  color: '#C97B84',
                  padding: '8px 24px',
                  borderRadius: '24px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              >
                View Gallery
              </button>
            </div>

            <span className="ready-footer">
              June 27, 2026 · 8 YEARS AND FOREVERMORE
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
