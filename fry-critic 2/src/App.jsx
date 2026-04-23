import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "fry-critic-v4";
const DEFAULT_FORM = {
  restaurant:"", city:"",
  crispiness:5, saltiness:5, thicknessScore:5, overallVibe:5,
  dips:"", notes:"", image:null, location:null,
};
const SIZE_LABEL={1:"Shoestring",2:"Shoestring",3:"Thin-Cut",4:"Thin-Cut",5:"Classic",6:"Classic",7:"Thick-Cut",8:"Thick-Cut",9:"Steak Fry",10:"Steak Fry"};
const tierOf=(s)=>{
  if(s>=9)return{t:"Transcendent",dot:"#C9A96E",color:"#7A5C2E"};
  if(s>=8)return{t:"Exceptional", dot:"#A8876A",color:"#6B4A30"};
  if(s>=6.5)return{t:"Commendable",dot:"#8B9E8A",color:"#4A6048"};
  if(s>=5)return{t:"Decent",     dot:"#BBA89A",color:"#7A6A5E"};
  return        {t:"Forgettable",dot:"#C4B5A8",color:"#8A7A70"};
};

const BG="#E9E1D3",SAND="#DDD4C2",CARD="#F4EFE6",INK="#2E2416",DUST="#8A7B6C",STONE="#C4B09A",GOLD="#C8A44E",OLIVE="#7A8A5A",CREAM="#FAF6EE";
const FONTS="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400&display=swap";

// ─── Image compression ───────────────────────────────────────────────────────
function compressImage(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 900 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = dataUrl;
  });
}

// ─── Storage ─────────────────────────────────────────────────────────────────
function loadRatings() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveRatings(data, showFlash) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {
    if (showFlash) showFlash("Storage full — try smaller photos");
  }
}

// ─── Illustrations ───────────────────────────────────────────────────────────
const FryIllustration = ({ style }) => (
  <svg viewBox="0 0 280 230" style={style} fill="none">
    <ellipse cx="140" cy="190" rx="120" ry="35" fill="#D4B870" opacity="0.1"/>
    {/* Whole potato */}
    <ellipse cx="44" cy="192" rx="34" ry="24" fill="#B8855A" transform="rotate(-12,44,192)"/>
    <ellipse cx="44" cy="192" rx="34" ry="24" fill="#C89870" opacity="0.3" transform="rotate(-12,44,192)"/>
    <ellipse cx="36" cy="190" rx="3" ry="2" fill="#7A4A22" opacity="0.45" transform="rotate(-15,36,190)"/>
    <ellipse cx="52" cy="182" rx="2.5" ry="1.8" fill="#7A4A22" opacity="0.4" transform="rotate(-8,52,182)"/>
    <path d="M26 189 Q34 185 42 189" stroke="#9A6030" strokeWidth="0.7" opacity="0.3"/>
    <path d="M40 198 Q48 195 56 199" stroke="#9A6030" strokeWidth="0.7" opacity="0.3"/>
    <path d="M58 178 Q62 170 60 162" stroke="#8A9E6A" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M60 168 Q66 164 68 158 Q64 156 60 160Z" fill="#8A9E6A" opacity="0.75"/>
    {/* Half potato */}
    <ellipse cx="6" cy="210" rx="22" ry="16" fill="#C89460" opacity="0.8" transform="rotate(-10,6,210)"/>
    <ellipse cx="6" cy="210" rx="16" ry="11" fill="#EDD090" opacity="0.6" transform="rotate(-10,6,210)"/>
    {/* Shoestring bundle */}
    {[["M90 222 Q87 172 90 128 Q91 112 93 105 L95 106 Q97 113 96 128 Q94 172 93 222Z","#EDD070"],
      ["M94 222 Q92 170 95 124 Q96 108 99 101 L101 102 Q103 110 102 124 Q100 170 98 222Z","#E8C860"],
      ["M98 220 Q96 168 99 122 Q100 106 103 99 L105 100 Q107 108 106 122 Q104 168 102 220Z","#F0D878"],
      ["M102 221 Q101 167 104 120 Q105 104 108 97 L110 98 Q112 106 111 120 Q109 167 107 221Z","#E0BE58"],
      ["M86 220 Q83 168 86 126 Q87 110 90 103 L92 104 Q94 112 93 126 Q91 168 90 220Z","#EDCA60"],
    ].map(([d,f],i)=><path key={i} d={d} fill={f}/>)}
    {[[94,104],[100,100],[104,98],[109,96],[91,102]].map(([x,y],i)=>(<ellipse key={i} cx={x} cy={y} rx="1.8" ry="2.8" fill="#B87820"/>))}
    <text x="84" y="90" fontSize="6.5" fill="#A88040" opacity="0.65" fontStyle="italic">shoestring</text>
    {/* Classic fries */}
    {[["M130 224 Q128 166 130 112 Q131 94 135 86 L141 87 Q144 95 142 112 Q140 166 138 224Z","#EDCC60","M135 86 Q134 78 138 74 Q142 70 144 75 Q145 80 141 87Z","#B87820"],
      ["M142 224 Q140 164 143 108 Q144 90 148 82 L154 83 Q157 91 155 108 Q153 164 151 224Z","#F0D468","M148 82 Q147 74 151 70 Q155 66 157 71 Q158 76 154 83Z","#C09020"],
      ["M154 222 Q152 160 155 106 Q156 88 160 80 L166 81 Q169 89 167 106 Q165 160 163 222Z","#EDCC60","M160 80 Q159 72 163 68 Q167 64 169 69 Q170 74 166 81Z","#B87820"],
    ].map(([body,f1,tip,tf],i)=>(
      <g key={i}><path d={body} fill={f1}/><path d={tip} fill={tf}/></g>
    ))}
    <text x="134" y="62" fontSize="6.5" fill="#A88040" opacity="0.65" fontStyle="italic">classic</text>
    {/* Crinkle */}
    <path d="M178 220 L176 207 L180 197 L176 187 L180 177 L176 167 L180 157 L176 147 L180 137 L178 125 L188 125 L190 137 L186 147 L190 157 L186 167 L190 177 L186 187 L190 197 L186 207 L188 220Z" fill="#EDD070"/>
    <path d="M178 220 L176 207 L180 197 L176 187 L180 177 L176 167 L180 157 L176 147 L180 137 L178 125 L180 125 L178 137 L182 147 L178 157 L182 167 L178 177 L182 187 L178 197 L182 207 L180 220Z" fill="#C8941E"/>
    <ellipse cx="183" cy="122" rx="5" ry="4" fill="#B07818"/>
    <text x="174" y="113" fontSize="6.5" fill="#A88040" opacity="0.65" fontStyle="italic">crinkle</text>
    {/* Steak fry */}
    <rect x="208" y="112" width="28" height="110" rx="6" fill="#E8B840"/>
    <rect x="208" y="112" width="9" height="110" rx="4" fill="#C89018"/>
    <rect x="208" y="112" width="28" height="110" rx="6" fill="none" stroke="#C09020" strokeWidth="0.8" opacity="0.4"/>
    <rect x="209" y="102" width="26" height="16" rx="5" fill="#A87010"/>
    {[138,158,178,198].map(y=>(<path key={y} d={`M212 ${y} Q222 ${y-2} 232 ${y}`} stroke="#D0A030" strokeWidth="0.7" opacity="0.35"/>))}
    <text x="202" y="95" fontSize="6.5" fill="#A88040" opacity="0.65" fontStyle="italic">steak</text>
    {/* Salt */}
    {[[138,70,15],[158,58,-12],[118,80,25],[200,94,8],[176,63,-20]].map(([x,y,r],i)=>(
      <rect key={i} x={x} y={y} width={3+i%2} height={3+i%2} rx="0.6" fill="white" opacity={0.5+i*0.04} transform={`rotate(${r},${x+1},${y+1})`}/>
    ))}
    {/* Steam */}
    <path d="M140 62 Q143 52 140 42 Q137 32 140 22" stroke="#C4B09A" strokeWidth="1.1" strokeLinecap="round" opacity="0.32"/>
    <path d="M152 54 Q155 44 152 34 Q149 24 152 14" stroke="#C4B09A" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
  </svg>
);

const KetchupBottle = ({ style }) => (
  <svg viewBox="0 0 60 100" style={style} fill="none">
    <path d="M28 15 L25 8 Q25 4 30 4 Q35 4 35 8 L32 15Z" fill="#C84040"/>
    <path d="M22 38 Q18 45 18 65 Q18 82 30 84 Q42 82 42 65 Q42 45 38 38Z" fill="#E04040"/>
    <path d="M24 38 L36 38 Q38 32 36 22 L24 22 Q22 32 24 38Z" fill="#CC3838"/>
    <path d="M24 58 Q28 55 36 58" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    <path d="M24 65 Q28 62 36 65" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
    <ellipse cx="30" cy="84" rx="10" ry="4" fill="#B83030" opacity="0.6"/>
  </svg>
);

const SaltShaker = ({ style }) => (
  <svg viewBox="0 0 50 90" style={style} fill="none">
    <path d="M18 75 Q15 60 16 45 Q17 30 25 25 Q33 30 34 45 Q35 60 32 75Z" fill="#E8E0D0"/>
    <path d="M18 75 Q15 60 16 45 Q17 30 25 25 Q27 28 27 45 Q26 60 20 75Z" fill="#D8D0C0"/>
    <rect x="18" y="74" width="14" height="6" rx="2" fill="#D0C8B8"/>
    <path d="M22 22 Q25 14 25 8 Q25 4 25 2" stroke="#C8C0B0" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="22" cy="40" r="1.2" fill="#B0A890" opacity="0.7"/>
    <circle cx="28" cy="50" r="1.2" fill="#B0A890" opacity="0.7"/>
    <circle cx="23" cy="60" r="1.2" fill="#B0A890" opacity="0.7"/>
  </svg>
);

const LeafSprig = ({ style }) => (
  <svg viewBox="0 0 80 60" style={style} fill="none">
    <path d="M40 55 Q38 40 35 25 Q32 12 40 4" stroke={OLIVE} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M38 30 Q26 24 20 14 Q26 6 34 14 Q38 22 38 30Z" fill="#8A9E6A" opacity="0.8"/>
    <path d="M39 18 Q50 10 58 14 Q56 24 47 24 Q42 22 39 18Z" fill="#7A9258" opacity="0.8"/>
    <path d="M40 42 Q30 38 26 30 Q32 24 38 32 Q40 36 40 42Z" fill="#8A9E6A" opacity="0.7"/>
  </svg>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FryCritic() {
  const [ratings, setRatings]       = useState([]);
  const [form, setForm]             = useState(DEFAULT_FORM);
  const [view, setView]             = useState("home");
  const [flash, setFlash]           = useState(null);
  const [submitting, setSub]        = useState(false);
  const [imgPreview, setPreview]    = useState(null);
  const [expanded, setExpanded]     = useState(null);
  const [lbExpanded, setLbExpanded] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const l = document.createElement("link"); l.href = FONTS; l.rel = "stylesheet"; document.head.appendChild(l);
    setRatings(loadRatings());
  }, []);

  function showFlash(m) { setFlash(m); setTimeout(() => setFlash(null), 2800); }

  async function handleImage(e) {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 8 * 1024 * 1024) { showFlash("Image too large — max 8MB"); return; }
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await compressImage(ev.target.result);
      setForm(p => ({...p, image: compressed}));
      setPreview(compressed);
    };
    reader.readAsDataURL(f);
  }
  function clearImage() { setForm(p => ({...p, image:null})); setPreview(null); if(fileRef.current) fileRef.current.value=""; }

  async function getLocation() {
    if (!navigator.geolocation) { showFlash("Geolocation not supported on this device"); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const name = data.name || data.address?.road || "";
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const label = [name, city].filter(Boolean).join(", ") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setForm(p => ({...p, location: { lat, lng, label }}));
        } catch {
          setForm(p => ({...p, location: { lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }}));
        }
        setLocLoading(false);
      },
      () => { showFlash("Couldn't get location — check permissions"); setLocLoading(false); },
      { timeout: 10000 }
    );
  }

  function handleSubmit() {
    if (!form.restaurant.trim()) { showFlash("A restaurant name is required."); return; }
    setSub(true);
    const entry = {
      ...form, id: Date.now(),
      finalScore: parseFloat(((form.crispiness+form.saltiness+form.thicknessScore+form.overallVibe)/4).toFixed(1)),
      date: new Date().toLocaleDateString("en-US", {month:"long",day:"numeric",year:"numeric"})
    };
    const updated = [entry, ...ratings];
    setRatings(updated);
    saveRatings(updated, showFlash);
    setSub(false);
    setForm(DEFAULT_FORM); setPreview(null);
    showFlash("Entry recorded."); setTimeout(() => setView("home"), 1400);
  }

  function deleteRating(id) {
    const u = ratings.filter(r => r.id !== id); setRatings(u); saveRatings(u, showFlash);
  }

  const sorted = [...ratings].sort((a,b) => b.overallVibe - a.overallVibe);
  const pTier = tierOf(form.overallVibe);

  // ─── Style helpers ──────────────────────────────────────────────────────────
  const serif = (sz,it,col) => ({fontFamily:"'Playfair Display', serif",fontStyle:it?"italic":"normal",fontSize:sz,color:col||INK,lineHeight:1.2});
  const sans  = (sz,col,w)  => ({fontFamily:"'Lato', sans-serif",fontWeight:w||300,fontSize:sz,color:col||INK});
  const tag   = {...sans(9,DUST,400), letterSpacing:"0.38em", textTransform:"uppercase"};
  const input = {
    width:"100%", background:"transparent", border:"none",
    borderBottom:`1px solid ${STONE}88`, padding:"10px 0",
    fontFamily:"'Lato', sans-serif", fontWeight:300, fontSize:14,
    color:INK, outline:"none", boxSizing:"border-box",
  };
  const pct = v => (v-1)/9*100;

  // ─── Custom sliders ─────────────────────────────────────────────────────────

  const CrispSlider = ({value, onChange}) => {
    const t = (value-1)/9;
    return (
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={serif(15,true)}>Crispiness</span>
          <span style={{...serif(18,false,GOLD)}}>{value}</span>
        </div>
        <div style={{position:"relative",height:44,display:"flex",alignItems:"center"}}>
          <div style={{position:"absolute",left:0,right:0,height:1,background:`${STONE}33`}}/>
          <div style={{position:"absolute",left:`calc(${pct(value)}% - 14px)`,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",transition:"left 0.08s"}}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" stroke={GOLD} strokeWidth="1.8" fill={GOLD} fillOpacity={t}/>
              <circle cx="14" cy="14" r="5" fill="white" fillOpacity={Math.max(0,(0.5-Math.abs(t-0.5))*0.5)}/>
            </svg>
          </div>
          <input type="range" min="1" max="10" value={value} onChange={e=>onChange(Number(e.target.value))}
            style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Soft</span>
          <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Shattering</span>
        </div>
      </div>
    );
  };

  const SaltSlider = ({value, onChange}) => (
    <div style={{marginBottom:32}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={serif(15,true)}>Saltiness</span>
        <span style={{...serif(18,false,GOLD)}}>{value}</span>
      </div>
      <div style={{position:"relative",height:44,display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",left:0,right:0,height:1,background:`${STONE}33`}}/>
        {[...Array(9)].map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${(i+1)/10*100}%`,top:"50%",
            transform:"translate(-50%,-50%) rotate(45deg)",
            width:i<(value-1)?6:3,height:i<(value-1)?6:3,
            background:i<(value-1)?GOLD:`${STONE}55`,transition:"all 0.12s"}}/>
        ))}
        <div style={{position:"absolute",left:`calc(${pct(value)}% - 9px)`,top:"50%",
          transform:"translateY(-50%) rotate(45deg)",width:18,height:18,background:GOLD,
          pointerEvents:"none",boxShadow:`0 0 0 3px ${CARD}`,transition:"left 0.08s"}}/>
        <input type="range" min="1" max="10" value={value} onChange={e=>onChange(Number(e.target.value))}
          style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Bland</span>
        <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Brine</span>
      </div>
    </div>
  );

  // Thickness now shows fry type name instead of number
  const ThicknessSlider = ({value, onChange}) => {
    const t = (value-1)/9, r = 5+t*14, sz = (r+3)*2;
    return (
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={serif(15,true)}>Thickness & Cut</span>
          <span style={{...serif(16,true,GOLD)}}>{SIZE_LABEL[value]}</span>
        </div>
        <div style={{position:"relative",height:48,display:"flex",alignItems:"center"}}>
          <div style={{position:"absolute",left:0,right:0,height:1,background:`${STONE}33`}}/>
          <div style={{position:"absolute",left:`calc(${pct(value)}% - ${sz/2}px)`,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",transition:"all 0.08s"}}>
            <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
              <circle cx={sz/2} cy={sz/2} r={r} stroke={GOLD} strokeWidth="1.5" fill={GOLD} fillOpacity={0.15+t*0.7}/>
            </svg>
          </div>
          <input type="range" min="1" max="10" value={value} onChange={e=>onChange(Number(e.target.value))}
            style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Shoestring</span>
          <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Steak Fry</span>
        </div>
      </div>
    );
  };

  // Overall — empty heart outline → full filled heart
  const OverallSlider = ({value, onChange}) => {
    const t = (value-1)/9;
    const HP = "M14 24 C14 24 1.5 16.5 1.5 9.5 C1.5 4.5 6 2 9.5 3.5 C11.5 4.5 13 6 14 7 C15 6 16.5 4.5 18.5 3.5 C22 2 26.5 4.5 26.5 9.5 C26.5 16.5 14 24 14 24Z";
    const fillY = 24 - t * 20.5;
    const scale = t > 0.92 ? 1 + Math.sin((t-0.92)/0.08*Math.PI)*0.08 : 1;
    return (
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={serif(15,true)}>Overall Score</span>
          <span style={{...serif(18,false,GOLD)}}>{value}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          {/* Left end: empty heart */}
          <svg width="18" height="18" viewBox="0 0 28 28" style={{flexShrink:0,opacity:0.3}}>
            <path d={HP} stroke={GOLD} strokeWidth="1.8" fill="none"/>
          </svg>
          <div style={{position:"relative",flex:1,height:52,display:"flex",alignItems:"center"}}>
            <div style={{position:"absolute",left:0,right:0,height:1,background:`${STONE}22`}}/>
            <div style={{position:"absolute",left:0,height:1,width:`${pct(value)}%`,background:`${GOLD}88`,transition:"width 0.08s"}}/>
            <div style={{position:"absolute",left:`calc(${pct(value)}% - 14px)`,top:"50%",
              transform:`translateY(-50%) scale(${scale})`,transformOrigin:"center",
              pointerEvents:"none",transition:"left 0.08s"}}>
              <svg width="28" height="28" viewBox="0 0 28 28" overflow="visible">
                <defs>
                  <clipPath id="hliq">
                    <rect x="-2" y={fillY} width="32" height={26-fillY}/>
                  </clipPath>
                </defs>
                {/* Always show heart outline */}
                <path d={HP} stroke={GOLD} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
                {/* Fill rises from bottom */}
                <path d={HP} fill={GOLD} clipPath="url(#hliq)" opacity={0.92}/>
                {t>0.15&&t<0.9&&(
                  <>
                    <circle cx="11" cy={fillY+3} r="1" fill="white" opacity={0.35}/>
                    <circle cx="16" cy={fillY+6} r="0.7" fill="white" opacity={0.25}/>
                  </>
                )}
              </svg>
            </div>
            <input type="range" min="1" max="10" value={value} onChange={e=>onChange(Number(e.target.value))}
              style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
          </div>
          {/* Right end: full heart */}
          <svg width="18" height="18" viewBox="0 0 28 28" style={{flexShrink:0,opacity:0.3+t*0.7}}>
            <path d={HP} fill={GOLD} stroke={GOLD} strokeWidth="1"/>
          </svg>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",paddingLeft:28,paddingRight:28}}>
          <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Meh</span>
          <span style={{...sans(9,STONE,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>Love</span>
        </div>
      </div>
    );
  };

  // ─── Entry row ──────────────────────────────────────────────────────────────
  const Entry = ({r, rank, deletable, showThumb}) => {
    const g = tierOf(r.overallVibe);
    const open = expanded === r.id;
    const mapsUrl = r.location
      ? `https://maps.apple.com/?q=${r.location.lat},${r.location.lng}`
      : null;
    return (
      <div style={{borderBottom:`1px solid ${STONE}44`,background:open?CREAM:"transparent",borderRadius:open?"8px 8px 0 0":0}}>
        <div onClick={()=>setExpanded(open?null:r.id)}
          style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0",cursor:"pointer"}}>
          <span style={{...serif(11,true,STONE),width:22,flexShrink:0,textAlign:"center"}}>{rank+1}</span>
          <span style={{width:8,height:8,borderRadius:"50%",background:g.dot,flexShrink:0}}/>
          {showThumb && (
            r.image
              ? <img src={r.image} alt={r.restaurant} style={{width:44,height:44,objectFit:"cover",borderRadius:6,flexShrink:0}}/>
              : <div style={{width:44,height:44,borderRadius:6,flexShrink:0,background:SAND,border:`1px dashed ${STONE}88`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🍟</div>
          )}
          <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
            <div style={{...serif(17,true),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.restaurant}</div>
            {r.city && <div style={{...sans(10,DUST),letterSpacing:"0.1em",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.city}</div>}
          </div>
          <div style={{textAlign:"right",flexShrink:0,marginLeft:4}}>
            <div style={{...serif(22,false,r.overallVibe>=8?GOLD:INK),lineHeight:1}}>{r.overallVibe}</div>
            <div style={{...sans(8,g.color,400),letterSpacing:"0.15em",textTransform:"uppercase",marginTop:1}}>{g.t}</div>
          </div>
          <span style={{color:STONE,fontSize:11,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}>▾</span>
        </div>
        {open && (
          <div style={{padding:"0 4px 20px 42px"}}>
            {r.image && <img src={r.image} alt={r.restaurant} style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:6,marginBottom:16,display:"block"}}/>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              {[["Crispiness",r.crispiness],["Saltiness",r.saltiness],["Cut",SIZE_LABEL[r.thicknessScore]||r.thicknessScore],["Overall",r.overallVibe]].map(([l,v])=>(
                <div key={l}>
                  <div style={{...sans(8,DUST,400),letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={serif(typeof v==="number"?22:16,typeof v!=="number")}>{v}</div>
                  {typeof v==="number"&&<div style={{height:1,background:STONE,opacity:0.4,width:`${v*10}%`,marginTop:4}}/>}
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px 18px",marginBottom:r.notes?12:0}}>
              {[[r.dips,"Dips"],[r.date,"Visited"]].filter(([v])=>v).map(([v,l])=>(
                <div key={l}>
                  <span style={{...sans(8,DUST,400),letterSpacing:"0.22em",textTransform:"uppercase"}}>{l} — </span>
                  <span style={serif(13,true)}>{v}</span>
                </div>
              ))}
            </div>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,marginBottom:4,
                  ...sans(11,GOLD,400),textDecoration:"none",borderBottom:`1px solid ${GOLD}66`}}>
                📍 {r.location.label}
              </a>
            )}
            {r.notes && <p style={{...serif(13,true,DUST),lineHeight:1.75,margin:"10px 0 0",paddingRight:8}}>"{r.notes}"</p>}
            {deletable && (
              <button onClick={e=>{e.stopPropagation();deleteRating(r.id);}}
                style={{marginTop:14,background:"none",border:`1px solid ${STONE}88`,color:DUST,
                  ...sans(9,DUST,300),letterSpacing:"0.22em",textTransform:"uppercase",
                  padding:"7px 16px",cursor:"pointer",borderRadius:2}}>
                Remove Entry
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Lato',sans-serif",overflowX:"hidden"}}>
      {/* Grain */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.038'/%3E%3C/svg%3E")`,
        backgroundSize:"180px",opacity:0.75}}/>

      {/* Flash */}
      {flash && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:999,
          background:INK,color:CREAM,...sans(10,CREAM,400),letterSpacing:"0.25em",
          textTransform:"uppercase",padding:"10px 24px",borderRadius:4,whiteSpace:"nowrap",
          boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
          {flash}
        </div>
      )}

      <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative",paddingBottom:"calc(80px + env(safe-area-inset-bottom, 0px))"}}>

        {/* ── LEADERBOARD ── */}
        {view==="home" && (
          <div style={{padding:"20px 16px 0"}}>
            {/* Hero */}
            <div style={{position:"relative"}}>
              <LeafSprig style={{position:"absolute",top:0,left:-8,width:64,zIndex:10,transform:"rotate(-20deg)"}}/>
              <div style={{background:CARD,borderRadius:18,overflow:"hidden",boxShadow:"0 4px 32px rgba(0,0,0,0.1)",position:"relative",zIndex:5,paddingTop:12}}>
                <div style={{position:"relative",height:175,overflow:"hidden"}}>
                  <FryIllustration style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",width:"105%",minWidth:310,zIndex:8}}/>
                  <SaltShaker style={{position:"absolute",bottom:14,left:12,width:30,zIndex:7,opacity:0.8}}/>
                  <KetchupBottle style={{position:"absolute",bottom:8,right:16,width:28,zIndex:7,opacity:0.8}}/>
                  <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 90%, ${SAND}55 0%, transparent 65%)`}}/>
                </div>
                <div style={{padding:"8px 20px 24px"}}>
                  <h1 style={{...serif(32,true),margin:"0 0 4px",lineHeight:1.0}}>Fry Critic</h1>
                  {ratings.length>0 ? (
                    <div style={{display:"flex",gap:28,marginTop:12,marginBottom:18}}>
                      {[["Entries",ratings.length],["Avg",(ratings.reduce((a,b)=>a+b.overallVibe,0)/ratings.length).toFixed(1)],["Best",sorted[0]?.overallVibe]].map(([l,v])=>(
                        <div key={l}>
                          <div style={serif(28,false)}>{v}</div>
                          <div style={{...tag,marginBottom:0}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{...serif(14,true,DUST),margin:"12px 0 18px"}}>No entries yet. Write your first review.</p>
                  )}
                  <button onClick={()=>setView("add")} style={{background:INK,color:CREAM,border:"none",borderRadius:4,padding:"12px 24px",...sans(10,CREAM,400),letterSpacing:"0.3em",textTransform:"uppercase",cursor:"pointer",width:"100%"}}>
                    {ratings.length ? "Rate Fries" : "Write Your First Review"}
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard cards */}
            {ratings.length>0 && (
              <div style={{marginTop:52,position:"relative",zIndex:5}}>
                <LeafSprig style={{position:"absolute",top:-24,left:-4,width:48,opacity:0.65}}/>
                <div style={{...tag,marginBottom:12,paddingLeft:2}}>Leaderboard</div>

                {sorted[0] && (
                  <div style={{marginBottom:10}}>
                    <div onClick={()=>setLbExpanded(lbExpanded===sorted[0].id?null:sorted[0].id)}
                      style={{borderRadius:lbExpanded===sorted[0].id?"16px 16px 0 0":16,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.12)",cursor:"pointer",position:"relative"}}>
                      {sorted[0].image
                        ? <img src={sorted[0].image} alt={sorted[0].restaurant} style={{width:"100%",height:190,objectFit:"cover",display:"block"}}/>
                        : <div style={{width:"100%",height:190,background:SAND,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🍟</div>}
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(46,36,22,0.82) 0%,rgba(46,36,22,0.08) 55%,transparent 100%)"}}/>
                      <div style={{position:"absolute",top:12,left:12,background:GOLD,borderRadius:20,padding:"3px 10px",...sans(9,INK,400),letterSpacing:"0.25em",textTransform:"uppercase"}}>#1</div>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 14px"}}>
                        <div style={{...serif(20,true,CREAM),lineHeight:1.1,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sorted[0].restaurant}</div>
                        {sorted[0].city && <div style={{...sans(10,`${CREAM}99`),letterSpacing:"0.1em",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sorted[0].city}</div>}
                        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                          <span style={{...serif(28,false,GOLD),lineHeight:1}}>{sorted[0].overallVibe}</span>
                          <span style={{...sans(9,`${GOLD}CC`,400),letterSpacing:"0.18em",textTransform:"uppercase"}}>{tierOf(sorted[0].overallVibe).t}</span>
                        </div>
                      </div>
                      <div style={{position:"absolute",top:12,right:12,color:CREAM,fontSize:12,opacity:0.7,transform:lbExpanded===sorted[0].id?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</div>
                    </div>
                    {lbExpanded===sorted[0].id && (
                      <div style={{background:CARD,borderRadius:"0 0 16px 16px",padding:"16px 16px 18px",boxShadow:"0 6px 20px rgba(0,0,0,0.1)"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                          {[["Crispiness",sorted[0].crispiness],["Saltiness",sorted[0].saltiness],["Cut",SIZE_LABEL[sorted[0].thicknessScore]],["Overall",sorted[0].overallVibe]].map(([l,v])=>(
                            <div key={l}>
                              <div style={{...sans(8,DUST,400),letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:2}}>{l}</div>
                              <div style={serif(typeof v==="number"?22:15,typeof v!=="number")}>{v}</div>
                              {typeof v==="number"&&<div style={{height:1,background:STONE,opacity:0.4,width:`${v*10}%`,marginTop:3}}/>}
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"4px 16px"}}>
                          {[[sorted[0].dips,"Dips"],[sorted[0].date,"Visited"]].filter(([v])=>v).map(([v,l])=>(
                            <div key={l}><span style={{...sans(8,DUST,400),letterSpacing:"0.2em",textTransform:"uppercase"}}>{l} — </span><span style={serif(12,true)}>{v}</span></div>
                          ))}
                        </div>
                        {sorted[0].location && (
                          <a href={`https://maps.apple.com/?q=${sorted[0].location.lat},${sorted[0].location.lng}`} target="_blank" rel="noreferrer"
                            style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:8,...sans(11,GOLD,400),textDecoration:"none",borderBottom:`1px solid ${GOLD}66`}}>
                            📍 {sorted[0].location.label}
                          </a>
                        )}
                        {sorted[0].notes && <p style={{...serif(12,true,DUST),lineHeight:1.7,margin:"8px 0 0"}}>"{sorted[0].notes}"</p>}
                      </div>
                    )}
                  </div>
                )}

                {sorted.length>1 && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {sorted.slice(1).map((r,i)=>(
                      <div key={r.id} style={{borderRadius:12,overflow:"visible",boxShadow:"0 2px 14px rgba(0,0,0,0.09)"}}>
                        <div onClick={()=>setLbExpanded(lbExpanded===r.id?null:r.id)}
                          style={{borderRadius:lbExpanded===r.id?"12px 12px 0 0":12,overflow:"hidden",cursor:"pointer",position:"relative"}}>
                          {r.image
                            ? <img src={r.image} alt={r.restaurant} style={{width:"100%",height:105,objectFit:"cover",display:"block"}}/>
                            : <div style={{width:"100%",height:105,background:SAND,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🍟</div>}
                          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(46,36,22,0.78) 0%,rgba(46,36,22,0.05) 60%,transparent 100%)"}}/>
                          <div style={{position:"absolute",top:7,left:7,background:"rgba(46,36,22,0.55)",borderRadius:12,padding:"2px 8px",...sans(8,CREAM,400),letterSpacing:"0.2em"}}>#{i+2}</div>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"7px 9px"}}>
                            <div style={{...serif(13,true,CREAM),lineHeight:1.1,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.restaurant}</div>
                            <span style={{...serif(17,false,GOLD),lineHeight:1}}>{r.overallVibe}</span>
                          </div>
                          <div style={{position:"absolute",top:7,right:8,color:CREAM,fontSize:10,opacity:0.65,transform:lbExpanded===r.id?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</div>
                        </div>
                        {lbExpanded===r.id && (
                          <div style={{background:CARD,borderRadius:"0 0 12px 12px",padding:"12px 12px 14px",boxShadow:"0 4px 14px rgba(0,0,0,0.08)"}}>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                              {[["Crisp",r.crispiness],["Salt",r.saltiness],["Cut",SIZE_LABEL[r.thicknessScore]],["Overall",r.overallVibe]].map(([l,v])=>(
                                <div key={l}>
                                  <div style={{...sans(7,DUST,400),letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:2}}>{l}</div>
                                  <div style={serif(typeof v==="number"?18:12,typeof v!=="number")}>{v}</div>
                                  {typeof v==="number"&&<div style={{height:1,background:STONE,opacity:0.4,width:`${v*10}%`,marginTop:2}}/>}
                                </div>
                              ))}
                            </div>
                            {r.location && (
                              <a href={`https://maps.apple.com/?q=${r.location.lat},${r.location.lng}`} target="_blank" rel="noreferrer"
                                style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,...sans(10,GOLD,400),textDecoration:"none"}}>
                                📍 {r.location.label}
                              </a>
                            )}
                            {r.notes && <p style={{...serif(11,true,DUST),lineHeight:1.6,margin:"6px 0 0"}}>"{r.notes}"</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RATE FRIES ── */}
        {view==="add" && (
          <div style={{padding:"20px 16px 0"}}>
            <SaltShaker style={{position:"absolute",top:10,right:8,width:44,zIndex:10,opacity:0.75}}/>
            <div style={{background:CARD,borderRadius:18,padding:"22px 20px",boxShadow:"0 4px 32px rgba(0,0,0,0.1)",position:"relative",zIndex:5}}>
              <div style={tag}>New Entry</div>
              <h2 style={{...serif(26,true),margin:"6px 0 20px"}}>Write a Review</h2>

              {/* PHOTO FIRST */}
              <div style={{...tag,marginBottom:10}}>Photo</div>
              {imgPreview ? (
                <div style={{position:"relative",marginBottom:24}}>
                  <img src={imgPreview} alt="preview" style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:8,display:"block"}}/>
                  <button onClick={clearImage} style={{position:"absolute",top:10,right:10,background:"rgba(46,36,22,0.7)",color:CREAM,border:"none",cursor:"pointer",...sans(9,CREAM,400),letterSpacing:"0.22em",textTransform:"uppercase",padding:"7px 14px",borderRadius:3}}>Remove</button>
                </div>
              ) : (
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,border:`1px dashed ${STONE}99`,borderRadius:8,padding:"24px 16px",cursor:"pointer",marginBottom:24}}
                  onTouchStart={e=>{e.currentTarget.style.borderColor=DUST}}
                  onTouchEnd={e=>{e.currentTarget.style.borderColor=`${STONE}99`}}>
                  <svg viewBox="0 0 32 32" style={{width:24,opacity:0.28}} fill="none">
                    <rect x="2" y="6" width="28" height="20" rx="2" stroke={INK} strokeWidth="0.9"/>
                    <circle cx="11" cy="13" r="3" stroke={INK} strokeWidth="0.9"/>
                    <path d="M2 22 L10 15 L17 22 L22 17 L30 24" stroke={INK} strokeWidth="0.9"/>
                  </svg>
                  <span style={{...sans(9,DUST,400),letterSpacing:"0.3em",textTransform:"uppercase"}}>Add Photo</span>
                  <span style={{...sans(10,STONE)}}>JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleImage} ref={fileRef} style={{display:"none"}}/>
                </label>
              )}

              <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,marginBottom:22}}/>

              {/* Restaurant + Location */}
              {[["Restaurant","restaurant","In-N-Out, Bouchon Bistro…"],["City","city","City or neighborhood"]].map(([l,k,ph])=>(
                <div key={k} style={{marginBottom:20}}>
                  <label style={{...tag,display:"block",marginBottom:6}}>{l}</label>
                  <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                    placeholder={ph} style={input}
                    onFocus={e=>e.target.style.borderBottomColor=INK}
                    onBlur={e=>e.target.style.borderBottomColor=`${STONE}88`}/>
                </div>
              ))}

              {/* Geo tag */}
              <div style={{marginBottom:24}}>
                <label style={{...tag,display:"block",marginBottom:8}}>Location Tag</label>
                {form.location ? (
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{...sans(12,INK),flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {form.location.label}</span>
                    <button onClick={()=>setForm(p=>({...p,location:null}))}
                      style={{background:"none",border:`1px solid ${STONE}88`,color:DUST,...sans(9,DUST,300),letterSpacing:"0.2em",textTransform:"uppercase",padding:"5px 12px",cursor:"pointer",borderRadius:2,flexShrink:0}}>
                      Clear
                    </button>
                  </div>
                ) : (
                  <button onClick={getLocation} disabled={locLoading}
                    style={{width:"100%",background:"transparent",border:`1px solid ${STONE}`,borderRadius:4,padding:"10px",...sans(10,DUST,400),letterSpacing:"0.25em",textTransform:"uppercase",cursor:"pointer",opacity:locLoading?0.5:1}}>
                    {locLoading ? "Getting location…" : "📍 Tag My Location"}
                  </button>
                )}
              </div>

              <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,marginBottom:22}}/>
              <div style={{...tag,marginBottom:16}}>Criteria</div>
              <CrispSlider value={form.crispiness} onChange={v=>setForm({...form,crispiness:v})}/>
              <SaltSlider value={form.saltiness} onChange={v=>setForm({...form,saltiness:v})}/>
              <ThicknessSlider value={form.thicknessScore} onChange={v=>setForm({...form,thicknessScore:v})}/>
              <OverallSlider value={form.overallVibe} onChange={v=>setForm({...form,overallVibe:v})}/>

              <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,marginBottom:22}}/>
              {[["Accompaniments","dips","Ketchup, aioli, vinegar…"],["Tasting Notes","notes","What made these fries memorable…"]].map(([l,k,ph])=>(
                <div key={k} style={{marginBottom:20}}>
                  <label style={{...tag,display:"block",marginBottom:6}}>{l}</label>
                  <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                    placeholder={ph} style={input}
                    onFocus={e=>e.target.style.borderBottomColor=INK}
                    onBlur={e=>e.target.style.borderBottomColor=`${STONE}88`}/>
                </div>
              ))}

              {/* Score preview */}
              <div style={{background:INK,borderRadius:12,padding:"20px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,marginTop:8}}>
                <div>
                  <div style={{...sans(8,`${STONE}88`,400),letterSpacing:"0.38em",textTransform:"uppercase",marginBottom:6}}>Overall Score</div>
                  <div style={{...serif(56,false,form.overallVibe>=8?GOLD:CREAM),lineHeight:1}}>{form.overallVibe}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{...serif(18,true,CREAM),marginBottom:4}}>{pTier.t}</div>
                  <div style={{...serif(11,true,`${STONE}99`)}}>
                    {form.overallVibe>=9?"a rare perfection":form.overallVibe>=8?"worthy of return":form.overallVibe>=7?"above the ordinary":form.overallVibe>=5?"neither here nor there":"best not revisited"}
                  </div>
                </div>
              </div>

              <button style={{width:"100%",background:INK,color:CREAM,border:"none",borderRadius:4,padding:"14px",...sans(10,CREAM,400),letterSpacing:"0.3em",textTransform:"uppercase",cursor:"pointer",opacity:submitting?0.5:1}}
                onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Recording…" : "Submit Entry"}
              </button>
            </div>
          </div>
        )}

        {/* ── RATINGS ── */}
        {view==="history" && (
          <div style={{padding:"20px 16px 0",position:"relative",zIndex:1}}>
            <LeafSprig style={{position:"absolute",top:0,right:8,width:56,opacity:0.6}}/>
            <div style={{background:CARD,borderRadius:18,padding:"22px 18px",boxShadow:"0 2px 20px rgba(0,0,0,0.07)",marginTop:4}}>
              <h2 style={{...serif(24,true),margin:"0 0 18px"}}>All Ratings</h2>
              <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,marginBottom:4}}/>
              {ratings.length===0
                ? <p style={{...serif(14,true,DUST),textAlign:"center",padding:"28px 0"}}>No ratings yet.</p>
                : ratings.map(r=><Entry key={r.id} r={r} rank={sorted.findIndex(s=>s.id===r.id)} deletable={true} showThumb={true}/>)
              }
            </div>
          </div>
        )}

        {/* Bottom nav — fixed, iOS safe area aware */}
        <nav style={{
          position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:"100%", maxWidth:430,
          background:"rgba(233,225,211,0.96)",
          backdropFilter:"blur(16px)",
          WebkitBackdropFilter:"blur(16px)",
          borderTop:`1px solid ${STONE}55`,
          zIndex:200,
          display:"flex", justifyContent:"space-around",
          paddingTop:10,
          paddingBottom:"calc(14px + env(safe-area-inset-bottom, 0px))",
        }}>
          {[["home","Leaderboard","🏆"],["add","Rate Fries","🍟"],["history","Ratings","📋"]].map(([v,l,icon])=>(
            <button key={v} onClick={()=>setView(v)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 14px",WebkitTapHighlightColor:"transparent"}}>
              <span style={{fontSize:20,opacity:view===v?1:0.38}}>{icon}</span>
              <span style={{...sans(9,view===v?INK:DUST,view===v?400:300),letterSpacing:"0.2em",textTransform:"uppercase"}}>{l}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
