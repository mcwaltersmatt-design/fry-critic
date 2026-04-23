import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "fry-critic-v3";
const DEFAULT_FORM = {
  restaurant:"", city:"",
  crispiness:5, saltiness:5, thicknessScore:5, overallVibe:5,
  frySize:5, dips:"", notes:"", image:null,
};
const SIZE_LABEL={1:"Shoestring",2:"Shoestring",3:"Thin-Cut",4:"Thin-Cut",5:"Classic",6:"Classic",7:"Thick-Cut",8:"Thick-Cut",9:"Steak Fry",10:"Steak Fry"};
const tierOf=(s)=>{
  if(s>=9.0)return{t:"Transcendent",dot:"#C9A96E",color:"#7A5C2E"};
  if(s>=8.0)return{t:"Exceptional", dot:"#A8876A",color:"#6B4A30"};
  if(s>=6.5)return{t:"Commendable",dot:"#8B9E8A",color:"#4A6048"};
  if(s>=5.0)return{t:"Decent",     dot:"#BBA89A",color:"#7A6A5E"};
  return          {t:"Forgettable",dot:"#C4B5A8",color:"#8A7A70"};
};

const BG    = "#E9E1D3";
const SAND  = "#DDD4C2";
const CARD  = "#F4EFE6";
const INK   = "#2E2416";
const DUST  = "#8A7B6C";
const STONE = "#C4B09A";
const GOLD  = "#C8A44E";
const OLIVE = "#7A8A5A";
const CREAM = "#FAF6EE";

const FONTS = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400&display=swap";

// ─── SVG Illustrations ───────────────────────────────────────────────────────

const FryIllustration = ({ style }) => (
  <svg viewBox="0 0 320 230" style={style} fill="none">
    <ellipse cx="160" cy="190" rx="130" ry="40" fill="#D4B870" opacity="0.1"/>
    <ellipse cx="48" cy="192" rx="36" ry="25" fill="#B8855A" transform="rotate(-12,48,192)"/>
    <ellipse cx="48" cy="192" rx="36" ry="25" fill="#C89870" opacity="0.35" transform="rotate(-12,48,192)"/>
    <ellipse cx="40" cy="184" rx="16" ry="9" fill="white" opacity="0.1" transform="rotate(-12,40,184)"/>
    <ellipse cx="36" cy="190" rx="3.5" ry="2.2" fill="#7A4A22" opacity="0.45" transform="rotate(-15,36,190)"/>
    <ellipse cx="54" cy="182" rx="3" ry="2" fill="#7A4A22" opacity="0.4" transform="rotate(-8,54,182)"/>
    <ellipse cx="48" cy="200" rx="2.5" ry="1.8" fill="#7A4A22" opacity="0.42" transform="rotate(-20,48,200)"/>
    <path d="M28 189 Q36 185 44 189" stroke="#9A6030" strokeWidth="0.8" opacity="0.3"/>
    <path d="M42 198 Q50 195 58 199" stroke="#9A6030" strokeWidth="0.8" opacity="0.3"/>
    <path d="M62 178 Q66 170 64 162" stroke="#8A9E6A" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M64 168 Q70 164 72 158 Q68 156 64 160Z" fill="#8A9E6A" opacity="0.75"/>
    <ellipse cx="6" cy="210" rx="24" ry="18" fill="#C89460" opacity="0.8" transform="rotate(-10,6,210)"/>
    <ellipse cx="6" cy="210" rx="18" ry="12" fill="#EDD090" opacity="0.65" transform="rotate(-10,6,210)"/>
    <ellipse cx="6" cy="210" rx="10" ry="7" fill="#E8C870" opacity="0.5" transform="rotate(-10,6,210)"/>
    {[
      ["M100 222 Q97 172 100 128 Q101 112 103 105 L105 106 Q107 113 106 128 Q104 172 103 222Z","#EDD070"],
      ["M104 222 Q102 170 105 124 Q106 108 109 101 L111 102 Q113 110 112 124 Q110 170 108 222Z","#E8C860"],
      ["M109 220 Q107 168 110 122 Q111 106 114 99 L116 100 Q118 108 117 122 Q115 168 113 220Z","#F0D878"],
      ["M113 221 Q112 167 115 120 Q116 104 119 97 L121 98 Q123 106 122 120 Q120 167 118 221Z","#E0BE58"],
      ["M96 220 Q93 168 96 126 Q97 110 100 103 L102 104 Q104 112 103 126 Q101 168 100 220Z","#EDCA60"],
    ].map(([d,f],i)=><path key={i} d={d} fill={f}/>)}
    {[[104,104],[110,100],[115,98],[120,96],[101,102]].map(([x,y],i)=>(
      <ellipse key={i} cx={x} cy={y} rx="2" ry="3" fill="#B87820"/>
    ))}
    <text x="96" y="90" fontSize="7" fill="#A88040" opacity="0.7" fontStyle="italic" letterSpacing="0.5">shoestring</text>
    {[
      ["M142 224 Q140 166 142 112 Q143 94 147 86 L153 87 Q156 95 154 112 Q152 166 150 224Z","#EDCC60","#D4A838","M147 86 Q146 78 150 74 Q154 70 156 75 Q157 80 153 87Z","#B87820"],
      ["M154 224 Q152 164 155 108 Q156 90 160 82 L166 83 Q169 91 167 108 Q165 164 163 224Z","#F0D468","#D8B03C","M160 82 Q159 74 163 70 Q167 66 169 71 Q170 76 166 83Z","#C09020"],
      ["M167 222 Q165 160 168 106 Q169 88 173 80 L179 81 Q182 89 180 106 Q178 160 176 222Z","#EDCC60","#D4A838","M173 80 Q172 72 176 68 Q180 64 182 69 Q183 74 179 81Z","#B87820"],
    ].map(([body,f1,,tip,tf],i)=>(
      <g key={i}><path d={body} fill={f1}/><path d={tip} fill={tf}/></g>
    ))}
    <text x="148" y="62" fontSize="7" fill="#A88040" opacity="0.7" fontStyle="italic" letterSpacing="0.5">classic</text>
    <path d="M196 220 L194 207 L198 197 L194 187 L198 177 L194 167 L198 157 L194 147 L198 137 L196 125 L206 125 L208 137 L204 147 L208 157 L204 167 L208 177 L204 187 L208 197 L204 207 L206 220Z" fill="#EDD070"/>
    <path d="M196 220 L194 207 L198 197 L194 187 L198 177 L194 167 L198 157 L194 147 L198 137 L196 125 L198 125 L196 137 L200 147 L196 157 L200 167 L196 177 L200 187 L196 197 L200 207 L198 220Z" fill="#C8941E"/>
    <ellipse cx="201" cy="122" rx="5" ry="4" fill="#B07818"/>
    <text x="192" y="113" fontSize="7" fill="#A88040" opacity="0.7" fontStyle="italic" letterSpacing="0.5">crinkle</text>
    <rect x="224" y="115" width="26" height="106" rx="6" fill="#E8B840"/>
    <rect x="224" y="115" width="9" height="106" rx="4" fill="#C89018"/>
    <rect x="224" y="115" width="26" height="106" rx="6" fill="none" stroke="#C09020" strokeWidth="0.9" opacity="0.45"/>
    <rect x="225" y="105" width="24" height="16" rx="5" fill="#A87010"/>
    {[140,160,180,200].map(y=>(
      <path key={y} d={`M228 ${y} Q237 ${y-2} 246 ${y}`} stroke="#D0A030" strokeWidth="0.8" opacity="0.4"/>
    ))}
    <text x="218" y="98" fontSize="7" fill="#A88040" opacity="0.7" fontStyle="italic" letterSpacing="0.5">steak</text>
    <rect x="262" y="118" width="46" height="32" rx="5" fill="#E8C050"/>
    <rect x="262" y="118" width="46" height="32" rx="5" fill="none" stroke="#C8941E" strokeWidth="0.9" opacity="0.5"/>
    {[270,278,286,294,302].map(x=>(
      <line key={x} x1={x} y1="118" x2={x} y2="150" stroke="#C8941E" strokeWidth="0.8" opacity="0.4"/>
    ))}
    {[125,132,140,147].map(y=>(
      <line key={y} x1="262" y1={y} x2="308" y2={y} stroke="#C8941E" strokeWidth="0.8" opacity="0.4"/>
    ))}
    {[[266,122],[274,129],[282,122],[290,129],[298,122],[306,129],[266,136],[274,143],[282,136],[290,143],[298,136],[306,143]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="2.2" fill="#B07818" opacity="0.28"/>
    ))}
    <text x="268" y="112" fontSize="7" fill="#A88040" opacity="0.7" fontStyle="italic" letterSpacing="0.5">waffle</text>
    {[[155,72,15],[178,60,-12],[135,82,25],[218,96,8],[192,65,-20],[250,90,10]].map(([x,y,r],i)=>(
      <rect key={i} x={x} y={y} width={3+i%2} height={3+i%2} rx="0.7" fill="white" opacity={0.55+i*0.03} transform={`rotate(${r},${x+1.5},${y+1.5})`}/>
    ))}
    <path d="M152 62 Q155 52 152 42 Q149 32 152 22" stroke="#C4B09A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
    <path d="M166 54 Q169 44 166 34 Q163 24 166 14" stroke="#C4B09A" strokeWidth="1.1" strokeLinecap="round" opacity="0.28"/>
    <path d="M180 50 Q183 40 180 30" stroke="#C4B09A" strokeWidth="1" strokeLinecap="round" opacity="0.24"/>
  </svg>
);

const KetchupBottle = ({ style }) => (
  <svg viewBox="0 0 60 100" style={style} fill="none">
    <path d="M28 15 L25 8 Q25 4 30 4 Q35 4 35 8 L32 15Z" fill="#C84040"/>
    <path d="M22 38 Q18 45 18 65 Q18 82 30 84 Q42 82 42 65 Q42 45 38 38Z" fill="#E04040"/>
    <path d="M24 38 L36 38 Q38 32 36 22 L24 22 Q22 32 24 38Z" fill="#CC3838"/>
    <path d="M22 38 Q18 45 18 65 Q18 82 30 84 Q42 82 42 65 Q42 45 38 38Z" fill="none" stroke="#B83030" strokeWidth="0.8" opacity="0.5"/>
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

// ─── Storage (localStorage) ──────────────────────────────────────────────────

function loadRatings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRatings(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function FryCritic() {
  const [ratings, setRatings]      = useState([]);
  const [form, setForm]            = useState(DEFAULT_FORM);
  const [view, setView]            = useState("home");
  const [flash, setFlash]          = useState(null);
  const [submitting, setSub]       = useState(false);
  const [imgPreview, setPreview]   = useState(null);
  const [expanded, setExpanded]    = useState(null);
  const [lbExpanded, setLbExpanded]= useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const l = document.createElement("link");
    l.href = FONTS; l.rel = "stylesheet";
    document.head.appendChild(l);
    setRatings(loadRatings());
  }, []);

  function showFlash(m) { setFlash(m); setTimeout(() => setFlash(null), 2400); }

  function handleImage(e) {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 4 * 1024 * 1024) { showFlash("Image must be under 4MB."); return; }
    const r = new FileReader();
    r.onload = ev => { setForm(p => ({...p, image: ev.target.result})); setPreview(ev.target.result); };
    r.readAsDataURL(f);
  }
  function clearImage() {
    setForm(p => ({...p, image:null})); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
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
    saveRatings(updated);
    setSub(false);
    setForm(DEFAULT_FORM); setPreview(null);
    showFlash("Entry recorded."); setTimeout(() => setView("home"), 1600);
  }

  function deleteRating(id) {
    const u = ratings.filter(r => r.id !== id);
    setRatings(u); saveRatings(u);
  }

  const sorted = [...ratings].sort((a, b) => b.overallVibe - a.overallVibe);
  const preview = form.overallVibe;
  const pTier = tierOf(preview);

  // ─── Style helpers ───────────────────────────────────────────────────────
  const serif = (sz,it,col) => ({fontFamily:"'Playfair Display', serif",fontStyle:it?"italic":"normal",fontSize:sz,color:col||INK,lineHeight:1.2});
  const sans  = (sz,col,w)  => ({fontFamily:"'Lato', sans-serif",fontWeight:w||300,fontSize:sz,color:col||INK});
  const tag   = {...sans(9,DUST,400), letterSpacing:"0.38em", textTransform:"uppercase"};
  const inputStyle = {
    width:"100%", background:"transparent", border:"none",
    borderBottom:`1px solid ${STONE}88`, padding:"10px 0",
    fontFamily:"'Lato', sans-serif", fontWeight:300, fontSize:14,
    color:INK, outline:"none", boxSizing:"border-box",
  };
  const pct = v => (v-1)/9*100;

  // ─── Custom sliders ──────────────────────────────────────────────────────

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

  const ThicknessSlider = ({value, onChange}) => {
    const t = (value-1)/9, r = 5+t*14, sz = (r+3)*2;
    return (
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={serif(15,true)}>Thickness & Cut</span>
          <span style={{...serif(18,false,GOLD)}}>{value}</span>
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

  const OverallSlider = ({value, onChange}) => {
    const t = (value-1)/9;
    const HP = "M14 24 C14 24 1.5 16.5 1.5 9.5 C1.5 4.5 6 2 9.5 3.5 C11.5 4.5 13 6 14 7 C15 6 16.5 4.5 18.5 3.5 C22 2 26.5 4.5 26.5 9.5 C26.5 16.5 14 24 14 24Z";
    const fillY = 24 - t * 20.5;
    const circleOp = Math.max(0, 1-t*4);
    const heartOutlineOp = Math.min(1, t*2);
    const scale = t>0.92 ? 1+Math.sin((t-0.92)/0.08*Math.PI)*0.08 : 1;
    return (
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={serif(15,true)}>Overall Score</span>
          <span style={{...serif(18,false,GOLD)}}>{value}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <svg width="18" height="18" viewBox="0 0 28 28" style={{flexShrink:0,opacity:0.35}}>
            <circle cx="14" cy="14" r="10" stroke={STONE} strokeWidth="2" fill="none"/>
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
                <circle cx="14" cy="14" r="10" stroke={GOLD} strokeWidth="1.8" fill="none" opacity={circleOp}/>
                <path d={HP} stroke={GOLD} strokeWidth="1.8" fill="none" opacity={heartOutlineOp} strokeLinejoin="round"/>
                <path d={HP} fill={GOLD} clipPath="url(#hliq)" opacity={0.92}/>
                {t>0.2&&t<0.9&&(
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

  // ─── Entry row ───────────────────────────────────────────────────────────
  const Entry = ({r, rank, deletable, showThumb}) => {
    const g = tierOf(r.overallVibe);
    const open = expanded === r.id;
    return (
      <div style={{borderBottom:`1px solid ${STONE}44`,background:open?CREAM:"transparent",borderRadius:open?"8px 8px 0 0":0,transition:"background 0.2s"}}>
        <div onClick={()=>setExpanded(open?null:r.id)}
          style={{display:"flex",alignItems:"center",gap:14,padding:"16px 0",cursor:"pointer"}}>
          <span style={{...serif(11,true,STONE),width:24,flexShrink:0,textAlign:"center"}}>{rank+1}</span>
          <span style={{width:8,height:8,borderRadius:"50%",background:g.dot,flexShrink:0}}/>
          {showThumb && (
            r.image
              ? <img src={r.image} alt={r.restaurant} style={{width:44,height:44,objectFit:"cover",borderRadius:6,flexShrink:0,border:`1px solid ${STONE}55`}}/>
              : <div style={{width:44,height:44,borderRadius:6,flexShrink:0,background:SAND,border:`1px dashed ${STONE}88`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🍟</div>
          )}
          <div style={{flex:1,minWidth:0}}>
            <div style={serif(18,true)}>{r.restaurant}</div>
            {r.city && <div style={{...sans(10,DUST),letterSpacing:"0.12em",marginTop:2}}>{r.city}</div>}
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{...serif(24,false,r.overallVibe>=8?GOLD:INK),lineHeight:1}}>{r.overallVibe}</div>
            <div style={{...sans(9,g.color,400),letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>{g.t}</div>
          </div>
          <span style={{color:STONE,fontSize:11,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</span>
        </div>
        {open && (
          <div style={{padding:"0 0 20px 46px"}}>
            {r.image && <img src={r.image} alt={r.restaurant} style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:6,marginBottom:16,display:"block"}}/>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              {[["Crispiness",r.crispiness],["Saltiness",r.saltiness],["Cut",r.thicknessScore],["Overall",r.overallVibe]].map(([l,v])=>(
                <div key={l}>
                  <div style={{...sans(8,DUST,400),letterSpacing:"0.28em",textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={serif(22,false)}>{v}</div>
                  <div style={{height:1,background:STONE,opacity:0.45,width:`${v*10}%`,marginTop:4}}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px 20px",marginBottom:r.notes?12:0}}>
              {[[SIZE_LABEL[r.frySize],"Format"],[r.dips,"Dips"],[r.date,"Visited"]].filter(([v])=>v).map(([v,l])=>(
                <div key={l}>
                  <span style={{...sans(8,DUST,400),letterSpacing:"0.25em",textTransform:"uppercase"}}>{l} — </span>
                  <span style={serif(13,true)}>{v}</span>
                </div>
              ))}
            </div>
            {r.notes && <p style={{...serif(14,true,DUST),lineHeight:1.75,margin:"10px 0 0",paddingRight:16}}>"{r.notes}"</p>}
            {deletable && (
              <button onClick={e=>{e.stopPropagation();deleteRating(r.id);}}
                style={{marginTop:14,background:"none",border:`1px solid ${STONE}88`,color:DUST,
                  ...sans(9,DUST,300),letterSpacing:"0.25em",textTransform:"uppercase",
                  padding:"7px 16px",cursor:"pointer",borderRadius:2}}>
                Remove Entry
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Lato',sans-serif"}}>

      {/* Grain */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.038'/%3E%3C/svg%3E")`,
        backgroundSize:"180px",opacity:0.75}}/>

      {/* Flash toast */}
      {flash && (
        <div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",zIndex:999,
          background:INK,color:CREAM,...sans(10,CREAM,400),letterSpacing:"0.28em",
          textTransform:"uppercase",padding:"10px 24px",borderRadius:2,whiteSpace:"nowrap"}}>
          {flash}
        </div>
      )}

      <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative"}}>

        {/* ── LEADERBOARD ── */}
        {view==="home" && (
          <div style={{paddingBottom:80}}>
            <div style={{position:"relative",margin:"0 16px",paddingTop:20}}>
              <LeafSprig style={{position:"absolute",top:0,left:-18,width:70,zIndex:10,transform:"rotate(-20deg)"}}/>
              <div style={{background:CARD,borderRadius:18,overflow:"hidden",boxShadow:"0 4px 32px rgba(0,0,0,0.1)",position:"relative",zIndex:5,paddingTop:12}}>
                <div style={{position:"relative",height:180,overflow:"hidden"}}>
                  <FryIllustration style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",width:"110%",minWidth:320,zIndex:8}}/>
                  <SaltShaker style={{position:"absolute",bottom:16,left:14,width:32,zIndex:7,opacity:0.8}}/>
                  <KetchupBottle style={{position:"absolute",bottom:8,right:18,width:30,zIndex:7,opacity:0.8}}/>
                  <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 90%, ${SAND}66 0%, transparent 65%)`}}/>
                </div>
                <div style={{padding:"0 24px 28px"}}>
                  <div style={tag}>A Personal Review</div>
                  <h1 style={{...serif(34,true),margin:"8px 0 6px",lineHeight:1.0}}>Fry Critic</h1>
                  <p style={{...sans(13,DUST),lineHeight:1.75,marginBottom:20}}>
                    An ongoing review of the humble fried potato — its texture, salinity, form, and spirit.
                  </p>
                  {ratings.length>0 ? (
                    <div style={{display:"flex",gap:32,marginBottom:22}}>
                      {[["Entries",ratings.length],["Avg Score",(ratings.reduce((a,b)=>a+b.overallVibe,0)/ratings.length).toFixed(1)],["Best",sorted[0]?.overallVibe]].map(([l,v])=>(
                        <div key={l}>
                          <div style={serif(30,false)}>{v}</div>
                          <div style={{...tag,marginBottom:0}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{...serif(14,true,DUST),marginBottom:20}}>No entries yet. Write your first review.</p>
                  )}
                  <button onClick={()=>setView("add")} style={{background:INK,color:CREAM,border:"none",borderRadius:4,padding:"13px 28px",...sans(10,CREAM,400),letterSpacing:"0.32em",textTransform:"uppercase",cursor:"pointer",width:"100%"}}>
                    {ratings.length?"Rate Fries":"Write Your First Review"}
                  </button>
                </div>
              </div>
            </div>

            {ratings.length>0 && (
              <div style={{margin:"60px 16px 0",position:"relative",zIndex:5}}>
                <LeafSprig style={{position:"absolute",top:-28,left:0,width:54,opacity:0.7}}/>
                <div style={{...tag,marginBottom:14,paddingLeft:4}}>Leaderboard</div>
                {sorted[0] && (
                  <div style={{marginBottom:12}}>
                    <div onClick={()=>setLbExpanded(lbExpanded===sorted[0].id?null:sorted[0].id)}
                      style={{borderRadius:lbExpanded===sorted[0].id?"16px 16px 0 0":16,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.12)",cursor:"pointer",position:"relative"}}>
                      {sorted[0].image
                        ? <img src={sorted[0].image} alt={sorted[0].restaurant} style={{width:"100%",height:200,objectFit:"cover",display:"block"}}/>
                        : <div style={{width:"100%",height:200,background:SAND,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>🍟</div>
                      }
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(46,36,22,0.82) 0%,rgba(46,36,22,0.1) 55%,transparent 100%)"}}/>
                      <div style={{position:"absolute",top:12,left:12,background:GOLD,borderRadius:20,padding:"3px 10px",...sans(9,INK,400),letterSpacing:"0.28em",textTransform:"uppercase"}}>#1</div>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px"}}>
                        <div style={{...serif(22,true,CREAM),lineHeight:1.1,marginBottom:4}}>{sorted[0].restaurant}</div>
                        {sorted[0].city && <div style={{...sans(10,`${CREAM}99`),letterSpacing:"0.12em",marginBottom:6}}>{sorted[0].city}</div>}
                        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                          <span style={{...serif(30,false,GOLD),lineHeight:1}}>{sorted[0].overallVibe}</span>
                          <span style={{...sans(9,`${GOLD}CC`,400),letterSpacing:"0.2em",textTransform:"uppercase"}}>{tierOf(sorted[0].overallVibe).t}</span>
                        </div>
                      </div>
                      <div style={{position:"absolute",top:12,right:12,color:CREAM,fontSize:12,opacity:0.7,transform:lbExpanded===sorted[0].id?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</div>
                    </div>
                    {lbExpanded===sorted[0].id && (
                      <div style={{background:CARD,borderRadius:"0 0 16px 16px",padding:"18px 18px 20px",boxShadow:"0 6px 20px rgba(0,0,0,0.1)"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                          {[["Crispiness",sorted[0].crispiness],["Saltiness",sorted[0].saltiness],["Thickness",sorted[0].thicknessScore],["Overall Score",sorted[0].overallVibe]].map(([l,v])=>(
                            <div key={l}>
                              <div style={{...sans(8,DUST,400),letterSpacing:"0.28em",textTransform:"uppercase",marginBottom:3}}>{l}</div>
                              <div style={serif(24,false)}>{v}</div>
                              <div style={{height:1,background:STONE,opacity:0.4,width:`${v*10}%`,marginTop:4}}/>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 18px"}}>
                          {[[SIZE_LABEL[sorted[0].frySize],"Format"],[sorted[0].dips,"Dips"],[sorted[0].date,"Visited"]].filter(([v])=>v).map(([v,l])=>(
                            <div key={l}><span style={{...sans(8,DUST,400),letterSpacing:"0.22em",textTransform:"uppercase"}}>{l} — </span><span style={serif(13,true)}>{v}</span></div>
                          ))}
                        </div>
                        {sorted[0].notes && <p style={{...serif(13,true,DUST),lineHeight:1.7,margin:"10px 0 0"}}>"{sorted[0].notes}"</p>}
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
                            ? <img src={r.image} alt={r.restaurant} style={{width:"100%",height:110,objectFit:"cover",display:"block"}}/>
                            : <div style={{width:"100%",height:110,background:SAND,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🍟</div>
                          }
                          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(46,36,22,0.78) 0%,rgba(46,36,22,0.05) 60%,transparent 100%)"}}/>
                          <div style={{position:"absolute",top:7,left:7,background:"rgba(46,36,22,0.55)",borderRadius:12,padding:"2px 8px",...sans(8,CREAM,400),letterSpacing:"0.22em"}}>#{i+2}</div>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"8px 10px"}}>
                            <div style={{...serif(14,true,CREAM),lineHeight:1.1,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.restaurant}</div>
                            <span style={{...serif(18,false,GOLD),lineHeight:1}}>{r.overallVibe}</span>
                          </div>
                          <div style={{position:"absolute",top:7,right:8,color:CREAM,fontSize:10,opacity:0.65,transform:lbExpanded===r.id?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</div>
                        </div>
                        {lbExpanded===r.id && (
                          <div style={{background:CARD,borderRadius:"0 0 12px 12px",padding:"14px 14px 16px",boxShadow:"0 4px 14px rgba(0,0,0,0.08)"}}>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                              {[["Crisp",r.crispiness],["Salt",r.saltiness],["Cut",r.thicknessScore],["Overall",r.overallVibe]].map(([l,v])=>(
                                <div key={l}>
                                  <div style={{...sans(7,DUST,400),letterSpacing:"0.22em",textTransform:"uppercase",marginBottom:2}}>{l}</div>
                                  <div style={serif(20,false)}>{v}</div>
                                  <div style={{height:1,background:STONE,opacity:0.4,width:`${v*10}%`,marginTop:3}}/>
                                </div>
                              ))}
                            </div>
                            {r.city && <div style={{...sans(9,DUST),marginBottom:4}}>{r.city}</div>}
                            {r.dips && <div style={{...sans(9,DUST),marginBottom:4}}>Dips: {r.dips}</div>}
                            {r.notes && <p style={{...serif(12,true,DUST),lineHeight:1.65,margin:"6px 0 0"}}>"{r.notes}"</p>}
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
          <div style={{paddingBottom:90}}>
            <div style={{position:"relative",margin:"0 16px",paddingTop:16}}>
              <SaltShaker style={{position:"absolute",top:-10,right:0,width:50,zIndex:10,opacity:0.8}}/>
              <div style={{background:CARD,borderRadius:18,padding:"24px 22px",boxShadow:"0 4px 32px rgba(0,0,0,0.1)",position:"relative",zIndex:5}}>
                <div style={tag}>New Entry</div>
                <h2 style={{...serif(28,true),margin:"6px 0 22px"}}>Write a Review</h2>

                <div style={{marginBottom:28}}>
                  {[["Restaurant","restaurant","In-N-Out, Bouchon Bistro…"],["Location","city","City or neighborhood"]].map(([l,k,ph])=>(
                    <div key={k} style={{marginBottom:20}}>
                      <label style={{...tag,display:"block",marginBottom:6}}>{l}</label>
                      <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                        placeholder={ph} style={inputStyle}
                        onFocus={e=>e.target.style.borderBottomColor=INK}
                        onBlur={e=>e.target.style.borderBottomColor=`${STONE}88`}/>
                    </div>
                  ))}
                </div>

                <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,marginBottom:24}}/>
                <div style={{...tag,marginBottom:16}}>Criteria</div>
                <CrispSlider value={form.crispiness} onChange={v=>setForm({...form,crispiness:v})}/>
                <SaltSlider value={form.saltiness} onChange={v=>setForm({...form,saltiness:v})}/>
                <ThicknessSlider value={form.thicknessScore} onChange={v=>setForm({...form,thicknessScore:v})}/>
                <OverallSlider value={form.overallVibe} onChange={v=>setForm({...form,overallVibe:v})}/>

                <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,margin:"8px 0 24px"}}/>
                <div style={{...tag,marginBottom:12}}>Fry Format — descriptive only</div>
                <div style={{marginBottom:28}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
                    <span style={serif(14,true)}>Physical Size</span>
                    <span style={{...serif(16,true,GOLD)}}>{SIZE_LABEL[form.frySize]}</span>
                  </div>
                  <div style={{position:"relative",height:1,background:`${STONE}44`}}>
                    <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(form.frySize-1)/9*100}%`,background:GOLD,transition:"width 0.12s"}}/>
                  </div>
                  <input type="range" min="1" max="10" value={form.frySize} onChange={e=>setForm({...form,frySize:Number(e.target.value)})}
                    style={{width:"100%",accentColor:GOLD,opacity:0,height:14,position:"relative",zIndex:2,cursor:"pointer",marginTop:-9}}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    {["Shoestring","Classic","Steak Fry"].map(l=>(
                      <span key={l} style={{...sans(8,STONE,400),letterSpacing:"0.15em",textTransform:"uppercase"}}>{l}</span>
                    ))}
                  </div>
                </div>

                <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,marginBottom:24}}/>
                {[["Accompaniments","dips","Ketchup, aioli, vinegar…"],["Tasting Notes","notes","What made these fries memorable…"]].map(([l,k,ph])=>(
                  <div key={k} style={{marginBottom:20}}>
                    <label style={{...tag,display:"block",marginBottom:6}}>{l}</label>
                    <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                      placeholder={ph} style={inputStyle}
                      onFocus={e=>e.target.style.borderBottomColor=INK}
                      onBlur={e=>e.target.style.borderBottomColor=`${STONE}88`}/>
                  </div>
                ))}

                <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,margin:"8px 0 24px"}}/>
                <div style={{...tag,marginBottom:12}}>Photograph</div>
                {imgPreview ? (
                  <div style={{position:"relative",marginBottom:24}}>
                    <img src={imgPreview} alt="preview" style={{width:"100%",maxHeight:240,objectFit:"cover",borderRadius:8,display:"block"}}/>
                    <button onClick={clearImage} style={{position:"absolute",top:10,right:10,background:"rgba(46,36,22,0.7)",color:CREAM,border:"none",cursor:"pointer",...sans(9,CREAM,400),letterSpacing:"0.22em",textTransform:"uppercase",padding:"7px 14px",borderRadius:3}}>Remove</button>
                  </div>
                ) : (
                  <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,border:`1px dashed ${STONE}99`,borderRadius:8,padding:"28px 16px",cursor:"pointer",marginBottom:24}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=DUST}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=`${STONE}99`}}>
                    <svg viewBox="0 0 32 32" style={{width:26,opacity:0.28}} fill="none">
                      <rect x="2" y="6" width="28" height="20" rx="2" stroke={INK} strokeWidth="0.9"/>
                      <circle cx="11" cy="13" r="3" stroke={INK} strokeWidth="0.9"/>
                      <path d="M2 22 L10 15 L17 22 L22 17 L30 24" stroke={INK} strokeWidth="0.9"/>
                    </svg>
                    <span style={{...sans(9,DUST,400),letterSpacing:"0.32em",textTransform:"uppercase"}}>Upload Photo</span>
                    <span style={{...sans(10,STONE)}}>JPG, PNG, WEBP · max 4MB</span>
                    <input type="file" accept="image/*" onChange={handleImage} ref={fileRef} style={{display:"none"}}/>
                  </label>
                )}

                <div style={{background:INK,borderRadius:12,padding:"22px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
                  <div>
                    <div style={{...sans(8,`${STONE}88`,400),letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:6}}>Overall Score</div>
                    <div style={{...serif(60,false,form.overallVibe>=8?GOLD:CREAM),lineHeight:1}}>{form.overallVibe}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{...serif(20,true,CREAM),marginBottom:4}}>{pTier.t}</div>
                    <div style={{...serif(12,true,`${STONE}99`)}}>
                      {preview>=9?"a rare perfection":preview>=8?"worthy of return":preview>=6.5?"above the ordinary":preview>=5?"neither here nor there":"best not revisited"}
                    </div>
                  </div>
                </div>

                <button style={{width:"100%",background:INK,color:CREAM,border:"none",borderRadius:4,padding:"14px",...sans(10,CREAM,400),letterSpacing:"0.32em",textTransform:"uppercase",cursor:"pointer",opacity:submitting?0.5:1}}
                  onClick={handleSubmit} disabled={submitting}>
                  {submitting?"Recording…":"Submit Entry"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RATINGS ── */}
        {view==="history" && (
          <div style={{padding:"20px 16px 90px",position:"relative",zIndex:1}}>
            <div style={{position:"relative"}}>
              <LeafSprig style={{position:"absolute",top:-20,right:0,width:64,opacity:0.65}}/>
            </div>
            <div style={{background:CARD,borderRadius:18,padding:"24px 20px",boxShadow:"0 2px 20px rgba(0,0,0,0.07)",marginTop:8}}>
              <div style={tag}>Ratings</div>
              <h2 style={{...serif(26,true),margin:"6px 0 20px"}}>All {ratings.length} {ratings.length===1?"Rating":"Ratings"}</h2>
              <div style={{height:1,background:`linear-gradient(90deg,transparent,${STONE}66,transparent)`,marginBottom:4}}/>
              {ratings.length===0
                ? <p style={{...serif(15,true,DUST),textAlign:"center",padding:"28px 0"}}>No ratings yet.</p>
                : ratings.map(r=><Entry key={r.id} r={r} rank={sorted.findIndex(s=>s.id===r.id)} deletable={true} showThumb={true}/>)
              }
            </div>
          </div>
        )}

        {/* Bottom nav */}
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(233,225,211,0.96)",backdropFilter:"blur(16px)",borderTop:`1px solid ${STONE}55`,zIndex:100,display:"flex",justifyContent:"space-around",padding:"10px 0 14px"}}>
          {[["home","Leaderboard","🏆"],["add","Rate Fries","🍟"],["history","Ratings","📋"]].map(([v,l,icon])=>(
            <button key={v} onClick={()=>setView(v)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 16px"}}>
              <span style={{fontSize:20,opacity:view===v?1:0.4}}>{icon}</span>
              <span style={{...sans(9,view===v?INK:DUST,view===v?400:300),letterSpacing:"0.22em",textTransform:"uppercase"}}>{l}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
