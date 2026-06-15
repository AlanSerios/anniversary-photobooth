import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import FloatingPetals from '../components/FloatingPetals';
import { buildStripCanvas } from './ResultScreen';
import './GalleryScreen.css';

/**
 * Reads all sessions from Supabase 'moments' table and displays them.
 * Falls back to locally stored sessions (in localStorage) when Supabase
 * is not configured.
 */
export default function GalleryScreen({ onBack, localSessions }) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

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

          // Group by session_id
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
          
          // Merge local sessions that haven't finished uploading to Supabase yet
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

    const interval = setInterval(() => setFrameIdx(f => f + 1), 80);
    return () => clearInterval(interval);
  }, []);
  const handleDownloadSession = async (session) => {
    const slipItem = session.photos[3];
    if (slipItem && typeof slipItem === 'string') {
      // Download the animated slip from the cloud
      const a = document.createElement('a');
      a.href = slipItem;
      a.download = `anniversary-slip-${session.id.slice(0, 5)}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Local fallback (offline or still uploading)
      try {
        const bursts = session.photos.slice(0, 3);
        const staticPhotos = bursts.map(burst => burst[Math.floor(burst.length / 2)]);
        const dataUrl = await buildStripCanvas(staticPhotos);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `anniversary-slip-${session.id.slice(0, 5)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.error('Local download error:', e);
      }
    }
  };

  return (
    <main className="gallery-screen screen-enter">
      <FloatingPetals />
      <div className="gallery-inner">

        <header className="gallery-header">
          <div className="gallery-title-block">
            <span className="gallery-eyebrow">our moments</span>
            <h1 className="gallery-title">
              Her <em>gallery.</em>
            </h1>
          </div>
          <button className="gallery-back-btn" onClick={onBack} id="btn-gallery-back">
            Take a photo
          </button>
        </header>

        {loading && (
          <div className="gallery-empty">
            <div className="gallery-empty-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#C8B8D4" strokeWidth="1.5"/>
                <path d="M12 7v5l3 3" stroke="#C8B8D4" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="gallery-empty-sub">loading her moments...</p>
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="gallery-empty">
            <div className="gallery-empty-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="#C8B8D4" strokeWidth="1.5"/>
                <circle cx="9" cy="10" r="2" stroke="#C8B8D4" strokeWidth="1.5"/>
                <path d="M3 17l4-4 3 3 4-5 7 6" stroke="#C8B8D4" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="gallery-empty-title">No photos yet</p>
            <p className="gallery-empty-sub">
              Her photos will appear here after she takes her first picture.
            </p>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="gallery-sessions">
            {sessions.map((session, idx) => (
              <div
                key={session.id}
                className="gallery-session"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="gallery-session-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {session.date
                      ? new Date(session.date).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : 'recent session'}
                  </span>
                  <button 
                    onClick={() => handleDownloadSession(session)}
                    style={{ background: 'none', border: '1px solid #C97B84', color: '#C97B84', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Download
                  </button>
                </div>

                <div className="gallery-photo-row">
                  {(session.photos || []).slice(0, 3).filter(Boolean).map((photoItem, i) => {
                    const src = Array.isArray(photoItem) ? photoItem[frameIdx % photoItem.length] : photoItem;
                    return (
                      <div key={i} className="gallery-photo">
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
    </main>
  );
}
