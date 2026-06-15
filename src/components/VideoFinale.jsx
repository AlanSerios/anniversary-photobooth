import './VideoFinale.css';

export default function VideoFinale() {
  return (
    <div className="video-finale-container section">
      <div className="finale-grid">
        <div className="video-wrapper">
          <div className="recipe-card">
            <video 
              className="finale-video" 
              controls 
              poster="https://images.unsplash.com/photo-1518192161663-5a6238d61c28?auto=format&fit=crop&w=800&q=80"
            >
              <source src="/placeholder-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="finale-content">
          <div className="bakery-menu">
            <div className="menu-header">
              <span className="decorative-doodle">🎀</span>
              <h2 className="finale-title">Ingredients of Us</h2>
              <span className="decorative-doodle">🎀</span>
            </div>
            
            <div className="recipe-details">
              <h3>The Perfect Recipe:</h3>
              <ul>
                <li>• 8 Years of Adventures</li>
                <li>• 1,000+ Coffee Dates</li>
                <li>• Endless Kisses</li>
                <li>• 1 Cute Kitten</li>
                <li>• A Pinch of Chaos</li>
              </ul>
            </div>
            
            <p className="finale-text">
              Happy 8th Anniversary! 💖 Here is a little video I put together to celebrate everything we've baked up over the years.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
