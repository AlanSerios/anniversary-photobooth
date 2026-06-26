import React from 'react';
import { unlockAudio } from '../lib/audio';
import './ReadyScreen.css';

export default function ReadyScreen({ onReady, onGallery, hasHistory }) {
  const handleReadyClick = () => {
    unlockAudio();
    onReady();
  };

  return (
    <div className="ready-screen">
      
      {/* Top Section */}
      <div className="canva-section-top">
        <div className="canva-placeholder cat-image" aria-label="Cat with pink bow">
          <span>Cat Image Here</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className="canva-title">
            Happy 8th<br />
            Anniversarry
          </h1>
          <h2 className="canva-subtitle">MY LOVEEE &lt;3</h2>
        </div>
      </div>

      {/* Middle Section */}
      <div className="canva-section-middle">
        <div className="canva-placeholder heart-collage" aria-label="Heart collage">
           <span>Heart Collage Here</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 className="canva-greeting">hiiii loveee!!!</h3>
          <p className="canva-paragraph">
            Welcome to Banas simple gift Babiii, I know it's not much pero since bana can't physically go there, I made this, a reminder of how much I love you. Today is a special day, and today I want to show and celebrate with you how far we had come. Come with bana as we go through every year that we had been through, the ups and the downs na we had faced while holding each others hands &lt;3
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="canva-section-bottom">
        <p className="canva-bottom-text-1">before we start, smile babii &lt;3</p>
        <p className="canva-bottom-text-2">i wanna see you smile always.....</p>
        
        <button 
          className="camera-button" 
          onClick={handleReadyClick}
          id="btn-im-ready"
        >
          CLICK THE CAMERA TO CAPTURE PHOTO
        </button>

        {hasHistory && (
          <button 
            onClick={onGallery} 
            className="camera-button" 
            style={{ marginTop: '10px', fontSize: '1rem', padding: '10px 30px' }}
          >
            View Gallery
          </button>
        )}
      </div>

    </div>
  );
}
