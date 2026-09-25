const $=id=>document.getElementById(id);
function cross(el,size,gap,thick,color){
  el.innerHTML="";
  [["h",40+gap,40-thick/2,size,thick],["h",40-gap-size,40-thick/2,size,thick],
   ["v",40-thick/2,40-gap-size,thick,size],["v",40-thick/2,40+gap,thick,size]].forEach(x=>{
    let i=document.createElement("i");i.style.left=x[1]+"px";i.style.top=x[2]+"px";i.style.width=x[3]+"px";i.style.height=x[4]+"px";i.style.background=color;el.appendChild(i)
  })
}
function updateCS(){
 let s=+$("csSize").value,g=+$("csGap").value,t=+$("csThick").value,c=$("csColor").value;
 cross($("csCross"),s,g,t,c);
 $("csCode").textContent=`cl_crosshairsize ${s}; cl_crosshairgap -${g}; cl_crosshairthickness ${t};`;
 let dpi=+$("csDpi").value||0,sens=+$("csSens").value||0;
 $("csEdpi").textContent=(dpi*sens).toFixed(0)+" eDPI";
 $("csCm").textContent=(dpi*sens?41563.64/(dpi*sens):0).toFixed(2)+" cm";
}
function updateV(){
 let s=+$("vSize").value,g=+$("vGap").value,t=+$("vThick").value,c=$("vColor").value;
 cross($("vCross"),s,g,t,c);
 $("vCode").textContent=`0;s;1;P;c;5;o;1;0l;${s};0a;1;0f;0;1b;0`;
 $("vEdpi").textContent=((+$("vDpi").value||0)*(+$("vSens").value||0)).toFixed(0)+" eDPI";
 $("convertVal").textContent=((+$("convertCS").value||0)/3.181818).toFixed(3)+" VAL";
}
function updateR(){
 $("rEdpi").textContent=((+$("rDpi").value||0)*(+$("rSens").value||0)).toFixed(0);
 $("rAdsOut").textContent=$("rAds").value+"%";
}
function copyText(t){navigator.clipboard?.writeText(t)}
function copyCS(){copyText($("csCode").textContent)}
function copyVal(){copyText($("vCode").textContent)}
["csSize","csGap","csThick","csColor","csDpi","csSens"].forEach(x=>$(x).addEventListener("input",updateCS));
["vSize","vGap","vThick","vColor","vDpi","vSens","convertCS"].forEach(x=>$(x).addEventListener("input",updateV));
["rDpi","rSens","rAds"].forEach(x=>$(x).addEventListener("input",updateR));
updateCS();updateV();updateR();