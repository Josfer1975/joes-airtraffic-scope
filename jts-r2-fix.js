// JTS V1.3H-R2 visual hotfix: readable LED BOARD + restored LED RADAR
(function(){
  const oldFbResize=fbResize;
  fbResize=function(W,H,d){
    const boost=displayMode==='board'?1.55:1;
    const p=Math.max(4,Math.round(ledPitch*d*boost));
    const mw=Math.max(16,Math.floor(W/p)),mh=Math.max(8,Math.floor(H/p));
    const sig=`${W}x${H}@${p}:${ledShape}:${ledOffColor}:${displayMode}`;
    if(fbDims!==sig){fbDims=sig;fbMat.width=mw;fbMat.height=mh;fbOffGrid=null;}
    return {p,mw,mh};
  };

  fbRenderLeds=function(W,H,d){
    const {p,mw:MW,mh:MH}=fbResize(W,H,d),round=ledShape!=='square';
    const ox=(W-MW*p)/2,oy=(H-MH*p)/2,r=p*.36;
    X.fillStyle=ledBgColor;X.fillRect(0,0,W,H);
    if(!fbOffGrid){
      fbOffGrid=document.createElement('canvas');fbOffGrid.width=W;fbOffGrid.height=H;
      const g=fbOffGrid.getContext('2d');g.fillStyle=ledOffColor;
      for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
        const xx=ox+x*p+p/2,yy=oy+y*p+p/2;
        if(round){g.beginPath();g.arc(xx,yy,r,0,Math.PI*2);g.fill()}else g.fillRect(xx-r,yy-r,r*2,r*2)
      }
    }
    X.drawImage(fbOffGrid,0,0);
    const img=fbM.getImageData(0,0,MW,MH).data;
    for(let pass=0;pass<2;pass++)for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
      const i=(y*MW+x)*4,a=img[i+3];if(a<20)continue;
      const k=Math.min(1,a/255+.22),xx=ox+x*p+p/2,yy=oy+y*p+p/2;
      if(pass===0&&ledGlow<=0)continue;
      const rr=pass===0?r*1.9:r;
      X.fillStyle=`rgba(${img[i]},${img[i+1]},${img[i+2]},${pass===0?(ledGlow/100)*k:k})`;
      if(round){X.beginPath();X.arc(xx,yy,rr,0,Math.PI*2);X.fill()}else X.fillRect(xx-rr,yy-rr,rr*2,rr*2)
    }
  };

  drawLedRadar=function(W,H,d){
    const {mw:Wm,mh:Hm}=fbResize(W,H,d);fbM.clearRect(0,0,Wm,Hm);
    const col=activeColor('alt'),cx=Math.floor(Wm/2),cy=Math.floor(Hm/2),R=Math.max(10,Math.floor(Math.min(Wm,Hm)/2)-3),rows=fbRows();
    const now=performance.now(),ang=(now%4000)/4000*2*Math.PI;
    fbM.fillStyle=col;fbM.globalAlpha=.62;fbM.beginPath();fbM.moveTo(cx,cy);fbM.arc(cx,cy,R,ang-Math.PI/2-.75,ang-Math.PI/2);fbM.closePath();fbM.fill();
    fbM.globalAlpha=1;fbM.strokeStyle=col;fbM.lineWidth=2;fbM.beginPath();fbM.moveTo(cx,cy);fbM.lineTo(cx+R*Math.sin(ang),cy-R*Math.cos(ang));fbM.stroke();
    for(const f of [1/3,2/3,1]){fbM.globalAlpha=f===1?1:.75;fbM.lineWidth=2;fbM.beginPath();fbM.arc(cx,cy,R*f,0,Math.PI*2);fbM.stroke()}
    fbM.globalAlpha=.7;fbM.beginPath();fbM.moveTo(cx-R,cy);fbM.lineTo(cx+R,cy);fbM.moveTo(cx,cy-R);fbM.lineTo(cx,cy+R);fbM.stroke();fbM.globalAlpha=1;
    fbText5(fbM,'N',cx-2,cy-R+2,col);fbText5(fbM,'S',cx-2,cy+R-9,col);fbText5(fbM,'W',cx-R+3,cy-3,col);fbText5(fbM,'E',cx+R-8,cy-3,col);fbText5(fbM,`${range}NM`,2,2,col);fbText5(fbM,`${rows.length} CONTACTS`,2,11,col);
    const polar=(nm,brg)=>{const rr=Math.min(1,nm/range)*R,a=brg*Math.PI/180;return[cx+rr*Math.sin(a),cy-rr*Math.cos(a)]};
    rows.forEach((o,i)=>{const f=o.air,[x,y]=polar(o.nm,o.b),tag=ident(f).slice(0,9),c=activeColor('call');fbPlane(fbM,x,y,i===fbSelected?7:5,+f.track||0,c);let tx=x+7,ty=y-7;const tw=fbMeasure3(tag);if(tx+tw>Wm-2)tx=x-7-tw;if(ty<2)ty=y+5;fbText3(fbM,tag,Math.round(tx),Math.round(ty),c)});
    const sel=rows[fbSelected%Math.max(1,rows.length)];if(sel){const f=sel.air;fbText5(fbM,ident(f),2,Hm-18,activeColor('call'));fbText5(fbM,`${sel.nm.toFixed(1)}NM ${altitude(f)==='GND'?'GND':'FL'+altitude(f)}`,2,Hm-9,activeColor('alt'))}
    fbRenderLeds(W,H,d);
  };

  drawPixelBoard=function(W,H,d){
    const {mw:MW,mh:MH}=fbResize(W,H,d);fbM.clearRect(0,0,MW,MH);const rows=fbRows();
    if(!rows.length){const msg='NO CONTACTS';fbText5(fbM,msg,Math.max(2,Math.floor((MW-fbMeasure5(msg))/2)),Math.max(2,Math.floor(MH/2)-4),activeColor('call'));fbRenderLeds(W,H,d);return}
    const marginX=4,top=4,bottom=4,laneGap=7,cardH=43,minLaneW=112;
    const laneCount=Math.max(1,Math.min(2,Math.floor((MW-marginX*2+laneGap)/(minLaneW+laneGap))));
    const perLane=Math.max(1,Math.floor((MH-top-bottom)/cardH)),perPage=perLane*laneCount,pages=Math.ceil(rows.length/perPage),page=Math.floor(performance.now()/10000)%pages;
    const shown=rows.slice(page*perPage,page*perPage+perPage),laneW=Math.floor((MW-marginX*2-laneGap*(laneCount-1))/laneCount);
    shown.forEach((o,i)=>{
      const f=o.air||{},lane=Math.floor(i/perLane),slot=i%perLane,x=marginX+lane*(laneW+laneGap),y=top+slot*cardH;
      const call=ident(f).slice(0,12),origin=(f.origin||f.from||'').toString().trim().toUpperCase(),destination=(f.destination||f.to||'').toString().trim().toUpperCase();
      const route=(origin||destination?`${origin||'---'} > ${destination||'---'}`:(f.route||f.flight_route||'')).toString().replace(/\s*[→-]\s*/g,' > ').slice(0,20);
      const type=(f.t||f.type||f.aircraft_type||'').toString().slice(0,11),reg=(f.r||f.reg||f.registration||'').toString().slice(0,10),alt=altitude(f),spd=Number.isFinite(+f.gs)?Math.round(+f.gs):'---',hdg=Number.isFinite(+f.track)?String(Math.round(+f.track)).padStart(3,'0'):'---';
      fbPlane(fbM,x+4,y+5,5,+f.track||0,activeColor('route'));fbText5(fbM,call,x+11,y,activeColor('call'));
      if(route)fbText5(fbM,route,x+11,y+10,activeColor('route'));
      const ac=[type,reg].filter(Boolean).join(' ');if(ac)fbText3(fbM,ac,x+11,y+20,activeColor('type'));
      fbText5(fbM,`${alt==='GND'?'GND':'FL'+alt} ${spd}KT`,x+11,y+27,activeColor('alt'));fbText3(fbM,`HDG ${hdg}  ${o.nm.toFixed(1)}NM`,x+11,y+36,activeColor('hdg'));
    });
    if(pages>1)fbText3(fbM,`PAGE ${page+1}/${pages}`,MW-fbMeasure3(`PAGE ${page+1}/${pages}`)-3,MH-6,activeColor('type'));
    fbRenderLeds(W,H,d);
  };
})();
