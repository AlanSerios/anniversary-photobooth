import React, { useState, useRef, useEffect, forwardRef } from 'react';
import './PhotoStrip.css';

const PhotoStrip = forwardRef(({ frameColor, photoShape, logoText, addDate, addTime, photos, onCapture }, ref) => {
  const [activeCameraIndex, setActiveCameraIndex] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString());
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [addDate, addTime]);

  const startCamera = async (index) => {
    setActiveCameraIndex(index);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to take photos!");
      setActiveCameraIndex(null);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || activeCameraIndex === null) return;
    
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(activeCameraIndex, dataUrl);
    
    stopCamera();
    setActiveCameraIndex(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="photostrip-wrapper">
      <div 
        ref={ref} 
        className="photostrip-container"
        style={{ backgroundColor: frameColor }}
      >
        <div className="photostrip-slots">
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              className={`photo-slot shape-${photoShape} ${photos[index] ? 'has-photo' : 'empty'}`}
              onClick={() => {
                if (activeCameraIndex === index) {
                  takePhoto();
                } else {
                  startCamera(index);
                }
              }}
            >
              {photos[index] && activeCameraIndex !== index ? (
                <img src={photos[index]} alt={`Slot ${index + 1}`} className="captured-photo" />
              ) : activeCameraIndex === index ? (
                <div className="live-camera-wrapper">
                  <div className={`flash-effect ${isFlashing ? 'active' : ''}`}></div>
                  <video ref={videoRef} autoPlay playsInline className="live-feed" />
                  <div className="capture-overlay">Click to snap 📸</div>
                </div>
              ) : (
                <div className="empty-slot-text">+</div>
              )}
            </div>
          ))}
        </div>
        
        <div className="photostrip-footer">
          <div className="photostrip-logo">
            {logoText || " "}
          </div>
          <div className="photostrip-meta">
            {addDate && <span className="meta-date">{currentDate}</span>}
            {addTime && <span className="meta-time">{currentTime}</span>}
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
});

export default PhotoStrip;
