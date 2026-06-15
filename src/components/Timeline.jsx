import { useEffect, useRef } from 'react';
import Memory from './Memory';
import './Timeline.css';

const memories = [
  {
    year: 'Year 1',
    title: 'The Beginning',
    description: 'First coffee date and endless conversations.',
    img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-1',
    tapeClass: 'tape-top-left'
  },
  {
    year: 'Year 2',
    title: 'First Trip',
    description: 'Getting lost but finding the best food.',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-2',
    tapeClass: 'tape-top-right'
  },
  {
    year: 'Year 3',
    title: 'Moving In',
    description: 'Building our cozy little corner of the world.',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-3',
    tapeClass: 'tape-top-center'
  },
  {
    year: 'Year 4',
    title: 'Adventures',
    description: 'Conquering mountains and our fears together.',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-4',
    tapeClass: 'tape-top-left'
  },
  {
    year: 'Year 5',
    title: 'Quiet Moments',
    description: 'Learning that doing nothing with you is everything.',
    img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-5',
    tapeClass: 'tape-top-right'
  },
  {
    year: 'Year 6',
    title: 'Milestones',
    description: 'Celebrating the big wins and the small ones.',
    img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-6',
    tapeClass: 'tape-top-center'
  },
  {
    year: 'Year 7',
    title: 'Growing Together',
    description: 'Always evolving, but staying anchored to us.',
    img: 'https://images.unsplash.com/photo-1518131379761-12c85b3bc9f7?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-7',
    tapeClass: 'tape-top-left'
  },
  {
    year: 'Year 8',
    title: 'Here We Are',
    description: '8 beautiful years down, forever to go.',
    img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    scatterClass: 'scatter-8',
    tapeClass: 'tape-top-right'
  }
];

export default function Timeline() {
  return (
    <div className="timeline-container">
      <div className="scrapbook-canvas">
        {memories.map((mem, index) => (
          <Memory key={index} data={mem} />
        ))}
      </div>
    </div>
  );
}
