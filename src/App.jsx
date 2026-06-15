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
  const [localHistory, setLocalHistory] = useState([]); // fallback gallery
  const sessionId = useMemo(() => generateSessionId(), []);

  const handleReady = () => setScreen('camera');

  const handleCameraComplete = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    setScreen('confirm');
  };

  const handleSend = () => {
    // Save local history as fallback when Supabase isn't configured
    setLocalHistory(prev => [
      {
        id:     sessionId,
        date:   new Date().toISOString(),
        photos: photos,
      },
      ...prev,
    ]);
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
