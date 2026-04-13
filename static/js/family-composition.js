var Dr=Object.defineProperty;var Tr=(e,t)=>{for(var r in t)Dr(e,r,{get:t[r],enumerable:!0})};var Pr={Stringify:1,BeforeStream:2,Stream:3},M=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Ir=/[&<>'"]/,Ee=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let s=o[n];typeof s=="object"&&t.push(...s.callbacks||[]);let l=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??l)r+=s;else{let p=[r];N(s,p),r=p[0]}}return M(r,t)},N=(e,t)=>{let r=e.search(Ir);if(r===-1){t[0]+=e;return}let o,n,s=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,n)+o,s=n+1}t[0]+=e.substring(s,n)},Ye=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:Pr.Stringify,buffer:r,context:o})),r[0]};var K=Symbol("RENDERER"),Q=Symbol("ERROR_HANDLER"),C=Symbol("STASH"),we=Symbol("INTERNAL"),ke=Symbol("MEMO"),ee=Symbol("PERMALINK");var Ge=e=>(e[we]=!0,e);var Xe=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:Ge(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:Ge(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[Q]=s=>{throw e.pop(),s},n},se=e=>{let t=[e],r=Xe(t);return r.values=t,r.Provider=r,V.push(r),r};var V=[],vt=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new ae("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>M(s,s.callbacks)):(t.pop(),M(n))};return r.values=t,r.Provider=r,r[K]=Xe(t),V.push(r),r},z=e=>e.values.at(-1);var te={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},le={},H="data-precedence",Ce=e=>e.rel==="stylesheet"&&"precedence"in e,Ae=(e,t)=>e==="link"?t:te[e].length>0;var pe={};Tr(pe,{button:()=>Br,form:()=>zr,input:()=>Fr,link:()=>Or,meta:()=>Lr,script:()=>jr,style:()=>_r,title:()=>Mr});var Y=e=>Array.isArray(e)?e:[e];var $t=new WeakMap,Et=(e,t,r,o)=>({buffer:n,context:s})=>{if(!n)return;let l=$t.get(s)||{};$t.set(s,l);let p=l[e]||=[],f=!1,m=te[e],u=Ae(e,o!==void 0);if(u){e:for(let[,d]of p)if(!(e==="link"&&!(d.rel==="stylesheet"&&d[H]!==void 0))){for(let h of m)if((d?.[h]??null)===r?.[h]){f=!0;break e}}}if(f?n[0]=n[0].replaceAll(t,""):u||e==="link"?p.push([t,r,o]):p.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let d;if(e==="link"||o!==void 0){let h=[];d=p.map(([S,,y],k)=>{if(y===void 0)return[S,Number.MAX_SAFE_INTEGER,k];let A=h.indexOf(y);return A===-1&&(h.push(y),A=h.length-1),[S,A,k]}).sort((S,y)=>S[1]-y[1]||S[2]-y[2]).map(([S])=>S)}else d=p.map(([h])=>h);d.forEach(h=>{n[0]=n[0].replaceAll(h,"")}),n[0]=n[0].replace(/(?=<\/head>)/,d.join(""))}},ce=(e,t,r)=>M(new _(e,r,Y(t??[])).toString()),de=(e,t,r,o)=>{if("itemProp"in r)return ce(e,t,r);let{precedence:n,blocking:s,...l}=r;n=o?n??"":void 0,o&&(l[H]=n);let p=new _(e,l,Y(t||[])).toString();return p instanceof Promise?p.then(f=>M(p,[...f.callbacks||[],Et(e,f,l,n)])):M(p,[Et(e,p,l,n)])},Mr=({children:e,...t})=>{let r=Re();if(r){let o=z(r);if(o==="svg"||o==="head")return new _("title",t,Y(e??[]))}return de("title",e,t,!1)},jr=({children:e,...t})=>{let r=Re();return["src","async"].some(o=>!t[o])||r&&z(r)==="head"?ce("script",e,t):de("script",e,t,!1)},_r=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,de("style",e,t,!0)):ce("style",e,t),Or=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?ce("link",e,t):de("link",e,t,Ce(t)),Lr=({children:e,...t})=>{let r=Re();return r&&z(r)==="head"?ce("meta",e,t):de("meta",e,t,!1)},wt=(e,{children:t,...r})=>new _(e,r,Y(t??[])),zr=e=>(typeof e.action=="function"&&(e.action=ee in e.action?e.action[ee]:void 0),wt("form",e)),kt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=ee in t.formAction?t.formAction[ee]:void 0),wt(e,t)),Fr=e=>kt("input",e),Br=e=>kt("button",e);var Nr=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),re=e=>Nr.get(e)||e,me=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var ue,Re=()=>ue,Vr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Hr=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Wr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ze=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")N(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof _?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):Ze(n,t)}}},_=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Ye(M(t[0],t.callbacks)).toString():t[0]:Ee(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let s=ue&&z(ue)==="svg"?l=>Vr(re(l)):l=>re(l);for(let[l,p]of Object.entries(o))if(l=s(l),l!=="children"){if(l==="style"&&typeof p=="object"){let f="";me(p,(m,u)=>{u!=null&&(f+=`${f?";":""}${m}:${u}`)}),t[0]+=' style="',N(f,t),t[0]+='"'}else if(typeof p=="string")t[0]+=` ${l}="`,N(p,t),t[0]+='"';else if(p!=null)if(typeof p=="number"||p.isEscaped)t[0]+=` ${l}="${p}"`;else if(typeof p=="boolean"&&Wr.includes(l))p&&(t[0]+=` ${l}=""`);else if(l==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[M(p.__html)]}else if(p instanceof Promise)t[0]+=` ${l}="`,t.unshift('"',p);else if(typeof p=="function"){if(!l.startsWith("on")&&l!=="ref")throw new Error(`Invalid prop '${l}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${l}="`,N(p.toString(),t),t[0]+='"'}if(Hr.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",Ze(n,t),t[0]+=`</${r}>`}},fe=class extends _{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(V.length===0)t.unshift("",n);else{let s=V.map(l=>[l,l.values.at(-1)]);t.unshift("",n.then(l=>(l instanceof _&&(l.localContexts=s),l)))}else n instanceof _?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):N(n,t)}},ae=class extends _{toStringToBuffer(t){Ze(this.children,t)}};var Ct=!1,De=(e,t,r)=>{if(!Ct){for(let o in le)pe[o][K]=le[o];Ct=!0}return typeof e=="function"?new fe(e,t,r):pe[e]?new fe(pe[e],t,r):e==="svg"||e==="head"?(ue||=vt(""),new _(e,t,[new fe(ue,{value:e},r)])):new _(e,t,r)};var oe=({children:e})=>new ae("",{children:e},Array.isArray(e)?e:e?[e]:[]);function i(e,t,r){let o;if(!t||!("children"in t))o=De(e,t,[]);else{let n=t.children;o=Array.isArray(n)?De(e,t,n):De(e,t,[n])}return o.key=r,o}var he="_hp",Ur={Change:"Input",DoubleClick:"DblClick"},Kr={svg:"2000/svg",math:"1998/Math/MathML"},G=[],Qe=new WeakMap,ne,Mt=()=>ne,W=e=>"t"in e,Je={onClick:["click",!1]},At=e=>{if(!e.startsWith("on"))return;if(Je[e])return Je[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return Je[e]=[(Ur[r]||r).toLowerCase(),!!o]}},Rt=(e,t)=>ne&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,jt=e=>e==null||e===!1?null:e,qr=(e,t)=>{"value"in t&&(e.value=jt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Yr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=re(o);let s=At(o);if(s){if(r?.[o]!==n&&(r&&e.removeEventListener(s[0],r[o],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let l;typeof n=="function"?l=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,l=()=>n.current=null),Qe.set(e,l)}else if(o==="style"){let l=e.style;typeof n=="string"?l.cssText=n:(l.cssText="",n!=null&&me(n,l.setProperty.bind(l)))}else{if(o==="value"){let p=e.nodeName;if(p==="SELECT")continue;if((p==="INPUT"||p==="TEXTAREA")&&(e.value=jt(n),p==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let l=Rt(e,o);n==null||n===!1?e.removeAttribute(l):n===!0?e.setAttribute(l,""):typeof n=="string"||typeof n=="number"?e.setAttribute(l,n):e.setAttribute(l,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=re(o);let s=At(o);s?e.removeEventListener(s[0],n,s[1]):o==="ref"?Qe.get(e)?.():e.removeAttribute(Rt(e,o))}}},Gr=(e,t)=>{t[C][0]=0,G.push([e,t]);let r=t.tag[K]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{G.pop()}},_t=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[C][1][Ie]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(W(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let l=r.length;if(_t(s,t,r,o,n),s.s){for(let p=l;p<r.length;p++)r[p].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},Xr=e=>{for(;e&&(e.tag===he||!e.e);)e=e.tag===he||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Ot=e=>{W(e)||(e[C]?.[1][Ie]?.forEach(t=>t[2]?.()),Qe.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Ot)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(xe.delete(e),Te.delete(e),delete e[C][3],e.a=!0)},et=(e,t,r)=>{e.c=t,Lt(e,t,r)},Dt=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},Tt=Symbol(),Lt=(e,t,r)=>{let o=[],n=[],s=[];_t(e,t,o,n,s),n.forEach(Ot);let l=r?void 0:t.childNodes,p,f=null;if(r)p=-1;else if(!l.length)p=0;else{let m=Dt(l,Xr(e.nN));m!==void 0?(f=l[m],p=m):p=Dt(l,o.find(u=>u.tag!==he&&u.e)?.e)??-1,p===-1&&(r=!0)}for(let m=0,u=o.length;m<u;m++,p++){let d=o[m],h;if(d.s&&d.e)h=d.e,d.s=!1;else{let S=r||!d.e;W(d)?(d.e&&d.d&&(d.e.textContent=d.t),d.d=!1,h=d.e||=document.createTextNode(d.t)):(h=d.e||=d.n?document.createElementNS(d.n,d.tag):document.createElement(d.tag),Yr(h,d.props,d.pP),Lt(d,h,S),d.tag==="select"&&qr(h,d.props))}d.tag===he?p--:r?h.parentNode||t.appendChild(h):l[p]!==h&&l[p-1]!==h&&(l[p+1]===h?t.appendChild(l[p]):t.insertBefore(h,f||l[p]||null))}if(e.pP&&(e.pP=void 0),s.length){let m=[],u=[];s.forEach(([,d,,h,S])=>{d&&m.push(d),h&&u.push(h),S?.()}),m.forEach(d=>d()),u.length&&requestAnimationFrame(()=>{u.forEach(d=>d())})}},Zr=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Te=new WeakMap,Pe=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?Gr(e,t):Y(t.props.children),r[0]?.tag===""&&r[0][Q]&&(n=r[0][Q],e[5].push([e,n,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,l=[],p;for(let f=0;f<r.length;f++){if(Array.isArray(r[f])){r.splice(f,1,...r[f].flat(1/0)),f--;continue}let m=zt(r[f]);if(m){typeof m.tag=="function"&&!m.tag[we]&&(V.length>0&&(m[C][2]=V.map(d=>[d,d.values.at(-1)])),e[5]?.length&&(m[C][3]=e[5].at(-1)));let u;if(s&&s.length){let d=s.findIndex(W(m)?h=>W(h):m.key!==void 0?h=>h.key===m.key&&h.tag===m.tag:h=>h.tag===m.tag);d!==-1&&(u=s[d],s.splice(d,1))}if(u)if(W(m))u.t!==m.t&&(u.t=m.t,u.d=!0),m=u;else{let d=u.pP=u.props;if(u.props=m.props,u.f||=m.f||t.f,typeof m.tag=="function"){let h=u[C][2];u[C][2]=m[C][2]||[],u[C][3]=m[C][3],!u.f&&((u.o||u)===m.o||u.tag[ke]?.(d,u.props))&&Zr(h,u[C][2])&&(u.s=!0)}m=u}else if(!W(m)&&ne){let d=z(ne);d&&(m.n=d)}if(!W(m)&&!m.s&&(Pe(e,m),delete m.f),l.push(m),p&&!p.s&&!m.s)for(let d=p;d&&!W(d);d=d.vC?.at(-1))d.nN=m;p=m}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=l,o&&delete t.pC}catch(s){if(t.f=!0,s===Tt){if(n)return;throw s}let[l,p,f]=t[C]?.[3]||[];if(p){let m=()=>ge([0,!1,e[2]],f),u=Te.get(f)||[];u.push(m),Te.set(f,u);let d=p(s,()=>{let h=Te.get(f);if(h){let S=h.indexOf(m);if(S!==-1)return h.splice(S,1),m()}});if(d){if(e[0]===1)e[1]=!0;else if(Pe(e,f,[d]),(p.length===1||e!==l)&&f.c){et(f,f.c,!1);return}throw Tt}}throw s}finally{n&&e[5].pop()}},zt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[C]=[0,[]];else{let t=Kr[e.tag];t&&(ne||=se(""),e.props.children=[{tag:ne,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Ft=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Ft(o,t,r)))},Pt=(e,t)=>{t[C][2]?.forEach(([r,o])=>{r.values.push(o)});try{Pe(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[C][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&et(t,t.c,!1)},xe=new WeakMap,It=[],ge=async(e,t)=>{e[5]||=[];let r=xe.get(t);r&&r[0](void 0);let o,n=new Promise(s=>o=s);if(xe.set(t,[o,()=>{e[2]?e[2](e,t,s=>{Pt(s,t)}).then(()=>o(t)):(Pt(e,t),o(t))}]),It.length)It.at(-1).add(t);else{await Promise.resolve();let s=xe.get(t);s&&(xe.delete(t),s[1]())}return n},Jr=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Pe(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();et(e,o,!0),Ft(e,o,t),t.replaceChildren(o)},tt=(e,t)=>{Jr(zt({tag:"",props:{children:e}}),t)};var rt=(e,t,r)=>({tag:he,props:{children:e},key:r,e:t,p:1});var Qr=0,Ie=1,eo=2,to=3;var ot=new WeakMap,nt=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var ro;var Bt=[];var P=e=>{let t=()=>typeof e=="function"?e():e,r=G.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[C][1][Qr]||=[],s=o[C][0]++;return n[s]||=[t(),l=>{let p=ro,f=n[s];if(typeof l=="function"&&(l=l(f[0])),!Object.is(l,f[0]))if(f[0]=l,Bt.length){let[m,u]=Bt.at(-1);Promise.all([m===3?o:ge([m,!1,p],o),u]).then(([d])=>{if(!d||!(m===2||m===3))return;let h=d.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===d.vC&&ge([m===3?1:0,!1,p],d)})})})}else ge([0,!1,p],o)}]},it=(e,t,r)=>{let o=X(l=>{s(p=>e(p,l))},[e]),[n,s]=P(()=>r?r(t):t);return[n,o]},oo=(e,t,r)=>{let o=G.at(-1);if(!o)return;let[,n]=o,s=n[C][1][Ie]||=[],l=n[C][0]++,[p,,f]=s[l]||=[];if(nt(p,r)){f&&f();let m=()=>{u[e]=void 0,u[2]=t()},u=[r,void 0,void 0,void 0,void 0];u[e]=m,s[l]=u}},st=(e,t)=>oo(3,e,t);var X=(e,t)=>{let r=G.at(-1);if(!r)return e;let[,o]=r,n=o[C][1][eo]||=[],s=o[C][0]++,l=n[s];return nt(l?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var at=e=>{let t=ot.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>ot.set(e,[r]),r=>ot.set(e,[void 0,r])),e},lt=(e,t)=>{let r=G.at(-1);if(!r)return e();let[,o]=r,n=o[C][1][to]||=[],s=o[C][0]++,l=n[s];return nt(l?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Vt=se({pending:!1,data:null,method:null,action:null}),Nt=new Set,Ht=e=>{Nt.add(e),e.finally(()=>Nt.delete(e))};var ct=(e,t)=>lt(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),Wt=Object.create(null),Ut=Object.create(null),ye=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:l,onError:p,precedence:f,blocking:m,...u}=t,d=null,h=!1,S=te[e],y=Ae(e,o),k=E=>E.getAttribute("rel")==="stylesheet"&&E.getAttribute(H)!==null,A;if(y){let E=s.querySelectorAll(e);e:for(let b of E)if(!(e==="link"&&!k(b))){for(let v of S)if(b.getAttribute(v)===t[v]){d=b;break e}}if(!d){let b=S.reduce((v,D)=>t[D]===void 0?v:`${v}-${D}-${t[D]}`,e);h=!Ut[b],d=Ut[b]||=(()=>{let v=document.createElement(e);for(let D of S)t[D]!==void 0&&v.setAttribute(D,t[D]);return t.rel&&v.setAttribute("rel",t.rel),v})()}}else A=s.querySelectorAll(e);f=o?f??"":void 0,o&&(u[H]=f);let R=X(E=>{if(y){if(e==="link"&&f!==void 0){let v=!1;for(let D of s.querySelectorAll(e)){let L=D.getAttribute(H);if(L===null){s.insertBefore(E,D);return}if(v&&L!==f){s.insertBefore(E,D);return}L===f&&(v=!0)}s.appendChild(E);return}let b=!1;for(let v of s.querySelectorAll(e)){if(b&&v.getAttribute(H)!==f){s.insertBefore(E,v);return}v.getAttribute(H)===f&&(b=!0)}s.appendChild(E)}else if(e==="link")s.contains(E)||s.appendChild(E);else if(A){let b=!1;for(let v of A)if(v===E){b=!0;break}b||s.insertBefore(E,s.contains(A[0])?A[0]:s.querySelector(e)),A=void 0}},[y,f,e]),F=ct(t.ref,E=>{let b=S[0];if(r===2&&(E.innerHTML=""),(h||A)&&R(E),!p&&!l||!b)return;let v=Wt[E.getAttribute(b)]||=new Promise((D,L)=>{E.addEventListener("load",D),E.addEventListener("error",L)});l&&(v=v.then(l)),p&&(v=v.catch(p)),v.catch(()=>{})});if(n&&m==="render"){let E=te[e][0];if(E&&t[E]){let b=t[E],v=Wt[b]||=new Promise((D,L)=>{R(d),d.addEventListener("load",D),d.addEventListener("error",L)});at(v)}}let w={tag:e,type:e,props:{...u,ref:F},ref:F};return w.p=r,d&&(w.e=d),rt(w,s)},no=e=>{let t=Mt();return(t&&z(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ye("title",e,void 0,!1,!1)},io=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ye("script",e,1,!1,!0),so=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ye("style",e,2,!0,!0)),ao=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ye("link",e,1,Ce(e),!0),lo=e=>ye("meta",e,void 0,!1,!1),Kt=Symbol(),co=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=P([null,!1]),s=X(async m=>{let u=m.isTrusted?t:m.detail[Kt];if(typeof u!="function")return;m.preventDefault();let d=new FormData(m.target);n([d,!0]);let h=u(d);h instanceof Promise&&(Ht(h),await h),n([null,!0])},[]),l=ct(e.ref,m=>(m.addEventListener("submit",s),()=>{m.removeEventListener("submit",s)})),[p,f]=o;return o[1]=!1,{tag:Vt,props:{value:{pending:p!==null,data:p,method:p?"post":null,action:p?t:null},children:{tag:"form",props:{...r,ref:l},type:"form",ref:l}},f}},qt=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=X(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Kt]:t}}))},[]);r.ref=ct(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},po=e=>qt("input",e),mo=e=>qt("button",e);Object.assign(le,{title:no,script:io,style:so,link:ao,meta:lo,form:co,input:po,button:mo});var Z=":-hono-global",uo=new RegExp(`^${Z}{(.*)}$`),Me="hono-css",U=Symbol(),I=Symbol(),O=Symbol(),B=Symbol(),je=Symbol(),Xt=Symbol(),Ma=Symbol();var Zt=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Jt=e=>e.trim().replace(/\s+/g,"-"),Qt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),xo=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),ho=e=>Qt(e)&&!xo.has(e.toLowerCase()),er=e=>{console.warn(`Invalid slug: ${e}`)},go=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),yo=new RegExp(["("+go+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),bo=e=>e.replace(yo,(t,r,o,n,s)=>r||o||n||s||""),tr=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let l=0,p=e.length;l<p;l++){s+=e[l];let f=t[l];if(!(typeof f=="boolean"||f===null||f===void 0)){Array.isArray(f)||(f=[f]);for(let m=0,u=f.length;m<u;m++){let d=f[m];if(!(typeof d=="boolean"||d===null||d===void 0))if(typeof d=="string")/([\\"'\/])/.test(d)?s+=d.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=d;else if(typeof d=="number")s+=d;else if(d[Xt])s+=d[Xt];else if(d[I].startsWith("@keyframes "))r.push(d),s+=` ${d[I].substring(11)} `;else{if(e[l+1]?.match(/^\s*{/))r.push(d),d=`.${d[I]}`;else{r.push(...d[B]),o.push(...d[je]),d=d[O];let h=d.length;if(h>0){let S=d[h-1];S!==";"&&S!=="}"&&(d+=";")}}s+=`${d||""}`}}}}return[n,bo(s),r,o]},ie=(e,t,r,o)=>{let[n,s,l,p]=tr(e,t),f=uo.exec(s);f&&(s=f[1]);let m=Zt(n+s),u;if(r){let S=r(m,Jt(n),s);S&&(Qt(S)?u=S:(o||er)(S))}let d=(f?Z:"")+(u||m),h=(f?l.map(S=>S[I]):[d,...p]).join(" ");return{[U]:d,[I]:h,[O]:s,[B]:l,[je]:p}},_e=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[U]:"",[I]:"",[O]:"",[B]:[],[je]:[o]})}return e},Oe=(e,t,r,o)=>{let[n,s]=tr(e,t),l=Zt(n+s),p;if(r){let f=r(l,Jt(n),s);f&&(ho(f)?p=f:(o||er)(f))}return{[U]:"",[I]:`@keyframes ${p||l}`,[O]:s,[B]:[],[je]:[]}},So=0,Le=(e,t,r,o)=>{e||(e=[`/* h-v-t ${So++} */`]);let n=Array.isArray(e)?ie(e,t,r,o):e,s=n[I],l=ie(["view-transition-name:",""],[s],r,o);return n[I]=Z+n[I],n[O]=n[O].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),l[I]=l[U]=s,l[B]=[...n[B],n],l};var $o=e=>{let t=[],r=0,o=0;for(let n=0,s=e.length;n<s;n++){let l=e[n];if(l==="'"||l==='"'){let p=l;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===p)break}continue}if(l==="{"){o++;continue}if(l==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},dt=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(l,p)=>{let[f,m]=r();if(!f||!m){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(l,p)});return}m.has(l)||(m.add(l),(l.startsWith(Z)?$o(p):[`${l[0]==="@"?"":"."}${l}{${p}}`]).forEach(u=>{f.insertRule(u,f.cssRules.length)}))};return[{toString(){let l=this[U];return o(l,this[O]),this[B].forEach(({[I]:p,[O]:f})=>{o(p,f)}),this[I]}},({children:l,nonce:p})=>({tag:"style",props:{id:e,nonce:p,children:l&&(Array.isArray(l)?l:[l]).map(f=>f[O])}})]},Eo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=dt({id:e}),s=u=>(u.toString=o.toString,u),l=(u,...d)=>s(ie(u,d,t,r));return{css:l,cx:(...u)=>(u=_e(u),l(Array(u.length).fill(""),...u)),keyframes:(u,...d)=>Oe(u,d,t,r),viewTransition:(u,...d)=>s(Le(u,d,t,r)),Style:n}},be=Eo({id:Me}),Oa=be.css,La=be.cx,za=be.keyframes,Fa=be.viewTransition,Ba=be.Style;var wo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=dt({id:e}),s=new WeakMap,l=new WeakMap,p=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),f=y=>{let k=({buffer:w,context:E})=>{let[b,v]=s.get(E),D=Object.keys(b);if(!D.length)return;let L="";if(D.forEach(q=>{v[q]=!0,L+=q.startsWith(Z)?b[q]:`${q[0]==="@"?"":"."}${q}{${b[q]}}`}),s.set(E,[{},v]),w&&p.test(w[0])){w[0]=w[0].replace(p,(q,Ar,Rr)=>`${Ar}${L}${Rr}`);return}let bt=l.get(E),St=`<script${bt?` nonce="${bt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(L)}<\/script>`;if(w){w[0]=`${St}${w[0]}`;return}return Promise.resolve(St)},A=({context:w})=>{s.has(w)||s.set(w,[{},{}]);let[E,b]=s.get(w),v=!0;if(b[y[U]]||(v=!1,E[y[U]]=y[O]),y[B].forEach(({[I]:D,[O]:L})=>{b[D]||(v=!1,E[D]=L)}),!v)return Promise.resolve(M("",[k]))},R=new String(y[I]);Object.assign(R,y),R.isEscaped=!0,R.callbacks=[A];let F=Promise.resolve(R);return Object.assign(F,y),F.toString=o.toString,F},m=(y,...k)=>f(ie(y,k,t,r)),u=(...y)=>(y=_e(y),m(Array(y.length).fill(""),...y)),d=(y,...k)=>Oe(y,k,t,r),h=(y,...k)=>f(Le(y,k,t,r)),S=({children:y,nonce:k}={})=>M(`<style id="${e}"${k?` nonce="${k}"`:""}>${y?y[O]:""}</style>`,[({context:A})=>{l.set(A,k)}]);return S[K]=n,{css:m,cx:u,keyframes:d,viewTransition:h,Style:S}},Se=wo({id:Me}),c=Se.css,qa=Se.cx,T=Se.keyframes,Ya=Se.viewTransition,rr=Se.Style;var ve=["0-5","6-11","12-17","18-24","25-34","35-44","45-59","60+"],or={loading:!1,error:null,members:[],lookups:{parentesco:[],specificities:[]},selectedSpecificityId:null,originalSpecificityId:null,saving:!1,ageProfile:{"0-5":0,"6-11":0,"12-17":0,"18-24":0,"25-34":0,"35-44":0,"45-59":0,"60+":0}};var pt=(e,t)=>{let r,o,n;if(e.includes("/")){let m=e.split("/");n=parseInt(m[0]??"0",10),o=parseInt(m[1]??"0",10),r=parseInt(m[2]??"0",10)}else{let m=e.split("-");r=parseInt(m[0]??"0",10),o=parseInt(m[1]??"0",10),n=parseInt(m[2]??"0",10)}let s=t.getFullYear(),l=t.getMonth()+1,p=t.getDate(),f=s-r;return(l<o||l===o&&p<n)&&(f-=1),Math.max(0,f)},ko=e=>e<=5?"0-5":e<=11?"6-11":e<=17?"12-17":e<=24?"18-24":e<=34?"25-34":e<=44?"35-44":e<=59?"45-59":"60+",ze=(e,t)=>{let r={};for(let o of ve)r[o]=0;for(let o of e){if(!o.birthDate)continue;let n=pt(o.birthDate,t),s=ko(n);r[s]=(r[s]??0)+1}return r},mt=e=>e.saving||e.loading?!1:e.selectedSpecificityId!==e.originalSpecificityId,nr=(e,t)=>{switch(t.type){case"LOAD_START":return{...e,loading:!0,error:null};case"LOAD_SUCCESS":{let r=ze(t.members,new Date);return{...e,loading:!1,error:null,members:t.members,lookups:t.lookups,selectedSpecificityId:t.specificityId,originalSpecificityId:t.specificityId,ageProfile:r}}case"LOAD_FAILURE":return{...e,loading:!1,error:t.error};case"ADD_MEMBER":{let r=[...e.members,t.member],o=ze(r,new Date);return{...e,members:r,ageProfile:o}}case"UPDATE_MEMBER":{let r=e.members.map((n,s)=>s===t.index?t.member:n),o=ze(r,new Date);return{...e,members:r,ageProfile:o}}case"REMOVE_MEMBER":{let r=e.members.filter(n=>n.personId!==t.personId),o=ze(r,new Date);return{...e,members:r,ageProfile:o}}case"SET_CAREGIVER":return{...e,members:e.members.map(r=>({...r,isPrimaryCaregiver:r.personId===t.personId}))};case"TOGGLE_DOCUMENT":return{...e,members:e.members.map(r=>{if(r.personId!==t.personId)return r;let o=r.requiredDocuments.includes(t.doc)?r.requiredDocuments.filter(n=>n!==t.doc):[...r.requiredDocuments,t.doc];return{...r,requiredDocuments:o}})};case"SET_SPECIFICITY":return{...e,selectedSpecificityId:t.id};case"SAVE_START":return{...e,saving:!0};case"SAVE_SUCCESS":return{...e,saving:!1,originalSpecificityId:e.selectedSpecificityId};case"SAVE_FAILURE":return{...e,saving:!1,error:t.error}}};var $e={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Fe=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Co=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Be=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:$e});return Fe(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},ir=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:$e});return Co(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Ne=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:$e,body:JSON.stringify(t)});return Fe(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},sr=async(e,t)=>{try{let r=await fetch(e,{method:"PUT",credentials:"same-origin",headers:$e,body:JSON.stringify(t)});return Fe(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var ar=async e=>{try{let t=await fetch(e,{method:"DELETE",credentials:"same-origin",headers:$e});return Fe(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var lr={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),ir(`/api/v1/patients?${o.toString()}`)},getById:e=>Be(`/api/v1/patients/${e}`),create:e=>Ne("/api/v1/patients",e)};var ft=new Map,ut={getTable:async e=>{let t=ft.get(e);if(t)return{ok:!0,value:t};let r=await Be(`/api/v1/lookups/${e}`);return r.ok&&ft.set(e,r.value),r},clearCache:()=>{ft.clear()}};var Ve={addMember:(e,t)=>Ne(`/api/v1/patients/${e}/family-members`,t),removeMember:(e,t)=>ar(`/api/v1/patients/${e}/family-members/${t}`),assignPrimaryCaregiver:(e,t)=>sr(`/api/v1/patients/${e}/primary-caregiver`,t)};var a={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",bgBase:"#F8F3EC",bgWarm:"#F0E8DC",bgSage:"#E2E8DF",bgSageDeep:"#D4DDD0",bgCard:"rgba(255,255,255,0.45)",bgCardHover:"rgba(255,255,255,0.65)",bgCardBorder:"rgba(255,255,255,0.6)",bgCardBorderHover:"rgba(79,132,72,0.2)",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",textSagePrimary:"#1E2B1A",textSageSecondary:"#3D5235",textSageMuted:"#6B7F65",textSageSoft:"#8B9E85",primary:"#4F8448",primaryDark:"#3D6A37",danger:"#A6290D",dangerAlt:"#C4422B",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},x=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},g={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},$={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},He={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},ll={button:c`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:c`box-shadow: -8px 0 40px ${x(a.textPrimary,.3)};`,fab:c`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:c`box-shadow: 0 24px 80px ${a.inputLine};`,modal:c`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},j={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var Ao=c`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid ${x(a.primary,.08)};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 0;
  z-index: 40;
  transition: width 300ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  &:hover {
    width: 220px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`,Ro=c`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  text-decoration: none;
  transition: transform 150ms ease, box-shadow 150ms ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px ${x(a.primary,.3)};
  }
`,Do=c`
  font-family: ${g.erode};
  font-size: 14px;
  color: ${a.textSageSecondary};
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 2rem;
  text-decoration: none;

  nav:hover & {
    opacity: 1;
    transform: translateX(0);
  }

  &:hover {
    color: ${a.primary};
  }
`,To=c`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 12px;
`,Po=c`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  text-decoration: none;
  color: ${a.textSageMuted};
  white-space: nowrap;
  border: none;
  background: none;
  font-family: inherit;
  width: 100%;

  &:hover {
    background: ${x(a.primary,.08)};
    color: ${a.textSageSecondary};
  }
`,Io=c`
  background: ${x(a.primary,.08)};
  color: ${a.primary};
`,Mo=c`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
`,jo=c`
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`,_o=c`
  margin-left: auto;
  background: ${a.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: ${j.pill};
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,Oo=c`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 12px;
  width: 100%;
`,Lo=c`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${a.bgSage}, ${a.bgSageDeep});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: ${a.primaryDark};
  flex-shrink: 0;
`,zo=c`
  font-size: 12px;
  color: ${a.textSageMuted};
  white-space: nowrap;
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,Fo=[{id:"familias",icon:"\u2630",label:"Familias",hasBadge:!0,href:"/social-care"},{id:"cadastro",icon:"+",label:"Cadastro",hasBadge:!1,href:"/patient-registration"},{id:"relatorios",icon:"\u25A6",label:"Relatorios",hasBadge:!1,href:"#"},{id:"config",icon:"\u2699",label:"Config",hasBadge:!1,href:"#"}],cr=({userName:e,userInitials:t,familyCount:r,activeItem:o})=>i("nav",{class:Ao,"aria-label":"Menu lateral",children:[i("a",{href:"/hub",class:Ro,"aria-label":"Voltar para o Hub",children:"C"}),i("a",{href:"/hub",class:Do,"aria-label":"Voltar para o Hub",children:"Conecta"}),i("div",{class:To,role:"list",children:Fo.map(n=>i("a",{class:`${Po} ${n.id===o?Io:""}`,href:n.href,"aria-current":n.id===o?"page":void 0,"aria-label":n.label,role:"listitem",children:[i("span",{class:Mo,"aria-hidden":"true",children:n.icon}),i("span",{class:jo,children:n.label}),n.hasBadge&&i("span",{class:_o,"aria-label":`${r} familias`,children:r})]},n.id))}),i("div",{class:Oo,children:[i("div",{class:Lo,"aria-hidden":"true",children:t}),i("div",{class:zo,children:e})]})]});var Bo=c`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: clamp(1.5rem, 1rem + 1vw, 2rem);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`,No=c`
  font-family: ${g.erode};
  font-size: clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem);
  font-weight: ${$.bold};
  color: ${a.textSagePrimary};
  letter-spacing: -0.03em;
  line-height: 1;
`,Vo=c`
  font-family: ${g.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem);
  color: ${a.textSageMuted};
  margin-top: 0.5rem;
`,Ho=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${$.semibold};
  padding: 0.5rem 1.75rem;
  border-radius: ${j.pill};
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  color: #fff;
  box-shadow: 0 2px 12px ${x(a.primary,.2)};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${x(a.primary,.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`,dr=({memberCount:e,onAdd:t})=>i("div",{class:Bo,children:[i("div",{children:[i("h1",{class:No,children:"Composicao Familiar"}),i("p",{class:Vo,children:[e," membros cadastrados"]})]}),i("div",{children:i("button",{class:Ho,onClick:t,"aria-label":"Adicionar membro",children:[i("span",{"aria-hidden":"true",children:"+"})," Adicionar membro"]})})]});var Wo=T`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`,Uo=c`
  display: grid;
  grid-template-columns: 32px 1fr 110px 90px 80px 36px;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid ${x(a.primary,.08)};
  transition: all 150ms ease;
  animation: ${Wo} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  &:last-child { border-bottom: none; }
  &:hover {
    background: rgba(255,255,255,0.3);
    border-radius: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255,255,255,0.2);
    border-radius: 12px;
    margin-bottom: 0.5rem;
    border-bottom: none;
  }
`,Ko=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.textSageSoft};
  font-variant-numeric: tabular-nums;
  text-align: center;

  @media (max-width: 768px) { display: none; }
`,qo=c`
  font-family: ${g.erode};
  font-size: 0.9375rem;
  font-weight: ${$.semibold};
  color: ${a.textSagePrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,Yo=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.textSageMuted};
  margin-top: 1px;
`,Go=c`
  font-family: ${g.satoshi};
  font-size: 0.8125rem;
  color: ${a.textSageSecondary};
  font-variant-numeric: tabular-nums;
`,Xo=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.textSageMuted};
`,Zo=c`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`,We=c`
  font-family: ${g.satoshi};
  font-size: 11px;
  font-weight: ${$.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: ${j.pill};
  white-space: nowrap;
`,Jo=c`
  ${We}
  background: ${x(a.primary,.12)};
  color: ${a.primary};
`,Qo=c`
  ${We}
  background: ${x(a.primary,.12)};
  color: ${a.primaryDark};
`,en=c`
  ${We}
  background: ${x(a.dangerAlt,.08)};
  color: ${a.dangerAlt};
`,tn=c`
  ${We}
  background: ${x(a.primary,.08)};
  color: ${a.textSageSecondary};
`,rn=c`
  position: relative;
`,on=c`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${x(a.primary,.12)};
  background: transparent;
  color: ${a.textSageSoft};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  font-family: ${g.satoshi};

  &:hover {
    border-color: ${a.primary};
    color: ${a.primary};
    background: ${x(a.primary,.08)};
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
`,nn=T`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`,sn=c`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 12px;
  padding: 4px;
  min-width: 150px;
  z-index: 20;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  animation: ${nn} 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,ht=c`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-family: ${g.satoshi};
  font-size: 0.8125rem;
  color: ${a.textSageSecondary};
  cursor: pointer;
  transition: all 150ms ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${x(a.primary,.08)};
    color: ${a.primary};
  }
`,an=c`
  ${ht}
  color: ${a.dangerAlt};
  &:hover {
    background: ${x(a.dangerAlt,.08)};
    color: ${a.dangerAlt};
  }
`,xt=c`
  width: 16px;
  text-align: center;
  font-size: 12px;
`,pr=({member:e,index:t,onEdit:r,onRemove:o,onSetCaregiver:n})=>{let[s,l]=P(!1),p=pt(e.birthDate,new Date),f=[...e.isPR?[{label:"PR",style:Jo}]:[],...e.isPrimaryCaregiver?[{label:"Cuidador",style:Qo}]:[],...e.hasDisability?[{label:"PcD",style:en}]:[],...e.residesWithPatient&&!e.isPR?[{label:"Reside",style:tn}]:[]];return i("div",{class:Uo,style:`animation-delay: ${t*60}ms`,children:[i("span",{class:Ko,children:String(t+1).padStart(2,"0")}),i("div",{children:[i("div",{class:qo,children:e.name}),i("div",{class:Yo,children:[e.relationshipLabel,e.requiredDocuments.length>0?` \xB7 ${e.requiredDocuments.join(", ")}`:""]})]}),i("span",{class:Go,children:[p," anos"]}),i("span",{class:Xo,children:e.sex}),i("div",{class:Zo,children:f.map(m=>i("span",{class:m.style,children:m.label},m.label))}),i("div",{class:rn,children:[i("button",{class:on,onClick:()=>l(!s),"aria-label":`Acoes para ${e.name}`,"aria-expanded":s,children:"\u22EE"}),s&&i("div",{class:sn,children:[!e.isPrimaryCaregiver&&i("button",{class:ht,onClick:()=>{n(),l(!1)},children:[i("span",{class:xt,"aria-hidden":"true",children:"\u2605"})," Tornar cuidador"]}),i("button",{class:ht,onClick:()=>{r(),l(!1)},children:[i("span",{class:xt,"aria-hidden":"true",children:"\u270E"})," Editar"]}),!e.isPR&&i("button",{class:an,onClick:()=>{o(),l(!1)},children:[i("span",{class:xt,"aria-hidden":"true",children:"\u2715"})," Remover"]})]})]})]})};var ln=T`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,cn=c`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  animation: ${ln} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`,dn=c`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`,pn=c`
  font-family: ${g.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: ${$.bold};
  color: ${a.textSagePrimary};
  letter-spacing: -0.02em;
`,mn=c`
  display: grid;
  grid-template-columns: 32px 1fr 110px 90px 80px 36px;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.75rem 0.75rem;
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${$.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${a.textSageSoft};

  @media (max-width: 768px) {
    display: none;
  }
`,mr=({members:e,onEdit:t,onRemove:r,onSetCaregiver:o})=>i("div",{class:cn,children:[i("div",{class:dn,children:i("div",{class:pn,children:"Membros"})}),i("div",{class:mn,"aria-hidden":"true",children:[i("span",{children:"#"}),i("span",{children:"Nome / Parentesco"}),i("span",{children:"Idade"}),i("span",{children:"Sexo"}),i("span",{children:"Tags"}),i("span",{})]}),i("div",{children:e.map((n,s)=>i(pr,{member:n,index:s,onEdit:()=>t(s),onRemove:()=>r(n.personId),onSetCaregiver:()=>o(n.personId)},n.personId))})]});var fn=c`
  position: fixed;
  inset: 0;
  background: rgba(248,243,236,0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`,un=T`
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`,xn=c`
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  width: 90%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 64px rgba(0,0,0,0.08);
  animation: ${un} 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,hn=c`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`,gn=c`
  font-family: ${g.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: ${$.bold};
  color: ${a.textSagePrimary};
`,yn=c`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${a.bgCardBorder};
  background: rgba(255,255,255,0.4);
  color: ${a.textSageSecondary};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;

  &:hover {
    background: rgba(255,255,255,0.7);
    color: ${a.textSagePrimary};
  }
`,bn=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`,Sn=c`
  grid-column: 1 / -1;
`,Ue=c`
  font-family: ${g.satoshi};
  font-size: 11px;
  font-weight: ${$.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  margin-bottom: 0.375rem;
  display: block;
`,Ke=c`
  &::after {
    content: ' *';
    color: ${a.dangerAlt};
  }
`,yt=c`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${x(a.primary,.15)};
  padding: 0.625rem 0;
  font-family: ${g.satoshi};
  font-size: 0.9375rem;
  color: ${a.textSagePrimary};
  outline: none;
  width: 100%;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &::placeholder {
    color: ${a.textSageSoft};
    font-style: italic;
  }
  &:focus { border-color: ${a.primary}; }
`,gt=c`
  border-color: ${a.dangerAlt};
`,vn=c`
  ${yt}
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
`,qe=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.dangerAlt};
  min-height: 0;
  margin-top: 2px;
`,$n=c`
  display: flex;
  gap: 0.625rem;
  margin-top: 4px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`,En=e=>c`
  flex: 1;
  padding: 0.75rem 0.875rem;
  background: ${e?x(a.primary,.08):"rgba(255,255,255,0.4)"};
  border: 1.5px solid ${e?a.primary:x(a.primary,.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${e?$.semibold:$.medium};
  color: ${e?a.primary:a.textSageMuted};
  ${e?`box-shadow: 0 0 0 3px ${x(a.primary,.08)};`:""}

  &:hover {
    background: ${e?x(a.primary,.08):"rgba(255,255,255,0.6)"};
    border-color: ${e?a.primary:x(a.primary,.2)};
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,fr=c`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  color: ${a.textSageSecondary};
`,ur=c`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid ${x(a.primary,.2)};
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
`,xr=c`
  background: ${a.primary};
  border-color: ${a.primary};
  color: white;
  font-size: 12px;
  font-weight: ${$.bold};
`,wn=c`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid ${x(a.primary,.08)};
`,kn=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${$.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${j.pill};
  background: transparent;
  border: 1.5px solid ${x(a.primary,.2)};
  color: ${a.textSageMuted};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${x(a.primary,.4)};
    color: ${a.textSageSecondary};
  }
`,Cn=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${$.semibold};
  padding: 0.75rem 1.75rem;
  border-radius: ${j.pill};
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  color: #fff;
  box-shadow: 0 2px 12px ${x(a.primary,.2)};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${x(a.primary,.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`,An=["M","F","Outro"],hr=({lookups:e,onSave:t,onClose:r,editMember:o})=>{let n=!!o,[s,l]=P(o?.name??""),[p,f]=P(o?.birthDate??""),[m,u]=P(o?.sex??""),[d,h]=P(o?.residesWithPatient??!0),[S,y]=P(o?.hasDisability??!1),[k,A]=P(o?.relationshipId??""),[R,F]=P({}),w=()=>{let b={};return s.trim()||(b.name="Nome e obrigatorio"),p.trim()||(b.birthDate="Data de nascimento e obrigatoria"),k||(b.relationshipId="Parentesco e obrigatorio"),m||(b.sex="Sexo e obrigatorio"),F(b),Object.keys(b).length===0},E=()=>{if(!w())return;let b=e.find(v=>v.id===k);t({personId:o?.personId??crypto.randomUUID(),name:s,birthDate:p,sex:m==="M"?"Masculino":m==="F"?"Feminino":"Outro",relationshipId:k,relationshipLabel:b?.descricao??"",residesWithPatient:d,hasDisability:S,isPrimaryCaregiver:o?.isPrimaryCaregiver??!1,isPR:o?.isPR??!1,requiredDocuments:o?.requiredDocuments??[]})};return i("div",{class:fn,onClick:r,role:"dialog","aria-modal":"true","aria-label":n?"Editar Membro":"Adicionar Membro",children:i("div",{class:xn,onClick:b=>b.stopPropagation(),children:[i("div",{class:hn,children:[i("h2",{class:gn,children:n?"Editar Membro":"Adicionar Membro"}),i("button",{class:yn,onClick:r,"aria-label":"Fechar",children:"\xD7"})]}),i("div",{class:bn,children:[i("div",{class:Sn,children:[i("label",{class:`${Ue} ${Ke}`,children:"Nome Completo"}),i("input",{class:`${yt} ${R.name?gt:""}`,value:s,onInput:b=>l(b.target.value),placeholder:"Nome do membro","aria-required":"true"}),R.name&&i("div",{class:qe,role:"alert",children:R.name})]}),i("div",{children:[i("label",{class:`${Ue} ${Ke}`,children:"Data de Nascimento"}),i("input",{class:`${yt} ${R.birthDate?gt:""}`,value:p,onInput:b=>f(b.target.value),placeholder:"DD/MM/AAAA",maxLength:10,"aria-required":"true"}),R.birthDate&&i("div",{class:qe,role:"alert",children:R.birthDate})]}),i("div",{children:[i("label",{class:`${Ue} ${Ke}`,children:"Parentesco"}),i("select",{class:`${vn} ${R.relationshipId?gt:""}`,value:k,onChange:b=>A(b.target.value),"aria-required":"true",children:[i("option",{value:"",children:"Selecione..."}),e.map(b=>i("option",{value:b.id,children:b.descricao},b.id))]}),R.relationshipId&&i("div",{class:qe,role:"alert",children:R.relationshipId})]}),i("div",{children:[i("label",{class:`${Ue} ${Ke}`,children:"Sexo"}),i("div",{class:$n,role:"radiogroup","aria-label":"Sexo do membro",children:An.map(b=>i("div",{class:En(m===b),role:"radio","aria-checked":m===b,tabIndex:0,onClick:()=>u(b),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),u(b))},children:b},b))}),R.sex&&i("div",{class:qe,role:"alert",children:R.sex})]}),i("div",{children:i("label",{class:fr,onClick:()=>h(!d),children:[i("span",{class:`${ur} ${d?xr:""}`,children:d?"\u2713":""}),"Reside com o paciente"]})}),i("div",{children:i("label",{class:fr,onClick:()=>y(!S),children:[i("span",{class:`${ur} ${S?xr:""}`,children:S?"\u2713":""}),"Possui deficiencia"]})})]}),i("div",{class:wn,children:[i("button",{class:kn,onClick:r,"aria-label":"Cancelar",children:"Cancelar"}),i("button",{class:Cn,onClick:E,"aria-label":"Salvar membro",children:"Salvar membro"})]})]})})};var Rn=c`
  position: fixed;
  inset: 0;
  background: rgba(248,243,236,0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`,Dn=T`
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`,Tn=c`
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  max-width: 400px;
  width: 90%;
  box-shadow: 0 16px 64px rgba(0,0,0,0.08);
  text-align: center;
  animation: ${Dn} 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Pn=c`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${x(a.dangerAlt,.08)};
  color: ${a.dangerAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 1rem;
`,In=c`
  font-family: ${g.erode};
  font-size: clamp(1.125rem, 1rem + 0.25vw, 1.25rem);
  font-weight: ${$.bold};
  color: ${a.textSagePrimary};
  margin-bottom: 0.5rem;
`,Mn=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  color: ${a.textSageMuted};
  line-height: 1.5;
  margin-bottom: 1.5rem;
`,jn=c`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`,_n=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${$.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${j.pill};
  background: transparent;
  border: 1.5px solid ${x(a.primary,.2)};
  color: ${a.textSageMuted};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${x(a.primary,.4)};
    color: ${a.textSageSecondary};
  }
`,On=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${$.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${j.pill};
  background: transparent;
  border: 1.5px solid ${x(a.dangerAlt,.2)};
  color: ${a.dangerAlt};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${a.dangerAlt};
    background: ${x(a.dangerAlt,.08)};
  }
`,gr=({name:e,onConfirm:t,onCancel:r})=>i("div",{class:Rn,onClick:r,role:"dialog","aria-modal":"true","aria-label":"Confirmar remocao",children:i("div",{class:Tn,onClick:o=>o.stopPropagation(),children:[i("div",{class:Pn,"aria-hidden":"true",children:"\u26A0"}),i("div",{class:In,children:"Remover membro?"}),i("div",{class:Mn,children:["Tem certeza que deseja remover ",i("strong",{children:e})," da composi\\u00e7\\u00e3o familiar? Esta a\\u00e7\\u00e3o n\\u00e3o pode ser desfeita."]}),i("div",{class:jn,children:[i("button",{type:"button",class:_n,onClick:r,"aria-label":"Cancelar",children:"Cancelar"}),i("button",{type:"button",class:On,onClick:t,"aria-label":"Remover membro",children:"Remover"})]})]})});var Ln=T`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,zn=c`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  animation: ${Ln} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`,Fn=c`
  font-family: ${g.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: ${$.bold};
  color: ${a.textSagePrimary};
  letter-spacing: -0.02em;
`,Bn=c`
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.15vw, 0.8125rem);
  color: ${a.textSageMuted};
  margin-top: 2px;
`,Nn=c`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`,Vn=e=>c`
  padding: 1rem;
  background: ${e?x(a.primary,.08):"rgba(255,255,255,0.3)"};
  border: 1.5px solid ${e?a.primary:x(a.primary,.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${e?$.semibold:$.medium};
  color: ${e?a.primary:a.textSageMuted};
  ${e?`box-shadow: 0 0 0 3px ${x(a.primary,.08)};`:""}

  &:hover {
    background: ${e?x(a.primary,.08):"rgba(255,255,255,0.5)"};
    border-color: ${e?a.primary:x(a.primary,.2)};
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,Hn=c`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid ${x(a.primary,.08)};
  margin-top: 1.5rem;
`,Wn=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.textSageSoft};
  font-style: italic;
`,Un=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.primary};
  font-weight: ${$.medium};
`,Kn=c`
  font-family: ${g.satoshi};
  font-size: 0.8125rem;
  font-weight: ${$.semibold};
  padding: 0.5rem 1rem;
  border-radius: ${j.pill};
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  color: #fff;
  box-shadow: 0 2px 12px ${x(a.primary,.2)};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${x(a.primary,.3)};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`,yr=({items:e,selectedId:t,canSave:r,onSelect:o,onSave:n})=>i("div",{class:zn,children:[i("div",{children:[i("div",{class:Fn,children:"Especificidade Social"}),i("div",{class:Bn,children:"Identidade social, etnica ou cultural da familia"})]}),i("div",{class:Nn,role:"radiogroup","aria-label":"Especificidade social da familia",children:e.map(s=>i("div",{class:Vn(t===s.id),role:"radio","aria-checked":t===s.id,"aria-label":s.descricao,tabIndex:0,onClick:()=>o(s.id),onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),o(s.id))},children:s.descricao},s.id))}),i("div",{class:Hn,children:[i("span",{class:r?Un:Wn,children:r?"Alteracao pendente":"Nenhuma alteracao pendente"}),i("button",{class:Kn,disabled:!r,onClick:n,"aria-label":"Salvar especificidade",children:"Salvar especificidade"})]})]});var qn=T`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,Yn=c`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1rem, 0.75rem + 0.75vw, 1.5rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  animation: ${qn} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`,Gn=c`
  font-family: ${g.erode};
  font-size: 1rem;
  font-weight: ${$.semibold};
  color: ${a.textSageSecondary};
`,Xn=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.textSageMuted};
  margin-top: 2px;
`,Zn=c`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 0.75rem 0 0;
`,Jn=c`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`,Qn=c`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`,ei=c`
  width: 100%;
  border-radius: 6px 6px 2px 2px;
  background: linear-gradient(180deg, ${a.primary} 0%, ${a.primaryDark} 100%);
  position: relative;
  box-shadow: 0 2px 8px ${x(a.primary,.2)};
  transition: height 800ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,ti=c`
  width: 100%;
  background: ${a.bgSage};
  min-height: 6px;
  border-radius: 3px;
  position: relative;
`,ri=c`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${$.bold};
  color: ${a.primary};
`,oi=c`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${$.medium};
  color: ${a.textSageSoft};
`,ni=c`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${$.semibold};
  color: ${a.textSageMuted};
  white-space: nowrap;
  letter-spacing: 1.5px;
  text-transform: uppercase;
`,ii=c`
  font-family: ${g.satoshi};
  font-size: 0.75rem;
  color: ${a.textSageMuted};
  margin-top: 0.75rem;
  text-align: right;
`,si=c`
  color: ${a.primary};
  font-weight: ${$.bold};
`,br=({ageProfile:e,totalMembers:t})=>{let r=ve.map(n=>e[n]??0),o=Math.max(...r,1);return i("div",{class:Yn,children:[i("div",{children:[i("div",{class:Gn,children:"Perfil Etario"}),i("div",{class:Xn,children:"Distribuicao por faixa etaria dos membros"})]}),i("div",{class:Zn,role:"img","aria-label":"Histograma de distribuicao por faixa etaria",children:ve.map((n,s)=>{let l=r[s]??0,p=l>0?Math.max(12,l/o*68):0;return i("div",{class:Jn,children:[i("div",{class:Qn,children:i("div",{class:l>0?ei:ti,style:l>0?`height: ${p}px`:void 0,children:i("span",{class:l>0?ri:oi,children:l})})}),i("span",{class:ni,children:n})]},n)})}),i("div",{class:ii,children:["Total: ",i("span",{class:si,children:[t," membros"]})]})]})};var ai=c`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${g.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  color: ${a.textSageMuted};
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms ease;
  margin-bottom: 1.5rem;

  &:hover {
    color: ${a.textSageSecondary};
    text-decoration: underline;
  }
`,Sr=()=>i("a",{href:"/social-care",class:ai,"aria-label":"Voltar para lista de fam\\u00edlias",children:"\u2190 Voltar para Fam\\u00edlias"});var li=T`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`,ci=c`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-top: 1.5rem;
`,J=c`
  background: linear-gradient(90deg, ${x(a.primary,.04)} 25%, ${x(a.primary,.08)} 50%, ${x(a.primary,.04)} 75%);
  background-size: 800px 100%;
  animation: ${li} 1.8s infinite ease-in-out;
  border-radius: 8px;
  height: 12px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,di=c`
  margin-bottom: 1.5rem;
`,pi=c`
  display: grid;
  grid-template-columns: 32px 1fr 110px 90px 80px 36px;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid ${x(a.primary,.08)};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
`,vr=()=>i("div",{class:ci,children:[i("div",{class:di,children:[i("div",{class:J,style:"width: 200px; height: 20px; margin-bottom: 0.5rem"}),i("div",{class:J,style:"width: 140px; height: 12px"})]}),[0,1,2,3].map(e=>i("div",{class:pi,children:[i("div",{class:J,style:"width: 20px"}),i("div",{class:J,style:"width: 60%"}),i("div",{class:J,style:"width: 40%"}),i("div",{class:J,style:"width: 40%"}),i("div",{class:J,style:"width: 40%"}),i("div",{})]},e))]});var mi=T`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,fi=c`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(2rem, 1.5rem + 1.5vw, 3rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-top: 1.5rem;
  animation: ${mi} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`,ui=c`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 1.5rem + 1vw, 3rem) 1.5rem;
  text-align: center;
`,xi=c`
  font-size: 48px;
  color: ${a.textSageSoft};
  margin-bottom: 1rem;
  opacity: 0.4;
`,hi=c`
  font-family: ${g.erode};
  font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  font-weight: ${$.bold};
  color: ${a.textSageSecondary};
  margin-bottom: 0.5rem;
`,gi=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  color: ${a.textSageMuted};
  font-style: italic;
  max-width: 300px;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`,yi=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  font-weight: ${$.semibold};
  padding: 0.75rem 1.75rem;
  border-radius: ${j.pill};
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  color: #fff;
  box-shadow: 0 2px 12px ${x(a.primary,.2)};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${x(a.primary,.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`,$r=({onAdd:e})=>i("div",{class:fi,children:i("div",{class:ui,children:[i("div",{class:xi,"aria-hidden":"true",children:"\u{1F46A}"}),i("div",{class:hi,children:"Nenhum membro cadastrado"}),i("div",{class:gi,children:"Adicione os membros da familia para compor o perfil familiar do paciente."}),i("button",{class:yi,onClick:e,"aria-label":"Adicionar primeiro membro",children:[i("span",{"aria-hidden":"true",children:"+"})," Adicionar primeiro membro"]})]})});var bi=T`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`,Si=c`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${x(a.dangerAlt,.08)};
  border: 1px solid ${x(a.dangerAlt,.15)};
  border-radius: 12px;
  margin-bottom: 1.5rem;
  animation: ${bi} 500ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,vi=c`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${a.dangerAlt};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: ${$.bold};
  flex-shrink: 0;
`,$i=c`
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  color: ${a.dangerAlt};
`,Er=({message:e})=>i("div",{class:Si,role:"alert",children:[i("div",{class:vi,"aria-hidden":"true",children:"!"}),i("span",{class:$i,children:e})]});var Ei=T`
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`,wi=c`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  font-family: ${g.satoshi};
  font-size: 0.875rem;
  color: ${a.textSageSecondary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 200;
  animation: ${Ei} 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,ki=c`
  border-left: 3px solid ${a.primary};
`,Ci=c`
  border-left: 3px solid ${a.dangerAlt};
`,Ai=c`
  font-size: 18px;
`,wr=({type:e,message:t})=>i("div",{class:`${wi} ${e==="success"?ki:Ci}`,role:"status",children:[i("span",{class:Ai,"aria-hidden":"true",children:e==="success"?"\u2713":"\u26A0"}),i("span",{children:t})]});var Ri=c`
  :-hono-global {
    body { background: ${a.bgSageDeep} !important; }
  }
`,Di=c`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${a.bgBase} 0%, ${a.bgWarm} 25%, ${a.bgSage} 55%, ${a.bgSageDeep} 100%);
`,Ti=c`
  position: fixed;
  top: -10%;
  right: 5%;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  background: radial-gradient(circle, ${x(a.primary,.06)} 0%, transparent 70%);
  z-index: 0;
`,Pi=c`
  position: fixed;
  bottom: -15%;
  left: 10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180,160,100,0.04) 0%, transparent 70%);
  z-index: 0;
`,Ii=c`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
`,Mi=c`
  margin-left: 64px;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1rem, 0.5rem + 2vw, 2rem);
  overflow-y: auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: clamp(1rem, 0.5rem + 1vw, 1.5rem) clamp(0.75rem, 0.5rem + 1vw, 1rem);
  }
`,ji=c`
  display: grid;
  grid-template-columns: 5fr 3fr;
  gap: ${He[4]};
  align-items: start;
  margin-top: ${He[4]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`,_i=c`
  display: flex;
  flex-direction: column;
  gap: ${He[4]};
  position: sticky;
  top: 0;

  @media (max-width: 768px) {
    position: static;
  }
`,kr=({patientId:e})=>{let[t,r]=it(nr,or),[o,n]=P({open:!1}),[s,l]=P({open:!1}),[p,f]=P({visible:!1}),m=(y,k)=>{f({visible:!0,type:y,message:k}),setTimeout(()=>f({visible:!1}),3e3)};st(()=>{r({type:"LOAD_START"}),(async()=>{let[k,A,R]=await Promise.all([lr.getById(e),ut.getTable("parentesco"),ut.getTable("specificities")]);if(!k.ok){r({type:"LOAD_FAILURE",error:k.error});return}let F=k.value.familyMembers.map(w=>({personId:w.memberId,name:w.fullName,birthDate:"",sex:"",relationshipId:"",relationshipLabel:w.relationship,residesWithPatient:!0,hasDisability:!1,isPrimaryCaregiver:!1,isPR:!1,requiredDocuments:[]}));r({type:"LOAD_SUCCESS",members:F,lookups:{parentesco:A.ok?A.value.map(w=>({id:w.id,codigo:w.code,descricao:w.description,ativo:w.active})):[],specificities:R.ok?R.value.map(w=>({id:w.id,codigo:w.code,descricao:w.description,ativo:w.active})):[]},specificityId:null})})()},[e]);let u=y=>{o.open&&o.editIndex!==null?(r({type:"UPDATE_MEMBER",index:o.editIndex,member:y}),m("success","Membro atualizado com sucesso")):(r({type:"ADD_MEMBER",member:y}),Ve.addMember(e,y),m("success","Membro adicionado com sucesso")),n({open:!1})},d=y=>{r({type:"REMOVE_MEMBER",personId:y}),Ve.removeMember(e,y),l({open:!1}),m("success","Membro removido da composicao familiar")},h=()=>{mt(t)&&(r({type:"SAVE_START"}),r({type:"SAVE_SUCCESS"}),m("success","Especificidade salva com sucesso"))},S=t.members[0]?.name.split(" ").slice(-1)[0]??"";return i(oe,{children:[i("div",{class:Ri}),i("div",{class:Di}),i("div",{class:Ti}),i("div",{class:Pi}),i("div",{class:Ii,children:[i(cr,{userName:"Davi Franklin",userInitials:"DF",familyCount:42,activeItem:"familias"}),i("main",{class:Mi,children:[i(Sr,{}),t.error&&i(Er,{message:t.error}),i(dr,{memberCount:t.members.length,onAdd:()=>n({open:!0,editIndex:null})}),t.loading?i(vr,{}):t.members.length===0&&!t.error?i($r,{onAdd:()=>n({open:!0,editIndex:null})}):i("div",{class:ji,children:[i("div",{children:i(mr,{members:t.members,onEdit:y=>n({open:!0,editIndex:y}),onRemove:y=>{let k=t.members.find(A=>A.personId===y);l({open:!0,personId:y,name:k?.name??""})},onSetCaregiver:y=>{r({type:"SET_CAREGIVER",personId:y}),Ve.assignPrimaryCaregiver(e,{memberId:y}),m("success","Cuidador principal atualizado")}})}),i("div",{class:_i,children:[i(yr,{items:t.lookups.specificities,selectedId:t.selectedSpecificityId,canSave:mt(t),onSelect:y=>r({type:"SET_SPECIFICITY",id:y}),onSave:h}),i(br,{ageProfile:t.ageProfile,totalMembers:t.members.length})]})]})]})]}),o.open&&i(hr,{lookups:t.lookups.parentesco,onSave:u,onClose:()=>n({open:!1}),editMember:o.editIndex!==null?t.members[o.editIndex]:void 0}),s.open&&i(gr,{name:s.name,onConfirm:()=>d(s.personId),onCancel:()=>l({open:!1})}),p.visible&&i(wr,{type:p.type,message:p.message})]})};var Cr=document.getElementById("family-app");if(Cr){let e=window.location.pathname.split("/"),t=e[e.indexOf("family-composition")+1]??"";tt(i(oe,{children:[i(rr,{}),i(kr,{patientId:t})]}),Cr)}
