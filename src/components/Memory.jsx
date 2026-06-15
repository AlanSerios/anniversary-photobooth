export default function Memory({ data }) {
  return (
    <div className={`polaroid-frame ${data.scatterClass}`}>
      {/* Washi Tape */}
      <div className={`washi-tape ${data.tapeClass}`}></div>
      
      {/* Year */}
      <div className="polaroid-year">
        {data.year.split(' ')[1]}
      </div>
      
      {/* Photo */}
      <div className="polaroid-image-container">
        <img src={data.img} alt={data.title} />
      </div>
      
      {/* Handwriting Caption */}
      <div className="polaroid-caption">
        {data.title}
      </div>
    </div>
  );
}
