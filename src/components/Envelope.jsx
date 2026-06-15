import { useState, useEffect } from 'react';
import './Envelope.css';

export default function Envelope({ onOpen }) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 1000);
  };

  return (
    <div className={`envelope-overlay ${isOpening ? 'opening' : ''}`}>
      <div className="envelope">
        
        {/* Adorable Kawaii Kitten Placeholder */}
        <div className="kitten-placeholder">
          {/* REPLACE THIS LINK WITH YOUR WIFE'S KITTEN */}
          <img src="https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&w=400&q=80" alt="Kawaii Kitten" />
        </div>

        <button className="seal-button" onClick={handleOpen}>
          <svg className="seal-heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="seal-text">Open Me!</span>
        </button>
      </div>
    </div>
  );
}
