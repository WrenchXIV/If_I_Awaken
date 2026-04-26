/* FINAL 3 — CHAPBOOK POP (J primary + G color-field pops)
   Forest green + bone + terracotta drop caps (J). Rust/ochre/teal color
   blocks as "pop" moments (G). EB Garamond + Inter Tight headers.
   Photography: B&W, duotoned with color-block tints.
*/
const F3 = {
  bone:'#EFE4CE', boneDeep:'#E2D3B2', forest:'#1F3028', ink:'#14140F',
  terra:'#B04527', gold:'#C0924A',
  rust:'#C44A2E', ochre:'#D89A3A', teal:'#1C3D3D',
  rule:'rgba(20,20,15,0.18)',
};
const f3Styles = {
  root: { background: F3.bone, color: F3.ink, fontFamily: "'EB Garamond', 'Cormorant Garamond', Garamond, serif", width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontSize: 14.5, lineHeight: 1.6 },
  label: { fontFamily: "'Inter Tight', sans-serif", fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: F3.forest, fontWeight: 600 },
  section: { padding: '40px 56px', borderBottom: `1px solid ${F3.rule}` },
};
function F3Orn({c=F3.terra}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: c, margin: '12px 0' }}>
      <div style={{ flex: 1, height: 1, background: c, opacity: 0.45 }}/>
      <span style={{ fontSize: 12 }}>✦ ❦ ✦</span>
      <div style={{ flex: 1, height: 1, background: c, opacity: 0.45 }}/>
    </div>
  );
}
const tintImg = (src, tint, op=0.5) => (
  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.15) brightness(1)' }}/>
    <div style={{ position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply', opacity: op }}/>
  </div>
);

function Final3() {
  return (
    <div style={f3Styles.root}>
      <div style={{ padding: '20px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${F3.rule}`, background: F3.boneDeep }}>
        <div style={f3Styles.label}>Direction 03 · Chapbook Pop</div>
        <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 15, color: F3.forest }}>Bookish · Colorful · Warm</div>
        <div style={f3Styles.label}>03 / 03</div>
      </div>

      {/* HERO — three color blocks + chapbook title */}
      <div style={{ position: 'relative', height: 560, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${F3.rule}` }}>
        <div style={{ background: F3.rust, position: 'relative', overflow: 'hidden' }}>
          {tintImg("assets/brand/photo-01-bw.jpg", F3.rust, 0.65)}
        </div>
        <div style={{ background: F3.bone, position: 'relative' }}/>
        <div style={{ background: F3.teal, position: 'relative', overflow: 'hidden' }}>
          {tintImg("assets/brand/photo-03-canyon.jpg", F3.teal, 0.6)}
        </div>

        <div style={{ position: 'absolute', inset: 0, padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: F3.bone }}>
            <span style={{ ...f3Styles.label, color: F3.bone }}>— A Chapbook in Six Parts —</span>
            <span style={{ ...f3Styles.label, color: F3.ink }}>MMXXVII</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ background: F3.bone, display: 'inline-block', padding: '28px 40px', border: `6px double ${F3.forest}`, maxWidth: '70%' }}>
              <img src="assets/brand/logo-twoline.png" alt="" style={{ width: '100%', maxWidth: 460, display: 'block', margin: '0 auto' }}/>
              <F3Orn c={F3.terra}/>
              <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 22, color: F3.forest, lineHeight: 1.3 }}>
                a love-letter to the city,<br/>set down in its own <span style={{ color: F3.rust }}>voice.</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ ...f3Styles.label, color: F3.bone }}>539 S Mission Rd</span>
            <span style={{ ...f3Styles.label, color: F3.ink, background: F3.ochre, padding: '4px 10px' }}>→ Opens June 2027</span>
          </div>
        </div>
      </div>

      {/* PALETTE */}
      <div style={f3Styles.section}>
        <div style={{ ...f3Styles.label, marginBottom: 14, color: F3.terra }}>§ I · The Inks</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, height: 160 }}>
          {[
            ['Bone', F3.bone, F3.ink],
            ['Vellum', F3.boneDeep, F3.ink],
            ['Forest', F3.forest, F3.bone],
            ['Terracotta', F3.terra, F3.bone],
            ['Rust Pop', F3.rust, F3.bone],
            ['Ochre Pop', F3.ochre, F3.ink],
            ['Teal Pop', F3.teal, F3.bone],
          ].map(([n,h,t],i)=>(
            <div key={i} style={{ background:h, color:t, padding:10, display:'flex', flexDirection:'column', justifyContent:'flex-end', border: h===F3.bone?`1px solid ${F3.rule}`:'none' }}>
              <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 16 }}>{n}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.8 }}>{h.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TYPE — drop cap page */}
      <div style={f3Styles.section}>
        <div style={{ ...f3Styles.label, marginBottom: 14, color: F3.terra }}>§ II · The Setting</div>
        <div style={{ background: F3.boneDeep, padding: 36, border: `1px solid ${F3.rule}`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'start' }}>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, lineHeight: 1.7, color: F3.ink, maxWidth: '54ch' }}>
            <span style={{ float: 'left', fontFamily: "'EB Garamond', serif", fontSize: 120, lineHeight: 0.78, color: F3.rust, paddingRight: 12, paddingTop: 4, fontWeight: 500 }}>L</span>
            OS ANGELES is a city of portals — a place where the drum-circle at Leimert Park and the Dragon Parade at Chinatown speak the same <em>tongue</em> at dusk. In the pages that follow, the reader will find six rooms, six voices, and one city waking up <em style={{ color: F3.teal, fontWeight: 500 }}>inside of itself.</em>
          </div>
          <div>
            <div style={{ background: F3.teal, color: F3.bone, padding: 22 }}>
              <div style={{ ...f3Styles.label, color: F3.bone, marginBottom: 8 }}>Display</div>
              <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 46, lineHeight: 0.95, color: F3.bone }}>A city<br/>set in<br/><span style={{ color: F3.ochre }}>color.</span></div>
            </div>
            <div style={{ marginTop: 10, ...f3Styles.label, color: F3.ink, opacity: 0.75 }}>EB Garamond italic · Inter Tight labels</div>
          </div>
        </div>
      </div>

      {/* APPLICATIONS */}
      <div style={{ ...f3Styles.section, borderBottom: 'none' }}>
        <div style={{ ...f3Styles.label, marginBottom: 14, color: F3.terra }}>§ III · In Use</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {/* Chapbook cover */}
          <div style={{ aspectRatio: '3/4', background: F3.forest, padding: '28px 22px', border: `1px solid ${F3.ink}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: F3.bone, textAlign: 'center' }}>
            <div style={{ border: `2px solid ${F3.gold}`, padding: '18px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ ...f3Styles.label, color: F3.gold }}>✦ MMXXVII ✦</div>
              <div>
                <img src="assets/brand/logo-twoline.png" alt="" style={{ width: '100%', maxWidth: 200, margin: '0 auto', display: 'block', filter: 'brightness(0) invert(82%) sepia(30%) saturate(470%) hue-rotate(0deg) brightness(92%)' }}/>
                <F3Orn c={F3.gold}/>
                <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 15, color: F3.bone }}>a love-letter to the city</div>
              </div>
              <div style={{ ...f3Styles.label, color: F3.gold, fontFamily: "'EB Garamond', serif", letterSpacing: '0.2em' }}>✦ Vol. I · Six Acts ✦</div>
            </div>
          </div>

          {/* Poster, rust pop */}
          <div style={{ aspectRatio: '3/4', background: F3.rust, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: F3.bone, position: 'relative', overflow: 'hidden' }}>
            <div>
              <div style={{ ...f3Styles.label, color: F3.bone }}>— ACT I · LEIMERT PARK —</div>
              <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 46, fontWeight: 400, lineHeight: 0.95, color: F3.bone, marginTop: 14 }}>
                The drum<br/>still <span style={{ color: F3.ochre, fontStyle: 'italic' }}>remembers.</span>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
              <img src="assets/brand/logo-oneline.png" alt="" style={{ width: '60%', filter: 'brightness(0) invert(1)' }}/>
              <div style={{ ...f3Styles.label, color: F3.bone }}>VI MMXXVII</div>
            </div>
          </div>

          {/* Photo + ochre label */}
          <div style={{ aspectRatio: '3/4', border: `1px solid ${F3.ink}`, display: 'grid', gridTemplateRows: '1fr auto' }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              {tintImg("assets/brand/photo-04-finale.jpg", F3.forest, 0.55)}
              <div style={{ position: 'absolute', top: 12, left: 12, ...f3Styles.label, color: F3.bone, background: F3.ochre, padding: '4px 8px', color: F3.ink }}>Pl. VI</div>
            </div>
            <div style={{ background: F3.bone, padding: '14px 16px' }}>
              <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 22, color: F3.forest, lineHeight: 1.1 }}>The Finale</div>
              <div style={{ ...f3Styles.label, color: F3.terra, marginTop: 4 }}>— The Ensemble, at curtain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Final3 = Final3;
