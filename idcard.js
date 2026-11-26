/* ============================================================
   Kuppayam 3.0 — ID card generator
   Draws the student's details on the card template (window.ID_CARD_IMG,
   from idcard-data.js) and downloads it as a JPG.
   To nudge text: change X, the y values, SIZE or MAXW below.
   ============================================================ */
(function(){
const X=596;            // left edge of the text (px on the 1706 x 2560 card)
const SIZE=74;          // font size
const MAXW=860;         // longest allowed text width; longer text shrinks to fit
const COLOR='#f3fbec';
const STACK='"Saira","Manjari","Noto Serif Malayalam",system-ui,sans-serif';
const ROWS=[['name',1374],['cls',1566],['phone',1757],['email',1948]]; // [field, baseline y]

const loadImg=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('ID card image not found'));i.src=src});

async function drawCard(d){
  const v={
    name:d.name.trim(),
    cls:d.cls.replace(/^Class\s*/i,'')+'th',   // "Class 10" -> "10th"
    phone:d.phone.trim(),
    email:d.email.trim()
  };
  try{await Promise.all(Object.values(v).map(t=>document.fonts.load(`400 ${SIZE}px ${STACK}`,t)))}catch(e){}
  const img=await loadImg(window.ID_CARD_IMG);
  const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const x=c.getContext('2d');x.drawImage(img,0,0);
  x.fillStyle=COLOR;x.textBaseline='alphabetic';x.textAlign='left';
  ROWS.forEach(([k,y])=>{
    let s=SIZE;x.font=`400 ${s}px ${STACK}`;
    while(x.measureText(v[k]).width>MAXW&&s>30){s-=2;x.font=`400 ${s}px ${STACK}`}
    x.fillText(v[k],X,y);
  });
  return c;
}

function save(blob,name){
  const safe=(name||'student').trim().replace(/[^\w\u0D00-\u0D7F]+/g,'-').replace(/^-|-$/g,'')||'student';
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Kuppayam-3.0-ID-${safe}.jpg`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}

/* Call this right after a successful submit */
window.issueIdCard=async function(d){
  const box=document.createElement('div');box.id='idbox';box.style.cssText='margin-top:26px';
  box.innerHTML='<p style="color:var(--mut)">Preparing your ID card…</p>';
  $('#ok').appendChild(box);
  try{
    const c=await drawCard(d);
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));
    const url=URL.createObjectURL(blob);
    box.innerHTML=`<p style="color:var(--c7);margin-bottom:12px">Your ID card has been downloaded. Please keep it safe.</p>
      <img src="${url}" alt="Your Kuppayam 3.0 ID card" style="width:min(260px,70%);border-radius:18px;box-shadow:0 20px 50px -20px #000a"><br><br>
      <button type="button" class="btn" id="idbtn">Download ID card again</button>`;
    $('#idbtn').onclick=()=>save(blob,d.name);
    save(blob,d.name);   // automatic download
  }catch(err){
    box.innerHTML='<p style="color:#ffb4a8">Sorry, the ID card could not be created. Please contact the registration desk.</p>';
    console.error(err);
  }
};
})();
