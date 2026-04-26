/* FINAL 2 — OPERA THEATRICAL (E-led, on A's editorial bones)
   Oxblood + gilded brass + ivory. Ornate serif display (Fraunces italic).
   Editorial/cinematic layouts from A. Photography: B&W with oxblood tint.
*/
const F2 = {
  ox:'#3A0E0C', oxDeep:'#200706', brass:'#C2A15B', brassDeep:'#8C6A2E',
  ivory:'#F2E8D5', ink:'#14100C', rule:'rgba(242,232,213,0.18)',
};
const f2Styles = {
  root: { background: F2.ox, color: F2.ivory, fontFamily: "'Fraunces', 'Playfair Display', serif", width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontSize: 15, lineHeight: 1.55 },
  label: { fontFamily: "'Cormorant Garamond', serif", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: F2.brass, fontWeight: 500, fontStyle: 'italic' },
  section: { padding: '44px 56px', borderBottom: `1px solid ${F2.rule}` },
};
const oxImg = (src) => (
  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.15) brightness(0.85)' }}/>
    <div style={{ position: 'absolute', inset: 0, background: F2.ox, mixBlendMode: 'color', opacity: 0.9 }}/>
    <div style={{ position: 'absolute', inset: 0, background: F2.brass, mixBlendMode: 'overlay', opacity: 0.18 }}/>
  </div>
);
function F2Orn() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: F2.brass, margin: '14px 0' }}>
      <div style={{ flex: 1, height: 1, background: F2.brass, opacity: 0.45 }}/>
      <span style={{ fontSize: 14 }}>❦</span>
      <div style={{ flex: 1, height: 1, background: F2.brass, opacity: 0.45 }}/>
    </div>
  );
}

function Final2() {
  return (
    <div style={f2Styles.root}>
      <div style={{ padding: '22px 56px', borderBottom: `1px solid ${F2.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: F2.oxDeep }}>
        <div style={f2Styles.label}>Direction 02 ✦ The Opera House</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 16, color: F2.ivory, opacity: 0.85 }}>Ornate · Ceremonial</div>
        <div style={f2Styles.label}>02 / 03</div>
      </div>

      {/* HERO */}
      <div style={{ position: 'relative', height: 640, overflow: 'hidden', background: F2.oxDeep }}>
        {oxImg("assets/brand/photo-04-finale.jpg")}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(58,14,12,0.4) 0%, rgba(32,7,6,0.95) 100%)` }}/>
        {/* brass frame */}
        <div style={{ position: 'absolute', inset: 28, border: `1px solid ${F2.brass}`, opacity: 0.55, pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', inset: 34, border: `2px solid ${F2.brassDeep}`, opacity: 0.35, pointerEvents: 'none' }}/>

        <div style={{ position: 'absolute', top: 58, left: 0, right: 0, textAlign: 'center', ...f2Styles.label }}>✦ An Immersive Production in Six Acts ✦</div>

        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center', padding: '0 60px' }}>
          <img src="assets/brand/logo-twoline.png" alt="" style={{ width: '66%', maxWidth: 560, display: 'block', margin: '0 auto', filter: 'brightness(0) saturate(100%) invert(82%) sepia(28%) saturate(609%) hue-rotate(2deg) brightness(93%) contrast(83%) drop-shadow(0 4px 22px rgba(0,0,0,0.6))' }}/>
          <F2Orn/>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 24, color: F2.ivory, maxWidth: 580, margin: '0 auto', opacity: 0.95 }}>
            — a love letter to the city, composed for <span style={{ color: F2.brass }}>voice, ensemble, and room.</span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 58, left: 0, right: 0, textAlign: 'center', ...f2Styles.label }}>
          ✦ Summer MMXXVII ✦ 539 South Mission Road, Los Angeles ✦
        </div>
      </div>

      {/* PALETTE */}
      <div style={f2Styles.section}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={f2Styles.label}>§ I ✦ The Palette</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, height: 160 }}>
          {[['Oxblood',F2.ox,F2.ivory],['Midnight',F2.oxDeep,F2.ivory],['Gilded Brass',F2.brass,F2.ink],['Antique Gold',F2.brassDeep,F2.ivory],['Ivory',F2.ivory,F2.ink]].map(([n,h,t],i)=>(
            <div key={i} style={{ background:h, color:t, padding:14, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 19, letterSpacing: '-0.005em' }}>{n}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, opacity: 0.85, letterSpacing: '0.1em' }}>{h.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TYPE */}
      <div style={f2Styles.section}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={f2Styles.label}>§ II ✦ Typography</div>
        </div>
        <div style={{ background: F2.oxDeep, border: `1px solid ${F2.brassDeep}`, padding: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 76, fontWeight: 300, fontStyle: 'italic', lineHeight: 0.95, color: F2.ivory, letterSpacing: '-0.015em' }}>
            <span style={{ color: F2.brass }}>&</span> the city began<br/>to <em>sing.</em>
          </div>
          <F2Orn/>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16, color: F2.brass }}>
            Fraunces Display (italic) · Cormorant Garamond · Barlow Condensed for lockups
          </div>
        </div>
      </div>

      {/* PLAYBILL + POSTER */}
      <div style={{ ...f2Styles.section, borderBottom: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={f2Styles.label}>§ III ✦ In Use</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: F2.ivory, color: F2.ink, aspectRatio: '3/4', padding: '32px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `6px double ${F2.brassDeep}` }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 14, color: F2.brassDeep, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Playbill · MMXXVII</div>
            <div>
              <img src="assets/brand/logo-twoline.png" alt="" style={{ width: '92%', margin: '0 auto', display: 'block' }}/>
              <div style={{ color: F2.brassDeep, fontSize: 16, margin: '18px 0' }}>❦</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 22, fontWeight: 300, color: F2.ink }}>A love letter to the city,<br/>in its own words.</div>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 12, color: F2.brassDeep, letterSpacing: '0.12em' }}>
              directed by <span style={{ color: F2.ink }}>Andrew Scoville</span><br/>
              music by <span style={{ color: F2.ink }}>Derrick Hodge</span>
            </div>
          </div>
          <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: F2.ink, border: `6px double ${F2.brassDeep}` }}>
            {oxImg("assets/brand/photo-02-stage.jpg")}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(58,14,12,0.3) 0%, rgba(32,7,6,0.9) 100%)` }}/>
            <div style={{ position: 'absolute', top: 22, left: 22, right: 22, textAlign: 'center', ...f2Styles.label }}>✦ IN SIX ACTS ✦</div>
            <div style={{ position: 'absolute', left: 24, right: 24, bottom: 26, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 44, color: F2.ivory, lineHeight: 0.98 }}>
                If I Awaken<br/><span style={{ color: F2.brass }}>in Los Angeles</span>
              </div>
              <F2Orn/>
              <div style={{ ...f2Styles.label, fontSize: 10 }}>Boyle Heights · June MMXXVII</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Final2 = Final2;
