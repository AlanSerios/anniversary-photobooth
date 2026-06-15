import { useState, useMemo } from 'react';
import ReadyScreen    from './screens/ReadyScreen';
import CameraScreen   from './screens/CameraScreen';
import SendToBana     from './screens/SendToBana';
import ResultScreen   from './screens/ResultScreen';
import GalleryScreen  from './screens/GalleryScreen';
import './index.css';

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * SCREENS:
 *  ready   → show the "Are you ready?" card
 *  camera  → auto-countdown and capture 3 photos
 *  confirm → "Send to Bana?" card with [Yes Lablab] [Retake]
 *  result  → show strip, save to Supabase, download
 *  gallery → view all sessions
 */
export default function App() {
  const [screen,       setScreen]       = useState('ready');
  const [photos,       setPhotos]       = useState([]);
  const [localHistory, setLocalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('anniversary_history');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return [];
  });
  const sessionId = useMemo(() => generateSessionId(), []);

  const handleReady = () => setScreen('camera');

  const handleCameraComplete = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    setScreen('confirm');
  };

  const handleSend = () => {
    // Save local history to cache so it remains on reload
    setLocalHistory(prev => {
      const updated = [
        {
          id:     sessionId,
          date:   new Date().toISOString(),
          photos: photos,
        },
        ...prev,
      ].slice(0, 3); // Keep last 3 to avoid localStorage size limits
      try {
        localStorage.setItem('anniversary_history', JSON.stringify(updated));
      } catch(e) {
        console.error('Failed to cache history:', e);
      }
      return updated;
    });
    setScreen('result');
  };

  const handleRetake = () => {
    setPhotos([]);
    setScreen('camera');
  };

  const handleRetakeFromResult = () => {
    setPhotos([]);
    setScreen('ready');
  };

  return (
    <>
      {screen === 'ready'   && <ReadyScreen   onReady={handleReady} />}
      {screen === 'camera'  && <CameraScreen  onComplete={handleCameraComplete} />}
      {screen === 'confirm' && (
        <SendToBana
          photos={photos}
          onRetake={handleRetake}
          onSend={handleSend}
        />
      )}
      {screen === 'result'  && (
        <ResultScreen
          photos={photos}
          sessionId={sessionId}
          onRetake={handleRetakeFromResult}
          onGallery={() => setScreen('gallery')}
        />
      )}
      {screen === 'gallery' && (
        <GalleryScreen
          onBack={() => setScreen('ready')}
          localSessions={localHistory}
        />
      )}
    </>
  );
}
