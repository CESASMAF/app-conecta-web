var Cr=Object.defineProperty;var Rr=(e,t)=>{for(var r in t)Cr(e,r,{get:t[r],enumerable:!0})};var Ar={Stringify:1,BeforeStream:2,Stream:3},I=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Dr=/[&<>'"]/,ke=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let s=o[n];typeof s=="object"&&t.push(...s.callbacks||[]);let i=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??i)r+=s;else{let l=[r];z(s,l),r=l[0]}}return I(r,t)},z=(e,t)=>{let r=e.search(Dr);if(r===-1){t[0]+=e;return}let o,n,s=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,n)+o,s=n+1}t[0]+=e.substring(s,n)},Ke=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:Ar.Stringify,buffer:r,context:o})),r[0]};var G=Symbol("RENDERER"),te=Symbol("ERROR_HANDLER"),w=Symbol("STASH"),ve=Symbol("INTERNAL"),we=Symbol("MEMO"),re=Symbol("PERMALINK");var qe=e=>(e[ve]=!0,e);var Ge=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:qe(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:qe(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[te]=s=>{throw e.pop(),s},n},ae=e=>{let t=[e],r=Ge(t);return r.values=t,r.Provider=r,H.push(r),r};var H=[],Et=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new ce("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>I(s,s.callbacks)):(t.pop(),I(n))};return r.values=t,r.Provider=r,r[G]=Ge(t),H.push(r),r},F=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},le={},V="data-precedence",Ce=e=>e.rel==="stylesheet"&&"precedence"in e,Re=(e,t)=>e==="link"?t:oe[e].length>0;var de={};Rr(de,{button:()=>Lr,form:()=>Or,input:()=>jr,link:()=>_r,meta:()=>Mr,script:()=>Pr,style:()=>Ir,title:()=>Tr});var X=e=>Array.isArray(e)?e:[e];var $t=new WeakMap,kt=(e,t,r,o)=>({buffer:n,context:s})=>{if(!n)return;let i=$t.get(s)||{};$t.set(s,i);let l=i[e]||=[],u=!1,p=oe[e],d=Re(e,o!==void 0);if(d){e:for(let[,a]of l)if(!(e==="link"&&!(a.rel==="stylesheet"&&a[V]!==void 0))){for(let x of p)if((a?.[x]??null)===r?.[x]){u=!0;break e}}}if(u?n[0]=n[0].replaceAll(t,""):d||e==="link"?l.push([t,r,o]):l.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let a;if(e==="link"||o!==void 0){let x=[];a=l.map(([b,,E],$)=>{if(E===void 0)return[b,Number.MAX_SAFE_INTEGER,$];let D=x.indexOf(E);return D===-1&&(x.push(E),D=x.length-1),[b,D,$]}).sort((b,E)=>b[1]-E[1]||b[2]-E[2]).map(([b])=>b)}else a=l.map(([x])=>x);a.forEach(x=>{n[0]=n[0].replaceAll(x,"")}),n[0]=n[0].replace(/(?=<\/head>)/,a.join(""))}},fe=(e,t,r)=>I(new M(e,r,X(t??[])).toString()),pe=(e,t,r,o)=>{if("itemProp"in r)return fe(e,t,r);let{precedence:n,blocking:s,...i}=r;n=o?n??"":void 0,o&&(i[V]=n);let l=new M(e,i,X(t||[])).toString();return l instanceof Promise?l.then(u=>I(l,[...u.callbacks||[],kt(e,u,i,n)])):I(l,[kt(e,l,i,n)])},Tr=({children:e,...t})=>{let r=Ae();if(r){let o=F(r);if(o==="svg"||o==="head")return new M("title",t,X(e??[]))}return pe("title",e,t,!1)},Pr=({children:e,...t})=>{let r=Ae();return["src","async"].some(o=>!t[o])||r&&F(r)==="head"?fe("script",e,t):pe("script",e,t,!1)},Ir=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,pe("style",e,t,!0)):fe("style",e,t),_r=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?fe("link",e,t):pe("link",e,t,Ce(t)),Mr=({children:e,...t})=>{let r=Ae();return r&&F(r)==="head"?fe("meta",e,t):pe("meta",e,t,!1)},vt=(e,{children:t,...r})=>new M(e,r,X(t??[])),Or=e=>(typeof e.action=="function"&&(e.action=re in e.action?e.action[re]:void 0),vt("form",e)),wt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=re in t.formAction?t.formAction[re]:void 0),vt(e,t)),jr=e=>wt("input",e),Lr=e=>wt("button",e);var Br=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),ne=e=>Br.get(e)||e,ue=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var xe,Ae=()=>xe,Fr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Nr=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],zr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ye=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")z(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof M?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):Ye(n,t)}}},M=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Ke(I(t[0],t.callbacks)).toString():t[0]:ke(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let s=xe&&F(xe)==="svg"?i=>Fr(ne(i)):i=>ne(i);for(let[i,l]of Object.entries(o))if(i=s(i),i!=="children"){if(i==="style"&&typeof l=="object"){let u="";ue(l,(p,d)=>{d!=null&&(u+=`${u?";":""}${p}:${d}`)}),t[0]+=' style="',z(u,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${i}="`,z(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${i}="${l}"`;else if(typeof l=="boolean"&&zr.includes(i))l&&(t[0]+=` ${i}=""`);else if(i==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[I(l.__html)]}else if(l instanceof Promise)t[0]+=` ${i}="`,t.unshift('"',l);else if(typeof l=="function"){if(!i.startsWith("on")&&i!=="ref")throw new Error(`Invalid prop '${i}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${i}="`,z(l.toString(),t),t[0]+='"'}if(Nr.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",Ye(n,t),t[0]+=`</${r}>`}},me=class extends M{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(H.length===0)t.unshift("",n);else{let s=H.map(i=>[i,i.values.at(-1)]);t.unshift("",n.then(i=>(i instanceof M&&(i.localContexts=s),i)))}else n instanceof M?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):z(n,t)}},ce=class extends M{toStringToBuffer(t){Ye(this.children,t)}};var Ct=!1,De=(e,t,r)=>{if(!Ct){for(let o in le)de[o][G]=le[o];Ct=!0}return typeof e=="function"?new me(e,t,r):de[e]?new me(de[e],t,r):e==="svg"||e==="head"?(xe||=Et(""),new M(e,t,[new me(xe,{value:e},r)])):new M(e,t,r)};var Te=({children:e})=>new ce("",{children:e},Array.isArray(e)?e:e?[e]:[]);function c(e,t,r){let o;if(!t||!("children"in t))o=De(e,t,[]);else{let n=t.children;o=Array.isArray(n)?De(e,t,n):De(e,t,[n])}return o.key=r,o}var ge="_hp",Hr={Change:"Input",DoubleClick:"DblClick"},Vr={svg:"2000/svg",math:"1998/Math/MathML"},J=[],Xe=new WeakMap,se,_t=()=>se,U=e=>"t"in e,Ze={onClick:["click",!1]},Rt=e=>{if(!e.startsWith("on"))return;if(Ze[e])return Ze[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return Ze[e]=[(Hr[r]||r).toLowerCase(),!!o]}},At=(e,t)=>se&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Mt=e=>e==null||e===!1?null:e,Ur=(e,t)=>{"value"in t&&(e.value=Mt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Wr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=ne(o);let s=Rt(o);if(s){if(r?.[o]!==n&&(r&&e.removeEventListener(s[0],r[o],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let i;typeof n=="function"?i=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,i=()=>n.current=null),Xe.set(e,i)}else if(o==="style"){let i=e.style;typeof n=="string"?i.cssText=n:(i.cssText="",n!=null&&ue(n,i.setProperty.bind(i)))}else{if(o==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Mt(n),l==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let i=At(e,o);n==null||n===!1?e.removeAttribute(i):n===!0?e.setAttribute(i,""):typeof n=="string"||typeof n=="number"?e.setAttribute(i,n):e.setAttribute(i,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=ne(o);let s=Rt(o);s?e.removeEventListener(s[0],n,s[1]):o==="ref"?Xe.get(e)?.():e.removeAttribute(At(e,o))}}},Kr=(e,t)=>{t[w][0]=0,J.push([e,t]);let r=t.tag[G]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{J.pop()}},Ot=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[w][1][_e]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(U(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let i=r.length;if(Ot(s,t,r,o,n),s.s){for(let l=i;l<r.length;l++)r[l].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},qr=e=>{for(;e&&(e.tag===ge||!e.e);)e=e.tag===ge||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},jt=e=>{U(e)||(e[w]?.[1][_e]?.forEach(t=>t[2]?.()),Xe.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(jt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(he.delete(e),Pe.delete(e),delete e[w][3],e.a=!0)},Je=(e,t,r)=>{e.c=t,Lt(e,t,r)},Dt=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},Tt=Symbol(),Lt=(e,t,r)=>{let o=[],n=[],s=[];Ot(e,t,o,n,s),n.forEach(jt);let i=r?void 0:t.childNodes,l,u=null;if(r)l=-1;else if(!i.length)l=0;else{let p=Dt(i,qr(e.nN));p!==void 0?(u=i[p],l=p):l=Dt(i,o.find(d=>d.tag!==ge&&d.e)?.e)??-1,l===-1&&(r=!0)}for(let p=0,d=o.length;p<d;p++,l++){let a=o[p],x;if(a.s&&a.e)x=a.e,a.s=!1;else{let b=r||!a.e;U(a)?(a.e&&a.d&&(a.e.textContent=a.t),a.d=!1,x=a.e||=document.createTextNode(a.t)):(x=a.e||=a.n?document.createElementNS(a.n,a.tag):document.createElement(a.tag),Wr(x,a.props,a.pP),Lt(a,x,b),a.tag==="select"&&Ur(x,a.props))}a.tag===ge?l--:r?x.parentNode||t.appendChild(x):i[l]!==x&&i[l-1]!==x&&(i[l+1]===x?t.appendChild(i[l]):t.insertBefore(x,u||i[l]||null))}if(e.pP&&(e.pP=void 0),s.length){let p=[],d=[];s.forEach(([,a,,x,b])=>{a&&p.push(a),x&&d.push(x),b?.()}),p.forEach(a=>a()),d.length&&requestAnimationFrame(()=>{d.forEach(a=>a())})}},Gr=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Pe=new WeakMap,Ie=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?Kr(e,t):X(t.props.children),r[0]?.tag===""&&r[0][te]&&(n=r[0][te],e[5].push([e,n,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,i=[],l;for(let u=0;u<r.length;u++){if(Array.isArray(r[u])){r.splice(u,1,...r[u].flat(1/0)),u--;continue}let p=Bt(r[u]);if(p){typeof p.tag=="function"&&!p.tag[ve]&&(H.length>0&&(p[w][2]=H.map(a=>[a,a.values.at(-1)])),e[5]?.length&&(p[w][3]=e[5].at(-1)));let d;if(s&&s.length){let a=s.findIndex(U(p)?x=>U(x):p.key!==void 0?x=>x.key===p.key&&x.tag===p.tag:x=>x.tag===p.tag);a!==-1&&(d=s[a],s.splice(a,1))}if(d)if(U(p))d.t!==p.t&&(d.t=p.t,d.d=!0),p=d;else{let a=d.pP=d.props;if(d.props=p.props,d.f||=p.f||t.f,typeof p.tag=="function"){let x=d[w][2];d[w][2]=p[w][2]||[],d[w][3]=p[w][3],!d.f&&((d.o||d)===p.o||d.tag[we]?.(a,d.props))&&Gr(x,d[w][2])&&(d.s=!0)}p=d}else if(!U(p)&&se){let a=F(se);a&&(p.n=a)}if(!U(p)&&!p.s&&(Ie(e,p),delete p.f),i.push(p),l&&!l.s&&!p.s)for(let a=l;a&&!U(a);a=a.vC?.at(-1))a.nN=p;l=p}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=i,o&&delete t.pC}catch(s){if(t.f=!0,s===Tt){if(n)return;throw s}let[i,l,u]=t[w]?.[3]||[];if(l){let p=()=>ye([0,!1,e[2]],u),d=Pe.get(u)||[];d.push(p),Pe.set(u,d);let a=l(s,()=>{let x=Pe.get(u);if(x){let b=x.indexOf(p);if(b!==-1)return x.splice(b,1),p()}});if(a){if(e[0]===1)e[1]=!0;else if(Ie(e,u,[a]),(l.length===1||e!==i)&&u.c){Je(u,u.c,!1);return}throw Tt}}throw s}finally{n&&e[5].pop()}},Bt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[w]=[0,[]];else{let t=Vr[e.tag];t&&(se||=ae(""),e.props.children=[{tag:se,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Ft=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Ft(o,t,r)))},Pt=(e,t)=>{t[w][2]?.forEach(([r,o])=>{r.values.push(o)});try{Ie(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[w][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Je(t,t.c,!1)},he=new WeakMap,It=[],ye=async(e,t)=>{e[5]||=[];let r=he.get(t);r&&r[0](void 0);let o,n=new Promise(s=>o=s);if(he.set(t,[o,()=>{e[2]?e[2](e,t,s=>{Pt(s,t)}).then(()=>o(t)):(Pt(e,t),o(t))}]),It.length)It.at(-1).add(t);else{await Promise.resolve();let s=he.get(t);s&&(he.delete(t),s[1]())}return n},Yr=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Ie(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();Je(e,o,!0),Ft(e,o,t),t.replaceChildren(o)},Qe=(e,t)=>{Yr(Bt({tag:"",props:{children:e}}),t)};var et=(e,t,r)=>({tag:ge,props:{children:e},key:r,e:t,p:1});var Zr=0,_e=1,Xr=2,Jr=3;var tt=new WeakMap,rt=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var Qr;var Nt=[];var _=e=>{let t=()=>typeof e=="function"?e():e,r=J.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[w][1][Zr]||=[],s=o[w][0]++;return n[s]||=[t(),i=>{let l=Qr,u=n[s];if(typeof i=="function"&&(i=i(u[0])),!Object.is(i,u[0]))if(u[0]=i,Nt.length){let[p,d]=Nt.at(-1);Promise.all([p===3?o:ye([p,!1,l],o),d]).then(([a])=>{if(!a||!(p===2||p===3))return;let x=a.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===a.vC&&ye([p===3?1:0,!1,l],a)})})})}else ye([0,!1,l],o)}]},ot=(e,t,r)=>{let o=Q(i=>{s(l=>e(l,i))},[e]),[n,s]=_(()=>r?r(t):t);return[n,o]},eo=(e,t,r)=>{let o=J.at(-1);if(!o)return;let[,n]=o,s=n[w][1][_e]||=[],i=n[w][0]++,[l,,u]=s[i]||=[];if(rt(l,r)){u&&u();let p=()=>{d[e]=void 0,d[2]=t()},d=[r,void 0,void 0,void 0,void 0];d[e]=p,s[i]=d}},nt=(e,t)=>eo(3,e,t);var Q=(e,t)=>{let r=J.at(-1);if(!r)return e;let[,o]=r,n=o[w][1][Xr]||=[],s=o[w][0]++,i=n[s];return rt(i?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var st=e=>{let t=tt.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>tt.set(e,[r]),r=>tt.set(e,[void 0,r])),e},it=(e,t)=>{let r=J.at(-1);if(!r)return e();let[,o]=r,n=o[w][1][Jr]||=[],s=o[w][0]++,i=n[s];return rt(i?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Ht=ae({pending:!1,data:null,method:null,action:null}),zt=new Set,Vt=e=>{zt.add(e),e.finally(()=>zt.delete(e))};var at=(e,t)=>it(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),Ut=Object.create(null),Wt=Object.create(null),be=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:i,onError:l,precedence:u,blocking:p,...d}=t,a=null,x=!1,b=oe[e],E=Re(e,o),$=g=>g.getAttribute("rel")==="stylesheet"&&g.getAttribute(V)!==null,D;if(E){let g=s.querySelectorAll(e);e:for(let v of g)if(!(e==="link"&&!$(v))){for(let k of b)if(v.getAttribute(k)===t[k]){a=v;break e}}if(!a){let v=b.reduce((k,A)=>t[A]===void 0?k:`${k}-${A}-${t[A]}`,e);x=!Wt[v],a=Wt[v]||=(()=>{let k=document.createElement(e);for(let A of b)t[A]!==void 0&&k.setAttribute(A,t[A]);return t.rel&&k.setAttribute("rel",t.rel),k})()}}else D=s.querySelectorAll(e);u=o?u??"":void 0,o&&(d[V]=u);let B=Q(g=>{if(E){if(e==="link"&&u!==void 0){let k=!1;for(let A of s.querySelectorAll(e)){let j=A.getAttribute(V);if(j===null){s.insertBefore(g,A);return}if(k&&j!==u){s.insertBefore(g,A);return}j===u&&(k=!0)}s.appendChild(g);return}let v=!1;for(let k of s.querySelectorAll(e)){if(v&&k.getAttribute(V)!==u){s.insertBefore(g,k);return}k.getAttribute(V)===u&&(v=!0)}s.appendChild(g)}else if(e==="link")s.contains(g)||s.appendChild(g);else if(D){let v=!1;for(let k of D)if(k===g){v=!0;break}v||s.insertBefore(g,s.contains(D[0])?D[0]:s.querySelector(e)),D=void 0}},[E,u,e]),q=at(t.ref,g=>{let v=b[0];if(r===2&&(g.innerHTML=""),(x||D)&&B(g),!l&&!i||!v)return;let k=Ut[g.getAttribute(v)]||=new Promise((A,j)=>{g.addEventListener("load",A),g.addEventListener("error",j)});i&&(k=k.then(i)),l&&(k=k.catch(l)),k.catch(()=>{})});if(n&&p==="render"){let g=oe[e][0];if(g&&t[g]){let v=t[g],k=Ut[v]||=new Promise((A,j)=>{B(a),a.addEventListener("load",A),a.addEventListener("error",j)});st(k)}}let P={tag:e,type:e,props:{...d,ref:q},ref:q};return P.p=r,a&&(P.e=a),et(P,s)},to=e=>{let t=_t();return(t&&F(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:be("title",e,void 0,!1,!1)},ro=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:be("script",e,1,!1,!0),oo=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,be("style",e,2,!0,!0)),no=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:be("link",e,1,Ce(e),!0),so=e=>be("meta",e,void 0,!1,!1),Kt=Symbol(),io=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=_([null,!1]),s=Q(async p=>{let d=p.isTrusted?t:p.detail[Kt];if(typeof d!="function")return;p.preventDefault();let a=new FormData(p.target);n([a,!0]);let x=d(a);x instanceof Promise&&(Vt(x),await x),n([null,!0])},[]),i=at(e.ref,p=>(p.addEventListener("submit",s),()=>{p.removeEventListener("submit",s)})),[l,u]=o;return o[1]=!1,{tag:Ht,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...r,ref:i},type:"form",ref:i}},f:u}},qt=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=Q(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Kt]:t}}))},[]);r.ref=at(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},ao=e=>qt("input",e),co=e=>qt("button",e);Object.assign(le,{title:to,script:ro,style:oo,link:no,meta:so,form:io,input:ao,button:co});var ee=":-hono-global",fo=new RegExp(`^${ee}{(.*)}$`),Me="hono-css",W=Symbol(),T=Symbol(),O=Symbol(),N=Symbol(),Oe=Symbol(),Zt=Symbol(),di=Symbol();var Xt=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Jt=e=>e.trim().replace(/\s+/g,"-"),Qt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),po=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),uo=e=>Qt(e)&&!po.has(e.toLowerCase()),er=e=>{console.warn(`Invalid slug: ${e}`)},mo=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),xo=new RegExp(["("+mo+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),ho=e=>e.replace(xo,(t,r,o,n,s)=>r||o||n||s||""),tr=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let i=0,l=e.length;i<l;i++){s+=e[i];let u=t[i];if(!(typeof u=="boolean"||u===null||u===void 0)){Array.isArray(u)||(u=[u]);for(let p=0,d=u.length;p<d;p++){let a=u[p];if(!(typeof a=="boolean"||a===null||a===void 0))if(typeof a=="string")/([\\"'\/])/.test(a)?s+=a.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=a;else if(typeof a=="number")s+=a;else if(a[Zt])s+=a[Zt];else if(a[T].startsWith("@keyframes "))r.push(a),s+=` ${a[T].substring(11)} `;else{if(e[i+1]?.match(/^\s*{/))r.push(a),a=`.${a[T]}`;else{r.push(...a[N]),o.push(...a[Oe]),a=a[O];let x=a.length;if(x>0){let b=a[x-1];b!==";"&&b!=="}"&&(a+=";")}}s+=`${a||""}`}}}}return[n,ho(s),r,o]},ie=(e,t,r,o)=>{let[n,s,i,l]=tr(e,t),u=fo.exec(s);u&&(s=u[1]);let p=Xt(n+s),d;if(r){let b=r(p,Jt(n),s);b&&(Qt(b)?d=b:(o||er)(b))}let a=(u?ee:"")+(d||p),x=(u?i.map(b=>b[T]):[a,...l]).join(" ");return{[W]:a,[T]:x,[O]:s,[N]:i,[Oe]:l}},je=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[W]:"",[T]:"",[O]:"",[N]:[],[Oe]:[o]})}return e},Le=(e,t,r,o)=>{let[n,s]=tr(e,t),i=Xt(n+s),l;if(r){let u=r(i,Jt(n),s);u&&(uo(u)?l=u:(o||er)(u))}return{[W]:"",[T]:`@keyframes ${l||i}`,[O]:s,[N]:[],[Oe]:[]}},go=0,Be=(e,t,r,o)=>{e||(e=[`/* h-v-t ${go++} */`]);let n=Array.isArray(e)?ie(e,t,r,o):e,s=n[T],i=ie(["view-transition-name:",""],[s],r,o);return n[T]=ee+n[T],n[O]=n[O].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),i[T]=i[W]=s,i[N]=[...n[N],n],i};var bo=e=>{let t=[],r=0,o=0;for(let n=0,s=e.length;n<s;n++){let i=e[n];if(i==="'"||i==='"'){let l=i;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===l)break}continue}if(i==="{"){o++;continue}if(i==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},ct=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(i,l)=>{let[u,p]=r();if(!u||!p){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(i,l)});return}p.has(i)||(p.add(i),(i.startsWith(ee)?bo(l):[`${i[0]==="@"?"":"."}${i}{${l}}`]).forEach(d=>{u.insertRule(d,u.cssRules.length)}))};return[{toString(){let i=this[W];return o(i,this[O]),this[N].forEach(({[T]:l,[O]:u})=>{o(l,u)}),this[T]}},({children:i,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:i&&(Array.isArray(i)?i:[i]).map(u=>u[O])}})]},So=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=ct({id:e}),s=d=>(d.toString=o.toString,d),i=(d,...a)=>s(ie(d,a,t,r));return{css:i,cx:(...d)=>(d=je(d),i(Array(d.length).fill(""),...d)),keyframes:(d,...a)=>Le(d,a,t,r),viewTransition:(d,...a)=>s(Be(d,a,t,r)),Style:n}},Se=So({id:Me}),xi=Se.css,hi=Se.cx,gi=Se.keyframes,yi=Se.viewTransition,bi=Se.Style;var Eo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=ct({id:e}),s=new WeakMap,i=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),u=E=>{let $=({buffer:P,context:g})=>{let[v,k]=s.get(g),A=Object.keys(v);if(!A.length)return;let j="";if(A.forEach(Z=>{k[Z]=!0,j+=Z.startsWith(ee)?v[Z]:`${Z[0]==="@"?"":"."}${Z}{${v[Z]}}`}),s.set(g,[{},k]),P&&l.test(P[0])){P[0]=P[0].replace(l,(Z,vr,wr)=>`${vr}${j}${wr}`);return}let bt=i.get(g),St=`<script${bt?` nonce="${bt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(j)}<\/script>`;if(P){P[0]=`${St}${P[0]}`;return}return Promise.resolve(St)},D=({context:P})=>{s.has(P)||s.set(P,[{},{}]);let[g,v]=s.get(P),k=!0;if(v[E[W]]||(k=!1,g[E[W]]=E[O]),E[N].forEach(({[T]:A,[O]:j})=>{v[A]||(k=!1,g[A]=j)}),!k)return Promise.resolve(I("",[$]))},B=new String(E[T]);Object.assign(B,E),B.isEscaped=!0,B.callbacks=[D];let q=Promise.resolve(B);return Object.assign(q,E),q.toString=o.toString,q},p=(E,...$)=>u(ie(E,$,t,r)),d=(...E)=>(E=je(E),p(Array(E.length).fill(""),...E)),a=(E,...$)=>Le(E,$,t,r),x=(E,...$)=>u(Be(E,$,t,r)),b=({children:E,nonce:$}={})=>I(`<style id="${e}"${$?` nonce="${$}"`:""}>${E?E[O]:""}</style>`,[({context:D})=>{i.set(D,$)}]);return b[G]=n,{css:p,cx:d,keyframes:a,viewTransition:x,Style:b}},Ee=Eo({id:Me}),f=Ee.css,Ci=Ee.cx,K=Ee.keyframes,Ri=Ee.viewTransition,rr=Ee.Style;var or=["0-5","6-11","12-17","18-24","25-34","35-44","45-59","60+"],nr={loading:!1,error:null,members:[],lookups:{parentesco:[],specificities:[]},selectedSpecificityId:null,originalSpecificityId:null,saving:!1,ageProfile:{"0-5":0,"6-11":0,"12-17":0,"18-24":0,"25-34":0,"35-44":0,"45-59":0,"60+":0}};var lt=(e,t)=>{let r,o,n;if(e.includes("/")){let p=e.split("/");n=parseInt(p[0]??"0",10),o=parseInt(p[1]??"0",10),r=parseInt(p[2]??"0",10)}else{let p=e.split("-");r=parseInt(p[0]??"0",10),o=parseInt(p[1]??"0",10),n=parseInt(p[2]??"0",10)}let s=t.getFullYear(),i=t.getMonth()+1,l=t.getDate(),u=s-r;return(i<o||i===o&&l<n)&&(u-=1),Math.max(0,u)},$o=e=>e<=5?"0-5":e<=11?"6-11":e<=17?"12-17":e<=24?"18-24":e<=34?"25-34":e<=44?"35-44":e<=59?"45-59":"60+",Fe=(e,t)=>{let r={};for(let o of or)r[o]=0;for(let o of e){if(!o.birthDate)continue;let n=lt(o.birthDate,t),s=$o(n);r[s]=(r[s]??0)+1}return r};var sr=(e,t)=>{switch(t.type){case"LOAD_START":return{...e,loading:!0,error:null};case"LOAD_SUCCESS":{let r=Fe(t.members,new Date);return{...e,loading:!1,error:null,members:t.members,lookups:t.lookups,selectedSpecificityId:t.specificityId,originalSpecificityId:t.specificityId,ageProfile:r}}case"LOAD_FAILURE":return{...e,loading:!1,error:t.error};case"ADD_MEMBER":{let r=[...e.members,t.member],o=Fe(r,new Date);return{...e,members:r,ageProfile:o}}case"UPDATE_MEMBER":{let r=e.members.map((n,s)=>s===t.index?t.member:n),o=Fe(r,new Date);return{...e,members:r,ageProfile:o}}case"REMOVE_MEMBER":{let r=e.members.filter(n=>n.personId!==t.personId),o=Fe(r,new Date);return{...e,members:r,ageProfile:o}}case"SET_CAREGIVER":return{...e,members:e.members.map(r=>({...r,isPrimaryCaregiver:r.personId===t.personId}))};case"TOGGLE_DOCUMENT":return{...e,members:e.members.map(r=>{if(r.personId!==t.personId)return r;let o=r.requiredDocuments.includes(t.doc)?r.requiredDocuments.filter(n=>n!==t.doc):[...r.requiredDocuments,t.doc];return{...r,requiredDocuments:o}})};case"SET_SPECIFICITY":return{...e,selectedSpecificityId:t.id};case"SAVE_START":return{...e,saving:!0};case"SAVE_SUCCESS":return{...e,saving:!1,originalSpecificityId:e.selectedSpecificityId};case"SAVE_FAILURE":return{...e,saving:!1,error:t.error}}};var $e={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Ne=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},ko=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},ze=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:$e});return Ne(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},ir=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:$e});return ko(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},He=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:$e,body:JSON.stringify(t)});return Ne(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},ar=async(e,t)=>{try{let r=await fetch(e,{method:"PUT",credentials:"same-origin",headers:$e,body:JSON.stringify(t)});return Ne(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},cr=async e=>{try{let t=await fetch(e,{method:"DELETE",credentials:"same-origin",headers:$e});return Ne(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var lr={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),ir(`/api/v1/patients?${o.toString()}`)},getById:e=>ze(`/api/v1/patients/${e}`),create:e=>He("/api/v1/patients",e)};var ft=new Map,pt={getTable:async e=>{let t=ft.get(e);if(t)return{ok:!0,value:t};let r=await ze(`/api/v1/lookups/${e}`);return r.ok&&ft.set(e,r.value),r},clearCache:()=>{ft.clear()}};var Ve={addMember:(e,t)=>He(`/api/v1/patients/${e}/family-members`,t),removeMember:(e,t)=>cr(`/api/v1/patients/${e}/family-members/${t}`),assignPrimaryCaregiver:(e,t)=>ar(`/api/v1/patients/${e}/primary-caregiver`,t)};var m={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.5)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},R=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},h={satoshi:"'Satoshi', sans-serif",playfair:"'Playfair Display', serif",erode:"'Erode', serif"},y={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},S={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Ue={button:f`
    box-shadow:
      2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12),
      -1px -1px 4px rgba(0, 0, 0, 0.06);
  `,panel:f`
    box-shadow: -8px 0 40px ${R(m.textPrimary,.3)};
  `,fab:f`
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  `,dialog:f`
    box-shadow: 0 24px 80px ${m.inputLine};
  `,modal:f`
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.04),
      -9px 9px 9px -0.5px rgba(0, 0, 0, 0.04),
      -18px 18px 18px -1.5px rgba(0, 0, 0, 0.08),
      -37px 37px 37px -3px rgba(0, 0, 0, 0.16),
      -75px 75px 75px -6px rgba(0, 0, 0, 0.24),
      -150px 150px 150px -12px rgba(0, 0, 0, 0.48);
  `},L={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var C={bgBase:"#F8F3EC",bgWarm:"#F0E8DC",bgSage:"#E2E8DF",bgSageDeep:"#D4DDD0",bgCard:"rgba(255,255,255,0.45)",bgCardHover:"rgba(255,255,255,0.65)",bgCardBorder:"rgba(255,255,255,0.6)",bgCardBorderHover:"rgba(79,132,72,0.2)",textPrimary:"#1E2B1A",textSecondary:"#3D5235",textMuted:"#6B7F65",textSoft:"#8B9E85",textLabel:"#5A7154",greenPrimary:"#4F8448",greenDark:"#3D6A37",greenLight:"rgba(79,132,72,0.08)",danger:"#C4422B",dangerLight:"rgba(196,66,43,0.08)",dangerBorder:"rgba(196,66,43,0.15)",inputBorder:"rgba(79,132,72,0.15)",inputBorderFilled:"rgba(79,132,72,0.3)",cardShadow:"0 2px 12px rgba(0,0,0,0.04)",buttonShadow:"0 2px 12px rgba(79,132,72,0.2)",buttonShadowHover:"0 4px 20px rgba(79,132,72,0.3)",successCircleShadow:"0 4px 20px rgba(79,132,72,0.25)",overlayShadow:"0 8px 40px rgba(0,0,0,0.06)"},dt={sm:"8px",md:"12px",lg:"16px",xl:"20px"},ut={out:"cubic-bezier(0.16, 1, 0.3, 1)",spring:"cubic-bezier(0.34, 1.56, 0.64, 1)"};var vo=f`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${y.bold};
  color: ${m.textMuted};
`,fr=f`
  color: ${m.textMuted};
`,wo=f`
  color: ${m.textPrimary};
`,pr=({lastName:e})=>c("nav",{class:vo,children:[c("span",{children:"Familias"}),c("span",{class:fr,children:"/"}),c("span",{children:e}),c("span",{class:fr,children:"/"}),c("span",{class:wo,children:"Composicao Familiar"})]});var Co=f`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${S[3]};
`,Ro=f`
  font-family: ${h.satoshi};
  font-size: 38px;
  font-weight: ${y.bold};
  color: ${m.textPrimary};
  line-height: 1.2;
`,Ao=f`
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
  ${Ue.fab}
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`,dr=({onAdd:e})=>c("div",{class:Co,children:[c("h1",{class:Ro,children:"Composicao Familiar"}),c("button",{class:Ao,onClick:e,"aria-label":"Adicionar membro",children:"+"})]});var Do=f`
  display: table-row;
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${y.medium};
  color: ${m.textPrimary};
`,To=f`
  background: ${R(m.primary,.05)};
`,Po=f`
  background: ${R(m.backgroundDark,.04)};
`,Y=f`
  padding: 12px 8px;
  vertical-align: middle;
  border-bottom: 1px solid ${m.inputLine};
`,ur=f`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: ${y.bold};
  letter-spacing: 0.3px;
`,Io=f`
  ${ur}
  background: ${R(m.primary,.12)};
  color: ${m.primary};
`,_o=f`
  ${ur}
  background: ${R(m.backgroundDark,.1)};
  color: ${m.backgroundDark};
`,mt=f`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`,Mo=f`
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.4;
  cursor: default;
`,mr=({member:e,onEdit:t,onRemove:r,onSetCaregiver:o})=>{let n=lt(e.birthDate,new Date),s=e.isPR?To:e.isPrimaryCaregiver?Po:Do;return c("tr",{class:s,children:[c("td",{class:Y,children:[e.name,e.isPR&&c("span",{class:Io,children:" Referencia"}),e.isPrimaryCaregiver&&!e.isPR&&c("span",{class:_o,children:" Cuidador"})]}),c("td",{class:Y,children:n}),c("td",{class:Y,children:e.sex}),c("td",{class:Y,children:e.relationshipLabel}),c("td",{class:Y,children:e.residesWithPatient?"Sim":"Nao"}),c("td",{class:Y,children:e.hasDisability?"Sim":"Nao"}),c("td",{class:Y,children:e.requiredDocuments.join(", ")||"-"}),c("td",{class:Y,children:[c("button",{class:mt,onClick:o,title:"Definir cuidador",children:"\u2605"}),c("button",{class:mt,onClick:t,title:"Editar",children:"\u270E"}),e.isPR?c("span",{class:Mo,title:"Pessoa de referencia nao pode ser removida",children:"\u{1F512}"}):c("button",{class:mt,onClick:r,title:"Remover",children:"\u{1F5D1}"})]})]})};var Oo=f`
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
`,jo=f`
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${y.bold};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  color: ${m.textMuted};
  text-align: left;
  padding: 12px 8px;
  border-bottom: 2px solid ${m.inputLine};
`,Lo=["Nome","Idade","Sexo","Parentesco","Reside","PcD","Docs","Acoes"],xr=({members:e,onEdit:t,onRemove:r,onSetCaregiver:o})=>c("table",{class:Oo,children:[c("thead",{children:c("tr",{children:Lo.map(n=>c("th",{class:jo,children:n},n))})}),c("tbody",{children:e.map((n,s)=>c(mr,{member:n,onEdit:()=>t(s),onRemove:()=>r(n.personId),onSetCaregiver:()=>o(n.personId)},n.personId))})]});var Bo=f`
  position: fixed;
  inset: 0;
  background: ${R(m.textPrimary,.4)};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`,Fo=e=>f`
  background: ${m.backgroundDark};
  border-radius: ${L.modal};
  ${Ue.modal}
  padding: ${S[6]};
  max-width: ${e};
  width: 92vw;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
`,We=({maxWidth:e,children:t,onClose:r})=>c("div",{class:Bo,onClick:r,children:c("div",{class:Fo(e??"760px"),onClick:o=>o.stopPropagation(),children:t})});var No=f`
  display: flex;
  gap: ${S[5]};
  flex-wrap: wrap;
`,zo=f`
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`,Ho=f`
  flex: 0 1 220px;
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid ${R(m.background,.2)};
  border-radius: ${L.dropdown};
  padding: ${S[2]};
`,Vo=f`
  font-family: ${h.satoshi};
  font-size: 22px;
  font-weight: ${y.bold};
  color: ${m.background};
  margin-bottom: ${S[4]};
`,xt=f`
  font-family: ${h.satoshi};
  font-size: 12px;
  font-weight: ${y.bold};
  color: ${R(m.background,.5)};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  margin-bottom: 4px;
`,gt=f`
  border: none;
  border-bottom: 1px solid ${R(m.background,.3)};
  padding: 0 0 6px 0;
  font-family: ${h.playfair};
  font-style: italic;
  font-size: 14px;
  font-weight: 300;
  color: ${m.background};
  background: transparent;
  outline: none;
  width: 100%;
  &:focus { border-bottom-color: ${m.background}; }
  &::placeholder { color: ${R(m.background,.5)}; }
`,Uo=f`
  ${gt}
  appearance: none;
  cursor: pointer;
`,Wo=e=>f`
  padding: 8px 12px;
  font-family: ${h.satoshi};
  font-size: 13px;
  color: ${m.background};
  cursor: pointer;
  border-radius: 4px;
  font-weight: ${e?y.semibold:y.regular};
  background: ${e?R(m.background,.1):"transparent"};
  &:hover { background: ${R(m.background,.05)}; }
`,ht=f`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${m.background};
  font-family: ${h.satoshi};
  font-size: 14px;
`,Ko=f`
  margin-top: ${S[4]};
  padding: 12px 32px;
  border-radius: ${L.pill};
  border: none;
  background: ${m.primary};
  color: white;
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${y.bold};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`,hr=({lookups:e,onSave:t,onClose:r,editMember:o})=>{let n=!!o,[s,i]=_(o?.name??""),[l,u]=_(o?.birthDate??""),[p,d]=_(o?.sex??""),[a,x]=_(o?.residesWithPatient??!0),[b,E]=_(o?.hasDisability??!1),[$,D]=_(o?.isPrimaryCaregiver??!1),[B,q]=_(o?.relationshipId??"");return c(We,{onClose:r,maxWidth:"760px",children:[c("h2",{class:Vo,children:n?"Editar Membro":"Adicionar Membro"}),c("div",{class:No,children:[c("div",{class:zo,children:[c("div",{children:[c("label",{class:xt,children:"Nome *"}),c("input",{class:gt,value:s,onInput:g=>i(g.target.value),placeholder:"Nome completo",disabled:n})]}),c("div",{children:[c("label",{class:xt,children:"Data Nasc. *"}),c("input",{class:gt,type:"date",value:l,onInput:g=>u(g.target.value),disabled:n})]}),c("div",{children:[c("label",{class:xt,children:"Sexo *"}),c("select",{class:Uo,value:p,onChange:g=>d(g.target.value),disabled:n,children:[c("option",{value:"",children:"Selecione"}),c("option",{value:"Masculino",children:"Masculino"}),c("option",{value:"Feminino",children:"Feminino"})]})]}),c("label",{class:ht,children:[c("input",{type:"checkbox",checked:a,onChange:()=>x(!a)}),"Reside com paciente"]}),c("label",{class:ht,children:[c("input",{type:"checkbox",checked:b,onChange:()=>E(!b)}),"Pessoa com deficiencia"]}),c("label",{class:ht,children:[c("input",{type:"checkbox",checked:$,onChange:()=>D(!$)}),"Cuidador principal"]}),c("button",{class:Ko,onClick:()=>{if(!s||!l||!p||!B)return;let g=e.find(v=>v.id===B);t({personId:o?.personId??crypto.randomUUID(),name:s,birthDate:l,sex:p,relationshipId:B,relationshipLabel:g?.descricao??"",residesWithPatient:a,hasDisability:b,isPrimaryCaregiver:$,isPR:o?.isPR??!1,requiredDocuments:o?.requiredDocuments??[]})},children:n?"Salvar alteracoes":"Adicionar"})]}),c("div",{class:Ho,children:e.map(g=>c("div",{class:Wo(B===g.id),onClick:()=>q(g.id),children:g.descricao},g.id))})]})]})};var qo=f`
  font-family: ${h.satoshi};
  font-size: 22px;
  font-weight: ${y.bold};
  color: ${m.background};
  margin-bottom: ${S[3]};
`,Go=f`
  font-family: ${h.satoshi};
  font-size: 14px;
  color: ${R(m.background,.7)};
  line-height: 1.5;
  margin-bottom: ${S[5]};
`,Yo=f`
  display: flex;
  gap: ${S[3]};
  justify-content: flex-end;
`,Zo=f`
  padding: 10px 24px;
  border-radius: ${L.pill};
  border: 1.5px solid ${R(m.background,.4)};
  background: transparent;
  color: ${m.background};
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${y.medium};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
`,Xo=f`
  padding: 10px 24px;
  border-radius: ${L.pill};
  border: none;
  background: ${m.danger};
  color: white;
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${y.bold};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`,gr=({title:e,message:t,confirmLabel:r,onConfirm:o,onCancel:n})=>c(We,{onClose:n,maxWidth:"420px",children:[c("h2",{class:qo,children:e}),c("p",{class:Go,children:t}),c("div",{class:Yo,children:[c("button",{class:Zo,onClick:n,children:"Cancelar"}),c("button",{class:Xo,onClick:o,children:r})]})]});var Jo=f`
  margin-top: ${S[5]};
`,Qo=f`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${y.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${m.textMuted};
  margin-bottom: ${S[3]};
`,en=f`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,tn=e=>f`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${e?R(m.primary,.06):"transparent"};
  transition: background 0.15s;
  &:hover { background: ${R(m.primary,.04)}; }
`,rn=f`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 2px solid ${m.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,on=f`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${m.textPrimary};
`,nn=f`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${y.regular};
  color: ${m.textPrimary};
`,yr=({items:e,selectedId:t,onSelect:r})=>c("div",{class:Jo,children:[c("h3",{class:Qo,children:"Especificidades Sociais"}),c("div",{class:en,children:e.map(o=>c("div",{class:tn(t===o.id),onClick:()=>r(o.id),children:[c("div",{class:rn,children:t===o.id&&c("div",{class:on})}),c("span",{class:nn,children:o.descricao})]},o.id))})]});var sn=f`
  margin-top: ${S[5]};
`,an=f`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${y.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${m.textMuted};
  margin-bottom: ${S[3]};
`,cn=f`
  width: 100%;
  max-width: 320px;
  border-collapse: collapse;
`,ln=e=>f`
  background: ${e?R(m.primary,.07):"transparent"};
`,br=f`
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${y.medium};
  color: ${m.textPrimary};
  padding: 8px 12px;
  border-bottom: 1px solid ${m.inputLine};
`,fn=f`
  ${br}
  text-align: right;
  font-weight: ${y.bold};
`,pn={"0-5":"0 a 5 anos","6-11":"6 a 11 anos","12-17":"12 a 17 anos","18-24":"18 a 24 anos","25-34":"25 a 34 anos","35-44":"35 a 44 anos","45-59":"45 a 59 anos","60+":"60 anos ou mais"},Sr=({ageProfile:e})=>c("div",{class:sn,children:[c("h3",{class:an,children:"Perfil Etario"}),c("table",{class:cn,children:c("tbody",{children:Object.entries(pn).map(([t,r])=>{let o=e[t]??0;return c("tr",{class:ln(o>0),children:[c("td",{class:br,children:r}),c("td",{class:fn,children:o})]},t)})})})]});var dn=K`
  to { transform: rotate(360deg); }
`,un=f`
  width: 32px;
  height: 32px;
  border: 3px solid ${m.inputLine};
  border-top-color: ${m.primary};
  border-radius: 50%;
  animation: ${dn} 0.8s linear infinite;
`,Er=()=>c("div",{class:un});var Oa=f`
  border: none;
  border-bottom: 2px solid ${m.inputLine};
  background: transparent;
  padding: ${S[2]} 0;
  font-family: ${h.erode};
  font-size: 16px;
  font-weight: ${y.regular};
  color: ${m.textPrimary};
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease;
  &:focus {
    border-bottom-color: ${m.primary};
  }
`,ja=f`
  border-bottom-color: ${m.danger};
  &:focus {
    border-bottom-color: ${m.danger};
  }
`,La=f`
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${y.bold};
  color: ${m.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,Ba=f`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${m.primary};
  color: ${m.surfaceLight};
  font-family: ${h.erode};
  font-size: 16px;
  font-weight: ${y.medium};
  border: none;
  border-radius: ${L.pill};
  padding: ${S[3]} ${S[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
  &:active {
    opacity: 0.8;
  }
`,Fa=f`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${m.primary};
  font-family: ${h.erode};
  font-size: 16px;
  font-weight: ${y.medium};
  border: 2px solid ${m.primary};
  border-radius: ${L.pill};
  padding: ${S[3]} ${S[5]};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${m.primary};
    color: ${m.surfaceLight};
  }
`,Na=f`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${m.danger};
  color: ${m.surfaceLight};
  font-family: ${h.erode};
  font-size: 16px;
  font-weight: ${y.medium};
  border: none;
  border-radius: ${L.pill};
  padding: ${S[3]} ${S[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
`,za=f`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,Ha=f`
  background: ${m.surface};
  border-radius: ${L.card};
  padding: ${S[4]};
  transition: box-shadow 0.2s ease;
`,Va=f`
  &:hover {
    box-shadow:
      2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12),
      -1px -1px 4px rgba(0, 0, 0, 0.06);
    }
  `,Ua=f`
    display: flex;
    flex-direction: column;
    gap: ${S[3]};
  `,Wa=f`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${S[3]};
  `,Ka=f`
    display: flex;
    align-items: center;
    justify-content: center;
  `,qa=f`
    font-family: ${h.satoshi};
    font-weight: ${y.bold};
    color: ${m.textPrimary};
    line-height: 1.2;
  `,Ga=f`
    font-family: ${h.satoshi};
    font-weight: ${y.regular};
    font-size: 16px;
    color: ${m.textPrimary};
    line-height: 1.5;
  `,Ya=f`
    font-family: ${h.satoshi};
    font-size: 11px;
    color: ${m.textMuted};
    line-height: 1.4;
  `,Za=f`
    font-family: ${h.satoshi};
    font-size: 11px;
    color: ${m.danger};
    line-height: 1.4;
  `,Xa=f`
    font-family: ${h.satoshi};
    font-size: 10px;
    font-weight: ${y.bold};
    color: ${m.textMuted};
    text-transform: uppercase;
    letter-spacing: 1.5px;
  `,yt=f`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: ${S[4]} 48px;

    @media (max-width: 1200px) {
      padding: ${S[4]} 40px;
    }

    @media (max-width: 600px) {
      padding: ${S[3]} 20px;
    }
  `,Ja=f`
    border: none;
    border-bottom: 1.5px solid ${C.inputBorder};
    background: transparent;
    padding: 10px 0;
    font-family: ${h.satoshi};
    font-size: 15px;
    font-weight: ${y.regular};
    color: ${C.textPrimary};
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
    &:focus {
      border-bottom-color: ${C.greenPrimary};
    }
    &::placeholder {
      color: ${C.textSoft};
      font-style: italic;
    }
  `,Qa=f`
    border-bottom-color: ${C.danger};
    &:focus {
      border-bottom-color: ${C.danger};
    }
  `,ec=f`
    font-family: ${h.satoshi};
    font-size: 12px;
    font-weight: ${y.semibold};
    color: ${C.textLabel};
    text-transform: uppercase;
    letter-spacing: 1px;
  `,tc=f`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${C.greenPrimary}, ${C.greenDark});
    color: white;
    font-family: ${h.satoshi};
    font-size: 14px;
    font-weight: ${y.semibold};
    border: none;
    border-radius: 100px;
    padding: 12px 28px;
    cursor: pointer;
    box-shadow: ${C.buttonShadow};
    transition: transform 0.2s ${ut.out}, box-shadow 0.2s ${ut.out};
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${C.buttonShadowHover};
    }
    &:active {
      transform: translateY(0);
    }
    &:focus-visible {
      outline: 2px solid ${C.greenPrimary};
      outline-offset: 2px;
    }
  `,rc=f`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: ${C.textMuted};
    font-family: ${h.satoshi};
    font-size: 14px;
    font-weight: ${y.semibold};
    border: 1.5px solid rgba(79, 132, 72, 0.2);
    border-radius: 100px;
    padding: 10px 20px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
    &:hover {
      border-color: rgba(79, 132, 72, 0.4);
      color: ${C.textSecondary};
    }
    &:focus-visible {
      outline: 2px solid ${C.greenPrimary};
      outline-offset: 2px;
    }
  `,oc=f`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `,nc=f`
    background: ${C.bgCard};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${C.bgCardBorder};
    border-radius: ${dt.xl};
    padding: ${S[5]};
    box-shadow: ${C.cardShadow};
  `,sc=f`
    transition: border-color 0.2s ease, background 0.2s ease;
    &:hover {
      background: ${C.bgCardHover};
      border-color: ${C.bgCardBorderHover};
    }
  `,ic=f`
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: ${dt.lg};
    padding: ${S[5]};
    position: relative;
  `,ac=f`
    border-color: rgba(79, 132, 72, 0.3);
    background: rgba(79, 132, 72, 0.04);
  `,cc=f`
    font-family: ${h.erode};
    font-weight: ${y.bold};
    color: ${C.textPrimary};
    line-height: 1.2;
  `,lc=f`
    font-family: ${h.satoshi};
    font-weight: ${y.regular};
    font-size: 15px;
    color: ${C.textPrimary};
    line-height: 1.5;
  `,fc=f`
    font-family: ${h.satoshi};
    font-size: 14px;
    color: ${C.textMuted};
    line-height: 1.5;
  `,pc=f`
    font-family: ${h.satoshi};
    font-size: 12.5px;
    color: ${C.danger};
    margin-top: 4px;
  `,dc=K`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,uc=K`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,mc=K`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`,xc=K`
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`,hc=K`
  to { stroke-dashoffset: 0; }
`,gc=K`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`,yc=f`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 24px;
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  `,bc=f`
    grid-column: 1 / -1;
  `;var mn=f`
  margin-top: ${S[4]};
`,$r=({patientId:e})=>{let[t,r]=ot(sr,nr),[o,n]=_({open:!1}),[s,i]=_({open:!1});nt(()=>{r({type:"LOAD_START"}),(async()=>{let[a,x,b]=await Promise.all([lr.getById(e),pt.getTable("parentesco"),pt.getTable("specificities")]);if(!a.ok){r({type:"LOAD_FAILURE",error:a.error});return}let E=a.value.familyMembers.map($=>({personId:$.memberId,name:$.fullName,birthDate:"",sex:"",relationshipId:"",relationshipLabel:$.relationship,residesWithPatient:!0,hasDisability:!1,isPrimaryCaregiver:!1,isPR:!1,requiredDocuments:[]}));r({type:"LOAD_SUCCESS",members:E,lookups:{parentesco:x.ok?x.value.map($=>({id:$.id,codigo:$.code,descricao:$.description,ativo:$.active})):[],specificities:b.ok?b.value.map($=>({id:$.id,codigo:$.code,descricao:$.description,ativo:$.active})):[]},specificityId:null})})()},[e]);let l=d=>{o.open&&o.editIndex!==null?r({type:"UPDATE_MEMBER",index:o.editIndex,member:d}):(r({type:"ADD_MEMBER",member:d}),Ve.addMember(e,d)),n({open:!1})},u=d=>{r({type:"REMOVE_MEMBER",personId:d}),Ve.removeMember(e,d),i({open:!1})};if(t.loading)return c("div",{class:yt,children:c(Er,{})});let p=t.members[0]?.name.split(" ").slice(-1)[0]??"";return c("div",{class:yt,children:[c(pr,{lastName:p}),c(dr,{onAdd:()=>n({open:!0,editIndex:null})}),c("div",{class:mn,children:[c(xr,{members:t.members,onEdit:d=>n({open:!0,editIndex:d}),onRemove:d=>{let a=t.members.find(x=>x.personId===d);i({open:!0,personId:d,name:a?.name??""})},onSetCaregiver:d=>{r({type:"SET_CAREGIVER",personId:d}),Ve.assignPrimaryCaregiver(e,{memberId:d})}}),c(yr,{items:t.lookups.specificities,selectedId:t.selectedSpecificityId,onSelect:d=>r({type:"SET_SPECIFICITY",id:d})}),c(Sr,{ageProfile:t.ageProfile})]}),o.open&&c(hr,{lookups:t.lookups.parentesco,onSave:l,onClose:()=>n({open:!1}),editMember:o.editIndex!==null?t.members[o.editIndex]:void 0}),s.open&&c(gr,{title:"Remover membro",message:`Tem certeza que deseja remover ${s.name} da composicao familiar?`,confirmLabel:"Remover",onConfirm:()=>u(s.personId),onCancel:()=>i({open:!1})})]})};var kr=document.getElementById("family-app");if(kr){let e=window.location.pathname.split("/"),t=e[e.indexOf("family-composition")+1]??"";Qe(c(Te,{children:[c(rr,{}),c($r,{patientId:t})]}),kr)}
