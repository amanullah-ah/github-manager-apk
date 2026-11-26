const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S={tok:null,user:null,repos:[],q:'',f:'all',repo:null,branch:null,branches:[],path:'',view:'files',items:[],commits:[],cpage:1,starred:false,sort:'updated',mt:{},file:null};
const API='https://api.github.com';

/* APK: Android WebView mein blob download nahi chalta, isliye file cache mein likh kar Share sheet kholte hain (Save to Files / Drive / WhatsApp) */
const NATIVE=()=>!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
async function saveBlob(blob,name){
  if(NATIVE()){
    const P=window.Capacitor.Plugins||{};
    if(P.Filesystem&&P.Share){
      const b64=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=()=>no(r.error);r.readAsDataURL(blob)});
      const w=await P.Filesystem.writeFile({path:name,data:b64,directory:'CACHE',recursive:true});
      try{await P.Share.share({title:name,url:w.uri,dialogTitle:'Save or share '+name})}catch(e){}
      return;
    }
  }
  const u=URL.createObjectURL(blob),l=document.createElement('a');
  l.href=u;l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);
}
document.addEventListener('click',e=>{
  if(!NATIVE())return;
  const a=e.target.closest&&e.target.closest('a[download][href^="blob:"]');
  if(!a)return;
  e.preventDefault();
  fetch(a.href).then(r=>r.blob()).then(b=>saveBlob(b,a.download||'file')).catch(x=>toast(x.message,1));
},true);
const enc=p=>p.split('/').map(encodeURIComponent).join('/');
const join=(a,b)=>a?a+'/'+b:b;
const fmt=d=>new Date(d).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
const kb=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';
const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const R=()=>S.repo.full_name;
const ago=d=>{const s=(Date.now()-new Date(d))/1000;for(const[k,l]of[[31536000,'y'],[2592000,'mo'],[86400,'d'],[3600,'h'],[60,'m']])if(s>=k)return Math.floor(s/k)+l+' ago';return 'just now'};
const LC={JavaScript:'#f1e05a',TypeScript:'#3178c6',Python:'#3572a5',HTML:'#e34c26',CSS:'#a78bfa',PHP:'#4f5d95',Java:'#b07219',Shell:'#89e051','C++':'#f34b7d',Go:'#00add8',Kotlin:'#a97bff',Dart:'#00b4ab'};
const isImg=n=>/\.(png|jpe?g|gif|webp|svg|ico|bmp)$/i.test(n);
const Q={"globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/>", "lock": "<rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/>", "star": "<path d=\"m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/>", "fork": "<circle cx=\"12\" cy=\"18\" r=\"3\"/><circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><path d=\"M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9M12 12v3\"/>", "branch": "<path d=\"M6 3v12\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M18 9a9 9 0 0 1-9 9\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>", "folder": "<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/>", "folderopen": "<path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\"/>", "trash": "<path d=\"M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6\"/>", "tag": "<path d=\"M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2 2 0 0 0 2.82 0l7.17-7.17a2 2 0 0 0 0-2.82z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>", "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3\"/>", "upload": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12\"/>", "edit": "<path d=\"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\"/>", "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>", "gear": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "checksq": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><path d=\"m9 12 2 2 4-4\"/>", "x": "<path d=\"M18 6 6 18M6 6l12 12\"/>", "check": "<path d=\"M20 6 9 17l-5-5\"/>", "back": "<path d=\"m15 18-6-6 6-6\"/>", "chev": "<path d=\"m9 18 6-6-6-6\"/>", "package": "<path d=\"m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><path d=\"m3.3 7 8.7 5 8.7-5M12 22V12\"/>", "eye": "<path d=\"M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "file": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/>", "code": "<path d=\"m16 18 6-6-6-6M8 6l-6 6 6 6\"/>", "image": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21\"/>", "archive": "<rect x=\"2\" y=\"3\" width=\"20\" height=\"5\" rx=\"1\"/><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4\"/>", "braces": "<path d=\"M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1\"/>", "filetext": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8\"/>", "palette": "<circle cx=\"13.5\" cy=\"6.5\" r=\".5\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.39-.15-.73-.39-1-.23-.27-.38-.62-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z\"/>", "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4\"/>", "moon": "<path d=\"M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z\"/>"};
const IC=(n,s=18,f)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${f||'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${Q[n]}</svg>`;
Object.assign(Q,{logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>'});
Object.assign(Q,{"refresh": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>"});
Object.assign(Q,{"up": "<path d=\"m18 15-6-6-6 6\"/>", "down": "<path d=\"m6 9 6 6 6-6\"/>", "swap": "<path d=\"m17 3 4 4-4 4\"/><path d=\"M3 7h18\"/><path d=\"m7 21-4-4 4-4\"/><path d=\"M21 17H3\"/>", "layers": "<path d=\"m12 2 10 5-10 5L2 7z\"/><path d=\"m2 17 10 5 10-5\"/><path d=\"m2 12 10 5 10-5\"/>", "toline": "<path d=\"M12 17V3\"/><path d=\"m6 11 6 6 6-6\"/><path d=\"M19 21H5\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>"});
const ICO={html:['code','#fb923c'],css:['palette','#38bdf8'],js:['code','#facc15'],json:['braces','#a3e635'],md:['filetext','#94a3b8'],png:['image','#e879f9'],jpg:['image','#e879f9'],jpeg:['image','#e879f9'],gif:['image','#e879f9'],svg:['image','#e879f9'],webp:['image','#e879f9'],ico:['image','#e879f9'],zip:['archive','#fbbf24'],php:['code','#818cf8'],py:['code','#34d399'],dir:['folder','#a78bfa']};
const ico=n=>{const e=ICO[n.split('.').pop().toLowerCase()]||['file','#a9a6cf'];return `<span class="fic" style="color:${e[1]}">${IC(e[0],22)}</span>`};

function toast(m,bad){const t=$('#toast');t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',3500)}
const AV='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#2a1450"/><text x="40" y="54" font-size="40" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700">A</text></svg>');
function demoRepos(){const H=36e5,mk=(name,desc,lang,pv,st,fk,h)=>({id:name,name,full_name:'octocat/'+name,description:desc,language:lang,private:!!pv,stargazers_count:st,forks_count:fk,default_branch:'main',updated_at:new Date(Date.now()-h*H).toISOString(),html_url:'https://github.com/octocat/'+name,owner:{login:'octocat',avatar_url:AV}});return[mk('IMAGE-HOST','','CSS',1,0,0,2),mk('AMANTECH-MD','WhatsApp bot','JavaScript',1,0,0,20),mk('webtoapk-builder','','HTML',0,3,1,70),mk('portfolio','Creative developer portfolio','HTML',0,5,2,200),mk('sub4unlock','Link locker','JavaScript',1,0,0,400),mk('skillzup','Course selling app','PHP',0,2,0,900)]}
function demoApi(p){
  if(p.startsWith('/user/repos'))return Promise.resolve(demoRepos());
  if(p.includes('/branches'))return Promise.resolve([{name:'main',commit:{sha:'a1b2c3d4'}},{name:'dev',commit:{sha:'d4e5f6a7'}}]);
  if(p.includes('/contents/'))return Promise.resolve([{type:'dir',name:'api',path:'api'},{type:'dir',name:'css',path:'css'},{type:'dir',name:'js',path:'js'},{type:'file',name:'.gitignore',path:'.gitignore',size:46,sha:'1'},{type:'file',name:'index.html',path:'index.html',size:8420,sha:'2'},{type:'file',name:'logo.png',path:'logo.png',size:15360,sha:'3'},{type:'file',name:'README.md',path:'README.md',size:512,sha:'4'}]);
  if(p.includes('/commits')){const m=(sha,msg,h)=>({sha,commit:{message:msg,author:{name:'AMAN-HN',date:new Date(Date.now()-h*36e5).toISOString()}}});return Promise.resolve([m('f3a91c2d','Upload project.zip',2),m('b81d0e47','Update index.html',26),m('9c2e5a10','Initial commit',120)])}
  if(p.startsWith('/user/starred'))return Promise.reject(new Error('Not Found'));
  return Promise.resolve(null);
}
async function gh(p,o={}){
  if(S.demo)return demoApi(p,o);
  const r=await fetch(API+p,{...o,headers:{Authorization:'Bearer '+S.tok,Accept:'application/vnd.github+json','Content-Type':'application/json',...(o.headers||{})}});
  if(!r.ok){let m='Error '+r.status;try{m=(await r.json()).message||m}catch(e){}throw new Error(m)}
  return r.status===204?null:r.json();
}
async function getRaw(path){
  if(S.demo)return new TextEncoder().encode('<h1>Demo file</h1>\n');
  const r=await fetch(`${API}/repos/${R()}/contents/${enc(path)}?ref=${encodeURIComponent(S.branch)}`,{headers:{Authorization:'Bearer '+S.tok,Accept:'application/vnd.github.raw+json'}});
  if(!r.ok)throw new Error('Could not read the file');
  return new Uint8Array(await r.arrayBuffer());
}
async function putFile(full,br,path,u8,msg){
  const url=`/repos/${full}/contents/${enc(path)}`,body={message:msg,content:b64(u8),branch:br};
  try{await gh(url,{method:'PUT',body:JSON.stringify(body)})}
  catch(e){const c=await gh(url+'?ref='+encodeURIComponent(br));body.sha=c.sha;await gh(url,{method:'PUT',body:JSON.stringify(body)})}
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const UP={items:[],busy:false,cancel:false,full:'',br:'',msg:''};
const UT={wait:'Waiting',up:'Uploading…',ok:'Uploaded · waiting for commit',done:'Done'},UI={wait:'',up:'',ok:IC('upload',16),done:IC('check',16),err:IC('x',16)};
function upBuild(){$('#ulist').innerHTML=UP.items.map((x,i)=>{x.i=i;return `<div class="ur ${x.st}" id="u${i}"><span class="ic" style="font-size:20px">${ico(x.p)}</span><div class="g"><b>${esc(x.p)}</b><small>${x.size?kb(x.size)+' · ':''}<span>${UT[x.st]||esc(x.err)}</span></small></div><span class="us">${UI[x.st]}</span></div>`}).join('');upHead()}
function upSet(x){const r=$('#u'+x.i);if(r){r.className='ur '+x.st;r.querySelector('small span').textContent=x.st==='err'?x.err:UT[x.st];r.querySelector('.us').innerHTML=UI[x.st];if(x.st==='up')r.scrollIntoView({block:'nearest'})}upHead()}
function upHead(){
  const it=UP.items,n=it.length,d=it.filter(x=>x.st==='done').length,e=it.filter(x=>x.st==='err').length;
  const w={wait:0,up:.4,ok:.9,done:1,err:1};
  const pc=Math.round(n?it.reduce((a,x)=>a+w[x.st],0)/n*100:0),cu=it.find(x=>x.st==='up');$('#ub').style.width=pc+'%';$('#uring').style.setProperty('--p',pc);$('#upc').textContent=pc+'%';$('#ucur').textContent=UP.busy&&cu?cu.p:'';$('#upl').classList.toggle('all',!UP.busy&&!e);
  $('#un2').textContent=`${d} of ${n} done`+(e?` · ${e} failed`:'');
  $('#ut').textContent=UP.busy?(UP.status||'Uploading…'):e?`${d} uploaded, ${e} failed`:`All ${n} file${n>1?'s':''} uploaded`;
  $('#uact').innerHTML=UP.busy?'<button type="button" class="pill out sm" id="ucx">Cancel</button>':(e?'<button type="button" class="pill sm" id="urt">Retry failed</button>':'')+'<button type="button" class="pill out sm" id="ucl">Close</button>';
  const c=$('#ucx');if(c)c.onclick=()=>{UP.cancel=true;c.disabled=true;c.textContent='Cancelling…'};
  const r=$('#urt');if(r)r.onclick=()=>uploadRun(UP.items.filter(x=>x.st==='err'));
  const l=$('#ucl');if(l)l.onclick=()=>$('#upl').classList.remove('open');
}
async function uploadMany(list,full,br,msg){
  UP.items=list.map(f=>({p:f.p,size:f.size||0,read:f.read,st:'wait',err:''}));UP.full=full;UP.br=br;UP.msg=msg;
  $('#upl').classList.add('open');
  await uploadRun(UP.items);
}
async function uploadRun(items){
  const {full,br}=UP;let head=null,baseTree=null;
  UP.busy=true;UP.cancel=false;UP.status='Uploading…';
  items.forEach(x=>{x.st='wait';x.err=''});upBuild();
  try{
    if(!S.demo)try{head=(await gh(`/repos/${full}/git/ref/heads/${enc(br)}`)).object.sha;baseTree=(await gh(`/repos/${full}/git/commits/${head}`)).tree.sha}catch(x){}
    const q=items.slice(),fast=!!head||S.demo;
    const worker=async()=>{for(let x;!UP.cancel&&(x=q.shift());){
      x.st='up';upSet(x);
      try{
        if(S.demo){await sleep(300+Math.random()*500)}
        else if(!head){await putFile(full,br,x.p,await x.read(),'Add '+x.p);x.st='done';upSet(x);continue}
        else x.sha=(await gh(`/repos/${full}/git/blobs`,{method:'POST',body:JSON.stringify({content:b64(await x.read()),encoding:'base64'})})).sha;
        x.st='ok';
      }catch(e){x.st='err';x.err=e.message}
      upSet(x);
    }};
    await Promise.all(Array.from({length:fast?4:1},worker));
    q.forEach(x=>{x.st='err';x.err='Cancelled';upSet(x)});
    const ok=items.filter(x=>x.st==='ok');
    if(ok.length){
      UP.status='Creating commit…';upHead();
      const m=UP.msg||(ok.length===1?'Upload '+ok[0].p:'Upload '+ok.length+' files');
      try{
        if(!S.demo)for(let t=0;;t++){
          try{
            const tr=await gh(`/repos/${full}/git/trees`,{method:'POST',body:JSON.stringify({base_tree:baseTree,tree:ok.map(x=>({path:x.p,mode:'100644',type:'blob',sha:x.sha}))})});
            const c=await gh(`/repos/${full}/git/commits`,{method:'POST',body:JSON.stringify({message:m,tree:tr.sha,parents:[head]})});
            await gh(`/repos/${full}/git/refs/heads/${enc(br)}`,{method:'PATCH',body:JSON.stringify({sha:c.sha})});break;
          }catch(e){if(t>=2)throw e;head=(await gh(`/repos/${full}/git/ref/heads/${enc(br)}`)).object.sha;baseTree=(await gh(`/repos/${full}/git/commits/${head}`)).tree.sha}
        }
        ok.forEach(x=>{x.st='done';upSet(x)});
      }catch(e){ok.forEach(x=>{x.st='err';x.err='Commit failed: '+e.message;upSet(x)})}
    }
  }catch(e){items.forEach(x=>{if(x.st!=='done'){x.st='err';x.err=e.message;upSet(x)}})}
  UP.busy=false;upHead();
  if(S.repo&&S.repo.full_name===full&&S.branch===br){try{await loadDir();render()}catch(e){}}
}
async function zipUpload(file,full,br,base){
  if(typeof JSZip==='undefined')throw new Error('ZIP library didn’t load. Check your connection.');
  const z=await JSZip.loadAsync(file);
  const ents=Object.values(z.files).filter(e=>!e.dir&&!e.name.startsWith('__MACOSX')&&!e.name.endsWith('.DS_Store'));
  if(!ents.length)throw new Error('The ZIP has no files');
  const strip=new Set(ents.map(e=>e.name.split('/')[0])).size===1&&ents.every(e=>e.name.includes('/'));
  await uploadMany(ents.map(e=>({p:join(base,strip?e.name.split('/').slice(1).join('/'):e.name),size:e._data&&e._data.uncompressedSize||0,read:()=>e.async('uint8array')})),full,br,'Upload '+file.name);
}
async function run(fn){try{await fn()}catch(e){toast(e.message,1)}}
function modal(title,body,ok,fn,danger){
  const d=$('#dlg');d.className='';d.style.cssText='';d.onclick=null;
  d.innerHTML=`<form method="dialog"><h3>${esc(title)}</h3><div>${body}</div><div class="row"><button type="button" class="pill out sm" onclick="this.closest('dialog').close()">Cancel</button>${ok?`<button id="mok" class="pill sm ${danger?'bad':''}">${esc(ok)}</button>`:''}</div></form>`;
  d.showModal();
  if(ok)$('#mok').onclick=async e=>{e.preventDefault();const b=e.target;b.disabled=true;try{await fn();d.close()}catch(x){toast(x.message,1);b.disabled=false}};
}

/* data */
async function loadRepos(){
  let all=[];
  for(let p=1;p<=10;p++){
    const r=await gh(`/user/repos?per_page=100&page=${p}&sort=updated&affiliation=owner,collaborator,organization_member`);
    all=all.concat(r);if(r.length<100)break;
  }
  S.repos=all;
}
async function loadBranches(){S.branches=await gh(`/repos/${R()}/branches?per_page=100`)}
async function loadDir(){
  try{
    const r=await gh(`/repos/${R()}/contents/${enc(S.path)}?ref=${encodeURIComponent(S.branch)}`);
    S.items=Array.isArray(r)?r.sort((a,b)=>(a.type==='dir'?0:1)-(b.type==='dir'?0:1)||a.name.localeCompare(b.name)):[];
  }catch(e){if(/empty|not found/i.test(e.message))S.items=[];else throw e}
}
async function loadCommits(){
  const c=await gh(`/repos/${R()}/commits?sha=${encodeURIComponent(S.branch)}&per_page=30&page=${S.cpage}`);
  S.commits=S.commits.concat(c);
}

/* views */
const I=(d,s=20,f)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${f||'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const GH=s=>`<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
const P={user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2m-4 4 3 3m-6-1 2 2"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.4 0-10-7-10-7a18 18 0 0 1 4.1-4.9M9.9 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',login:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5m5 5H3"/>'};
P.menu='<path d="M4 6h16M4 12h16M4 18h16"/>';P.x='<path d="M18 6 6 18M6 6l12 12"/>';P.ext='<path d="M7 17 17 7M8 7h9v9"/>';
const V=p=>'<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">'+p+'</svg>';
const TT='M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';
const SOC=[
{n:'WhatsApp Channel',s:'Join for updates',u:'https://whatsapp.com/channel/0029Vb8Hsxs72WU1Dx57eu1q',c:'#25D366',v:V('<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>')},
{n:'YouTube',s:'@amantechzone5911',u:'https://www.youtube.com/@amantechzone5911',c:'#FF0000',v:V('<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>')},
{n:'Telegram',s:'@amaantechzone',u:'https://t.me/amaantechzone',c:'#26A5E4',v:V('<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>')},
{n:'TikTok',s:'@amanullah.736',u:'https://www.tiktok.com/@amanullah.736',c:'#010101',v:V('<path fill="#25F4EE" transform="translate(-.7 -.7)" d="'+TT+'"/><path fill="#FE2C55" transform="translate(.7 .7)" d="'+TT+'"/><path fill="#fff" d="'+TT+'"/>')},
{n:'Aman Toolkit',s:'aman-tools46.vercel.app',u:'https://aman-tools46.vercel.app',c:'linear-gradient(135deg,#ff3b4a,#9b0015)',v:I('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7M17.5 14v7"/>',26)}
];
const PORT={n:'My Portfolio',s:'AMANULLAH-DEV.vercel.app',u:'https://AMANULLAH-DEV.vercel.app',c:'linear-gradient(135deg,#a855f7,#22d3ee)',v:IC('globe',24)};
const sl=x=>`<a class="sl" href="${x.u}" target="_blank" rel="noopener"><span class="si" style="background:${x.c}">${x.v}</span><span class="st"><b>${x.n}</b><small>${x.s}</small></span>${I(P.ext,18)}</a>`;
$('#side').innerHTML=`<div class="sh"><div class="sph">A<img decoding="async" src="images/aman.jpg" alt="" onerror="this.remove()"></div><div><b>AMAN ULLAH</b><small>Bot &amp; Web Developer</small></div><button type="button" id="sx" aria-label="Close menu">${I(P.x,20)}</button></div><div class="slb">Connect with me</div>${sl(PORT).replace('class="sl"','class="sl feat"')}<div class="sd"></div>${SOC.slice(0,4).map(sl).join('')}<div class="sd"></div>${sl(SOC[4])}<div class="sf">GitHub Manager by AMAN ULLAH</div>`;
const side=$('#side'),scrim=$('#scrim');side.inert=true;
let lastF=null,tx=null;
function openSide(){lastF=document.activeElement;side.inert=false;$('#app').inert=true;side.classList.add('open');scrim.classList.add('open');document.body.style.overflow='hidden';$('#sx').focus()}
function closeSide(){side.classList.remove('open');scrim.classList.remove('open');side.inert=true;$('#app').inert=false;document.body.style.overflow='';if(lastF&&lastF.focus)lastF.focus()}
side.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
side.addEventListener('touchend',e=>{if(tx!==null&&e.changedTouches[0].clientX-tx>70)closeSide();tx=null},{passive:true});
scrim.onclick=closeSide;$('#sx').onclick=closeSide;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&side.classList.contains('open'))closeSide()});
function tgEye(b){const i=$('#tk'),h=i.type==='password';i.type=h?'text':'password';b.innerHTML=I(h?P.eyeoff:P.eye,22);b.setAttribute('aria-label',h?'Hide token':'Show token')}
function loginHTML(){
  return `<div class="dots"></div><div class="lg"><div class="lt1"><div class="sa">${I(P.shield,28)}<div>Secure Access<small>Trusted &amp; Reliable</small></div></div><button type="button" class="ib" data-a="menu" aria-label="Open menu"><span class="hb"><i></i><i></i><i></i></span></button></div>
  <div class="lh"><div class="ring">${GH(46)}<img class="me" src="images/logo.png" alt="Aman Ullah" onerror="this.remove()"></div><h1 class="tt">GitHub <b>Manager</b></h1><div class="tg">Sign in • Manage • Deploy</div></div>
  <div class="lw"><form id="lf"><div class="lhd"><div class="lti">${GH(40)}</div><div><h2>GitHub Manager</h2><p>Sign in with a <b>personal access token</b>.</p></div></div>
  <div class="lf1"><label class="lb" for="un">${I(P.user,18)}GitHub username</label><div class="fi">${I(P.user,22)}<input id="un" autocomplete="username" autocapitalize="none" placeholder="octocat" required></div></div>
  <div class="lf1"><label class="lb" for="tk">${I(P.key,18)}Token</label><div class="fi">${I(P.lock,22)}<input id="tk" type="password" autocomplete="off" placeholder="ghp_… or github_pat_…" required><button type="button" class="eye" onclick="tgEye(this)" aria-label="Show token">${I(P.eye,22)}</button></div></div>
  <label class="chk ck"><input type="checkbox" class="cb" id="rm" checked> Keep me signed in on this device <span class="hq" title="Saves the token in this browser only">?</span></label>
  <button class="pill go">${I(P.login,24)}Sign in</button></form>
  <div class="ln">${GH(26)}</div>
  <p class="lnote">${I(P.info,20)}<span>Create one at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener">github.com/settings/tokens</a> with the <b class="rp">repo</b> scope (add <b>delete_repo</b> to delete repositories). It stays in this browser and is only sent to <a href="https://api.github.com" target="_blank" rel="noopener">api.github.com</a>.</span></p></div>
  <div class="pw"><span class="pa"><img src="images/logo.png" alt="" onerror="this.parentNode.textContent='A'"></span><span class="pt"><small>Designed &amp; built by</small><b>AMAN ULLAH</b></span><span class="hr">${I('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',18,'currentColor')}</span></div></div>`;
}
function loginHTMLold(){
  return `<div class="hero"><div class="top"><h1>GitHub Manager</h1><button class="ib" data-a="theme" aria-label="Toggle theme">${IC('sun',19)}</button></div><p style="margin:0">Sign in with a personal access token.</p></div>
  <div class="pad"><form id="lf"><label>GitHub username<input id="un" autocomplete="username" autocapitalize="none" placeholder="octocat" required></label>
  <label>Token<input id="tk" type="password" autocomplete="off" placeholder="ghp_… or github_pat_…" required></label>
  <label class="chk"><input type="checkbox" id="rm" checked> Keep me signed in on this device</label>
  <button class="pill" style="width:100%">Sign in</button>
  <button type="button" class="pill out" style="width:100%;margin-top:10px" data-a="demo">${IC('eye',18)} Preview the app (no login)</button></form>
  <p class="note">Create one at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" style="color:var(--pu2)">github.com/settings/tokens</a> with the <b>repo</b> scope (add <b>delete_repo</b> to delete repositories). It stays in this browser and is only sent to api.github.com.</p></div>`;
}
function listHTML(){
  const q=S.q.toLowerCase();
  const l=S.repos.filter(r=>r.full_name.toLowerCase().includes(q)&&(S.f==='all'||(S.f==='private')===r.private)).sort((a,b)=>S.sort==='name'?a.name.localeCompare(b.name):S.sort==='stars'?b.stargazers_count-a.stargazers_count:new Date(b.updated_at)-new Date(a.updated_at));
  return l.map(r=>`<button class="rc" data-a="open" data-n="${esc(r.full_name)}" style="--h:${(r.name.charCodeAt(0)*47+r.name.length*23)%360}"><div class="lt" style="--h:${(r.name.charCodeAt(0)*47+r.name.length*23)%360}">${esc(r.name[0].toUpperCase())}</div><div class="b"><div class="h"><b>${esc(r.name)}</b><span class="bd ${r.private?'pv':'pb'}">${r.private?IC('lock',12)+' Private':IC('globe',12)+' Public'}</span></div><div class="d">${esc(r.description||'No description')}</div><div class="m">${r.language?`<span class="mi lang"><i class="dot" style="background:${LC[r.language]||'#8b5cf6'}"></i>${esc(r.language)}</span>`:''}<span class="mi s">${IC('star',13)} ${r.stargazers_count}</span><span class="mi">${IC('fork',13)} ${r.forks_count}</span><span class="mi">${IC('branch',13)} ${esc(r.default_branch)}</span><span class="mi">${IC('clock',13)} ${ago(r.updated_at)}</span></div></div></button>`).join('')||'<p class="empty">No repositories match.</p>';
}
function homeHTML(){
  const u=S.user;
  return `<div class="stk"><div class="hero"><div class="top"><h1>GitHub Manager</h1><button class="ib" data-a="menu" aria-label="Open menu"><span class="hb"><i></i><i></i><i></i></span></button></div>
  <div class="prof"><img src="${esc(u.avatar_url)}" alt=""><div class="n"><b>${esc(u.name||u.login)}</b><span>@${esc(u.login)}</span></div><button class="pill wh" data-a="logout">${IC('logout',15)} Logout</button></div>
  <div class="cnt">${IC('folder',14)} ${S.repos.length} repositories</div>
  <div class="grid2"><button class="pill wh" data-a="newrepo">${IC('plus',18)} New Repo</button><button class="pill wh" data-a="zipnew">${IC('upload',16)} Upload ZIP</button></div></div></div>
  <div class="pad"><button class="pill" style="width:100%;margin-top:14px" data-a="gsearch">${IC('globe',16)} Search all of GitHub ${IC('chev',16)}</button><input class="srch" id="q" placeholder="Search repositories…" value="${esc(S.q)}">
  <div class="chips">${[['all','All'],['public',IC('globe',14)+' Public'],['private',IC('lock',14)+' Private']].map(c=>`<button class="chip ${S.f===c[0]?'on':''}" data-a="flt" data-f="${c[0]}">${c[1]}</button>`).join('')}</div>
  <div id="list">${listHTML()}</div></div>
  <div class="foot"><button class="pill out" data-a="refresh">${IC('refresh',18)} Refresh repositories</button></div>`;
}
function filesHTML(){
  if(S.sel&&S.selKey!==selKey())S.sel=null;
  const parts=S.path?S.path.split('/'):[];let acc='';
  const rows=S.items.map((i,n)=>`<button class="fr${i.type==='dir'?' d':''}${S.sel&&S.sel.has(i.path)?' sel':''}" style="--n:${Math.min(n,12)}" data-a="${S.sel?'tsel':i.type==='dir'?'cd':'ofile'}" data-p="${esc(i.path)}">${S.sel?'<span class="cb"></span>':''}<span class="ic">${i.type==='dir'?ico('.dir'):ico(i.name)}</span><div class="g"><b>${esc(i.name)}</b><span class="mt" data-p="${esc(i.path)}">Updated …</span></div>${i.type==='dir'?'<span class="chv">›</span>':`<span class="sz">${kb(i.size)}</span>`}</button>`).join('');
  const crumbs=`<button data-a="cd" data-p="" style="color:var(--pu2)">${esc(S.repo.name)}</button>`+parts.map(p=>{acc=join(acc,p);return ` / <button data-a="cd" data-p="${esc(acc)}" style="color:var(--pu2)">${esc(p)}</button>`}).join('');
  return `<div class="sec"><span>${IC('folderopen',16)} ${crumbs}</span><button data-a="commits">${IC('clock',15)} Commits</button></div><div class="fl">${rows||'<p class="empty">This folder is empty.</p>'}</div>${S.sel?`<div style="height:76px"></div><div class="sbar"><b id="sc">${S.sel.size} selected</b><button class="pill out" data-a="selall">Select all</button><button class="pill" id="sd" style="background:var(--bad)" data-a="delsel"${S.sel.size?'':' disabled'}>${IC('trash',16)} Delete</button></div>`:''}`;
}
function commitsHTML(){
  const rows=S.commits.map(c=>`<div class="fr"><div class="g"><b>${esc((c.commit.message||'').split('\n')[0])}</b><span>${esc(c.commit.author&&c.commit.author.name||'Unknown')} · ${esc(fmt(c.commit.author&&c.commit.author.date))} · ${esc(c.sha.slice(0,7))}</span></div></div>`).join('');
  return `<div class="sec"><span>${IC('clock',15)} Commits on ${esc(S.branch)}</span><button data-a="commits">Files</button></div><div class="fl">${rows||'<p class="empty">No commits yet.</p>'}</div>${S.commits.length&&S.commits.length%30===0?'<div class="act"><button class="pill out" data-a="more">Load more</button></div>':''}`;
}
function fileHTML(){
  const f=S.file,t=f.text!=null,svg=/\.svg$/i.test(f.name),p=esc(f.path);
  const body=f.url?`<div class="fl" style="padding:12px;text-align:center"><img src="${f.url}" alt="${esc(f.name)}" style="max-width:100%;max-height:60vh;border-radius:10px"></div>`:t?`<pre class="code">${hl(f.text.slice(0,300000),f.name.split('.').pop()).split('\n').map(l=>`<span>${l||' '}</span>`).join('')}</pre>${f.text.length>300000?'<p class="note" style="text-align:center">Showing the first 300,000 characters.</p>':''}`:'<p class="empty" style="margin:12px">This is a binary file and can’t be previewed.</p>';
  return `<div class="fh"><button class="fb" data-a="fback" aria-label="Back">${IC('back',20)}</button><span class="ft">${f.url?ico('.png'):ico(f.name)}</span><div><b>${esc(f.name)}</b><small>${esc(f.path)} • ${kb(f.size)}</small></div></div>
  <div class="sec"><span></span><button data-a="commits">${IC('clock',15)} Commits</button></div>
  <div class="act fa">${t?'<button class="pill out" data-a="copyf">⧉ Copy</button>':f.url?`<a class="pill out" href="${f.url}" download="${esc(f.name)}">${IC('download',16)} Download</a>`:''}${t||svg?`<button class="pill" data-a="edit" data-p="${p}">${IC('edit',16)} Edit</button>`:''}<button class="pill out" style="color:var(--bad);border-color:var(--bad)" data-a="delfile" data-p="${p}">${IC('trash',16)} Delete</button></div>${body}`;
}
function repoHTML(){
  if(S.view==='edit'&&S.ed)return editHTML();
  if(S.view==='file'&&S.file)return fileHTML();
  const r=S.repo;
  return `<div class="card"><div class="rh"><button class="back" data-a="back" aria-label="Back">${IC('back',20)}</button><img src="${esc(r.owner.avatar_url)}" alt=""><h2>${esc(r.name)}<br><span class="note">@${esc(r.owner.login)}</span></h2><span class="bd ${r.private?'pv':'pb'}">${r.private?IC('lock',12)+' Private':IC('globe',12)+' Public'}</span><button class="ib" data-a="menu" aria-label="Open menu"><span class="hb"><i></i><i></i><i></i></span></button></div>
  <p class="note" style="font-size:16px">${esc(r.description||'No description.')}</p>
  <div class="stats"><span>${IC('star',14)} ${r.stargazers_count}</span><span>${IC('fork',14)} ${r.forks_count}</span><span>${IC('branch',14)} ${esc(r.default_branch)}</span></div></div>
  <div class="act g4"><button class="pill" data-a="zipin">${IC('upload',16)} ZIP</button><button class="pill" data-a="newfile">${IC('plus',18)} New File</button><button class="pill" data-a="upload">${IC('upload',16)} Upload File</button><button class="pill" data-a="upfolder">${IC('folder',16)} Folder</button></div>
  <div class="act g4"><button class="pill out" data-a="refresh">${IC('refresh',18)} Refresh</button><button class="pill" data-a="star">${S.starred?IC('star',16,'currentColor')+' Starred':IC('star',16)+' Star'}</button><button class="pill out" data-a="fork">${IC('fork',16)} Fork</button><button class="pill" data-a="dlzip">${IC('download',16)} ZIP</button></div>
  <div class="act g4"><button class="pill wh" data-a="copy">${IC('link',16)} Copy Link</button><button class="pill out" data-a="rels">${IC('tag',16)} Releases</button><button class="pill out" data-a="settings">${IC('gear',16)} Settings</button><button class="pill out" data-a="select">${S.sel?IC('x',16)+' Cancel':IC('checksq',16)+' Select'}</button></div>
  <div class="brow"><span class="bl">${IC('branch',15)} Branch</span><div class="bchips">${S.branches.map(b=>`<button class="chip ${b.name===S.branch?'on':''}" data-a="usebr" data-n="${esc(b.name)}">${IC('branch',14)} ${esc(b.name)}</button>`).join('')}<button class="chip" data-a="newbr">${IC('plus',14)} Branch</button>${S.branch!==r.default_branch?'<button class="chip" style="color:var(--bad)" data-a="delbr">Delete this branch</button>':''}</div></div>
  ${S.view==='files'?filesHTML():commitsHTML()}
  <div class="act" style="margin-top:14px"><button class="pill out" style="color:var(--bad);border-color:var(--bad)" data-a="delrepo">Delete repository</button></div>`;
}
function render(){
  const a=$('#app'),k=!S.user?'l':S.repo?'r'+S.repo.full_name+S.view:'h';
  a.innerHTML=!S.user?loginHTML():S.repo?repoHTML():homeHTML();
  if(render.k!==k){a.classList.remove('fx');void a.offsetWidth;a.classList.add('fx');scrollTo(0,0);render.k=k}
  const t=document.documentElement.dataset.t==='light'?IC('moon',19):IC('sun',19);
  document.querySelectorAll('[data-a=theme]').forEach(b=>{if(b.classList.contains('tmode')){const L=document.documentElement.dataset.t==='light';b.innerHTML=I(L?P.sun:P.moon,18)+(L?'Light Mode':'Dark Mode')}else b.innerHTML=t});
  const so=$('#sort');if(so)so.value=S.sort;
  if(S.repo&&S.view==='files')dates();
  if(S.view==='edit'&&S.ed)edInit();
  document.querySelectorAll('.code,.ed').forEach(bindPinch);
  try{hsync()}catch(e){}
}

const selKey=()=>R()+'@'+S.branch+':'+S.path;
function selPaint(){document.querySelectorAll('.fr[data-a="tsel"]').forEach(b=>b.classList.toggle('sel',S.sel.has(b.dataset.p)));$('#sc').textContent=S.sel.size+' selected';$('#sd').disabled=!S.sel.size}
/* dates */
const mk=p=>R()+'@'+S.branch+':'+p;
function paintDates(){document.querySelectorAll('.mt').forEach(e=>{const d=S.mt[mk(e.dataset.p)];e.textContent=d===undefined?'Updated …':d?'Updated '+ago(d):''})}
async function dates(){
  paintDates();const key=R()+S.branch+S.path,q=S.items.filter(i=>!(mk(i.path) in S.mt));dates.k=key;
  const w=async()=>{for(let i;dates.k===key&&(i=q.shift());){let v='';try{const c=await gh(`/repos/${R()}/commits?sha=${encodeURIComponent(S.branch)}&path=${enc(i.path)}&per_page=1`);v=c&&c[0]?c[0].commit.author.date:''}catch(e){}S.mt[mk(i.path)]=v;paintDates()}};
  await Promise.all([w(),w(),w(),w()]);
}
/* actions */
async function openRepo(n){
  S.repo=S.repos.find(r=>r.full_name===n);S.branch=S.repo.default_branch;S.path='';S.view='files';S.commits=[];S.cpage=1;S.starred=false;
  $('#app').innerHTML='<div class="pad"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>';
  try{await loadBranches();await loadDir()}catch(e){S.repo=null;render();throw e}
  try{await gh('/user/starred/'+R());S.starred=true}catch(e){}
  render();
}
const KW=new Set('abstract async await break case catch class const continue debugger default def del delete do elif else enum except export extends false finally for from function global if implements import in instanceof interface is lambda let new nil null None not of or package pass private protected public raise return self static super switch this throw true True try type typeof undefined var void while with yield fn func go impl mut pub use mod struct trait match echo fi then done'.split(' '));
const sp=(c,t)=>t.split('\n').map(x=>`<span class="tk-${c}">${esc(x)}</span>`).join('\n');
function mkTok(code,re,fn){let o='',i=0,m;re.lastIndex=0;while((m=re.exec(code))){if(!m[0]){re.lastIndex++;continue}o+=esc(code.slice(i,m.index))+fn(m);i=m.index+m[0].length}return o+esc(code.slice(i))}
function hl(code,ext){
  ext=(ext||'').toLowerCase();
  if(/^(html?|xml|svg|vue)$/.test(ext))return mkTok(code,/(<!--[\s\S]*?-->)|(<\/?[A-Za-z][^>]*>)/g,m=>m[1]?sp('c',m[0]):mkTok(m[0],/^(<\/?[\w:-]+)|("[^"]*"|'[^']*')|([\w:@.-]+)(?==)|(\/?>$)/g,k=>k[1]?sp('t',k[0]):k[2]?sp('s',k[0]):k[3]?sp('a',k[0]):sp('t',k[0])));
  if(ext==='css'||ext==='scss')return mkTok(code,/(\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|(@[\w-]+)|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|em|rem|%|vh|vw|s|ms|deg)?)|([\w-]+)(?=\s*:)|([.#][\w-]+)/g,m=>sp(m[1]?'c':m[2]?'s':m[3]?'k':m[4]||m[5]?'n':m[6]?'a':'t',m[0]));
  if(!/^(js|mjs|cjs|jsx|ts|tsx|json|py|rb|java|c|h|cpp|cs|go|rs|php|sh|bash|yml|yaml|toml|sql|kt|swift|dart|lua|env)$/.test(ext))return esc(code);
  const hash=/^(py|rb|sh|bash|yml|yaml|toml|env)$/.test(ext),cm=hash?'#[^\\n]*':'\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/';
  const re=new RegExp('('+cm+')|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`)|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b[A-Za-z_$][\\w$]*\\b)(?=\\()|(\\b[A-Za-z_$][\\w$]*\\b)','g');
  return mkTok(code,re,m=>{
    if(m[1])return sp('c',m[0]);
    if(m[2])return sp(ext==='json'&&/^\s*:/.test(code.substr(m.index+m[0].length,4))?'a':'s',m[0]);
    if(m[3])return sp('n',m[0]);
    if(m[4])return sp(KW.has(m[4])?'k':'f',m[0]);
    return KW.has(m[5])?sp('k',m[0]):esc(m[0]);
  });
}
function bindPinch(el){
  if(el._p)return;el._p=1;let d0=0,z0=13;
  const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
  el.addEventListener('touchstart',e=>{if(e.touches.length===2){d0=dist(e.touches);z0=parseFloat(getComputedStyle(el.querySelector('#et')||el).fontSize)||13}},{passive:true});
  el.addEventListener('touchmove',e=>{if(e.touches.length===2&&d0){e.preventDefault();const z=Math.min(28,Math.max(8,z0*dist(e.touches)/d0));document.documentElement.style.setProperty('--cz',z.toFixed(1)+'px')}},{passive:false});
  el.addEventListener('touchend',e=>{if(e.touches.length<2)d0=0},{passive:true});
}
function lhOf(el){return parseFloat(getComputedStyle(el).lineHeight)||21}
function selTo(a,b){const et=$('#et');et.focus({preventScroll:true});et.setSelectionRange(a,b);const ln=et.value.slice(0,a).split('\n').length-1;et.scrollTop=Math.max(0,ln*lhOf(et)-et.clientHeight/3);et.dispatchEvent(new Event('scroll'))}
function fList(){const q=$('#ff').value.toLowerCase(),t=S.ed.text.toLowerCase(),r=[];if(q)for(let i=t.indexOf(q);i>=0;i=t.indexOf(q,i+q.length))r.push(i);return r}
function fCount(cur){const n=fList().length;$('#fc').textContent=cur?cur+'/'+n:n+' found'}
function fGo(d){
  const m=fList(),et=$('#et'),L=$('#ff').value.length;if(!m.length)return fCount();
  let i=-1;if(d>0){i=m.findIndex(x=>x>=et.selectionEnd);if(i<0)i=0}else{m.forEach((x,k)=>{if(x<et.selectionStart)i=k});if(i<0)i=m.length-1}
  selTo(m[i],m[i]+L);fCount(i+1);
}
function fRep(){
  const et=$('#et'),q=$('#ff').value;if(!q)return;
  if(et.value.slice(et.selectionStart,et.selectionEnd).toLowerCase()===q.toLowerCase()){et.setRangeText($('#fr').value,et.selectionStart,et.selectionEnd,'end');et.dispatchEvent(new Event('input'))}
  fGo(1);
}
function fAll(){
  const q=$('#ff').value,n=fList().length;if(!q)return;if(!n)return fCount();
  const re=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),r=$('#fr').value,et=$('#et');
  et.value=et.value.replace(re,()=>r);et.dispatchEvent(new Event('input'));$('#fc').textContent=n+' replaced';
}
function jGo(){
  const n=parseInt($('#jl').value,10);if(!n||n<1)return toast('Enter a line number',1);
  const t=S.ed.text.split('\n'),k=Math.min(n,t.length);let off=0;for(let i=0;i<k-1;i++)off+=t[i].length+1;
  selTo(off,off+t[k-1].length);$('#jp').hidden=true;$('[data-a=ejump]').classList.remove('on');if(n>t.length)toast('Jumped to the last line ('+t.length+')');
}
function editHTML(){
  const e=S.ed;
  return `<div class="fh eh"><button class="fb" data-a="eback" aria-label="Back">${IC('back',20)}</button><span class="ft">${e.isNew?IC('plus',20):ico(e.name)}</span><div class="en"><b>${e.isNew?'New file':esc(e.name)}</b><small>${e.isNew?'Create in '+esc(S.path||'/'):'Editing · <span id="lc">'+e.text.split('\n').length+'</span> lines'}</small></div><div class="eb"><button data-a="efind" aria-label="Find and replace" title="Find &amp; replace">${IC('search',20)}</button><button data-a="ejump" aria-label="Go to line" title="Go to line">${IC('toline',20)}</button></div></div>
  ${e.isNew?`<div class="pad" style="padding-bottom:0"><input class="srch" id="fn" placeholder="index.html or folder/page.html" value="${esc(e.fn)}"></div>`:''}
  <div class="ed"><pre class="ehl" id="ehl" aria-hidden="true"></pre><textarea id="et" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off">${esc(e.text)}</textarea></div>
  <div class="edb"><div class="fp" id="fp" hidden><label><span>Find</span><input id="ff" autocapitalize="off" autocomplete="off" placeholder="Search…"></label><label><span>Rep</span><input id="fr" autocapitalize="off" autocomplete="off" placeholder="Replace with…"></label><div class="fb3"><button data-a="fprev" aria-label="Previous">${IC('up',16)}Prev</button><button data-a="fnext" aria-label="Next">${IC('down',16)}Next</button><button data-a="frep" aria-label="Replace">${IC('swap',15)}Rep</button><button data-a="fall" aria-label="Replace all">${IC('layers',15)}All</button><span id="fc"></span><button class="xb" data-a="efind" aria-label="Close">${IC('x',18)}</button></div></div>
  <div class="fp j" id="jp" hidden><label><span>Line</span><input id="jl" type="number" inputmode="numeric" min="1" placeholder="Line number (1–${e.text.split('\n').length})"></label><button class="pill" data-a="jgo">Go</button><button class="xb" data-a="ejump" aria-label="Close">${IC('x',18)}</button></div>
  <div class="ebar"><input id="cm" value="${esc(e.msg)}" placeholder="Commit message"><button class="pill" data-a="ecommit">${IC('check',16)} Commit</button></div></div>`;
}
function edInit(){
  const e=S.ed,et=$('#et'),h=$('#ehl');if(!et)return;
  const ext=()=>(e.isNew?e.fn:e.name).split('.').pop();let q=0;
  const paint=()=>{h.innerHTML=(e.text.length<150000?hl(e.text,ext()):esc(e.text))+'\n ';h.scrollTop=et.scrollTop;h.scrollLeft=et.scrollLeft;const lc=$('#lc');if(lc)lc.textContent=e.text.split('\n').length};
  const later=()=>{cancelAnimationFrame(q);q=requestAnimationFrame(paint)};
  paint();
  et.addEventListener('input',()=>{e.text=et.value;later()});
  et.addEventListener('scroll',()=>{h.scrollTop=et.scrollTop;h.scrollLeft=et.scrollLeft});
  et.addEventListener('keydown',k=>{if(k.key==='Tab'){k.preventDefault();et.setRangeText('  ',et.selectionStart,et.selectionEnd,'end');et.dispatchEvent(new Event('input'))}});
  const fn=$('#fn');if(fn)fn.addEventListener('input',()=>{e.fn=fn.value;later()});
  $('#ff').addEventListener('input',()=>fCount());$('#ff').addEventListener('keydown',k=>{if(k.key==='Enter'){k.preventDefault();fGo(1)}});$('#jl').addEventListener('keydown',k=>{if(k.key==='Enter'){k.preventDefault();jGo()}});
}
async function editFile(p){
  let text='',name='';
  if(p){const by=await getRaw(p);try{text=new TextDecoder('utf-8',{fatal:true}).decode(by)}catch(x){return toast('This is a binary file and can’t be edited as text',1)}name=p.split('/').pop()}
  S.ed={p,isNew:!p,name,fn:'',text,orig:text,msg:p?'Update '+name:'Add file'};S.view='edit';render();
}
async function act(a,d){
  switch(a){
    case'menu':openSide();break;
    case'ghlogin':{
      let ok=false;
      try{const r=await fetch('/api/login?check=1');ok=r.ok&&(await r.json()).ok}catch(e){}
      if(!ok)throw new Error('GitHub login needs the Vercel api folder and keys. Use a token for now.');
      try{sessionStorage.setItem('ghm_keep',$('#rm').checked?'1':'0')}catch(e){}
      location.href='/api/login';break}
    case'theme':{const h=document.documentElement;h.dataset.t=h.dataset.t==='light'?'dark':'light';try{localStorage.setItem('ghm_t',h.dataset.t)}catch(e){}render();break}
    case'demo':S.demo=true;S.tok='demo';S.user={login:'octocat',name:'AMAN-HN',avatar_url:AV};S.repos=demoRepos();render();toast('Preview mode: nothing is sent to GitHub');break;
    case'logout':try{localStorage.removeItem('ghm_tok')}catch(e){}Object.assign(S,{demo:false,tok:null,user:null,repos:[],repo:null});render();break;
    case'back':S.repo=null;render();break;
    case'open':await openRepo(d.n);break;
    case'flt':S.f=d.f;render();break;
    case'refresh':if(S.repo){await loadBranches();await loadDir()}else await loadRepos();render();toast('Refreshed');break;
    case'commits':S.view=S.view==='commits'?'files':'commits';if(S.view==='commits'&&!S.commits.length){S.cpage=1;await loadCommits()}render();break;
    case'more':S.cpage++;await loadCommits();render();break;
    case'cd':S.path=d.p;await loadDir();S.view='files';render();break;
    case'ofile':{
      const it=S.items.find(i=>i.path===d.p),by=await getRaw(it.path),f={path:it.path,name:it.name,size:it.size||by.length};
      if(isImg(it.name)){const ex=it.name.split('.').pop().toLowerCase();f.url=URL.createObjectURL(new Blob([by],{type:{svg:'image/svg+xml',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',ico:'image/x-icon',bmp:'image/bmp'}[ex]||'image/png'}))}
      else try{f.text=new TextDecoder('utf-8',{fatal:true}).decode(by)}catch(e){f.bin=1}
      S.file=f;S.view='file';render();break}
    case'fback':S.view='files';S.file=null;render();break;
    case'copyf':try{await navigator.clipboard.writeText(S.file.text);toast('Copied')}catch(e){toast('Could not copy',1)}break;
    case'edit':await editFile(d.p);break;
    case'efind':{const p=$('#fp');$('#jp').hidden=true;p.hidden=!p.hidden;$('[data-a=efind]').classList.toggle('on',!p.hidden);$('[data-a=ejump]').classList.remove('on');if(!p.hidden){$('#ff').focus();fCount()}break}
    case'ejump':{const j=$('#jp');$('#fp').hidden=true;j.hidden=!j.hidden;$('[data-a=ejump]').classList.toggle('on',!j.hidden);$('[data-a=efind]').classList.remove('on');if(!j.hidden)$('#jl').focus();break}
    case'fnext':fGo(1);break;case'fprev':fGo(-1);break;case'frep':fRep();break;case'fall':fAll();break;case'jgo':jGo();break;
    case'eback':{const e=S.ed;if(e.text!==e.orig&&!confirm('Discard your changes?'))break;S.view=e.p&&S.file&&S.file.path===e.p?'file':'files';S.ed=null;render();break}
    case'ecommit':{
      const e=S.ed;let path=e.p;
      if(e.isNew){const n=(e.fn||'').trim().replace(/^\/+/,'');if(!n)throw new Error('Enter a file name');path=join(S.path,n)}
      await putFile(R(),S.branch,path,new TextEncoder().encode(e.text),$('#cm').value||'Update');
      if(S.file&&S.file.path===path&&S.file.text!=null)S.file.text=e.text;
      S.view=!e.isNew&&S.file&&S.file.path===path?'file':'files';S.ed=null;await loadDir();render();toast('Committed');break}
    case'newfile':await editFile('');break;
    case'upload':$('#up').click();break;
    case'upfolder':$('#upf').click();break;
    case'zipin':case'zipnew':S.zipMode=a;S.zipTarget=null;$('#upz').click();break;
    case'select':S.sel=S.sel?null:new Set();S.selKey=S.sel?selKey():'';render();break;
    case'tsel':S.sel.has(d.p)?S.sel.delete(d.p):S.sel.add(d.p);selPaint();break;
    case'selall':{const fs=S.items;fs.every(i=>S.sel.has(i.path))?S.sel.clear():fs.forEach(i=>S.sel.add(i.path));selPaint();break}
    case'delsel':{
      const its=S.items.filter(i=>S.sel&&S.sel.has(i.path));if(!its.length)break;const n=its.length,pl=n>1?'s':'';
      modal('Delete '+n+' item'+pl+'?',`<p class="note">These are removed in a single commit on <b>${esc(S.branch)}</b>.${its.some(i=>i.type==='dir')?' Folders are deleted with everything inside them.':''}</p><p class="note" style="word-break:break-all">${its.slice(0,6).map(i=>esc(i.name)+(i.type==='dir'?'/':'')).join(', ')}${n>6?' +'+(n-6)+' more':''}</p><label>Commit message<input id="cm" value="Delete ${n} item${pl}"></label>`,'Delete',async()=>{
        if(!S.demo){
          const msg=$('#cm').value||'Delete files',h=(await gh(`/repos/${R()}/git/ref/heads/${enc(S.branch)}`)).object.sha,bt=(await gh(`/repos/${R()}/git/commits/${h}`)).tree.sha;
          let paths=its.filter(i=>i.type!=='dir').map(i=>i.path);const ds=its.filter(i=>i.type==='dir');
          if(ds.length){const t=await gh(`/repos/${R()}/git/trees/${bt}?recursive=1`);if(t.truncated)throw new Error('Repository is too large to delete folders here');paths=[...new Set([...paths,...t.tree.filter(x=>x.type==='blob'&&ds.some(d=>x.path.startsWith(d.path+'/'))).map(x=>x.path)])]}
          if(!paths.length)throw new Error('Nothing to delete');
          const tr=await gh(`/repos/${R()}/git/trees`,{method:'POST',body:JSON.stringify({base_tree:bt,tree:paths.map(x=>({path:x,mode:'100644',type:'blob',sha:null}))})});
          const c=await gh(`/repos/${R()}/git/commits`,{method:'POST',body:JSON.stringify({message:msg,tree:tr.sha,parents:[h]})});
          await gh(`/repos/${R()}/git/refs/heads/${enc(S.branch)}`,{method:'PATCH',body:JSON.stringify({sha:c.sha})});
        }
        S.sel=null;await loadDir();render();toast(n+' item'+pl+' deleted');
      },true);break}
    case'delfile':{
      const it=S.items.find(i=>i.path===d.p);
      modal('Delete '+it.name+'?',`<p class="note">This commits a deletion to <b>${esc(S.branch)}</b>.</p><label>Commit message<input id="cm" value="Delete ${esc(it.name)}"></label>`,'Delete file',async()=>{
        await gh(`/repos/${R()}/contents/${enc(it.path)}`,{method:'DELETE',body:JSON.stringify({message:$('#cm').value||'Delete',sha:it.sha,branch:S.branch})});
        S.view='files';S.file=null;await loadDir();render();toast('Deleted');
      },1);break}
    case'newrepo':
      modal('New repository',`<label>Name<input id="rn" placeholder="my-project"></label><label>Description<input id="rd"></label><label class="chk"><input type="checkbox" id="rp"> Private</label>`,'Create repository',async()=>{
        const n=$('#rn').value.trim();if(!n)throw new Error('Enter a repository name');
        const r=await gh('/user/repos',{method:'POST',body:JSON.stringify({name:n,description:$('#rd').value,private:$('#rp').checked,auto_init:true})});
        S.repos.unshift(r);render();toast('Repository created');
      });break;
    case'delrepo':
      modal('Delete '+R()+'?',`<p class="note">This permanently deletes the repository, its files and history. Type <b>${esc(S.repo.name)}</b> to confirm.</p><input class="in" id="cf" autocomplete="off">`,'Delete repository',async()=>{
        if($('#cf').value!==S.repo.name)throw new Error('The name doesn’t match');
        await gh(`/repos/${R()}`,{method:'DELETE'});
        S.repos=S.repos.filter(r=>r!==S.repo);S.repo=null;render();toast('Repository deleted');
      },1);break;
    case'star':
      await gh('/user/starred/'+R(),{method:S.starred?'DELETE':'PUT'});
      S.starred=!S.starred;S.repo.stargazers_count+=S.starred?1:-1;render();break;
    case'fork':await gh(`/repos/${R()}/forks`,{method:'POST'});toast('Fork started. It may take a minute to appear.');break;
    case'copy':try{await navigator.clipboard.writeText(S.repo.html_url);toast('Link copied')}catch(e){toast(S.repo.html_url)}break;
    case'dlzip':{
      toast('Preparing ZIP…');
      const r=await fetch(`${API}/repos/${R()}/zipball/${encodeURIComponent(S.branch)}`,{headers:{Authorization:'Bearer '+S.tok}});
      if(!r.ok)throw new Error('Could not download the ZIP');
      await saveBlob(await r.blob(),`${S.repo.name}-${S.branch}.zip`);break}
    case'view':{
      const by=await getRaw(d.p),ext=d.p.split('.').pop().toLowerCase(),nm=d.p.split('/').pop();
      const mt={svg:'image/svg+xml',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',webp:'image/webp',ico:'image/x-icon',bmp:'image/bmp'}[ext]||'image/png';
      const u=URL.createObjectURL(new Blob([by],{type:mt}));
      modal(nm,`<div style="background:repeating-conic-gradient(var(--line) 0 25%,transparent 0 50%) 0 0/20px 20px;border-radius:14px;padding:8px;text-align:center"><img src="${u}" alt="${esc(nm)}" style="max-width:100%;max-height:60vh;border-radius:8px"></div><p class="note">${kb(by.length)}</p><a class="pill sm" href="${u}" download="${esc(nm)}">${IC('download',16)} Download</a>`,null);
      $('#dlg').addEventListener('close',()=>URL.revokeObjectURL(u),{once:true});break}
    case'gsearch':{
      modal('Search all of GitHub','<input class="in" id="gq" placeholder="Search repositories…"><div class="row" style="justify-content:flex-start"><button type="button" class="pill sm" id="gb">Search</button></div><div id="gr" class="fl" style="margin:8px 0 0;max-height:50vh;overflow:auto"></div>',null);
      const go=()=>run(async()=>{
        const q=$('#gq').value.trim();if(!q)return;
        $('#gr').innerHTML='<p class="empty">Searching…</p>';
        const r=await gh('/search/repositories?per_page=15&q='+encodeURIComponent(q));
        $('#gr').innerHTML=r.items.map(x=>`<div class="fr"><span class="ic">${IC('package',21)}</span><div class="g"><b><a href="${esc(x.html_url)}" target="_blank" rel="noopener" style="color:inherit">${esc(x.full_name)}</a></b><span>${esc(x.description||'No description')} · ${IC('star',12)} ${x.stargazers_count}</span></div><button type="button" class="pill out sm" data-a="forkx" data-n="${esc(x.full_name)}">Fork</button></div>`).join('')||'<p class="empty">No results.</p>';
      });
      $('#gb').onclick=go;$('#gq').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};break}
    case'forkx':await gh(`/repos/${d.n}/forks`,{method:'POST'});toast('Fork started. It may take a minute to appear.');break;
    case'rels':{
      const rs=await gh(`/repos/${R()}/releases?per_page=20`);
      modal('Releases',`<div class="fl" style="margin:0 0 12px;max-height:35vh;overflow:auto">${rs.map(x=>`<div class="fr"><span class="ic">${IC('tag',21)}</span><div class="g"><b>${esc(x.name||x.tag_name)}</b><span>${esc(x.tag_name)} · ${ago(x.published_at||x.created_at)}</span></div><button type="button" class="pill out sm" style="color:var(--bad);border-color:var(--bad)" data-a="delrel" data-i="${x.id}">Delete</button></div>`).join('')||'<p class="empty">No releases yet.</p>'}</div><label>Tag<input id="rt" placeholder="v1.0.0"></label><label>Title<input id="rtt"></label><label>Notes<textarea id="rb" style="min-height:90px;white-space:pre-wrap"></textarea></label>`,'Publish release',async()=>{
        const t=$('#rt').value.trim();if(!t)throw new Error('Enter a tag');
        await gh(`/repos/${R()}/releases`,{method:'POST',body:JSON.stringify({tag_name:t,name:$('#rtt').value||t,body:$('#rb').value,target_commitish:S.branch})});
        toast('Release published');
      });break}
    case'delrel':await gh(`/repos/${R()}/releases/${d.i}`,{method:'DELETE'});$('#dlg').close();toast('Release deleted');break;
    case'settings':{
      const r=S.repo;
      modal('Repository settings',`<label>Name<input id="sn" value="${esc(r.name)}"></label><label>Description<input id="sd" value="${esc(r.description||'')}"></label><label>Default branch<select class="in" id="sb">${S.branches.map(b=>`<option${b.name===r.default_branch?' selected':''}>${esc(b.name)}</option>`).join('')}</select></label><label class="chk"><input type="checkbox" id="sp"${r.private?' checked':''}> Private</label>`,'Save changes',async()=>{
        const u=await gh(`/repos/${R()}`,{method:'PATCH',body:JSON.stringify({name:$('#sn').value.trim()||r.name,description:$('#sd').value,default_branch:$('#sb').value,private:$('#sp').checked})});
        Object.assign(S.repo,u);render();toast('Settings saved');
      });break}
    case'usebr':S.branch=d.n;S.path='';S.commits=[];S.cpage=1;await loadDir();S.view='files';render();break;
    case'newbr':
      modal('New branch',`<label>Branch name<input id="bn" placeholder="feature-name"></label><p class="note">Created from ${esc(S.branch)}.</p>`,'Create branch',async()=>{
        const n=$('#bn').value.trim();if(!n)throw new Error('Enter a branch name');
        const sha=S.branches.find(b=>b.name===S.branch).commit.sha;
        await gh(`/repos/${R()}/git/refs`,{method:'POST',body:JSON.stringify({ref:'refs/heads/'+n,sha})});
        await loadBranches();S.branch=n;S.commits=[];render();toast('Branch created');
      });break;
    case'delbr':{
      const n=S.branch;
      modal('Delete branch '+n+'?','<p class="note">Commits that exist only on this branch will be lost.</p>','Delete branch',async()=>{
        await gh(`/repos/${R()}/git/refs/heads/${enc(n)}`,{method:'DELETE'});
        S.branch=S.repo.default_branch;S.path='';S.commits=[];await loadBranches();await loadDir();render();toast('Branch deleted');
      },1);break}
  }
}

/* events */
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t||t.classList.contains('busy'))return;const slow=!['menu','theme','flt','cd','back','usebr','efind','ejump','fnext','fprev','frep','fall','jgo','eback'].includes(t.dataset.a);if(slow)t.classList.add('busy');run(()=>act(t.dataset.a,t.dataset)).finally(()=>t.classList.remove('busy'))});
let rq=0;document.addEventListener('input',e=>{if(e.target.id==='q'){S.q=e.target.value;cancelAnimationFrame(rq);rq=requestAnimationFrame(()=>{$('#list').innerHTML=listHTML()})}});
document.addEventListener('change',e=>{if(e.target.id==='sort'){S.sort=e.target.value;$('#list').innerHTML=listHTML()}});
document.addEventListener('submit',e=>{
  if(e.target.id!=='lf')return;e.preventDefault();
  const t=$('#tk').value.trim(),un=$('#un').value.trim().replace(/^@/,''),keep=$('#rm').checked;
  run(async()=>{
    S.tok=t;
    try{S.user=await gh('/user')}catch(x){S.tok=null;throw x}
    if(S.user.login.toLowerCase()!==un.toLowerCase()){const o=S.user.login;S.tok=null;S.user=null;throw new Error('This token belongs to @'+o+', not @'+un)}
    try{keep?localStorage.setItem('ghm_tok',t):localStorage.removeItem('ghm_tok')}catch(x){}
    await loadRepos();render();
  });
});
const upFiles=(files,rel)=>{if(!files.length)return;if(!S.repo)return toast('Open a repository first',1);run(()=>uploadMany(files.map(f=>({p:join(S.path,rel&&f.webkitRelativePath||f.name),size:f.size,read:async()=>new Uint8Array(await f.arrayBuffer())})),R(),S.branch))};
$('#up').addEventListener('change',e=>{const f=[...e.target.files];e.target.value='';upFiles(f)});
$('#upf').addEventListener('change',e=>{const f=[...e.target.files];e.target.value='';upFiles(f,1)});
addEventListener('dragover',e=>{if(S.repo&&e.dataTransfer&&[...e.dataTransfer.types].includes('Files'))e.preventDefault()});
addEventListener('drop',e=>{if(S.repo&&e.dataTransfer&&e.dataTransfer.files.length){e.preventDefault();upFiles([...e.dataTransfer.files])}});
$('#upz').addEventListener('change',e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  if(S.zipTarget){const z=S.zipTarget;S.zipTarget=null;return run(async()=>{await zipUpload(f,z.full_name,z.default_branch,'');if(!S.demo)await openRepo(z.full_name)})}
  if(S.repo)return run(()=>zipUpload(f,R(),S.branch,S.path));
  modal('Upload ZIP as a new repository',`<label>Repository name<input id="zn" value="${esc(f.name.replace(/\.zip$/i,'').replace(/[^\w.-]+/g,'-'))}"></label><label class="chk"><input type="checkbox" id="zp"> Private</label>`,'Create and upload',async()=>{
    const n=$('#zn').value.trim();if(!n)throw new Error('Enter a repository name');
    const r=await gh('/user/repos',{method:'POST',body:JSON.stringify({name:n,private:$('#zp').checked,auto_init:true})});
    S.repos.unshift(r);$('#dlg').close();
    await zipUpload(f,r.full_name,r.default_branch,'');
    if(!S.demo)await openRepo(r.full_name);
  });
});


/* back button: har screen ek history step hai, isliye mobile back ek screen peeche jata hai (app band nahi hota) */
var hd=0,hskip=0;
function hdepth(){return hdepth0()+(document.querySelector('dialog[open]')?1:0)}
function hdepth0(){if(!S.user||!S.repo)return 0;let d=1+(S.path?S.path.split('/').filter(Boolean).length:0);if(S.view!=='files')d++;return d}
function hsync(){const d=hdepth();if(hd<d){while(hd<d)history.pushState({d:++hd},'')}else if(hd>d){const n=hd-d;hd=d;hskip=1;history.go(-n)}}
function hkeep(){hd++;history.pushState({d:hd},'')}
addEventListener('popstate',()=>{
  if(hskip){hskip=0;return}
  if(hd>0)hd--;
  const dlg=document.getElementById('dlg');
  if(dlg&&dlg.open){dlg.close();return}
  if(!S.repo)return;
  if(S.view==='edit'){const e=S.ed;if(e&&e.text!==e.orig&&!confirm('Discard your changes?')){hkeep();return}S.view=e&&e.p&&S.file&&S.file.path===e.p?'file':'files';S.ed=null;render();return}
  if(S.view==='file'){S.view='files';S.file=null;render();return}
  if(S.view==='commits'){S.view='files';render();return}
  if(S.path){S.path=S.path.split('/').slice(0,-1).join('/');run(async()=>{await loadDir();render()});return}
  S.repo=null;render();
});

/* start */
(async()=>{
  
  let t=null;try{t=localStorage.getItem('ghm_tok')}catch(e){}
  const hm=location.hash.match(/^#gh_(token|error)=(.*)$/);
  if(hm){
    history.replaceState(null,'',location.pathname+location.search);
    const v=decodeURIComponent(hm[2]);
    if(hm[1]==='token'){t=v;try{sessionStorage.getItem('ghm_keep')!=='0'?localStorage.setItem('ghm_tok',v):localStorage.removeItem('ghm_tok')}catch(e){}}
    else setTimeout(()=>toast(v||'GitHub sign-in failed',1),300);
  }
  if(t){
    S.tok=t;
    try{S.user=await gh('/user');await loadRepos()}catch(e){S.tok=null;S.user=null;toast('Saved token no longer works. Sign in again.',1)}
  }
  render();
})();

/* smooth motion: scroll reveal, ripple, progress bar, parallax */
(()=>{
const app=document.getElementById('app'),root=document.documentElement;
const bar=document.createElement('div');bar.id='spb';document.body.appendChild(bar);
let ly=0,tk=0,sq=0;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const t=e.target;io.unobserve(t);t.classList.remove('rvh');setTimeout(()=>t.classList.remove('rvt'),800)}}),{rootMargin:'0px 0px -6% 0px',threshold:.05});
function scan(){sq=0;let i=0;app.querySelectorAll('.rc,.fr,.card,.fl,.act,.sec').forEach(el=>{if(el.dataset.rv)return;el.dataset.rv=1;const r=el.getBoundingClientRect();if(r.top>innerHeight*.98){el.classList.add('rvh','rvt');io.observe(el)}else if(!el.classList.contains('rc')){el.style.setProperty('--i',Math.min(i++,10));el.classList.add('rin')}})}
new MutationObserver(()=>{if(!sq)sq=requestAnimationFrame(scan)}).observe(app,{childList:true,subtree:true});
scan();
addEventListener('scroll',()=>{if(tk)return;tk=requestAnimationFrame(()=>{tk=0;const y=scrollY,h=root.scrollHeight-innerHeight;root.style.setProperty('--sy',y);bar.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';const f=document.querySelector('.foot');if(f){if(y>ly+6&&y>120)f.classList.add('hide');else if(y<ly-6||y<120)f.classList.remove('hide')}ly=y})},{passive:true});
document.addEventListener('pointerdown',e=>{const t=e.target.closest('.pill,.chip,.rc,.fr,.ib,.back');if(!t||t.disabled)return;const r=t.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,d=document.createElement('span');d.className='rp';d.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';t.appendChild(d);setTimeout(()=>d.remove(),650)},{passive:true});
})();


Object.assign(Q,{copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'});
function fileMenu(p){
  const it=S.items.find(x=>x.path===p);if(!it)return;
  const d=$('#dlg');d.className='lpm';
  const img=isImg(it.name),svg=/\.svg$/i.test(it.name);
  const row=(a,ic,t,s,c,i)=>`<button type="button" class="lpr ${c||''}" data-lp="${a}" style="animation-delay:${i*45}ms"><span class="lpi">${IC(ic,20)}</span><span class="lpt"><b>${t}</b><small>${s}</small></span>${IC('chev',18)}</button>`;
  let i=0,rows=row('view','eye',img?'View image':'View code','Open it in the viewer','c2',i++);
  if(!img)rows+=row('copy','copy','Copy code','Copy the whole file','c1',i++);
  if(!img||svg)rows+=row('edit','edit','Edit file','Change it and commit','c3',i++);
  rows+=row('del','trash','Delete file','Commit a deletion to '+esc(S.branch),'bad',i++);
  d.innerHTML=`<i class="lph0"></i><div class="lph"><div class="lpf">${ico(it.name)}</div><div class="lpn"><b>${esc(it.name)}</b><div class="lps"><span>${IC('file',13)} ${kb(it.size)}</span><span>${IC('branch',13)} ${esc(S.branch)}</span></div></div></div><div class="lpl">${rows}<button type="button" class="pill out lpx" data-lp="x">Cancel</button></div>`;
  d.style.setProperty('--tc',(ICO[it.name.split('.').pop().toLowerCase()]||['file','#a9a6cf'])[1]);d.showModal();
  d.onclick=e=>{
    if(e.target===d){d.close();return}
    const b=e.target.closest('[data-lp]');if(!b)return;const a=b.dataset.lp;d.close();
    if(a==='view')run(()=>act('ofile',{p}));
    else if(a==='copy')run(async()=>{const by=await getRaw(p);let t;try{t=new TextDecoder('utf-8',{fatal:true}).decode(by)}catch(x){throw new Error('This is a binary file')}try{await navigator.clipboard.writeText(t);toast('Code copied')}catch(x){toast('Could not copy',1)}});
    else if(a==='edit')run(()=>editFile(p));
    else if(a==='del')run(()=>act('delfile',{p}));
  };
}
/* long press on repo card -> action menu */
function lpMenu(n){
  const r=S.repos.find(x=>x.full_name===n);if(!r)return;
  const d=$('#dlg');d.className='lpm';
  const hue=(r.name.charCodeAt(0)*47+r.name.length*23)%360;
  const row=(a,ic,t,s,c,i)=>`<button type="button" class="lpr ${c||''}" data-lp="${a}" style="animation-delay:${i*45}ms"><span class="lpi">${IC(ic,20)}</span><span class="lpt"><b>${t}</b><small>${s}</small></span>${IC('chev',18)}</button>`;
  d.innerHTML=`<i class="lph0"></i><div class="lph"><div class="lt" style="--h:${hue}">${esc(r.name[0].toUpperCase())}</div><div class="lpn"><b>${esc(r.name)}</b><span class="bd ${r.private?'pv':'pb'}">${r.private?IC('lock',12)+' Private':IC('globe',12)+' Public'}</span><div class="lps"><span>${IC('star',13)} ${r.stargazers_count}</span><span>${IC('fork',13)} ${r.forks_count}</span><span>${IC('branch',13)} ${esc(r.default_branch)}</span></div></div></div><div class="lpl">${row('vis',r.private?'globe':'lock',r.private?'Make Public':'Make Private',r.private?'Anyone can see this repo':'Only you can see this repo','c1',0)}${row('zip','upload','Upload ZIP into this repo','Extract a ZIP straight into it','c2',1)}${row('web','link','Open in browser','View it on github.com','c3',2)}${row('del','trash','Delete repo','Permanently remove it','bad',3)}<button type="button" class="pill out lpx" data-lp="x">Cancel</button></div>`;
  d.style.setProperty('--tc','hsl('+hue+' 85% 62%)');d.showModal();
  d.onclick=e=>{
    if(e.target===d){d.close();return}
    const b=e.target.closest('[data-lp]');if(!b)return;const a=b.dataset.lp;d.close();
    if(a==='vis')run(async()=>{const u=await gh(`/repos/${r.full_name}`,{method:'PATCH',body:JSON.stringify({private:!r.private})});r.private=u&&typeof u.private==='boolean'?u.private:!r.private;render();toast(r.private?'Now private':'Now public')});
    else if(a==='zip'){S.zipTarget=r;$('#upz').click()}
    else if(a==='web')window.open(r.html_url,'_blank','noopener');
    else if(a==='del')modal('Delete '+r.full_name+'?',`<p class="note">This permanently deletes the repository, its files and history. Type <b>${esc(r.name)}</b> to confirm.</p><input class="in" id="cf" autocomplete="off">`,'Delete repository',async()=>{
      if($('#cf').value!==r.name)throw new Error('The name doesn’t match');
      await gh(`/repos/${r.full_name}`,{method:'DELETE'});
      S.repos=S.repos.filter(x=>x!==r);render();toast('Repository deleted');
    },1);
  };
}
(()=>{
let t=0,sx=0,sy=0,fired=0;
const off=()=>document.querySelectorAll('.lpress').forEach(x=>x.classList.remove('lpress'));
const clr=()=>{clearTimeout(t);t=0;off()};
document.addEventListener('pointerdown',e=>{const c=e.target.closest(S.repo?'.fr[data-a=ofile]':'.rc');if(!c||(S.repo&&(S.view!=='files'||S.sel)))return;sx=e.clientX;sy=e.clientY;clr();c.classList.add('lpress');t=setTimeout(()=>{t=0;fired=Date.now();off();try{navigator.vibrate&&navigator.vibrate(20)}catch(x){}S.repo?fileMenu(c.dataset.p):lpMenu(c.dataset.n)},480)},{passive:true});
document.addEventListener('pointermove',e=>{if(t&&(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10))clr()},{passive:true});
['pointerup','pointercancel','scroll'].forEach(ev=>addEventListener(ev,()=>{if(t)clr()},{passive:true,capture:true}));
document.addEventListener('click',e=>{if(fired&&Date.now()-fired<900){fired=0;e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('contextmenu',e=>{if(e.target.closest('.rc,.fr'))e.preventDefault()});
})();

/* smooth popup close: pehle fade/slide out, phir dialog band */
(()=>{
const _close=HTMLDialogElement.prototype.close,_show=HTMLDialogElement.prototype.showModal;
function stop(d){if(d._ct){clearTimeout(d._ct);d._ct=0}if(d._off){d._off();d._off=null}d.classList.remove('closing')}
HTMLDialogElement.prototype.close=function(rv){
  const d=this;if(!d.open||d._ct)return;
  d.classList.add('closing');
  const cs=getComputedStyle(d);
  if(cs.animationName==='none'||!parseFloat(cs.animationDuration)){stop(d);return _close.call(d,rv)}
  const fin=()=>{stop(d);if(d.open)_close.call(d,rv)};
  const onEnd=e=>{if(e.target===d&&/^(dzo|sheeto)$/.test(e.animationName))fin()};
  d.addEventListener('animationend',onEnd);
  d._off=()=>d.removeEventListener('animationend',onEnd);
  d._ct=setTimeout(fin,420);
};
HTMLDialogElement.prototype.showModal=function(){
  const d=this;
  if(d._ct||d.classList.contains('closing')){
    stop(d);
    if(d.open){d.style.animation='none';void d.offsetWidth;d.style.animation='';return}
  }
  return _show.call(d);
};
document.addEventListener('cancel',e=>{const d=e.target;if(d instanceof HTMLDialogElement){e.preventDefault();d.close()}},true);
})();

/* dialogs take their own history step, so mobile back closes them first */
{const _sm=HTMLDialogElement.prototype.showModal;HTMLDialogElement.prototype.showModal=function(){const r=_sm.call(this);try{hsync()}catch(e){}return r}}
document.addEventListener('close',()=>{try{hsync()}catch(e){}},true);

/* preload small logo so popups open without a hitch */
(()=>{const i=new Image();i.src='images/aman.jpg';i.decode&&i.decode().catch(()=>{})})();
/* follow channel popup */
(()=>{
const K='amg_fc';
const get=()=>{try{return localStorage.getItem(K)}catch(e){return null}};
const set=v=>{try{localStorage.setItem(K,v)}catch(e){}};
function due(){if(window.FC_ALWAYS)return true;const v=get();if(v==='done')return false;if(v&&Date.now()-(+v)<3*864e5)return false;return true}
function show(){
  const d=$('#dlg');if(d.open||side.classList.contains('open'))return;
  d.className='fcp';d.style.cssText='';
  d.innerHTML=`<button type="button" class="fcx" data-fc="later" aria-label="Close">${IC('x',16)}</button><div class="fci"><b></b>${SOC[0].v}</div><h3>Follow our <em>WhatsApp</em> Channel</h3><p>Get new tools, source codes and updates first.</p><div class="fcm"><div class="fca">A<img decoding="async" src="images/logo-sm.png" alt="" onerror="this.remove()"></div><div class="fct"><b>AMAN ULLAH</b><small>${SOC[0].n}</small></div><span class="fcb">${IC('check',13)} Channel</span></div><div class="fck"><span>${IC('check',12)} Updates</span><span>${IC('check',12)} Tools</span><span>${IC('check',12)} Source codes</span></div><a class="pill fcg" href="${SOC[0].u}" target="_blank" rel="noopener" data-fc="go">${SOC[0].v}<span>Follow Channel</span>${IC('chev',20)}</a><button type="button" class="fcl" data-fc="later">Maybe later</button>`;
  d.showModal();
  d.onclick=e=>{
    if(e.target===d){set(String(Date.now()));d.close();return}
    const b=e.target.closest('[data-fc]');if(!b)return;
    if(b.dataset.fc==='go'){set('done');setTimeout(()=>d.close(),200)}else{set(String(Date.now()));d.close()}
  };
}
const tm=setInterval(()=>{if(!due()){clearInterval(tm);return}if(S.user&&!$('#dlg').open&&!side.classList.contains('open')){clearInterval(tm);setTimeout(()=>{if(S.user&&!$('#dlg').open&&!side.classList.contains('open'))show()},900)}},600);
})();
