const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
const intro = document.getElementById("intro");
const statusEl = document.getElementById("status");
const counter = document.getElementById("counter");
const yearEl = document.getElementById("year");
const enter = document.getElementById("enter");
const flash = document.querySelector(".flash");

let W, H, particles = [], mouse = {x:-9999,y:-9999};
let start = performance.now();
let phase = 0;

function resize(){
  W = canvas.width = innerWidth * devicePixelRatio;
  H = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth+"px";
  canvas.style.height = innerHeight+"px";
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  W = innerWidth; H = innerHeight;
}
resize();
addEventListener("resize", resize);
addEventListener("pointermove", e => {mouse.x=e.clientX; mouse.y=e.clientY});

const cyan = "105,234,255";
const violet = "166,140,255";

for(let i=0;i<850;i++){
  const a = Math.random()*Math.PI*2;
  const r = Math.pow(Math.random(),.65)*Math.max(W,H)*.8;
  particles.push({
    x:W/2+Math.cos(a)*r, y:H/2+Math.sin(a)*r,
    tx:W/2+Math.cos(a)*r, ty:H/2+Math.sin(a)*r,
    vx:0,vy:0, size:Math.random()*1.5+.2,
    alpha:Math.random()*.7+.1,
    hue:Math.random()<.72?cyan:violet,
    seed:Math.random()*100
  });
}

function updateTargets(t){
  const centerX=W/2, centerY=H/2+35;
  const word = "SANCHEZ";
  const off = document.createElement("canvas");
  const oc = off.getContext("2d");
  off.width=W; off.height=H;
  oc.fillStyle="#fff";
  oc.font=`800 ${Math.min(150,W*.13)}px Inter`;
  oc.textAlign="center";
  oc.textBaseline="middle";
  oc.fillText(word,centerX,centerY);

  const data=oc.getImageData(0,0,W,H).data;
  const points=[];
  const step=Math.max(5,Math.floor(W/180));
  for(let y=0;y<H;y+=step){
    for(let x=0;x<W;x+=step){
      const idx=(y*W+x)*4;
      if(data[idx]>100 && Math.random()<.42) points.push({x,y});
    }
  }

  particles.forEach((p,i)=>{
    if(phase<2){
      const a=i*.31+p.seed;
      const r=80+Math.sin(t*.001+p.seed)*45+(i%9)*14;
      p.tx=centerX+Math.cos(a)*r;
      p.ty=centerY+Math.sin(a)*r;
    }else{
      const pt=points[i%points.length];
      p.tx=pt.x; p.ty=pt.y;
    }
  });
}

function draw(t){
  ctx.clearRect(0,0,W,H);
  const elapsed=t-start;
  if(elapsed>1500) phase=1;
  if(elapsed>3500) phase=2;
  if(elapsed>6200) phase=3;

  updateTargets(t);

  let visible=0;
  particles.forEach(p=>{
    const dx=p.tx-p.x, dy=p.ty-p.y;
    p.vx += dx*.0035;
    p.vy += dy*.0035;
    p.vx*=.89; p.vy*=.89;
    p.x += p.vx; p.y += p.vy;

    const mdx=p.x-mouse.x, mdy=p.y-mouse.y;
    const md=Math.sqrt(mdx*mdx+mdy*mdy);
    if(md<120){
      p.x += mdx/md*1.7;
      p.y += mdy/md*1.7;
    }

    const glow=phase>=2 ? .8 : .55;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size*(phase>=2?1.35:1),0,Math.PI*2);
    ctx.fillStyle=`rgba(${p.hue},${p.alpha*glow})`;
    ctx.fill();
    visible++;
  });

  if(phase>=2){
    ctx.save();
    ctx.globalAlpha=.13;
    ctx.strokeStyle=`rgb(${cyan})`;
    ctx.beginPath();
    ctx.arc(W/2,H/2+35,Math.min(W,H)*.29 + Math.sin(t*.002)*8,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  const seconds=Math.min(99,Math.floor(elapsed/70)).toString().padStart(2,"0");
  counter.textContent=(seconds+"7"+Math.floor(elapsed%10)).padStart(4,"0");

  if(elapsed<1800) statusEl.textContent="SEARCHING...";
  else if(elapsed<3800) statusEl.textContent="RECONSTRUCTING...";
  else if(elapsed<6500) statusEl.textContent="SIGNAL FOUND";
  else statusEl.textContent="ARCHIVE OPEN";

  if(elapsed<3300) yearEl.textContent="—";
  else if(elapsed<4200) yearEl.textContent="SANCTI";
  else if(elapsed<5200) yearEl.textContent="SANCHO";
  else yearEl.textContent="SÁNCHEZ";

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

enter.addEventListener("click",()=>{
  flash.classList.add("fire");
  setTimeout(()=>intro.classList.add("done"),220);
  setTimeout(()=>document.getElementById("main").scrollIntoView({behavior:"smooth"}),900);
});

const target = ["S","A","N","C","H","E","Z"];
const distractors = ["X","R","O","7","L","V","M"];
let sequence=[], lettersEl=document.getElementById("letters");
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function resetGame(){
  sequence=[];
  lettersEl.innerHTML="";
  shuffle([...target,...distractors.slice(0,4)]).forEach(ch=>{
    const b=document.createElement("button");
    b.className="letter"; b.textContent=ch;
    b.addEventListener("click",()=>{
      if(b.classList.contains("selected")) return;
      const expected=target[sequence.length];
      if(ch===expected){
        b.classList.add("selected");
        sequence.push(ch);
        if(sequence.length===target.length){
          document.getElementById("game-message").textContent="FRAGMENT RESTORED // SÁNCHEZ";
        }
      }else{
        document.getElementById("game-message").textContent="Pista incorrecta. La memoria tiene un orden.";
        b.animate([{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}],250);
      }
    });
    lettersEl.appendChild(b);
  });
}
resetGame();
document.getElementById("resetGame").addEventListener("click",resetGame);
