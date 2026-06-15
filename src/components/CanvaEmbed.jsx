import React from 'react';

export default function CanvaEmbed() {
  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', height: '0', paddingTop: '313.3236%', paddingBottom: '0', boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)', marginTop: '1.6em', marginBottom: '0.9em', overflow: 'hidden', borderRadius: '8px', willChange: 'transform' }}>
        <iframe 
          loading="lazy" 
          style={{ position: 'absolute', width: '100%', height: '100%', top: '0', left: '0', border: 'none', padding: '0', margin: '0' }}
          src="https://www.canva.com/design/DAHMkrPF9ks/WIzxr0Jin1CamiJZled6xg/view?embed" 
          allowFullScreen="allowfullscreen" 
          allow="fullscreen"
          title="8TH Anniversary Canva Design"
        >
        </iframe>
      </div>
      <a href="https://www.canva.com/design/DAHMkrPF9ks/WIzxr0Jin1CamiJZled6xg/view?utm_content=DAHMkrPF9ks&utm_campaign=designshare&utm_medium=embeds&utm_source=link" target="_blank" rel="noopener noreferrer" style={{ marginBottom: '2rem', color: '#888', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
        8TH by cynderosario.malayo@deped.gov.ph
      </a>
    </div>
  );
}
