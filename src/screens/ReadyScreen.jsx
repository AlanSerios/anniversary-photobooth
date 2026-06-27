import { unlockAudio } from '../lib/audio';
import './ReadyScreen.css';

export default function ReadyScreen({ onReady, onGallery, hasHistory }) {
  const handleReadyClick = () => {
    unlockAudio();
    onReady();
  };
  
  return (
    <main className="ready-screen screen-enter">
      <div className="terminal-border">
        <div className="terminal-header">
          <span className="telemetry-data">[ SYS.INIT : PHOTOBOOTH_V8 ]</span>
          <span className="telemetry-data right">OP_STATUS: AWAITING_INPUT</span>
        </div>

        <section className="terminal-core">
          <div className="core-hud">
            <h1 className="hud-headline">
              &gt; INITIATE CAPTURE SEQUENCE
            </h1>
            <p className="hud-sub">
              [ WARNING: EXTREME DATA DENSITY EXPECTED. PROCEED WITH CAUTION. ]
              <br/><br/>
              &gt;&gt; TARGET: ANNIVERSARY_8
              <br/>
              &gt;&gt; PROTOCOL: ENGAGED
            </p>

            <div className="hud-actions">
              <button className="hud-btn primary" onClick={handleReadyClick} id="btn-im-ready">
                [ ENGAGE CAMERA ]
              </button>
              
              <button onClick={onGallery} className="hud-btn secondary">
                [ ACCESS DATABASE ]
              </button>
            </div>
          </div>
        </section>

        <div className="terminal-footer">
          <span className="telemetry-data">REC_DATE: 2026.06.27</span>
          <span className="telemetry-data right">CLASSIFICATION: TOP_SECRET</span>
        </div>
      </div>
    </main>
  );
}
