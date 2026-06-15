import { useState, useRef, useEffect } from 'react';
import './PhotoBooth.css';

export default function PhotoBooth() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 400, height: 300, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCamera(true);
        setCameraError('');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Oops! Couldn't access the camera. Make sure permissions are allowed! 🥺");
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setHasCamera(false);
  };

  // Capture the photo
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Trigger flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 500);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    // We flip it horizontally because the video feed is mirrored
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to image data
    const dataUrl = canvas.toDataURL('image/png');
    setPhotoData(dataUrl);
    
    // Turn off camera after taking photo to save battery
    stopCamera();
  };

  // Retake photo
  const retakePhoto = () => {
    setPhotoData(null);
    startCamera();
  };

  // Download photo
  const downloadPhoto = () => {
    if (!photoData) return;
    const link = document.createElement('a');
    link.href = photoData;
    link.download = 'anniversary_memory.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="photobooth-container section">
      <h2 className="photobooth-header">Make a Memory! 📸</h2>
      
      <div className="photobooth-frame">
        <div className="photobooth-tape"></div>
        
        <div className="video-container">
          {/* Flash effect overlay */}
          <div className={`flash-effect ${isFlashing ? 'flash-active' : ''}`}></div>

          {photoData ? (
            <img src={photoData} alt="Captured memory" className="captured-image" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="camera-feed"
            />
          )}

          {/* Fallback text if camera is off and no photo is taken */}
          {!hasCamera && !photoData && (
            <div className="camera-overlay-text">
              {cameraError ? cameraError : "Click 'Turn on Camera' to start!"}
            </div>
          )}
        </div>
        
        <div className="photobooth-caption">
          {photoData ? "Our perfect moment ❤️" : "Smile for the scrapbook!"}
        </div>
      </div>

      <div className="photobooth-controls">
        {!hasCamera && !photoData && (
          <button className="btn-primary" onClick={startCamera}>
            ✨ Turn on Camera
          </button>
        )}

        {hasCamera && !photoData && (
          <button className="btn-primary" onClick={takePhoto}>
            📸 Snap Photo!
          </button>
        )}

        {photoData && (
          <>
            <button className="btn-secondary" onClick={retakePhoto}>
              🔄 Retake
            </button>
            <button className="btn-primary" onClick={downloadPhoto}>
              💝 Save to Device
            </button>
          </>
        )}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
