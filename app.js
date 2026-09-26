const $=id=>document.getElementById(id);
const GAME={cs2:{name:'CS2',yaw:.022,dec:4},valorant:{name:'VALORANT',yaw:.07,dec:4},r6:{name:'R6 Siege',yaw:.02,dec:2}};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const cm360=(dpi,sens,yaw)=>dpi>0&&sens>0?914.4/(dpi*sens*yaw):0;
const sensForCm=(cm,dpi,yaw)=>cm>0&&dpi>0?914.4/(cm*dpi*yaw):0;
const fmt=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):'—';
function copyText(t,b){navigator.clipboard?.writeText(t);if(b){const old=b.textContent;b.textContent='Copiado ✓';setTimeout(()=>b.textContent=old,1100)}}
function cross(el,size,gap,thick,color,dot=false,outline=false){if(!el)return;el.innerHTML='';const add=(l,t,w,h)=>{let i=document.createElement('i');i.style.cssText=`left:${l}px;top:${t}px;width:${w}px;height:${h}px;background:${color};${outline?'box-shadow:0 0 0 1px #000':''}`;el.appendChild(i)};add(40+gap,40-thick/2,size,thick);add(40-gap-size,40-thick/2,size,thick);add(40-thick/2,40-gap-size,thick,size);add(40-thick/2,40+gap,thick,size);if(dot)add(40-thick/2,40-thick/2,thick,thick)}
let csPreviewState='idle',csAutoTimer=null,vPreviewState='idle',vAutoTimer=null;
function csPixelCross(el,size,gap,thick,color,dot,outlineMode,style,spread){
 if(!el)return;el.innerHTML='';
 const cx=150,cy=150,isDyn=style==='dynamic'||style==='dynamicQuad';
 let state=csPreviewState==='auto'?'idle':csPreviewState; let extra=isDyn?(state==='move'?Math.min(spread*.18,28):state==='fire'?Math.min(spread*.32,52):0):0;
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
 if(!$('csDpi'))return;let dpi=+$('csDpi').value||0,s=+$('csSens').value||0,cm=cm360(dpi,s,GAME.cs2.yaw),edpi=dpi*s;
 $('csEdpi').textContent=fmt(edpi,0);$('csCm').textContent=fmt(cm)+' cm/360°';
 if($('csGoal')){
   let goal=$('csGoal').value,style=$('csAimStyle').value,pad=$('csPad').value;
   let base={balanced:[27,45],recoil:[32,52],flick:[22,38],tracking:[27,46]}[goal];
   let loCm=base[0],hiCm=base[1];
   if(style==='arm'){loCm+=3;hiCm+=5} if(style==='wrist'){loCm=Math.max(16,loCm-5);hiCm-=5}
   if(pad==='small'){loCm=Math.max(16,loCm-6);hiCm=Math.min(hiCm,36)} if(pad==='large'&&style!=='wrist'){hiCm+=3}
   let fast=sensForCm(loCm,dpi,GAME.cs2.yaw),slow=sensForCm(hiCm,dpi,GAME.cs2.yaw);
   let profile=cm<20?'Muito alta':cm<28?'Alta':cm<=45?'Equilibrada':cm<=60?'Baixa':'Muito baixa';
   $('csSensProfile').textContent=profile;
   $('csTestRange').textContent=`${fmt(slow,3)} – ${fmt(fast,3)} sens  •  ${loCm}–${hiCm} cm/360°`;
   let goalText={balanced:'equilíbrio entre microajuste, tracking e giros',recoil:'mais margem física para microcorreções e controle de spray',flick:'deslocamentos mais curtos para flicks e trocas rápidas de alvo',tracking:'correções contínuas suaves sem exigir deslocamento extremo'}[goal];
   let relation=cm<loCm?'Sua sens atual está mais rápida que a faixa de teste sugerida.':cm>hiCm?'Sua sens atual está mais lenta que a faixa de teste sugerida.':'Sua sens atual já cai dentro da faixa de teste sugerida.';
   $('csAdvice').innerHTML=`<b>${relation}</b> Para ${goalText}, teste mudanças pequenas e compare consistência — não troque a sens inteira de uma vez.`;
   let trade=style==='wrist'?'Como você priorizou pulso, a faixa evita sensibilidades muito lentas que exigiriam deslocamento grande.':style==='arm'?'Como você priorizou braço, a faixa aceita mais cm/360 para ganhar controle fino.':'Braço + pulso permite uma faixa intermediária com boa margem para correções e giros.';
   if(pad==='small')trade+=' O mousepad pequeno limita o teto de cm/360 para não faltar espaço físico.'; else if(pad==='large')trade+=' O mousepad grande permite testar sensibilidades mais lentas sem limitar tanto o movimento.';
   $('csTradeoff').textContent=trade;
 }
 if(!$('csSize'))return;
 let z=+$('csSize').value,g=+$('csGap').value,t=+$('csThick').value,c=$('csColor').value,d=$('csDot').checked,om=$('csOutlineMode').value,style=$('csStyle').value,spread=+$('csSpread').value,res=$('csResolution').value;
 $('csSizeV').textContent=z+' px';$('csGapV').textContent=g+' px';$('csThickV').textContent=t+' px';$('csSpreadV').textContent=spread+' px';$('csSpreadRow').classList.toggle('hidden',!(style==='dynamic'||style==='dynamicQuad'));$('csResLabel').textContent=res;$('csScaleBase').textContent=res;
 let stateName=csPreviewState==='idle'?'PARADO':csPreviewState==='move'?'CORRENDO':csPreviewState==='fire'?'ATIRANDO':'AUTO';$('csStateLabel').textContent=stateName; $('csCross')?.closest('.preview')?.classList.toggle('is-moving',csPreviewState==='move'); $('csCross')?.closest('.preview')?.classList.toggle('is-firing',csPreviewState==='fire');
 csPixelCross($('csCross'),z,g,t,c,d,om,style,spread);
 const rgb=c.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16));
 let legacyStyle=style==='static'||style==='square'?4:2;
 let cmds=[`cl_crosshairstyle ${legacyStyle}`,`cl_crosshairsize ${z}`,`cl_crosshairgap ${g}`,`cl_crosshairthickness ${t}`,`cl_crosshairdot ${d?1:0}`,`cl_crosshair_drawoutline ${om==='none'?0:1}`,`cl_crosshaircolor 5`,`cl_crosshaircolor_r ${rgb[0]}`,`cl_crosshaircolor_g ${rgb[1]}`,`cl_crosshaircolor_b ${rgb[2]}`];
 $('csCode').textContent=cmds.join('; ')+';';
}
function valCross(el,opt){
 if(!el)return;el.innerHTML='';const cx=160,cy=160,state=vPreviewState==='auto'?'idle':vPreviewState;
 const motion=opt.moveError&&state==='move'?8:0, firing=opt.fireError&&state==='fire'?13:0,extra=motion+firing;
 const add=(l,t,w,h,opacity=1)=>{let i=document.createElement('i');i.style.left=l+'px';i.style.top=t+'px';i.style.width=w+'px';i.style.height=h+'px';i.style.background=opt.color;i.style.opacity=opacity*opt.opacity;if(opt.outline)i.style.boxShadow='0 0 0 1px #000';el.appendChild(i)};
 if(opt.inner){let g=opt.innerGap+extra,t=opt.innerThick;add(cx+g,cy-t/2,opt.innerH,t);add(cx-g-opt.innerH,cy-t/2,opt.innerH,t);add(cx-t/2,cy-g-opt.innerV,t,opt.innerV);add(cx-t/2,cy+g,t,opt.innerV)}
 if(opt.outer){let g=opt.outerGap+extra*1.35,t=opt.outerThick;add(cx+g,cy-t/2,opt.outerH,t,.9);add(cx-g-opt.outerH,cy-t/2,opt.outerH,t,.9);add(cx-t/2,cy-g-opt.outerV,t,opt.outerV,.9);add(cx-t/2,cy+g,t,opt.outerV,.9)}
 if(opt.dot){let d=opt.dotSize;add(cx-d/2,cy-d/2,d,d)}
}
function valUpdate(){if(!$('vDpi'))return;let dpi=+$('vDpi').value||0,s=+$('vSens').value||0,cm=cm360(dpi,s,GAME.valorant.yaw);$('vEdpi').textContent=fmt(dpi*s,0)+' eDPI';$('vCm').textContent=fmt(cm)+' cm/360°';if(!$('vInnerH'))return;
 let o={color:$('vColor').value,opacity:+$('vOpacity').value,dot:$('vDot').checked,dotSize:+$('vDotSize').value,outline:$('vOutline').checked,inner:$('vInner').checked,innerH:+$('vInnerH').value,innerV:+$('vInnerV').value,innerThick:+$('vInnerThick').value,innerGap:+$('vInnerGap').value,outer:$('vOuter').checked,outerH:+$('vOuterH').value,outerV:+$('vOuterV').value,outerThick:+$('vOuterThick').value,outerGap:+$('vOuterGap').value,moveError:$('vMoveError').checked,fireError:$('vFireError').checked};
 $('vOpacityV').textContent=Math.round(o.opacity*100)+'%';['InnerH','InnerV','InnerThick','InnerGap','OuterH','OuterV','OuterThick','OuterGap','DotSize'].forEach(k=>{let e=$('v'+k+'V'),inp=$('v'+k);if(e&&inp)e.textContent=inp.value});
 $('vDotSizeRow').classList.toggle('hidden',!o.dot); let stateName=vPreviewState==='idle'?'PARADO':vPreviewState==='move'?'CORRENDO':vPreviewState==='fire'?'ATIRANDO':'AUTO';$('vStateLabel').textContent=stateName;let pv=$('vCross').closest('.preview');pv.classList.toggle('is-moving',vPreviewState==='move');pv.classList.toggle('is-firing',vPreviewState==='fire');valCross($('vCross'),o);
 $('vProfileSummary').textContent=`Cor ${o.color.toUpperCase()} | Opacidade ${Math.round(o.opacity*100)}% | Dot ${o.dot?'ON '+o.dotSize:'OFF'} | Outline ${o.outline?'ON':'OFF'} | Inner ${o.inner?`H${o.innerH}/V${o.innerV} T${o.innerThick} O${o.innerGap}`:'OFF'} | Outer ${o.outer?`H${o.outerH}/V${o.outerV} T${o.outerThick} O${o.outerGap}`:'OFF'} | Movimento ${o.moveError?'ON':'OFF'} | Disparo ${o.fireError?'ON':'OFF'}`;
}
function r6Update(){if(!$('rDpi'))return;let dpi=+$('rDpi').value||0,s=+$('rSens').value||0,m=+$('rMult').value||.02;let cm=cm360(dpi,s,m);$('rEdpi').textContent=fmt(dpi*s,0)+' game-eDPI';$('rCm').textContent=fmt(cm)+' cm/360°';}
function converter(){if(!$('fromGame'))return;let a=GAME[$('fromGame').value],b=GAME[$('toGame').value],dpi=+$('convDpi').value||0,s=+$('convSens').value||0;let cm=cm360(dpi,s,a.yaw),out=sensForCm(cm,dpi,b.yaw);$('convResult').textContent=fmt(out,b.dec);$('convMeta').textContent=`${a.name} ${fmt(s,a.dec)} → ${b.name} ${fmt(out,b.dec)} • ${fmt(cm)} cm/360° preservados`;}
function advisor(){if(!$('advDpi'))return;let game=GAME[$('advGame').value],dpi=+$('advDpi').value||0,s=+$('advSens').value||0,goal=$('advGoal').value,cm=cm360(dpi,s,game.yaw);let target=goal==='recoil'?[30,50]:goal==='flick'?[20,38]:goal==='tracking'?[25,45]:[25,45];let lo=sensForCm(target[1],dpi,game.yaw),hi=sensForCm(target[0],dpi,game.yaw);let label=cm<20?'muito alta':cm<28?'alta':cm<=50?'moderada/baixa':'muito baixa';$('advCurrent').textContent=`${fmt(cm)} cm/360° • sens ${label}`;$('advRange').textContent=`Teste inicial: ${fmt(lo,game.dec)} – ${fmt(hi,game.dec)}`;let why=goal==='recoil'?'Uma faixa mais lenta tende a dar mais margem física para microcorreções durante sprays; exige mais mousepad e braço.':goal==='flick'?'Uma faixa intermediária/rápida reduz o deslocamento para flicks, mas aumenta a precisão física exigida.':goal==='tracking'?'Uma faixa intermediária costuma equilibrar correções contínuas com alcance de movimento.':'A faixa equilibrada evita extremos e serve como ponto de partida, não como “sens mágica”.';$('advWhy').textContent=why;}
function bind(ids,fn){ids.forEach(id=>$(id)?.addEventListener('input',fn));ids.forEach(id=>$(id)?.addEventListener('change',fn));fn()}
document.addEventListener('DOMContentLoaded',()=>{bind(['csDpi','csSens','csGoal','csAimStyle','csPad','csSize','csGap','csThick','csColor','csDot','csOutlineMode','csStyle','csSpread','csResolution'],csUpdate);document.querySelectorAll('[data-cs-state]').forEach(b=>b.addEventListener('click',()=>{clearInterval(csAutoTimer);csPreviewState=b.dataset.csState;document.querySelectorAll('[data-cs-state]').forEach(x=>x.classList.toggle('active',x===b));if(csPreviewState==='auto'){let seq=['idle','move','fire'],i=0;csPreviewState=seq[0];csUpdate();csAutoTimer=setInterval(()=>{i=(i+1)%seq.length;csPreviewState=seq[i];csUpdate()},900)}else csUpdate()}));bind(['vDpi','vSens','vColor','vOpacity','vDot','vDotSize','vOutline','vInner','vInnerH','vInnerV','vInnerThick','vInnerGap','vMoveError','vFireError','vOuter','vOuterH','vOuterV','vOuterThick','vOuterGap'],valUpdate);document.querySelectorAll('[data-v-state]').forEach(b=>b.addEventListener('click',()=>{clearInterval(vAutoTimer);vPreviewState=b.dataset.vState;document.querySelectorAll('[data-v-state]').forEach(x=>x.classList.toggle('active',x===b));if(vPreviewState==='auto'){let seq=['idle','move','fire'],i=0;vPreviewState=seq[0];valUpdate();vAutoTimer=setInterval(()=>{i=(i+1)%seq.length;vPreviewState=seq[i];valUpdate()},900)}else valUpdate()}));bind(['rDpi','rSens','rMult'],r6Update);bind(['fromGame','toGame','convDpi','convSens'],converter);bind(['advGame','advDpi','advSens','advGoal'],advisor);});

// VØIDCORE animated navigation indicator
function initCoreNav(){
 const nav=document.querySelector('.core-nav'); if(!nav)return;
 const indicator=nav.querySelector('.nav-indicator'); const links=[...nav.querySelectorAll('a[data-core]')];
 const active=nav.dataset.active; const activeLink=links.find(a=>a.dataset.core===active);
 const moveTo=(a)=>{if(!a||!indicator)return;const nr=nav.getBoundingClientRect(),r=a.getBoundingClientRect();indicator.style.left=(r.left-nr.left)+'px';indicator.style.width=r.width+'px';indicator.style.opacity='1'};
 if(activeLink){activeLink.classList.add('nav-active');requestAnimationFrame(()=>moveTo(activeLink));}
 links.forEach(a=>{a.addEventListener('mouseenter',()=>moveTo(a));a.addEventListener('mouseleave',()=>moveTo(activeLink));a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();moveTo(a);a.classList.add('nav-active');setTimeout(()=>location.href=a.href,230);});});
 addEventListener('resize',()=>moveTo(activeLink));
}
document.addEventListener('DOMContentLoaded',initCoreNav);
