(()=>{
'use strict';
if(window.__jtsMobileLedBoardFix)return;window.__jtsMobileLedBoardFix=true;
const canvas=document.getElementById('scope');
const pitch=document.getElementById('ledPitch');
const board=document.getElementById('boardMode');
if(!canvas||!pitch||!board)return;
let savedPitch=null,forced=false,timer=0;
const isBoard=()=>board.classList.contains('active');
const portraitNarrow=()=>matchMedia('(orientation:portrait) and (max-width:520px)').matches;
function syncCanvas(){
  clearTimeout(timer);timer=setTimeout(()=>window.dispatchEvent(new Event('resize')),40);
}
function apply(){
  if(isBoard()&&portraitNarrow()){
    if(!forced){savedPitch=pitch.value;forced=true}
    if(pitch.value!=='4'){
      pitch.value='4';pitch.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }else if(forced){
    if(savedPitch&&pitch.value==='4'){
      pitch.value=savedPitch;pitch.dispatchEvent(new Event('input',{bubbles:true}));
    }
    forced=false;savedPitch=null;
  }
  syncCanvas();
}
board.addEventListener('click',()=>setTimeout(apply,0));
for(const id of ['radarMode','radarWxMode','ledRadarMode'])document.getElementById(id)?.addEventListener('click',()=>setTimeout(apply,0));
addEventListener('orientationchange',()=>setTimeout(apply,120));
addEventListener('resize',()=>{clearTimeout(timer);});
if('ResizeObserver'in window){
  let last='';new ResizeObserver(entries=>{const r=entries[0]?.contentRect;if(!r)return;const sig=`${Math.round(r.width)}x${Math.round(r.height)}`;if(sig!==last){last=sig;syncCanvas()}}).observe(canvas);
}
setTimeout(apply,250);
})();
