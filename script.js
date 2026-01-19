/* --- Chatbot --- */
const chat=document.getElementById("chat");
const input=document.getElementById("input");

function add(sender,text,type){
  if(!chat) return;
  const d=document.createElement("div");
  d.className="msg "+type;
  d.innerHTML=`<b>${sender}:</b> ${text}`;
  chat.appendChild(d);
  void d.offsetWidth;
  chat.scrollTop=chat.scrollHeight;
}

function send(){
  if(!input.value) return;
  add("You",input.value,"user");
  const r=brain(input.value.toLowerCase());
  add("FORGE",r,"bot");
  input.value="";
}

function voice(){
  if(!window.webkitSpeechRecognition) return;
  const r=new webkitSpeechRecognition();
  r.onresult=e=>input.value=e.results[0][0].transcript;
  r.start();
}

function speak(){
  const u=new SpeechSynthesisUtterance(chat.lastChild.innerText.replace("FORGE:",""));
  speechSynthesis.speak(u);
}

function brain(t){
  if(t.startsWith("add task")){
    const task=t.replace("add task","").trim();
    tasks.push(task); saveTasks();
    return "Task added.";
  }
  if(t.includes("business")) return "Define goal → break into weekly actions → execute daily → review weekly.";
  if(t.includes("help")) return "Tasks, planning, voice, games, offline.";
  return "Understood. Continue.";
}

/* --- Tasks --- */
let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
const tasksUI=document.getElementById("tasks-list")||document.getElementById("tasks");

function renderTasks(){
  if(!tasksUI) return;
  tasksUI.innerHTML="";
  tasks.forEach((t,i)=>{
    const li=document.createElement("li");
    li.textContent=(i+1)+". "+t;
    li.style.animationDelay=(i*0.1)+"s";
    tasksUI.appendChild(li);
  });
}
function saveTasks(){localStorage.setItem("tasks",JSON.stringify(tasks)); renderTasks();}
function addTask(){
  const t=document.getElementById("task-input");
  if(!t.value) return;
  tasks.push(t.value);
  t.value="";
  saveTasks();
}
renderTasks();

/* --- Games --- */
const canvas=document.getElementById("canvas");
const ctx=canvas?.getContext("2d");
let loop;

function startGame(g){
  if(!canvas) return;
  clearInterval(loop);
  ctx.clearRect(0,0,320,320);
  canvas.style.opacity=0;
  setTimeout(()=>{
    canvas.style.transition="opacity 0.5s"; canvas.style.opacity=1;
    if(g==="snake") snake();
    if(g==="reaction") reaction();
    if(g==="shooter") shooter();
  },50);
}

/* Snake Game */
function snake(){
  let s=[{x:160,y:160}],dx=10,dy=0,f=rand();
  document.onkeydown=e=>{
    if(e.key=="ArrowUp") dx=0,dy=-10;
    if(e.key=="ArrowDown") dx=0,dy=10;
    if(e.key=="ArrowLeft") dx=-10,dy=0;
    if(e.key=="ArrowRight") dx=10,dy=0;
  };
  loop=setInterval(()=>{
    ctx.clearRect(0,0,320,320);
    const h={x:s[0].x+dx,y:s[0].y+dy};
    if(h.x<0||h.x>=320||h.y<0||h.y>=320 || s.some(p=>p.x===h.x && p.y===h.y)){clearInterval(loop); alert("Game Over!"); return;}
    s.unshift(h);
    if(h.x===f.x && h.y===f.y) f=rand(); else s.pop();
    ctx.fillStyle="red"; ctx.fillRect(f.x,f.y,10,10);
    ctx.fillStyle="lime"; s.forEach(p=>ctx.fillRect(p.x,p.y,10,10));
  },100);
}
function rand(){return {x:Math.floor(Math.random()*32)*10, y:Math.floor(Math.random()*32)*10};}

/* Reaction Game */
function reaction(){
  ctx.clearRect(0,0,320,320);
  ctx.fillStyle="#00ff99";
  ctx.font="20px Montserrat";
  ctx.fillText("WAIT...",110,160);
  setTimeout(()=>{
    const s=Date.now();
    ctx.clearRect(0,0,320,320);
    ctx.fillText("CLICK!",110,160);
    canvas.onclick=()=>{alert("Reaction Time: "+(Date.now()-s)+" ms");}
  },Math.random()*3000+1000);
}

/* COD-style Mini Shooter */
function shooter(){
  if(!canvas) return;
  let p={x:160,y:280}, bullets=[], enemies=[], score=0;
  document.onmousemove=e=>p.x=e.offsetX;
  canvas.onclick=()=>bullets.push({x:p.x,y:p.y});
  loop=setInterval(()=>{
    ctx.clearRect(0,0,320,320);
    if(Math.random()<0.05) enemies.push({x:Math.random()*300,y:0});
    bullets.forEach(b=>b.y-=6);
    enemies.forEach(en=>en.y+=2);
    enemies=enemies.filter(en=>{
      bullets=bullets.filter(b=>{
        const hit=Math.abs(b.x-en.x)<10 && Math.abs(b.y-en.y)<10;
        if(hit){score++; return false;} return true;
      });
      return en.y<320;
    });
    ctx.fillStyle="cyan"; ctx.fillRect(p.x-10,p.y,20,10);
    ctx.fillStyle="yellow"; bullets.forEach(b=>ctx.fillRect(b.x,b.y,4,8));
    ctx.fillStyle="red"; enemies.forEach(en=>ctx.fillRect(en.x,en.y,15,15));
    ctx.fillStyle="#00ff99"; ctx.fillText("Score: "+score,10,20);
  },30);
}
