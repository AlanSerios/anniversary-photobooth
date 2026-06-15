import React from 'react';
import './CustomizerSidebar.css';

export default function CustomizerSidebar({ 
  frameColor, 
  setFrameColor, 
  photoShape, 
  setPhotoShape, 
  logoText, 
  setLogoText,
  addDate,
  setAddDate,
  addTime,
  setAddTime,
  onDownload 
}) {
  const presetColors = [
    '#ffffff', '#000000', '#FFB6C1', '#FFE5EC', '#FFCCAA', '#AAEEBB', '#AABBFF', '#EEBBFF',
    '#FDFD96', '#FF6961', '#CFCFC4', '#77DD77', '#84B6F4', '#FDCAE1', '#B39EB5'
  ];

  return (
    <div className="bento-grid">
      
      {/* Frame Color Card */}
      <div className="bento-card col-span-2">
        <h3 className="bento-title">Frame Color</h3>
        <div className="color-swatches-grid">
          {presetColors.map(color => (
            <button 
              key={color}
              className={`jelly-btn color-swatch ${frameColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFrameColor(color)}
              title={color}
            />
          ))}
          <input 
            type="color" 
            className="jelly-btn color-picker-custom"
            value={frameColor.startsWith('#') ? frameColor : '#ffffff'}
            onChange={(e) => setFrameColor(e.target.value)}
          />
        </div>
      </div>

      {/* Photo Shape Card */}
      <div className="bento-card col-span-1">
        <h3 className="bento-title">Photo Shape</h3>
        <div className="shape-toggles-stack">
          {['none', 'rounded', 'circle', 'heart'].map((shape) => (
            <button 
              key={shape}
              className={`jelly-btn shape-btn ${photoShape === shape ? 'active' : ''}`}
              onClick={() => setPhotoShape(shape)}
            >
              {shape.charAt(0).toUpperCase() + shape.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Options Card */}
      <div className="bento-card col-span-1">
        <h3 className="bento-title">Details</h3>
        <div className="checkbox-group">
          <label className="jelly-checkbox">
            <input 
              type="checkbox" 
              checked={addDate} 
              onChange={(e) => setAddDate(e.target.checked)} 
            />
            <span>Add Date</span>
          </label>
          <label className="jelly-checkbox">
            <input 
              type="checkbox" 
              checked={addTime} 
              onChange={(e) => setAddTime(e.target.checked)} 
            />
            <span>Add Time</span>
          </label>
        </div>
      </div>

      {/* Logo Card */}
      <div className="bento-card col-span-2">
        <h3 className="bento-title">Custom Logo</h3>
        <input 
          type="text" 
          className="glass-input"
          value={logoText}
          onChange={(e) => setLogoText(e.target.value)}
          placeholder="e.g. photobooth.io"
          maxLength={30}
        />
      </div>

      {/* Action Card */}
      <div className="bento-card col-span-3 action-card">
        <button className="jelly-btn download-btn-massive" onClick={onDownload}>
          Download Photo Strip
        </button>
      </div>

    </div>
  );
}
