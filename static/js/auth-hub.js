var kr=Object.defineProperty;var $r=(e,t)=>{for(var r in t)kr(e,r,{get:t[r],enumerable:!0})};var Cr={Stringify:1,BeforeStream:2,Stream:3},j=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Ar=/[&<>'"]/,Ae=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let s=o[n];typeof s=="object"&&t.push(...s.callbacks||[]);let a=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??a)r+=s;else{let d=[r];H(s,d),r=d[0]}}return j(r,t)},H=(e,t)=>{let r=e.search(Ar);if(r===-1){t[0]+=e;return}let o,n,s=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,n)+o,s=n+1}t[0]+=e.substring(s,n)},ze=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:Cr.Stringify,buffer:r,context:o})),r[0]};var q=Symbol("RENDERER"),te=Symbol("ERROR_HANDLER"),v=Symbol("STASH"),Te=Symbol("INTERNAL"),De=Symbol("MEMO"),re=Symbol("PERMALINK");var Ve=e=>(e[Te]=!0,e);var Ke=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:Ve(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:Ve(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[te]=s=>{throw e.pop(),s},n},me=e=>{let t=[e],r=Ke(t);return r.values=t,r.Provider=r,U.push(r),r};var U=[],ct=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new de("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>j(s,s.callbacks)):(t.pop(),j(n))};return r.values=t,r.Provider=r,r[q]=Ke(t),U.push(r),r},I=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},pe={},z="data-precedence",je=e=>e.rel==="stylesheet"&&"precedence"in e,Le=(e,t)=>e==="link"?t:oe[e].length>0;var he={};$r(he,{button:()=>Or,form:()=>Rr,input:()=>Mr,link:()=>Lr,meta:()=>_r,script:()=>Dr,style:()=>jr,title:()=>Tr});var X=e=>Array.isArray(e)?e:[e];var mt=new WeakMap,dt=(e,t,r,o)=>({buffer:n,context:s})=>{if(!n)return;let a=mt.get(s)||{};mt.set(s,a);let d=a[e]||=[],p=!1,f=oe[e],u=Le(e,o!==void 0);if(u){e:for(let[,c]of d)if(!(e==="link"&&!(c.rel==="stylesheet"&&c[z]!==void 0))){for(let h of f)if((c?.[h]??null)===r?.[h]){p=!0;break e}}}if(p?n[0]=n[0].replaceAll(t,""):u||e==="link"?d.push([t,r,o]):d.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let c;if(e==="link"||o!==void 0){let h=[];c=d.map(([y,,b],A)=>{if(b===void 0)return[y,Number.MAX_SAFE_INTEGER,A];let T=h.indexOf(b);return T===-1&&(h.push(b),T=h.length-1),[y,T,A]}).sort((y,b)=>y[1]-b[1]||y[2]-b[2]).map(([y])=>y)}else c=d.map(([h])=>h);c.forEach(h=>{n[0]=n[0].replaceAll(h,"")}),n[0]=n[0].replace(/(?=<\/head>)/,c.join(""))}},fe=(e,t,r)=>j(new M(e,r,X(t??[])).toString()),ue=(e,t,r,o)=>{if("itemProp"in r)return fe(e,t,r);let{precedence:n,blocking:s,...a}=r;n=o?n??"":void 0,o&&(a[z]=n);let d=new M(e,a,X(t||[])).toString();return d instanceof Promise?d.then(p=>j(d,[...p.callbacks||[],dt(e,p,a,n)])):j(d,[dt(e,d,a,n)])},Tr=({children:e,...t})=>{let r=_e();if(r){let o=I(r);if(o==="svg"||o==="head")return new M("title",t,X(e??[]))}return ue("title",e,t,!1)},Dr=({children:e,...t})=>{let r=_e();return["src","async"].some(o=>!t[o])||r&&I(r)==="head"?fe("script",e,t):ue("script",e,t,!1)},jr=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,ue("style",e,t,!0)):fe("style",e,t),Lr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?fe("link",e,t):ue("link",e,t,je(t)),_r=({children:e,...t})=>{let r=_e();return r&&I(r)==="head"?fe("meta",e,t):ue("meta",e,t,!1)},pt=(e,{children:t,...r})=>new M(e,r,X(t??[])),Rr=e=>(typeof e.action=="function"&&(e.action=re in e.action?e.action[re]:void 0),pt("form",e)),ft=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=re in t.formAction?t.formAction[re]:void 0),pt(e,t)),Mr=e=>ft("input",e),Or=e=>ft("button",e);var Pr=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),ne=e=>Pr.get(e)||e,ge=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var ye,_e=()=>ye,Ir=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Br=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Nr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ge=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")H(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof M?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):Ge(n,t)}}},M=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?ze(j(t[0],t.callbacks)).toString():t[0]:Ae(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let s=ye&&I(ye)==="svg"?a=>Ir(ne(a)):a=>ne(a);for(let[a,d]of Object.entries(o))if(a=s(a),a!=="children"){if(a==="style"&&typeof d=="object"){let p="";ge(d,(f,u)=>{u!=null&&(p+=`${p?";":""}${f}:${u}`)}),t[0]+=' style="',H(p,t),t[0]+='"'}else if(typeof d=="string")t[0]+=` ${a}="`,H(d,t),t[0]+='"';else if(d!=null)if(typeof d=="number"||d.isEscaped)t[0]+=` ${a}="${d}"`;else if(typeof d=="boolean"&&Nr.includes(a))d&&(t[0]+=` ${a}=""`);else if(a==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[j(d.__html)]}else if(d instanceof Promise)t[0]+=` ${a}="`,t.unshift('"',d);else if(typeof d=="function"){if(!a.startsWith("on")&&a!=="ref")throw new Error(`Invalid prop '${a}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${a}="`,H(d.toString(),t),t[0]+='"'}if(Br.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",Ge(n,t),t[0]+=`</${r}>`}},xe=class extends M{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(U.length===0)t.unshift("",n);else{let s=U.map(a=>[a,a.values.at(-1)]);t.unshift("",n.then(a=>(a instanceof M&&(a.localContexts=s),a)))}else n instanceof M?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):H(n,t)}},de=class extends M{toStringToBuffer(t){Ge(this.children,t)}};var ut=!1,Re=(e,t,r)=>{if(!ut){for(let o in pe)he[o][q]=pe[o];ut=!0}return typeof e=="function"?new xe(e,t,r):he[e]?new xe(he[e],t,r):e==="svg"||e==="head"?(ye||=ct(""),new M(e,t,[new xe(ye,{value:e},r)])):new M(e,t,r)};var ie=({children:e})=>new de("",{children:e},Array.isArray(e)?e:e?[e]:[]);function i(e,t,r){let o;if(!t||!("children"in t))o=Re(e,t,[]);else{let n=t.children;o=Array.isArray(n)?Re(e,t,n):Re(e,t,[n])}return o.key=r,o}var Se="_hp",Fr={Change:"Input",DoubleClick:"DblClick"},Hr={svg:"2000/svg",math:"1998/Math/MathML"},Z=[],qe=new WeakMap,se,wt=()=>se,V=e=>"t"in e,We={onClick:["click",!1]},ht=e=>{if(!e.startsWith("on"))return;if(We[e])return We[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return We[e]=[(Fr[r]||r).toLowerCase(),!!o]}},gt=(e,t)=>se&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,vt=e=>e==null||e===!1?null:e,Ur=(e,t)=>{"value"in t&&(e.value=vt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},zr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=ne(o);let s=ht(o);if(s){if(r?.[o]!==n&&(r&&e.removeEventListener(s[0],r[o],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let a;typeof n=="function"?a=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,a=()=>n.current=null),qe.set(e,a)}else if(o==="style"){let a=e.style;typeof n=="string"?a.cssText=n:(a.cssText="",n!=null&&ge(n,a.setProperty.bind(a)))}else{if(o==="value"){let d=e.nodeName;if(d==="SELECT")continue;if((d==="INPUT"||d==="TEXTAREA")&&(e.value=vt(n),d==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let a=gt(e,o);n==null||n===!1?e.removeAttribute(a):n===!0?e.setAttribute(a,""):typeof n=="string"||typeof n=="number"?e.setAttribute(a,n):e.setAttribute(a,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=ne(o);let s=ht(o);s?e.removeEventListener(s[0],n,s[1]):o==="ref"?qe.get(e)?.():e.removeAttribute(gt(e,o))}}},Vr=(e,t)=>{t[v][0]=0,Z.push([e,t]);let r=t.tag[q]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{Z.pop()}},Et=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[v][1][Pe]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(V(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let a=r.length;if(Et(s,t,r,o,n),s.s){for(let d=a;d<r.length;d++)r[d].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},Kr=e=>{for(;e&&(e.tag===Se||!e.e);)e=e.tag===Se||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},kt=e=>{V(e)||(e[v]?.[1][Pe]?.forEach(t=>t[2]?.()),qe.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(kt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(be.delete(e),Me.delete(e),delete e[v][3],e.a=!0)},Ye=(e,t,r)=>{e.c=t,$t(e,t,r)},xt=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},yt=Symbol(),$t=(e,t,r)=>{let o=[],n=[],s=[];Et(e,t,o,n,s),n.forEach(kt);let a=r?void 0:t.childNodes,d,p=null;if(r)d=-1;else if(!a.length)d=0;else{let f=xt(a,Kr(e.nN));f!==void 0?(p=a[f],d=f):d=xt(a,o.find(u=>u.tag!==Se&&u.e)?.e)??-1,d===-1&&(r=!0)}for(let f=0,u=o.length;f<u;f++,d++){let c=o[f],h;if(c.s&&c.e)h=c.e,c.s=!1;else{let y=r||!c.e;V(c)?(c.e&&c.d&&(c.e.textContent=c.t),c.d=!1,h=c.e||=document.createTextNode(c.t)):(h=c.e||=c.n?document.createElementNS(c.n,c.tag):document.createElement(c.tag),zr(h,c.props,c.pP),$t(c,h,y),c.tag==="select"&&Ur(h,c.props))}c.tag===Se?d--:r?h.parentNode||t.appendChild(h):a[d]!==h&&a[d-1]!==h&&(a[d+1]===h?t.appendChild(a[d]):t.insertBefore(h,p||a[d]||null))}if(e.pP&&(e.pP=void 0),s.length){let f=[],u=[];s.forEach(([,c,,h,y])=>{c&&f.push(c),h&&u.push(h),y?.()}),f.forEach(c=>c()),u.length&&requestAnimationFrame(()=>{u.forEach(c=>c())})}},Gr=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Me=new WeakMap,Oe=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?Vr(e,t):X(t.props.children),r[0]?.tag===""&&r[0][te]&&(n=r[0][te],e[5].push([e,n,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,a=[],d;for(let p=0;p<r.length;p++){if(Array.isArray(r[p])){r.splice(p,1,...r[p].flat(1/0)),p--;continue}let f=Ct(r[p]);if(f){typeof f.tag=="function"&&!f.tag[Te]&&(U.length>0&&(f[v][2]=U.map(c=>[c,c.values.at(-1)])),e[5]?.length&&(f[v][3]=e[5].at(-1)));let u;if(s&&s.length){let c=s.findIndex(V(f)?h=>V(h):f.key!==void 0?h=>h.key===f.key&&h.tag===f.tag:h=>h.tag===f.tag);c!==-1&&(u=s[c],s.splice(c,1))}if(u)if(V(f))u.t!==f.t&&(u.t=f.t,u.d=!0),f=u;else{let c=u.pP=u.props;if(u.props=f.props,u.f||=f.f||t.f,typeof f.tag=="function"){let h=u[v][2];u[v][2]=f[v][2]||[],u[v][3]=f[v][3],!u.f&&((u.o||u)===f.o||u.tag[De]?.(c,u.props))&&Gr(h,u[v][2])&&(u.s=!0)}f=u}else if(!V(f)&&se){let c=I(se);c&&(f.n=c)}if(!V(f)&&!f.s&&(Oe(e,f),delete f.f),a.push(f),d&&!d.s&&!f.s)for(let c=d;c&&!V(c);c=c.vC?.at(-1))c.nN=f;d=f}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=a,o&&delete t.pC}catch(s){if(t.f=!0,s===yt){if(n)return;throw s}let[a,d,p]=t[v]?.[3]||[];if(d){let f=()=>we([0,!1,e[2]],p),u=Me.get(p)||[];u.push(f),Me.set(p,u);let c=d(s,()=>{let h=Me.get(p);if(h){let y=h.indexOf(f);if(y!==-1)return h.splice(y,1),f()}});if(c){if(e[0]===1)e[1]=!0;else if(Oe(e,p,[c]),(d.length===1||e!==a)&&p.c){Ye(p,p.c,!1);return}throw yt}}throw s}finally{n&&e[5].pop()}},Ct=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[v]=[0,[]];else{let t=Hr[e.tag];t&&(se||=me(""),e.props.children=[{tag:se,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},At=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>At(o,t,r)))},bt=(e,t)=>{t[v][2]?.forEach(([r,o])=>{r.values.push(o)});try{Oe(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[v][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Ye(t,t.c,!1)},be=new WeakMap,St=[],we=async(e,t)=>{e[5]||=[];let r=be.get(t);r&&r[0](void 0);let o,n=new Promise(s=>o=s);if(be.set(t,[o,()=>{e[2]?e[2](e,t,s=>{bt(s,t)}).then(()=>o(t)):(bt(e,t),o(t))}]),St.length)St.at(-1).add(t);else{await Promise.resolve();let s=be.get(t);s&&(be.delete(t),s[1]())}return n},Wr=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Oe(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();Ye(e,o,!0),At(e,o,t),t.replaceChildren(o)},Xe=(e,t)=>{Wr(Ct({tag:"",props:{children:e}}),t)};var Ze=(e,t,r)=>({tag:Se,props:{children:e},key:r,e:t,p:1});var qr=0,Pe=1,Yr=2,Xr=3;var Je=new WeakMap,Qe=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var Zr;var Tt=[];var ve=e=>{let t=()=>typeof e=="function"?e():e,r=Z.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[v][1][qr]||=[],s=o[v][0]++;return n[s]||=[t(),a=>{let d=Zr,p=n[s];if(typeof a=="function"&&(a=a(p[0])),!Object.is(a,p[0]))if(p[0]=a,Tt.length){let[f,u]=Tt.at(-1);Promise.all([f===3?o:we([f,!1,d],o),u]).then(([c])=>{if(!c||!(f===2||f===3))return;let h=c.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===c.vC&&we([f===3?1:0,!1,d],c)})})})}else we([0,!1,d],o)}]},et=(e,t,r)=>{let o=J(a=>{s(d=>e(d,a))},[e]),[n,s]=ve(()=>r?r(t):t);return[n,o]},Jr=(e,t,r)=>{let o=Z.at(-1);if(!o)return;let[,n]=o,s=n[v][1][Pe]||=[],a=n[v][0]++,[d,,p]=s[a]||=[];if(Qe(d,r)){p&&p();let f=()=>{u[e]=void 0,u[2]=t()},u=[r,void 0,void 0,void 0,void 0];u[e]=f,s[a]=u}},tt=(e,t)=>Jr(3,e,t);var J=(e,t)=>{let r=Z.at(-1);if(!r)return e;let[,o]=r,n=o[v][1][Yr]||=[],s=o[v][0]++,a=n[s];return Qe(a?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var rt=e=>{let t=Je.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>Je.set(e,[r]),r=>Je.set(e,[void 0,r])),e},ot=(e,t)=>{let r=Z.at(-1);if(!r)return e();let[,o]=r,n=o[v][1][Xr]||=[],s=o[v][0]++,a=n[s];return Qe(a?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var jt=me({pending:!1,data:null,method:null,action:null}),Dt=new Set,Lt=e=>{Dt.add(e),e.finally(()=>Dt.delete(e))};var nt=(e,t)=>ot(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),_t=Object.create(null),Rt=Object.create(null),Ee=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:a,onError:d,precedence:p,blocking:f,...u}=t,c=null,h=!1,y=oe[e],b=Le(e,o),A=w=>w.getAttribute("rel")==="stylesheet"&&w.getAttribute(z)!==null,T;if(b){let w=s.querySelectorAll(e);e:for(let k of w)if(!(e==="link"&&!A(k))){for(let S of y)if(k.getAttribute(S)===t[S]){c=k;break e}}if(!c){let k=y.reduce((S,$)=>t[$]===void 0?S:`${S}-${$}-${t[$]}`,e);h=!Rt[k],c=Rt[k]||=(()=>{let S=document.createElement(e);for(let $ of y)t[$]!==void 0&&S.setAttribute($,t[$]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else T=s.querySelectorAll(e);p=o?p??"":void 0,o&&(u[z]=p);let F=J(w=>{if(b){if(e==="link"&&p!==void 0){let S=!1;for(let $ of s.querySelectorAll(e)){let P=$.getAttribute(z);if(P===null){s.insertBefore(w,$);return}if(S&&P!==p){s.insertBefore(w,$);return}P===p&&(S=!0)}s.appendChild(w);return}let k=!1;for(let S of s.querySelectorAll(e)){if(k&&S.getAttribute(z)!==p){s.insertBefore(w,S);return}S.getAttribute(z)===p&&(k=!0)}s.appendChild(w)}else if(e==="link")s.contains(w)||s.appendChild(w);else if(T){let k=!1;for(let S of T)if(S===w){k=!0;break}k||s.insertBefore(w,s.contains(T[0])?T[0]:s.querySelector(e)),T=void 0}},[b,p,e]),W=nt(t.ref,w=>{let k=y[0];if(r===2&&(w.innerHTML=""),(h||T)&&F(w),!d&&!a||!k)return;let S=_t[w.getAttribute(k)]||=new Promise(($,P)=>{w.addEventListener("load",$),w.addEventListener("error",P)});a&&(S=S.then(a)),d&&(S=S.catch(d)),S.catch(()=>{})});if(n&&f==="render"){let w=oe[e][0];if(w&&t[w]){let k=t[w],S=_t[k]||=new Promise(($,P)=>{F(c),c.addEventListener("load",$),c.addEventListener("error",P)});rt(S)}}let R={tag:e,type:e,props:{...u,ref:W},ref:W};return R.p=r,c&&(R.e=c),Ze(R,s)},Qr=e=>{let t=wt();return(t&&I(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:Ee("title",e,void 0,!1,!1)},eo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:Ee("script",e,1,!1,!0),to=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,Ee("style",e,2,!0,!0)),ro=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:Ee("link",e,1,je(e),!0),oo=e=>Ee("meta",e,void 0,!1,!1),Mt=Symbol(),no=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=ve([null,!1]),s=J(async f=>{let u=f.isTrusted?t:f.detail[Mt];if(typeof u!="function")return;f.preventDefault();let c=new FormData(f.target);n([c,!0]);let h=u(c);h instanceof Promise&&(Lt(h),await h),n([null,!0])},[]),a=nt(e.ref,f=>(f.addEventListener("submit",s),()=>{f.removeEventListener("submit",s)})),[d,p]=o;return o[1]=!1,{tag:jt,props:{value:{pending:d!==null,data:d,method:d?"post":null,action:d?t:null},children:{tag:"form",props:{...r,ref:a},type:"form",ref:a}},f:p}},Ot=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=J(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Mt]:t}}))},[]);r.ref=nt(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},io=e=>Ot("input",e),so=e=>Ot("button",e);Object.assign(pe,{title:Qr,script:eo,style:to,link:ro,meta:oo,form:no,input:io,button:so});var Ie={screen:"landing",loadingContext:null,user:null,apps:[],lastUsedAppId:null,error:null};var Bt=(e,t)=>{switch(t.type){case"INIT_SESSION_CHECK":return{...e,screen:"loading",loadingContext:"authenticating"};case"NO_SESSION":return{...e,screen:"landing",loadingContext:null,error:null};case"SESSION_EXPIRED":return{...e,screen:"landing",loadingContext:null,user:null,error:{type:"session",title:t.title,message:t.message}};case"AUTH_START":return{...e,screen:"loading",loadingContext:"authenticating",error:null};case"AUTH_CALLBACK_SUCCESS":{let{user:r,apps:o,lastUsedAppId:n}=t;return o.length===0?{...e,screen:"hub",loadingContext:null,user:r,apps:o,lastUsedAppId:null,error:null}:o.length===1?{...e,screen:"redirect",loadingContext:null,user:r,apps:o,lastUsedAppId:o[0].id,error:null}:{...e,screen:"hub",loadingContext:null,user:r,apps:o,lastUsedAppId:n,error:null}}case"AUTH_CALLBACK_FAILURE":return{...e,screen:"landing",loadingContext:null,error:{type:"auth",title:t.title,message:t.message}};case"LOAD_PERMISSIONS_START":return{...e,screen:"loading",loadingContext:"loading-permissions",error:null};case"LOAD_PERMISSIONS_SUCCESS":{let{apps:r,lastUsedAppId:o}=t;return r.length===1?{...e,screen:"redirect",loadingContext:null,apps:r,lastUsedAppId:r[0].id}:{...e,screen:"hub",loadingContext:null,apps:r,lastUsedAppId:o}}case"LOAD_PERMISSIONS_FAILURE":return{...e,screen:"hub",loadingContext:null,error:{type:"network",title:t.title,message:t.message}};case"SELECT_APP":return{...e,screen:"loading",loadingContext:"entering-app",lastUsedAppId:t.appId};case"LOGOUT_START":return{...e,screen:"loading",loadingContext:"authenticating"};case"LOGOUT_COMPLETE":return{...Ie,screen:"landing"}}},Nt=e=>e.screen==="redirect"&&e.apps.length===1?e.apps[0]??null:null,Ft=(e,t)=>`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`;var C={landingTitle:"ACDG",landingTagline:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio",landingButton:"Entrar na plataforma",landingFooter:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o",authErrorTitle:"Falha na autentica\xE7\xE3o",authErrorDesc:"N\xE3o foi poss\xEDvel concluir o login. Verifique suas credenciais ou entre em contato com o suporte.",sessionExpiredTitle:"Sess\xE3o expirada",sessionExpiredDesc:"Sua sess\xE3o expirou por inatividade. Fa\xE7a login novamente para continuar.",greeting:(e,t)=>`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`,hubSubtitle:"Selecione um m\xF3dulo para continuar",lastUsedLabel:"\xDALTIMO ACESSADO",allModulesLabel:e=>e===0?"NENHUM M\xD3DULO":e===1?"SEU M\xD3DULO":`TODOS OS M\xD3DULOS (${e})`,logoutButton:"Sair",emptyTitle:"Nenhum m\xF3dulo dispon\xEDvel",emptyDesc:"Sua conta ainda n\xE3o tem acesso a nenhum m\xF3dulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permiss\xF5es necess\xE1rias.",emptyContactAdmin:"Falar com o administrador",emptyContactEmail:"admin@acdg.gov.br",emptyContactSubject:"Solicita\xE7\xE3o de acesso - ACDG",emptyBackToStart:"Voltar ao in\xEDcio",networkErrorTitle:"Erro ao carregar m\xF3dulos",networkErrorDesc:"N\xE3o foi poss\xEDvel carregar suas permiss\xF5es. Verifique sua conex\xE3o com a internet e tente novamente.",networkErrorRetry:"Tentar novamente",redirectTitle:e=>`Entrando em ${e}...`,redirectSubtitle:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente.",redirectCancel:"N\xE3o \xE9 o que esperava? Voltar",loadingAuth:"Autenticando...",loadingPermissions:"Carregando m\xF3dulos...",loadingApp:e=>`Entrando em ${e}...`};var Q=":-hono-global",lo=new RegExp(`^${Q}{(.*)}$`),Be="hono-css",K=Symbol(),D=Symbol(),O=Symbol(),B=Symbol(),Ne=Symbol(),Ht=Symbol(),ta=Symbol();var Ut=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},zt=e=>e.trim().replace(/\s+/g,"-"),Vt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),co=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),mo=e=>Vt(e)&&!co.has(e.toLowerCase()),Kt=e=>{console.warn(`Invalid slug: ${e}`)},po=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),fo=new RegExp(["("+po+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),uo=e=>e.replace(fo,(t,r,o,n,s)=>r||o||n||s||""),Gt=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let a=0,d=e.length;a<d;a++){s+=e[a];let p=t[a];if(!(typeof p=="boolean"||p===null||p===void 0)){Array.isArray(p)||(p=[p]);for(let f=0,u=p.length;f<u;f++){let c=p[f];if(!(typeof c=="boolean"||c===null||c===void 0))if(typeof c=="string")/([\\"'\/])/.test(c)?s+=c.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=c;else if(typeof c=="number")s+=c;else if(c[Ht])s+=c[Ht];else if(c[D].startsWith("@keyframes "))r.push(c),s+=` ${c[D].substring(11)} `;else{if(e[a+1]?.match(/^\s*{/))r.push(c),c=`.${c[D]}`;else{r.push(...c[B]),o.push(...c[Ne]),c=c[O];let h=c.length;if(h>0){let y=c[h-1];y!==";"&&y!=="}"&&(c+=";")}}s+=`${c||""}`}}}}return[n,uo(s),r,o]},ae=(e,t,r,o)=>{let[n,s,a,d]=Gt(e,t),p=lo.exec(s);p&&(s=p[1]);let f=Ut(n+s),u;if(r){let y=r(f,zt(n),s);y&&(Vt(y)?u=y:(o||Kt)(y))}let c=(p?Q:"")+(u||f),h=(p?a.map(y=>y[D]):[c,...d]).join(" ");return{[K]:c,[D]:h,[O]:s,[B]:a,[Ne]:d}},Fe=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[K]:"",[D]:"",[O]:"",[B]:[],[Ne]:[o]})}return e},He=(e,t,r,o)=>{let[n,s]=Gt(e,t),a=Ut(n+s),d;if(r){let p=r(a,zt(n),s);p&&(mo(p)?d=p:(o||Kt)(p))}return{[K]:"",[D]:`@keyframes ${d||a}`,[O]:s,[B]:[],[Ne]:[]}},ho=0,Ue=(e,t,r,o)=>{e||(e=[`/* h-v-t ${ho++} */`]);let n=Array.isArray(e)?ae(e,t,r,o):e,s=n[D],a=ae(["view-transition-name:",""],[s],r,o);return n[D]=Q+n[D],n[O]=n[O].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),a[D]=a[K]=s,a[B]=[...n[B],n],a};var xo=e=>{let t=[],r=0,o=0;for(let n=0,s=e.length;n<s;n++){let a=e[n];if(a==="'"||a==='"'){let d=a;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===d)break}continue}if(a==="{"){o++;continue}if(a==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},it=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(a,d)=>{let[p,f]=r();if(!p||!f){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(a,d)});return}f.has(a)||(f.add(a),(a.startsWith(Q)?xo(d):[`${a[0]==="@"?"":"."}${a}{${d}}`]).forEach(u=>{p.insertRule(u,p.cssRules.length)}))};return[{toString(){let a=this[K];return o(a,this[O]),this[B].forEach(({[D]:d,[O]:p})=>{o(d,p)}),this[D]}},({children:a,nonce:d})=>({tag:"style",props:{id:e,nonce:d,children:a&&(Array.isArray(a)?a:[a]).map(p=>p[O])}})]},yo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),s=u=>(u.toString=o.toString,u),a=(u,...c)=>s(ae(u,c,t,r));return{css:a,cx:(...u)=>(u=Fe(u),a(Array(u.length).fill(""),...u)),keyframes:(u,...c)=>He(u,c,t,r),viewTransition:(u,...c)=>s(Ue(u,c,t,r)),Style:n}},ke=yo({id:Be}),na=ke.css,ia=ke.cx,sa=ke.keyframes,aa=ke.viewTransition,la=ke.Style;var bo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),s=new WeakMap,a=new WeakMap,d=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),p=b=>{let A=({buffer:R,context:w})=>{let[k,S]=s.get(w),$=Object.keys(k);if(!$.length)return;let P="";if($.forEach(Y=>{S[Y]=!0,P+=Y.startsWith(Q)?k[Y]:`${Y[0]==="@"?"":"."}${Y}{${k[Y]}}`}),s.set(w,[{},S]),R&&d.test(R[0])){R[0]=R[0].replace(d,(Y,vr,Er)=>`${vr}${P}${Er}`);return}let at=a.get(w),lt=`<script${at?` nonce="${at}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(P)}<\/script>`;if(R){R[0]=`${lt}${R[0]}`;return}return Promise.resolve(lt)},T=({context:R})=>{s.has(R)||s.set(R,[{},{}]);let[w,k]=s.get(R),S=!0;if(k[b[K]]||(S=!1,w[b[K]]=b[O]),b[B].forEach(({[D]:$,[O]:P})=>{k[$]||(S=!1,w[$]=P)}),!S)return Promise.resolve(j("",[A]))},F=new String(b[D]);Object.assign(F,b),F.isEscaped=!0,F.callbacks=[T];let W=Promise.resolve(F);return Object.assign(W,b),W.toString=o.toString,W},f=(b,...A)=>p(ae(b,A,t,r)),u=(...b)=>(b=Fe(b),f(Array(b.length).fill(""),...b)),c=(b,...A)=>He(b,A,t,r),h=(b,...A)=>p(Ue(b,A,t,r)),y=({children:b,nonce:A}={})=>j(`<style id="${e}"${A?` nonce="${A}"`:""}>${b?b[O]:""}</style>`,[({context:T})=>{a.set(T,A)}]);return y[q]=n,{css:f,cx:u,keyframes:c,viewTransition:h,Style:y}},$e=bo({id:Be}),m=$e.css,st=$e.cx,L=$e.keyframes,ha=$e.viewTransition,ga=$e.Style;var l={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",bgBase:"#F8F3EC",bgWarm:"#F0E8DC",bgSage:"#E2E8DF",bgSageDeep:"#D4DDD0",bgCard:"rgba(255,255,255,0.45)",bgCardHover:"rgba(255,255,255,0.65)",bgCardBorder:"rgba(255,255,255,0.6)",bgCardBorderHover:"rgba(79,132,72,0.2)",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",textSagePrimary:"#1E2B1A",textSageSecondary:"#3D5235",textSageMuted:"#6B7F65",textSageSoft:"#8B9E85",primary:"#4F8448",primaryDark:"#3D6A37",danger:"#A6290D",dangerAlt:"#C4422B",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},_=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},g={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},x={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},le={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Sa={button:m`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:m`box-shadow: -8px 0 40px ${_(l.textPrimary,.3)};`,fab:m`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:m`box-shadow: 0 24px 80px ${l.inputLine};`,modal:m`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},G={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"},ee={mobile:600,tablet:1200};var E=L`
  from { opacity: 0; transform: translateY(${le[4]}); }
  to { opacity: 1; transform: translateY(0); }
`,Wt=L`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(${le[6]}, ${le[5]}) scale(1.05); }
`,qt=L`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-${le[5]}, -${le[3]}) scale(1.08); }
`,Yt=L`
  from { width: 0; }
  to { width: 100%; }
`,ce=m`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: clip;
`,N=m`
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
`;var Xt=m`
  ${N}
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
`,So=m`
  ${Xt}
  width: clamp(20rem, 15rem + 20vw, 32rem);
  height: clamp(20rem, 15rem + 20vw, 32rem);
  background: radial-gradient(circle, ${_(l.primary,.07)} 0%, transparent 70%);
  top: -15%;
  right: -10%;
  animation: ${Wt} 12s ease-in-out infinite;
`,wo=m`
  ${Xt}
  width: clamp(18rem, 14rem + 18vw, 38rem);
  height: clamp(18rem, 14rem + 18vw, 38rem);
  background: radial-gradient(circle, rgba(180, 160, 100, 0.05) 0%, transparent 70%);
  bottom: -20%;
  left: -5%;
  animation: ${qt} 15s ease-in-out infinite;
`,Zt=()=>i(ie,{children:[i("div",{class:So,"aria-hidden":"true"}),i("div",{class:wo,"aria-hidden":"true"})]});var vo=L`
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
`,Eo=m`
  ${N}
  width: clamp(4rem, 3.5rem + 2vw, 5rem);
  height: clamp(4rem, 3.5rem + 2vw, 5rem);
  border-radius: 16px;
  background: linear-gradient(135deg, ${l.primary}, ${l.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(79, 132, 72, 0.25),
              0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  animation: ${vo} 4s ease-in-out infinite;
`,ko=m`
  font-family: ${g.erode};
  font-size: clamp(1.5rem, 1.25rem + 1vw, 2rem);
  font-weight: ${x.bold};
  color: #fff;
  line-height: 1;
`,Jt=()=>i("div",{class:Eo,"aria-hidden":"true",children:i("span",{class:ko,children:"C"})});var $o=m`
  font-family: ${g.erode};
  font-size: clamp(2rem, 1.5rem + 2.5vw, 2.625rem);
  font-weight: ${x.semibold};
  color: ${l.textSagePrimary};
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.01em;
`,Qt=()=>i("h1",{class:$o,children:"Conecta"});var Co=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1.0625rem);
  font-style: italic;
  font-weight: ${x.regular};
  color: ${l.textSageMuted};
  line-height: 1.6;
  max-width: min(90%, 24rem);
  text-align: center;
  margin: 0;
`,er=()=>i("p",{class:Co,children:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio"});var Ao=L`
  from { opacity: 0; transform: translateY(1.5rem); }
  to { opacity: 1; transform: translateY(0); }
`,To=m`
  ${N}
  max-width: min(90%, 28rem);
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1.25rem) clamp(1rem, 0.75rem + 0.75vw, 1.5rem);
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${Ao} 500ms ease both;
  background: ${l.bgCard};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${l.bgCardBorder};
`,Do=m`
  border-color: rgba(196, 66, 43, 0.2);
`,jo=m`
  border-color: rgba(201, 150, 10, 0.2);
`,Lo=m`color: ${l.dangerAlt};`,_o=m`color: ${l.warning};`,Ro=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${x.semibold};
  margin: 0 0 4px;
  line-height: 1.3;
`,Mo=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${x.regular};
  color: ${l.textSageMuted};
  line-height: 1.5;
  margin: 0;
`,tr=m`
  flex-shrink: 0;
  margin-top: 2px;
`,Oo=({color:e})=>i("svg",{class:tr,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),i("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),i("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),Po=({color:e})=>i("svg",{class:tr,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("circle",{cx:"12",cy:"12",r:"10"}),i("polyline",{points:"12 6 12 12 16 14"})]}),rr=({type:e,title:t,description:r})=>{let o=e==="error",n=o?l.dangerAlt:l.warning;return i("div",{class:st(To,o?Do:jo),role:"alert","aria-live":"assertive",children:[o?i(Oo,{color:n}):i(Po,{color:n}),i("div",{children:[i("p",{class:st(Ro,o?Lo:_o),children:t}),i("p",{class:Mo,children:r})]})]})};var Io=L`
  to { transform: rotate(360deg); }
`,Bo=m`
  ${N}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem) clamp(2rem, 1.5rem + 2vw, 3rem);
  border-radius: ${G.pill};
  border: none;
  background: linear-gradient(135deg, ${l.primary}, ${l.primaryDark});
  color: #fff;
  font-family: ${g.satoshi};
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1.0625rem);
  font-weight: ${x.semibold};
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(79, 132, 72, 0.3),
              0 1px 4px rgba(0, 0, 0, 0.08);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 300ms ease;
  letter-spacing: 0.01em;
  min-height: 48px;
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(79, 132, 72, 0.35),
                0 2px 8px rgba(0, 0, 0, 0.1);
  }
  &:active {
    transform: translateY(0) scale(0.98);
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`,No=m`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${Io} 0.8s linear infinite;
`,or=({onClick:e,loading:t})=>i("button",{class:Bo,onClick:e,disabled:t,type:"button","aria-label":"Entrar na plataforma",children:t?i("div",{class:No,"aria-hidden":"true"}):"Entrar na plataforma"});var Fo=m`
  position: absolute;
  bottom: clamp(1rem, 0.75rem + 1vw, 2rem);
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${g.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.8125rem);
  color: ${l.textSageSoft};
  letter-spacing: 0.5px;
`,nr=()=>i("footer",{class:Fo,children:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o"});var Ho=m`
  ${ce}
  background: linear-gradient(155deg, ${l.bgBase} 0%, ${l.bgWarm} 25%, ${l.bgSage} 55%, ${l.bgSageDeep} 100%);
  background-attachment: fixed;
  font-family: ${g.satoshi};
`,Uo=m`
  :-hono-global {
    body { background: ${l.bgSageDeep} !important; }
  }
`,zo=m`
  ${N}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.25rem, 1rem + 1.5vw, 1.75rem);
  z-index: 1;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  max-width: min(90%, 32rem);
  animation: ${E} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
`,ir=({alert:e,onLogin:t,loading:r})=>i("main",{class:Ho,"aria-label":"P\xE1gina de login",children:[i("div",{class:Uo}),i(Zt,{}),i("div",{class:zo,children:[i(Jt,{}),i(Qt,{}),i(er,{}),e?i(rr,{type:e.type,title:e.title,description:e.description}):null,i(or,{onClick:t,loading:r})]}),i(nr,{})]});var Vo=L`
  to { transform: rotate(360deg); }
`,Ko=m`
  width: 32px;
  height: 32px;
  border: 3px solid ${l.inputLine};
  border-top-color: ${l.primary};
  border-radius: 50%;
  animation: ${Vo} 0.8s linear infinite;
`,sr=()=>i("div",{class:Ko});var Go=m`
  ${ce}
  background: ${l.background};
  gap: 24px;
`,Wo=m`
  font-family: ${g.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${x.light};
  color: ${l.textMuted};
  margin: 0;
`,qo=(e,t)=>{switch(e){case"authenticating":return"Autenticando...";case"loading-permissions":return"Carregando m\xF3dulos...";case"entering-app":return`Entrando em ${t??""}...`}},Ce=({context:e,appName:t})=>i("div",{class:Go,role:"status","aria-live":"polite","aria-busy":"true",children:[i(sr,{}),i("p",{class:Wo,children:qo(e,t)})]});var Yo=m`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1rem, 0.5rem + 1.5vw, 2rem) clamp(1.25rem, 0.5rem + 3vw, 3rem) 0;
  flex-wrap: wrap;
  gap: clamp(0.5rem, 0.25rem + 1vw, 0.75rem);
  animation: ${E} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
  @media (min-width: ${ee.mobile}px) {
    flex-wrap: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Xo=m`
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 0.25rem + 0.5vw, 0.625rem);
`,Zo=m`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${l.primary}, ${l.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${x.bold};
  color: #fff;
`,Jo=m`
  font-family: ${g.erode};
  font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  font-weight: ${x.semibold};
  color: ${l.textSageSecondary};
`,Qo=m`
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 0.25rem + 0.5vw, 0.75rem);
`,en=m`
  display: none;
  text-align: right;
  @media (min-width: ${ee.mobile}px) {
    display: block;
  }
`,tn=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${x.medium};
  color: ${l.textSagePrimary};
  margin: 0;
`,rn=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  color: ${l.textSageMuted};
  margin: 0;
`,on=m`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${l.bgSage}, ${l.bgSageDeep});
  color: ${l.primaryDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  font-weight: ${x.semibold};
`,nn=m`
  background: none;
  border: 1px solid ${_(l.primary,.15)};
  padding: clamp(0.375rem, 0.25rem + 0.5vw, 0.5rem) clamp(0.875rem, 0.5rem + 1vw, 1.125rem);
  border-radius: ${G.pill};
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${x.semibold};
  color: ${l.textSageMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${l.dangerAlt};
    color: ${l.dangerAlt};
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 2px;
  }
`,ar=({user:e,onLogout:t})=>i("header",{class:Yo,children:[i("div",{class:Xo,children:[i("div",{class:Zo,"aria-hidden":"true",children:"A"}),i("span",{class:Jo,children:"ACDG"})]}),i("div",{class:Qo,children:[i("div",{class:en,children:[i("p",{class:tn,children:e.name}),i("p",{class:rn,children:e.role})]}),i("div",{class:on,"aria-hidden":"true",children:e.initials}),i("button",{class:nn,onClick:t,"aria-label":"Sair da plataforma",children:"Sair"})]})]});var sn=m`
  text-align: center;
  margin-bottom: clamp(2rem, 1.5rem + 2vw, 3rem);
  animation: ${E} 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,an=m`
  font-family: ${g.erode};
  font-size: clamp(1.5rem, 1.125rem + 1.5vw, 2rem);
  font-weight: ${x.semibold};
  color: ${l.textSagePrimary};
  margin: 0 0 clamp(0.25rem, 0.125rem + 0.5vw, 0.5rem);
  letter-spacing: -0.01em;
  @media (min-width: ${ee.mobile}px) {
    font-size: clamp(2rem, 1.5rem + 2.5vw, 2.625rem);
  }
`,ln=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 1rem);
  font-weight: ${x.regular};
  color: ${l.textSageMuted};
  margin: 0;
`,lr=({greeting:e,subtitle:t})=>i("div",{class:sn,children:[i("h1",{class:an,children:e}),i("p",{class:ln,children:t})]});var cn=m`
  width: 100%;
  max-width: min(90%, 45rem);
  margin-bottom: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  animation: ${E} 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,mn=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.5625rem, 0.5rem + 0.25vw, 0.625rem);
  font-weight: ${x.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${l.textSageMuted};
  margin: 0 0 clamp(0.5rem, 0.375rem + 0.5vw, 0.75rem);
`,dn=m`
  display: flex;
  align-items: center;
  gap: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
  padding: clamp(1rem, 0.75rem + 1vw, 1.25rem) clamp(1.125rem, 0.875rem + 1vw, 1.5rem);
  background: ${l.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${l.bgCardBorder};
  border-radius: 16px;
  cursor: pointer;
  transition: background 300ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 300ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
  &:hover {
    background: ${l.bgCardHover};
    border-color: ${l.bgCardBorderHover};
    transform: translateY(-2px) scale(1.005);
    box-shadow: 0 8px 32px rgba(79,132,72,0.08);
  }
  &:hover [data-arrow] {
    transform: translateX(4px);
    color: ${l.primary};
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,pn=m`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,fn=m`
  flex: 1;
  min-width: 0;
`,un=m`
  font-family: ${g.erode};
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1rem);
  font-weight: ${x.semibold};
  color: ${l.textSagePrimary};
  margin: 0 0 4px;
`,hn=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${x.regular};
  color: ${l.textSageMuted};
  margin: 0;
  line-height: 1.5;
`,gn=m`
  font-size: clamp(1.125rem, 1rem + 0.25vw, 1.25rem);
  color: ${l.textSageSoft};
  flex-shrink: 0;
  transition: transform 200ms ease, color 200ms ease;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,xn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},cr=({app:e,label:t,onClick:r})=>i("div",{class:cn,children:[i("p",{class:mn,children:t}),i("div",{class:dn,role:"button",tabindex:0,"aria-label":`${e.name}: ${e.description}`,onClick:r,onKeyDown:xn(r),children:[i("div",{class:pn,style:{background:_(e.color,.1)},"aria-hidden":"true",children:i("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("div",{class:fn,children:[i("h3",{class:un,children:e.name}),i("p",{class:hn,children:e.description})]}),i("span",{class:gn,"data-arrow":!0,"aria-hidden":"true",children:"\u2192"})]})]});var yn=m`
  position: relative;
  background: ${l.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: clamp(1.125rem, 0.875rem + 1vw, 1.5rem);
  border: 1px solid ${l.bgCardBorder};
  cursor: pointer;
  overflow: hidden;
  transition: background 300ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 300ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
  &:hover {
    background: ${l.bgCardHover};
    border-color: ${l.bgCardBorderHover};
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(79,132,72,0.06);
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 2px;
    background: ${l.bgCardHover};
    border-color: ${l.bgCardBorderHover};
    transform: translateY(-2px);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,bn=m`
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: clamp(0.75rem, 0.5rem + 0.5vw, 1rem);
`,Sn=m`
  font-family: ${g.erode};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 0.9375rem);
  font-weight: ${x.semibold};
  color: ${l.textSagePrimary};
  margin: 0 0 6px;
`,wn=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${x.regular};
  color: ${l.textSageMuted};
  margin: 0;
  line-height: 1.5;
`,vn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},mr=({app:e,index:t,onClick:r})=>{let o=350+t*70;return i("article",{class:yn,style:{animation:`${E} 500ms cubic-bezier(0.16, 1, 0.3, 1) ${o}ms both`},role:"button",tabindex:0,"aria-label":`Abrir ${e.name}`,onClick:r,onKeyDown:vn(r),children:[i("div",{class:bn,style:{background:_(e.color,.1)},"aria-hidden":"true",children:i("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("h3",{class:Sn,children:e.name}),i("p",{class:wn,children:e.description})]})};var En=m`
  width: 100%;
  max-width: min(90%, 45rem);
`,kn=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.5625rem, 0.5rem + 0.25vw, 0.625rem);
  font-weight: ${x.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${l.textSageMuted};
  margin: 0 0 clamp(0.75rem, 0.5rem + 0.5vw, 1rem);
  animation: ${E} 600ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,$n=m`
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(0.75rem, 0.5rem + 0.5vw, 1rem);
  width: 100%;
  @media (min-width: ${ee.mobile}px) {
    grid-template-columns: repeat(auto-fill, minmax(13.75rem, 1fr));
  }
`,dr=({apps:e,label:t,onSelectApp:r})=>i("nav",{class:En,"aria-label":"Modulos disponiveis",children:[i("h2",{class:kn,children:t}),i("div",{class:$n,children:e.map((o,n)=>i(mr,{app:o,index:n,onClick:()=>r(o.id)},o.id))})]});var Cn=m`
  text-align: center;
  padding: clamp(2rem, 1.5rem + 2vw, 3rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
  max-width: min(90%, 25rem);
  margin: 0 auto;
  background: ${l.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${l.bgCardBorder};
  border-radius: 16px;
  animation: ${E} 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,An=m`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${_(l.dangerAlt,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(1rem, 0.75rem + 1vw, 1.5rem);
`,Tn=m`
  font-family: ${g.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  font-weight: ${x.semibold};
  color: ${l.textSagePrimary};
  margin: 0 0 clamp(0.375rem, 0.25rem + 0.25vw, 0.5rem);
`,Dn=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem);
  font-weight: ${x.regular};
  color: ${l.textSageMuted};
  line-height: 1.6;
  margin: 0 0 clamp(1rem, 0.75rem + 1vw, 1.5rem);
`,jn=m`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);
  border-radius: ${G.pill};
  border: none;
  background: ${l.primary};
  color: #fff;
  font-family: ${g.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${x.semibold};
  text-decoration: none;
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
  &:hover {
    background: ${l.primaryDark};
    transform: translateY(-1px);
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,Ln=m`
  display: block;
  margin: clamp(0.5rem, 0.375rem + 0.5vw, 0.75rem) auto 0;
  background: none;
  border: 1px solid ${_(l.primary,.15)};
  padding: clamp(0.5rem, 0.375rem + 0.5vw, 0.625rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
  border-radius: ${G.pill};
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${x.semibold};
  color: ${l.textSageMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${l.textSagePrimary};
    color: ${l.textSagePrimary};
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 2px;
  }
`,pr=({strings:e,mailtoHref:t,onLogout:r})=>i("div",{class:Cn,children:[i("div",{class:An,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:l.dangerAlt,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),i("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]})}),i("h2",{class:Tn,children:e.emptyTitle}),i("p",{class:Dn,children:e.emptyDesc}),i("a",{class:jn,href:t,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"2",y:"4",width:"20",height:"16",rx:"2"}),i("path",{d:"M22 4L12 13 2 4"})]}),e.emptyContactAdmin]}),i("button",{class:Ln,onClick:r,children:e.emptyBackToStart})]});var _n=m`
  text-align: center;
  padding: clamp(2rem, 1.5rem + 2vw, 3rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
  max-width: min(90%, 25rem);
  margin: 0 auto;
  background: ${l.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${l.bgCardBorder};
  border-radius: 16px;
  animation: ${E} 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Rn=m`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${_(l.dangerAlt,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(1rem, 0.75rem + 1vw, 1.5rem);
`,Mn=m`
  font-family: ${g.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  font-weight: ${x.semibold};
  color: ${l.textSagePrimary};
  margin: 0 0 clamp(0.375rem, 0.25rem + 0.25vw, 0.5rem);
`,On=m`
  font-family: ${g.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem);
  font-weight: ${x.regular};
  color: ${l.textSageMuted};
  line-height: 1.6;
  margin: 0 0 clamp(1rem, 0.75rem + 1vw, 1.5rem);
`,Pn=m`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);
  border-radius: ${G.pill};
  border: none;
  background: ${l.primary};
  color: #fff;
  font-family: ${g.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${x.semibold};
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
  &:hover {
    background: ${l.primaryDark};
    transform: translateY(-1px);
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,fr=({strings:e,onRetry:t})=>i("div",{class:_n,children:[i("div",{class:Rn,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:l.dangerAlt,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("line",{x1:"1",y1:"1",x2:"23",y2:"23"}),i("path",{d:"M16.72 11.06A10.94 10.94 0 0 1 19 12.55"}),i("path",{d:"M5 12.55a10.94 10.94 0 0 1 5.17-2.39"}),i("path",{d:"M10.71 5.05A16 16 0 0 1 22.56 9"}),i("path",{d:"M1.42 9a15.91 15.91 0 0 1 4.7-2.88"}),i("path",{d:"M8.53 16.11a6 6 0 0 1 6.95 0"}),i("line",{x1:"12",y1:"20",x2:"12.01",y2:"20"})]})}),i("h2",{class:Mn,children:e.networkErrorTitle}),i("p",{class:On,children:e.networkErrorDesc}),i("button",{class:Pn,onClick:t,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("polyline",{points:"23 4 23 10 17 10"}),i("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),e.networkErrorRetry]})]});var In=L`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(2rem, 1.5rem) scale(1.05); }
`,Bn=L`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-1.5rem, -1rem) scale(1.08); }
`,Nn=m`
  :-hono-global {
    body { background: ${l.bgSageDeep} !important; }
  }
`,Fn=m`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
`,Hn=m`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${l.bgBase} 0%, ${l.bgWarm} 25%, ${l.bgSage} 55%, ${l.bgSageDeep} 100%);
  pointer-events: none;
`,Un=m`
  position: fixed;
  top: -15%;
  right: -10%;
  width: clamp(18rem, 15rem + 15vw, 31.25rem);
  height: clamp(18rem, 15rem + 15vw, 31.25rem);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,132,72,0.07) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
  animation: ${In} 20s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,zn=m`
  position: fixed;
  bottom: -20%;
  left: -5%;
  width: clamp(20rem, 16rem + 18vw, 37.5rem);
  height: clamp(20rem, 16rem + 18vw, 37.5rem);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180,160,100,0.05) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
  animation: ${Bn} 25s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Vn=m`
  position: relative;
  z-index: 1;
`,Kn=m`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1.5rem, 1rem + 2vw, 3rem) clamp(1.25rem, 0.5rem + 3vw, 3rem);
`,ur=e=>{let{user:t,apps:r,lastUsedAppId:o,errorType:n,greeting:s,subtitle:a,allModulesLabel:d,lastUsedLabel:p}=e,{emptyStrings:f,emptyMailtoHref:u,networkStrings:c,onSelectApp:h,onLogout:y,onRetry:b}=e;if(!t)return i(Ce,{context:"loading-permissions"});let A=o!==null&&r.length>1?r.find(W=>W.id===o)??null:null,T=n==="network",F=r.length>0;return i("div",{class:Fn,children:[i("div",{class:Nn}),i("div",{class:Hn,"aria-hidden":"true"}),i("div",{class:Un,"aria-hidden":"true"}),i("div",{class:zn,"aria-hidden":"true"}),i("div",{class:Vn,children:[i(ar,{user:t,onLogout:y}),i("main",{class:Kn,children:[i(lr,{greeting:s,subtitle:a}),T?i(fr,{strings:c,onRetry:b}):F?i(ie,{children:[A?i(cr,{app:A,label:p,onClick:()=>h(A.id)}):null,i(dr,{apps:r,label:d,onSelectApp:h})]}):i(pr,{strings:f,mailtoHref:u,onLogout:y})]})]})]})};var Gn=m`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${E} 500ms ease both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,hr=({color:e})=>i("div",{class:Gn,style:{background:_(e,.12)},children:i("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2"}),i("path",{d:"M9 3v18"}),i("path",{d:"M14 9l3 3-3 3"})]})});var Wn=m`
  width: 200px;
  height: 4px;
  background: ${l.inputLine};
  border-radius: 2px;
  overflow: hidden;
  animation: ${E} 500ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,qn=m`
  height: 100%;
  background: ${l.primary};
  border-radius: 2px;
  animation: ${Yt} 2s ease-in-out 400ms both;
  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    animation: none;
  }
`,gr=()=>i("div",{class:Wn,role:"progressbar","aria-valuemin":0,"aria-valuemax":100,children:i("div",{class:qn})});var Yn=m`
  background: none;
  border: none;
  padding: 0;
  font-family: ${g.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${x.light};
  color: ${l.textMuted};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  animation: ${E} 500ms ease 400ms both;
  &:hover {
    color: ${l.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${l.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,xr=({onClick:e})=>i("button",{class:Yn,onClick:e,type:"button",children:"N\xE3o \xE9 o que esperava? Voltar"});var Xn=m`
  ${ce}
  background: ${l.background};
  gap: 20px;
  text-align: center;
`,Zn=m`
  font-family: ${g.satoshi};
  font-size: 22px;
  font-weight: ${x.bold};
  color: ${l.textPrimary};
  margin: 0;
  animation: ${E} 500ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Jn=m`
  font-family: ${g.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${x.light};
  color: ${l.textMuted};
  margin: 0;
  animation: ${E} 500ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,yr=({app:e,onCancel:t})=>i("div",{class:Xn,role:"status","aria-live":"polite",children:[i(hr,{color:e.color}),i("h2",{class:Zn,children:`Entrando em ${e.name}...`}),i("p",{class:Jn,children:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente."}),i(gr,{}),i(xr,{onClick:t})]});var Qn=`mailto:${C.emptyContactEmail}?subject=${encodeURIComponent(C.emptyContactSubject)}`,br=async e=>{try{let t=await fetch("/api/v1/me",{credentials:"same-origin",headers:{"X-Requested-With":"XMLHttpRequest"}});if(t.status===401){e({type:"NO_SESSION"});return}if(!t.ok){e({type:"LOAD_PERMISSIONS_FAILURE",title:C.networkErrorTitle,message:C.networkErrorDesc});return}let r=await t.json(),o=r.data??r;e({type:"AUTH_CALLBACK_SUCCESS",user:{name:o.name,firstName:o.firstName,initials:o.initials,role:o.role},apps:o.apps,lastUsedAppId:o.lastUsedAppId??null})}catch{e({type:"LOAD_PERMISSIONS_FAILURE",title:C.networkErrorTitle,message:C.networkErrorDesc})}},Sr=()=>{let[e,t]=et(Bt,Ie);tt(()=>{let p=new URLSearchParams(globalThis.location.search);if(p.get("error")){t({type:"AUTH_CALLBACK_FAILURE",title:C.authErrorTitle,message:C.authErrorDesc});return}if(p.get("reason")==="session_expired"){t({type:"SESSION_EXPIRED",title:C.sessionExpiredTitle,message:C.sessionExpiredDesc});return}t({type:"INIT_SESSION_CHECK"}),br(t)},[]);let r=()=>{globalThis.location.href="/auth/login"},o=()=>{globalThis.location.href="/auth/logout"},n=()=>{t({type:"NO_SESSION"})},s=p=>{t({type:"SELECT_APP",appId:p});let f=e.apps.find(u=>u.id===p);f&&setTimeout(()=>{globalThis.location.href=f.route},1500)},a=()=>{t({type:"LOAD_PERMISSIONS_START"}),br(t)},d=e.error?{type:e.error.type==="session"?"warning":"error",title:e.error.title,description:e.error.message}:null;switch(e.screen){case"landing":return i(ir,{alert:d,onLogin:r});case"loading":{let p=e.lastUsedAppId?e.apps.find(f=>f.id===e.lastUsedAppId):null;return i(Ce,{context:e.loadingContext??"authenticating",appName:p?.name})}case"hub":return i(ur,{user:e.user,apps:e.apps,lastUsedAppId:e.lastUsedAppId,errorType:e.error?.type??null,greeting:e.user?Ft(e.user.firstName,new Date().getHours()):"",subtitle:C.hubSubtitle,allModulesLabel:C.allModulesLabel(e.apps.length),lastUsedLabel:C.lastUsedLabel,emptyStrings:{emptyTitle:C.emptyTitle,emptyDesc:C.emptyDesc,emptyContactAdmin:C.emptyContactAdmin,emptyBackToStart:C.emptyBackToStart},emptyMailtoHref:Qn,networkStrings:{networkErrorTitle:C.networkErrorTitle,networkErrorDesc:C.networkErrorDesc,networkErrorRetry:C.networkErrorRetry},onSelectApp:s,onLogout:o,onRetry:a});case"redirect":{let p=Nt(e);return p?i(yr,{app:p,onCancel:n}):i(Ce,{context:"authenticating"})}}};var wr=document.getElementById("auth-hub-app");wr&&Xe(i(Sr,{}),wr);
