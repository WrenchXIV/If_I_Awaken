/* FINAL 1 — THEATRICAL CINEMA (A, with B&W photography)
   Same bones as A: brand red + warm ivory + deep charcoal, Barlow Condensed +
   Fraunces, editorial/letterbox layouts. All photography now grayscale.
*/
const F1 = {
  red:'#C8322B', paper:'#EFE7D7', paperDeep:'#E6DAC3',
  ink:'#0E0A09', inkSoft:'#3A2E28', inkMute:'#7A6A5F',
  accent:'#E8B23A', rule:'rgba(14,10,9,0.15)',
};
const f1Styles = {
  root: { background: F1.paper, color: F1.ink, fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif", fontSize: 16, lineHeight: 1.5, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
  section: { padding: '48px 56px', borderBottom: `1px solid ${F1.rule}` },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: F1.inkMute, fontWeight: 400 },
  sectionHead: { display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, marginBottom: 28, alignItems: 'baseline' },
  roman: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 38, color: F1.red, fontWeight: 300, lineHeight: 1 },
  title: { fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.02em', margin: 0 },
  em: { fontStyle: 'italic', color: F1.red, fontWeight: 400 },
};
// B&W photo treatment
const bwImg = (src, opts={}) => (
  <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
    filter: `grayscale(1) contrast(${opts.contrast||1.1}) brightness(${opts.brightness||0.95})`,
    opacity: opts.opacity ?? 0.9, ...opts.style }} />
);

function Final1() {
  return (
    <div style={f1Styles.root}>
      <div style={{ padding: '28px 56px', borderBottom: `1px solid ${F1.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={f1Styles.label}>Direction 01 <span style={{ color: F1.red }}>·</span> Theatrical Cinema</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 16, color: F1.inkSoft }}>Flagship · Hero</div>
        <div style={f1Styles.label}>01 / 03</div>
      </div>

      {/* HERO */}
      <div style={{ position: 'relative', height: 640, overflow: 'hidden', background: '#0a0706' }}>
        {bwImg("assets/brand/photo-01-bw.jpg", { contrast: 1.15, brightness: 0.9 })}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(200,50,43,0.2) 0%, rgba(14,10,9,0.45) 60%, rgba(14,10,9,0.92) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: '#0a0706' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: '#0a0706' }} />
        <div style={{ position: 'absolute', top: 52, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', color: F1.paper, ...f1Styles.label, opacity: 0.8 }}>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, background: F1.red, borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }}/> A Six-Act Immersive Production</span>
          <span>539 S Mission Rd · June 2027</span>
        </div>
        <div style={{ position: 'absolute', bottom: 72, left: 40, right: 40 }}>
          <img src="assets/brand/logo-twoline.png" alt="" style={{ width: '78%', maxWidth: 620, display: 'block', filter: 'drop-shadow(0 4px 22px rgba(0,0,0,0.5))' }}/>
          <div style={{ marginTop: 18, fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 20, color: F1.paper, opacity: 0.88, maxWidth: 520 }}>
            — a love letter to the city, <em style={{ color: F1.accent, fontStyle: 'italic' }}>in its own words.</em>
          </div>
        </div>
      </div>

      {/* PALETTE */}
      <div style={f1Styles.section}>
        <div style={f1Styles.sectionHead}>
          <div style={f1Styles.roman}>I.</div>
          <div>
            <div style={{ ...f1Styles.label, marginBottom: 6 }}>Palette</div>
            <h2 style={f1Styles.title}>Brand red, warm ivory, <span style={f1Styles.em}>deep charcoal.</span></h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 8, height: 170 }}>
          {[['Signal Red',F1.red,F1.paper,'Primary'],['Paper',F1.paper,F1.ink,'Canvas'],['Paper Deep',F1.paperDeep,F1.ink,'Surface'],['Ink',F1.ink,F1.paper,'Type'],['Ember',F1.accent,F1.ink,'Accent']].map(([n,h,t,r],i)=>(
            <div key={i} style={{ background:h, color:t, padding:16, display:'flex', flexDirection:'column', justifyContent:'space-between', border: h===F1.paper?`1px solid ${F1.rule}`:'none' }}>
              <div style={{ ...f1Styles.label, color: t, opacity: 0.7 }}>{r}</div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 22, lineHeight: 1, marginBottom: 4 }}>{n}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.75 }}>{h.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TYPE */}
      <div style={f1Styles.section}>
        <div style={f1Styles.sectionHead}>
          <div style={f1Styles.roman}>II.</div>
          <div>
            <div style={{ ...f1Styles.label, marginBottom: 6 }}>Typography</div>
            <h2 style={f1Styles.title}>Condensed display, <span style={f1Styles.em}>italic serif body.</span></h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: F1.paperDeep, padding: 28, border: `1px solid ${F1.rule}` }}>
            <div style={{ ...f1Styles.label, marginBottom: 14 }}>Display <span style={{ color: F1.red }}>◆</span> Barlow Condensed Black</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 84, lineHeight: 0.92, textTransform: 'uppercase', color: F1.ink, letterSpacing: '-0.01em' }}>LOS<br/>ANGELES</div>
          </div>
          <div style={{ background: F1.paperDeep, padding: 28, border: `1px solid ${F1.rule}` }}>
            <div style={{ ...f1Styles.label, marginBottom: 14 }}>Editorial <span style={{ color: F1.red }}>◆</span> Fraunces</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 54, lineHeight: 1, fontWeight: 300, color: F1.ink, letterSpacing: '-0.02em' }}>A city that keeps<br/><em style={{ fontStyle: 'italic', color: F1.red }}>waking up</em></div>
          </div>
        </div>
      </div>

      {/* POSTER */}
      <div style={{ ...f1Styles.section, borderBottom: 'none' }}>
        <div style={f1Styles.sectionHead}>
          <div style={f1Styles.roman}>III.</div>
          <div>
            <div style={{ ...f1Styles.label, marginBottom: 6 }}>In Use</div>
            <h2 style={f1Styles.title}>Single-sheet <span style={f1Styles.em}>poster.</span></h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: '#0a0706' }}>
            {bwImg("assets/brand/photo-02-stage.jpg", { contrast: 1.2, brightness: 0.8 })}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(14,10,9,0.95) 100%)' }}/>
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, ...f1Styles.label, color: F1.paper, opacity: 0.8, display: 'flex', justifyContent: 'space-between' }}>
              <span>A Love Letter to LA</span><span>MMXXVII</span>
            </div>
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <img src="assets/brand/logo-twoline.png" alt="" style={{ width: '88%', display: 'block' }}/>
              <div style={{ marginTop: 12, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: '0.18em', color: F1.accent, textTransform: 'uppercase' }}>Six acts · One city · No intermission</div>
            </div>
          </div>
          <div style={{ aspectRatio: '3/4', background: F1.red, position: 'relative', overflow: 'hidden', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ ...f1Styles.label, color: F1.paper, opacity: 0.75, marginBottom: 20 }}>An Immersive Production</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 44, fontWeight: 300, color: F1.paper, lineHeight: 0.98, letterSpacing: '-0.02em' }}>They didn't<br/>just speak <em style={{ color: F1.accent }}>about</em><br/>Los Angeles —</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 54, color: F1.paper, lineHeight: 0.9, marginTop: 18, textTransform: 'uppercase' }}>
                They spoke<br/><span style={{ WebkitTextStroke: `1.5px ${F1.paper}`, color: 'transparent' }}>AS</span> LOS ANGELES.
              </div>
            </div>
            <div style={{ ...f1Styles.label, color: F1.paper, opacity: 0.75 }}>— The Hollywood Times</div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Final1 = Final1;
