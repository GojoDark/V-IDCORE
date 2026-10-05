const $=id=>document.getElementById(id);
const GAME={cs2:{name:'CS2',yaw:.022,dec:4},valorant:{name:'VALORANT',yaw:.07,dec:4},r6:{name:'R6 Siege',yaw:.02,dec:2}};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const cm360=(dpi,sens,yaw)=>dpi>0&&sens>0?914.4/(dpi*sens*yaw):0;
const sensForCm=(cm,dpi,yaw)=>cm>0&&dpi>0?914.4/(cm*dpi*yaw):0;
const fmt=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):'—';
async function copyText(t,b){try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(t);else{const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');ta.remove()}if(b){const old=b.textContent;b.textContent='Copiado ✓';setTimeout(()=>b.textContent=old,1100)}}catch(e){if(b)b.textContent='Falhou ao copiar'}}
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
function converter(){if(!$('fromGame'))return;let a=GAME[$('fromGame').value],b=GAME[$('toGame').value],dpi=+$('convDpi').value||0,s=+$('convSens').value||0;if(dpi<=0||s<=0){$('convResult').textContent='—';$('convMeta').textContent='Informe DPI e sensibilidade maiores que zero.';return}let cm=cm360(dpi,s,a.yaw),out=sensForCm(cm,dpi,b.yaw);$('convResult').textContent=fmt(out,b.dec);$('convMeta').textContent=`${a.name} ${fmt(s,a.dec)} → ${b.name} ${fmt(out,b.dec)} • ${fmt(cm)} cm/360° preservados`;}
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

// CS2 Toolkit — autoexec, viewmodel, binds and performance

const vmHelp={fov:{name:'FOV',text:'Controla quanto do viewmodel aparece. Maior FOV tende a deixar a arma visualmente menor/mais afastada e libera mais área da tela.',dir:'54 ← MENOR  •  MAIOR → 68'},x:{name:'OFFSET X',text:'Move o viewmodel horizontalmente. Valores negativos puxam para a esquerda; positivos empurram para a direita.',dir:'−2.5 ← ESQUERDA  •  DIREITA → +2.5'},y:{name:'OFFSET Y',text:'Move a arma no eixo de profundidade. Use o preview para entender a tendência de aproximar ou afastar o viewmodel.',dir:'−2 ← TRÁS  •  FRENTE → +2'},z:{name:'OFFSET Z',text:'Move o viewmodel verticalmente. Valores negativos descem a arma; positivos sobem.',dir:'−2 ↓ BAIXO  •  CIMA ↑ +2'}};
function vmShowHelp(k){let d=vmHelp[k];if(!d||!$('vmHelpName'))return;$('vmHelpName').textContent=d.name;$('vmHelpText').textContent=d.text;$('vmHelpDir').textContent=d.dir;let id={fov:'vmFov',x:'vmX',y:'vmY',z:'vmZ'}[k];$('vmHelpValue').textContent=$(id).value;document.querySelectorAll('.vm-info').forEach(b=>b.classList.toggle('active',b.dataset.vmInfo===k))}
document.addEventListener('click',e=>{let b=e.target.closest&&e.target.closest('.vm-info');if(b)vmShowHelp(b.dataset.vmInfo)});
function vmUpdate(){if(!$('vmFov'))return;let f=+$('vmFov').value,x=+$('vmX').value,y=+$('vmY').value,z=+$('vmZ').value;$('vmFovV').textContent=f;$('vmXV').textContent=x.toFixed(1);$('vmYV').textContent=y.toFixed(1);$('vmZV').textContent=z.toFixed(1);$('vmCode').textContent=`viewmodel_presetpos 0; viewmodel_fov ${f}; viewmodel_offset_x ${x.toFixed(1)}; viewmodel_offset_y ${y.toFixed(1)}; viewmodel_offset_z ${z.toFixed(1)};`;let g=$('vmGun');if(g){let depthScale=1+(y*.035);g.style.transform=`translate(${x*9}px,${-z*8}px) scale(${(.82+(f-54)/70)*depthScale})`;g.style.filter=`brightness(${1+y*.035})`}let active=document.querySelector('.vm-info.active');if(active)vmShowHelp(active.dataset.vmInfo);autoexecUpdate()}
function bindUpdate(){if(!$('bindKey'))return;let k=$('bindKey').value.trim().replace(/[";]/g,'')||'j',a=$('bindAction').value;$('bindCode').textContent=`bind "${k}" "${a}";`}
function autoexecUpdate(){if(!$('aeCode'))return;let fps=Math.max(0,+$('aeFps').value||0),ui=Math.max(0,+$('aeFpsUi').value||0),key=$('aeConsole').value;let lines=['// VØIDCORE — CS2 autoexec',`fps_max ${fps}`,`fps_max_ui ${ui}`,`bind "${key}" "toggleconsole"`];if($('aeSens').checked&&$('csSens'))lines.push(`sensitivity ${+$('csSens').value||.8}`);if($('aeVm').checked&&$('vmCode'))lines.push($('vmCode').textContent.replace(/; /g,';\n'));lines.push('echo "VØIDCORE autoexec loaded"');$('aeCode').textContent=lines.join('\n')}
function perfUpdate(){if(!$('perfGpu'))return;let gpu=$('perfGpu').value,cpu=$('perfCpu').value,hz=+$('perfHz').value,goal=$('perfGoal').value;let preset=goal==='fps'?'Competitive':goal==='quality'?'Quality':'Balanced';let cap=(cpu==='old'?Math.max(180,Math.round(hz*1.35/10)*10):Math.round(hz*1.7/10)*10);if(goal==='quality')cap=Math.max(hz,Math.round(hz*1.15/10)*10);if(gpu==='low')cap=Math.min(cap,240);$('perfPreset').textContent=preset;$('perfCap').textContent=cap+' FPS';$('perfFocus').textContent=goal==='fps'?'latência + clareza':goal==='quality'?'imagem + estabilidade':'frametime + leitura';let txt=goal==='fps'?'Comece com sombras úteis para leitura, reduza efeitos/oclusão que custem FPS e priorize um frametime estável.':'Evite perseguir o maior FPS possível: ajuste qualidade até manter folga acima da taxa do monitor sem picos fortes de frametime.';if(cpu==='old')txt+=' Em CPU 6c/6t mais antiga, o limite costuma aparecer em cenas pesadas; fechar processos em segundo plano pode valer mais que reduzir resolução.';if(gpu==='low')txt+=' Como a GPU é de entrada, reduza primeiro MSAA/sombras e resolução se o uso da GPU ficar próximo de 100%.';$('perfAdvice').textContent=txt}
document.addEventListener('DOMContentLoaded',()=>{bind(['vmFov','vmX','vmY','vmZ'],vmUpdate);bind(['bindKey','bindAction'],bindUpdate);bind(['aeFps','aeFpsUi','aeConsole','aeSens','aeVm'],autoexecUpdate);bind(['perfGpu','perfCpu','perfHz','perfGoal'],perfUpdate);vmUpdate();vmShowHelp('fov');bindUpdate();autoexecUpdate();perfUpdate();});


// VØID LAB — Sens Finder + shareable presets
const finderState={lo:null,hi:null,mid:null,started:false};
function finderGame(){return GAME[$('sfGame')?.value||'cs2']}
function finderReset(){if(!$('sfGame'))return;let g=finderGame(),dpi=+$('sfDpi').value||800,base=+$('sfStart').value||1;if(dpi<=0||base<=0)return;finderState.lo=base*.55;finderState.hi=base*1.45;finderState.mid=base;finderState.started=true;finderRender('Comece testando o valor central e diga como ele parece.')}
function finderChoice(kind){if(!finderState.started)return finderReset();let m=finderState.mid;if(kind==='slow')finderState.lo=m;else if(kind==='fast')finderState.hi=m;else{finderState.lo=m*.94;finderState.hi=m*1.06}finderState.mid=(finderState.lo+finderState.hi)/2;finderRender(kind==='good'?'Faixa refinada ao redor da sens que pareceu boa.':'Faixa refinada. Teste o novo valor central.')}
function finderRender(msg=''){if(!$('sfResult'))return;let g=finderGame(),dpi=+$('sfDpi').value||0,m=finderState.mid||0,cm=cm360(dpi,m,g.yaw);$('sfResult').textContent=m?`${fmt(m,g.dec)} sens`:'—';$('sfRange').textContent=m?`Faixa atual: ${fmt(finderState.lo,g.dec)} – ${fmt(finderState.hi,g.dec)} • ${fmt(cm)} cm/360° no ponto central`:'Inicie o teste.';$('sfHint').textContent=msg}
function buildSharePayload(){let ids=['fromGame','toGame','convDpi','convSens','advGame','advDpi','advSens','advGoal'];let data={};ids.forEach(id=>{let e=$(id);if(e)data[id]=e.value});return data}
function sharePreset(){let data=buildSharePayload(),raw=btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/=+$/,'');let url=location.href.split('#')[0]+'#preset='+raw;copyText(url,$('shareBtn'));$('shareStatus').textContent='Link copiado. Quem abrir o link recebe os mesmos valores do LAB.'}
function loadSharePreset(){let m=location.hash.match(/(?:^#|&)preset=([^&]+)/);if(!m)return;try{let raw=m[1].replace(/-/g,'+').replace(/_/g,'/');while(raw.length%4)raw+='=';let data=JSON.parse(decodeURIComponent(escape(atob(raw))));Object.entries(data).forEach(([id,v])=>{let e=$(id);if(e)e.value=v});converter();advisor();if($('shareStatus'))$('shareStatus').textContent='Preset carregado do link compartilhado.'}catch(e){if($('shareStatus'))$('shareStatus').textContent='Não foi possível ler este preset.'}}
document.addEventListener('DOMContentLoaded',()=>{if($('sfGame')){['sfGame','sfDpi','sfStart'].forEach(id=>$(id)?.addEventListener('change',finderReset));finderReset()}$('sfSlow')?.addEventListener('click',()=>finderChoice('slow'));$('sfGood')?.addEventListener('click',()=>finderChoice('good'));$('sfFast')?.addEventListener('click',()=>finderChoice('fast'));$('sfReset')?.addEventListener('click',finderReset);$('shareBtn')?.addEventListener('click',sharePreset);loadSharePreset()});

/* ===== CS2 CORE V3 ===== */
function hexRgba(hex,alpha=1){const m=(hex||'#ffffff').replace('#','').match(/.{2}/g)||['ff','ff','ff'];return `rgba(${parseInt(m[0],16)},${parseInt(m[1],16)},${parseInt(m[2],16)},${alpha})`}
function csIsDynamic(style){return ['dynamic','circleDynamic','classicDynamic','responsiveDynamic','dynamicQuad'].includes(style)}
function csPixelCross(el,size,gap,thick,color,dot,outlineMode,style,spread){
 if(!el)return;el.innerHTML='';
 const cx=150,cy=150,state=csPreviewState==='auto'?'idle':csPreviewState,alpha=(+$('csAlpha')?.value||100)/100,quad=+$('csQuadrant')?.value||8,outlineColor=$('csOutlineColor')?.value||'#000000',outlineAlpha=(+$('csOutlineAlpha')?.value||100)/100;
 let extra=csIsDynamic(style)?(state==='move'?Math.min(spread*.12,30):state==='fire'?Math.min(spread*.20,48):0):0;if(style==='responsiveDynamic'&&state==='fire')extra=Math.min(spread*.28,60);let g=gap+extra;
 const lineColor=hexRgba(color,alpha),out=hexRgba(outlineColor,outlineAlpha);
 const add=(l,t,w,h,cls='')=>{let i=document.createElement('i');i.className=cls;i.style.left=l+'px';i.style.top=t+'px';i.style.width=w+'px';i.style.height=h+'px';i.style.background=lineColor;if(outlineMode==='full')i.style.boxShadow=`0 0 0 1px ${out}`;if(outlineMode==='half')i.style.boxShadow=`1px 1px 0 ${out}`;el.appendChild(i);return i};
 const addCross=()=>{add(cx+g,cy-thick/2,size,thick);add(cx-g-size,cy-thick/2,size,thick);add(cx-thick/2,cy-g-size,thick,size);add(cx-thick/2,cy+g,thick,size)};
 if(style==='circleStatic'||style==='circleDynamic'){
   const d=Math.max(10,(size+g)*2.2+extra);let i=add(cx-d/2,cy-d/2,d,d,'cross-circle');i.style.borderWidth=Math.max(1,thick)+'px';i.style.borderColor=lineColor;i.style.background='transparent';if(outlineMode!=='none')i.style.boxShadow=`0 0 0 1px ${out}, inset 0 0 0 1px ${out}`;
 }else if(style==='square'){
   const d=Math.max(8,size*2);let i=add(cx-d/2,cy-d/2,d,d,'cross-square');i.style.borderWidth=Math.max(1,thick)+'px';i.style.borderColor=lineColor;i.style.background='transparent';
 }else if(style==='dotOnly'){
   const d=Math.max(2,thick+2);add(cx-d/2,cy-d/2,d,d,'cross-dot-only');
 }else if(style==='staticQuad'||style==='dynamicQuad'){
   const q=Math.max(2,quad),dist=g+q;add(cx-dist-q,cy-dist-q,q,thick,'cross-quadrant');add(cx+dist,cy-dist-q,q,thick,'cross-quadrant');add(cx-dist-q,cy+dist,q,thick,'cross-quadrant');add(cx+dist,cy+dist,q,thick,'cross-quadrant');
   add(cx-dist-q,cy-dist-q,thick,q,'cross-quadrant');add(cx+dist+q-thick,cy-dist-q,thick,q,'cross-quadrant');add(cx-dist-q,cy+dist,thick,q,'cross-quadrant');add(cx+dist+q-thick,cy+dist,thick,q,'cross-quadrant');
 }else addCross();
 if(dot&&style!=='dotOnly'){const d=Math.max(2,thick+1);add(cx-d/2,cy-d/2,d,d,'cross-dot')}
}
function csUpdate(){
 if(!$('csDpi'))return;
 let dpi=+$('csDpi').value||0,s=+$('csSens').value||0,cm=cm360(dpi,s,GAME.cs2.yaw),edpi=dpi*s;$('csEdpi').textContent=fmt(edpi,0);$('csCm').textContent=fmt(cm)+' cm/360°';
 let goal=$('csGoal').value,aimStyle=$('csAimStyle').value,pad=$('csPad').value,base={balanced:[27,45],recoil:[32,52],flick:[22,38],tracking:[27,46]}[goal],loCm=base[0],hiCm=base[1];if(aimStyle==='arm'){loCm+=3;hiCm+=5}if(aimStyle==='wrist'){loCm=Math.max(16,loCm-5);hiCm-=5}if(pad==='small'){loCm=Math.max(16,loCm-6);hiCm=Math.min(hiCm,36)}if(pad==='large'&&aimStyle!=='wrist')hiCm+=3;let fast=sensForCm(loCm,dpi,GAME.cs2.yaw),slow=sensForCm(hiCm,dpi,GAME.cs2.yaw);$('csSensProfile').textContent=cm<20?'Muito alta':cm<28?'Alta':cm<=45?'Equilibrada':cm<=60?'Baixa':'Muito baixa';$('csTestRange').textContent=`${fmt(slow,3)} – ${fmt(fast,3)} sens • ${loCm}–${hiCm} cm/360°`;$('csAdvice').innerHTML=`<b>${cm<loCm?'Mais rápida que a faixa sugerida':cm>hiCm?'Mais lenta que a faixa sugerida':'Dentro da faixa sugerida'}.</b> Ajuste em passos pequenos e teste consistência.`;$('csTradeoff').textContent=aimStyle==='wrist'?'Pulso favorece uma faixa um pouco mais rápida.':aimStyle==='arm'?'Braço permite explorar sensibilidades mais lentas com mais controle físico.':'Braço + pulso equilibra alcance e microajuste.';
 let z=+$('csSize').value,g=+$('csGap').value,t=+$('csThick').value,c=$('csColor').value,d=$('csDot').checked,om=$('csOutlineMode').value,style=$('csStyle').value,spread=+$('csSpread').value,res=$('csResolution').value,alpha=+$('csAlpha').value||100,quad=+$('csQuadrant').value||8,outlineAlpha=+$('csOutlineAlpha').value||100;
 $('csSizeV').textContent=z+' px';$('csGapV').textContent=g+' px';$('csThickV').textContent=t+' px';$('csSpreadV').textContent=spread;$('csAlphaV').textContent=alpha+'%';$('csOutlineAlphaV').textContent=outlineAlpha+'%';$('csQuadrantV').textContent=quad+' px';$('csSpreadRow').classList.toggle('hidden',!csIsDynamic(style));$('csResLabel').textContent=res;$('csScaleBase').textContent=res;
 const stateName=csPreviewState==='idle'?'PARADO':csPreviewState==='move'?'CORRENDO':csPreviewState==='fire'?'ATIRANDO':'AUTO';$('csStateLabel').textContent=stateName;let pv=$('csPreview');pv?.classList.toggle('is-moving',csPreviewState==='move');pv?.classList.toggle('is-firing',csPreviewState==='fire');
 csPixelCross($('csCross'),z,g,t,c,d,om,style,spread);
 const rgb=c.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16));let legacyStyle=csIsDynamic(style)?2:4;let cmds=[`cl_crosshairstyle ${legacyStyle}`,`cl_crosshairsize ${z}`,`cl_crosshairgap ${g}`,`cl_crosshairthickness ${t}`,`cl_crosshairdot ${d||style==='dotOnly'?1:0}`,`cl_crosshair_drawoutline ${om==='none'?0:1}`,`cl_crosshairalpha ${Math.round(alpha*2.55)}`,`cl_crosshaircolor 5`,`cl_crosshaircolor_r ${rgb[0]}`,`cl_crosshaircolor_g ${rgb[1]}`,`cl_crosshaircolor_b ${rgb[2]}`];
 if(['circleStatic','circleDynamic','staticQuad','dynamicQuad','square'].includes(style))cmds.unshift('// Estilo visual VØIDCORE: opção nova sem cvar pública equivalente confirmada');$('csCode').textContent=cmds.join('; ')+';';autoexecUpdate();
}
function csSceneUpdate(){let scene=$('csScene')?.value||'dust',p=$('csPreview');if(!p)return;['dust','mirage','inferno','dark'].forEach(s=>p.classList.toggle('map-'+s,s===scene))}
function vmSceneUpdate(){let scene=$('vmScene')?.value||'dust',p=$('vmStage');if(!p)return;['dust','mirage','inferno','dark'].forEach(s=>p.classList.toggle('map-'+s,s===scene))}
function vmUpdate(){
 if(!$('vmFov'))return;let f=+$('vmFov').value,x=+$('vmX').value,y=+$('vmY').value,z=+$('vmZ').value,aspect=$('vmAspect')?.value||'16-9',hand=$('vmHand')?.value||'right';$('vmFovV').textContent=f;$('vmXV').textContent=x.toFixed(1);$('vmYV').textContent=y.toFixed(1);$('vmZV').textContent=z.toFixed(1);$('vmCode').textContent=`viewmodel_presetpos 0; viewmodel_fov ${f}; viewmodel_offset_x ${x.toFixed(1)}; viewmodel_offset_y ${y.toFixed(1)}; viewmodel_offset_z ${z.toFixed(1)};`;
 let g=$('vmGun'),stage=$('vmStage');if(g){let scale=(1.08-(f-54)*.018)*(1+y*.035),tx=x*18,ty=-z*14+y*3;g.classList.toggle('left',hand==='left');g.style.transform=`translate(${hand==='left'?-tx:tx}px,${ty}px) scale(${scale})`}
 if(stage){stage.classList.toggle('stretched',aspect.includes('stretched'));stage.classList.toggle('black-bars',aspect==='4-3-bars');stage.classList.toggle('aspect-5-4',aspect==='5-4-stretched')}
 let label={'16-9':'16:9','16-10':'16:10','4-3-stretched':'4:3 Stretched','4-3-bars':'4:3 Black Bars','5-4-stretched':'5:4 Stretched'}[aspect];$('vmAspectLabel').textContent=label;$('vmAspectStat').textContent=label;$('vmHandStat').textContent=hand==='left'?'Esquerda':'Direita';$('vmProfile').textContent=`${f} / ${x>=0?'+':''}${x.toFixed(1)} / ${y>=0?'+':''}${y.toFixed(1)} / ${z>=0?'+':''}${z.toFixed(1)}`;autoexecUpdate();
}
function parseCrosshairCommands(raw){const pairs={};String(raw).split(/[;\n]+/).forEach(line=>{let m=line.trim().match(/^(cl_crosshair\S+)\s+"?([^"\s]+)"?/i);if(m)pairs[m[1].toLowerCase()]=m[2]});const set=(id,v)=>{let e=$(id);if(e&&v!==undefined)e.value=v};set('csSize',pairs.cl_crosshairsize);set('csGap',pairs.cl_crosshairgap);set('csThick',pairs.cl_crosshairthickness);if(pairs.cl_crosshairdot!==undefined)$('csDot').checked=pairs.cl_crosshairdot==='1';if(pairs.cl_crosshair_drawoutline!==undefined)$('csOutlineMode').value=pairs.cl_crosshair_drawoutline==='0'?'none':'full';if(pairs.cl_crosshairalpha!==undefined)set('csAlpha',Math.round((+pairs.cl_crosshairalpha||255)/2.55));let r=+pairs.cl_crosshaircolor_r,g=+pairs.cl_crosshaircolor_g,b=+pairs.cl_crosshaircolor_b;if([r,g,b].every(Number.isFinite))$('csColor').value='#'+[r,g,b].map(n=>clamp(Math.round(n),0,255).toString(16).padStart(2,'0')).join('');if(pairs.cl_crosshairstyle)$('csStyle').value=+pairs.cl_crosshairstyle===2?'classicDynamic':'static';csUpdate();return Object.keys(pairs).length}
function crossPreset(name){const presets={precision:{style:'static',size:5,gap:3,thick:1,dot:false,color:'#55ff88'},spray:{style:'classicDynamic',size:7,gap:4,thick:2,dot:false,color:'#00e5ff'},dot:{style:'dotOnly',size:2,gap:0,thick:3,dot:true,color:'#ff3355'},quadrant:{style:'staticQuad',size:8,gap:5,thick:2,dot:false,color:'#b34cff'}};let p=presets[name];if(!p)return;$('csStyle').value=p.style;$('csSize').value=p.size;$('csGap').value=p.gap;$('csThick').value=p.thick;$('csDot').checked=p.dot;$('csColor').value=p.color;csUpdate()}
function vmPreset(name){const p={classic:[68,2.5,0,-1.5],wide:[68,2.5,2,-2],compact:[60,1.4,-1,-1.8],center:[62,0.2,-.5,-1]}[name];if(!p)return;['vmFov','vmX','vmY','vmZ'].forEach((id,i)=>$(id).value=p[i]);vmUpdate()}
function saveCrossPreset(){let ids=['csStyle','csSize','csGap','csThick','csQuadrant','csColor','csAlpha','csOutlineMode','csOutlineColor','csOutlineAlpha','csSpread','csResolution','csScene'];let d={dot:$('csDot').checked,scopeColor:$('csScopeColor').checked};ids.forEach(id=>d[id]=$(id).value);localStorage.setItem('voidcore_cs2_crosshair_v3',JSON.stringify(d));$('csImportStatus').textContent='Preset salvo neste navegador.'}
function loadCrossPreset(){try{let d=JSON.parse(localStorage.getItem('voidcore_cs2_crosshair_v3')||'null');if(!d)throw 0;Object.entries(d).forEach(([id,v])=>{if(id==='dot')$('csDot').checked=v;else if(id==='scopeColor')$('csScopeColor').checked=v;else if($(id))$(id).value=v});csSceneUpdate();csUpdate();$('csImportStatus').textContent='Preset carregado.'}catch(e){$('csImportStatus').textContent='Nenhum preset salvo ainda.'}}
document.addEventListener('DOMContentLoaded',()=>{
 bind(['csQuadrant','csAlpha','csOutlineColor','csOutlineAlpha','csScopeColor','csScene'],()=>{csSceneUpdate();csUpdate()});
 bind(['vmAspect','vmHand','vmScene'],()=>{vmSceneUpdate();vmUpdate()});
 document.querySelectorAll('[data-cross-preset]').forEach(b=>b.addEventListener('click',()=>crossPreset(b.dataset.crossPreset)));
 document.querySelectorAll('[data-vm-preset]').forEach(b=>b.addEventListener('click',()=>vmPreset(b.dataset.vmPreset)));
 $('csImportBtn')?.addEventListener('click',()=>{let n=parseCrosshairCommands($('csImport').value);$('csImportStatus').textContent=n?`${n} comandos reconhecidos.`:'Nenhum comando cl_crosshair reconhecido.'});
 $('csSavePreset')?.addEventListener('click',saveCrossPreset);$('csLoadPreset')?.addEventListener('click',loadCrossPreset);
 csSceneUpdate();vmSceneUpdate();csUpdate();vmUpdate();
});

/* ===== VØIDCORE V3.1 — researched CS2 crosshair + Sensi Hub ===== */
function gameYawFor(game,mult){if(game==='r6')return mult||.02;return GAME[game].yaw}
function converter(){
 if(!$('fromGame'))return;
 const from=$('fromGame').value,to=$('toGame').value,dpiFrom=+$('convDpi').value||0,dpiTo=+$('convDpiTo')?.value||dpiFrom,s=+$('convSens').value||0,r6m=+$('convR6Mult')?.value||.02;
 const a=GAME[from],b=GAME[to]; const yawA=gameYawFor(from,r6m),yawB=gameYawFor(to,r6m);
 if(dpiFrom<=0||dpiTo<=0||s<=0){$('convResult').textContent='—';$('convMeta').textContent='Informe DPI e sensibilidade válidos.';return}
 const cm=cm360(dpiFrom,s,yawA),out=sensForCm(cm,dpiTo,yawB),inch=cm/2.54;
 $('convResult').textContent=fmt(out,b.dec); $('convCm').textContent=fmt(cm)+' cm'; $('convIn').textContent=fmt(inch)+' in'; $('convEdpiFrom').textContent=fmt(dpiFrom*s,0); $('convEdpiTo').textContent=fmt(dpiTo*out,0);
 $('convMeta').textContent=`${a.name} ${fmt(s,a.dec)} @ ${dpiFrom} DPI → ${b.name} ${fmt(out,b.dec)} @ ${dpiTo} DPI • mesma distância física de 360°`;
 $('convR6MultRow')?.classList.toggle('hidden',from!=='r6'&&to!=='r6');
}
function abUpdate(){if(!$('abGameA'))return;let gA=$('abGameA').value,gB=$('abGameB').value,dA=+$('abDpiA').value||0,dB=+$('abDpiB').value||0,sA=+$('abSensA').value||0,sB=+$('abSensB').value||0;let cA=cm360(dA,sA,gameYawFor(gA,.02)),cB=cm360(dB,sB,gameYawFor(gB,.02));$('abCmA').textContent=fmt(cA)+' cm';$('abCmB').textContent=fmt(cB)+' cm';let diff=cA&&cB?((cB-cA)/cA*100):0;$('abDiff').textContent=(diff>=0?'+':'')+fmt(diff,1)+'%';$('abVerdict').textContent=Math.abs(diff)<1?'Praticamente equivalentes em distância 360°.':diff>0?'B é fisicamente mais lenta que A (exige mais movimento de mouse).':'B é fisicamente mais rápida que A (exige menos movimento de mouse).'}
function saveAB(){if(!$('abSave'))return;let d={at:new Date().toISOString(),a:{game:$('abGameA').value,dpi:$('abDpiA').value,sens:$('abSensA').value},b:{game:$('abGameB').value,dpi:$('abDpiB').value,sens:$('abSensB').value}};let h=JSON.parse(localStorage.getItem('voidcore_sensi_history')||'[]');h.unshift(d);h=h.slice(0,12);localStorage.setItem('voidcore_sensi_history',JSON.stringify(h));$('abStatus').textContent=`Comparação salva localmente (${h.length}/12).`}

function csStyleRows(style){
 const dyn=csIsDynamic(style), circle=style==='circleStatic'||style==='circleDynamic',square=style==='square',dot=style==='dotOnly',quad=style==='staticQuad'||style==='dynamicQuad',classic=style==='classicDynamic';
 const show=(id,on)=>$(id)?.classList.toggle('hidden',!on);
 show('csSizeRow',!(circle||square||dot||style==='staticQuad')); show('csGapRow',!dot); show('csQuadrantRow',quad); show('csSpreadRow',style==='dynamic'||style==='dynamicQuad'||style==='circleDynamic'); show('csSplitRow',classic); show('csInnerAlphaRow',classic); show('csDotRow',!dot); show('csTStyleRow',!circle&&!square&&!dot&&!quad); show('csScopeColorRow',circle||square||dot||quad); show('csScopeScaleRow',circle||square||dot||quad); show('csFollowRecoilRow',dot); return {dyn,circle,square,dot,quad,classic};
}
function csPixelCross(el,size,gap,thick,color,dot,outlineMode,style,spread){
 if(!el)return; el.innerHTML=''; const cx=150,cy=150,state=csPreviewState==='auto'?'idle':csPreviewState,alpha=(+$('csAlpha')?.value||100)/100,quad=+$('csQuadrant')?.value||.42,outlineColor=$('csOutlineColor')?.value||'#000000',outlineAlpha=(+$('csOutlineAlpha')?.value||100)/100,split=+$('csSplit')?.value||7,innerAlpha=(+$('csInnerAlpha')?.value||100)/100,tstyle=$('csTStyle')?.checked;
 let extra=csIsDynamic(style)?(state==='move'?Math.min(spread*.12,32):state==='fire'?Math.min(spread*.20,56):0):0;if(style==='responsiveDynamic'&&state==='fire')extra=Math.min(spread*.24,64);let g=gap+extra;
 const lineColor=hexRgba(color,alpha),out=hexRgba(outlineColor,outlineAlpha);
 const add=(l,t,w,h,cls='',op=1)=>{let i=document.createElement('i');i.className=cls;i.style.left=l+'px';i.style.top=t+'px';i.style.width=w+'px';i.style.height=h+'px';i.style.background=lineColor;i.style.opacity=op;if(outlineMode==='full')i.style.boxShadow=`0 0 0 1px ${out}`;if(outlineMode==='half')i.style.boxShadow=`1px 1px 0 ${out}`;el.appendChild(i);return i};
 const addCross=(cg=g,op=1)=>{add(cx+cg,cy-thick/2,size,thick,'',op);add(cx-cg-size,cy-thick/2,size,thick,'',op);if(!tstyle)add(cx-thick/2,cy-cg-size,thick,size,'',op);add(cx-thick/2,cy+cg,thick,size,'',op)};
 if(style==='circleStatic'||style==='circleDynamic'){
   const r=Math.max(5,Math.abs(g)+thick*2+extra*.25),d=r*2;let i=add(cx-r,cy-r,d,d,'cross-circle');i.style.border=`${Math.max(1,thick)}px solid ${lineColor}`;i.style.borderRadius='50%';i.style.background='transparent';if(outlineMode!=='none')i.style.boxShadow=`0 0 0 1px ${out}, inset 0 0 0 1px ${out}`;
 }else if(style==='square'){
   const d=Math.max(6,Math.abs(g)*2+thick*2);let i=add(cx-d/2,cy-d/2,d,d,'cross-square');i.style.border=`${Math.max(1,thick)}px solid ${lineColor}`;i.style.background='transparent';
 }else if(style==='dotOnly'){
   const d=Math.max(2,thick*2+1);add(cx-d/2,cy-d/2,d,d,'cross-dot-only');
 }else if(style==='staticQuad'){
   const q=Math.max(.08,Math.min(1,+$('csQuadrant').value||.42)),r=Math.max(7,Math.abs(g)+9),arc=Math.max(5,r*q); const mk=(x,y,borders,rad)=>{let i=document.createElement('i');i.className='quad-corner';i.style.left=x+'px';i.style.top=y+'px';i.style.width=arc+'px';i.style.height=arc+'px';i.style.borderColor=lineColor;i.style.borderStyle='solid';i.style.borderWidth=borders;i.style.borderRadius=rad;if(outlineMode!=='none')i.style.filter=`drop-shadow(0 0 1px ${out})`;el.appendChild(i)}; mk(cx-r-arc,cy-r-arc,`${thick}px 0 0 ${thick}px`,'100% 0 0 0');mk(cx+r,cy-r-arc,`${thick}px ${thick}px 0 0`,'0 100% 0 0');mk(cx-r-arc,cy+r,`0 0 ${thick}px ${thick}px`,'0 0 0 100%');mk(cx+r,cy+r,`0 ${thick}px ${thick}px 0`,'0 0 100% 0');
 }else if(style==='dynamicQuad'){
   const r=Math.max(12,Math.abs(g)+18+extra*.2),arcLen=Math.max(18,Math.min(70,size*5)); const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 300 300');svg.classList.add('quad-svg'); const start=[-135,-45,45,135];start.forEach(a=>{let path=document.createElementNS('http://www.w3.org/2000/svg','path');let a1=(a-arcLen/2)*Math.PI/180,a2=(a+arcLen/2)*Math.PI/180,x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2),large=arcLen>180?1:0;path.setAttribute('d',`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`);path.setAttribute('stroke',lineColor);path.setAttribute('stroke-width',Math.max(1,thick));path.setAttribute('fill','none');if(outlineMode!=='none')path.style.filter=`drop-shadow(0 0 1px ${out})`;svg.appendChild(path)});el.appendChild(svg);
 }else if(style==='classicDynamic'){
   addCross(g,1); if(state==='fire'){let ig=Math.max(0,g-split);addCross(ig,innerAlpha)}
 }else addCross();
 if(dot&&style!=='dotOnly'){const d=Math.max(2,thick+1);add(cx-d/2,cy-d/2,d,d,'cross-dot')}
}
function csUpdate(){
 if(!$('csDpi'))return; let dpi=+$('csDpi').value||0,s=+$('csSens').value||0,cm=cm360(dpi,s,GAME.cs2.yaw),edpi=dpi*s;$('csEdpi').textContent=fmt(edpi,0);$('csCm').textContent=fmt(cm)+' cm/360°';
 if($('csGoal')){let goal=$('csGoal').value,aimStyle=$('csAimStyle').value,pad=$('csPad').value,base={balanced:[27,45],recoil:[32,52],flick:[22,38],tracking:[27,46]}[goal],loCm=base[0],hiCm=base[1];if(aimStyle==='arm'){loCm+=3;hiCm+=5}if(aimStyle==='wrist'){loCm=Math.max(16,loCm-5);hiCm-=5}if(pad==='small'){loCm=Math.max(16,loCm-6);hiCm=Math.min(hiCm,36)}if(pad==='large'&&aimStyle!=='wrist')hiCm+=3;let fast=sensForCm(loCm,dpi,GAME.cs2.yaw),slow=sensForCm(hiCm,dpi,GAME.cs2.yaw);$('csSensProfile').textContent=cm<20?'Muito alta':cm<28?'Alta':cm<=45?'Equilibrada':cm<=60?'Baixa':'Muito baixa';$('csTestRange').textContent=`${fmt(slow,3)} – ${fmt(fast,3)} sens • ${loCm}–${hiCm} cm/360°`;$('csAdvice').innerHTML=`<b>${cm<loCm?'Mais rápida que a faixa de teste':cm>hiCm?'Mais lenta que a faixa de teste':'Dentro da faixa de teste'}.</b> Use a faixa como experimento, não como “sens perfeita”.`;$('csTradeoff').textContent='Faixas são heurísticas para teste; consistência pessoal e espaço físico do mousepad continuam mandando.'}
 if(!$('csSize'))return; let z=+$('csSize').value,g=+$('csGap').value,t=+$('csThick').value,c=$('csColor').value,d=$('csDot').checked,om=$('csOutlineMode').value,style=$('csStyle').value,spread=+$('csSpread').value,res=$('csResolution').value,alpha=+$('csAlpha').value||100,quad=+$('csQuadrant').value||.42,outlineAlpha=+$('csOutlineAlpha').value||100;csStyleRows(style);
 $('csSizeV').textContent=z+' px';$('csGapV').textContent=g+' px';$('csThickV').textContent=t+' px';$('csSpreadV').textContent=spread+' px';$('csAlphaV').textContent=alpha+'%';$('csOutlineAlphaV').textContent=outlineAlpha+'%';$('csQuadrantV').textContent=Number(quad).toFixed(2);if($('csSplitV'))$('csSplitV').textContent=(+$('csSplit').value||0)+' px';if($('csInnerAlphaV'))$('csInnerAlphaV').textContent=(+$('csInnerAlpha').value||0)+'%';if($('csScopeScaleV'))$('csScopeScaleV').textContent=(+$('csScopeScale').value||.16).toFixed(2);$('csResLabel').textContent=res;$('csScaleBase').textContent=res;
 const stateName=csPreviewState==='idle'?'PARADO':csPreviewState==='move'?'CORRENDO':csPreviewState==='fire'?'ATIRANDO':'AUTO';$('csStateLabel').textContent=stateName;let pv=$('csPreview');pv?.classList.toggle('is-moving',csPreviewState==='move');pv?.classList.toggle('is-firing',csPreviewState==='fire');csPixelCross($('csCross'),z,g,t,c,d,om,style,spread);
 const rgb=c.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)),legacyStyle=style==='classicDynamic'?2:style==='responsiveDynamic'?3:4;let cmds=[`cl_crosshairstyle ${legacyStyle}`,`cl_crosshairsize ${z}`,`cl_crosshairgap ${g}`,`cl_crosshairthickness ${t}`,`cl_crosshairdot ${d||style==='dotOnly'?1:0}`,`cl_crosshair_drawoutline ${om==='none'?0:1}`,`cl_crosshairalpha ${Math.round(alpha*2.55)}`,`cl_crosshaircolor 5`,`cl_crosshaircolor_r ${rgb[0]}`,`cl_crosshaircolor_g ${rgb[1]}`,`cl_crosshaircolor_b ${rgb[2]}`];if(['circleStatic','circleDynamic','staticQuad','dynamicQuad','square','dotOnly','dynamic'].includes(style))cmds.unshift('// Parte visual usa o sistema novo do CS2; o VØIDCORE não inventa cvar não validada');$('csCode').textContent=cmds.join('; ')+';';autoexecUpdate();
}
document.addEventListener('DOMContentLoaded',()=>{
 bind(['convDpiTo','convR6Mult'],converter);bind(['abGameA','abGameB','abDpiA','abDpiB','abSensA','abSensB'],abUpdate);$('abSave')?.addEventListener('click',saveAB);
 bind(['csSplit','csInnerAlpha','csTStyle','csScopeScale','csFollowRecoil'],csUpdate); if($('csQuadrant')){$('csQuadrant').min='.08';$('csQuadrant').max='1';$('csQuadrant').step='.01';$('csQuadrant').value='.42'} csUpdate();
});
