const $=id=>document.getElementById(id);
const GAME={cs2:{name:'CS2',yaw:.022,dec:4},valorant:{name:'VALORANT',yaw:.07,dec:4},r6:{name:'R6 Siege',yaw:.02,dec:2}};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const cm360=(dpi,sens,yaw)=>dpi>0&&sens>0?914.4/(dpi*sens*yaw):0;
const sensForCm=(cm,dpi,yaw)=>cm>0&&dpi>0?914.4/(cm*dpi*yaw):0;
const fmt=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):'—';
function copyText(t,b){navigator.clipboard?.writeText(t);if(b){const old=b.textContent;b.textContent='Copiado ✓';setTimeout(()=>b.textContent=old,1100)}}
function cross(el,size,gap,thick,color,dot=false,outline=false){if(!el)return;el.innerHTML='';const add=(l,t,w,h)=>{let i=document.createElement('i');i.style.cssText=`left:${l}px;top:${t}px;width:${w}px;height:${h}px;background:${color};${outline?'box-shadow:0 0 0 1px #000':''}`;el.appendChild(i)};add(40+gap,40-thick/2,size,thick);add(40-gap-size,40-thick/2,size,thick);add(40-thick/2,40-gap-size,thick,size);add(40-thick/2,40+gap,thick,size);if(dot)add(40-thick/2,40-thick/2,thick,thick)}
let csPreviewState='idle';
function csPixelCross(el,size,gap,thick,color,dot,outlineMode,style,spread){
 if(!el)return;el.innerHTML='';
 const cx=150,cy=150,isDyn=style==='dynamic'||style==='dynamicQuad';
 let extra=isDyn?(csPreviewState==='move'?Math.min(spread*.18,28):csPreviewState==='fire'?Math.min(spread*.32,52):0):0;
 let g=gap+extra;
 const add=(l,t,w,h,cls='')=>{let i=document.createElement('i');i.className=cls;i.style.left=l+'px';i.style.top=t+'px';i.style.width=w+'px';i.style.height=h+'px';i.style.background=color;if(outlineMode==='full')i.style.boxShadow='0 0 0 1px #000';if(outlineMode==='half')i.classList.add('outline-half');el.appendChild(i)};
 if(style==='square'){
   let side=Math.max(thick,size);add(cx-side/2,cy-side/2,side,side,'square-core');
 }else{
   add(cx+g,cy-thick/2,size,thick);add(cx-g-size,cy-thick/2,size,thick);add(cx-thick/2,cy-g-size,thick,size);add(cx-thick/2,cy+g,thick,size);
 }
 if(dot)add(cx-thick/2,cy-thick/2,thick,thick);
}
function csUpdate(){
 if(!$('csDpi'))return;let dpi=+$('csDpi').value||0,s=+$('csSens').value||0,cm=cm360(dpi,s,GAME.cs2.yaw);$('csEdpi').textContent=fmt(dpi*s,0)+' eDPI';$('csCm').textContent=fmt(cm)+' cm/360°';
 if(!$('csSize'))return;
 let z=+$('csSize').value,g=+$('csGap').value,t=+$('csThick').value,c=$('csColor').value,d=$('csDot').checked,om=$('csOutlineMode').value,style=$('csStyle').value,spread=+$('csSpread').value,res=$('csResolution').value;
 $('csSizeV').textContent=z+' px';$('csGapV').textContent=g+' px';$('csThickV').textContent=t+' px';$('csSpreadV').textContent=spread+' px';$('csSpreadRow').classList.toggle('hidden',!(style==='dynamic'||style==='dynamicQuad'));$('csResLabel').textContent=res;$('csScaleBase').textContent=res;
 let stateName=csPreviewState==='idle'?'PARADO':csPreviewState==='move'?'MOVENDO':'ATIRANDO';$('csStateLabel').textContent=stateName;
 csPixelCross($('csCross'),z,g,t,c,d,om,style,spread);
 const rgb=c.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16));
 let legacyStyle=style==='static'||style==='square'?4:2;
 let cmds=[`cl_crosshairstyle ${legacyStyle}`,`cl_crosshairsize ${z}`,`cl_crosshairgap ${g}`,`cl_crosshairthickness ${t}`,`cl_crosshairdot ${d?1:0}`,`cl_crosshair_drawoutline ${om==='none'?0:1}`,`cl_crosshaircolor 5`,`cl_crosshaircolor_r ${rgb[0]}`,`cl_crosshaircolor_g ${rgb[1]}`,`cl_crosshaircolor_b ${rgb[2]}`];
 $('csCode').textContent=cmds.join('; ')+';';
}
function valUpdate(){if(!$('vDpi'))return;let dpi=+$('vDpi').value||0,s=+$('vSens').value||0,cm=cm360(dpi,s,GAME.valorant.yaw);$('vEdpi').textContent=fmt(dpi*s,0)+' eDPI';$('vCm').textContent=fmt(cm)+' cm/360°';if($('vSize'))cross($('vCross'),+$('vSize').value,+$('vGap').value,+$('vThick').value,$('vColor').value,$('vDot').checked,$('vOutline').checked)}
function r6Update(){if(!$('rDpi'))return;let dpi=+$('rDpi').value||0,s=+$('rSens').value||0,m=+$('rMult').value||.02;let cm=cm360(dpi,s,m);$('rEdpi').textContent=fmt(dpi*s,0)+' game-eDPI';$('rCm').textContent=fmt(cm)+' cm/360°';}
function converter(){if(!$('fromGame'))return;let a=GAME[$('fromGame').value],b=GAME[$('toGame').value],dpi=+$('convDpi').value||0,s=+$('convSens').value||0;let cm=cm360(dpi,s,a.yaw),out=sensForCm(cm,dpi,b.yaw);$('convResult').textContent=fmt(out,b.dec);$('convMeta').textContent=`${a.name} ${fmt(s,a.dec)} → ${b.name} ${fmt(out,b.dec)} • ${fmt(cm)} cm/360° preservados`;}
function advisor(){if(!$('advDpi'))return;let game=GAME[$('advGame').value],dpi=+$('advDpi').value||0,s=+$('advSens').value||0,goal=$('advGoal').value,cm=cm360(dpi,s,game.yaw);let target=goal==='recoil'?[30,50]:goal==='flick'?[20,38]:goal==='tracking'?[25,45]:[25,45];let lo=sensForCm(target[1],dpi,game.yaw),hi=sensForCm(target[0],dpi,game.yaw);let label=cm<20?'muito alta':cm<28?'alta':cm<=50?'moderada/baixa':'muito baixa';$('advCurrent').textContent=`${fmt(cm)} cm/360° • sens ${label}`;$('advRange').textContent=`Teste inicial: ${fmt(lo,game.dec)} – ${fmt(hi,game.dec)}`;let why=goal==='recoil'?'Uma faixa mais lenta tende a dar mais margem física para microcorreções durante sprays; exige mais mousepad e braço.':goal==='flick'?'Uma faixa intermediária/rápida reduz o deslocamento para flicks, mas aumenta a precisão física exigida.':goal==='tracking'?'Uma faixa intermediária costuma equilibrar correções contínuas com alcance de movimento.':'A faixa equilibrada evita extremos e serve como ponto de partida, não como “sens mágica”.';$('advWhy').textContent=why;}
function bind(ids,fn){ids.forEach(id=>$(id)?.addEventListener('input',fn));ids.forEach(id=>$(id)?.addEventListener('change',fn));fn()}
document.addEventListener('DOMContentLoaded',()=>{bind(['csDpi','csSens','csSize','csGap','csThick','csColor','csDot','csOutlineMode','csStyle','csSpread','csResolution'],csUpdate);document.querySelectorAll('[data-cs-state]').forEach(b=>b.addEventListener('click',()=>{csPreviewState=b.dataset.csState;document.querySelectorAll('[data-cs-state]').forEach(x=>x.classList.toggle('active',x===b));csUpdate()}));bind(['vDpi','vSens','vSize','vGap','vThick','vColor','vDot','vOutline'],valUpdate);bind(['rDpi','rSens','rMult'],r6Update);bind(['fromGame','toGame','convDpi','convSens'],converter);bind(['advGame','advDpi','advSens','advGoal'],advisor);});
