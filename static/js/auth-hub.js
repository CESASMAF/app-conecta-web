var $o=Object.defineProperty;var Co=(e,t)=>{for(var o in t)$o(e,o,{get:t[o],enumerable:!0})};var Ao={Stringify:1,BeforeStream:2,Stream:3},j=(e,t)=>{let o=new String(e);return o.isEscaped=!0,o.callbacks=t,o},vo=/[&<>'"]/,Ae=async(e,t)=>{let o="";t||=[];let r=await Promise.all(e);for(let n=r.length-1;o+=r[n],n--,!(n<0);n--){let s=r[n];typeof s=="object"&&t.push(...s.callbacks||[]);let a=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??a)o+=s;else{let c=[o];H(s,c),o=c[0]}}return j(o,t)},H=(e,t)=>{let o=e.search(vo);if(o===-1){t[0]+=e;return}let r,n,s=0;for(n=o;n<e.length;n++){switch(e.charCodeAt(n)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(s,n)+r,s=n+1}t[0]+=e.substring(s,n)},He=e=>{let t=e.callbacks;if(!t?.length)return e;let o=[e],r={};return t.forEach(n=>n({phase:Ao.Stringify,buffer:o,context:r})),o[0]};var Y=Symbol("RENDERER"),te=Symbol("ERROR_HANDLER"),E=Symbol("STASH"),ve=Symbol("INTERNAL"),Te=Symbol("MEMO"),oe=Symbol("PERMALINK");var ze=e=>(e[ve]=!0,e);var Ve=e=>({value:t,children:o})=>{if(!o)return;let r={children:[{tag:ze(()=>{e.push(t)}),props:{}}]};Array.isArray(o)?r.children.push(...o.flat()):r.children.push(o),r.children.push({tag:ze(()=>{e.pop()}),props:{}});let n={tag:"",props:r,type:""};return n[te]=s=>{throw e.pop(),s},n},ce=e=>{let t=[e],o=Ve(t);return o.values=t,o.Provider=o,z.push(o),o};var z=[],lt=e=>{let t=[e],o=r=>{t.push(r.value);let n;try{n=r.children?(Array.isArray(r.children)?new pe("",{},r.children):r.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>j(s,s.callbacks)):(t.pop(),j(n))};return o.values=t,o.Provider=o,o[Y]=Ve(t),z.push(o),o},I=e=>e.values.at(-1);var re={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},fe={},V="data-precedence",De=e=>e.rel==="stylesheet"&&"precedence"in e,Le=(e,t)=>e==="link"?t:re[e].length>0;var me={};Co(me,{button:()=>Mo,form:()=>Ro,input:()=>Oo,link:()=>jo,meta:()=>_o,script:()=>Do,style:()=>Lo,title:()=>To});var Z=e=>Array.isArray(e)?e:[e];var ct=new WeakMap,pt=(e,t,o,r)=>({buffer:n,context:s})=>{if(!n)return;let a=ct.get(s)||{};ct.set(s,a);let c=a[e]||=[],d=!1,u=re[e],m=Le(e,r!==void 0);if(m){e:for(let[,l]of c)if(!(e==="link"&&!(l.rel==="stylesheet"&&l[V]!==void 0))){for(let x of u)if((l?.[x]??null)===o?.[x]){d=!0;break e}}}if(d?n[0]=n[0].replaceAll(t,""):m||e==="link"?c.push([t,o,r]):c.unshift([t,o,r]),n[0].indexOf("</head>")!==-1){let l;if(e==="link"||r!==void 0){let x=[];l=c.map(([y,,b],T)=>{if(b===void 0)return[y,Number.MAX_SAFE_INTEGER,T];let D=x.indexOf(b);return D===-1&&(x.push(b),D=x.length-1),[y,D,T]}).sort((y,b)=>y[1]-b[1]||y[2]-b[2]).map(([y])=>y)}else l=c.map(([x])=>x);l.forEach(x=>{n[0]=n[0].replaceAll(x,"")}),n[0]=n[0].replace(/(?=<\/head>)/,l.join(""))}},de=(e,t,o)=>j(new O(e,o,Z(t??[])).toString()),ue=(e,t,o,r)=>{if("itemProp"in o)return de(e,t,o);let{precedence:n,blocking:s,...a}=o;n=r?n??"":void 0,r&&(a[V]=n);let c=new O(e,a,Z(t||[])).toString();return c instanceof Promise?c.then(d=>j(c,[...d.callbacks||[],pt(e,d,a,n)])):j(c,[pt(e,c,a,n)])},To=({children:e,...t})=>{let o=je();if(o){let r=I(o);if(r==="svg"||r==="head")return new O("title",t,Z(e??[]))}return ue("title",e,t,!1)},Do=({children:e,...t})=>{let o=je();return["src","async"].some(r=>!t[r])||o&&I(o)==="head"?de("script",e,t):ue("script",e,t,!1)},Lo=({children:e,...t})=>["href","precedence"].every(o=>o in t)?(t["data-href"]=t.href,delete t.href,ue("style",e,t,!0)):de("style",e,t),jo=({children:e,...t})=>["onLoad","onError"].some(o=>o in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?de("link",e,t):ue("link",e,t,De(t)),_o=({children:e,...t})=>{let o=je();return o&&I(o)==="head"?de("meta",e,t):ue("meta",e,t,!1)},ft=(e,{children:t,...o})=>new O(e,o,Z(t??[])),Ro=e=>(typeof e.action=="function"&&(e.action=oe in e.action?e.action[oe]:void 0),ft("form",e)),dt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=oe in t.formAction?t.formAction[oe]:void 0),ft(e,t)),Oo=e=>dt("input",e),Mo=e=>dt("button",e);var Po=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),ne=e=>Po.get(e)||e,xe=(e,t)=>{for(let[o,r]of Object.entries(e)){let n=o[0]==="-"||!/[A-Z]/.test(o)?o:o.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,r==null?null:typeof r=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}};var ge,je=()=>ge,Io=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Bo=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],No=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ke=(e,t)=>{for(let o=0,r=e.length;o<r;o++){let n=e[o];if(typeof n=="string")H(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):Ke(n,t)}}},O=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,o,r){this.tag=t,this.props=o,this.children=r}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([o,r])=>{o.values.push(r)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([o])=>{o.values.pop()})}return t.length===1?"callbacks"in t?He(j(t[0],t.callbacks)).toString():t[0]:Ae(t,t.callbacks)}toStringToBuffer(t){let o=this.tag,r=this.props,{children:n}=this;t[0]+=`<${o}`;let s=ge&&I(ge)==="svg"?a=>Io(ne(a)):a=>ne(a);for(let[a,c]of Object.entries(r))if(a=s(a),a!=="children"){if(a==="style"&&typeof c=="object"){let d="";xe(c,(u,m)=>{m!=null&&(d+=`${d?";":""}${u}:${m}`)}),t[0]+=' style="',H(d,t),t[0]+='"'}else if(typeof c=="string")t[0]+=` ${a}="`,H(c,t),t[0]+='"';else if(c!=null)if(typeof c=="number"||c.isEscaped)t[0]+=` ${a}="${c}"`;else if(typeof c=="boolean"&&No.includes(a))c&&(t[0]+=` ${a}=""`);else if(a==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[j(c.__html)]}else if(c instanceof Promise)t[0]+=` ${a}="`,t.unshift('"',c);else if(typeof c=="function"){if(!a.startsWith("on")&&a!=="ref")throw new Error(`Invalid prop '${a}' of type 'function' supplied to '${o}'.`)}else t[0]+=` ${a}="`,H(c.toString(),t),t[0]+='"'}if(Bo.includes(o)&&n.length===0){t[0]+="/>";return}t[0]+=">",Ke(n,t),t[0]+=`</${o}>`}},he=class extends O{toStringToBuffer(t){let{children:o}=this,r={...this.props};o.length&&(r.children=o.length===1?o[0]:o);let n=this.tag.call(null,r);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(z.length===0)t.unshift("",n);else{let s=z.map(a=>[a,a.values.at(-1)]);t.unshift("",n.then(a=>(a instanceof O&&(a.localContexts=s),a)))}else n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):H(n,t)}},pe=class extends O{toStringToBuffer(t){Ke(this.children,t)}};var ut=!1,_e=(e,t,o)=>{if(!ut){for(let r in fe)me[r][Y]=fe[r];ut=!0}return typeof e=="function"?new he(e,t,o):me[e]?new he(me[e],t,o):e==="svg"||e==="head"?(ge||=lt(""),new O(e,t,[new he(ge,{value:e},o)])):new O(e,t,o)};var ie=({children:e})=>new pe("",{children:e},Array.isArray(e)?e:e?[e]:[]);function i(e,t,o){let r;if(!t||!("children"in t))r=_e(e,t,[]);else{let n=t.children;r=Array.isArray(n)?_e(e,t,n):_e(e,t,[n])}return r.key=o,r}var be="_hp",Fo={Change:"Input",DoubleClick:"DblClick"},Uo={svg:"2000/svg",math:"1998/Math/MathML"},J=[],We=new WeakMap,se,St=()=>se,K=e=>"t"in e,Ge={onClick:["click",!1]},mt=e=>{if(!e.startsWith("on"))return;if(Ge[e])return Ge[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,o,r]=t;return Ge[e]=[(Fo[o]||o).toLowerCase(),!!r]}},xt=(e,t)=>se&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,wt=e=>e==null||e===!1?null:e,Ho=(e,t)=>{"value"in t&&(e.value=wt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},zo=(e,t,o)=>{t||={};for(let r in t){let n=t[r];if(r!=="children"&&(!o||o[r]!==n)){r=ne(r);let s=mt(r);if(s){if(o?.[r]!==n&&(o&&e.removeEventListener(s[0],o[r],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${r}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(r==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(r==="ref"){let a;typeof n=="function"?a=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,a=()=>n.current=null),We.set(e,a)}else if(r==="style"){let a=e.style;typeof n=="string"?a.cssText=n:(a.cssText="",n!=null&&xe(n,a.setProperty.bind(a)))}else{if(r==="value"){let c=e.nodeName;if(c==="SELECT")continue;if((c==="INPUT"||c==="TEXTAREA")&&(e.value=wt(n),c==="TEXTAREA")){e.textContent=n;continue}}else(r==="checked"&&e.nodeName==="INPUT"||r==="selected"&&e.nodeName==="OPTION")&&(e[r]=n);let a=xt(e,r);n==null||n===!1?e.removeAttribute(a):n===!0?e.setAttribute(a,""):typeof n=="string"||typeof n=="number"?e.setAttribute(a,n):e.setAttribute(a,n.toString())}}}if(o)for(let r in o){let n=o[r];if(r!=="children"&&!(r in t)){r=ne(r);let s=mt(r);s?e.removeEventListener(s[0],n,s[1]):r==="ref"?We.get(e)?.():e.removeAttribute(xt(e,r))}}},Vo=(e,t)=>{t[E][0]=0,J.push([e,t]);let o=t.tag[Y]||t.tag,r=o.defaultProps?{...o.defaultProps,...t.props}:t.props;try{return[o.call(null,r)]}finally{J.pop()}},Et=(e,t,o,r,n)=>{e.vR?.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[E][1][Me]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(K(s))o.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let a=o.length;if(Et(s,t,o,r,n),s.s){for(let c=a;c<o.length;c++)o[c].s=!0;s.s=!1}}else o.push(s),s.vR?.length&&(r.push(...s.vR),delete s.vR)})},Ko=e=>{for(;e&&(e.tag===be||!e.e);)e=e.tag===be||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},kt=e=>{K(e)||(e[E]?.[1][Me]?.forEach(t=>t[2]?.()),We.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(kt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(ye.delete(e),Re.delete(e),delete e[E][3],e.a=!0)},qe=(e,t,o)=>{e.c=t,$t(e,t,o)},ht=(e,t)=>{if(t){for(let o=0,r=e.length;o<r;o++)if(e[o]===t)return o}},gt=Symbol(),$t=(e,t,o)=>{let r=[],n=[],s=[];Et(e,t,r,n,s),n.forEach(kt);let a=o?void 0:t.childNodes,c,d=null;if(o)c=-1;else if(!a.length)c=0;else{let u=ht(a,Ko(e.nN));u!==void 0?(d=a[u],c=u):c=ht(a,r.find(m=>m.tag!==be&&m.e)?.e)??-1,c===-1&&(o=!0)}for(let u=0,m=r.length;u<m;u++,c++){let l=r[u],x;if(l.s&&l.e)x=l.e,l.s=!1;else{let y=o||!l.e;K(l)?(l.e&&l.d&&(l.e.textContent=l.t),l.d=!1,x=l.e||=document.createTextNode(l.t)):(x=l.e||=l.n?document.createElementNS(l.n,l.tag):document.createElement(l.tag),zo(x,l.props,l.pP),$t(l,x,y),l.tag==="select"&&Ho(x,l.props))}l.tag===be?c--:o?x.parentNode||t.appendChild(x):a[c]!==x&&a[c-1]!==x&&(a[c+1]===x?t.appendChild(a[c]):t.insertBefore(x,d||a[c]||null))}if(e.pP&&(e.pP=void 0),s.length){let u=[],m=[];s.forEach(([,l,,x,y])=>{l&&u.push(l),x&&m.push(x),y?.()}),u.forEach(l=>l()),m.length&&requestAnimationFrame(()=>{m.forEach(l=>l())})}},Go=(e,t)=>!!(e&&e.length===t.length&&e.every((o,r)=>o[1]===t[r][1])),Re=new WeakMap,Oe=(e,t,o)=>{let r=!o&&t.pC;o&&(t.pC||=t.vC);let n;try{o||=typeof t.tag=="function"?Vo(e,t):Z(t.props.children),o[0]?.tag===""&&o[0][te]&&(n=o[0][te],e[5].push([e,n,t]));let s=r?[...t.pC]:t.vC?[...t.vC]:void 0,a=[],c;for(let d=0;d<o.length;d++){if(Array.isArray(o[d])){o.splice(d,1,...o[d].flat(1/0)),d--;continue}let u=Ct(o[d]);if(u){typeof u.tag=="function"&&!u.tag[ve]&&(z.length>0&&(u[E][2]=z.map(l=>[l,l.values.at(-1)])),e[5]?.length&&(u[E][3]=e[5].at(-1)));let m;if(s&&s.length){let l=s.findIndex(K(u)?x=>K(x):u.key!==void 0?x=>x.key===u.key&&x.tag===u.tag:x=>x.tag===u.tag);l!==-1&&(m=s[l],s.splice(l,1))}if(m)if(K(u))m.t!==u.t&&(m.t=u.t,m.d=!0),u=m;else{let l=m.pP=m.props;if(m.props=u.props,m.f||=u.f||t.f,typeof u.tag=="function"){let x=m[E][2];m[E][2]=u[E][2]||[],m[E][3]=u[E][3],!m.f&&((m.o||m)===u.o||m.tag[Te]?.(l,m.props))&&Go(x,m[E][2])&&(m.s=!0)}u=m}else if(!K(u)&&se){let l=I(se);l&&(u.n=l)}if(!K(u)&&!u.s&&(Oe(e,u),delete u.f),a.push(u),c&&!c.s&&!u.s)for(let l=c;l&&!K(l);l=l.vC?.at(-1))l.nN=u;c=u}}t.vR=r?[...t.vC,...s||[]]:s||[],t.vC=a,r&&delete t.pC}catch(s){if(t.f=!0,s===gt){if(n)return;throw s}let[a,c,d]=t[E]?.[3]||[];if(c){let u=()=>Se([0,!1,e[2]],d),m=Re.get(d)||[];m.push(u),Re.set(d,m);let l=c(s,()=>{let x=Re.get(d);if(x){let y=x.indexOf(u);if(y!==-1)return x.splice(y,1),u()}});if(l){if(e[0]===1)e[1]=!0;else if(Oe(e,d,[l]),(c.length===1||e!==a)&&d.c){qe(d,d.c,!1);return}throw gt}}throw s}finally{n&&e[5].pop()}},Ct=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[E]=[0,[]];else{let t=Uo[e.tag];t&&(se||=ce(""),e.props.children=[{tag:se,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},At=(e,t,o)=>{e.c===t&&(e.c=o,e.vC.forEach(r=>At(r,t,o)))},yt=(e,t)=>{t[E][2]?.forEach(([o,r])=>{o.values.push(r)});try{Oe(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[E][2]?.forEach(([o])=>{o.values.pop()}),(e[0]!==1||!e[1])&&qe(t,t.c,!1)},ye=new WeakMap,bt=[],Se=async(e,t)=>{e[5]||=[];let o=ye.get(t);o&&o[0](void 0);let r,n=new Promise(s=>r=s);if(ye.set(t,[r,()=>{e[2]?e[2](e,t,s=>{yt(s,t)}).then(()=>r(t)):(yt(e,t),r(t))}]),bt.length)bt.at(-1).add(t);else{await Promise.resolve();let s=ye.get(t);s&&(ye.delete(t),s[1]())}return n},Wo=(e,t)=>{let o=[];o[5]=[],o[4]=!0,Oe(o,e,void 0),o[4]=!1;let r=document.createDocumentFragment();qe(e,r,!0),At(e,r,t),t.replaceChildren(r)},Ye=(e,t)=>{Wo(Ct({tag:"",props:{children:e}}),t)};var Xe=(e,t,o)=>({tag:be,props:{children:e},key:o,e:t,p:1});var qo=0,Me=1,Yo=2,Xo=3;var Ze=new WeakMap,Je=(e,t)=>!e||!t||e.length!==t.length||t.some((o,r)=>o!==e[r]);var Zo;var vt=[];var we=e=>{let t=()=>typeof e=="function"?e():e,o=J.at(-1);if(!o)return[t(),()=>{}];let[,r]=o,n=r[E][1][qo]||=[],s=r[E][0]++;return n[s]||=[t(),a=>{let c=Zo,d=n[s];if(typeof a=="function"&&(a=a(d[0])),!Object.is(a,d[0]))if(d[0]=a,vt.length){let[u,m]=vt.at(-1);Promise.all([u===3?r:Se([u,!1,c],r),m]).then(([l])=>{if(!l||!(u===2||u===3))return;let x=l.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===l.vC&&Se([u===3?1:0,!1,c],l)})})})}else Se([0,!1,c],r)}]},Qe=(e,t,o)=>{let r=Q(a=>{s(c=>e(c,a))},[e]),[n,s]=we(()=>o?o(t):t);return[n,r]},Jo=(e,t,o)=>{let r=J.at(-1);if(!r)return;let[,n]=r,s=n[E][1][Me]||=[],a=n[E][0]++,[c,,d]=s[a]||=[];if(Je(c,o)){d&&d();let u=()=>{m[e]=void 0,m[2]=t()},m=[o,void 0,void 0,void 0,void 0];m[e]=u,s[a]=m}},et=(e,t)=>Jo(3,e,t);var Q=(e,t)=>{let o=J.at(-1);if(!o)return e;let[,r]=o,n=r[E][1][Yo]||=[],s=r[E][0]++,a=n[s];return Je(a?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var tt=e=>{let t=Ze.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(o=>Ze.set(e,[o]),o=>Ze.set(e,[void 0,o])),e},ot=(e,t)=>{let o=J.at(-1);if(!o)return e();let[,r]=o,n=r[E][1][Xo]||=[],s=r[E][0]++,a=n[s];return Je(a?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Dt=ce({pending:!1,data:null,method:null,action:null}),Tt=new Set,Lt=e=>{Tt.add(e),e.finally(()=>Tt.delete(e))};var rt=(e,t)=>ot(()=>o=>{let r;e&&(typeof e=="function"?r=e(o)||(()=>{e(null)}):e&&"current"in e&&(e.current=o,r=()=>{e.current=null}));let n=t(o);return()=>{n?.(),r?.()}},[e]),jt=Object.create(null),_t=Object.create(null),Ee=(e,t,o,r,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:a,onError:c,precedence:d,blocking:u,...m}=t,l=null,x=!1,y=re[e],b=Le(e,r),T=w=>w.getAttribute("rel")==="stylesheet"&&w.getAttribute(V)!==null,D;if(b){let w=s.querySelectorAll(e);e:for(let $ of w)if(!(e==="link"&&!T($))){for(let S of y)if($.getAttribute(S)===t[S]){l=$;break e}}if(!l){let $=y.reduce((S,A)=>t[A]===void 0?S:`${S}-${A}-${t[A]}`,e);x=!_t[$],l=_t[$]||=(()=>{let S=document.createElement(e);for(let A of y)t[A]!==void 0&&S.setAttribute(A,t[A]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else D=s.querySelectorAll(e);d=r?d??"":void 0,r&&(m[V]=d);let U=Q(w=>{if(b){if(e==="link"&&d!==void 0){let S=!1;for(let A of s.querySelectorAll(e)){let P=A.getAttribute(V);if(P===null){s.insertBefore(w,A);return}if(S&&P!==d){s.insertBefore(w,A);return}P===d&&(S=!0)}s.appendChild(w);return}let $=!1;for(let S of s.querySelectorAll(e)){if($&&S.getAttribute(V)!==d){s.insertBefore(w,S);return}S.getAttribute(V)===d&&($=!0)}s.appendChild(w)}else if(e==="link")s.contains(w)||s.appendChild(w);else if(D){let $=!1;for(let S of D)if(S===w){$=!0;break}$||s.insertBefore(w,s.contains(D[0])?D[0]:s.querySelector(e)),D=void 0}},[b,d,e]),q=rt(t.ref,w=>{let $=y[0];if(o===2&&(w.innerHTML=""),(x||D)&&U(w),!c&&!a||!$)return;let S=jt[w.getAttribute($)]||=new Promise((A,P)=>{w.addEventListener("load",A),w.addEventListener("error",P)});a&&(S=S.then(a)),c&&(S=S.catch(c)),S.catch(()=>{})});if(n&&u==="render"){let w=re[e][0];if(w&&t[w]){let $=t[w],S=jt[$]||=new Promise((A,P)=>{U(l),l.addEventListener("load",A),l.addEventListener("error",P)});tt(S)}}let _={tag:e,type:e,props:{...m,ref:q},ref:q};return _.p=o,l&&(_.e=l),Xe(_,s)},Qo=e=>{let t=St();return(t&&I(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:Ee("title",e,void 0,!1,!1)},er=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:Ee("script",e,1,!1,!0),tr=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,Ee("style",e,2,!0,!0)),or=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:Ee("link",e,1,De(e),!0),rr=e=>Ee("meta",e,void 0,!1,!1),Rt=Symbol(),nr=e=>{let{action:t,...o}=e;typeof t!="function"&&(o.action=t);let[r,n]=we([null,!1]),s=Q(async u=>{let m=u.isTrusted?t:u.detail[Rt];if(typeof m!="function")return;u.preventDefault();let l=new FormData(u.target);n([l,!0]);let x=m(l);x instanceof Promise&&(Lt(x),await x),n([null,!0])},[]),a=rt(e.ref,u=>(u.addEventListener("submit",s),()=>{u.removeEventListener("submit",s)})),[c,d]=r;return r[1]=!1,{tag:Dt,props:{value:{pending:c!==null,data:c,method:c?"post":null,action:c?t:null},children:{tag:"form",props:{...o,ref:a},type:"form",ref:a}},f:d}},Ot=(e,{formAction:t,...o})=>{if(typeof t=="function"){let r=Q(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Rt]:t}}))},[]);o.ref=rt(o.ref,n=>(n.addEventListener("click",r),()=>{n.removeEventListener("click",r)}))}return{tag:e,props:o,type:e,ref:o.ref}},ir=e=>Ot("input",e),sr=e=>Ot("button",e);Object.assign(fe,{title:Qo,script:er,style:tr,link:or,meta:rr,form:nr,input:ir,button:sr});var Pe={screen:"landing",loadingContext:null,user:null,apps:[],lastUsedAppId:null,error:null};var It=(e,t)=>{switch(t.type){case"INIT_SESSION_CHECK":return{...e,screen:"loading",loadingContext:"authenticating"};case"NO_SESSION":return{...e,screen:"landing",loadingContext:null,error:null};case"SESSION_EXPIRED":return{...e,screen:"landing",loadingContext:null,user:null,error:{type:"session",title:t.title,message:t.message}};case"AUTH_START":return{...e,screen:"loading",loadingContext:"authenticating",error:null};case"AUTH_CALLBACK_SUCCESS":{let{user:o,apps:r,lastUsedAppId:n}=t;return r.length===0?{...e,screen:"hub",loadingContext:null,user:o,apps:r,lastUsedAppId:null,error:null}:r.length===1?{...e,screen:"redirect",loadingContext:null,user:o,apps:r,lastUsedAppId:r[0].id,error:null}:{...e,screen:"hub",loadingContext:null,user:o,apps:r,lastUsedAppId:n,error:null}}case"AUTH_CALLBACK_FAILURE":return{...e,screen:"landing",loadingContext:null,error:{type:"auth",title:t.title,message:t.message}};case"LOAD_PERMISSIONS_START":return{...e,screen:"loading",loadingContext:"loading-permissions",error:null};case"LOAD_PERMISSIONS_SUCCESS":{let{apps:o,lastUsedAppId:r}=t;return o.length===1?{...e,screen:"redirect",loadingContext:null,apps:o,lastUsedAppId:o[0].id}:{...e,screen:"hub",loadingContext:null,apps:o,lastUsedAppId:r}}case"LOAD_PERMISSIONS_FAILURE":return{...e,screen:"hub",loadingContext:null,error:{type:"network",title:t.title,message:t.message}};case"SELECT_APP":return{...e,screen:"loading",loadingContext:"entering-app",lastUsedAppId:t.appId};case"LOGOUT_START":return{...e,screen:"loading",loadingContext:"authenticating"};case"LOGOUT_COMPLETE":return{...Pe,screen:"landing"}}},Bt=e=>e.screen==="redirect"&&e.apps.length===1?e.apps[0]??null:null,Nt=(e,t)=>`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`;var v={landingTitle:"ACDG",landingTagline:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio",landingButton:"Entrar na plataforma",landingFooter:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o",authErrorTitle:"Falha na autentica\xE7\xE3o",authErrorDesc:"N\xE3o foi poss\xEDvel concluir o login. Verifique suas credenciais ou entre em contato com o suporte.",sessionExpiredTitle:"Sess\xE3o expirada",sessionExpiredDesc:"Sua sess\xE3o expirou por inatividade. Fa\xE7a login novamente para continuar.",greeting:(e,t)=>`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`,hubSubtitle:"Selecione um m\xF3dulo para continuar",lastUsedLabel:"\xDALTIMO ACESSADO",allModulesLabel:e=>e===0?"NENHUM M\xD3DULO":e===1?"SEU M\xD3DULO":`TODOS OS M\xD3DULOS (${e})`,logoutButton:"Sair",emptyTitle:"Nenhum m\xF3dulo dispon\xEDvel",emptyDesc:"Sua conta ainda n\xE3o tem acesso a nenhum m\xF3dulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permiss\xF5es necess\xE1rias.",emptyContactAdmin:"Falar com o administrador",emptyContactEmail:"admin@acdg.gov.br",emptyContactSubject:"Solicita\xE7\xE3o de acesso - ACDG",emptyBackToStart:"Voltar ao in\xEDcio",networkErrorTitle:"Erro ao carregar m\xF3dulos",networkErrorDesc:"N\xE3o foi poss\xEDvel carregar suas permiss\xF5es. Verifique sua conex\xE3o com a internet e tente novamente.",networkErrorRetry:"Tentar novamente",redirectTitle:e=>`Entrando em ${e}...`,redirectSubtitle:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente.",redirectCancel:"N\xE3o \xE9 o que esperava? Voltar",loadingAuth:"Autenticando...",loadingPermissions:"Carregando m\xF3dulos...",loadingApp:e=>`Entrando em ${e}...`};var ee=":-hono-global",lr=new RegExp(`^${ee}{(.*)}$`),Ie="hono-css",G=Symbol(),L=Symbol(),M=Symbol(),F=Symbol(),Be=Symbol(),Ft=Symbol(),Ks=Symbol();var Ut=e=>{let t=0,o=11;for(;t<e.length;)o=101*o+e.charCodeAt(t++)>>>0;return"css-"+o},Ht=e=>e.trim().replace(/\s+/g,"-"),zt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),cr=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),pr=e=>zt(e)&&!cr.has(e.toLowerCase()),Vt=e=>{console.warn(`Invalid slug: ${e}`)},fr=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),dr=new RegExp(["("+fr+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),ur=e=>e.replace(dr,(t,o,r,n,s)=>o||r||n||s||""),Kt=(e,t)=>{let o=[],r=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let a=0,c=e.length;a<c;a++){s+=e[a];let d=t[a];if(!(typeof d=="boolean"||d===null||d===void 0)){Array.isArray(d)||(d=[d]);for(let u=0,m=d.length;u<m;u++){let l=d[u];if(!(typeof l=="boolean"||l===null||l===void 0))if(typeof l=="string")/([\\"'\/])/.test(l)?s+=l.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=l;else if(typeof l=="number")s+=l;else if(l[Ft])s+=l[Ft];else if(l[L].startsWith("@keyframes "))o.push(l),s+=` ${l[L].substring(11)} `;else{if(e[a+1]?.match(/^\s*{/))o.push(l),l=`.${l[L]}`;else{o.push(...l[F]),r.push(...l[Be]),l=l[M];let x=l.length;if(x>0){let y=l[x-1];y!==";"&&y!=="}"&&(l+=";")}}s+=`${l||""}`}}}}return[n,ur(s),o,r]},ae=(e,t,o,r)=>{let[n,s,a,c]=Kt(e,t),d=lr.exec(s);d&&(s=d[1]);let u=Ut(n+s),m;if(o){let y=o(u,Ht(n),s);y&&(zt(y)?m=y:(r||Vt)(y))}let l=(d?ee:"")+(m||u),x=(d?a.map(y=>y[L]):[l,...c]).join(" ");return{[G]:l,[L]:x,[M]:s,[F]:a,[Be]:c}},Ne=e=>{for(let t=0,o=e.length;t<o;t++){let r=e[t];typeof r=="string"&&(e[t]={[G]:"",[L]:"",[M]:"",[F]:[],[Be]:[r]})}return e},Fe=(e,t,o,r)=>{let[n,s]=Kt(e,t),a=Ut(n+s),c;if(o){let d=o(a,Ht(n),s);d&&(pr(d)?c=d:(r||Vt)(d))}return{[G]:"",[L]:`@keyframes ${c||a}`,[M]:s,[F]:[],[Be]:[]}},mr=0,Ue=(e,t,o,r)=>{e||(e=[`/* h-v-t ${mr++} */`]);let n=Array.isArray(e)?ae(e,t,o,r):e,s=n[L],a=ae(["view-transition-name:",""],[s],o,r);return n[L]=ee+n[L],n[M]=n[M].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),a[L]=a[G]=s,a[F]=[...n[F],n],a};var hr=e=>{let t=[],o=0,r=0;for(let n=0,s=e.length;n<s;n++){let a=e[n];if(a==="'"||a==='"'){let c=a;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===c)break}continue}if(a==="{"){r++;continue}if(a==="}"){r--,r===0&&(t.push(e.slice(o,n+1)),o=n+1);continue}}return t},nt=({id:e})=>{let t,o=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),r=(a,c)=>{let[d,u]=o();if(!d||!u){Promise.resolve().then(()=>{if(!o()[0])throw new Error("style sheet not found");r(a,c)});return}u.has(a)||(u.add(a),(a.startsWith(ee)?hr(c):[`${a[0]==="@"?"":"."}${a}{${c}}`]).forEach(m=>{d.insertRule(m,d.cssRules.length)}))};return[{toString(){let a=this[G];return r(a,this[M]),this[F].forEach(({[L]:c,[M]:d})=>{r(c,d)}),this[L]}},({children:a,nonce:c})=>({tag:"style",props:{id:e,nonce:c,children:a&&(Array.isArray(a)?a:[a]).map(d=>d[M])}})]},gr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,n]=nt({id:e}),s=m=>(m.toString=r.toString,m),a=(m,...l)=>s(ae(m,l,t,o));return{css:a,cx:(...m)=>(m=Ne(m),a(Array(m.length).fill(""),...m)),keyframes:(m,...l)=>Fe(m,l,t,o),viewTransition:(m,...l)=>s(Ue(m,l,t,o)),Style:n}},ke=gr({id:Ie}),qs=ke.css,Ys=ke.cx,Xs=ke.keyframes,Zs=ke.viewTransition,Js=ke.Style;var yr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,n]=nt({id:e}),s=new WeakMap,a=new WeakMap,c=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),d=b=>{let T=({buffer:_,context:w})=>{let[$,S]=s.get(w),A=Object.keys($);if(!A.length)return;let P="";if(A.forEach(X=>{S[X]=!0,P+=X.startsWith(ee)?$[X]:`${X[0]==="@"?"":"."}${X}{${$[X]}}`}),s.set(w,[{},S]),_&&c.test(_[0])){_[0]=_[0].replace(c,(X,Eo,ko)=>`${Eo}${P}${ko}`);return}let st=a.get(w),at=`<script${st?` nonce="${st}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(P)}<\/script>`;if(_){_[0]=`${at}${_[0]}`;return}return Promise.resolve(at)},D=({context:_})=>{s.has(_)||s.set(_,[{},{}]);let[w,$]=s.get(_),S=!0;if($[b[G]]||(S=!1,w[b[G]]=b[M]),b[F].forEach(({[L]:A,[M]:P})=>{$[A]||(S=!1,w[A]=P)}),!S)return Promise.resolve(j("",[T]))},U=new String(b[L]);Object.assign(U,b),U.isEscaped=!0,U.callbacks=[D];let q=Promise.resolve(U);return Object.assign(q,b),q.toString=r.toString,q},u=(b,...T)=>d(ae(b,T,t,o)),m=(...b)=>(b=Ne(b),u(Array(b.length).fill(""),...b)),l=(b,...T)=>Fe(b,T,t,o),x=(b,...T)=>d(Ue(b,T,t,o)),y=({children:b,nonce:T}={})=>j(`<style id="${e}"${T?` nonce="${T}"`:""}>${b?b[M]:""}</style>`,[({context:D})=>{a.set(D,T)}]);return y[Y]=n,{css:u,cx:m,keyframes:l,viewTransition:x,Style:y}},$e=yr({id:Ie}),p=$e.css,it=$e.cx,N=$e.keyframes,ia=$e.viewTransition,sa=$e.Style;var f={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},C=(e,t)=>{let o=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${o}, ${r}, ${n}, ${t})`},h={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},g={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},B={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},pa={button:p`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:p`box-shadow: -8px 0 40px ${C(f.textPrimary,.3)};`,fab:p`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:p`box-shadow: 0 24px 80px ${f.inputLine};`,modal:p`
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
`,ma=p`
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
`;var Yt=p`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`,br=p`
  ${Yt}
  width: 600px;
  height: 600px;
  background: ${C(f.primary,.15)};
  top: -200px;
  right: -150px;
  animation: ${Gt} 12s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 400px;
    height: 400px;
  }
`,Sr=p`
  ${Yt}
  width: 500px;
  height: 500px;
  background: ${C(f.background,.1)};
  bottom: -150px;
  left: -100px;
  animation: ${Wt} 15s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 350px;
    height: 350px;
  }
`,Xt=()=>i(ie,{children:[i("div",{class:br,"aria-hidden":"true"}),i("div",{class:Sr,"aria-hidden":"true"})]});var wr=p`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${f.background};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`,Er=p`
  font-family: ${h.satoshi};
  font-size: 36px;
  font-weight: ${g.bold};
  color: ${f.backgroundDark};
  line-height: 1;
`,Zt=()=>i("div",{class:wr,"aria-hidden":"true",children:i("span",{class:Er,children:"A"})});var kr=p`
  font-family: ${h.satoshi};
  font-size: 40px;
  font-weight: ${g.bold};
  color: ${f.textOnDark};
  line-height: 1.2;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 28px;
  }
`,Jt=()=>i("h1",{class:kr,children:"ACDG"});var $r=p`
  font-family: ${h.playfair};
  font-size: 18px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${C(f.textOnDark,.82)};
  line-height: 1.6;
  max-width: 380px;
  text-align: center;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 16px;
  }
`,Qt=()=>i("p",{class:$r,children:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio"});var Cr=N`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,Ar=p`
  max-width: 440px;
  width: 90%;
  padding: 16px 20px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${Cr} 500ms ease both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,vr=p`
  background: rgba(166, 41, 13, 0.15);
  border: 1px solid rgba(166, 41, 13, 0.25);
`,Tr=p`
  background: rgba(201, 150, 10, 0.15);
  border: 1px solid rgba(201, 150, 10, 0.25);
`,Dr=p`color: #FF8A7A;`,Lr=p`color: #FFD066;`,jr=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.semibold};
  margin: 0 0 4px;
  line-height: 1.3;
`,_r=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: rgba(242, 226, 196, 0.8);
  line-height: 1.5;
  margin: 0;
`,eo=p`
  flex-shrink: 0;
  margin-top: 2px;
`,Rr=({color:e})=>i("svg",{class:eo,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),i("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),i("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),Or=({color:e})=>i("svg",{class:eo,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("circle",{cx:"12",cy:"12",r:"10"}),i("polyline",{points:"12 6 12 12 16 14"})]}),to=({type:e,title:t,description:o})=>{let r=e==="error",n=r?"#FF8A7A":"#FFD066";return i("div",{class:it(Ar,r?vr:Tr),role:"alert","aria-live":"assertive",children:[r?i(Rr,{color:n}):i(Or,{color:n}),i("div",{children:[i("p",{class:it(jr,r?Dr:Lr),children:t}),i("p",{class:_r,children:o})]})]})};var Mr=N`
  to { transform: rotate(360deg); }
`,Pr=p`
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
`,Ir=p`
  width: 20px;
  height: 20px;
  border: 2px solid ${f.backgroundDark};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${Mr} 0.8s linear infinite;
`,oo=({onClick:e,loading:t})=>i("button",{class:Pr,onClick:e,disabled:t,type:"button","aria-label":"Entrar na plataforma",children:t?i("div",{class:Ir,"aria-hidden":"true"}):"Entrar na plataforma"});var Br=p`
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${h.satoshi};
  font-size: 13px;
  color: ${C(f.textOnDark,.6)};
  letter-spacing: 0.5px;
`,ro=()=>i("footer",{class:Br,children:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o"});var Nr=p`
  ${le}
  background: ${f.backgroundDark};
`,Fr=p`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 1;
  padding: 40px;
  max-width: 520px;
  animation: ${k} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  @media (max-width: 599px) {
    padding: 24px;
    max-width: 100%;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,no=({alert:e,onLogin:t,loading:o})=>i("main",{class:Nr,"aria-label":"P\xE1gina de login",children:[i(Xt,{}),i("div",{class:Fr,children:[i(Zt,{}),i(Jt,{}),i(Qt,{}),e?i(to,{type:e.type,title:e.title,description:e.description}):null,i(oo,{onClick:t,loading:o})]}),i(ro,{})]});var Ur=N`
  to { transform: rotate(360deg); }
`,Hr=p`
  width: 32px;
  height: 32px;
  border: 3px solid ${f.inputLine};
  border-top-color: ${f.primary};
  border-radius: 50%;
  animation: ${Ur} 0.8s linear infinite;
`,io=()=>i("div",{class:Hr});var zr=p`
  ${le}
  background: ${f.background};
  gap: 24px;
`,Vr=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  margin: 0;
`,Kr=(e,t)=>{switch(e){case"authenticating":return"Autenticando...";case"loading-permissions":return"Carregando m\xF3dulos...";case"entering-app":return`Entrando em ${t??""}...`}},Ce=({context:e,appName:t})=>i("div",{class:zr,role:"status","aria-live":"polite","aria-busy":"true",children:[i(io,{}),i("p",{class:Vr,children:Kr(e,t)})]});var Gr=p`
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
`,Wr=p`
  display: flex;
  align-items: center;
  gap: 10px;
`,qr=p`
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
`,Yr=p`
  font-family: ${h.satoshi};
  font-size: 18px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
`,Xr=p`
  display: flex;
  align-items: center;
  gap: 12px;
`,Zr=p`
  display: none;
  text-align: right;
  @media (min-width: ${W.mobile}px) {
    display: block;
  }
`,Jr=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.medium};
  color: ${f.textPrimary};
  margin: 0;
`,Qr=p`
  font-family: ${h.satoshi};
  font-size: 12px;
  color: ${f.textMuted};
  margin: 0;
`,en=p`
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
`,tn=p`
  background: none;
  border: 1px solid ${f.inputLine};
  padding: 8px 18px;
  border-radius: ${R.pill};
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${g.semibold};
  color: ${C(f.textPrimary,.7)};
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
`,so=({user:e,onLogout:t})=>i("header",{class:Gr,children:[i("div",{class:Wr,children:[i("div",{class:qr,children:"A"}),i("span",{class:Yr,children:"ACDG"})]}),i("div",{class:Xr,children:[i("div",{class:Zr,children:[i("p",{class:Jr,children:e.name}),i("p",{class:Qr,children:e.role})]}),i("div",{class:en,"aria-hidden":"true",children:e.initials}),i("button",{class:tn,onClick:t,"aria-label":"Sair da plataforma",children:"Sair"})]})]});var on=p`
  text-align: center;
  margin-bottom: 48px;
  animation: ${k} 600ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,rn=p`
  font-family: ${h.satoshi};
  font-size: 24px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 8px;
  @media (min-width: ${W.mobile}px) {
    font-size: 32px;
  }
`,nn=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  margin: 0;
`,ao=({greeting:e,subtitle:t})=>i("div",{class:on,children:[i("h1",{class:rn,children:e}),i("p",{class:nn,children:t})]});var sn=p`
  width: 100%;
  max-width: 720px;
  margin-bottom: 40px;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,an=p`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${g.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${f.textMuted};
  margin: 0 0 12px;
`,ln=p`
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
`,cn=p`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,pn=p`
  flex: 1;
  min-width: 0;
`,fn=p`
  font-family: ${h.satoshi};
  font-size: 16px;
  font-weight: ${g.semibold};
  color: ${f.textOnDark};
  margin: 0 0 4px;
`,dn=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${C(f.textOnDark,.75)};
  margin: 0;
  line-height: 1.5;
`,un=p`
  font-size: 20px;
  color: ${C(f.textOnDark,.75)};
  flex-shrink: 0;
  transition: transform 200ms ease, color 200ms ease;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,mn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},lo=({app:e,label:t,onClick:o})=>i("div",{class:sn,children:[i("p",{class:an,children:t}),i("div",{class:ln,role:"button",tabindex:0,"aria-label":`${e.name}: ${e.description}`,onClick:o,onKeyDown:mn(o),children:[i("div",{class:cn,style:{background:C(e.color,.15)},"aria-hidden":"true",children:i("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("div",{class:pn,children:[i("h3",{class:fn,children:e.name}),i("p",{class:dn,children:e.description})]}),i("span",{class:un,"data-arrow":!0,"aria-hidden":"true",children:"\u2192"})]})]});var xn=p`
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
`,hn=p`
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${B[3]};
`,gn=p`
  font-family: ${h.satoshi};
  font-size: 15px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 6px;
`,yn=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  margin: 0;
  line-height: 1.5;
`,bn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},co=({app:e,index:t,onClick:o})=>{let r=350+t*70;return i("article",{class:xn,style:{animation:`${k} 500ms ease ${r}ms both`},role:"button",tabindex:0,"aria-label":`Abrir ${e.name}`,onClick:o,onKeyDown:bn(o),children:[i("div",{class:hn,style:{background:C(e.color,.12)},"aria-hidden":"true",children:i("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("h3",{class:gn,children:e.name}),i("p",{class:yn,children:e.description}),i("div",{"data-accent":!0,style:{position:"absolute",top:0,left:0,right:0,height:"3px",background:e.color,opacity:.5,transition:"opacity 200ms ease",borderRadius:`${R.card} ${R.card} 0 0`},"aria-hidden":"true"})]})};var Sn=p`
  width: 100%;
  max-width: 720px;
`,wn=p`
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
`,En=p`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${B[3]};
  width: 100%;
  @media (min-width: ${W.mobile}px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`,po=({apps:e,label:t,onSelectApp:o})=>i("nav",{class:Sn,"aria-label":"M\xF3dulos dispon\xEDveis",children:[i("h2",{class:wn,children:t}),i("div",{class:En,children:e.map((r,n)=>i(co,{app:r,index:n,onClick:()=>o(r.id)},r.id))})]});var kn=p`
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,$n=p`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${C(f.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,Cn=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 8px;
`,An=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,vn=p`
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
`,Tn=p`
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
`,fo=({strings:e,mailtoHref:t,onLogout:o})=>i("div",{class:kn,children:[i("div",{class:$n,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:f.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),i("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]})}),i("h2",{class:Cn,children:e.emptyTitle}),i("p",{class:An,children:e.emptyDesc}),i("a",{class:vn,href:t,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"2",y:"4",width:"20",height:"16",rx:"2"}),i("path",{d:"M22 4L12 13 2 4"})]}),e.emptyContactAdmin]}),i("button",{class:Tn,onClick:o,children:e.emptyBackToStart})]});var Dn=p`
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Ln=p`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${C(f.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,jn=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0 0 8px;
`,_n=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${f.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,Rn=p`
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
`,uo=({strings:e,onRetry:t})=>i("div",{class:Dn,children:[i("div",{class:Ln,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:f.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("line",{x1:"1",y1:"1",x2:"23",y2:"23"}),i("path",{d:"M16.72 11.06A10.94 10.94 0 0 1 19 12.55"}),i("path",{d:"M5 12.55a10.94 10.94 0 0 1 5.17-2.39"}),i("path",{d:"M10.71 5.05A16 16 0 0 1 22.56 9"}),i("path",{d:"M1.42 9a15.91 15.91 0 0 1 4.7-2.88"}),i("path",{d:"M8.53 16.11a6 6 0 0 1 6.95 0"}),i("line",{x1:"12",y1:"20",x2:"12.01",y2:"20"})]})}),i("h2",{class:jn,children:e.networkErrorTitle}),i("p",{class:_n,children:e.networkErrorDesc}),i("button",{class:Rn,onClick:t,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("polyline",{points:"23 4 23 10 17 10"}),i("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),e.networkErrorRetry]})]});var On=p`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${f.background};
`,Mn=p`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  @media (min-width: ${W.mobile}px) {
    padding: 48px;
  }
`,mo=e=>{let{user:t,apps:o,lastUsedAppId:r,errorType:n,greeting:s,subtitle:a,allModulesLabel:c,lastUsedLabel:d}=e,{emptyStrings:u,emptyMailtoHref:m,networkStrings:l,onSelectApp:x,onLogout:y,onRetry:b}=e;if(!t)return i(Ce,{context:"loading-permissions"});let T=r!==null&&o.length>1?o.find(q=>q.id===r)??null:null,D=n==="network",U=o.length>0;return i("div",{class:On,children:[i(so,{user:t,onLogout:y}),i("main",{class:Mn,children:[i(ao,{greeting:s,subtitle:a}),D?i(uo,{strings:l,onRetry:b}):U?i(ie,{children:[T?i(lo,{app:T,label:d,onClick:()=>x(T.id)}):null,i(po,{apps:o,label:c,onSelectApp:x})]}):i(fo,{strings:u,mailtoHref:m,onLogout:y})]})]})};var Pn=p`
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
`,xo=({color:e})=>i("div",{class:Pn,style:{background:C(e,.12)},children:i("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2"}),i("path",{d:"M9 3v18"}),i("path",{d:"M14 9l3 3-3 3"})]})});var In=p`
  width: 200px;
  height: 4px;
  background: ${f.inputLine};
  border-radius: 2px;
  overflow: hidden;
  animation: ${k} 500ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Bn=p`
  height: 100%;
  background: ${f.primary};
  border-radius: 2px;
  animation: ${qt} 2s ease-in-out 400ms both;
  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    animation: none;
  }
`,ho=()=>i("div",{class:In,role:"progressbar","aria-valuemin":0,"aria-valuemax":100,children:i("div",{class:Bn})});var Nn=p`
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
`,go=({onClick:e})=>i("button",{class:Nn,onClick:e,type:"button",children:"N\xE3o \xE9 o que esperava? Voltar"});var Fn=p`
  ${le}
  background: ${f.background};
  gap: 20px;
  text-align: center;
`,Un=p`
  font-family: ${h.satoshi};
  font-size: 22px;
  font-weight: ${g.bold};
  color: ${f.textPrimary};
  margin: 0;
  animation: ${k} 500ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Hn=p`
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
`,yo=({app:e,onCancel:t})=>i("div",{class:Fn,role:"status","aria-live":"polite",children:[i(xo,{color:e.color}),i("h2",{class:Un,children:`Entrando em ${e.name}...`}),i("p",{class:Hn,children:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente."}),i(ho,{}),i(go,{onClick:t})]});var zn=`mailto:${v.emptyContactEmail}?subject=${encodeURIComponent(v.emptyContactSubject)}`,bo=async e=>{try{let t=await fetch("/api/v1/me",{credentials:"same-origin",headers:{"X-Requested-With":"XMLHttpRequest"}});if(t.status===401){e({type:"NO_SESSION"});return}if(!t.ok){e({type:"LOAD_PERMISSIONS_FAILURE",title:v.networkErrorTitle,message:v.networkErrorDesc});return}let o=await t.json(),r=o.data??o;e({type:"AUTH_CALLBACK_SUCCESS",user:{name:r.name,firstName:r.firstName,initials:r.initials,role:r.role},apps:r.apps,lastUsedAppId:r.lastUsedAppId??null})}catch{e({type:"LOAD_PERMISSIONS_FAILURE",title:v.networkErrorTitle,message:v.networkErrorDesc})}},So=()=>{let[e,t]=Qe(It,Pe);et(()=>{let d=new URLSearchParams(globalThis.location.search);if(d.get("error")){t({type:"AUTH_CALLBACK_FAILURE",title:v.authErrorTitle,message:v.authErrorDesc});return}if(d.get("reason")==="session_expired"){t({type:"SESSION_EXPIRED",title:v.sessionExpiredTitle,message:v.sessionExpiredDesc});return}t({type:"INIT_SESSION_CHECK"}),bo(t)},[]);let o=()=>{globalThis.location.href="/auth/login"},r=()=>{globalThis.location.href="/auth/logout"},n=()=>{t({type:"NO_SESSION"})},s=d=>{t({type:"SELECT_APP",appId:d});let u=e.apps.find(m=>m.id===d);u&&setTimeout(()=>{globalThis.location.href=u.route},1500)},a=()=>{t({type:"LOAD_PERMISSIONS_START"}),bo(t)},c=e.error?{type:e.error.type==="session"?"warning":"error",title:e.error.title,description:e.error.message}:null;switch(e.screen){case"landing":return i(no,{alert:c,onLogin:o});case"loading":{let d=e.lastUsedAppId?e.apps.find(u=>u.id===e.lastUsedAppId):null;return i(Ce,{context:e.loadingContext??"authenticating",appName:d?.name})}case"hub":return i(mo,{user:e.user,apps:e.apps,lastUsedAppId:e.lastUsedAppId,errorType:e.error?.type??null,greeting:e.user?Nt(e.user.firstName,new Date().getHours()):"",subtitle:v.hubSubtitle,allModulesLabel:v.allModulesLabel(e.apps.length),lastUsedLabel:v.lastUsedLabel,emptyStrings:{emptyTitle:v.emptyTitle,emptyDesc:v.emptyDesc,emptyContactAdmin:v.emptyContactAdmin,emptyBackToStart:v.emptyBackToStart},emptyMailtoHref:zn,networkStrings:{networkErrorTitle:v.networkErrorTitle,networkErrorDesc:v.networkErrorDesc,networkErrorRetry:v.networkErrorRetry},onSelectApp:s,onLogout:r,onRetry:a});case"redirect":{let d=Bt(e);return d?i(yo,{app:d,onCancel:n}):i(Ce,{context:"authenticating"})}}};var wo=document.getElementById("auth-hub-app");wo&&Ye(i(So,{}),wo);
