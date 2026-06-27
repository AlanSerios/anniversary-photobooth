import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { buildStripCanvas } from './ResultScreen';
import './GalleryScreen.css';

export default function GalleryScreen({ onBack, localSessions, mySessionIds = [] }) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('shared');

  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    async function fetchSessions() {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('moments')
            .select('*')
            .order('taken_at', { ascending: false });

          if (error) throw error;

          const grouped = {};
          for (const row of data) {
            if (!grouped[row.session_id]) {
              grouped[row.session_id] = {
                id:    row.session_id,
                date:  row.taken_at,
                photos: [],
              };
            }
            grouped[row.session_id].photos[row.photo_index] = row.photo_url;
          }

          const supabaseSessions = Object.values(grouped);
          
          const supabaseSessionIds = new Set(supabaseSessions.map(s => s.id));
          const localOnly = (localSessions || []).filter(s => !supabaseSessionIds.has(s.id));
          
          const combined = [...localOnly, ...supabaseSessions];
          combined.sort((a, b) => new Date(b.date) - new Date(a.date));

          setSessions(combined);
        } catch (e) {
          console.error('Gallery fetch error:', e);
          setSessions(localSessions || []);
        }
      } else {
        setSessions(localSessions || []);
      }
      setLoading(false);
    }
    fetchSessions();
  }, []);

  const handleDownloadSession = async (session) => {
    const slipItem = session.photos[3];
    if (slipItem && typeof slipItem === 'string') {
      const a = document.createElement('a');
      a.href = slipItem;
      a.download = `telemetry-animated-${session.id.slice(0, 5)}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      try {
        const bursts = session.photos.slice(0, 3);
        const staticPhotos = bursts.map(burst => burst[Math.floor(burst.length / 2)]);
        const dataUrl = await buildStripCanvas(staticPhotos);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `telemetry-export-${session.id.slice(0, 5)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.error('Local download error:', e);
      }
    }
  };

  const displayedSessions = activeTab === 'personal'
    ? sessions.filter(s => mySessionIds.includes(s.id))
    : sessions;

  return (
    <main className="gallery-screen screen-enter">
      <div className="terminal-border">
        <div className="terminal-header">
          <span className="telemetry-data">[ ARCHIVE.DATABASE : QUERY_VIEW ]</span>
          <span className="telemetry-data right blink">SECURE_CONNECTION</span>
        </div>

        <section className="terminal-core archive-layout">
          <header className="archive-header">
            <h1 className="archive-title">DATABASE_ARCHIVE</h1>
            <div className="archive-controls">
              <button 
                className={`hud-btn secondary tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                [ QUERY: LOCAL_AUTHOR ]
              </button>
              <button 
                className={`hud-btn secondary tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
                onClick={() => setActiveTab('shared')}
              >
                [ QUERY: GLOBAL_SYSTEM ]
              </button>
              <button className="hud-btn primary back-btn" onClick={onBack}>
                [ ABORT_TO_CAPTURE ]
              </button>
            </div>
          </header>

          <div className="archive-body">
            {loading && (
              <div className="archive-status">
                <p className="blink">[ QUERYING_DATABASE... ]</p>
              </div>
            )}

            {!loading && displayedSessions.length === 0 && (
              <div className="archive-status">
                <p className="red">[ NO_RECORDS_FOUND ]</p>
                <p>AWAITING_NEW_INPUT</p>
              </div>
            )}

            {!loading && displayedSessions.length > 0 && (
              <div className="archive-grid">
                {displayedSessions.map((session, idx) => (
                  <div key={session.id} className="archive-record">
                    <div className="record-header">
                      <span className="record-id">ID: {session.id.slice(0, 8)}</span>
                      <span className="record-time">
                        {session.date ? new Date(session.date).toISOString() : 'LOCAL_TEMP'}
                      </span>
                      <button 
                        className="record-download"
                        onClick={() => handleDownloadSession(session)}
                      >
                        [ EXPORT ]
                      </button>
                    </div>

                    <div className="record-strip">
                      {(session.photos || []).slice(0, 3).filter(Boolean).map((photoItem, i) => {
                        const src = Array.isArray(photoItem) ? photoItem[frameIdx % photoItem.length] : photoItem;
                        return (
                          <div key={i} className="record-frame">
                            <img src={src} alt="" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="terminal-footer">
          <span className="telemetry-data">RECORDS_FOUND: {displayedSessions.length}</span>
          <span className="telemetry-data right">END_OF_TRANSMISSION</span>
        </div>
      </div>
    </main>
  );
}
