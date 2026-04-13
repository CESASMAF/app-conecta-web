var kr=Object.defineProperty;var vr=(e,t)=>{for(var r in t)kr(e,r,{get:t[r],enumerable:!0})};var $r={Stringify:1,BeforeStream:2,Stream:3},P=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Cr=/[&<>'"]/,Ee=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let s=o[n];typeof s=="object"&&t.push(...s.callbacks||[]);let i=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??i)r+=s;else{let l=[r];B(s,l),r=l[0]}}return P(r,t)},B=(e,t)=>{let r=e.search(Cr);if(r===-1){t[0]+=e;return}let o,n,s=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,n)+o,s=n+1}t[0]+=e.substring(s,n)},Ue=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:$r.Stringify,buffer:r,context:o})),r[0]};var K=Symbol("RENDERER"),Q=Symbol("ERROR_HANDLER"),C=Symbol("STASH"),ke=Symbol("INTERNAL"),ve=Symbol("MEMO"),ee=Symbol("PERMALINK");var We=e=>(e[ke]=!0,e);var Ke=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:We(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:We(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[Q]=s=>{throw e.pop(),s},n},se=e=>{let t=[e],r=Ke(t);return r.values=t,r.Provider=r,z.push(r),r};var z=[],yt=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new ie("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>P(s,s.callbacks)):(t.pop(),P(n))};return r.values=t,r.Provider=r,r[K]=Ke(t),z.push(r),r},N=e=>e.values.at(-1);var te={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},ae={},V="data-precedence",$e=e=>e.rel==="stylesheet"&&"precedence"in e,Ce=(e,t)=>e==="link"?t:te[e].length>0;var fe={};vr(fe,{button:()=>_r,form:()=>Pr,input:()=>Or,link:()=>Tr,meta:()=>Dr,script:()=>Rr,style:()=>Ar,title:()=>wr});var Z=e=>Array.isArray(e)?e:[e];var gt=new WeakMap,bt=(e,t,r,o)=>({buffer:n,context:s})=>{if(!n)return;let i=gt.get(s)||{};gt.set(s,i);let l=i[e]||=[],d=!1,f=te[e],p=Ce(e,o!==void 0);if(p){e:for(let[,a]of l)if(!(e==="link"&&!(a.rel==="stylesheet"&&a[V]!==void 0))){for(let h of f)if((a?.[h]??null)===r?.[h]){d=!0;break e}}}if(d?n[0]=n[0].replaceAll(t,""):p||e==="link"?l.push([t,r,o]):l.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let a;if(e==="link"||o!==void 0){let h=[];a=l.map(([y,,b],S)=>{if(b===void 0)return[y,Number.MAX_SAFE_INTEGER,S];let A=h.indexOf(b);return A===-1&&(h.push(b),A=h.length-1),[y,A,S]}).sort((y,b)=>y[1]-b[1]||y[2]-b[2]).map(([y])=>y)}else a=l.map(([h])=>h);a.forEach(h=>{n[0]=n[0].replaceAll(h,"")}),n[0]=n[0].replace(/(?=<\/head>)/,a.join(""))}},ce=(e,t,r)=>P(new _(e,r,Z(t??[])).toString()),le=(e,t,r,o)=>{if("itemProp"in r)return ce(e,t,r);let{precedence:n,blocking:s,...i}=r;n=o?n??"":void 0,o&&(i[V]=n);let l=new _(e,i,Z(t||[])).toString();return l instanceof Promise?l.then(d=>P(l,[...d.callbacks||[],bt(e,d,i,n)])):P(l,[bt(e,l,i,n)])},wr=({children:e,...t})=>{let r=we();if(r){let o=N(r);if(o==="svg"||o==="head")return new _("title",t,Z(e??[]))}return le("title",e,t,!1)},Rr=({children:e,...t})=>{let r=we();return["src","async"].some(o=>!t[o])||r&&N(r)==="head"?ce("script",e,t):le("script",e,t,!1)},Ar=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,le("style",e,t,!0)):ce("style",e,t),Tr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?ce("link",e,t):le("link",e,t,$e(t)),Dr=({children:e,...t})=>{let r=we();return r&&N(r)==="head"?ce("meta",e,t):le("meta",e,t,!1)},St=(e,{children:t,...r})=>new _(e,r,Z(t??[])),Pr=e=>(typeof e.action=="function"&&(e.action=ee in e.action?e.action[ee]:void 0),St("form",e)),Et=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=ee in t.formAction?t.formAction[ee]:void 0),St(e,t)),Or=e=>Et("input",e),_r=e=>Et("button",e);var Ir=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),re=e=>Ir.get(e)||e,pe=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var ue,we=()=>ue,Mr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,jr=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Lr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],qe=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")B(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof _?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):qe(n,t)}}},_=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Ue(P(t[0],t.callbacks)).toString():t[0]:Ee(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let s=ue&&N(ue)==="svg"?i=>Mr(re(i)):i=>re(i);for(let[i,l]of Object.entries(o))if(i=s(i),i!=="children"){if(i==="style"&&typeof l=="object"){let d="";pe(l,(f,p)=>{p!=null&&(d+=`${d?";":""}${f}:${p}`)}),t[0]+=' style="',B(d,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${i}="`,B(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${i}="${l}"`;else if(typeof l=="boolean"&&Lr.includes(i))l&&(t[0]+=` ${i}=""`);else if(i==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[P(l.__html)]}else if(l instanceof Promise)t[0]+=` ${i}="`,t.unshift('"',l);else if(typeof l=="function"){if(!i.startsWith("on")&&i!=="ref")throw new Error(`Invalid prop '${i}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${i}="`,B(l.toString(),t),t[0]+='"'}if(jr.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",qe(n,t),t[0]+=`</${r}>`}},de=class extends _{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(z.length===0)t.unshift("",n);else{let s=z.map(i=>[i,i.values.at(-1)]);t.unshift("",n.then(i=>(i instanceof _&&(i.localContexts=s),i)))}else n instanceof _?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):B(n,t)}},ie=class extends _{toStringToBuffer(t){qe(this.children,t)}};var kt=!1,Re=(e,t,r)=>{if(!kt){for(let o in ae)fe[o][K]=ae[o];kt=!0}return typeof e=="function"?new de(e,t,r):fe[e]?new de(fe[e],t,r):e==="svg"||e==="head"?(ue||=yt(""),new _(e,t,[new de(ue,{value:e},r)])):new _(e,t,r)};var Ae=({children:e})=>new ie("",{children:e},Array.isArray(e)?e:e?[e]:[]);function c(e,t,r){let o;if(!t||!("children"in t))o=Re(e,t,[]);else{let n=t.children;o=Array.isArray(n)?Re(e,t,n):Re(e,t,[n])}return o.key=r,o}var he="_hp",Nr={Change:"Input",DoubleClick:"DblClick"},Fr={svg:"2000/svg",math:"1998/Math/MathML"},Y=[],Ze=new WeakMap,oe,Tt=()=>oe,H=e=>"t"in e,Ge={onClick:["click",!1]},vt=e=>{if(!e.startsWith("on"))return;if(Ge[e])return Ge[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return Ge[e]=[(Nr[r]||r).toLowerCase(),!!o]}},$t=(e,t)=>oe&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Dt=e=>e==null||e===!1?null:e,Br=(e,t)=>{"value"in t&&(e.value=Dt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},zr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=re(o);let s=vt(o);if(s){if(r?.[o]!==n&&(r&&e.removeEventListener(s[0],r[o],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let i;typeof n=="function"?i=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,i=()=>n.current=null),Ze.set(e,i)}else if(o==="style"){let i=e.style;typeof n=="string"?i.cssText=n:(i.cssText="",n!=null&&pe(n,i.setProperty.bind(i)))}else{if(o==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Dt(n),l==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let i=$t(e,o);n==null||n===!1?e.removeAttribute(i):n===!0?e.setAttribute(i,""):typeof n=="string"||typeof n=="number"?e.setAttribute(i,n):e.setAttribute(i,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=re(o);let s=vt(o);s?e.removeEventListener(s[0],n,s[1]):o==="ref"?Ze.get(e)?.():e.removeAttribute($t(e,o))}}},Vr=(e,t)=>{t[C][0]=0,Y.push([e,t]);let r=t.tag[K]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{Y.pop()}},Pt=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[C][1][Pe]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(H(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let i=r.length;if(Pt(s,t,r,o,n),s.s){for(let l=i;l<r.length;l++)r[l].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},Hr=e=>{for(;e&&(e.tag===he||!e.e);)e=e.tag===he||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Ot=e=>{H(e)||(e[C]?.[1][Pe]?.forEach(t=>t[2]?.()),Ze.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Ot)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(me.delete(e),Te.delete(e),delete e[C][3],e.a=!0)},Ye=(e,t,r)=>{e.c=t,_t(e,t,r)},Ct=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},wt=Symbol(),_t=(e,t,r)=>{let o=[],n=[],s=[];Pt(e,t,o,n,s),n.forEach(Ot);let i=r?void 0:t.childNodes,l,d=null;if(r)l=-1;else if(!i.length)l=0;else{let f=Ct(i,Hr(e.nN));f!==void 0?(d=i[f],l=f):l=Ct(i,o.find(p=>p.tag!==he&&p.e)?.e)??-1,l===-1&&(r=!0)}for(let f=0,p=o.length;f<p;f++,l++){let a=o[f],h;if(a.s&&a.e)h=a.e,a.s=!1;else{let y=r||!a.e;H(a)?(a.e&&a.d&&(a.e.textContent=a.t),a.d=!1,h=a.e||=document.createTextNode(a.t)):(h=a.e||=a.n?document.createElementNS(a.n,a.tag):document.createElement(a.tag),zr(h,a.props,a.pP),_t(a,h,y),a.tag==="select"&&Br(h,a.props))}a.tag===he?l--:r?h.parentNode||t.appendChild(h):i[l]!==h&&i[l-1]!==h&&(i[l+1]===h?t.appendChild(i[l]):t.insertBefore(h,d||i[l]||null))}if(e.pP&&(e.pP=void 0),s.length){let f=[],p=[];s.forEach(([,a,,h,y])=>{a&&f.push(a),h&&p.push(h),y?.()}),f.forEach(a=>a()),p.length&&requestAnimationFrame(()=>{p.forEach(a=>a())})}},Ur=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Te=new WeakMap,De=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?Vr(e,t):Z(t.props.children),r[0]?.tag===""&&r[0][Q]&&(n=r[0][Q],e[5].push([e,n,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,i=[],l;for(let d=0;d<r.length;d++){if(Array.isArray(r[d])){r.splice(d,1,...r[d].flat(1/0)),d--;continue}let f=It(r[d]);if(f){typeof f.tag=="function"&&!f.tag[ke]&&(z.length>0&&(f[C][2]=z.map(a=>[a,a.values.at(-1)])),e[5]?.length&&(f[C][3]=e[5].at(-1)));let p;if(s&&s.length){let a=s.findIndex(H(f)?h=>H(h):f.key!==void 0?h=>h.key===f.key&&h.tag===f.tag:h=>h.tag===f.tag);a!==-1&&(p=s[a],s.splice(a,1))}if(p)if(H(f))p.t!==f.t&&(p.t=f.t,p.d=!0),f=p;else{let a=p.pP=p.props;if(p.props=f.props,p.f||=f.f||t.f,typeof f.tag=="function"){let h=p[C][2];p[C][2]=f[C][2]||[],p[C][3]=f[C][3],!p.f&&((p.o||p)===f.o||p.tag[ve]?.(a,p.props))&&Ur(h,p[C][2])&&(p.s=!0)}f=p}else if(!H(f)&&oe){let a=N(oe);a&&(f.n=a)}if(!H(f)&&!f.s&&(De(e,f),delete f.f),i.push(f),l&&!l.s&&!f.s)for(let a=l;a&&!H(a);a=a.vC?.at(-1))a.nN=f;l=f}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=i,o&&delete t.pC}catch(s){if(t.f=!0,s===wt){if(n)return;throw s}let[i,l,d]=t[C]?.[3]||[];if(l){let f=()=>xe([0,!1,e[2]],d),p=Te.get(d)||[];p.push(f),Te.set(d,p);let a=l(s,()=>{let h=Te.get(d);if(h){let y=h.indexOf(f);if(y!==-1)return h.splice(y,1),f()}});if(a){if(e[0]===1)e[1]=!0;else if(De(e,d,[a]),(l.length===1||e!==i)&&d.c){Ye(d,d.c,!1);return}throw wt}}throw s}finally{n&&e[5].pop()}},It=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[C]=[0,[]];else{let t=Fr[e.tag];t&&(oe||=se(""),e.props.children=[{tag:oe,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Mt=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Mt(o,t,r)))},Rt=(e,t)=>{t[C][2]?.forEach(([r,o])=>{r.values.push(o)});try{De(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[C][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Ye(t,t.c,!1)},me=new WeakMap,At=[],xe=async(e,t)=>{e[5]||=[];let r=me.get(t);r&&r[0](void 0);let o,n=new Promise(s=>o=s);if(me.set(t,[o,()=>{e[2]?e[2](e,t,s=>{Rt(s,t)}).then(()=>o(t)):(Rt(e,t),o(t))}]),At.length)At.at(-1).add(t);else{await Promise.resolve();let s=me.get(t);s&&(me.delete(t),s[1]())}return n},Wr=(e,t)=>{let r=[];r[5]=[],r[4]=!0,De(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();Ye(e,o,!0),Mt(e,o,t),t.replaceChildren(o)},Je=(e,t)=>{Wr(It({tag:"",props:{children:e}}),t)};var Xe=(e,t,r)=>({tag:he,props:{children:e},key:r,e:t,p:1});var Kr=0,Pe=1,qr=2,Gr=3;var Qe=new WeakMap,et=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var Zr;var jt=[];var O=e=>{let t=()=>typeof e=="function"?e():e,r=Y.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[C][1][Kr]||=[],s=o[C][0]++;return n[s]||=[t(),i=>{let l=Zr,d=n[s];if(typeof i=="function"&&(i=i(d[0])),!Object.is(i,d[0]))if(d[0]=i,jt.length){let[f,p]=jt.at(-1);Promise.all([f===3?o:xe([f,!1,l],o),p]).then(([a])=>{if(!a||!(f===2||f===3))return;let h=a.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===a.vC&&xe([f===3?1:0,!1,l],a)})})})}else xe([0,!1,l],o)}]},tt=(e,t,r)=>{let o=J(i=>{s(l=>e(l,i))},[e]),[n,s]=O(()=>r?r(t):t);return[n,o]},Yr=(e,t,r)=>{let o=Y.at(-1);if(!o)return;let[,n]=o,s=n[C][1][Pe]||=[],i=n[C][0]++,[l,,d]=s[i]||=[];if(et(l,r)){d&&d();let f=()=>{p[e]=void 0,p[2]=t()},p=[r,void 0,void 0,void 0,void 0];p[e]=f,s[i]=p}},rt=(e,t)=>Yr(3,e,t);var J=(e,t)=>{let r=Y.at(-1);if(!r)return e;let[,o]=r,n=o[C][1][qr]||=[],s=o[C][0]++,i=n[s];return et(i?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var ot=e=>{let t=Qe.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>Qe.set(e,[r]),r=>Qe.set(e,[void 0,r])),e},nt=(e,t)=>{let r=Y.at(-1);if(!r)return e();let[,o]=r,n=o[C][1][Gr]||=[],s=o[C][0]++,i=n[s];return et(i?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Nt=se({pending:!1,data:null,method:null,action:null}),Lt=new Set,Ft=e=>{Lt.add(e),e.finally(()=>Lt.delete(e))};var st=(e,t)=>nt(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),Bt=Object.create(null),zt=Object.create(null),ye=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:i,onError:l,precedence:d,blocking:f,...p}=t,a=null,h=!1,y=te[e],b=Ce(e,o),S=x=>x.getAttribute("rel")==="stylesheet"&&x.getAttribute(V)!==null,A;if(b){let x=s.querySelectorAll(e);e:for(let $ of x)if(!(e==="link"&&!S($))){for(let E of y)if($.getAttribute(E)===t[E]){a=$;break e}}if(!a){let $=y.reduce((E,R)=>t[R]===void 0?E:`${E}-${R}-${t[R]}`,e);h=!zt[$],a=zt[$]||=(()=>{let E=document.createElement(e);for(let R of y)t[R]!==void 0&&E.setAttribute(R,t[R]);return t.rel&&E.setAttribute("rel",t.rel),E})()}}else A=s.querySelectorAll(e);d=o?d??"":void 0,o&&(p[V]=d);let L=J(x=>{if(b){if(e==="link"&&d!==void 0){let E=!1;for(let R of s.querySelectorAll(e)){let M=R.getAttribute(V);if(M===null){s.insertBefore(x,R);return}if(E&&M!==d){s.insertBefore(x,R);return}M===d&&(E=!0)}s.appendChild(x);return}let $=!1;for(let E of s.querySelectorAll(e)){if($&&E.getAttribute(V)!==d){s.insertBefore(x,E);return}E.getAttribute(V)===d&&($=!0)}s.appendChild(x)}else if(e==="link")s.contains(x)||s.appendChild(x);else if(A){let $=!1;for(let E of A)if(E===x){$=!0;break}$||s.insertBefore(x,s.contains(A[0])?A[0]:s.querySelector(e)),A=void 0}},[b,d,e]),W=st(t.ref,x=>{let $=y[0];if(r===2&&(x.innerHTML=""),(h||A)&&L(x),!l&&!i||!$)return;let E=Bt[x.getAttribute($)]||=new Promise((R,M)=>{x.addEventListener("load",R),x.addEventListener("error",M)});i&&(E=E.then(i)),l&&(E=E.catch(l)),E.catch(()=>{})});if(n&&f==="render"){let x=te[e][0];if(x&&t[x]){let $=t[x],E=Bt[$]||=new Promise((R,M)=>{L(a),a.addEventListener("load",R),a.addEventListener("error",M)});ot(E)}}let D={tag:e,type:e,props:{...p,ref:W},ref:W};return D.p=r,a&&(D.e=a),Xe(D,s)},Jr=e=>{let t=Tt();return(t&&N(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ye("title",e,void 0,!1,!1)},Xr=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ye("script",e,1,!1,!0),Qr=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ye("style",e,2,!0,!0)),eo=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ye("link",e,1,$e(e),!0),to=e=>ye("meta",e,void 0,!1,!1),Vt=Symbol(),ro=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=O([null,!1]),s=J(async f=>{let p=f.isTrusted?t:f.detail[Vt];if(typeof p!="function")return;f.preventDefault();let a=new FormData(f.target);n([a,!0]);let h=p(a);h instanceof Promise&&(Ft(h),await h),n([null,!0])},[]),i=st(e.ref,f=>(f.addEventListener("submit",s),()=>{f.removeEventListener("submit",s)})),[l,d]=o;return o[1]=!1,{tag:Nt,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...r,ref:i},type:"form",ref:i}},f:d}},Ht=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=J(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Vt]:t}}))},[]);r.ref=st(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},oo=e=>Ht("input",e),no=e=>Ht("button",e);Object.assign(ae,{title:Jr,script:Xr,style:Qr,link:eo,meta:to,form:ro,input:oo,button:no});var X=":-hono-global",io=new RegExp(`^${X}{(.*)}$`),Oe="hono-css",U=Symbol(),T=Symbol(),I=Symbol(),F=Symbol(),_e=Symbol(),Kt=Symbol(),pi=Symbol();var qt=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Gt=e=>e.trim().replace(/\s+/g,"-"),Zt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),ao=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),co=e=>Zt(e)&&!ao.has(e.toLowerCase()),Yt=e=>{console.warn(`Invalid slug: ${e}`)},lo=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),fo=new RegExp(["("+lo+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),po=e=>e.replace(fo,(t,r,o,n,s)=>r||o||n||s||""),Jt=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let i=0,l=e.length;i<l;i++){s+=e[i];let d=t[i];if(!(typeof d=="boolean"||d===null||d===void 0)){Array.isArray(d)||(d=[d]);for(let f=0,p=d.length;f<p;f++){let a=d[f];if(!(typeof a=="boolean"||a===null||a===void 0))if(typeof a=="string")/([\\"'\/])/.test(a)?s+=a.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=a;else if(typeof a=="number")s+=a;else if(a[Kt])s+=a[Kt];else if(a[T].startsWith("@keyframes "))r.push(a),s+=` ${a[T].substring(11)} `;else{if(e[i+1]?.match(/^\s*{/))r.push(a),a=`.${a[T]}`;else{r.push(...a[F]),o.push(...a[_e]),a=a[I];let h=a.length;if(h>0){let y=a[h-1];y!==";"&&y!=="}"&&(a+=";")}}s+=`${a||""}`}}}}return[n,po(s),r,o]},ne=(e,t,r,o)=>{let[n,s,i,l]=Jt(e,t),d=io.exec(s);d&&(s=d[1]);let f=qt(n+s),p;if(r){let y=r(f,Gt(n),s);y&&(Zt(y)?p=y:(o||Yt)(y))}let a=(d?X:"")+(p||f),h=(d?i.map(y=>y[T]):[a,...l]).join(" ");return{[U]:a,[T]:h,[I]:s,[F]:i,[_e]:l}},Ie=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[U]:"",[T]:"",[I]:"",[F]:[],[_e]:[o]})}return e},Me=(e,t,r,o)=>{let[n,s]=Jt(e,t),i=qt(n+s),l;if(r){let d=r(i,Gt(n),s);d&&(co(d)?l=d:(o||Yt)(d))}return{[U]:"",[T]:`@keyframes ${l||i}`,[I]:s,[F]:[],[_e]:[]}},uo=0,je=(e,t,r,o)=>{e||(e=[`/* h-v-t ${uo++} */`]);let n=Array.isArray(e)?ne(e,t,r,o):e,s=n[T],i=ne(["view-transition-name:",""],[s],r,o);return n[T]=X+n[T],n[I]=n[I].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),i[T]=i[U]=s,i[F]=[...n[F],n],i};var ho=e=>{let t=[],r=0,o=0;for(let n=0,s=e.length;n<s;n++){let i=e[n];if(i==="'"||i==='"'){let l=i;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===l)break}continue}if(i==="{"){o++;continue}if(i==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},it=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(i,l)=>{let[d,f]=r();if(!d||!f){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(i,l)});return}f.has(i)||(f.add(i),(i.startsWith(X)?ho(l):[`${i[0]==="@"?"":"."}${i}{${l}}`]).forEach(p=>{d.insertRule(p,d.cssRules.length)}))};return[{toString(){let i=this[U];return o(i,this[I]),this[F].forEach(({[T]:l,[I]:d})=>{o(l,d)}),this[T]}},({children:i,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:i&&(Array.isArray(i)?i:[i]).map(d=>d[I])}})]},xo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),s=p=>(p.toString=o.toString,p),i=(p,...a)=>s(ne(p,a,t,r));return{css:i,cx:(...p)=>(p=Ie(p),i(Array(p.length).fill(""),...p)),keyframes:(p,...a)=>Me(p,a,t,r),viewTransition:(p,...a)=>s(je(p,a,t,r)),Style:n}},ge=xo({id:Oe}),mi=ge.css,hi=ge.cx,xi=ge.keyframes,yi=ge.viewTransition,gi=ge.Style;var yo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),s=new WeakMap,i=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),d=b=>{let S=({buffer:D,context:x})=>{let[$,E]=s.get(x),R=Object.keys($);if(!R.length)return;let M="";if(R.forEach(G=>{E[G]=!0,M+=G.startsWith(X)?$[G]:`${G[0]==="@"?"":"."}${G}{${$[G]}}`}),s.set(x,[{},E]),D&&l.test(D[0])){D[0]=D[0].replace(l,(G,Sr,Er)=>`${Sr}${M}${Er}`);return}let ht=i.get(x),xt=`<script${ht?` nonce="${ht}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(M)}<\/script>`;if(D){D[0]=`${xt}${D[0]}`;return}return Promise.resolve(xt)},A=({context:D})=>{s.has(D)||s.set(D,[{},{}]);let[x,$]=s.get(D),E=!0;if($[b[U]]||(E=!1,x[b[U]]=b[I]),b[F].forEach(({[T]:R,[I]:M})=>{$[R]||(E=!1,x[R]=M)}),!E)return Promise.resolve(P("",[S]))},L=new String(b[T]);Object.assign(L,b),L.isEscaped=!0,L.callbacks=[A];let W=Promise.resolve(L);return Object.assign(W,b),W.toString=o.toString,W},f=(b,...S)=>d(ne(b,S,t,r)),p=(...b)=>(b=Ie(b),f(Array(b.length).fill(""),...b)),a=(b,...S)=>Me(b,S,t,r),h=(b,...S)=>d(je(b,S,t,r)),y=({children:b,nonce:S}={})=>P(`<style id="${e}"${S?` nonce="${S}"`:""}>${b?b[I]:""}</style>`,[({context:A})=>{i.set(A,S)}]);return y[K]=n,{css:f,cx:p,keyframes:a,viewTransition:h,Style:y}},be=yo({id:Oe}),u=be.css,Ci=be.cx,Le=be.keyframes,wi=be.viewTransition,Xt=be.Style;var Qt=["0-5","6-11","12-17","18-24","25-34","35-44","45-59","60+"],er={loading:!1,error:null,members:[],lookups:{parentesco:[],specificities:[]},selectedSpecificityId:null,originalSpecificityId:null,saving:!1,ageProfile:{"0-5":0,"6-11":0,"12-17":0,"18-24":0,"25-34":0,"35-44":0,"45-59":0,"60+":0}};var at=(e,t)=>{let r,o,n;if(e.includes("/")){let f=e.split("/");n=parseInt(f[0]??"0",10),o=parseInt(f[1]??"0",10),r=parseInt(f[2]??"0",10)}else{let f=e.split("-");r=parseInt(f[0]??"0",10),o=parseInt(f[1]??"0",10),n=parseInt(f[2]??"0",10)}let s=t.getFullYear(),i=t.getMonth()+1,l=t.getDate(),d=s-r;return(i<o||i===o&&l<n)&&(d-=1),Math.max(0,d)},go=e=>e<=5?"0-5":e<=11?"6-11":e<=17?"12-17":e<=24?"18-24":e<=34?"25-34":e<=44?"35-44":e<=59?"45-59":"60+",Ne=(e,t)=>{let r={};for(let o of Qt)r[o]=0;for(let o of e){if(!o.birthDate)continue;let n=at(o.birthDate,t),s=go(n);r[s]=(r[s]??0)+1}return r};var tr=(e,t)=>{switch(t.type){case"LOAD_START":return{...e,loading:!0,error:null};case"LOAD_SUCCESS":{let r=Ne(t.members,new Date);return{...e,loading:!1,error:null,members:t.members,lookups:t.lookups,selectedSpecificityId:t.specificityId,originalSpecificityId:t.specificityId,ageProfile:r}}case"LOAD_FAILURE":return{...e,loading:!1,error:t.error};case"ADD_MEMBER":{let r=[...e.members,t.member],o=Ne(r,new Date);return{...e,members:r,ageProfile:o}}case"UPDATE_MEMBER":{let r=e.members.map((n,s)=>s===t.index?t.member:n),o=Ne(r,new Date);return{...e,members:r,ageProfile:o}}case"REMOVE_MEMBER":{let r=e.members.filter(n=>n.personId!==t.personId),o=Ne(r,new Date);return{...e,members:r,ageProfile:o}}case"SET_CAREGIVER":return{...e,members:e.members.map(r=>({...r,isPrimaryCaregiver:r.personId===t.personId}))};case"TOGGLE_DOCUMENT":return{...e,members:e.members.map(r=>{if(r.personId!==t.personId)return r;let o=r.requiredDocuments.includes(t.doc)?r.requiredDocuments.filter(n=>n!==t.doc):[...r.requiredDocuments,t.doc];return{...r,requiredDocuments:o}})};case"SET_SPECIFICITY":return{...e,selectedSpecificityId:t.id};case"SAVE_START":return{...e,saving:!0};case"SAVE_SUCCESS":return{...e,saving:!1,originalSpecificityId:e.selectedSpecificityId};case"SAVE_FAILURE":return{...e,saving:!1,error:t.error}}};var Se={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Fe=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},bo=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Be=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:Se});return Fe(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},rr=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:Se});return bo(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},ze=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:Se,body:JSON.stringify(t)});return Fe(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},or=async(e,t)=>{try{let r=await fetch(e,{method:"PUT",credentials:"same-origin",headers:Se,body:JSON.stringify(t)});return Fe(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var nr=async e=>{try{let t=await fetch(e,{method:"DELETE",credentials:"same-origin",headers:Se});return Fe(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var sr={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),rr(`/api/v1/patients?${o.toString()}`)},getById:e=>Be(`/api/v1/patients/${e}`),create:e=>ze("/api/v1/patients",e)};var ct=new Map,lt={getTable:async e=>{let t=ct.get(e);if(t)return{ok:!0,value:t};let r=await Be(`/api/v1/lookups/${e}`);return r.ok&&ct.set(e,r.value),r},clearCache:()=>{ct.clear()}};var Ve={addMember:(e,t)=>ze(`/api/v1/patients/${e}/family-members`,t),removeMember:(e,t)=>nr(`/api/v1/patients/${e}/family-members/${t}`),assignPrimaryCaregiver:(e,t)=>or(`/api/v1/patients/${e}/primary-caregiver`,t)};var m={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},w=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},g={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},k={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},v={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},He={button:u`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:u`box-shadow: -8px 0 40px ${w(m.textPrimary,.3)};`,fab:u`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:u`box-shadow: 0 24px 80px ${m.inputLine};`,modal:u`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},j={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var So=u`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  color: ${m.textSageMuted};
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms ease;
  margin-bottom: 1.5rem;

  &:hover {
    color: ${m.textSageSecondary};
    text-decoration: underline;
  }
`,ir=()=>c("a",{href:"/social-care",class:So,"aria-label":"Voltar para lista de fam\xEDlias",children:"\u2190 Voltar para Fam\xEDlias"});var Eo=u`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${v[3]};
`,ko=u`
  font-family: ${g.satoshi};
  font-size: 38px;
  font-weight: ${k.bold};
  color: ${m.textPrimary};
  line-height: 1.2;
`,vo=u`
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
  ${He.fab}
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`,ar=({onAdd:e})=>c("div",{class:Eo,children:[c("h1",{class:ko,children:"Composicao Familiar"}),c("button",{class:vo,onClick:e,"aria-label":"Adicionar membro",children:"+"})]});var $o=u`
  display: table-row;
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${k.medium};
  color: ${m.textPrimary};
`,Co=u`
  background: ${w(m.primary,.05)};
`,wo=u`
  background: ${w(m.backgroundDark,.04)};
`,q=u`
  padding: 12px 8px;
  vertical-align: middle;
  border-bottom: 1px solid ${m.inputLine};
`,cr=u`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: ${k.bold};
  letter-spacing: 0.3px;
`,Ro=u`
  ${cr}
  background: ${w(m.primary,.12)};
  color: ${m.primary};
`,Ao=u`
  ${cr}
  background: ${w(m.backgroundDark,.1)};
  color: ${m.backgroundDark};
`,ft=u`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`,To=u`
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.4;
  cursor: default;
`,lr=({member:e,onEdit:t,onRemove:r,onSetCaregiver:o})=>{let n=at(e.birthDate,new Date),s=e.isPR?Co:e.isPrimaryCaregiver?wo:$o;return c("tr",{class:s,children:[c("td",{class:q,children:[e.name,e.isPR&&c("span",{class:Ro,children:" Referencia"}),e.isPrimaryCaregiver&&!e.isPR&&c("span",{class:Ao,children:" Cuidador"})]}),c("td",{class:q,children:n}),c("td",{class:q,children:e.sex}),c("td",{class:q,children:e.relationshipLabel}),c("td",{class:q,children:e.residesWithPatient?"Sim":"Nao"}),c("td",{class:q,children:e.hasDisability?"Sim":"Nao"}),c("td",{class:q,children:e.requiredDocuments.join(", ")||"-"}),c("td",{class:q,children:[c("button",{class:ft,onClick:o,title:"Definir cuidador",children:"\u2605"}),c("button",{class:ft,onClick:t,title:"Editar",children:"\u270E"}),e.isPR?c("span",{class:To,title:"Pessoa de referencia nao pode ser removida",children:"\u{1F512}"}):c("button",{class:ft,onClick:r,title:"Remover",children:"\u{1F5D1}"})]})]})};var Do=u`
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
`,Po=u`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${k.bold};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  color: ${m.textMuted};
  text-align: left;
  padding: 12px 8px;
  border-bottom: 2px solid ${m.inputLine};
`,Oo=["Nome","Idade","Sexo","Parentesco","Reside","PcD","Docs","Acoes"],fr=({members:e,onEdit:t,onRemove:r,onSetCaregiver:o})=>c("table",{class:Do,children:[c("thead",{children:c("tr",{children:Oo.map(n=>c("th",{class:Po,children:n},n))})}),c("tbody",{children:e.map((n,s)=>c(lr,{member:n,onEdit:()=>t(s),onRemove:()=>r(n.personId),onSetCaregiver:()=>o(n.personId)},n.personId))})]});var _o=u`
  position: fixed;
  inset: 0;
  background: ${w(m.textPrimary,.4)};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`,Io=e=>u`
  background: ${m.backgroundDark};
  border-radius: ${j.modal};
  ${He.modal}
  padding: ${v[6]};
  max-width: ${e};
  width: 92vw;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
`,pr=({maxWidth:e,children:t,onClose:r})=>c("div",{class:_o,onClick:r,children:c("div",{class:Io(e??"760px"),onClick:o=>o.stopPropagation(),children:t})});var Mo=u`
  display: flex;
  gap: ${v[5]};
  flex-wrap: wrap;
`,jo=u`
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`,Lo=u`
  flex: 0 1 220px;
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid ${w(m.background,.2)};
  border-radius: ${j.dropdown};
  padding: ${v[2]};
`,No=u`
  font-family: ${g.satoshi};
  font-size: 22px;
  font-weight: ${k.bold};
  color: ${m.background};
  margin-bottom: ${v[4]};
`,pt=u`
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${k.bold};
  color: ${w(m.background,.5)};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  margin-bottom: 4px;
`,ut=u`
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
`,Fo=u`
  ${ut}
  appearance: none;
  cursor: pointer;
`,Bo=e=>u`
  padding: 8px 12px;
  font-family: ${g.satoshi};
  font-size: 13px;
  color: ${m.background};
  cursor: pointer;
  border-radius: 4px;
  font-weight: ${e?k.semibold:k.regular};
  background: ${e?w(m.background,.1):"transparent"};
  &:hover { background: ${w(m.background,.05)}; }
`,dt=u`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${m.background};
  font-family: ${g.satoshi};
  font-size: 14px;
`,zo=u`
  margin-top: ${v[4]};
  padding: 12px 32px;
  border-radius: ${j.pill};
  border: none;
  background: ${m.primary};
  color: white;
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${k.bold};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`,dr=({lookups:e,onSave:t,onClose:r,editMember:o})=>{let n=!!o,[s,i]=O(o?.name??""),[l,d]=O(o?.birthDate??""),[f,p]=O(o?.sex??""),[a,h]=O(o?.residesWithPatient??!0),[y,b]=O(o?.hasDisability??!1),[S,A]=O(o?.isPrimaryCaregiver??!1),[L,W]=O(o?.relationshipId??"");return c(pr,{onClose:r,maxWidth:"760px",children:[c("h2",{class:No,children:n?"Editar Membro":"Adicionar Membro"}),c("div",{class:Mo,children:[c("div",{class:jo,children:[c("div",{children:[c("label",{class:pt,children:"Nome *"}),c("input",{class:ut,value:s,onInput:x=>i(x.target.value),placeholder:"Nome completo",disabled:n})]}),c("div",{children:[c("label",{class:pt,children:"Data Nasc. *"}),c("input",{class:ut,type:"date",value:l,onInput:x=>d(x.target.value),disabled:n})]}),c("div",{children:[c("label",{class:pt,children:"Sexo *"}),c("select",{class:Fo,value:f,onChange:x=>p(x.target.value),disabled:n,children:[c("option",{value:"",children:"Selecione"}),c("option",{value:"Masculino",children:"Masculino"}),c("option",{value:"Feminino",children:"Feminino"})]})]}),c("label",{class:dt,children:[c("input",{type:"checkbox",checked:a,onChange:()=>h(!a)}),"Reside com paciente"]}),c("label",{class:dt,children:[c("input",{type:"checkbox",checked:y,onChange:()=>b(!y)}),"Pessoa com deficiencia"]}),c("label",{class:dt,children:[c("input",{type:"checkbox",checked:S,onChange:()=>A(!S)}),"Cuidador principal"]}),c("button",{class:zo,onClick:()=>{if(!s||!l||!f||!L)return;let x=e.find($=>$.id===L);t({personId:o?.personId??crypto.randomUUID(),name:s,birthDate:l,sex:f,relationshipId:L,relationshipLabel:x?.descricao??"",residesWithPatient:a,hasDisability:y,isPrimaryCaregiver:S,isPR:o?.isPR??!1,requiredDocuments:o?.requiredDocuments??[]})},children:n?"Salvar alteracoes":"Adicionar"})]}),c("div",{class:Lo,children:e.map(x=>c("div",{class:Bo(L===x.id),onClick:()=>W(x.id),children:x.descricao},x.id))})]})]})};var Vo=u`
  position: fixed;
  inset: 0;
  background: rgba(248,243,236,0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`,Ho=Le`
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`,Uo=u`
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${m.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  max-width: 400px;
  width: 90%;
  box-shadow: 0 16px 64px rgba(0,0,0,0.08);
  text-align: center;
  animation: ${Ho} 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Wo=u`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${w(m.dangerAlt,.08)};
  color: ${m.dangerAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 1rem;
`,Ko=u`
  font-family: ${g.erode};
  font-size: clamp(1.125rem, 1rem + 0.25vw, 1.25rem);
  font-weight: ${k.bold};
  color: ${m.textSagePrimary};
  margin-bottom: 0.5rem;
`,qo=u`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  color: ${m.textSageMuted};
  line-height: 1.5;
  margin-bottom: 1.5rem;
`,Go=u`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`,Zo=u`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${k.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${j.pill};
  background: transparent;
  border: 1.5px solid ${w(m.primary,.2)};
  color: ${m.textSageMuted};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${w(m.primary,.4)};
    color: ${m.textSageSecondary};
  }
`,Yo=u`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${k.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${j.pill};
  background: transparent;
  border: 1.5px solid ${w(m.dangerAlt,.2)};
  color: ${m.dangerAlt};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${m.dangerAlt};
    background: ${w(m.dangerAlt,.08)};
  }
`,ur=({name:e,onConfirm:t,onCancel:r})=>c("div",{class:Vo,onClick:r,role:"dialog","aria-modal":"true","aria-label":"Confirmar remocao",children:c("div",{class:Uo,onClick:o=>o.stopPropagation(),children:[c("div",{class:Wo,"aria-hidden":"true",children:"\u26A0"}),c("div",{class:Ko,children:"Remover membro?"}),c("div",{class:qo,children:["Tem certeza que deseja remover ",c("strong",{children:e})," da composi\xE7\xE3o familiar? Esta a\xE7\xE3o n\xE3o pode ser desfeita."]}),c("div",{class:Go,children:[c("button",{type:"button",class:Zo,onClick:r,"aria-label":"Cancelar",children:"Cancelar"}),c("button",{type:"button",class:Yo,onClick:t,"aria-label":"Remover membro",children:"Remover"})]})]})});var Jo=u`
  margin-top: ${v[5]};
`,Xo=u`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${k.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${m.textMuted};
  margin-bottom: ${v[3]};
`,Qo=u`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,en=e=>u`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${e?w(m.primary,.06):"transparent"};
  transition: background 0.15s;
  &:hover { background: ${w(m.primary,.04)}; }
`,tn=u`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 2px solid ${m.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,rn=u`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${m.textPrimary};
`,on=u`
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${k.regular};
  color: ${m.textPrimary};
`,mr=({items:e,selectedId:t,onSelect:r})=>c("div",{class:Jo,children:[c("h3",{class:Xo,children:"Especificidades Sociais"}),c("div",{class:Qo,children:e.map(o=>c("div",{class:en(t===o.id),onClick:()=>r(o.id),children:[c("div",{class:tn,children:t===o.id&&c("div",{class:rn})}),c("span",{class:on,children:o.descricao})]},o.id))})]});var nn=u`
  margin-top: ${v[5]};
`,sn=u`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${k.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${m.textMuted};
  margin-bottom: ${v[3]};
`,an=u`
  width: 100%;
  max-width: 320px;
  border-collapse: collapse;
`,cn=e=>u`
  background: ${e?w(m.primary,.07):"transparent"};
`,hr=u`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${k.medium};
  color: ${m.textPrimary};
  padding: 8px 12px;
  border-bottom: 1px solid ${m.inputLine};
`,ln=u`
  ${hr}
  text-align: right;
  font-weight: ${k.bold};
`,fn={"0-5":"0 a 5 anos","6-11":"6 a 11 anos","12-17":"12 a 17 anos","18-24":"18 a 24 anos","25-34":"25 a 34 anos","35-44":"35 a 44 anos","45-59":"45 a 59 anos","60+":"60 anos ou mais"},xr=({ageProfile:e})=>c("div",{class:nn,children:[c("h3",{class:sn,children:"Perfil Etario"}),c("table",{class:an,children:c("tbody",{children:Object.entries(fn).map(([t,r])=>{let o=e[t]??0;return c("tr",{class:cn(o>0),children:[c("td",{class:hr,children:r}),c("td",{class:ln,children:o})]},t)})})})]});var pn=Le`
  to { transform: rotate(360deg); }
`,dn=u`
  width: 32px;
  height: 32px;
  border: 3px solid ${m.inputLine};
  border-top-color: ${m.primary};
  border-radius: 50%;
  animation: ${pn} 0.8s linear infinite;
`,yr=()=>c("div",{class:dn});var _a=u`
  border: none;
  border-bottom: 2px solid ${m.inputLine};
  background: transparent;
  padding: ${v[2]} 0;
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${k.regular};
  color: ${m.textPrimary};
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease;
  &:focus {
    border-bottom-color: ${m.primary};
  }
`,Ia=u`
  border-bottom-color: ${m.danger};
  &:focus {
    border-bottom-color: ${m.danger};
  }
`,Ma=u`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${k.bold};
  color: ${m.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,ja=u`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${m.primary};
  color: ${m.surfaceLight};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${k.medium};
  border: none;
  border-radius: ${j.pill};
  padding: ${v[3]} ${v[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
  &:active {
    opacity: 0.8;
  }
`,La=u`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${m.primary};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${k.medium};
  border: 2px solid ${m.primary};
  border-radius: ${j.pill};
  padding: ${v[3]} ${v[5]};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${m.primary};
    color: ${m.surfaceLight};
  }
`,Na=u`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${m.danger};
  color: ${m.surfaceLight};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${k.medium};
  border: none;
  border-radius: ${j.pill};
  padding: ${v[3]} ${v[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
`,Fa=u`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,Ba=u`
  background: ${m.surface};
  border-radius: ${j.card};
  padding: ${v[4]};
  transition: box-shadow 0.2s ease;
`,za=u`
  &:hover {
    box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);
  }
`,Va=u`
  display: flex;
  flex-direction: column;
  gap: ${v[3]};
`,Ha=u`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${v[3]};
`,Ua=u`
  display: flex;
  align-items: center;
  justify-content: center;
`,Wa=u`
  font-family: ${g.satoshi};
  font-weight: ${k.bold};
  color: ${m.textPrimary};
  line-height: 1.2;
`,Ka=u`
  font-family: ${g.satoshi};
  font-weight: ${k.regular};
  font-size: 16px;
  color: ${m.textPrimary};
  line-height: 1.5;
`,qa=u`
  font-family: ${g.satoshi};
  font-size: 11px;
  color: ${m.textMuted};
  line-height: 1.4;
`,Ga=u`
  font-family: ${g.satoshi};
  font-size: 11px;
  color: ${m.danger};
  line-height: 1.4;
`,Za=u`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${k.bold};
  color: ${m.textMuted};
  text-transform: uppercase;
  letter-spacing: 1.5px;
`,mt=u`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${v[4]} 48px;

  @media (max-width: 1200px) {
    padding: ${v[4]} 40px;
  }

  @media (max-width: 600px) {
    padding: ${v[3]} 20px;
  }
`;var un=u`
  margin-top: ${v[4]};
`,gr=({patientId:e})=>{let[t,r]=tt(tr,er),[o,n]=O({open:!1}),[s,i]=O({open:!1});rt(()=>{r({type:"LOAD_START"}),(async()=>{let[a,h,y]=await Promise.all([sr.getById(e),lt.getTable("parentesco"),lt.getTable("specificities")]);if(!a.ok){r({type:"LOAD_FAILURE",error:a.error});return}let b=a.value.familyMembers.map(S=>({personId:S.memberId,name:S.fullName,birthDate:"",sex:"",relationshipId:"",relationshipLabel:S.relationship,residesWithPatient:!0,hasDisability:!1,isPrimaryCaregiver:!1,isPR:!1,requiredDocuments:[]}));r({type:"LOAD_SUCCESS",members:b,lookups:{parentesco:h.ok?h.value.map(S=>({id:S.id,codigo:S.code,descricao:S.description,ativo:S.active})):[],specificities:y.ok?y.value.map(S=>({id:S.id,codigo:S.code,descricao:S.description,ativo:S.active})):[]},specificityId:null})})()},[e]);let l=p=>{o.open&&o.editIndex!==null?r({type:"UPDATE_MEMBER",index:o.editIndex,member:p}):(r({type:"ADD_MEMBER",member:p}),Ve.addMember(e,p)),n({open:!1})},d=p=>{r({type:"REMOVE_MEMBER",personId:p}),Ve.removeMember(e,p),i({open:!1})};if(t.loading)return c("div",{class:mt,children:c(yr,{})});let f=t.members[0]?.name.split(" ").slice(-1)[0]??"";return c("div",{class:mt,children:[c(ir,{lastName:f}),c(ar,{onAdd:()=>n({open:!0,editIndex:null})}),c("div",{class:un,children:[c(fr,{members:t.members,onEdit:p=>n({open:!0,editIndex:p}),onRemove:p=>{let a=t.members.find(h=>h.personId===p);i({open:!0,personId:p,name:a?.name??""})},onSetCaregiver:p=>{r({type:"SET_CAREGIVER",personId:p}),Ve.assignPrimaryCaregiver(e,{memberId:p})}}),c(mr,{items:t.lookups.specificities,selectedId:t.selectedSpecificityId,onSelect:p=>r({type:"SET_SPECIFICITY",id:p})}),c(xr,{ageProfile:t.ageProfile})]}),o.open&&c(dr,{lookups:t.lookups.parentesco,onSave:l,onClose:()=>n({open:!1}),editMember:o.editIndex!==null?t.members[o.editIndex]:void 0}),s.open&&c(ur,{title:"Remover membro",message:`Tem certeza que deseja remover ${s.name} da composicao familiar?`,confirmLabel:"Remover",onConfirm:()=>d(s.personId),onCancel:()=>i({open:!1})})]})};var br=document.getElementById("family-app");if(br){let e=window.location.pathname.split("/"),t=e[e.indexOf("family-composition")+1]??"";Je(c(Ae,{children:[c(Xt,{}),c(gr,{patientId:t})]}),br)}
