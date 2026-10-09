const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const pages=['index','cs2','valorant','r6','sensi','lab','design-system','logo-preview'].map(x=>x+'.html');
const files=[...pages,'app.js','engine.js','style.css','assets/symbol.svg','assets/wordmark.svg','assets/viewmodel.svg','assets/viewmodel-render.png','assets/viewmodel-ak47.png','assets/range-render.png'];
for(const f of ['app.js','engine.js'])new vm.Script(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
for(const page of pages){const html=fs.readFileSync(path.join(root,page),'utf8');for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const target=match[1].split(/[?#]/)[0];if(!target||/^[a-z]+:/i.test(target))continue;assert(fs.existsSync(path.join(root,target)),`${page}: missing ${target}`);}}
const manifest=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
fs.writeFileSync(path.join(root,'tests/build-results.json'),JSON.stringify({status:'passed',type:'Static distribution validation (no transpilation required)',pages:pages.length,files:manifest},null,2));
console.log('Static build passed: scripts compile, 8 pages and their local assets resolve.');
