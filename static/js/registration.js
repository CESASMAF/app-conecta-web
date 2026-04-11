var Ir=Object.defineProperty;var Nr=(e,t)=>{for(var r in t)Ir(e,r,{get:t[r],enumerable:!0})};var Mr={Stringify:1,BeforeStream:2,Stream:3},k=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Lr=/[&<>'"]/,Re=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let i=o[n];typeof i=="object"&&t.push(...i.callbacks||[]);let a=i.isEscaped;if(i=await(typeof i=="object"?i.toString():i),typeof i=="object"&&t.push(...i.callbacks||[]),i.isEscaped??a)r+=i;else{let l=[r];F(i,l),r=l[0]}}return k(r,t)},F=(e,t)=>{let r=e.search(Lr);if(r===-1){t[0]+=e;return}let o,n,i=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(i,n)+o,i=n+1}t[0]+=e.substring(i,n)},Ge=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:Mr.Stringify,buffer:r,context:o})),r[0]};var H=Symbol("RENDERER"),ie=Symbol("ERROR_HANDLER"),C=Symbol("STASH"),ke=Symbol("INTERNAL"),Te=Symbol("MEMO"),ae=Symbol("PERMALINK");var He=e=>(e[ke]=!0,e);var We=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:He(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:He(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[ie]=i=>{throw e.pop(),i},n},ue=e=>{let t=[e],r=We(t);return r.values=t,r.Provider=r,B.push(r),r};var B=[],ht=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new me("",{},o.children):o.children).toString():""}catch(i){throw t.pop(),i}return n instanceof Promise?n.finally(()=>t.pop()).then(i=>k(i,i.callbacks)):(t.pop(),k(n))};return r.values=t,r.Provider=r,r[H]=We(t),B.push(r),r},M=e=>e.values.at(-1);var le={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},he={},z="data-precedence",_e=e=>e.rel==="stylesheet"&&"precedence"in e,Oe=(e,t)=>e==="link"?t:le[e].length>0;var ye={};Nr(ye,{button:()=>Hr,form:()=>Vr,input:()=>Gr,link:()=>zr,meta:()=>Ur,script:()=>Fr,style:()=>Br,title:()=>jr});var J=e=>Array.isArray(e)?e:[e];var gt=new WeakMap,xt=(e,t,r,o)=>({buffer:n,context:i})=>{if(!n)return;let a=gt.get(i)||{};gt.set(i,a);let l=a[e]||=[],c=!1,u=le[e],m=Oe(e,o!==void 0);if(m){e:for(let[,f]of l)if(!(e==="link"&&!(f.rel==="stylesheet"&&f[z]!==void 0))){for(let g of u)if((f?.[g]??null)===r?.[g]){c=!0;break e}}}if(c?n[0]=n[0].replaceAll(t,""):m||e==="link"?l.push([t,r,o]):l.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let f;if(e==="link"||o!==void 0){let g=[];f=l.map(([b,,E],R)=>{if(E===void 0)return[b,Number.MAX_SAFE_INTEGER,R];let T=g.indexOf(E);return T===-1&&(g.push(E),T=g.length-1),[b,T,R]}).sort((b,E)=>b[1]-E[1]||b[2]-E[2]).map(([b])=>b)}else f=l.map(([g])=>g);f.forEach(g=>{n[0]=n[0].replaceAll(g,"")}),n[0]=n[0].replace(/(?=<\/head>)/,f.join(""))}},ge=(e,t,r)=>k(new P(e,r,J(t??[])).toString()),xe=(e,t,r,o)=>{if("itemProp"in r)return ge(e,t,r);let{precedence:n,blocking:i,...a}=r;n=o?n??"":void 0,o&&(a[z]=n);let l=new P(e,a,J(t||[])).toString();return l instanceof Promise?l.then(c=>k(l,[...c.callbacks||[],xt(e,c,a,n)])):k(l,[xt(e,l,a,n)])},jr=({children:e,...t})=>{let r=Pe();if(r){let o=M(r);if(o==="svg"||o==="head")return new P("title",t,J(e??[]))}return xe("title",e,t,!1)},Fr=({children:e,...t})=>{let r=Pe();return["src","async"].some(o=>!t[o])||r&&M(r)==="head"?ge("script",e,t):xe("script",e,t,!1)},Br=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,xe("style",e,t,!0)):ge("style",e,t),zr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?ge("link",e,t):xe("link",e,t,_e(t)),Ur=({children:e,...t})=>{let r=Pe();return r&&M(r)==="head"?ge("meta",e,t):xe("meta",e,t,!1)},yt=(e,{children:t,...r})=>new P(e,r,J(t??[])),Vr=e=>(typeof e.action=="function"&&(e.action=ae in e.action?e.action[ae]:void 0),yt("form",e)),bt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=ae in t.formAction?t.formAction[ae]:void 0),yt(e,t)),Gr=e=>bt("input",e),Hr=e=>bt("button",e);var Wr=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),ce=e=>Wr.get(e)||e,be=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,i=>`-${i.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var Ee,Pe=()=>Ee,Kr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,qr=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Yr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ke=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")F(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof P?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):Ke(n,t)}}},P=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Ge(k(t[0],t.callbacks)).toString():t[0]:Re(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let i=Ee&&M(Ee)==="svg"?a=>Kr(ce(a)):a=>ce(a);for(let[a,l]of Object.entries(o))if(a=i(a),a!=="children"){if(a==="style"&&typeof l=="object"){let c="";be(l,(u,m)=>{m!=null&&(c+=`${c?";":""}${u}:${m}`)}),t[0]+=' style="',F(c,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${a}="`,F(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${a}="${l}"`;else if(typeof l=="boolean"&&Yr.includes(a))l&&(t[0]+=` ${a}=""`);else if(a==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[k(l.__html)]}else if(l instanceof Promise)t[0]+=` ${a}="`,t.unshift('"',l);else if(typeof l=="function"){if(!a.startsWith("on")&&a!=="ref")throw new Error(`Invalid prop '${a}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${a}="`,F(l.toString(),t),t[0]+='"'}if(qr.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",Ke(n,t),t[0]+=`</${r}>`}},Se=class extends P{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(B.length===0)t.unshift("",n);else{let i=B.map(a=>[a,a.values.at(-1)]);t.unshift("",n.then(a=>(a instanceof P&&(a.localContexts=i),a)))}else n instanceof P?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):F(n,t)}},me=class extends P{toStringToBuffer(t){Ke(this.children,t)}};var St=!1,Ie=(e,t,r)=>{if(!St){for(let o in he)ye[o][H]=he[o];St=!0}return typeof e=="function"?new Se(e,t,r):ye[e]?new Se(ye[e],t,r):e==="svg"||e==="head"?(Ee||=ht(""),new P(e,t,[new Se(Ee,{value:e},r)])):new P(e,t,r)};var Q=({children:e})=>new me("",{children:e},Array.isArray(e)?e:e?[e]:[]);function s(e,t,r){let o;if(!t||!("children"in t))o=Ie(e,t,[]);else{let n=t.children;o=Array.isArray(n)?Ie(e,t,n):Ie(e,t,[n])}return o.key=r,o}var $e="_hp",Xr={Change:"Input",DoubleClick:"DblClick"},Zr={svg:"2000/svg",math:"1998/Math/MathML"},ee=[],Ye=new WeakMap,fe,Dt=()=>fe,U=e=>"t"in e,qe={onClick:["click",!1]},Et=e=>{if(!e.startsWith("on"))return;if(qe[e])return qe[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return qe[e]=[(Xr[r]||r).toLowerCase(),!!o]}},vt=(e,t)=>fe&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Rt=e=>e==null||e===!1?null:e,Jr=(e,t)=>{"value"in t&&(e.value=Rt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Qr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=ce(o);let i=Et(o);if(i){if(r?.[o]!==n&&(r&&e.removeEventListener(i[0],r[o],i[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(i[0],n,i[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let a;typeof n=="function"?a=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,a=()=>n.current=null),Ye.set(e,a)}else if(o==="style"){let a=e.style;typeof n=="string"?a.cssText=n:(a.cssText="",n!=null&&be(n,a.setProperty.bind(a)))}else{if(o==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Rt(n),l==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let a=vt(e,o);n==null||n===!1?e.removeAttribute(a):n===!0?e.setAttribute(a,""):typeof n=="string"||typeof n=="number"?e.setAttribute(a,n):e.setAttribute(a,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=ce(o);let i=Et(o);i?e.removeEventListener(i[0],n,i[1]):o==="ref"?Ye.get(e)?.():e.removeAttribute(vt(e,o))}}},eo=(e,t)=>{t[C][0]=0,ee.push([e,t]);let r=t.tag[H]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{ee.pop()}},kt=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[C][1][Le]?.forEach(i=>n.push(i)),e.vC.forEach(i=>{if(U(i))r.push(i);else if(typeof i.tag=="function"||i.tag===""){i.c=t;let a=r.length;if(kt(i,t,r,o,n),i.s){for(let l=a;l<r.length;l++)r[l].s=!0;i.s=!1}}else r.push(i),i.vR?.length&&(o.push(...i.vR),delete i.vR)})},to=e=>{for(;e&&(e.tag===$e||!e.e);)e=e.tag===$e||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Tt=e=>{U(e)||(e[C]?.[1][Le]?.forEach(t=>t[2]?.()),Ye.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Tt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(ve.delete(e),Ne.delete(e),delete e[C][3],e.a=!0)},Xe=(e,t,r)=>{e.c=t,_t(e,t,r)},$t=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},Ct=Symbol(),_t=(e,t,r)=>{let o=[],n=[],i=[];kt(e,t,o,n,i),n.forEach(Tt);let a=r?void 0:t.childNodes,l,c=null;if(r)l=-1;else if(!a.length)l=0;else{let u=$t(a,to(e.nN));u!==void 0?(c=a[u],l=u):l=$t(a,o.find(m=>m.tag!==$e&&m.e)?.e)??-1,l===-1&&(r=!0)}for(let u=0,m=o.length;u<m;u++,l++){let f=o[u],g;if(f.s&&f.e)g=f.e,f.s=!1;else{let b=r||!f.e;U(f)?(f.e&&f.d&&(f.e.textContent=f.t),f.d=!1,g=f.e||=document.createTextNode(f.t)):(g=f.e||=f.n?document.createElementNS(f.n,f.tag):document.createElement(f.tag),Qr(g,f.props,f.pP),_t(f,g,b),f.tag==="select"&&Jr(g,f.props))}f.tag===$e?l--:r?g.parentNode||t.appendChild(g):a[l]!==g&&a[l-1]!==g&&(a[l+1]===g?t.appendChild(a[l]):t.insertBefore(g,c||a[l]||null))}if(e.pP&&(e.pP=void 0),i.length){let u=[],m=[];i.forEach(([,f,,g,b])=>{f&&u.push(f),g&&m.push(g),b?.()}),u.forEach(f=>f()),m.length&&requestAnimationFrame(()=>{m.forEach(f=>f())})}},ro=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Ne=new WeakMap,Me=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?eo(e,t):J(t.props.children),r[0]?.tag===""&&r[0][ie]&&(n=r[0][ie],e[5].push([e,n,t]));let i=o?[...t.pC]:t.vC?[...t.vC]:void 0,a=[],l;for(let c=0;c<r.length;c++){if(Array.isArray(r[c])){r.splice(c,1,...r[c].flat(1/0)),c--;continue}let u=Ot(r[c]);if(u){typeof u.tag=="function"&&!u.tag[ke]&&(B.length>0&&(u[C][2]=B.map(f=>[f,f.values.at(-1)])),e[5]?.length&&(u[C][3]=e[5].at(-1)));let m;if(i&&i.length){let f=i.findIndex(U(u)?g=>U(g):u.key!==void 0?g=>g.key===u.key&&g.tag===u.tag:g=>g.tag===u.tag);f!==-1&&(m=i[f],i.splice(f,1))}if(m)if(U(u))m.t!==u.t&&(m.t=u.t,m.d=!0),u=m;else{let f=m.pP=m.props;if(m.props=u.props,m.f||=u.f||t.f,typeof u.tag=="function"){let g=m[C][2];m[C][2]=u[C][2]||[],m[C][3]=u[C][3],!m.f&&((m.o||m)===u.o||m.tag[Te]?.(f,m.props))&&ro(g,m[C][2])&&(m.s=!0)}u=m}else if(!U(u)&&fe){let f=M(fe);f&&(u.n=f)}if(!U(u)&&!u.s&&(Me(e,u),delete u.f),a.push(u),l&&!l.s&&!u.s)for(let f=l;f&&!U(f);f=f.vC?.at(-1))f.nN=u;l=u}}t.vR=o?[...t.vC,...i||[]]:i||[],t.vC=a,o&&delete t.pC}catch(i){if(t.f=!0,i===Ct){if(n)return;throw i}let[a,l,c]=t[C]?.[3]||[];if(l){let u=()=>Ce([0,!1,e[2]],c),m=Ne.get(c)||[];m.push(u),Ne.set(c,m);let f=l(i,()=>{let g=Ne.get(c);if(g){let b=g.indexOf(u);if(b!==-1)return g.splice(b,1),u()}});if(f){if(e[0]===1)e[1]=!0;else if(Me(e,c,[f]),(l.length===1||e!==a)&&c.c){Xe(c,c.c,!1);return}throw Ct}}throw i}finally{n&&e[5].pop()}},Ot=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[C]=[0,[]];else{let t=Zr[e.tag];t&&(fe||=ue(""),e.props.children=[{tag:fe,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Pt=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Pt(o,t,r)))},At=(e,t)=>{t[C][2]?.forEach(([r,o])=>{r.values.push(o)});try{Me(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[C][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Xe(t,t.c,!1)},ve=new WeakMap,wt=[],Ce=async(e,t)=>{e[5]||=[];let r=ve.get(t);r&&r[0](void 0);let o,n=new Promise(i=>o=i);if(ve.set(t,[o,()=>{e[2]?e[2](e,t,i=>{At(i,t)}).then(()=>o(t)):(At(e,t),o(t))}]),wt.length)wt.at(-1).add(t);else{await Promise.resolve();let i=ve.get(t);i&&(ve.delete(t),i[1]())}return n},oo=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Me(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();Xe(e,o,!0),Pt(e,o,t),t.replaceChildren(o)},Ze=(e,t)=>{oo(Ot({tag:"",props:{children:e}}),t)};var Je=(e,t,r)=>({tag:$e,props:{children:e},key:r,e:t,p:1});var no=0,Le=1,so=2,io=3;var Qe=new WeakMap,et=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var ao;var It=[];var W=e=>{let t=()=>typeof e=="function"?e():e,r=ee.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[C][1][no]||=[],i=o[C][0]++;return n[i]||=[t(),a=>{let l=ao,c=n[i];if(typeof a=="function"&&(a=a(c[0])),!Object.is(a,c[0]))if(c[0]=a,It.length){let[u,m]=It.at(-1);Promise.all([u===3?o:Ce([u,!1,l],o),m]).then(([f])=>{if(!f||!(u===2||u===3))return;let g=f.vC;requestAnimationFrame(()=>{setTimeout(()=>{g===f.vC&&Ce([u===3?1:0,!1,l],f)})})})}else Ce([0,!1,l],o)}]},tt=(e,t,r)=>{let o=te(a=>{i(l=>e(l,a))},[e]),[n,i]=W(()=>r?r(t):t);return[n,o]},lo=(e,t,r)=>{let o=ee.at(-1);if(!o)return;let[,n]=o,i=n[C][1][Le]||=[],a=n[C][0]++,[l,,c]=i[a]||=[];if(et(l,r)){c&&c();let u=()=>{m[e]=void 0,m[2]=t()},m=[r,void 0,void 0,void 0,void 0];m[e]=u,i[a]=m}},rt=(e,t)=>lo(3,e,t);var te=(e,t)=>{let r=ee.at(-1);if(!r)return e;let[,o]=r,n=o[C][1][so]||=[],i=o[C][0]++,a=n[i];return et(a?.[1],t)?n[i]=[e,t]:e=n[i][0],e};var ot=e=>{let t=Qe.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>Qe.set(e,[r]),r=>Qe.set(e,[void 0,r])),e},nt=(e,t)=>{let r=ee.at(-1);if(!r)return e();let[,o]=r,n=o[C][1][io]||=[],i=o[C][0]++,a=n[i];return et(a?.[1],t)&&(n[i]=[e(),t]),n[i][0]};var Mt=ue({pending:!1,data:null,method:null,action:null}),Nt=new Set,Lt=e=>{Nt.add(e),e.finally(()=>Nt.delete(e))};var st=(e,t)=>nt(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),jt=Object.create(null),Ft=Object.create(null),Ae=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let i=document.head,{onLoad:a,onError:l,precedence:c,blocking:u,...m}=t,f=null,g=!1,b=le[e],E=Oe(e,o),R=v=>v.getAttribute("rel")==="stylesheet"&&v.getAttribute(z)!==null,T;if(E){let v=i.querySelectorAll(e);e:for(let A of v)if(!(e==="link"&&!R(A))){for(let S of b)if(A.getAttribute(S)===t[S]){f=A;break e}}if(!f){let A=b.reduce((S,w)=>t[w]===void 0?S:`${S}-${w}-${t[w]}`,e);g=!Ft[A],f=Ft[A]||=(()=>{let S=document.createElement(e);for(let w of b)t[w]!==void 0&&S.setAttribute(w,t[w]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else T=i.querySelectorAll(e);c=o?c??"":void 0,o&&(m[z]=c);let X=te(v=>{if(E){if(e==="link"&&c!==void 0){let S=!1;for(let w of i.querySelectorAll(e)){let N=w.getAttribute(z);if(N===null){i.insertBefore(v,w);return}if(S&&N!==c){i.insertBefore(v,w);return}N===c&&(S=!0)}i.appendChild(v);return}let A=!1;for(let S of i.querySelectorAll(e)){if(A&&S.getAttribute(z)!==c){i.insertBefore(v,S);return}S.getAttribute(z)===c&&(A=!0)}i.appendChild(v)}else if(e==="link")i.contains(v)||i.appendChild(v);else if(T){let A=!1;for(let S of T)if(S===v){A=!0;break}A||i.insertBefore(v,i.contains(T[0])?T[0]:i.querySelector(e)),T=void 0}},[E,c,e]),se=st(t.ref,v=>{let A=b[0];if(r===2&&(v.innerHTML=""),(g||T)&&X(v),!l&&!a||!A)return;let S=jt[v.getAttribute(A)]||=new Promise((w,N)=>{v.addEventListener("load",w),v.addEventListener("error",N)});a&&(S=S.then(a)),l&&(S=S.catch(l)),S.catch(()=>{})});if(n&&u==="render"){let v=le[e][0];if(v&&t[v]){let A=t[v],S=jt[A]||=new Promise((w,N)=>{X(f),f.addEventListener("load",w),f.addEventListener("error",N)});ot(S)}}let _={tag:e,type:e,props:{...m,ref:se},ref:se};return _.p=r,f&&(_.e=f),Je(_,i)},co=e=>{let t=Dt();return(t&&M(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:Ae("title",e,void 0,!1,!1)},fo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:Ae("script",e,1,!1,!0),po=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,Ae("style",e,2,!0,!0)),uo=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:Ae("link",e,1,_e(e),!0),mo=e=>Ae("meta",e,void 0,!1,!1),Bt=Symbol(),ho=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=W([null,!1]),i=te(async u=>{let m=u.isTrusted?t:u.detail[Bt];if(typeof m!="function")return;u.preventDefault();let f=new FormData(u.target);n([f,!0]);let g=m(f);g instanceof Promise&&(Lt(g),await g),n([null,!0])},[]),a=st(e.ref,u=>(u.addEventListener("submit",i),()=>{u.removeEventListener("submit",i)})),[l,c]=o;return o[1]=!1,{tag:Mt,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...r,ref:a},type:"form",ref:a}},f:c}},zt=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=te(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Bt]:t}}))},[]);r.ref=st(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},go=e=>zt("input",e),xo=e=>zt("button",e);Object.assign(he,{title:co,script:fo,style:po,link:uo,meta:mo,form:ho,input:go,button:xo});var re=":-hono-global",bo=new RegExp(`^${re}{(.*)}$`),je="hono-css",V=Symbol(),D=Symbol(),I=Symbol(),j=Symbol(),Fe=Symbol(),Gt=Symbol(),Ca=Symbol();var Ht=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Wt=e=>e.trim().replace(/\s+/g,"-"),Kt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),So=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),Eo=e=>Kt(e)&&!So.has(e.toLowerCase()),qt=e=>{console.warn(`Invalid slug: ${e}`)},vo=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),$o=new RegExp(["("+vo+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),Co=e=>e.replace($o,(t,r,o,n,i)=>r||o||n||i||""),Yt=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",i="";for(let a=0,l=e.length;a<l;a++){i+=e[a];let c=t[a];if(!(typeof c=="boolean"||c===null||c===void 0)){Array.isArray(c)||(c=[c]);for(let u=0,m=c.length;u<m;u++){let f=c[u];if(!(typeof f=="boolean"||f===null||f===void 0))if(typeof f=="string")/([\\"'\/])/.test(f)?i+=f.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):i+=f;else if(typeof f=="number")i+=f;else if(f[Gt])i+=f[Gt];else if(f[D].startsWith("@keyframes "))r.push(f),i+=` ${f[D].substring(11)} `;else{if(e[a+1]?.match(/^\s*{/))r.push(f),f=`.${f[D]}`;else{r.push(...f[j]),o.push(...f[Fe]),f=f[I];let g=f.length;if(g>0){let b=f[g-1];b!==";"&&b!=="}"&&(f+=";")}}i+=`${f||""}`}}}}return[n,Co(i),r,o]},de=(e,t,r,o)=>{let[n,i,a,l]=Yt(e,t),c=bo.exec(i);c&&(i=c[1]);let u=Ht(n+i),m;if(r){let b=r(u,Wt(n),i);b&&(Kt(b)?m=b:(o||qt)(b))}let f=(c?re:"")+(m||u),g=(c?a.map(b=>b[D]):[f,...l]).join(" ");return{[V]:f,[D]:g,[I]:i,[j]:a,[Fe]:l}},Be=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[V]:"",[D]:"",[I]:"",[j]:[],[Fe]:[o]})}return e},ze=(e,t,r,o)=>{let[n,i]=Yt(e,t),a=Ht(n+i),l;if(r){let c=r(a,Wt(n),i);c&&(Eo(c)?l=c:(o||qt)(c))}return{[V]:"",[D]:`@keyframes ${l||a}`,[I]:i,[j]:[],[Fe]:[]}},Ao=0,Ue=(e,t,r,o)=>{e||(e=[`/* h-v-t ${Ao++} */`]);let n=Array.isArray(e)?de(e,t,r,o):e,i=n[D],a=de(["view-transition-name:",""],[i],r,o);return n[D]=re+n[D],n[I]=n[I].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,i),a[D]=a[V]=i,a[j]=[...n[j],n],a};var Do=e=>{let t=[],r=0,o=0;for(let n=0,i=e.length;n<i;n++){let a=e[n];if(a==="'"||a==='"'){let l=a;for(n++;n<i;n++){if(e[n]==="\\"){n++;continue}if(e[n]===l)break}continue}if(a==="{"){o++;continue}if(a==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},it=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(a,l)=>{let[c,u]=r();if(!c||!u){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(a,l)});return}u.has(a)||(u.add(a),(a.startsWith(re)?Do(l):[`${a[0]==="@"?"":"."}${a}{${l}}`]).forEach(m=>{c.insertRule(m,c.cssRules.length)}))};return[{toString(){let a=this[V];return o(a,this[I]),this[j].forEach(({[D]:l,[I]:c})=>{o(l,c)}),this[D]}},({children:a,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:a&&(Array.isArray(a)?a:[a]).map(c=>c[I])}})]},Ro=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),i=m=>(m.toString=o.toString,m),a=(m,...f)=>i(de(m,f,t,r));return{css:a,cx:(...m)=>(m=Be(m),a(Array(m.length).fill(""),...m)),keyframes:(m,...f)=>ze(m,f,t,r),viewTransition:(m,...f)=>i(Ue(m,f,t,r)),Style:n}},we=Ro({id:je}),Da=we.css,Ra=we.cx,ka=we.keyframes,Ta=we.viewTransition,_a=we.Style;var ko=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=it({id:e}),i=new WeakMap,a=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),c=E=>{let R=({buffer:_,context:v})=>{let[A,S]=i.get(v),w=Object.keys(A);if(!w.length)return;let N="";if(w.forEach(Z=>{S[Z]=!0,N+=Z.startsWith(re)?A[Z]:`${Z[0]==="@"?"":"."}${Z}{${A[Z]}}`}),i.set(v,[{},S]),_&&l.test(_[0])){_[0]=_[0].replace(l,(Z,Or,Pr)=>`${Or}${N}${Pr}`);return}let ut=a.get(v),mt=`<script${ut?` nonce="${ut}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(N)}<\/script>`;if(_){_[0]=`${mt}${_[0]}`;return}return Promise.resolve(mt)},T=({context:_})=>{i.has(_)||i.set(_,[{},{}]);let[v,A]=i.get(_),S=!0;if(A[E[V]]||(S=!1,v[E[V]]=E[I]),E[j].forEach(({[D]:w,[I]:N})=>{A[w]||(S=!1,v[w]=N)}),!S)return Promise.resolve(k("",[R]))},X=new String(E[D]);Object.assign(X,E),X.isEscaped=!0,X.callbacks=[T];let se=Promise.resolve(X);return Object.assign(se,E),se.toString=o.toString,se},u=(E,...R)=>c(de(E,R,t,r)),m=(...E)=>(E=Be(E),u(Array(E.length).fill(""),...E)),f=(E,...R)=>ze(E,R,t,r),g=(E,...R)=>c(Ue(E,R,t,r)),b=({children:E,nonce:R}={})=>k(`<style id="${e}"${R?` nonce="${R}"`:""}>${E?E[I]:""}</style>`,[({context:T})=>{a.set(T,R)}]);return b[H]=n,{css:u,cx:m,keyframes:f,viewTransition:g,Style:b}},De=ko({id:je}),d=De.css,K=De.cx,Xt=De.keyframes,ja=De.viewTransition,Zt=De.Style;var p={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.5)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},Ve=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},x={satoshi:"'Satoshi', sans-serif",playfair:"'Playfair Display', serif",erode:"'Erode', serif"},$={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},h={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Ua={button:d`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:d`box-shadow: -8px 0 40px ${Ve(p.textPrimary,.3)};`,fab:d`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:d`box-shadow: 0 24px 80px ${p.inputLine};`,modal:d`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},O={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"},at={mobile:600,tablet:1200};function Jt(e,t){switch(e){case 0:return To(t);case 1:return _o(t);case 2:return Oo(t);case 3:return Po(t);case 4:return Io();case 5:return No();case 6:return Mo(t);default:return new Map}}function To(e){let t=new Map;e.fields.firstName.trim()||t.set("firstName","Nome obrigat\xF3rio"),e.fields.lastName.trim()||t.set("lastName","Sobrenome obrigat\xF3rio"),e.fields.motherName.trim()||t.set("motherName","Nome da m\xE3e obrigat\xF3rio"),e.fields.nationality.trim()||t.set("nationality","Nacionalidade obrigat\xF3ria"),(e.fields.sex||e.fields.gender).trim()||t.set("gender","Sexo obrigat\xF3rio");let o=e.fields.birthDate.trim();if(o){let n=o.replace(/\D/g,"");if(n.length!==8)t.set("birthDate","Data deve ter 8 d\xEDgitos (DD/MM/AAAA)");else{let i=n.slice(0,2),a=n.slice(2,4),l=n.slice(4,8),c=new Date(`${l}-${a}-${i}T00:00:00`);isNaN(c.getTime())||c.getDate()!==Number(i)?t.set("birthDate","Data inv\xE1lida"):c>new Date&&t.set("birthDate","Data n\xE3o pode ser futura")}}return t}function _o(e){let t=new Map,r=e.documents.cpf.replace(/\D/g,"");if(r&&r.length!==11&&t.set("cpf","CPF deve ter 11 d\xEDgitos"),!e.documents.birthDate.trim())t.set("birthDate","Data de nascimento obrigat\xF3ria");else{let a=e.documents.birthDate.replace(/\D/g,"");if(a.length!==8)t.set("birthDate","Data deve ter 8 d\xEDgitos (DD/MM/AAAA)");else{let l=a.slice(0,2),c=a.slice(2,4),u=a.slice(4,8),m=new Date(`${u}-${c}-${l}T00:00:00`);isNaN(m.getTime())||m.getDate()!==Number(l)?t.set("birthDate","Data inv\xE1lida"):m>new Date&&t.set("birthDate","Data n\xE3o pode ser futura")}}let o=[e.documents.rgNumber,e.documents.rgUf,e.documents.rgAgency,e.documents.rgDate],n=o.filter(a=>a.trim().length>0);n.length>0&&n.length<o.length&&(e.documents.rgNumber.trim()||t.set("rgNumber","N\xFAmero do RG obrigat\xF3rio"),e.documents.rgUf.trim()||t.set("rgUf","UF do RG obrigat\xF3ria"),e.documents.rgAgency.trim()||t.set("rgAgency","\xD3rg\xE3o emissor obrigat\xF3rio"),e.documents.rgDate.trim()||t.set("rgDate","Data de emiss\xE3o obrigat\xF3ria"));let i=n.length===o.length;return!r&&!e.documents.nis.trim()&&!i&&t.set("cpf","Informe ao menos um documento (CPF, NIS ou RG)"),t}function Oo(e){let t=new Map;return e.address.housingSituation.trim()||t.set("housingSituation","Situa\xE7\xE3o de moradia obrigat\xF3ria"),e.address.residenceLocation.trim()||t.set("residenceLocation","Localiza\xE7\xE3o da resid\xEAncia obrigat\xF3ria"),e.address.state.trim()||t.set("state","Estado obrigat\xF3rio"),e.address.city.trim()||t.set("city","Cidade obrigat\xF3ria"),t}function Po(e){let t=new Map;if(e.diagnoses.length===0)return t.set("diagnoses","Ao menos 1 diagn\xF3stico \xE9 obrigat\xF3rio"),t;for(let r=0;r<e.diagnoses.length;r++){let o=e.diagnoses[r];o.code.trim()||t.set(`diagnosis_${r}_code`,"C\xF3digo CID obrigat\xF3rio"),o.date.trim()||t.set(`diagnosis_${r}_date`,"Data do diagn\xF3stico obrigat\xF3ria"),o.description.trim()||t.set(`diagnosis_${r}_description`,"Descri\xE7\xE3o obrigat\xF3ria")}return t}function Io(){return new Map}function No(){return new Map}function Mo(e){let t=new Map;return e.intake.ingressType.trim()||t.set("ingressType","Tipo de ingresso obrigat\xF3rio"),e.intake.serviceReason.trim()||t.set("serviceReason","Motivo do atendimento obrigat\xF3rio"),t}var Lo=7;function jo(e,t,r,o){switch(t){case"fields":return{...e,fields:{...e.fields,[r]:o}};case"documents":return{...e,documents:{...e.documents,[r]:o}};case"address":return{...e,address:{...e.address,[r]:o}};case"specificity":return{...e,specificity:{...e.specificity,[r]:o}};case"intake":return{...e,intake:{...e.intake,[r]:o}};default:return e}}function Qt(e,t){switch(t.type){case"UPDATE_FIELD":return jo(e,t.section,t.field,t.value);case"NEXT_STEP":{let r=Jt(e.currentStep,e);return r.size>0?{...e,errors:r,showErrors:!0}:e.currentStep>=Lo-1?e:{...e,currentStep:e.currentStep+1,showErrors:!1,errors:new Map}}case"PREV_STEP":return{...e,currentStep:Math.max(0,e.currentStep-1),showErrors:!1,errors:new Map};case"ADD_DIAGNOSIS":{let r={code:"",date:"",description:""};return{...e,diagnoses:[...e.diagnoses,r]}}case"REMOVE_DIAGNOSIS":return{...e,diagnoses:e.diagnoses.filter((r,o)=>o!==t.index)};case"UPDATE_DIAGNOSIS_FIELD":{let r=e.diagnoses.map((o,n)=>n===t.index?{...o,[t.field]:t.value}:o);return{...e,diagnoses:r}}case"APPLY_QUICK_CID":{let r=e.diagnoses.map((o,n)=>n===t.index?{...o,code:t.code,description:t.description}:o);return{...e,diagnoses:r}}case"ADD_FAMILY_MEMBER":return{...e,familyMembers:[...e.familyMembers,t.member]};case"UPDATE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.map((r,o)=>o===t.index?t.member:r)};case"REMOVE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.filter((r,o)=>o!==t.index)};case"TOGGLE_ADDRESS_FLAG":return{...e,address:{...e.address,[t.field]:!e.address[t.field]}};case"TOGGLE_PROGRAM":{let r=e.intake.selectedPrograms,n=r.includes(t.programId)?r.filter(i=>i!==t.programId):[...r,t.programId];return{...e,intake:{...e.intake,selectedPrograms:n}}}case"SAVE_START":return{...e,saving:!0,saveResult:null};case"SAVE_SUCCESS":return{...e,saving:!1,saveResult:{ok:!0,message:t.message}};case"SAVE_FAILURE":return{...e,saving:!1,saveResult:{ok:!1,message:t.message}}}}var er={currentStep:0,showErrors:!1,saving:!1,saveResult:null,fields:{firstName:"",lastName:"",socialName:"",motherName:"",nationality:"",sex:"",phone:"",birthDate:"",gender:"",phoneNumber:""},documents:{cpf:"",nis:"",cnsNumber:"",rgNumber:"",rgUf:"",rgAgency:"",rgDate:"",birthDate:""},address:{housingSituation:"",residenceLocation:"",isShelter:!1,isHomeless:!1,cep:"",street:"",number:"",complement:"",neighborhood:"",state:"",city:""},diagnoses:[],familyMembers:[],specificity:{selectedIdentity:"",description:""},intake:{ingressType:"",originName:"",originContact:"",serviceReason:"",selectedPrograms:[],observation:""},errors:new Map};var lt="registration-wizard-draft";function tr(e){let t={...e,errors:Array.from(e.errors.entries())};localStorage.setItem(lt,JSON.stringify(t))}function rr(){let e=localStorage.getItem(lt);if(!e)return null;let t=JSON.parse(e),r=Array.isArray(t.errors)?new Map(t.errors):new Map;return{...t,errors:r}}function or(){localStorage.removeItem(lt)}var ct={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},nr=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Fo=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},sr=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:ct});return nr(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},ir=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:ct});return Fo(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},ar=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:ct,body:JSON.stringify(t)});return nr(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var lr={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),ir(`/api/v1/patients?${o.toString()}`)},getById:e=>sr(`/api/v1/patients/${e}`),create:e=>ar("/api/v1/patients",e)};var Bo=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${p.textMuted};
`,zo=d`
  text-decoration: none;
  color: ${p.textMuted};
  font-weight: ${$.medium};
  &:hover { color: ${p.textPrimary}; }
`,Uo=d`
  color: ${p.textPrimary};
  font-weight: ${$.semibold};
`,cr=()=>s("nav",{class:Bo,children:[s("a",{href:"/social-care",class:zo,children:"Familias"}),s("span",{children:"/"}),s("span",{class:Uo,children:"Cadastro"})]});var Vo=d`
  font-family: ${x.satoshi};
  font-size: 38px;
  font-weight: ${$.bold};
  color: ${p.textPrimary};
  margin: 0;
  line-height: 1.2;
`,fr=()=>s("h1",{class:Vo,children:"Cadastrar Pessoa de Referencia"});var Go=d`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  @media (max-width: ${at.mobile-1}px) {
    display: none;
  }
`,Ho=d`
  display: none;
  @media (max-width: ${at.mobile-1}px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-family: ${x.satoshi};
    font-size: 14px;
    font-weight: ${$.medium};
    color: ${p.textPrimary};
  }
`,Wo=d`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: ${h[1]};
`,ft=d`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${x.satoshi};
  font-size: 14px;
  font-weight: ${$.bold};
  transition: background 0.2s, border-color 0.2s;
`,Ko=d`
  ${ft}
  background: transparent;
  border: 1.5px solid ${p.inputLine};
  color: ${p.textMuted};
`,qo=d`
  ${ft}
  background: ${p.textPrimary};
  border: 1.5px solid ${p.textPrimary};
  color: ${p.background};
`,Yo=d`
  ${ft}
  background: ${p.primary};
  border: 1.5px solid ${p.primary};
  color: white;
`,dr=d`
  flex: 1;
  height: 2px;
  min-width: 24px;
  margin: 0 ${h[2]};
`,Xo=d`
  ${dr}
  background: ${p.primary};
`,Zo=d`
  ${dr}
  background: ${p.inputLine};
`,Jo=d`
  font-family: ${x.satoshi};
  font-size: 11px;
  font-weight: ${$.medium};
  color: ${p.textMuted};
  margin-top: ${h[1]};
  text-align: center;
  white-space: nowrap;
`,pr=({current:e,total:t,labels:r})=>{let o=Array.from({length:t},(i,a)=>a),n=r&&r[e]?`Etapa ${e+1} de ${t} \u2014 ${r[e]}`:`Etapa ${e+1} de ${t}`;return s(Q,{children:[s("div",{class:Ho,children:n}),s("div",{class:Go,children:o.map(i=>{let a=i===e,l=i<e;return s(Q,{children:[s("div",{class:Wo,children:[s("div",{class:l?Yo:a?qo:Ko,children:l?s("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white","stroke-width":"3",children:s("path",{d:"M5 13l4 4L19 7"})}):i+1}),r&&r[i]&&s("span",{class:Jo,children:r[i]})]}),i<t-1&&s("div",{class:l?Xo:Zo})]})})})]})};var Qo=["Dados Pessoais","Documentos","Endereco","Diagnosticos","Familia","Especificidades","Ingresso"],ur=({currentStep:e})=>s(pr,{current:e,total:7,labels:Qo});var en=d`
  border-radius: ${O.pill};
  font-family: ${x.satoshi};
  font-size: 16px;
  padding: 12px 24px;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, background 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`,tn=d`
  background: ${p.primary};
  color: white;
`,rn=d`
  background: transparent;
  color: ${p.textPrimary};
  border: 1.5px solid ${p.textPrimary};
`,on=d`
  background: transparent;
  color: ${p.danger};
  border: none;
`,nn={primary:tn,secondary:rn,danger:on},G=({variant:e,disabled:t,onClick:r,children:o})=>s("button",{class:K(en,nn[e]),disabled:t,onClick:r,type:"button",children:o});var sn=d`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${h[5]};
`,mr=({currentStep:e,totalSteps:t,saving:r,onBack:o,onNext:n})=>{let i=e===0,a=e===t-1;return s("div",{class:sn,children:[i?s("div",{}):s(G,{variant:"secondary",onClick:o,disabled:r,children:"Voltar"}),s(G,{variant:"primary",onClick:n,disabled:r,children:r?"Salvando...":a?"Salvar":"Proximo"})]})};var an=d`
  display: flex;
  flex-direction: column;
  gap: ${h[1]};
  width: 100%;
`,ln=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${$.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${p.textMuted};
`,cn=d`
  border: none;
  border-bottom: 1px solid ${p.inputLine};
  padding: 8px 0;
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${p.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${p.textPrimary}; }
  &::placeholder {
    color: ${p.textMuted};
    font-family: ${x.satoshi};
    font-weight: ${$.regular};
  }
`,fn=d`
  border-bottom: 2px solid ${p.danger};
  &:focus { border-bottom: 2px solid ${p.danger}; }
`,dn=d`
  font-family: ${x.satoshi};
  font-size: 12px;
  color: ${p.danger};
  margin-top: 4px;
`,pn=d`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,y=({label:e,value:t,onChange:r,error:o,type:n,disabled:i,required:a,placeholder:l})=>s("div",{class:K(an,i?pn:void 0),children:[s("label",{class:ln,children:[e,a&&" *"]}),s("input",{class:K(cn,o?fn:void 0),type:n??"text",value:t,onInput:c=>r(c.target.value),disabled:i,"aria-required":a,placeholder:l}),o&&s("span",{class:dn,children:o})]});var un=d`
  display: flex;
  flex-direction: column;
  gap: ${h[1]};
  width: 100%;
`,mn=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${$.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${p.textMuted};
`,hn=d`
  border: none;
  border-bottom: 1px solid ${p.inputLine};
  padding: 8px 0;
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${p.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${p.textPrimary}; }
`,gn=d`
  border-bottom: 2px solid ${p.danger};
  &:focus { border-bottom: 2px solid ${p.danger}; }
`,xn=d`
  font-family: ${x.satoshi};
  font-size: 12px;
  color: ${p.danger};
  margin-top: 4px;
`,yn=d`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,oe=({label:e,value:t,options:r,onChange:o,error:n,required:i,disabled:a})=>s("div",{class:K(un,a?yn:void 0),children:[s("label",{class:mn,children:[e,i&&" *"]}),s("select",{class:K(hn,n?gn:void 0),value:t,onChange:l=>o(l.target.value),disabled:a,"aria-required":i,children:r.map(l=>s("option",{value:l.value,children:l.label}))}),n&&s("span",{class:xn,children:n})]});var bn=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,q=d`
  min-width: 280px;
  flex: 1;
`,Sn=d`
  display: flex;
  flex-direction: column;
  gap: ${h[1]};
`,En=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${$.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${p.textMuted};
`,vn=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${p.textPrimary};
  cursor: pointer;
`,$n=d`
  font-family: ${x.satoshi};
  font-size: 11px;
  color: ${p.danger};
  margin-top: ${h[1]};
`,Cn=[{value:"",label:"Selecione..."},{value:"Brasileira",label:"Brasileira"},{value:"Naturalizada",label:"Naturalizada"},{value:"Estrangeira",label:"Estrangeira"}],An=[{value:"MASCULINO",label:"Masculino"},{value:"FEMININO",label:"Feminino"},{value:"OUTRO",label:"Outro"}],wn=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},Dn=e=>e.replace(/\D/g,""),hr=({fields:e,errors:t,onUpdate:r})=>s("div",{class:bn,children:[s("div",{class:q,children:s(y,{label:"Nome",value:e.firstName,onChange:o=>r("firstName",o),error:t.get("firstName"),required:!0})}),s("div",{class:q,children:s(y,{label:"Sobrenome",value:e.lastName,onChange:o=>r("lastName",o),error:t.get("lastName"),required:!0})}),s("div",{class:q,children:s(y,{label:"Nome social",value:e.socialName,onChange:o=>r("socialName",o)})}),s("div",{class:q,children:s(y,{label:"Nome da mae",value:e.motherName,onChange:o=>r("motherName",o),error:t.get("motherName"),required:!0})}),s("div",{class:q,children:s(y,{label:"Data de nascimento",value:wn(e.birthDate),onChange:o=>r("birthDate",Dn(o)),error:t.get("birthDate"),placeholder:"DD/MM/AAAA",required:!0})}),s("div",{class:q,children:s(oe,{label:"Nacionalidade",value:e.nationality,options:Cn,onChange:o=>r("nationality",o),error:t.get("nationality"),required:!0})}),s("div",{class:q,children:s("div",{class:Sn,children:[s("span",{class:En,children:"Sexo *"}),An.map(o=>s("label",{class:vn,children:[s("input",{type:"radio",name:"sex",value:o.value,checked:e.sex===o.value,onChange:()=>r("sex",o.value)}),o.label]})),t.get("sex")&&s("span",{class:$n,children:t.get("sex")})]})}),s("div",{class:q,children:s(y,{label:"Telefone",value:e.phone,onChange:o=>r("phone",o)})})]});var Rn=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,ne=d`
  min-width: 280px;
  flex: 1;
`,kn=d`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: rgba(38, 29, 17, 0.6);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`,Tn=e=>{let t=e.replace(/\D/g,"").slice(0,11);return t.length<=3?t:t.length<=6?`${t.slice(0,3)}.${t.slice(3)}`:t.length<=9?`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6)}`:`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6,9)}-${t.slice(9)}`},_n=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},gr=e=>e.replace(/\D/g,""),xr=({documents:e,errors:t,onUpdate:r})=>s("div",{class:Rn,children:[s("div",{class:ne,children:s(y,{label:"CPF",value:Tn(e.cpf),onChange:o=>r("cpf",gr(o)),error:t.get("cpf")})}),s("div",{class:ne,children:s(y,{label:"NIS",value:e.nis,onChange:o=>r("nis",o),error:t.get("nis")})}),s("div",{class:ne,children:s(y,{label:"CNS",value:e.cnsNumber,onChange:o=>r("cnsNumber",o),error:t.get("cnsNumber")})}),s("span",{class:kn,children:"RG (preencha todos ou nenhum)"}),s("div",{class:ne,children:s(y,{label:"Numero do RG",value:e.rgNumber,onChange:o=>r("rgNumber",o),error:t.get("rgNumber")})}),s("div",{class:ne,children:s(y,{label:"UF",value:e.rgUf,onChange:o=>r("rgUf",o),error:t.get("rgUf")})}),s("div",{class:ne,children:s(y,{label:"Orgao emissor",value:e.rgAgency,onChange:o=>r("rgAgency",o),error:t.get("rgAgency")})}),s("div",{class:ne,children:s(y,{label:"Data de emissao",value:_n(e.rgDate),onChange:o=>r("rgDate",gr(o)),error:t.get("rgDate")})})]});var On=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 14px;
  font-weight: ${$.regular};
  color: ${p.textPrimary};
  cursor: pointer;
  padding: 8px 0;
  user-select: none;
`,Pn=d`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`,In=d`
  width: 18px;
  height: 18px;
  border: 1.5px solid ${p.inputLine};
  border-radius: ${O.checkbox};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
`,Nn=d`
  width: 18px;
  height: 18px;
  border: 1.5px solid ${p.primary};
  border-radius: ${O.checkbox};
  background: ${p.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
`,Y=({label:e,checked:t,onChange:r})=>s("label",{class:On,children:[s("input",{type:"checkbox",class:Pn,checked:t,onChange:r}),s("span",{class:t?Nn:In,children:t&&s("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"white","stroke-width":"3",children:s("path",{d:"M5 13l4 4L19 7"})})}),e]});var Mn=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,L=d`
  min-width: 280px;
  flex: 1;
`,Ln=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${$.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${p.textMuted};
`,jn=d`
  display: flex;
  gap: ${h[4]};
  padding: 8px 0;
`,yr=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${p.textPrimary};
  cursor: pointer;
`,Fn=d`
  font-family: ${x.satoshi};
  font-size: 12px;
  color: ${p.danger};
  margin-top: 4px;
`,Bn=[{value:"",label:"Selecione..."},{value:"PROPRIA",label:"Propria"},{value:"ALUGADA",label:"Alugada"},{value:"CEDIDA",label:"Cedida"},{value:"SITUACAO_DE_RUA",label:"Situacao de rua"},{value:"OUTROS",label:"Outros"}],zn=[{value:"",label:"Selecione..."},...["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(e=>({value:e,label:e}))],Un=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=5?t:`${t.slice(0,5)}-${t.slice(5)}`},br=({address:e,errors:t,onUpdate:r,onToggleFlag:o})=>s("div",{class:Mn,children:[s("div",{class:L,children:s(oe,{label:"Situacao de moradia",value:e.housingSituation,options:Bn,onChange:n=>r("housingSituation",n),error:t.get("housingSituation"),required:!0})}),s("div",{class:L,children:s("div",{children:[s("label",{class:Ln,children:"Localizacao *"}),s("div",{class:jn,children:[s("label",{class:yr,children:[s("input",{type:"radio",name:"residenceLocation",value:"URBANO",checked:e.residenceLocation==="URBANO",onChange:()=>r("residenceLocation","URBANO")}),"Urbano"]}),s("label",{class:yr,children:[s("input",{type:"radio",name:"residenceLocation",value:"RURAL",checked:e.residenceLocation==="RURAL",onChange:()=>r("residenceLocation","RURAL")}),"Rural"]})]}),t.get("residenceLocation")&&s("span",{class:Fn,children:t.get("residenceLocation")})]})}),s("div",{class:L,children:s(y,{label:"CEP",value:Un(e.cep),onChange:n=>r("cep",n.replace(/\D/g,"")),error:t.get("cep")})}),s("div",{class:L,children:s(y,{label:"Rua",value:e.street,onChange:n=>r("street",n),error:t.get("street"),disabled:e.isHomeless})}),s("div",{class:L,children:s(y,{label:"Numero",value:e.number,onChange:n=>r("number",n),error:t.get("number"),disabled:e.isHomeless})}),s("div",{class:L,children:s(y,{label:"Complemento",value:e.complement,onChange:n=>r("complement",n),disabled:e.isHomeless})}),s("div",{class:L,children:s(y,{label:"Bairro",value:e.neighborhood,onChange:n=>r("neighborhood",n),error:t.get("neighborhood"),disabled:e.isHomeless})}),s("div",{class:L,children:s(oe,{label:"Estado",value:e.state,options:zn,onChange:n=>r("state",n),error:t.get("state"),required:!0})}),s("div",{class:L,children:s(y,{label:"Cidade",value:e.city,onChange:n=>r("city",n),error:t.get("city"),required:!0})}),s("div",{class:L,children:s(Y,{label:"Unidade de acolhimento / abrigo",checked:e.isShelter,onChange:()=>o("isShelter")})}),s("div",{class:L,children:s(Y,{label:"Pessoa em situacao de rua",checked:e.isHomeless,onChange:()=>o("isHomeless")})})]});var Vn=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},Gn=e=>e.replace(/\D/g,""),Hn=d`
  display: flex;
  flex-direction: column;
  gap: ${h[5]};
`,Wn=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
  padding: ${h[4]};
  border: 1px solid ${p.inputLine};
  border-radius: ${O.card};
  position: relative;
`,dt=d`
  min-width: 280px;
  flex: 1;
`,Kn=d`
  position: absolute;
  top: ${h[2]};
  right: ${h[2]};
  border: none;
  background: transparent;
  color: ${p.danger};
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: ${h[1]};
  &:hover { opacity: 0.7; }
`,qn=d`
  display: flex;
  gap: ${h[2]};
  flex-wrap: wrap;
  margin-top: ${h[1]};
`,Yn=d`
  font-family: ${x.satoshi};
  font-size: 12px;
  font-weight: ${$.medium};
  padding: 4px 10px;
  border-radius: ${O.pill};
  border: 1px solid ${p.inputLine};
  background: transparent;
  color: ${p.textPrimary};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${p.surface}; }
`,Xn=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${p.textMuted};
  text-align: center;
  padding: ${h[5]} 0;
`,Zn=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  color: ${p.danger};
`,Jn=[{code:"G80",description:"Paralisia cerebral"},{code:"Q90",description:"Sindrome de Down"},{code:"F84.0",description:"Autismo infantil"},{code:"E70",description:"Fenilcetonuria"},{code:"G71.0",description:"Distrofia muscular"}],Sr=({diagnoses:e,errors:t,onUpdateEntry:r,onAddDiagnosis:o,onRemoveDiagnosis:n,onApplyQuickCid:i})=>s("div",{class:Hn,children:[t.get("diagnoses")&&s("span",{class:Zn,children:t.get("diagnoses")}),e.length===0&&s("p",{class:Xn,children:"Nenhum diagnostico adicionado. Clique abaixo para adicionar."}),e.map((a,l)=>s("div",{class:Wn,children:[s("button",{class:Kn,type:"button",onClick:()=>n(l),"aria-label":"Remover diagnostico",children:"\xD7"}),s("div",{class:dt,children:[s(y,{label:"Codigo CID",value:a.code,onChange:c=>r(l,"code",c),error:t.get(`diagnosis_${l}_code`),required:!0}),s("div",{class:qn,children:Jn.map(c=>s("button",{class:Yn,type:"button",onClick:()=>i(l,c.code,c.description),children:c.code}))})]}),s("div",{class:dt,children:s(y,{label:"Data do diagnostico",value:Vn(a.date),onChange:c=>r(l,"date",Gn(c)),error:t.get(`diagnosis_${l}_date`),placeholder:"DD/MM/AAAA",required:!0})}),s("div",{class:dt,children:s(y,{label:"Descricao",value:a.description,onChange:c=>r(l,"description",c),error:t.get(`diagnosis_${l}_description`),required:!0})})]})),s(G,{variant:"secondary",onClick:o,children:"Adicionar diagnostico"})]});var Qn=d`
  display: flex;
  flex-direction: column;
  gap: ${h[4]};
`,es=d`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${h[3]} ${h[4]};
  border: 1px solid ${p.inputLine};
  border-radius: ${O.card};
  font-family: ${x.satoshi};
`,ts=d`
  display: flex;
  flex-direction: column;
  gap: 2px;
`,rs=d`
  font-size: 16px;
  font-weight: ${$.semibold};
  color: ${p.textPrimary};
`,os=d`
  font-size: 13px;
  color: ${p.textMuted};
`,ns=d`
  border: none;
  background: transparent;
  color: ${p.danger};
  font-size: 18px;
  cursor: pointer;
  padding: ${h[1]};
  &:hover { opacity: 0.7; }
`,ss=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[4]};
  padding: ${h[4]};
  border: 1px solid ${p.primary};
  border-radius: ${O.card};
`,pe=d`
  min-width: 200px;
  flex: 1;
`,is=d`
  width: 100%;
  display: flex;
  gap: ${h[3]};
  justify-content: flex-end;
`,as=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${p.textMuted};
  text-align: center;
  padding: ${h[4]} 0;
`,Er={name:"",birthDate:"",gender:"",sex:"",relationship:"",livesWithPatient:!0,isDisabled:!1},vr=({familyMembers:e,onAddMember:t,onRemoveMember:r})=>{let[o,n]=W(!1),[i,a]=W(Er),l=()=>{i.name.trim()&&i.relationship.trim()&&(t(i),a(Er),n(!1))};return s("div",{class:Qn,children:[e.length===0&&!o&&s("p",{class:as,children:"Nenhum membro familiar adicionado. Este passo e opcional."}),e.map((c,u)=>s("div",{class:es,children:[s("div",{class:ts,children:[s("span",{class:rs,children:c.name}),s("span",{class:os,children:[c.relationship," | ",c.sex||c.gender," | ",c.livesWithPatient?"Reside":"Nao reside"]})]}),s("button",{class:ns,type:"button",onClick:()=>r(u),"aria-label":"Remover membro",children:"\xD7"})]})),o&&s("div",{class:ss,children:[s("div",{class:pe,children:s(y,{label:"Nome",value:i.name,onChange:c=>a({...i,name:c})})}),s("div",{class:pe,children:s(y,{label:"Data de nascimento",value:i.birthDate,onChange:c=>a({...i,birthDate:c})})}),s("div",{class:pe,children:s(y,{label:"Sexo",value:i.sex||"",onChange:c=>a({...i,sex:c})})}),s("div",{class:pe,children:s(y,{label:"Parentesco",value:i.relationship,onChange:c=>a({...i,relationship:c})})}),s("div",{class:pe,children:s(Y,{label:"Reside com o paciente",checked:i.livesWithPatient,onChange:()=>a({...i,livesWithPatient:!i.livesWithPatient})})}),s("div",{class:pe,children:s(Y,{label:"Pessoa com deficiencia",checked:i.isDisabled,onChange:()=>a({...i,isDisabled:!i.isDisabled})})}),s("div",{class:is,children:[s(G,{variant:"danger",onClick:()=>n(!1),children:"Cancelar"}),s(G,{variant:"primary",onClick:l,children:"Confirmar"})]})]}),!o&&s(G,{variant:"secondary",onClick:()=>n(!0),children:"Adicionar membro"})]})};var ls=d`
  display: flex;
  flex-direction: column;
  gap: ${h[4]};
`,cs=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${p.textMuted};
`,fs=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[3]};
`,$r=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 15px;
  color: ${p.textPrimary};
  cursor: pointer;
  padding: ${h[2]} ${h[3]};
  border: 1px solid ${p.inputLine};
  border-radius: 100px;
  transition: border-color 0.15s, background 0.15s;
  &:hover { background: ${p.surface}; }
`,ds=d`
  ${$r}
  border-color: ${p.primary};
  background: rgba(79, 132, 72, 0.06);
`,ps=d`
  max-width: 480px;
`,us=[{value:"INDIGENA",label:"Indigena"},{value:"QUILOMBOLA",label:"Quilombola"},{value:"CIGANO",label:"Cigano(a)"},{value:"RIBEIRINHO",label:"Ribeirinho(a)"},{value:"EXTRATIVISTA",label:"Extrativista"},{value:"OUTRO",label:"Outro"}],Cr=({specificity:e,errors:t,onUpdate:r})=>s("div",{class:ls,children:[s("p",{class:cs,children:"Este passo e opcional. Selecione uma identidade social caso aplicavel."}),s("div",{class:fs,children:us.map(o=>s("label",{class:e.selectedIdentity===o.value?ds:$r,children:[s("input",{type:"radio",name:"selectedIdentity",value:o.value,checked:e.selectedIdentity===o.value,onChange:()=>r("selectedIdentity",o.value),style:"display:none"}),o.label]}))}),e.selectedIdentity&&s("div",{class:ps,children:s(y,{label:"Descricao adicional",value:e.description,onChange:o=>r("description",o),error:t.get("description")})})]});var ms=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,pt=d`
  min-width: 280px;
  flex: 1;
`,hs=d`
  width: 100%;
`,Ar=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${$.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${p.textMuted};
`,gs=d`
  font-family: ${x.satoshi};
  font-size: 12px;
  color: ${p.danger};
  margin-top: 4px;
`,wr=d`
  border: 1px solid ${p.inputLine};
  border-radius: ${O.dropdown};
  padding: ${h[3]};
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${p.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  &:focus { border-color: ${p.textPrimary}; }
`,xs=d`
  ${wr}
  border-color: ${p.danger};
  &:focus { border-color: ${p.danger}; }
`,ys=d`
  display: flex;
  flex-direction: column;
  gap: ${h[2]};
  width: 100%;
`,bs=[{value:"",label:"Selecione..."},{value:"DEMANDA_ESPONTANEA",label:"Demanda espontanea"},{value:"BUSCA_ATIVA",label:"Busca ativa"},{value:"ENCAMINHAMENTO",label:"Encaminhamento"},{value:"REINCIDENCIA",label:"Reincidencia"}],Ss=[{id:"BPC",label:"BPC (Beneficio de Prestacao Continuada)"},{id:"BOLSA_FAMILIA",label:"Bolsa Familia"},{id:"AUXILIO_BRASIL",label:"Auxilio Brasil"},{id:"PETI",label:"PETI"},{id:"OUTROS",label:"Outros programas"}],Dr=({intake:e,errors:t,onUpdate:r,onToggleProgram:o})=>s("div",{class:ms,children:[s("div",{class:pt,children:s(oe,{label:"Tipo de ingresso",value:e.ingressType,options:bs,onChange:n=>r("ingressType",n),error:t.get("ingressType"),required:!0})}),s("div",{class:pt,children:s(y,{label:"Nome da origem",value:e.originName,onChange:n=>r("originName",n)})}),s("div",{class:pt,children:s(y,{label:"Contato da origem",value:e.originContact,onChange:n=>r("originContact",n)})}),s("div",{class:hs,children:[s("label",{class:Ar,children:"Motivo do atendimento *"}),s("textarea",{class:t.get("serviceReason")?xs:wr,value:e.serviceReason,onInput:n=>r("serviceReason",n.target.value)}),t.get("serviceReason")&&s("span",{class:gs,children:t.get("serviceReason")})]}),s("div",{class:ys,children:[s("label",{class:Ar,children:"Programas sociais vinculados"}),Ss.map(n=>s(Y,{label:n.label,checked:e.selectedPrograms.includes(n.id),onChange:()=>o(n.id)}))]})]});var Es=Xt`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,vs=d`
  display: flex;
  align-items: center;
  gap: ${h[3]};
  padding: ${h[3]} ${h[4]};
  background: ${Ve(p.danger,.06)};
  border: 1px solid ${Ve(p.danger,.12)};
  border-radius: ${O.dropdown};
  animation: ${Es} 400ms ease-out;
`,$s=d`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${p.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${x.satoshi};
  font-size: 14px;
  font-weight: ${$.bold};
  flex-shrink: 0;
`,Cs=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${p.danger};
  flex: 1;
`,As=d`
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${p.danger};
  font-size: 18px;
  line-height: 1;
  padding: ${h[1]};
  opacity: 0.7;
  &:hover { opacity: 1; }
`,Rr=({message:e,onDismiss:t})=>s("div",{class:vs,role:"alert",children:[s("div",{class:$s,children:"!"}),s("span",{class:Cs,children:e}),t&&s("button",{class:As,onClick:t,type:"button","aria-label":"Fechar",children:"\xD7"})]});var kr=7,ws=d`
  display: flex;
  flex-direction: column;
  gap: ${h[5]};
  padding: ${h[5]} ${h[6]};
  max-width: 960px;
  margin: 0 auto;
`,Tr=()=>{let[e,t]=tt(Qt,rr()??er);rt(()=>{tr(e)},[e]);let r=async()=>{if(e.currentStep===kr-1){t({type:"SAVE_START"});let a=await lr.create(e);a.ok?(or(),t({type:"SAVE_SUCCESS",message:"Cadastro salvo com sucesso!"})):t({type:"SAVE_FAILURE",message:{UNAUTHORIZED:"Sess\xE3o expirada. Fa\xE7a login novamente.",FORBIDDEN:"Sem permiss\xE3o para cadastrar.",VALIDATION_ERROR:"Dados inv\xE1lidos. Revise os campos.",SERVER_ERROR:"Erro no servidor. Tente novamente.",NETWORK_ERROR:"Sem conex\xE3o. Verifique sua internet.",NOT_FOUND:"Servi\xE7o indispon\xEDvel."}[a.error]??"Erro desconhecido."})}else t({type:"NEXT_STEP"})},o=()=>{t({type:"PREV_STEP"})},n=e.showErrors?e.errors:new Map,i=a=>(l,c)=>{t({type:"UPDATE_FIELD",section:a,field:l,value:c})};return s("div",{class:ws,children:[s(cr,{}),s(fr,{}),s(ur,{currentStep:e.currentStep}),e.saveResult&&!e.saveResult.ok&&s(Rr,{message:e.saveResult.message}),e.currentStep===0&&s(hr,{fields:e.fields,errors:n,onUpdate:i("fields")}),e.currentStep===1&&s(xr,{documents:e.documents,errors:n,onUpdate:i("documents")}),e.currentStep===2&&s(br,{address:e.address,errors:n,onUpdate:i("address"),onToggleFlag:a=>t({type:"TOGGLE_ADDRESS_FLAG",field:a})}),e.currentStep===3&&s(Sr,{diagnoses:e.diagnoses,errors:n,onUpdateEntry:(a,l,c)=>{t({type:"UPDATE_DIAGNOSIS_FIELD",index:a,field:l,value:c})},onAddDiagnosis:()=>t({type:"ADD_DIAGNOSIS"}),onRemoveDiagnosis:a=>t({type:"REMOVE_DIAGNOSIS",index:a}),onApplyQuickCid:(a,l,c)=>t({type:"APPLY_QUICK_CID",index:a,code:l,description:c})}),e.currentStep===4&&s(vr,{familyMembers:e.familyMembers,onAddMember:a=>t({type:"ADD_FAMILY_MEMBER",member:a}),onRemoveMember:a=>t({type:"REMOVE_FAMILY_MEMBER",index:a})}),e.currentStep===5&&s(Cr,{specificity:e.specificity,errors:n,onUpdate:i("specificity")}),e.currentStep===6&&s(Dr,{intake:e.intake,errors:n,onUpdate:i("intake"),onToggleProgram:a=>t({type:"TOGGLE_PROGRAM",programId:a})}),s(mr,{currentStep:e.currentStep,totalSteps:kr,saving:e.saving,onBack:o,onNext:r})]})};var _r=document.getElementById("registration-app");_r&&Ze(s(Q,{children:[s(Zt,{}),s(Tr,{})]}),_r);
