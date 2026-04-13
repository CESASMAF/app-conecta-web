var $r=Object.defineProperty;var Cr=(e,t)=>{for(var r in t)$r(e,r,{get:t[r],enumerable:!0})};var Ar={Stringify:1,BeforeStream:2,Stream:3},j=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},vr=/[&<>'"]/,Ae=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let s=o[n];typeof s=="object"&&t.push(...s.callbacks||[]);let a=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??a)r+=s;else{let c=[r];H(s,c),r=c[0]}}return j(r,t)},H=(e,t)=>{let r=e.search(vr);if(r===-1){t[0]+=e;return}let o,n,s=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,n)+o,s=n+1}t[0]+=e.substring(s,n)},He=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:Ar.Stringify,buffer:r,context:o})),r[0]};var Y=Symbol("RENDERER"),te=Symbol("ERROR_HANDLER"),E=Symbol("STASH"),ve=Symbol("INTERNAL"),Te=Symbol("MEMO"),re=Symbol("PERMALINK");var ze=e=>(e[ve]=!0,e);var Ve=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:ze(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:ze(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[te]=s=>{throw e.pop(),s},n},ce=e=>{let t=[e],r=Ve(t);return r.values=t,r.Provider=r,z.push(r),r};var z=[],lt=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new pe("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>j(s,s.callbacks)):(t.pop(),j(n))};return r.values=t,r.Provider=r,r[Y]=Ve(t),z.push(r),r},I=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},fe={},V="data-precedence",De=e=>e.rel==="stylesheet"&&"precedence"in e,Le=(e,t)=>e==="link"?t:oe[e].length>0;var ue={};Cr(ue,{button:()=>Mr,form:()=>Rr,input:()=>Or,link:()=>jr,meta:()=>_r,script:()=>Dr,style:()=>Lr,title:()=>Tr});var Z=e=>Array.isArray(e)?e:[e];var ct=new WeakMap,pt=(e,t,r,o)=>({buffer:n,context:s})=>{if(!n)return;let a=ct.get(s)||{};ct.set(s,a);let c=a[e]||=[],d=!1,m=oe[e],u=Le(e,o!==void 0);if(u){e:for(let[,l]of c)if(!(e==="link"&&!(l.rel==="stylesheet"&&l[V]!==void 0))){for(let x of m)if((l?.[x]??null)===r?.[x]){d=!0;break e}}}if(d?n[0]=n[0].replaceAll(t,""):u||e==="link"?c.push([t,r,o]):c.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let l;if(e==="link"||o!==void 0){let x=[];l=c.map(([y,,b],v)=>{if(b===void 0)return[y,Number.MAX_SAFE_INTEGER,v];let D=x.indexOf(b);return D===-1&&(x.push(b),D=x.length-1),[y,D,v]}).sort((y,b)=>y[1]-b[1]||y[2]-b[2]).map(([y])=>y)}else l=c.map(([x])=>x);l.forEach(x=>{n[0]=n[0].replaceAll(x,"")}),n[0]=n[0].replace(/(?=<\/head>)/,l.join(""))}},de=(e,t,r)=>j(new O(e,r,Z(t??[])).toString()),me=(e,t,r,o)=>{if("itemProp"in r)return de(e,t,r);let{precedence:n,blocking:s,...a}=r;n=o?n??"":void 0,o&&(a[V]=n);let c=new O(e,a,Z(t||[])).toString();return c instanceof Promise?c.then(d=>j(c,[...d.callbacks||[],pt(e,d,a,n)])):j(c,[pt(e,c,a,n)])},Tr=({children:e,...t})=>{let r=je();if(r){let o=I(r);if(o==="svg"||o==="head")return new O("title",t,Z(e??[]))}return me("title",e,t,!1)},Dr=({children:e,...t})=>{let r=je();return["src","async"].some(o=>!t[o])||r&&I(r)==="head"?de("script",e,t):me("script",e,t,!1)},Lr=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,me("style",e,t,!0)):de("style",e,t),jr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?de("link",e,t):me("link",e,t,De(t)),_r=({children:e,...t})=>{let r=je();return r&&I(r)==="head"?de("meta",e,t):me("meta",e,t,!1)},ft=(e,{children:t,...r})=>new O(e,r,Z(t??[])),Rr=e=>(typeof e.action=="function"&&(e.action=re in e.action?e.action[re]:void 0),ft("form",e)),dt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=re in t.formAction?t.formAction[re]:void 0),ft(e,t)),Or=e=>dt("input",e),Mr=e=>dt("button",e);var Pr=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),ne=e=>Pr.get(e)||e,xe=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var ge,je=()=>ge,Ir=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Br=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Nr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ke=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")H(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):Ke(n,t)}}},O=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?He(j(t[0],t.callbacks)).toString():t[0]:Ae(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let s=ge&&I(ge)==="svg"?a=>Ir(ne(a)):a=>ne(a);for(let[a,c]of Object.entries(o))if(a=s(a),a!=="children"){if(a==="style"&&typeof c=="object"){let d="";xe(c,(m,u)=>{u!=null&&(d+=`${d?";":""}${m}:${u}`)}),t[0]+=' style="',H(d,t),t[0]+='"'}else if(typeof c=="string")t[0]+=` ${a}="`,H(c,t),t[0]+='"';else if(c!=null)if(typeof c=="number"||c.isEscaped)t[0]+=` ${a}="${c}"`;else if(typeof c=="boolean"&&Nr.includes(a))c&&(t[0]+=` ${a}=""`);else if(a==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[j(c.__html)]}else if(c instanceof Promise)t[0]+=` ${a}="`,t.unshift('"',c);else if(typeof c=="function"){if(!a.startsWith("on")&&a!=="ref")throw new Error(`Invalid prop '${a}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${a}="`,H(c.toString(),t),t[0]+='"'}if(Br.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",Ke(n,t),t[0]+=`</${r}>`}},he=class extends O{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(z.length===0)t.unshift("",n);else{let s=z.map(a=>[a,a.values.at(-1)]);t.unshift("",n.then(a=>(a instanceof O&&(a.localContexts=s),a)))}else n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):H(n,t)}},pe=class extends O{toStringToBuffer(t){Ke(this.children,t)}};var mt=!1,_e=(e,t,r)=>{if(!mt){for(let o in fe)ue[o][Y]=fe[o];mt=!0}return typeof e=="function"?new he(e,t,r):ue[e]?new he(ue[e],t,r):e==="svg"||e==="head"?(ge||=lt(""),new O(e,t,[new he(ge,{value:e},r)])):new O(e,t,r)};var ie=({children:e})=>new pe("",{children:e},Array.isArray(e)?e:e?[e]:[]);function i(e,t,r){let o;if(!t||!("children"in t))o=_e(e,t,[]);else{let n=t.children;o=Array.isArray(n)?_e(e,t,n):_e(e,t,[n])}return o.key=r,o}var be="_hp",Fr={Change:"Input",DoubleClick:"DblClick"},Ur={svg:"2000/svg",math:"1998/Math/MathML"},J=[],We=new WeakMap,se,St=()=>se,K=e=>"t"in e,Ge={onClick:["click",!1]},ut=e=>{if(!e.startsWith("on"))return;if(Ge[e])return Ge[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return Ge[e]=[(Fr[r]||r).toLowerCase(),!!o]}},xt=(e,t)=>se&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,wt=e=>e==null||e===!1?null:e,Hr=(e,t)=>{"value"in t&&(e.value=wt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},zr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=ne(o);let s=ut(o);if(s){if(r?.[o]!==n&&(r&&e.removeEventListener(s[0],r[o],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let a;typeof n=="function"?a=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,a=()=>n.current=null),We.set(e,a)}else if(o==="style"){let a=e.style;typeof n=="string"?a.cssText=n:(a.cssText="",n!=null&&xe(n,a.setProperty.bind(a)))}else{if(o==="value"){let c=e.nodeName;if(c==="SELECT")continue;if((c==="INPUT"||c==="TEXTAREA")&&(e.value=wt(n),c==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let a=xt(e,o);n==null||n===!1?e.removeAttribute(a):n===!0?e.setAttribute(a,""):typeof n=="string"||typeof n=="number"?e.setAttribute(a,n):e.setAttribute(a,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=ne(o);let s=ut(o);s?e.removeEventListener(s[0],n,s[1]):o==="ref"?We.get(e)?.():e.removeAttribute(xt(e,o))}}},Vr=(e,t)=>{t[E][0]=0,J.push([e,t]);let r=t.tag[Y]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{J.pop()}},Et=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[E][1][Me]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(K(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let a=r.length;if(Et(s,t,r,o,n),s.s){for(let c=a;c<r.length;c++)r[c].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},Kr=e=>{for(;e&&(e.tag===be||!e.e);)e=e.tag===be||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},kt=e=>{K(e)||(e[E]?.[1][Me]?.forEach(t=>t[2]?.()),We.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(kt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(ye.delete(e),Re.delete(e),delete e[E][3],e.a=!0)},qe=(e,t,r)=>{e.c=t,$t(e,t,r)},ht=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},gt=Symbol(),$t=(e,t,r)=>{let o=[],n=[],s=[];Et(e,t,o,n,s),n.forEach(kt);let a=r?void 0:t.childNodes,c,d=null;if(r)c=-1;else if(!a.length)c=0;else{let m=ht(a,Kr(e.nN));m!==void 0?(d=a[m],c=m):c=ht(a,o.find(u=>u.tag!==be&&u.e)?.e)??-1,c===-1&&(r=!0)}for(let m=0,u=o.length;m<u;m++,c++){let l=o[m],x;if(l.s&&l.e)x=l.e,l.s=!1;else{let y=r||!l.e;K(l)?(l.e&&l.d&&(l.e.textContent=l.t),l.d=!1,x=l.e||=document.createTextNode(l.t)):(x=l.e||=l.n?document.createElementNS(l.n,l.tag):document.createElement(l.tag),zr(x,l.props,l.pP),$t(l,x,y),l.tag==="select"&&Hr(x,l.props))}l.tag===be?c--:r?x.parentNode||t.appendChild(x):a[c]!==x&&a[c-1]!==x&&(a[c+1]===x?t.appendChild(a[c]):t.insertBefore(x,d||a[c]||null))}if(e.pP&&(e.pP=void 0),s.length){let m=[],u=[];s.forEach(([,l,,x,y])=>{l&&m.push(l),x&&u.push(x),y?.()}),m.forEach(l=>l()),u.length&&requestAnimationFrame(()=>{u.forEach(l=>l())})}},Gr=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Re=new WeakMap,Oe=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?Vr(e,t):Z(t.props.children),r[0]?.tag===""&&r[0][te]&&(n=r[0][te],e[5].push([e,n,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,a=[],c;for(let d=0;d<r.length;d++){if(Array.isArray(r[d])){r.splice(d,1,...r[d].flat(1/0)),d--;continue}let m=Ct(r[d]);if(m){typeof m.tag=="function"&&!m.tag[ve]&&(z.length>0&&(m[E][2]=z.map(l=>[l,l.values.at(-1)])),e[5]?.length&&(m[E][3]=e[5].at(-1)));let u;if(s&&s.length){let l=s.findIndex(K(m)?x=>K(x):m.key!==void 0?x=>x.key===m.key&&x.tag===m.tag:x=>x.tag===m.tag);l!==-1&&(u=s[l],s.splice(l,1))}if(u)if(K(m))u.t!==m.t&&(u.t=m.t,u.d=!0),m=u;else{let l=u.pP=u.props;if(u.props=m.props,u.f||=m.f||t.f,typeof m.tag=="function"){let x=u[E][2];u[E][2]=m[E][2]||[],u[E][3]=m[E][3],!u.f&&((u.o||u)===m.o||u.tag[Te]?.(l,u.props))&&Gr(x,u[E][2])&&(u.s=!0)}m=u}else if(!K(m)&&se){let l=I(se);l&&(m.n=l)}if(!K(m)&&!m.s&&(Oe(e,m),delete m.f),a.push(m),c&&!c.s&&!m.s)for(let l=c;l&&!K(l);l=l.vC?.at(-1))l.nN=m;c=m}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=a,o&&delete t.pC}catch(s){if(t.f=!0,s===gt){if(n)return;throw s}let[a,c,d]=t[E]?.[3]||[];if(c){let m=()=>Se([0,!1,e[2]],d),u=Re.get(d)||[];u.push(m),Re.set(d,u);let l=c(s,()=>{let x=Re.get(d);if(x){let y=x.indexOf(m);if(y!==-1)return x.splice(y,1),m()}});if(l){if(e[0]===1)e[1]=!0;else if(Oe(e,d,[l]),(c.length===1||e!==a)&&d.c){qe(d,d.c,!1);return}throw gt}}throw s}finally{n&&e[5].pop()}},Ct=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[E]=[0,[]];else{let t=Ur[e.tag];t&&(se||=ce(""),e.props.children=[{tag:se,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},At=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>At(o,t,r)))},yt=(e,t)=>{t[E][2]?.forEach(([r,o])=>{r.values.push(o)});try{Oe(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[E][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&qe(t,t.c,!1)},ye=new WeakMap,bt=[],Se=async(e,t)=>{e[5]||=[];let r=ye.get(t);r&&r[0](void 0);let o,n=new Promise(s=>o=s);if(ye.set(t,[o,()=>{e[2]?e[2](e,t,s=>{yt(s,t)}).then(()=>o(t)):(yt(e,t),o(t))}]),bt.length)bt.at(-1).add(t);else{await Promise.resolve();let s=ye.get(t);s&&(ye.delete(t),s[1]())}return n},Wr=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Oe(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();qe(e,o,!0),At(e,o,t),t.replaceChildren(o)},Ye=(e,t)=>{Wr(Ct({tag:"",props:{children:e}}),t)};var Xe=(e,t,r)=>({tag:be,props:{children:e},key:r,e:t,p:1});var qr=0,Me=1,Yr=2,Xr=3;var Ze=new WeakMap,Je=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var Zr;var vt=[];var we=e=>{let t=()=>typeof e=="function"?e():e,r=J.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[E][1][qr]||=[],s=o[E][0]++;return n[s]||=[t(),a=>{let c=Zr,d=n[s];if(typeof a=="function"&&(a=a(d[0])),!Object.is(a,d[0]))if(d[0]=a,vt.length){let[m,u]=vt.at(-1);Promise.all([m===3?o:Se([m,!1,c],o),u]).then(([l])=>{if(!l||!(m===2||m===3))return;let x=l.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===l.vC&&Se([m===3?1:0,!1,c],l)})})})}else Se([0,!1,c],o)}]},Qe=(e,t,r)=>{let o=Q(a=>{s(c=>e(c,a))},[e]),[n,s]=we(()=>r?r(t):t);return[n,o]},Jr=(e,t,r)=>{let o=J.at(-1);if(!o)return;let[,n]=o,s=n[E][1][Me]||=[],a=n[E][0]++,[c,,d]=s[a]||=[];if(Je(c,r)){d&&d();let m=()=>{u[e]=void 0,u[2]=t()},u=[r,void 0,void 0,void 0,void 0];u[e]=m,s[a]=u}},et=(e,t)=>Jr(3,e,t);var Q=(e,t)=>{let r=J.at(-1);if(!r)return e;let[,o]=r,n=o[E][1][Yr]||=[],s=o[E][0]++,a=n[s];return Je(a?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var tt=e=>{let t=Ze.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>Ze.set(e,[r]),r=>Ze.set(e,[void 0,r])),e},rt=(e,t)=>{let r=J.at(-1);if(!r)return e();let[,o]=r,n=o[E][1][Xr]||=[],s=o[E][0]++,a=n[s];return Je(a?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Dt=ce({pending:!1,data:null,method:null,action:null}),Tt=new Set,Lt=e=>{Tt.add(e),e.finally(()=>Tt.delete(e))};var ot=(e,t)=>rt(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),jt=Object.create(null),_t=Object.create(null),Ee=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:a,onError:c,precedence:d,blocking:m,...u}=t,l=null,x=!1,y=oe[e],b=Le(e,o),v=w=>w.getAttribute("rel")==="stylesheet"&&w.getAttribute(V)!==null,D;if(b){let w=s.querySelectorAll(e);e:for(let $ of w)if(!(e==="link"&&!v($))){for(let S of y)if($.getAttribute(S)===t[S]){l=$;break e}}if(!l){let $=y.reduce((S,C)=>t[C]===void 0?S:`${S}-${C}-${t[C]}`,e);x=!_t[$],l=_t[$]||=(()=>{let S=document.createElement(e);for(let C of y)t[C]!==void 0&&S.setAttribute(C,t[C]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else D=s.querySelectorAll(e);d=o?d??"":void 0,o&&(u[V]=d);let U=Q(w=>{if(b){if(e==="link"&&d!==void 0){let S=!1;for(let C of s.querySelectorAll(e)){let P=C.getAttribute(V);if(P===null){s.insertBefore(w,C);return}if(S&&P!==d){s.insertBefore(w,C);return}P===d&&(S=!0)}s.appendChild(w);return}let $=!1;for(let S of s.querySelectorAll(e)){if($&&S.getAttribute(V)!==d){s.insertBefore(w,S);return}S.getAttribute(V)===d&&($=!0)}s.appendChild(w)}else if(e==="link")s.contains(w)||s.appendChild(w);else if(D){let $=!1;for(let S of D)if(S===w){$=!0;break}$||s.insertBefore(w,s.contains(D[0])?D[0]:s.querySelector(e)),D=void 0}},[b,d,e]),q=ot(t.ref,w=>{let $=y[0];if(r===2&&(w.innerHTML=""),(x||D)&&U(w),!c&&!a||!$)return;let S=jt[w.getAttribute($)]||=new Promise((C,P)=>{w.addEventListener("load",C),w.addEventListener("error",P)});a&&(S=S.then(a)),c&&(S=S.catch(c)),S.catch(()=>{})});if(n&&m==="render"){let w=oe[e][0];if(w&&t[w]){let $=t[w],S=jt[$]||=new Promise((C,P)=>{U(l),l.addEventListener("load",C),l.addEventListener("error",P)});tt(S)}}let _={tag:e,type:e,props:{...u,ref:q},ref:q};return _.p=r,l&&(_.e=l),Xe(_,s)},Qr=e=>{let t=St();return(t&&I(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:Ee("title",e,void 0,!1,!1)},eo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:Ee("script",e,1,!1,!0),to=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,Ee("style",e,2,!0,!0)),ro=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:Ee("link",e,1,De(e),!0),oo=e=>Ee("meta",e,void 0,!1,!1),Rt=Symbol(),no=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=we([null,!1]),s=Q(async m=>{let u=m.isTrusted?t:m.detail[Rt];if(typeof u!="function")return;m.preventDefault();let l=new FormData(m.target);n([l,!0]);let x=u(l);x instanceof Promise&&(Lt(x),await x),n([null,!0])},[]),a=ot(e.ref,m=>(m.addEventListener("submit",s),()=>{m.removeEventListener("submit",s)})),[c,d]=o;return o[1]=!1,{tag:Dt,props:{value:{pending:c!==null,data:c,method:c?"post":null,action:c?t:null},children:{tag:"form",props:{...r,ref:a},type:"form",ref:a}},f:d}},Ot=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=Q(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Rt]:t}}))},[]);r.ref=ot(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},io=e=>Ot("input",e),so=e=>Ot("button",e);Object.assign(fe,{title:Qr,script:eo,style:to,link:ro,meta:oo,form:no,input:io,button:so});var Pe={screen:"landing",loadingContext:null,user:null,apps:[],lastUsedAppId:null,error:null};var It=(e,t)=>{switch(t.type){case"INIT_SESSION_CHECK":return{...e,screen:"loading",loadingContext:"authenticating"};case"NO_SESSION":return{...e,screen:"landing",loadingContext:null,error:null};case"SESSION_EXPIRED":return{...e,screen:"landing",loadingContext:null,user:null,error:{type:"session",title:t.title,message:t.message}};case"AUTH_START":return{...e,screen:"loading",loadingContext:"authenticating",error:null};case"AUTH_CALLBACK_SUCCESS":{let{user:r,apps:o,lastUsedAppId:n}=t;return o.length===0?{...e,screen:"hub",loadingContext:null,user:r,apps:o,lastUsedAppId:null,error:null}:o.length===1?{...e,screen:"redirect",loadingContext:null,user:r,apps:o,lastUsedAppId:o[0].id,error:null}:{...e,screen:"hub",loadingContext:null,user:r,apps:o,lastUsedAppId:n,error:null}}case"AUTH_CALLBACK_FAILURE":return{...e,screen:"landing",loadingContext:null,error:{type:"auth",title:t.title,message:t.message}};case"LOAD_PERMISSIONS_START":return{...e,screen:"loading",loadingContext:"loading-permissions",error:null};case"LOAD_PERMISSIONS_SUCCESS":{let{apps:r,lastUsedAppId:o}=t;return r.length===1?{...e,screen:"redirect",loadingContext:null,apps:r,lastUsedAppId:r[0].id}:{...e,screen:"hub",loadingContext:null,apps:r,lastUsedAppId:o}}case"LOAD_PERMISSIONS_FAILURE":return{...e,screen:"hub",loadingContext:null,error:{type:"network",title:t.title,message:t.message}};case"SELECT_APP":return{...e,screen:"loading",loadingContext:"entering-app",lastUsedAppId:t.appId};case"LOGOUT_START":return{...e,screen:"loading",loadingContext:"authenticating"};case"LOGOUT_COMPLETE":return{...Pe,screen:"landing"}}},Bt=e=>e.screen==="redirect"&&e.apps.length===1?e.apps[0]??null:null,Nt=(e,t)=>`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`;var A={landingTitle:"ACDG",landingTagline:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio",landingButton:"Entrar na plataforma",landingFooter:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o",authErrorTitle:"Falha na autentica\xE7\xE3o",authErrorDesc:"N\xE3o foi poss\xEDvel concluir o login. Verifique suas credenciais ou entre em contato com o suporte.",sessionExpiredTitle:"Sess\xE3o expirada",sessionExpiredDesc:"Sua sess\xE3o expirou por inatividade. Fa\xE7a login novamente para continuar.",greeting:(e,t)=>`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`,hubSubtitle:"Selecione um m\xF3dulo para continuar",lastUsedLabel:"\xDALTIMO ACESSADO",allModulesLabel:e=>e===0?"NENHUM M\xD3DULO":e===1?"SEU M\xD3DULO":`TODOS OS M\xD3DULOS (${e})`,logoutButton:"Sair",emptyTitle:"Nenhum m\xF3dulo dispon\xEDvel",emptyDesc:"Sua conta ainda n\xE3o tem acesso a nenhum m\xF3dulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permiss\xF5es necess\xE1rias.",emptyContactAdmin:"Falar com o administrador",emptyContactEmail:"admin@acdg.gov.br",emptyContactSubject:"Solicita\xE7\xE3o de acesso - ACDG",emptyBackToStart:"Voltar ao in\xEDcio",networkErrorTitle:"Erro ao carregar m\xF3dulos",networkErrorDesc:"N\xE3o foi poss\xEDvel carregar suas permiss\xF5es. Verifique sua conex\xE3o com a internet e tente novamente.",networkErrorRetry:"Tentar novamente",redirectTitle:e=>`Entrando em ${e}...`,redirectSubtitle:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente.",redirectCancel:"N\xE3o \xE9 o que esperava? Voltar",loadingAuth:"Autenticando...",loadingPermissions:"Carregando m\xF3dulos...",loadingApp:e=>`Entrando em ${e}...`};var ee=":-hono-global",lo=new RegExp(`^${ee}{(.*)}$`),Ie="hono-css",G=Symbol(),L=Symbol(),M=Symbol(),F=Symbol(),Be=Symbol(),Ft=Symbol(),Ws=Symbol();var Ut=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Ht=e=>e.trim().replace(/\s+/g,"-"),zt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),co=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),po=e=>zt(e)&&!co.has(e.toLowerCase()),Vt=e=>{console.warn(`Invalid slug: ${e}`)},fo=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),mo=new RegExp(["("+fo+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),uo=e=>e.replace(mo,(t,r,o,n,s)=>r||o||n||s||""),Kt=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let a=0,c=e.length;a<c;a++){s+=e[a];let d=t[a];if(!(typeof d=="boolean"||d===null||d===void 0)){Array.isArray(d)||(d=[d]);for(let m=0,u=d.length;m<u;m++){let l=d[m];if(!(typeof l=="boolean"||l===null||l===void 0))if(typeof l=="string")/([\\"'\/])/.test(l)?s+=l.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=l;else if(typeof l=="number")s+=l;else if(l[Ft])s+=l[Ft];else if(l[L].startsWith("@keyframes "))r.push(l),s+=` ${l[L].substring(11)} `;else{if(e[a+1]?.match(/^\s*{/))r.push(l),l=`.${l[L]}`;else{r.push(...l[F]),o.push(...l[Be]),l=l[M];let x=l.length;if(x>0){let y=l[x-1];y!==";"&&y!=="}"&&(l+=";")}}s+=`${l||""}`}}}}return[n,uo(s),r,o]},ae=(e,t,r,o)=>{let[n,s,a,c]=Kt(e,t),d=lo.exec(s);d&&(s=d[1]);let m=Ut(n+s),u;if(r){let y=r(m,Ht(n),s);y&&(zt(y)?u=y:(o||Vt)(y))}let l=(d?ee:"")+(u||m),x=(d?a.map(y=>y[L]):[l,...c]).join(" ");return{[G]:l,[L]:x,[M]:s,[F]:a,[Be]:c}},Ne=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[G]:"",[L]:"",[M]:"",[F]:[],[Be]:[o]})}return e},Fe=(e,t,r,o)=>{let[n,s]=Kt(e,t),a=Ut(n+s),c;if(r){let d=r(a,Ht(n),s);d&&(po(d)?c=d:(o||Vt)(d))}return{[G]:"",[L]:`@keyframes ${c||a}`,[M]:s,[F]:[],[Be]:[]}},xo=0,Ue=(e,t,r,o)=>{e||(e=[`/* h-v-t ${xo++} */`]);let n=Array.isArray(e)?ae(e,t,r,o):e,s=n[L],a=ae(["view-transition-name:",""],[s],r,o);return n[L]=ee+n[L],n[M]=n[M].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),a[L]=a[G]=s,a[F]=[...n[F],n],a};var go=e=>{let t=[],r=0,o=0;for(let n=0,s=e.length;n<s;n++){let a=e[n];if(a==="'"||a==='"'){let c=a;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===c)break}continue}if(a==="{"){o++;continue}if(a==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},nt=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(a,c)=>{let[d,m]=r();if(!d||!m){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(a,c)});return}m.has(a)||(m.add(a),(a.startsWith(ee)?go(c):[`${a[0]==="@"?"":"."}${a}{${c}}`]).forEach(u=>{d.insertRule(u,d.cssRules.length)}))};return[{toString(){let a=this[G];return o(a,this[M]),this[F].forEach(({[L]:c,[M]:d})=>{o(c,d)}),this[L]}},({children:a,nonce:c})=>({tag:"style",props:{id:e,nonce:c,children:a&&(Array.isArray(a)?a:[a]).map(d=>d[M])}})]},yo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=nt({id:e}),s=u=>(u.toString=o.toString,u),a=(u,...l)=>s(ae(u,l,t,r));return{css:a,cx:(...u)=>(u=Ne(u),a(Array(u.length).fill(""),...u)),keyframes:(u,...l)=>Fe(u,l,t,r),viewTransition:(u,...l)=>s(Ue(u,l,t,r)),Style:n}},ke=yo({id:Ie}),Xs=ke.css,Zs=ke.cx,Js=ke.keyframes,Qs=ke.viewTransition,ea=ke.Style;var bo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=nt({id:e}),s=new WeakMap,a=new WeakMap,c=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),d=b=>{let v=({buffer:_,context:w})=>{let[$,S]=s.get(w),C=Object.keys($);if(!C.length)return;let P="";if(C.forEach(X=>{S[X]=!0,P+=X.startsWith(ee)?$[X]:`${X[0]==="@"?"":"."}${X}{${$[X]}}`}),s.set(w,[{},S]),_&&c.test(_[0])){_[0]=_[0].replace(c,(X,Er,kr)=>`${Er}${P}${kr}`);return}let st=a.get(w),at=`<script${st?` nonce="${st}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(P)}<\/script>`;if(_){_[0]=`${at}${_[0]}`;return}return Promise.resolve(at)},D=({context:_})=>{s.has(_)||s.set(_,[{},{}]);let[w,$]=s.get(_),S=!0;if($[b[G]]||(S=!1,w[b[G]]=b[M]),b[F].forEach(({[L]:C,[M]:P})=>{$[C]||(S=!1,w[C]=P)}),!S)return Promise.resolve(j("",[v]))},U=new String(b[L]);Object.assign(U,b),U.isEscaped=!0,U.callbacks=[D];let q=Promise.resolve(U);return Object.assign(q,b),q.toString=o.toString,q},m=(b,...v)=>d(ae(b,v,t,r)),u=(...b)=>(b=Ne(b),m(Array(b.length).fill(""),...b)),l=(b,...v)=>Fe(b,v,t,r),x=(b,...v)=>d(Ue(b,v,t,r)),y=({children:b,nonce:v}={})=>j(`<style id="${e}"${v?` nonce="${v}"`:""}>${b?b[M]:""}</style>`,[({context:D})=>{a.set(D,v)}]);return y[Y]=n,{css:m,cx:u,keyframes:l,viewTransition:x,Style:y}},$e=bo({id:Ie}),p=$e.css,it=$e.cx,N=$e.keyframes,aa=$e.viewTransition,la=$e.Style;var f={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},T=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},h={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},g={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},B={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},da={button:p`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:p`box-shadow: -8px 0 40px ${T(f.textPrimary,.3)};`,fab:p`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:p`box-shadow: 0 24px 80px ${f.inputLine};`,modal:p`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},R={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"},W={mobile:600,tablet:1200};var k=N`
  from { opacity: 0; transform: translateY(${B[4]}); }
  to { opacity: 1; transform: translateY(0); }
`,Gt=N`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(${B[6]}, ${B[5]}) scale(1.05); }
`,Wt=N`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-${B[5]}, -${B[3]}) scale(1.08); }
`,qt=N`
  from { width: 0; }
  to { width: 100%; }
`,le=p`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: clip;
`,Yt=p`
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
`;var Xt=p`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`,So=p`
  ${Xt}
  width: 600px;
  height: 600px;
  background: ${T(f.primary,.15)};
  top: -200px;
  right: -150px;
  animation: ${Gt} 12s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 400px;
    height: 400px;
  }
`,wo=p`
  ${Xt}
  width: 500px;
  height: 500px;
  background: ${T(f.background,.1)};
  bottom: -150px;
  left: -100px;
  animation: ${Wt} 15s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 350px;
    height: 350px;
  }
`,Zt=()=>i(ie,{children:[i("div",{class:So,"aria-hidden":"true"}),i("div",{class:wo,"aria-hidden":"true"})]});var Eo=p`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${f.background};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`,ko=p`
  font-family: ${h.satoshi};
  font-size: 36px;
  font-weight: ${g.bold};
  color: ${f.backgroundDark};
  line-height: 1;
`,Jt=()=>i("div",{class:Eo,"aria-hidden":"true",children:i("span",{class:ko,children:"A"})});var $o=p`
  font-family: ${h.satoshi};
  font-size: 40px;
  font-weight: ${g.bold};
  color: ${f.textOnDark};
  line-height: 1.2;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 28px;
  }
`,Qt=()=>i("h1",{class:$o,children:"ACDG"});var Co=p`
  font-family: ${h.satoshi};
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1.0625rem);
  font-style: italic;
  font-weight: ${g.regular};
  color: ${f.textSageMuted};
  line-height: 1.6;
  max-width: min(90%, 24rem);
  text-align: center;
  margin: 0;
`,er=()=>i("p",{class:Co,children:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio"});var Ao=N`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,vo=p`
  max-width: 440px;
  width: 90%;
  padding: 16px 20px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${Ao} 500ms ease both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,To=p`
  background: rgba(166, 41, 13, 0.15);
  border: 1px solid rgba(166, 41, 13, 0.25);
`,Do=p`
  background: rgba(201, 150, 10, 0.15);
  border: 1px solid rgba(201, 150, 10, 0.25);
`,Lo=p`color: #FF8A7A;`,jo=p`color: #FFD066;`,_o=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.semibold};
  margin: 0 0 4px;
  line-height: 1.3;
`,Ro=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: rgba(242, 226, 196, 0.8);
  line-height: 1.5;
  margin: 0;
`,tr=p`
  flex-shrink: 0;
  margin-top: 2px;
`,Oo=({color:e})=>i("svg",{class:tr,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),i("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),i("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),Mo=({color:e})=>i("svg",{class:tr,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("circle",{cx:"12",cy:"12",r:"10"}),i("polyline",{points:"12 6 12 12 16 14"})]}),rr=({type:e,title:t,description:r})=>{let o=e==="error",n=o?"#FF8A7A":"#FFD066";return i("div",{class:it(vo,o?To:Do),role:"alert","aria-live":"assertive",children:[o?i(Oo,{color:n}):i(Mo,{color:n}),i("div",{children:[i("p",{class:it(_o,o?Lo:jo),children:t}),i("p",{class:Ro,children:r})]})]})};var Po=N`
  to { transform: rotate(360deg); }
`,Io=p`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 48px;
  border-radius: ${R.pill};
  border: none;
  background: ${f.background};
  color: ${f.backgroundDark};
  font-family: ${h.playfair};
  font-style: italic;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
  box-shadow: 2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 300ms ease;
  &:hover {
    transform: scale(1.04);
    box-shadow: 3px 3px 8px 3px rgba(0, 0, 0, 0.18);
  }
  &:active {
    transform: scale(0.98);
  }
  &:focus-visible {
    outline: 2px solid ${f.background};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  @media (max-width: 599px) {
    padding: 14px 36px;
    font-size: 16px;
    white-space: nowrap;
    min-height: 48px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,Bo=p`
  width: 20px;
  height: 20px;
  border: 2px solid ${f.backgroundDark};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${Po} 0.8s linear infinite;
`,or=({onClick:e,loading:t})=>i("button",{class:Io,onClick:e,disabled:t,type:"button","aria-label":"Entrar na plataforma",children:t?i("div",{class:Bo,"aria-hidden":"true"}):"Entrar na plataforma"});var No=p`
  position: absolute;
  bottom: clamp(1rem, 0.75rem + 1vw, 2rem);
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.8125rem);
  color: ${f.textSageSoft};
  letter-spacing: 0.5px;
`,nr=()=>i("footer",{class:No,children:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o"});var Fo=p`
  ${le}
  background: linear-gradient(155deg, ${f.bgBase} 0%, ${f.bgWarm} 25%, ${f.bgSage} 55%, ${f.bgSageDeep} 100%);
  background-attachment: fixed;
  font-family: ${h.satoshi};
`,Uo=p`
  :-hono-global {
    body { background: ${f.bgSageDeep} !important; }
  }
`,Ho=p`
  ${Yt}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.25rem, 1rem + 1.5vw, 1.75rem);
  z-index: 1;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  max-width: min(90%, 32rem);
  animation: ${k} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
`,ir=({alert:e,onLogin:t,loading:r})=>i("main",{class:Fo,"aria-label":"P\xE1gina de login",children:[i("div",{class:Uo}),i(Zt,{}),i("div",{class:Ho,children:[i(Jt,{}),i(Qt,{}),i(er,{}),e?i(rr,{type:e.type,title:e.title,description:e.description}):null,i(or,{onClick:t,loading:r})]}),i(nr,{})]});var zo=N`
  to { transform: rotate(360deg); }
`,Vo=p`
  width: 32px;
  height: 32px;
  border: 3px solid ${f.inputLine};
  border-top-color: ${f.primary};
  border-radius: 50%;
  animation: ${zo} 0.8s linear infinite;
`,sr=()=>i("div",{class:Vo});var Ko=p`
  ${le}
  background: ${f.background};
  gap: 24px;
`,Go=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  margin: 0;
`,Wo=(e,t)=>{switch(e){case"authenticating":return"Autenticando...";case"loading-permissions":return"Carregando m\xF3dulos...";case"entering-app":return`Entrando em ${t??""}...`}},Ce=({context:e,appName:t})=>i("div",{class:Ko,role:"status","aria-live":"polite","aria-busy":"true",children:[i(sr,{}),i("p",{class:Go,children:Wo(e,t)})]});var qo=p`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
  flex-wrap: wrap;
  gap: 12px;
  animation: ${k} 500ms ease both;
  @media (min-width: ${W.mobile}px) {
    padding: 32px 48px 0;
    flex-wrap: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Yo=p`
  display: flex;
  align-items: center;
  gap: 10px;
`,Xo=p`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${f.backgroundDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${h.satoshi};
  font-size: 18px;
  font-weight: ${g.bold};
  color: ${f.textOnDark};
`,Zo=p`
  font-family: ${h.satoshi};
  font-size: 18px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
`,Jo=p`
  display: flex;
  align-items: center;
  gap: 12px;
`,Qo=p`
  display: none;
  text-align: right;
  @media (min-width: ${W.mobile}px) {
    display: block;
  }
`,en=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.medium};
  color: ${f.textPrimary};
  margin: 0;
`,tn=p`
  font-family: ${h.satoshi};
  font-size: 12px;
  color: ${f.textMuted};
  margin: 0;
`,rn=p`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${f.backgroundDark};
  color: ${f.textOnDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${h.satoshi};
  font-size: 16px;
  font-weight: ${g.semibold};
`,on=p`
  background: none;
  border: 1px solid ${f.inputLine};
  padding: 8px 18px;
  border-radius: ${R.pill};
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${g.semibold};
  color: ${T(f.textPrimary,.7)};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${f.danger};
    color: ${f.danger};
  }
  &:focus-visible {
    outline: 2px solid ${f.primary};
    outline-offset: 2px;
  }
`,ar=({user:e,onLogout:t})=>i("header",{class:qo,children:[i("div",{class:Yo,children:[i("div",{class:Xo,children:"A"}),i("span",{class:Zo,children:"ACDG"})]}),i("div",{class:Jo,children:[i("div",{class:Qo,children:[i("p",{class:en,children:e.name}),i("p",{class:tn,children:e.role})]}),i("div",{class:rn,"aria-hidden":"true",children:e.initials}),i("button",{class:on,onClick:t,"aria-label":"Sair da plataforma",children:"Sair"})]})]});var nn=p`
  text-align: center;
  margin-bottom: 48px;
  animation: ${k} 600ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,sn=p`
  font-family: ${h.satoshi};
  font-size: 24px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 8px;
  @media (min-width: ${W.mobile}px) {
    font-size: 32px;
  }
`,an=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  margin: 0;
`,lr=({greeting:e,subtitle:t})=>i("div",{class:nn,children:[i("h1",{class:sn,children:e}),i("p",{class:an,children:t})]});var ln=p`
  width: 100%;
  max-width: 720px;
  margin-bottom: 40px;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,cn=p`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${g.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${f.textMuted};
  margin: 0 0 12px;
`,pn=p`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: ${f.backgroundDark};
  border-radius: ${R.card};
  cursor: pointer;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }
  &:hover [data-arrow] {
    transform: translateX(4px);
    color: ${f.textOnDark};
  }
  &:focus-visible {
    outline: 2px solid ${f.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,fn=p`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,dn=p`
  flex: 1;
  min-width: 0;
`,mn=p`
  font-family: ${h.satoshi};
  font-size: 16px;
  font-weight: ${g.semibold};
  color: ${f.textOnDark};
  margin: 0 0 4px;
`,un=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${T(f.textOnDark,.75)};
  margin: 0;
  line-height: 1.5;
`,xn=p`
  font-size: 20px;
  color: ${T(f.textOnDark,.75)};
  flex-shrink: 0;
  transition: transform 200ms ease, color 200ms ease;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,hn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},cr=({app:e,label:t,onClick:r})=>i("div",{class:ln,children:[i("p",{class:cn,children:t}),i("div",{class:pn,role:"button",tabindex:0,"aria-label":`${e.name}: ${e.description}`,onClick:r,onKeyDown:hn(r),children:[i("div",{class:fn,style:{background:T(e.color,.15)},"aria-hidden":"true",children:i("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("div",{class:dn,children:[i("h3",{class:mn,children:e.name}),i("p",{class:un,children:e.description})]}),i("span",{class:xn,"data-arrow":!0,"aria-hidden":"true",children:"\u2192"})]})]});var gn=p`
  position: relative;
  background: ${f.surface};
  border-radius: ${R.card};
  padding: ${B[4]};
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  overflow: hidden;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease,
    border-color 300ms ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
    border-color: ${f.inputLine};
  }
  &:hover [data-accent] {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid ${f.primary};
    outline-offset: 2px;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  }
  &:focus-visible [data-accent] {
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,yn=p`
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${B[3]};
`,bn=p`
  font-family: ${h.satoshi};
  font-size: 15px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 6px;
`,Sn=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  margin: 0;
  line-height: 1.5;
`,wn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},pr=({app:e,index:t,onClick:r})=>{let o=350+t*70;return i("article",{class:gn,style:{animation:`${k} 500ms ease ${o}ms both`},role:"button",tabindex:0,"aria-label":`Abrir ${e.name}`,onClick:r,onKeyDown:wn(r),children:[i("div",{class:yn,style:{background:T(e.color,.12)},"aria-hidden":"true",children:i("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("h3",{class:bn,children:e.name}),i("p",{class:Sn,children:e.description}),i("div",{"data-accent":!0,style:{position:"absolute",top:0,left:0,right:0,height:"3px",background:e.color,opacity:.5,transition:"opacity 200ms ease",borderRadius:`${R.card} ${R.card} 0 0`},"aria-hidden":"true"})]})};var En=p`
  width: 100%;
  max-width: 720px;
`,kn=p`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${g.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${f.textMuted};
  margin: 0 0 ${B[3]};
  animation: ${k} 600ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,$n=p`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${B[3]};
  width: 100%;
  @media (min-width: ${W.mobile}px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`,fr=({apps:e,label:t,onSelectApp:r})=>i("nav",{class:En,"aria-label":"M\xF3dulos dispon\xEDveis",children:[i("h2",{class:kn,children:t}),i("div",{class:$n,children:e.map((o,n)=>i(pr,{app:o,index:n,onClick:()=>r(o.id)},o.id))})]});var Cn=p`
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,An=p`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${T(f.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,vn=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 8px;
`,Tn=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,Dn=p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${R.pill};
  border: none;
  background: ${f.primary};
  color: ${f.textOnDark};
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.semibold};
  text-decoration: none;
  cursor: pointer;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid ${f.primary};
    outline-offset: 2px;
  }
`,Ln=p`
  display: block;
  margin: 12px auto 0;
  background: none;
  border: 1px solid ${f.inputLine};
  padding: 10px 24px;
  border-radius: ${R.pill};
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${g.semibold};
  color: ${f.textMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${f.textPrimary};
    color: ${f.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${f.primary};
    outline-offset: 2px;
  }
`,dr=({strings:e,mailtoHref:t,onLogout:r})=>i("div",{class:Cn,children:[i("div",{class:An,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:f.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),i("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]})}),i("h2",{class:vn,children:e.emptyTitle}),i("p",{class:Tn,children:e.emptyDesc}),i("a",{class:Dn,href:t,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"2",y:"4",width:"20",height:"16",rx:"2"}),i("path",{d:"M22 4L12 13 2 4"})]}),e.emptyContactAdmin]}),i("button",{class:Ln,onClick:r,children:e.emptyBackToStart})]});var jn=p`
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,_n=p`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${T(f.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,Rn=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 8px;
`,On=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,Mn=p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${R.pill};
  border: none;
  background: ${f.primary};
  color: ${f.textOnDark};
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.semibold};
  cursor: pointer;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid ${f.primary};
    outline-offset: 2px;
  }
`,mr=({strings:e,onRetry:t})=>i("div",{class:jn,children:[i("div",{class:_n,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:f.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("line",{x1:"1",y1:"1",x2:"23",y2:"23"}),i("path",{d:"M16.72 11.06A10.94 10.94 0 0 1 19 12.55"}),i("path",{d:"M5 12.55a10.94 10.94 0 0 1 5.17-2.39"}),i("path",{d:"M10.71 5.05A16 16 0 0 1 22.56 9"}),i("path",{d:"M1.42 9a15.91 15.91 0 0 1 4.7-2.88"}),i("path",{d:"M8.53 16.11a6 6 0 0 1 6.95 0"}),i("line",{x1:"12",y1:"20",x2:"12.01",y2:"20"})]})}),i("h2",{class:Rn,children:e.networkErrorTitle}),i("p",{class:On,children:e.networkErrorDesc}),i("button",{class:Mn,onClick:t,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("polyline",{points:"23 4 23 10 17 10"}),i("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),e.networkErrorRetry]})]});var Pn=p`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${f.background};
`,In=p`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  @media (min-width: ${W.mobile}px) {
    padding: 48px;
  }
`,ur=e=>{let{user:t,apps:r,lastUsedAppId:o,errorType:n,greeting:s,subtitle:a,allModulesLabel:c,lastUsedLabel:d}=e,{emptyStrings:m,emptyMailtoHref:u,networkStrings:l,onSelectApp:x,onLogout:y,onRetry:b}=e;if(!t)return i(Ce,{context:"loading-permissions"});let v=o!==null&&r.length>1?r.find(q=>q.id===o)??null:null,D=n==="network",U=r.length>0;return i("div",{class:Pn,children:[i(ar,{user:t,onLogout:y}),i("main",{class:In,children:[i(lr,{greeting:s,subtitle:a}),D?i(mr,{strings:l,onRetry:b}):U?i(ie,{children:[v?i(cr,{app:v,label:d,onClick:()=>x(v.id)}):null,i(fr,{apps:r,label:c,onSelectApp:x})]}):i(dr,{strings:m,mailtoHref:u,onLogout:y})]})]})};var Bn=p`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${k} 500ms ease both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,xr=({color:e})=>i("div",{class:Bn,style:{background:T(e,.12)},children:i("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2"}),i("path",{d:"M9 3v18"}),i("path",{d:"M14 9l3 3-3 3"})]})});var Nn=p`
  width: 200px;
  height: 4px;
  background: ${f.inputLine};
  border-radius: 2px;
  overflow: hidden;
  animation: ${k} 500ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Fn=p`
  height: 100%;
  background: ${f.primary};
  border-radius: 2px;
  animation: ${qt} 2s ease-in-out 400ms both;
  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    animation: none;
  }
`,hr=()=>i("div",{class:Nn,role:"progressbar","aria-valuemin":0,"aria-valuemax":100,children:i("div",{class:Fn})});var Un=p`
  background: none;
  border: none;
  padding: 0;
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  animation: ${k} 500ms ease 400ms both;
  &:hover {
    color: ${f.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${f.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,gr=({onClick:e})=>i("button",{class:Un,onClick:e,type:"button",children:"N\xE3o \xE9 o que esperava? Voltar"});var Hn=p`
  ${le}
  background: ${f.background};
  gap: 20px;
  text-align: center;
`,zn=p`
  font-family: ${h.satoshi};
  font-size: 22px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0;
  animation: ${k} 500ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Vn=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  margin: 0;
  animation: ${k} 500ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,yr=({app:e,onCancel:t})=>i("div",{class:Hn,role:"status","aria-live":"polite",children:[i(xr,{color:e.color}),i("h2",{class:zn,children:`Entrando em ${e.name}...`}),i("p",{class:Vn,children:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente."}),i(hr,{}),i(gr,{onClick:t})]});var Kn=`mailto:${A.emptyContactEmail}?subject=${encodeURIComponent(A.emptyContactSubject)}`,br=async e=>{try{let t=await fetch("/api/v1/me",{credentials:"same-origin",headers:{"X-Requested-With":"XMLHttpRequest"}});if(t.status===401){e({type:"NO_SESSION"});return}if(!t.ok){e({type:"LOAD_PERMISSIONS_FAILURE",title:A.networkErrorTitle,message:A.networkErrorDesc});return}let r=await t.json(),o=r.data??r;e({type:"AUTH_CALLBACK_SUCCESS",user:{name:o.name,firstName:o.firstName,initials:o.initials,role:o.role},apps:o.apps,lastUsedAppId:o.lastUsedAppId??null})}catch{e({type:"LOAD_PERMISSIONS_FAILURE",title:A.networkErrorTitle,message:A.networkErrorDesc})}},Sr=()=>{let[e,t]=Qe(It,Pe);et(()=>{let d=new URLSearchParams(globalThis.location.search);if(d.get("error")){t({type:"AUTH_CALLBACK_FAILURE",title:A.authErrorTitle,message:A.authErrorDesc});return}if(d.get("reason")==="session_expired"){t({type:"SESSION_EXPIRED",title:A.sessionExpiredTitle,message:A.sessionExpiredDesc});return}t({type:"INIT_SESSION_CHECK"}),br(t)},[]);let r=()=>{globalThis.location.href="/auth/login"},o=()=>{globalThis.location.href="/auth/logout"},n=()=>{t({type:"NO_SESSION"})},s=d=>{t({type:"SELECT_APP",appId:d});let m=e.apps.find(u=>u.id===d);m&&setTimeout(()=>{globalThis.location.href=m.route},1500)},a=()=>{t({type:"LOAD_PERMISSIONS_START"}),br(t)},c=e.error?{type:e.error.type==="session"?"warning":"error",title:e.error.title,description:e.error.message}:null;switch(e.screen){case"landing":return i(ir,{alert:c,onLogin:r});case"loading":{let d=e.lastUsedAppId?e.apps.find(m=>m.id===e.lastUsedAppId):null;return i(Ce,{context:e.loadingContext??"authenticating",appName:d?.name})}case"hub":return i(ur,{user:e.user,apps:e.apps,lastUsedAppId:e.lastUsedAppId,errorType:e.error?.type??null,greeting:e.user?Nt(e.user.firstName,new Date().getHours()):"",subtitle:A.hubSubtitle,allModulesLabel:A.allModulesLabel(e.apps.length),lastUsedLabel:A.lastUsedLabel,emptyStrings:{emptyTitle:A.emptyTitle,emptyDesc:A.emptyDesc,emptyContactAdmin:A.emptyContactAdmin,emptyBackToStart:A.emptyBackToStart},emptyMailtoHref:Kn,networkStrings:{networkErrorTitle:A.networkErrorTitle,networkErrorDesc:A.networkErrorDesc,networkErrorRetry:A.networkErrorRetry},onSelectApp:s,onLogout:o,onRetry:a});case"redirect":{let d=Bt(e);return d?i(yr,{app:d,onCancel:n}):i(Ce,{context:"authenticating"})}}};var wr=document.getElementById("auth-hub-app");wr&&Ye(i(Sr,{}),wr);
