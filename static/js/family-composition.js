var $r=Object.defineProperty;var vr=(e,t)=>{for(var r in t)$r(e,r,{get:t[r],enumerable:!0})};var Cr={Stringify:1,BeforeStream:2,Stream:3},P=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},wr=/[&<>'"]/,Ee=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let s=o[n];typeof s=="object"&&t.push(...s.callbacks||[]);let i=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??i)r+=s;else{let l=[r];B(s,l),r=l[0]}}return P(r,t)},B=(e,t)=>{let r=e.search(wr);if(r===-1){t[0]+=e;return}let o,n,s=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,n)+o,s=n+1}t[0]+=e.substring(s,n)},Ue=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:Cr.Stringify,buffer:r,context:o})),r[0]};var K=Symbol("RENDERER"),Q=Symbol("ERROR_HANDLER"),C=Symbol("STASH"),ke=Symbol("INTERNAL"),$e=Symbol("MEMO"),ee=Symbol("PERMALINK");var We=e=>(e[ke]=!0,e);var Ke=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:We(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:We(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[Q]=s=>{throw e.pop(),s},n},se=e=>{let t=[e],r=Ke(t);return r.values=t,r.Provider=r,z.push(r),r};var z=[],yt=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new ie("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>P(s,s.callbacks)):(t.pop(),P(n))};return r.values=t,r.Provider=r,r[K]=Ke(t),z.push(r),r},F=e=>e.values.at(-1);var te={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},ae={},V="data-precedence",ve=e=>e.rel==="stylesheet"&&"precedence"in e,Ce=(e,t)=>e==="link"?t:te[e].length>0;var fe={};vr(fe,{button:()=>Ir,form:()=>_r,input:()=>Or,link:()=>Dr,meta:()=>Pr,script:()=>Ar,style:()=>Tr,title:()=>Rr});var Z=e=>Array.isArray(e)?e:[e];var gt=new WeakMap,bt=(e,t,r,o)=>({buffer:n,context:s})=>{if(!n)return;let i=gt.get(s)||{};gt.set(s,i);let l=i[e]||=[],u=!1,f=te[e],p=Ce(e,o!==void 0);if(p){e:for(let[,a]of l)if(!(e==="link"&&!(a.rel==="stylesheet"&&a[V]!==void 0))){for(let h of f)if((a?.[h]??null)===r?.[h]){u=!0;break e}}}if(u?n[0]=n[0].replaceAll(t,""):p||e==="link"?l.push([t,r,o]):l.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let a;if(e==="link"||o!==void 0){let h=[];a=l.map(([y,,b],k)=>{if(b===void 0)return[y,Number.MAX_SAFE_INTEGER,k];let A=h.indexOf(b);return A===-1&&(h.push(b),A=h.length-1),[y,A,k]}).sort((y,b)=>y[1]-b[1]||y[2]-b[2]).map(([y])=>y)}else a=l.map(([h])=>h);a.forEach(h=>{n[0]=n[0].replaceAll(h,"")}),n[0]=n[0].replace(/(?=<\/head>)/,a.join(""))}},ce=(e,t,r)=>P(new O(e,r,Z(t??[])).toString()),le=(e,t,r,o)=>{if("itemProp"in r)return ce(e,t,r);let{precedence:n,blocking:s,...i}=r;n=o?n??"":void 0,o&&(i[V]=n);let l=new O(e,i,Z(t||[])).toString();return l instanceof Promise?l.then(u=>P(l,[...u.callbacks||[],bt(e,u,i,n)])):P(l,[bt(e,l,i,n)])},Rr=({children:e,...t})=>{let r=we();if(r){let o=F(r);if(o==="svg"||o==="head")return new O("title",t,Z(e??[]))}return le("title",e,t,!1)},Ar=({children:e,...t})=>{let r=we();return["src","async"].some(o=>!t[o])||r&&F(r)==="head"?ce("script",e,t):le("script",e,t,!1)},Tr=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,le("style",e,t,!0)):ce("style",e,t),Dr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?ce("link",e,t):le("link",e,t,ve(t)),Pr=({children:e,...t})=>{let r=we();return r&&F(r)==="head"?ce("meta",e,t):le("meta",e,t,!1)},St=(e,{children:t,...r})=>new O(e,r,Z(t??[])),_r=e=>(typeof e.action=="function"&&(e.action=ee in e.action?e.action[ee]:void 0),St("form",e)),Et=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=ee in t.formAction?t.formAction[ee]:void 0),St(e,t)),Or=e=>Et("input",e),Ir=e=>Et("button",e);var Mr=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),re=e=>Mr.get(e)||e,pe=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var de,we=()=>de,jr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Lr=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Fr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],qe=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")B(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):qe(n,t)}}},O=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Ue(P(t[0],t.callbacks)).toString():t[0]:Ee(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let s=de&&F(de)==="svg"?i=>jr(re(i)):i=>re(i);for(let[i,l]of Object.entries(o))if(i=s(i),i!=="children"){if(i==="style"&&typeof l=="object"){let u="";pe(l,(f,p)=>{p!=null&&(u+=`${u?";":""}${f}:${p}`)}),t[0]+=' style="',B(u,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${i}="`,B(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${i}="${l}"`;else if(typeof l=="boolean"&&Fr.includes(i))l&&(t[0]+=` ${i}=""`);else if(i==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[P(l.__html)]}else if(l instanceof Promise)t[0]+=` ${i}="`,t.unshift('"',l);else if(typeof l=="function"){if(!i.startsWith("on")&&i!=="ref")throw new Error(`Invalid prop '${i}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${i}="`,B(l.toString(),t),t[0]+='"'}if(Lr.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",qe(n,t),t[0]+=`</${r}>`}},ue=class extends O{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(z.length===0)t.unshift("",n);else{let s=z.map(i=>[i,i.values.at(-1)]);t.unshift("",n.then(i=>(i instanceof O&&(i.localContexts=s),i)))}else n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):B(n,t)}},ie=class extends O{toStringToBuffer(t){qe(this.children,t)}};var kt=!1,Re=(e,t,r)=>{if(!kt){for(let o in ae)fe[o][K]=ae[o];kt=!0}return typeof e=="function"?new ue(e,t,r):fe[e]?new ue(fe[e],t,r):e==="svg"||e==="head"?(de||=yt(""),new O(e,t,[new ue(de,{value:e},r)])):new O(e,t,r)};var Ae=({children:e})=>new ie("",{children:e},Array.isArray(e)?e:e?[e]:[]);function c(e,t,r){let o;if(!t||!("children"in t))o=Re(e,t,[]);else{let n=t.children;o=Array.isArray(n)?Re(e,t,n):Re(e,t,[n])}return o.key=r,o}var he="_hp",Nr={Change:"Input",DoubleClick:"DblClick"},Br={svg:"2000/svg",math:"1998/Math/MathML"},Y=[],Ze=new WeakMap,oe,Tt=()=>oe,H=e=>"t"in e,Ge={onClick:["click",!1]},$t=e=>{if(!e.startsWith("on"))return;if(Ge[e])return Ge[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return Ge[e]=[(Nr[r]||r).toLowerCase(),!!o]}},vt=(e,t)=>oe&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Dt=e=>e==null||e===!1?null:e,zr=(e,t)=>{"value"in t&&(e.value=Dt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Vr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=re(o);let s=$t(o);if(s){if(r?.[o]!==n&&(r&&e.removeEventListener(s[0],r[o],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let i;typeof n=="function"?i=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,i=()=>n.current=null),Ze.set(e,i)}else if(o==="style"){let i=e.style;typeof n=="string"?i.cssText=n:(i.cssText="",n!=null&&pe(n,i.setProperty.bind(i)))}else{if(o==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Dt(n),l==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let i=vt(e,o);n==null||n===!1?e.removeAttribute(i):n===!0?e.setAttribute(i,""):typeof n=="string"||typeof n=="number"?e.setAttribute(i,n):e.setAttribute(i,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=re(o);let s=$t(o);s?e.removeEventListener(s[0],n,s[1]):o==="ref"?Ze.get(e)?.():e.removeAttribute(vt(e,o))}}},Hr=(e,t)=>{t[C][0]=0,Y.push([e,t]);let r=t.tag[K]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{Y.pop()}},Pt=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[C][1][Pe]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(H(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let i=r.length;if(Pt(s,t,r,o,n),s.s){for(let l=i;l<r.length;l++)r[l].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},Ur=e=>{for(;e&&(e.tag===he||!e.e);)e=e.tag===he||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},_t=e=>{H(e)||(e[C]?.[1][Pe]?.forEach(t=>t[2]?.()),Ze.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(_t)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(me.delete(e),Te.delete(e),delete e[C][3],e.a=!0)},Ye=(e,t,r)=>{e.c=t,Ot(e,t,r)},Ct=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},wt=Symbol(),Ot=(e,t,r)=>{let o=[],n=[],s=[];Pt(e,t,o,n,s),n.forEach(_t);let i=r?void 0:t.childNodes,l,u=null;if(r)l=-1;else if(!i.length)l=0;else{let f=Ct(i,Ur(e.nN));f!==void 0?(u=i[f],l=f):l=Ct(i,o.find(p=>p.tag!==he&&p.e)?.e)??-1,l===-1&&(r=!0)}for(let f=0,p=o.length;f<p;f++,l++){let a=o[f],h;if(a.s&&a.e)h=a.e,a.s=!1;else{let y=r||!a.e;H(a)?(a.e&&a.d&&(a.e.textContent=a.t),a.d=!1,h=a.e||=document.createTextNode(a.t)):(h=a.e||=a.n?document.createElementNS(a.n,a.tag):document.createElement(a.tag),Vr(h,a.props,a.pP),Ot(a,h,y),a.tag==="select"&&zr(h,a.props))}a.tag===he?l--:r?h.parentNode||t.appendChild(h):i[l]!==h&&i[l-1]!==h&&(i[l+1]===h?t.appendChild(i[l]):t.insertBefore(h,u||i[l]||null))}if(e.pP&&(e.pP=void 0),s.length){let f=[],p=[];s.forEach(([,a,,h,y])=>{a&&f.push(a),h&&p.push(h),y?.()}),f.forEach(a=>a()),p.length&&requestAnimationFrame(()=>{p.forEach(a=>a())})}},Wr=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Te=new WeakMap,De=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?Hr(e,t):Z(t.props.children),r[0]?.tag===""&&r[0][Q]&&(n=r[0][Q],e[5].push([e,n,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,i=[],l;for(let u=0;u<r.length;u++){if(Array.isArray(r[u])){r.splice(u,1,...r[u].flat(1/0)),u--;continue}let f=It(r[u]);if(f){typeof f.tag=="function"&&!f.tag[ke]&&(z.length>0&&(f[C][2]=z.map(a=>[a,a.values.at(-1)])),e[5]?.length&&(f[C][3]=e[5].at(-1)));let p;if(s&&s.length){let a=s.findIndex(H(f)?h=>H(h):f.key!==void 0?h=>h.key===f.key&&h.tag===f.tag:h=>h.tag===f.tag);a!==-1&&(p=s[a],s.splice(a,1))}if(p)if(H(f))p.t!==f.t&&(p.t=f.t,p.d=!0),f=p;else{let a=p.pP=p.props;if(p.props=f.props,p.f||=f.f||t.f,typeof f.tag=="function"){let h=p[C][2];p[C][2]=f[C][2]||[],p[C][3]=f[C][3],!p.f&&((p.o||p)===f.o||p.tag[$e]?.(a,p.props))&&Wr(h,p[C][2])&&(p.s=!0)}f=p}else if(!H(f)&&oe){let a=F(oe);a&&(f.n=a)}if(!H(f)&&!f.s&&(De(e,f),delete f.f),i.push(f),l&&!l.s&&!f.s)for(let a=l;a&&!H(a);a=a.vC?.at(-1))a.nN=f;l=f}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=i,o&&delete t.pC}catch(s){if(t.f=!0,s===wt){if(n)return;throw s}let[i,l,u]=t[C]?.[3]||[];if(l){let f=()=>xe([0,!1,e[2]],u),p=Te.get(u)||[];p.push(f),Te.set(u,p);let a=l(s,()=>{let h=Te.get(u);if(h){let y=h.indexOf(f);if(y!==-1)return h.splice(y,1),f()}});if(a){if(e[0]===1)e[1]=!0;else if(De(e,u,[a]),(l.length===1||e!==i)&&u.c){Ye(u,u.c,!1);return}throw wt}}throw s}finally{n&&e[5].pop()}},It=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[C]=[0,[]];else{let t=Br[e.tag];t&&(oe||=se(""),e.props.children=[{tag:oe,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Mt=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Mt(o,t,r)))},Rt=(e,t)=>{t[C][2]?.forEach(([r,o])=>{r.values.push(o)});try{De(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[C][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Ye(t,t.c,!1)},me=new WeakMap,At=[],xe=async(e,t)=>{e[5]||=[];let r=me.get(t);r&&r[0](void 0);let o,n=new Promise(s=>o=s);if(me.set(t,[o,()=>{e[2]?e[2](e,t,s=>{Rt(s,t)}).then(()=>o(t)):(Rt(e,t),o(t))}]),At.length)At.at(-1).add(t);else{await Promise.resolve();let s=me.get(t);s&&(me.delete(t),s[1]())}return n},Kr=(e,t)=>{let r=[];r[5]=[],r[4]=!0,De(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();Ye(e,o,!0),Mt(e,o,t),t.replaceChildren(o)},Je=(e,t)=>{Kr(It({tag:"",props:{children:e}}),t)};var Xe=(e,t,r)=>({tag:he,props:{children:e},key:r,e:t,p:1});var qr=0,Pe=1,Gr=2,Zr=3;var Qe=new WeakMap,et=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var Yr;var jt=[];var _=e=>{let t=()=>typeof e=="function"?e():e,r=Y.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[C][1][qr]||=[],s=o[C][0]++;return n[s]||=[t(),i=>{let l=Yr,u=n[s];if(typeof i=="function"&&(i=i(u[0])),!Object.is(i,u[0]))if(u[0]=i,jt.length){let[f,p]=jt.at(-1);Promise.all([f===3?o:xe([f,!1,l],o),p]).then(([a])=>{if(!a||!(f===2||f===3))return;let h=a.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===a.vC&&xe([f===3?1:0,!1,l],a)})})})}else xe([0,!1,l],o)}]},tt=(e,t,r)=>{let o=J(i=>{s(l=>e(l,i))},[e]),[n,s]=_(()=>r?r(t):t);return[n,o]},Jr=(e,t,r)=>{let o=Y.at(-1);if(!o)return;let[,n]=o,s=n[C][1][Pe]||=[],i=n[C][0]++,[l,,u]=s[i]||=[];if(et(l,r)){u&&u();let f=()=>{p[e]=void 0,p[2]=t()},p=[r,void 0,void 0,void 0,void 0];p[e]=f,s[i]=p}},rt=(e,t)=>Jr(3,e,t);var J=(e,t)=>{let r=Y.at(-1);if(!r)return e;let[,o]=r,n=o[C][1][Gr]||=[],s=o[C][0]++,i=n[s];return et(i?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var ot=e=>{let t=Qe.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>Qe.set(e,[r]),r=>Qe.set(e,[void 0,r])),e},nt=(e,t)=>{let r=Y.at(-1);if(!r)return e();let[,o]=r,n=o[C][1][Zr]||=[],s=o[C][0]++,i=n[s];return et(i?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Ft=se({pending:!1,data:null,method:null,action:null}),Lt=new Set,Nt=e=>{Lt.add(e),e.finally(()=>Lt.delete(e))};var st=(e,t)=>nt(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),Bt=Object.create(null),zt=Object.create(null),ye=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:i,onError:l,precedence:u,blocking:f,...p}=t,a=null,h=!1,y=te[e],b=Ce(e,o),k=x=>x.getAttribute("rel")==="stylesheet"&&x.getAttribute(V)!==null,A;if(b){let x=s.querySelectorAll(e);e:for(let v of x)if(!(e==="link"&&!k(v))){for(let $ of y)if(v.getAttribute($)===t[$]){a=v;break e}}if(!a){let v=y.reduce(($,R)=>t[R]===void 0?$:`${$}-${R}-${t[R]}`,e);h=!zt[v],a=zt[v]||=(()=>{let $=document.createElement(e);for(let R of y)t[R]!==void 0&&$.setAttribute(R,t[R]);return t.rel&&$.setAttribute("rel",t.rel),$})()}}else A=s.querySelectorAll(e);u=o?u??"":void 0,o&&(p[V]=u);let L=J(x=>{if(b){if(e==="link"&&u!==void 0){let $=!1;for(let R of s.querySelectorAll(e)){let M=R.getAttribute(V);if(M===null){s.insertBefore(x,R);return}if($&&M!==u){s.insertBefore(x,R);return}M===u&&($=!0)}s.appendChild(x);return}let v=!1;for(let $ of s.querySelectorAll(e)){if(v&&$.getAttribute(V)!==u){s.insertBefore(x,$);return}$.getAttribute(V)===u&&(v=!0)}s.appendChild(x)}else if(e==="link")s.contains(x)||s.appendChild(x);else if(A){let v=!1;for(let $ of A)if($===x){v=!0;break}v||s.insertBefore(x,s.contains(A[0])?A[0]:s.querySelector(e)),A=void 0}},[b,u,e]),W=st(t.ref,x=>{let v=y[0];if(r===2&&(x.innerHTML=""),(h||A)&&L(x),!l&&!i||!v)return;let $=Bt[x.getAttribute(v)]||=new Promise((R,M)=>{x.addEventListener("load",R),x.addEventListener("error",M)});i&&($=$.then(i)),l&&($=$.catch(l)),$.catch(()=>{})});if(n&&f==="render"){let x=te[e][0];if(x&&t[x]){let v=t[x],$=Bt[v]||=new Promise((R,M)=>{L(a),a.addEventListener("load",R),a.addEventListener("error",M)});ot($)}}let D={tag:e,type:e,props:{...p,ref:W},ref:W};return D.p=r,a&&(D.e=a),Xe(D,s)},Xr=e=>{let t=Tt();return(t&&F(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ye("title",e,void 0,!1,!1)},Qr=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ye("script",e,1,!1,!0),eo=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ye("style",e,2,!0,!0)),to=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ye("link",e,1,ve(e),!0),ro=e=>ye("meta",e,void 0,!1,!1),Vt=Symbol(),oo=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=_([null,!1]),s=J(async f=>{let p=f.isTrusted?t:f.detail[Vt];if(typeof p!="function")return;f.preventDefault();let a=new FormData(f.target);n([a,!0]);let h=p(a);h instanceof Promise&&(Nt(h),await h),n([null,!0])},[]),i=st(e.ref,f=>(f.addEventListener("submit",s),()=>{f.removeEventListener("submit",s)})),[l,u]=o;return o[1]=!1,{tag:Ft,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...r,ref:i},type:"form",ref:i}},f:u}},Ht=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=J(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Vt]:t}}))},[]);r.ref=st(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},no=e=>Ht("input",e),so=e=>Ht("button",e);Object.assign(ae,{title:Xr,script:Qr,style:eo,link:to,meta:ro,form:oo,input:no,button:so});var X=":-hono-global",ao=new RegExp(`^${X}{(.*)}$`),_e="hono-css",U=Symbol(),T=Symbol(),I=Symbol(),N=Symbol(),Oe=Symbol(),Kt=Symbol(),li=Symbol();var qt=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Gt=e=>e.trim().replace(/\s+/g,"-"),Zt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),co=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),lo=e=>Zt(e)&&!co.has(e.toLowerCase()),Yt=e=>{console.warn(`Invalid slug: ${e}`)},fo=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),po=new RegExp(["("+fo+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),uo=e=>e.replace(po,(t,r,o,n,s)=>r||o||n||s||""),Jt=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let i=0,l=e.length;i<l;i++){s+=e[i];let u=t[i];if(!(typeof u=="boolean"||u===null||u===void 0)){Array.isArray(u)||(u=[u]);for(let f=0,p=u.length;f<p;f++){let a=u[f];if(!(typeof a=="boolean"||a===null||a===void 0))if(typeof a=="string")/([\\"'\/])/.test(a)?s+=a.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=a;else if(typeof a=="number")s+=a;else if(a[Kt])s+=a[Kt];else if(a[T].startsWith("@keyframes "))r.push(a),s+=` ${a[T].substring(11)} `;else{if(e[i+1]?.match(/^\s*{/))r.push(a),a=`.${a[T]}`;else{r.push(...a[N]),o.push(...a[Oe]),a=a[I];let h=a.length;if(h>0){let y=a[h-1];y!==";"&&y!=="}"&&(a+=";")}}s+=`${a||""}`}}}}return[n,uo(s),r,o]},ne=(e,t,r,o)=>{let[n,s,i,l]=Jt(e,t),u=ao.exec(s);u&&(s=u[1]);let f=qt(n+s),p;if(r){let y=r(f,Gt(n),s);y&&(Zt(y)?p=y:(o||Yt)(y))}let a=(u?X:"")+(p||f),h=(u?i.map(y=>y[T]):[a,...l]).join(" ");return{[U]:a,[T]:h,[I]:s,[N]:i,[Oe]:l}},Ie=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[U]:"",[T]:"",[I]:"",[N]:[],[Oe]:[o]})}return e},Me=(e,t,r,o)=>{let[n,s]=Jt(e,t),i=qt(n+s),l;if(r){let u=r(i,Gt(n),s);u&&(lo(u)?l=u:(o||Yt)(u))}return{[U]:"",[T]:`@keyframes ${l||i}`,[I]:s,[N]:[],[Oe]:[]}},mo=0,je=(e,t,r,o)=>{e||(e=[`/* h-v-t ${mo++} */`]);let n=Array.isArray(e)?ne(e,t,r,o):e,s=n[T],i=ne(["view-transition-name:",""],[s],r,o);return n[T]=X+n[T],n[I]=n[I].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),i[T]=i[U]=s,i[N]=[...n[N],n],i};var xo=e=>{let t=[],r=0,o=0;for(let n=0,s=e.length;n<s;n++){let i=e[n];if(i==="'"||i==='"'){let l=i;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===l)break}continue}if(i==="{"){o++;continue}if(i==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},it=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(i,l)=>{let[u,f]=r();if(!u||!f){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(i,l)});return}f.has(i)||(f.add(i),(i.startsWith(X)?xo(l):[`${i[0]==="@"?"":"."}${i}{${l}}`]).forEach(p=>{u.insertRule(p,u.cssRules.length)}))};return[{toString(){let i=this[U];return o(i,this[I]),this[N].forEach(({[T]:l,[I]:u})=>{o(l,u)}),this[T]}},({children:i,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:i&&(Array.isArray(i)?i:[i]).map(u=>u[I])}})]},yo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),s=p=>(p.toString=o.toString,p),i=(p,...a)=>s(ne(p,a,t,r));return{css:i,cx:(...p)=>(p=Ie(p),i(Array(p.length).fill(""),...p)),keyframes:(p,...a)=>Me(p,a,t,r),viewTransition:(p,...a)=>s(je(p,a,t,r)),Style:n}},ge=yo({id:_e}),ui=ge.css,di=ge.cx,mi=ge.keyframes,hi=ge.viewTransition,xi=ge.Style;var go=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),s=new WeakMap,i=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),u=b=>{let k=({buffer:D,context:x})=>{let[v,$]=s.get(x),R=Object.keys(v);if(!R.length)return;let M="";if(R.forEach(G=>{$[G]=!0,M+=G.startsWith(X)?v[G]:`${G[0]==="@"?"":"."}${G}{${v[G]}}`}),s.set(x,[{},$]),D&&l.test(D[0])){D[0]=D[0].replace(l,(G,Er,kr)=>`${Er}${M}${kr}`);return}let ht=i.get(x),xt=`<script${ht?` nonce="${ht}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(M)}<\/script>`;if(D){D[0]=`${xt}${D[0]}`;return}return Promise.resolve(xt)},A=({context:D})=>{s.has(D)||s.set(D,[{},{}]);let[x,v]=s.get(D),$=!0;if(v[b[U]]||($=!1,x[b[U]]=b[I]),b[N].forEach(({[T]:R,[I]:M})=>{v[R]||($=!1,x[R]=M)}),!$)return Promise.resolve(P("",[k]))},L=new String(b[T]);Object.assign(L,b),L.isEscaped=!0,L.callbacks=[A];let W=Promise.resolve(L);return Object.assign(W,b),W.toString=o.toString,W},f=(b,...k)=>u(ne(b,k,t,r)),p=(...b)=>(b=Ie(b),f(Array(b.length).fill(""),...b)),a=(b,...k)=>Me(b,k,t,r),h=(b,...k)=>u(je(b,k,t,r)),y=({children:b,nonce:k}={})=>P(`<style id="${e}"${k?` nonce="${k}"`:""}>${b?b[I]:""}</style>`,[({context:A})=>{i.set(A,k)}]);return y[K]=n,{css:f,cx:p,keyframes:a,viewTransition:h,Style:y}},be=go({id:_e}),d=be.css,$i=be.cx,Xt=be.keyframes,vi=be.viewTransition,Qt=be.Style;var er=["0-5","6-11","12-17","18-24","25-34","35-44","45-59","60+"],tr={loading:!1,error:null,members:[],lookups:{parentesco:[],specificities:[]},selectedSpecificityId:null,originalSpecificityId:null,saving:!1,ageProfile:{"0-5":0,"6-11":0,"12-17":0,"18-24":0,"25-34":0,"35-44":0,"45-59":0,"60+":0}};var at=(e,t)=>{let r,o,n;if(e.includes("/")){let f=e.split("/");n=parseInt(f[0]??"0",10),o=parseInt(f[1]??"0",10),r=parseInt(f[2]??"0",10)}else{let f=e.split("-");r=parseInt(f[0]??"0",10),o=parseInt(f[1]??"0",10),n=parseInt(f[2]??"0",10)}let s=t.getFullYear(),i=t.getMonth()+1,l=t.getDate(),u=s-r;return(i<o||i===o&&l<n)&&(u-=1),Math.max(0,u)},bo=e=>e<=5?"0-5":e<=11?"6-11":e<=17?"12-17":e<=24?"18-24":e<=34?"25-34":e<=44?"35-44":e<=59?"45-59":"60+",Le=(e,t)=>{let r={};for(let o of er)r[o]=0;for(let o of e){if(!o.birthDate)continue;let n=at(o.birthDate,t),s=bo(n);r[s]=(r[s]??0)+1}return r};var rr=(e,t)=>{switch(t.type){case"LOAD_START":return{...e,loading:!0,error:null};case"LOAD_SUCCESS":{let r=Le(t.members,new Date);return{...e,loading:!1,error:null,members:t.members,lookups:t.lookups,selectedSpecificityId:t.specificityId,originalSpecificityId:t.specificityId,ageProfile:r}}case"LOAD_FAILURE":return{...e,loading:!1,error:t.error};case"ADD_MEMBER":{let r=[...e.members,t.member],o=Le(r,new Date);return{...e,members:r,ageProfile:o}}case"UPDATE_MEMBER":{let r=e.members.map((n,s)=>s===t.index?t.member:n),o=Le(r,new Date);return{...e,members:r,ageProfile:o}}case"REMOVE_MEMBER":{let r=e.members.filter(n=>n.personId!==t.personId),o=Le(r,new Date);return{...e,members:r,ageProfile:o}}case"SET_CAREGIVER":return{...e,members:e.members.map(r=>({...r,isPrimaryCaregiver:r.personId===t.personId}))};case"TOGGLE_DOCUMENT":return{...e,members:e.members.map(r=>{if(r.personId!==t.personId)return r;let o=r.requiredDocuments.includes(t.doc)?r.requiredDocuments.filter(n=>n!==t.doc):[...r.requiredDocuments,t.doc];return{...r,requiredDocuments:o}})};case"SET_SPECIFICITY":return{...e,selectedSpecificityId:t.id};case"SAVE_START":return{...e,saving:!0};case"SAVE_SUCCESS":return{...e,saving:!1,originalSpecificityId:e.selectedSpecificityId};case"SAVE_FAILURE":return{...e,saving:!1,error:t.error}}};var Se={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Fe=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},So=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Ne=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:Se});return Fe(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},or=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:Se});return So(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Be=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:Se,body:JSON.stringify(t)});return Fe(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},nr=async(e,t)=>{try{let r=await fetch(e,{method:"PUT",credentials:"same-origin",headers:Se,body:JSON.stringify(t)});return Fe(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},sr=async e=>{try{let t=await fetch(e,{method:"DELETE",credentials:"same-origin",headers:Se});return Fe(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var ir={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),or(`/api/v1/patients?${o.toString()}`)},getById:e=>Ne(`/api/v1/patients/${e}`),create:e=>Be("/api/v1/patients",e)};var ct=new Map,lt={getTable:async e=>{let t=ct.get(e);if(t)return{ok:!0,value:t};let r=await Ne(`/api/v1/lookups/${e}`);return r.ok&&ct.set(e,r.value),r},clearCache:()=>{ct.clear()}};var ze={addMember:(e,t)=>Be(`/api/v1/patients/${e}/family-members`,t),removeMember:(e,t)=>sr(`/api/v1/patients/${e}/family-members/${t}`),assignPrimaryCaregiver:(e,t)=>nr(`/api/v1/patients/${e}/primary-caregiver`,t)};var m={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},w=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},g={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},S={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},E={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Ve={button:d`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:d`box-shadow: -8px 0 40px ${w(m.textPrimary,.3)};`,fab:d`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:d`box-shadow: 0 24px 80px ${m.inputLine};`,modal:d`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},j={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var Eo=d`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${S.bold};
  color: ${m.textMuted};
`,ar=d`
  color: ${m.textMuted};
`,ko=d`
  color: ${m.textPrimary};
`,cr=({lastName:e})=>c("nav",{class:Eo,children:[c("span",{children:"Familias"}),c("span",{class:ar,children:"/"}),c("span",{children:e}),c("span",{class:ar,children:"/"}),c("span",{class:ko,children:"Composicao Familiar"})]});var $o=d`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${E[3]};
`,vo=d`
  font-family: ${g.satoshi};
  font-size: 38px;
  font-weight: ${S.bold};
  color: ${m.textPrimary};
  line-height: 1.2;
`,Co=d`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${m.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  ${Ve.fab}
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`,lr=({onAdd:e})=>c("div",{class:$o,children:[c("h1",{class:vo,children:"Composicao Familiar"}),c("button",{class:Co,onClick:e,"aria-label":"Adicionar membro",children:"+"})]});var wo=d`
  display: table-row;
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${S.medium};
  color: ${m.textPrimary};
`,Ro=d`
  background: ${w(m.primary,.05)};
`,Ao=d`
  background: ${w(m.backgroundDark,.04)};
`,q=d`
  padding: 12px 8px;
  vertical-align: middle;
  border-bottom: 1px solid ${m.inputLine};
`,fr=d`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: ${S.bold};
  letter-spacing: 0.3px;
`,To=d`
  ${fr}
  background: ${w(m.primary,.12)};
  color: ${m.primary};
`,Do=d`
  ${fr}
  background: ${w(m.backgroundDark,.1)};
  color: ${m.backgroundDark};
`,ft=d`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`,Po=d`
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.4;
  cursor: default;
`,pr=({member:e,onEdit:t,onRemove:r,onSetCaregiver:o})=>{let n=at(e.birthDate,new Date),s=e.isPR?Ro:e.isPrimaryCaregiver?Ao:wo;return c("tr",{class:s,children:[c("td",{class:q,children:[e.name,e.isPR&&c("span",{class:To,children:" Referencia"}),e.isPrimaryCaregiver&&!e.isPR&&c("span",{class:Do,children:" Cuidador"})]}),c("td",{class:q,children:n}),c("td",{class:q,children:e.sex}),c("td",{class:q,children:e.relationshipLabel}),c("td",{class:q,children:e.residesWithPatient?"Sim":"Nao"}),c("td",{class:q,children:e.hasDisability?"Sim":"Nao"}),c("td",{class:q,children:e.requiredDocuments.join(", ")||"-"}),c("td",{class:q,children:[c("button",{class:ft,onClick:o,title:"Definir cuidador",children:"\u2605"}),c("button",{class:ft,onClick:t,title:"Editar",children:"\u270E"}),e.isPR?c("span",{class:Po,title:"Pessoa de referencia nao pode ser removida",children:"\u{1F512}"}):c("button",{class:ft,onClick:r,title:"Remover",children:"\u{1F5D1}"})]})]})};var _o=d`
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
`,Oo=d`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${S.bold};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  color: ${m.textMuted};
  text-align: left;
  padding: 12px 8px;
  border-bottom: 2px solid ${m.inputLine};
`,Io=["Nome","Idade","Sexo","Parentesco","Reside","PcD","Docs","Acoes"],ur=({members:e,onEdit:t,onRemove:r,onSetCaregiver:o})=>c("table",{class:_o,children:[c("thead",{children:c("tr",{children:Io.map(n=>c("th",{class:Oo,children:n},n))})}),c("tbody",{children:e.map((n,s)=>c(pr,{member:n,onEdit:()=>t(s),onRemove:()=>r(n.personId),onSetCaregiver:()=>o(n.personId)},n.personId))})]});var Mo=d`
  position: fixed;
  inset: 0;
  background: ${w(m.textPrimary,.4)};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`,jo=e=>d`
  background: ${m.backgroundDark};
  border-radius: ${j.modal};
  ${Ve.modal}
  padding: ${E[6]};
  max-width: ${e};
  width: 92vw;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
`,He=({maxWidth:e,children:t,onClose:r})=>c("div",{class:Mo,onClick:r,children:c("div",{class:jo(e??"760px"),onClick:o=>o.stopPropagation(),children:t})});var Lo=d`
  display: flex;
  gap: ${E[5]};
  flex-wrap: wrap;
`,Fo=d`
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`,No=d`
  flex: 0 1 220px;
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid ${w(m.background,.2)};
  border-radius: ${j.dropdown};
  padding: ${E[2]};
`,Bo=d`
  font-family: ${g.satoshi};
  font-size: 22px;
  font-weight: ${S.bold};
  color: ${m.background};
  margin-bottom: ${E[4]};
`,pt=d`
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${S.bold};
  color: ${w(m.background,.5)};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  margin-bottom: 4px;
`,dt=d`
  border: none;
  border-bottom: 1px solid ${w(m.background,.3)};
  padding: 0 0 6px 0;
  font-family: ${g.playfair};
  font-style: italic;
  font-size: 14px;
  font-weight: 300;
  color: ${m.background};
  background: transparent;
  outline: none;
  width: 100%;
  &:focus { border-bottom-color: ${m.background}; }
  &::placeholder { color: ${w(m.background,.5)}; }
`,zo=d`
  ${dt}
  appearance: none;
  cursor: pointer;
`,Vo=e=>d`
  padding: 8px 12px;
  font-family: ${g.satoshi};
  font-size: 13px;
  color: ${m.background};
  cursor: pointer;
  border-radius: 4px;
  font-weight: ${e?S.semibold:S.regular};
  background: ${e?w(m.background,.1):"transparent"};
  &:hover { background: ${w(m.background,.05)}; }
`,ut=d`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${m.background};
  font-family: ${g.satoshi};
  font-size: 14px;
`,Ho=d`
  margin-top: ${E[4]};
  padding: 12px 32px;
  border-radius: ${j.pill};
  border: none;
  background: ${m.primary};
  color: white;
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${S.bold};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`,dr=({lookups:e,onSave:t,onClose:r,editMember:o})=>{let n=!!o,[s,i]=_(o?.name??""),[l,u]=_(o?.birthDate??""),[f,p]=_(o?.sex??""),[a,h]=_(o?.residesWithPatient??!0),[y,b]=_(o?.hasDisability??!1),[k,A]=_(o?.isPrimaryCaregiver??!1),[L,W]=_(o?.relationshipId??"");return c(He,{onClose:r,maxWidth:"760px",children:[c("h2",{class:Bo,children:n?"Editar Membro":"Adicionar Membro"}),c("div",{class:Lo,children:[c("div",{class:Fo,children:[c("div",{children:[c("label",{class:pt,children:"Nome *"}),c("input",{class:dt,value:s,onInput:x=>i(x.target.value),placeholder:"Nome completo",disabled:n})]}),c("div",{children:[c("label",{class:pt,children:"Data Nasc. *"}),c("input",{class:dt,type:"date",value:l,onInput:x=>u(x.target.value),disabled:n})]}),c("div",{children:[c("label",{class:pt,children:"Sexo *"}),c("select",{class:zo,value:f,onChange:x=>p(x.target.value),disabled:n,children:[c("option",{value:"",children:"Selecione"}),c("option",{value:"Masculino",children:"Masculino"}),c("option",{value:"Feminino",children:"Feminino"})]})]}),c("label",{class:ut,children:[c("input",{type:"checkbox",checked:a,onChange:()=>h(!a)}),"Reside com paciente"]}),c("label",{class:ut,children:[c("input",{type:"checkbox",checked:y,onChange:()=>b(!y)}),"Pessoa com deficiencia"]}),c("label",{class:ut,children:[c("input",{type:"checkbox",checked:k,onChange:()=>A(!k)}),"Cuidador principal"]}),c("button",{class:Ho,onClick:()=>{if(!s||!l||!f||!L)return;let x=e.find(v=>v.id===L);t({personId:o?.personId??crypto.randomUUID(),name:s,birthDate:l,sex:f,relationshipId:L,relationshipLabel:x?.descricao??"",residesWithPatient:a,hasDisability:y,isPrimaryCaregiver:k,isPR:o?.isPR??!1,requiredDocuments:o?.requiredDocuments??[]})},children:n?"Salvar alteracoes":"Adicionar"})]}),c("div",{class:No,children:e.map(x=>c("div",{class:Vo(L===x.id),onClick:()=>W(x.id),children:x.descricao},x.id))})]})]})};var Uo=d`
  font-family: ${g.satoshi};
  font-size: 22px;
  font-weight: ${S.bold};
  color: ${m.background};
  margin-bottom: ${E[3]};
`,Wo=d`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${w(m.background,.7)};
  line-height: 1.5;
  margin-bottom: ${E[5]};
`,Ko=d`
  display: flex;
  gap: ${E[3]};
  justify-content: flex-end;
`,qo=d`
  padding: 10px 24px;
  border-radius: ${j.pill};
  border: 1.5px solid ${w(m.background,.4)};
  background: transparent;
  color: ${m.background};
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${S.medium};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
`,Go=d`
  padding: 10px 24px;
  border-radius: ${j.pill};
  border: none;
  background: ${m.danger};
  color: white;
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${S.bold};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`,mr=({title:e,message:t,confirmLabel:r,onConfirm:o,onCancel:n})=>c(He,{onClose:n,maxWidth:"420px",children:[c("h2",{class:Uo,children:e}),c("p",{class:Wo,children:t}),c("div",{class:Ko,children:[c("button",{class:qo,onClick:n,children:"Cancelar"}),c("button",{class:Go,onClick:o,children:r})]})]});var Zo=d`
  margin-top: ${E[5]};
`,Yo=d`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${S.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${m.textMuted};
  margin-bottom: ${E[3]};
`,Jo=d`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,Xo=e=>d`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${e?w(m.primary,.06):"transparent"};
  transition: background 0.15s;
  &:hover { background: ${w(m.primary,.04)}; }
`,Qo=d`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 2px solid ${m.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,en=d`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${m.textPrimary};
`,tn=d`
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${S.regular};
  color: ${m.textPrimary};
`,hr=({items:e,selectedId:t,onSelect:r})=>c("div",{class:Zo,children:[c("h3",{class:Yo,children:"Especificidades Sociais"}),c("div",{class:Jo,children:e.map(o=>c("div",{class:Xo(t===o.id),onClick:()=>r(o.id),children:[c("div",{class:Qo,children:t===o.id&&c("div",{class:en})}),c("span",{class:tn,children:o.descricao})]},o.id))})]});var rn=d`
  margin-top: ${E[5]};
`,on=d`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${S.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${m.textMuted};
  margin-bottom: ${E[3]};
`,nn=d`
  width: 100%;
  max-width: 320px;
  border-collapse: collapse;
`,sn=e=>d`
  background: ${e?w(m.primary,.07):"transparent"};
`,xr=d`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${S.medium};
  color: ${m.textPrimary};
  padding: 8px 12px;
  border-bottom: 1px solid ${m.inputLine};
`,an=d`
  ${xr}
  text-align: right;
  font-weight: ${S.bold};
`,cn={"0-5":"0 a 5 anos","6-11":"6 a 11 anos","12-17":"12 a 17 anos","18-24":"18 a 24 anos","25-34":"25 a 34 anos","35-44":"35 a 44 anos","45-59":"45 a 59 anos","60+":"60 anos ou mais"},yr=({ageProfile:e})=>c("div",{class:rn,children:[c("h3",{class:on,children:"Perfil Etario"}),c("table",{class:nn,children:c("tbody",{children:Object.entries(cn).map(([t,r])=>{let o=e[t]??0;return c("tr",{class:sn(o>0),children:[c("td",{class:xr,children:r}),c("td",{class:an,children:o})]},t)})})})]});var ln=Xt`
  to { transform: rotate(360deg); }
`,fn=d`
  width: 32px;
  height: 32px;
  border: 3px solid ${m.inputLine};
  border-top-color: ${m.primary};
  border-radius: 50%;
  animation: ${ln} 0.8s linear infinite;
`,gr=()=>c("div",{class:fn});var _a=d`
  border: none;
  border-bottom: 2px solid ${m.inputLine};
  background: transparent;
  padding: ${E[2]} 0;
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${S.regular};
  color: ${m.textPrimary};
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease;
  &:focus {
    border-bottom-color: ${m.primary};
  }
`,Oa=d`
  border-bottom-color: ${m.danger};
  &:focus {
    border-bottom-color: ${m.danger};
  }
`,Ia=d`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${S.bold};
  color: ${m.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,Ma=d`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${m.primary};
  color: ${m.surfaceLight};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${S.medium};
  border: none;
  border-radius: ${j.pill};
  padding: ${E[3]} ${E[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
  &:active {
    opacity: 0.8;
  }
`,ja=d`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${m.primary};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${S.medium};
  border: 2px solid ${m.primary};
  border-radius: ${j.pill};
  padding: ${E[3]} ${E[5]};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${m.primary};
    color: ${m.surfaceLight};
  }
`,La=d`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${m.danger};
  color: ${m.surfaceLight};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${S.medium};
  border: none;
  border-radius: ${j.pill};
  padding: ${E[3]} ${E[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
`,Fa=d`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,Na=d`
  background: ${m.surface};
  border-radius: ${j.card};
  padding: ${E[4]};
  transition: box-shadow 0.2s ease;
`,Ba=d`
  &:hover {
    box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);
  }
`,za=d`
  display: flex;
  flex-direction: column;
  gap: ${E[3]};
`,Va=d`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${E[3]};
`,Ha=d`
  display: flex;
  align-items: center;
  justify-content: center;
`,Ua=d`
  font-family: ${g.satoshi};
  font-weight: ${S.bold};
  color: ${m.textPrimary};
  line-height: 1.2;
`,Wa=d`
  font-family: ${g.satoshi};
  font-weight: ${S.regular};
  font-size: 16px;
  color: ${m.textPrimary};
  line-height: 1.5;
`,Ka=d`
  font-family: ${g.satoshi};
  font-size: 11px;
  color: ${m.textMuted};
  line-height: 1.4;
`,qa=d`
  font-family: ${g.satoshi};
  font-size: 11px;
  color: ${m.danger};
  line-height: 1.4;
`,Ga=d`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${S.bold};
  color: ${m.textMuted};
  text-transform: uppercase;
  letter-spacing: 1.5px;
`,mt=d`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${E[4]} 48px;

  @media (max-width: 1200px) {
    padding: ${E[4]} 40px;
  }

  @media (max-width: 600px) {
    padding: ${E[3]} 20px;
  }
`;var pn=d`
  margin-top: ${E[4]};
`,br=({patientId:e})=>{let[t,r]=tt(rr,tr),[o,n]=_({open:!1}),[s,i]=_({open:!1});rt(()=>{r({type:"LOAD_START"}),(async()=>{let[a,h,y]=await Promise.all([ir.getById(e),lt.getTable("parentesco"),lt.getTable("specificities")]);if(!a.ok){r({type:"LOAD_FAILURE",error:a.error});return}let b=a.value.familyMembers.map(k=>({personId:k.memberId,name:k.fullName,birthDate:"",sex:"",relationshipId:"",relationshipLabel:k.relationship,residesWithPatient:!0,hasDisability:!1,isPrimaryCaregiver:!1,isPR:!1,requiredDocuments:[]}));r({type:"LOAD_SUCCESS",members:b,lookups:{parentesco:h.ok?h.value.map(k=>({id:k.id,codigo:k.code,descricao:k.description,ativo:k.active})):[],specificities:y.ok?y.value.map(k=>({id:k.id,codigo:k.code,descricao:k.description,ativo:k.active})):[]},specificityId:null})})()},[e]);let l=p=>{o.open&&o.editIndex!==null?r({type:"UPDATE_MEMBER",index:o.editIndex,member:p}):(r({type:"ADD_MEMBER",member:p}),ze.addMember(e,p)),n({open:!1})},u=p=>{r({type:"REMOVE_MEMBER",personId:p}),ze.removeMember(e,p),i({open:!1})};if(t.loading)return c("div",{class:mt,children:c(gr,{})});let f=t.members[0]?.name.split(" ").slice(-1)[0]??"";return c("div",{class:mt,children:[c(cr,{lastName:f}),c(lr,{onAdd:()=>n({open:!0,editIndex:null})}),c("div",{class:pn,children:[c(ur,{members:t.members,onEdit:p=>n({open:!0,editIndex:p}),onRemove:p=>{let a=t.members.find(h=>h.personId===p);i({open:!0,personId:p,name:a?.name??""})},onSetCaregiver:p=>{r({type:"SET_CAREGIVER",personId:p}),ze.assignPrimaryCaregiver(e,{memberId:p})}}),c(hr,{items:t.lookups.specificities,selectedId:t.selectedSpecificityId,onSelect:p=>r({type:"SET_SPECIFICITY",id:p})}),c(yr,{ageProfile:t.ageProfile})]}),o.open&&c(dr,{lookups:t.lookups.parentesco,onSave:l,onClose:()=>n({open:!1}),editMember:o.editIndex!==null?t.members[o.editIndex]:void 0}),s.open&&c(mr,{title:"Remover membro",message:`Tem certeza que deseja remover ${s.name} da composicao familiar?`,confirmLabel:"Remover",onConfirm:()=>u(s.personId),onCancel:()=>i({open:!1})})]})};var Sr=document.getElementById("family-app");if(Sr){let e=window.location.pathname.split("/"),t=e[e.indexOf("family-composition")+1]??"";Je(c(Ae,{children:[c(Qt,{}),c(br,{patientId:t})]}),Sr)}
