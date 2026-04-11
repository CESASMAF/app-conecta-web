var ko=Object.defineProperty;var Co=(e,t)=>{for(var o in t)ko(e,o,{get:t[o],enumerable:!0})};var $o={Stringify:1,BeforeStream:2,Stream:3},j=(e,t)=>{let o=new String(e);return o.isEscaped=!0,o.callbacks=t,o},Ao=/[&<>'"]/,$e=async(e,t)=>{let o="";t||=[];let r=await Promise.all(e);for(let n=r.length-1;o+=r[n],n--,!(n<0);n--){let s=r[n];typeof s=="object"&&t.push(...s.callbacks||[]);let a=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??a)o+=s;else{let c=[o];F(s,c),o=c[0]}}return j(o,t)},F=(e,t)=>{let o=e.search(Ao);if(o===-1){t[0]+=e;return}let r,n,s=0;for(n=o;n<e.length;n++){switch(e.charCodeAt(n)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(s,n)+r,s=n+1}t[0]+=e.substring(s,n)},Ue=e=>{let t=e.callbacks;if(!t?.length)return e;let o=[e],r={};return t.forEach(n=>n({phase:$o.Stringify,buffer:o,context:r})),o[0]};var K=Symbol("RENDERER"),ee=Symbol("ERROR_HANDLER"),E=Symbol("STASH"),Ae=Symbol("INTERNAL"),ve=Symbol("MEMO"),te=Symbol("PERMALINK");var He=e=>(e[Ae]=!0,e);var ze=e=>({value:t,children:o})=>{if(!o)return;let r={children:[{tag:He(()=>{e.push(t)}),props:{}}]};Array.isArray(o)?r.children.push(...o.flat()):r.children.push(o),r.children.push({tag:He(()=>{e.pop()}),props:{}});let n={tag:"",props:r,type:""};return n[ee]=s=>{throw e.pop(),s},n},le=e=>{let t=[e],o=ze(t);return o.values=t,o.Provider=o,U.push(o),o};var U=[],at=e=>{let t=[e],o=r=>{t.push(r.value);let n;try{n=r.children?(Array.isArray(r.children)?new ce("",{},r.children):r.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>j(s,s.callbacks)):(t.pop(),j(n))};return o.values=t,o.Provider=o,o[K]=ze(t),U.push(o),o},M=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},pe={},H="data-precedence",Te=e=>e.rel==="stylesheet"&&"precedence"in e,_e=(e,t)=>e==="link"?t:oe[e].length>0;var ue={};Co(ue,{button:()=>Oo,form:()=>Lo,input:()=>Ro,link:()=>jo,meta:()=>Do,script:()=>To,style:()=>_o,title:()=>vo});var Y=e=>Array.isArray(e)?e:[e];var lt=new WeakMap,ct=(e,t,o,r)=>({buffer:n,context:s})=>{if(!n)return;let a=lt.get(s)||{};lt.set(s,a);let c=a[e]||=[],f=!1,u=oe[e],m=_e(e,r!==void 0);if(m){e:for(let[,l]of c)if(!(e==="link"&&!(l.rel==="stylesheet"&&l[H]!==void 0))){for(let x of u)if((l?.[x]??null)===o?.[x]){f=!0;break e}}}if(f?n[0]=n[0].replaceAll(t,""):m||e==="link"?c.push([t,o,r]):c.unshift([t,o,r]),n[0].indexOf("</head>")!==-1){let l;if(e==="link"||r!==void 0){let x=[];l=c.map(([y,,S],_)=>{if(S===void 0)return[y,Number.MAX_SAFE_INTEGER,_];let D=x.indexOf(S);return D===-1&&(x.push(S),D=x.length-1),[y,D,_]}).sort((y,S)=>y[1]-S[1]||y[2]-S[2]).map(([y])=>y)}else l=c.map(([x])=>x);l.forEach(x=>{n[0]=n[0].replaceAll(x,"")}),n[0]=n[0].replace(/(?=<\/head>)/,l.join(""))}},fe=(e,t,o)=>j(new O(e,o,Y(t??[])).toString()),de=(e,t,o,r)=>{if("itemProp"in o)return fe(e,t,o);let{precedence:n,blocking:s,...a}=o;n=r?n??"":void 0,r&&(a[H]=n);let c=new O(e,a,Y(t||[])).toString();return c instanceof Promise?c.then(f=>j(c,[...f.callbacks||[],ct(e,f,a,n)])):j(c,[ct(e,c,a,n)])},vo=({children:e,...t})=>{let o=je();if(o){let r=M(o);if(r==="svg"||r==="head")return new O("title",t,Y(e??[]))}return de("title",e,t,!1)},To=({children:e,...t})=>{let o=je();return["src","async"].some(r=>!t[r])||o&&M(o)==="head"?fe("script",e,t):de("script",e,t,!1)},_o=({children:e,...t})=>["href","precedence"].every(o=>o in t)?(t["data-href"]=t.href,delete t.href,de("style",e,t,!0)):fe("style",e,t),jo=({children:e,...t})=>["onLoad","onError"].some(o=>o in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?fe("link",e,t):de("link",e,t,Te(t)),Do=({children:e,...t})=>{let o=je();return o&&M(o)==="head"?fe("meta",e,t):de("meta",e,t,!1)},pt=(e,{children:t,...o})=>new O(e,o,Y(t??[])),Lo=e=>(typeof e.action=="function"&&(e.action=te in e.action?e.action[te]:void 0),pt("form",e)),ft=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=te in t.formAction?t.formAction[te]:void 0),pt(e,t)),Ro=e=>ft("input",e),Oo=e=>ft("button",e);var Io=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),re=e=>Io.get(e)||e,me=(e,t)=>{for(let[o,r]of Object.entries(e)){let n=o[0]==="-"||!/[A-Z]/.test(o)?o:o.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,r==null?null:typeof r=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}};var he,je=()=>he,Po=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Mo=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Bo=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ve=(e,t)=>{for(let o=0,r=e.length;o<r;o++){let n=e[o];if(typeof n=="string")F(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):Ve(n,t)}}},O=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,o,r){this.tag=t,this.props=o,this.children=r}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([o,r])=>{o.values.push(r)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([o])=>{o.values.pop()})}return t.length===1?"callbacks"in t?Ue(j(t[0],t.callbacks)).toString():t[0]:$e(t,t.callbacks)}toStringToBuffer(t){let o=this.tag,r=this.props,{children:n}=this;t[0]+=`<${o}`;let s=he&&M(he)==="svg"?a=>Po(re(a)):a=>re(a);for(let[a,c]of Object.entries(r))if(a=s(a),a!=="children"){if(a==="style"&&typeof c=="object"){let f="";me(c,(u,m)=>{m!=null&&(f+=`${f?";":""}${u}:${m}`)}),t[0]+=' style="',F(f,t),t[0]+='"'}else if(typeof c=="string")t[0]+=` ${a}="`,F(c,t),t[0]+='"';else if(c!=null)if(typeof c=="number"||c.isEscaped)t[0]+=` ${a}="${c}"`;else if(typeof c=="boolean"&&Bo.includes(a))c&&(t[0]+=` ${a}=""`);else if(a==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[j(c.__html)]}else if(c instanceof Promise)t[0]+=` ${a}="`,t.unshift('"',c);else if(typeof c=="function"){if(!a.startsWith("on")&&a!=="ref")throw new Error(`Invalid prop '${a}' of type 'function' supplied to '${o}'.`)}else t[0]+=` ${a}="`,F(c.toString(),t),t[0]+='"'}if(Mo.includes(o)&&n.length===0){t[0]+="/>";return}t[0]+=">",Ve(n,t),t[0]+=`</${o}>`}},xe=class extends O{toStringToBuffer(t){let{children:o}=this,r={...this.props};o.length&&(r.children=o.length===1?o[0]:o);let n=this.tag.call(null,r);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(U.length===0)t.unshift("",n);else{let s=U.map(a=>[a,a.values.at(-1)]);t.unshift("",n.then(a=>(a instanceof O&&(a.localContexts=s),a)))}else n instanceof O?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):F(n,t)}},ce=class extends O{toStringToBuffer(t){Ve(this.children,t)}};var dt=!1,De=(e,t,o)=>{if(!dt){for(let r in pe)ue[r][K]=pe[r];dt=!0}return typeof e=="function"?new xe(e,t,o):ue[e]?new xe(ue[e],t,o):e==="svg"||e==="head"?(he||=at(""),new O(e,t,[new xe(he,{value:e},o)])):new O(e,t,o)};var ne=({children:e})=>new ce("",{children:e},Array.isArray(e)?e:e?[e]:[]);function i(e,t,o){let r;if(!t||!("children"in t))r=De(e,t,[]);else{let n=t.children;r=Array.isArray(n)?De(e,t,n):De(e,t,[n])}return r.key=o,r}var ye="_hp",No={Change:"Input",DoubleClick:"DblClick"},Fo={svg:"2000/svg",math:"1998/Math/MathML"},X=[],Ke=new WeakMap,ie,bt=()=>ie,z=e=>"t"in e,Ge={onClick:["click",!1]},ut=e=>{if(!e.startsWith("on"))return;if(Ge[e])return Ge[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,o,r]=t;return Ge[e]=[(No[o]||o).toLowerCase(),!!r]}},mt=(e,t)=>ie&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,St=e=>e==null||e===!1?null:e,Uo=(e,t)=>{"value"in t&&(e.value=St(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Ho=(e,t,o)=>{t||={};for(let r in t){let n=t[r];if(r!=="children"&&(!o||o[r]!==n)){r=re(r);let s=ut(r);if(s){if(o?.[r]!==n&&(o&&e.removeEventListener(s[0],o[r],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${r}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(r==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(r==="ref"){let a;typeof n=="function"?a=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,a=()=>n.current=null),Ke.set(e,a)}else if(r==="style"){let a=e.style;typeof n=="string"?a.cssText=n:(a.cssText="",n!=null&&me(n,a.setProperty.bind(a)))}else{if(r==="value"){let c=e.nodeName;if(c==="SELECT")continue;if((c==="INPUT"||c==="TEXTAREA")&&(e.value=St(n),c==="TEXTAREA")){e.textContent=n;continue}}else(r==="checked"&&e.nodeName==="INPUT"||r==="selected"&&e.nodeName==="OPTION")&&(e[r]=n);let a=mt(e,r);n==null||n===!1?e.removeAttribute(a):n===!0?e.setAttribute(a,""):typeof n=="string"||typeof n=="number"?e.setAttribute(a,n):e.setAttribute(a,n.toString())}}}if(o)for(let r in o){let n=o[r];if(r!=="children"&&!(r in t)){r=re(r);let s=ut(r);s?e.removeEventListener(s[0],n,s[1]):r==="ref"?Ke.get(e)?.():e.removeAttribute(mt(e,r))}}},zo=(e,t)=>{t[E][0]=0,X.push([e,t]);let o=t.tag[K]||t.tag,r=o.defaultProps?{...o.defaultProps,...t.props}:t.props;try{return[o.call(null,r)]}finally{X.pop()}},wt=(e,t,o,r,n)=>{e.vR?.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[E][1][Oe]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(z(s))o.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let a=o.length;if(wt(s,t,o,r,n),s.s){for(let c=a;c<o.length;c++)o[c].s=!0;s.s=!1}}else o.push(s),s.vR?.length&&(r.push(...s.vR),delete s.vR)})},Vo=e=>{for(;e&&(e.tag===ye||!e.e);)e=e.tag===ye||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Et=e=>{z(e)||(e[E]?.[1][Oe]?.forEach(t=>t[2]?.()),Ke.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Et)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(ge.delete(e),Le.delete(e),delete e[E][3],e.a=!0)},We=(e,t,o)=>{e.c=t,kt(e,t,o)},xt=(e,t)=>{if(t){for(let o=0,r=e.length;o<r;o++)if(e[o]===t)return o}},ht=Symbol(),kt=(e,t,o)=>{let r=[],n=[],s=[];wt(e,t,r,n,s),n.forEach(Et);let a=o?void 0:t.childNodes,c,f=null;if(o)c=-1;else if(!a.length)c=0;else{let u=xt(a,Vo(e.nN));u!==void 0?(f=a[u],c=u):c=xt(a,r.find(m=>m.tag!==ye&&m.e)?.e)??-1,c===-1&&(o=!0)}for(let u=0,m=r.length;u<m;u++,c++){let l=r[u],x;if(l.s&&l.e)x=l.e,l.s=!1;else{let y=o||!l.e;z(l)?(l.e&&l.d&&(l.e.textContent=l.t),l.d=!1,x=l.e||=document.createTextNode(l.t)):(x=l.e||=l.n?document.createElementNS(l.n,l.tag):document.createElement(l.tag),Ho(x,l.props,l.pP),kt(l,x,y),l.tag==="select"&&Uo(x,l.props))}l.tag===ye?c--:o?x.parentNode||t.appendChild(x):a[c]!==x&&a[c-1]!==x&&(a[c+1]===x?t.appendChild(a[c]):t.insertBefore(x,f||a[c]||null))}if(e.pP&&(e.pP=void 0),s.length){let u=[],m=[];s.forEach(([,l,,x,y])=>{l&&u.push(l),x&&m.push(x),y?.()}),u.forEach(l=>l()),m.length&&requestAnimationFrame(()=>{m.forEach(l=>l())})}},Go=(e,t)=>!!(e&&e.length===t.length&&e.every((o,r)=>o[1]===t[r][1])),Le=new WeakMap,Re=(e,t,o)=>{let r=!o&&t.pC;o&&(t.pC||=t.vC);let n;try{o||=typeof t.tag=="function"?zo(e,t):Y(t.props.children),o[0]?.tag===""&&o[0][ee]&&(n=o[0][ee],e[5].push([e,n,t]));let s=r?[...t.pC]:t.vC?[...t.vC]:void 0,a=[],c;for(let f=0;f<o.length;f++){if(Array.isArray(o[f])){o.splice(f,1,...o[f].flat(1/0)),f--;continue}let u=Ct(o[f]);if(u){typeof u.tag=="function"&&!u.tag[Ae]&&(U.length>0&&(u[E][2]=U.map(l=>[l,l.values.at(-1)])),e[5]?.length&&(u[E][3]=e[5].at(-1)));let m;if(s&&s.length){let l=s.findIndex(z(u)?x=>z(x):u.key!==void 0?x=>x.key===u.key&&x.tag===u.tag:x=>x.tag===u.tag);l!==-1&&(m=s[l],s.splice(l,1))}if(m)if(z(u))m.t!==u.t&&(m.t=u.t,m.d=!0),u=m;else{let l=m.pP=m.props;if(m.props=u.props,m.f||=u.f||t.f,typeof u.tag=="function"){let x=m[E][2];m[E][2]=u[E][2]||[],m[E][3]=u[E][3],!m.f&&((m.o||m)===u.o||m.tag[ve]?.(l,m.props))&&Go(x,m[E][2])&&(m.s=!0)}u=m}else if(!z(u)&&ie){let l=M(ie);l&&(u.n=l)}if(!z(u)&&!u.s&&(Re(e,u),delete u.f),a.push(u),c&&!c.s&&!u.s)for(let l=c;l&&!z(l);l=l.vC?.at(-1))l.nN=u;c=u}}t.vR=r?[...t.vC,...s||[]]:s||[],t.vC=a,r&&delete t.pC}catch(s){if(t.f=!0,s===ht){if(n)return;throw s}let[a,c,f]=t[E]?.[3]||[];if(c){let u=()=>be([0,!1,e[2]],f),m=Le.get(f)||[];m.push(u),Le.set(f,m);let l=c(s,()=>{let x=Le.get(f);if(x){let y=x.indexOf(u);if(y!==-1)return x.splice(y,1),u()}});if(l){if(e[0]===1)e[1]=!0;else if(Re(e,f,[l]),(c.length===1||e!==a)&&f.c){We(f,f.c,!1);return}throw ht}}throw s}finally{n&&e[5].pop()}},Ct=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[E]=[0,[]];else{let t=Fo[e.tag];t&&(ie||=le(""),e.props.children=[{tag:ie,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},$t=(e,t,o)=>{e.c===t&&(e.c=o,e.vC.forEach(r=>$t(r,t,o)))},gt=(e,t)=>{t[E][2]?.forEach(([o,r])=>{o.values.push(r)});try{Re(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[E][2]?.forEach(([o])=>{o.values.pop()}),(e[0]!==1||!e[1])&&We(t,t.c,!1)},ge=new WeakMap,yt=[],be=async(e,t)=>{e[5]||=[];let o=ge.get(t);o&&o[0](void 0);let r,n=new Promise(s=>r=s);if(ge.set(t,[r,()=>{e[2]?e[2](e,t,s=>{gt(s,t)}).then(()=>r(t)):(gt(e,t),r(t))}]),yt.length)yt.at(-1).add(t);else{await Promise.resolve();let s=ge.get(t);s&&(ge.delete(t),s[1]())}return n},Ko=(e,t)=>{let o=[];o[5]=[],o[4]=!0,Re(o,e,void 0),o[4]=!1;let r=document.createDocumentFragment();We(e,r,!0),$t(e,r,t),t.replaceChildren(r)},qe=(e,t)=>{Ko(Ct({tag:"",props:{children:e}}),t)};var Ye=(e,t,o)=>({tag:ye,props:{children:e},key:o,e:t,p:1});var Wo=0,Oe=1,qo=2,Yo=3;var Xe=new WeakMap,Ze=(e,t)=>!e||!t||e.length!==t.length||t.some((o,r)=>o!==e[r]);var Xo;var At=[];var Se=e=>{let t=()=>typeof e=="function"?e():e,o=X.at(-1);if(!o)return[t(),()=>{}];let[,r]=o,n=r[E][1][Wo]||=[],s=r[E][0]++;return n[s]||=[t(),a=>{let c=Xo,f=n[s];if(typeof a=="function"&&(a=a(f[0])),!Object.is(a,f[0]))if(f[0]=a,At.length){let[u,m]=At.at(-1);Promise.all([u===3?r:be([u,!1,c],r),m]).then(([l])=>{if(!l||!(u===2||u===3))return;let x=l.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===l.vC&&be([u===3?1:0,!1,c],l)})})})}else be([0,!1,c],r)}]},Je=(e,t,o)=>{let r=Z(a=>{s(c=>e(c,a))},[e]),[n,s]=Se(()=>o?o(t):t);return[n,r]},Zo=(e,t,o)=>{let r=X.at(-1);if(!r)return;let[,n]=r,s=n[E][1][Oe]||=[],a=n[E][0]++,[c,,f]=s[a]||=[];if(Ze(c,o)){f&&f();let u=()=>{m[e]=void 0,m[2]=t()},m=[o,void 0,void 0,void 0,void 0];m[e]=u,s[a]=m}},Qe=(e,t)=>Zo(3,e,t);var Z=(e,t)=>{let o=X.at(-1);if(!o)return e;let[,r]=o,n=r[E][1][qo]||=[],s=r[E][0]++,a=n[s];return Ze(a?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var et=e=>{let t=Xe.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(o=>Xe.set(e,[o]),o=>Xe.set(e,[void 0,o])),e},tt=(e,t)=>{let o=X.at(-1);if(!o)return e();let[,r]=o,n=r[E][1][Yo]||=[],s=r[E][0]++,a=n[s];return Ze(a?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Tt=le({pending:!1,data:null,method:null,action:null}),vt=new Set,_t=e=>{vt.add(e),e.finally(()=>vt.delete(e))};var ot=(e,t)=>tt(()=>o=>{let r;e&&(typeof e=="function"?r=e(o)||(()=>{e(null)}):e&&"current"in e&&(e.current=o,r=()=>{e.current=null}));let n=t(o);return()=>{n?.(),r?.()}},[e]),jt=Object.create(null),Dt=Object.create(null),we=(e,t,o,r,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:a,onError:c,precedence:f,blocking:u,...m}=t,l=null,x=!1,y=oe[e],S=_e(e,r),_=w=>w.getAttribute("rel")==="stylesheet"&&w.getAttribute(H)!==null,D;if(S){let w=s.querySelectorAll(e);e:for(let C of w)if(!(e==="link"&&!_(C))){for(let b of y)if(C.getAttribute(b)===t[b]){l=C;break e}}if(!l){let C=y.reduce((b,v)=>t[v]===void 0?b:`${b}-${v}-${t[v]}`,e);x=!Dt[C],l=Dt[C]||=(()=>{let b=document.createElement(e);for(let v of y)t[v]!==void 0&&b.setAttribute(v,t[v]);return t.rel&&b.setAttribute("rel",t.rel),b})()}}else D=s.querySelectorAll(e);f=r?f??"":void 0,r&&(m[H]=f);let W=Z(w=>{if(S){if(e==="link"&&f!==void 0){let b=!1;for(let v of s.querySelectorAll(e)){let P=v.getAttribute(H);if(P===null){s.insertBefore(w,v);return}if(b&&P!==f){s.insertBefore(w,v);return}P===f&&(b=!0)}s.appendChild(w);return}let C=!1;for(let b of s.querySelectorAll(e)){if(C&&b.getAttribute(H)!==f){s.insertBefore(w,b);return}b.getAttribute(H)===f&&(C=!0)}s.appendChild(w)}else if(e==="link")s.contains(w)||s.appendChild(w);else if(D){let C=!1;for(let b of D)if(b===w){C=!0;break}C||s.insertBefore(w,s.contains(D[0])?D[0]:s.querySelector(e)),D=void 0}},[S,f,e]),Q=ot(t.ref,w=>{let C=y[0];if(o===2&&(w.innerHTML=""),(x||D)&&W(w),!c&&!a||!C)return;let b=jt[w.getAttribute(C)]||=new Promise((v,P)=>{w.addEventListener("load",v),w.addEventListener("error",P)});a&&(b=b.then(a)),c&&(b=b.catch(c)),b.catch(()=>{})});if(n&&u==="render"){let w=oe[e][0];if(w&&t[w]){let C=t[w],b=jt[C]||=new Promise((v,P)=>{W(l),l.addEventListener("load",v),l.addEventListener("error",P)});et(b)}}let L={tag:e,type:e,props:{...m,ref:Q},ref:Q};return L.p=o,l&&(L.e=l),Ye(L,s)},Jo=e=>{let t=bt();return(t&&M(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:we("title",e,void 0,!1,!1)},Qo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:we("script",e,1,!1,!0),er=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,we("style",e,2,!0,!0)),tr=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:we("link",e,1,Te(e),!0),or=e=>we("meta",e,void 0,!1,!1),Lt=Symbol(),rr=e=>{let{action:t,...o}=e;typeof t!="function"&&(o.action=t);let[r,n]=Se([null,!1]),s=Z(async u=>{let m=u.isTrusted?t:u.detail[Lt];if(typeof m!="function")return;u.preventDefault();let l=new FormData(u.target);n([l,!0]);let x=m(l);x instanceof Promise&&(_t(x),await x),n([null,!0])},[]),a=ot(e.ref,u=>(u.addEventListener("submit",s),()=>{u.removeEventListener("submit",s)})),[c,f]=r;return r[1]=!1,{tag:Tt,props:{value:{pending:c!==null,data:c,method:c?"post":null,action:c?t:null},children:{tag:"form",props:{...o,ref:a},type:"form",ref:a}},f}},Rt=(e,{formAction:t,...o})=>{if(typeof t=="function"){let r=Z(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Lt]:t}}))},[]);o.ref=ot(o.ref,n=>(n.addEventListener("click",r),()=>{n.removeEventListener("click",r)}))}return{tag:e,props:o,type:e,ref:o.ref}},nr=e=>Rt("input",e),ir=e=>Rt("button",e);Object.assign(pe,{title:Jo,script:Qo,style:er,link:tr,meta:or,form:rr,input:nr,button:ir});var Ie={screen:"landing",loadingContext:null,user:null,apps:[],lastUsedAppId:null,error:null};var $={landingTitle:"ACDG",landingTagline:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio",landingButton:"Entrar na plataforma",landingFooter:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o",authErrorTitle:"Falha na autentica\xE7\xE3o",authErrorDesc:"N\xE3o foi poss\xEDvel concluir o login. Verifique suas credenciais ou entre em contato com o suporte.",sessionExpiredTitle:"Sess\xE3o expirada",sessionExpiredDesc:"Sua sess\xE3o expirou por inatividade. Fa\xE7a login novamente para continuar.",greeting:e=>{let t=new Date().getHours();return`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`},hubSubtitle:"Selecione um m\xF3dulo para continuar",lastUsedLabel:"\xDALTIMO ACESSADO",allModulesLabel:e=>e>1?`TODOS OS M\xD3DULOS (${e})`:"SEU M\xD3DULO",logoutButton:"Sair",emptyTitle:"Nenhum m\xF3dulo dispon\xEDvel",emptyDesc:"Sua conta ainda n\xE3o tem acesso a nenhum m\xF3dulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permiss\xF5es necess\xE1rias.",emptyContactAdmin:"Falar com o administrador",emptyContactEmail:"admin@acdg.gov.br",emptyContactSubject:"Solicita\xE7\xE3o de acesso - ACDG",emptyBackToStart:"Voltar ao in\xEDcio",networkErrorTitle:"Erro ao carregar m\xF3dulos",networkErrorDesc:"N\xE3o foi poss\xEDvel carregar suas permiss\xF5es. Verifique sua conex\xE3o com a internet e tente novamente.",networkErrorRetry:"Tentar novamente",redirectTitle:e=>`Entrando em ${e}...`,redirectSubtitle:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente.",redirectCancel:"N\xE3o \xE9 o que esperava? Voltar",loadingAuth:"Autenticando...",loadingPermissions:"Carregando m\xF3dulos...",loadingApp:e=>`Entrando em ${e}...`};var Pt=(e,t)=>{switch(t.type){case"INIT_SESSION_CHECK":return{...e,screen:"loading",loadingContext:"authenticating"};case"NO_SESSION":return{...e,screen:"landing",loadingContext:null,error:null};case"SESSION_EXPIRED":return{...e,screen:"landing",loadingContext:null,user:null,error:{type:"session",title:$.sessionExpiredTitle,message:$.sessionExpiredDesc}};case"AUTH_START":return{...e,screen:"loading",loadingContext:"authenticating",error:null};case"AUTH_CALLBACK_SUCCESS":{let{user:o,apps:r,lastUsedAppId:n}=t;return r.length===0?{...e,screen:"hub",loadingContext:null,user:o,apps:r,lastUsedAppId:null,error:null}:r.length===1?{...e,screen:"redirect",loadingContext:null,user:o,apps:r,lastUsedAppId:r[0].id,error:null}:{...e,screen:"hub",loadingContext:null,user:o,apps:r,lastUsedAppId:n,error:null}}case"AUTH_CALLBACK_FAILURE":return{...e,screen:"landing",loadingContext:null,error:{type:"auth",title:t.title,message:t.message}};case"LOAD_PERMISSIONS_START":return{...e,screen:"loading",loadingContext:"loading-permissions",error:null};case"LOAD_PERMISSIONS_SUCCESS":{let{apps:o,lastUsedAppId:r}=t;return o.length===1?{...e,screen:"redirect",loadingContext:null,apps:o,lastUsedAppId:o[0].id}:{...e,screen:"hub",loadingContext:null,apps:o,lastUsedAppId:r}}case"LOAD_PERMISSIONS_FAILURE":return{...e,screen:"hub",loadingContext:null,error:{type:"network",title:$.networkErrorTitle,message:$.networkErrorDesc}};case"SELECT_APP":return{...e,screen:"loading",loadingContext:"entering-app",lastUsedAppId:t.appId};case"LOGOUT_START":return{...e,screen:"loading",loadingContext:"authenticating"};case"LOGOUT_COMPLETE":return{...Ie,screen:"landing"}}},Mt=e=>e.screen==="redirect"&&e.apps.length===1?e.apps[0]??null:null,Bt=e=>{let t=new Date().getHours();return`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`};var J=":-hono-global",ar=new RegExp(`^${J}{(.*)}$`),Pe="hono-css",V=Symbol(),T=Symbol(),I=Symbol(),N=Symbol(),Me=Symbol(),Nt=Symbol(),Gs=Symbol();var Ft=e=>{let t=0,o=11;for(;t<e.length;)o=101*o+e.charCodeAt(t++)>>>0;return"css-"+o},Ut=e=>e.trim().replace(/\s+/g,"-"),Ht=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),lr=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),cr=e=>Ht(e)&&!lr.has(e.toLowerCase()),zt=e=>{console.warn(`Invalid slug: ${e}`)},pr=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),fr=new RegExp(["("+pr+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),dr=e=>e.replace(fr,(t,o,r,n,s)=>o||r||n||s||""),Vt=(e,t)=>{let o=[],r=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let a=0,c=e.length;a<c;a++){s+=e[a];let f=t[a];if(!(typeof f=="boolean"||f===null||f===void 0)){Array.isArray(f)||(f=[f]);for(let u=0,m=f.length;u<m;u++){let l=f[u];if(!(typeof l=="boolean"||l===null||l===void 0))if(typeof l=="string")/([\\"'\/])/.test(l)?s+=l.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=l;else if(typeof l=="number")s+=l;else if(l[Nt])s+=l[Nt];else if(l[T].startsWith("@keyframes "))o.push(l),s+=` ${l[T].substring(11)} `;else{if(e[a+1]?.match(/^\s*{/))o.push(l),l=`.${l[T]}`;else{o.push(...l[N]),r.push(...l[Me]),l=l[I];let x=l.length;if(x>0){let y=l[x-1];y!==";"&&y!=="}"&&(l+=";")}}s+=`${l||""}`}}}}return[n,dr(s),o,r]},se=(e,t,o,r)=>{let[n,s,a,c]=Vt(e,t),f=ar.exec(s);f&&(s=f[1]);let u=Ft(n+s),m;if(o){let y=o(u,Ut(n),s);y&&(Ht(y)?m=y:(r||zt)(y))}let l=(f?J:"")+(m||u),x=(f?a.map(y=>y[T]):[l,...c]).join(" ");return{[V]:l,[T]:x,[I]:s,[N]:a,[Me]:c}},Be=e=>{for(let t=0,o=e.length;t<o;t++){let r=e[t];typeof r=="string"&&(e[t]={[V]:"",[T]:"",[I]:"",[N]:[],[Me]:[r]})}return e},Ne=(e,t,o,r)=>{let[n,s]=Vt(e,t),a=Ft(n+s),c;if(o){let f=o(a,Ut(n),s);f&&(cr(f)?c=f:(r||zt)(f))}return{[V]:"",[T]:`@keyframes ${c||a}`,[I]:s,[N]:[],[Me]:[]}},ur=0,Fe=(e,t,o,r)=>{e||(e=[`/* h-v-t ${ur++} */`]);let n=Array.isArray(e)?se(e,t,o,r):e,s=n[T],a=se(["view-transition-name:",""],[s],o,r);return n[T]=J+n[T],n[I]=n[I].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),a[T]=a[V]=s,a[N]=[...n[N],n],a};var xr=e=>{let t=[],o=0,r=0;for(let n=0,s=e.length;n<s;n++){let a=e[n];if(a==="'"||a==='"'){let c=a;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===c)break}continue}if(a==="{"){r++;continue}if(a==="}"){r--,r===0&&(t.push(e.slice(o,n+1)),o=n+1);continue}}return t},rt=({id:e})=>{let t,o=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),r=(a,c)=>{let[f,u]=o();if(!f||!u){Promise.resolve().then(()=>{if(!o()[0])throw new Error("style sheet not found");r(a,c)});return}u.has(a)||(u.add(a),(a.startsWith(J)?xr(c):[`${a[0]==="@"?"":"."}${a}{${c}}`]).forEach(m=>{f.insertRule(m,f.cssRules.length)}))};return[{toString(){let a=this[V];return r(a,this[I]),this[N].forEach(({[T]:c,[I]:f})=>{r(c,f)}),this[T]}},({children:a,nonce:c})=>({tag:"style",props:{id:e,nonce:c,children:a&&(Array.isArray(a)?a:[a]).map(f=>f[I])}})]},hr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,n]=rt({id:e}),s=m=>(m.toString=r.toString,m),a=(m,...l)=>s(se(m,l,t,o));return{css:a,cx:(...m)=>(m=Be(m),a(Array(m.length).fill(""),...m)),keyframes:(m,...l)=>Ne(m,l,t,o),viewTransition:(m,...l)=>s(Fe(m,l,t,o)),Style:n}},Ee=hr({id:Pe}),qs=Ee.css,Ys=Ee.cx,Xs=Ee.keyframes,Zs=Ee.viewTransition,Js=Ee.Style;var gr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,n]=rt({id:e}),s=new WeakMap,a=new WeakMap,c=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),f=S=>{let _=({buffer:L,context:w})=>{let[C,b]=s.get(w),v=Object.keys(C);if(!v.length)return;let P="";if(v.forEach(q=>{b[q]=!0,P+=q.startsWith(J)?C[q]:`${q[0]==="@"?"":"."}${q}{${C[q]}}`}),s.set(w,[{},b]),L&&c.test(L[0])){L[0]=L[0].replace(c,(q,wo,Eo)=>`${wo}${P}${Eo}`);return}let it=a.get(w),st=`<script${it?` nonce="${it}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(P)}<\/script>`;if(L){L[0]=`${st}${L[0]}`;return}return Promise.resolve(st)},D=({context:L})=>{s.has(L)||s.set(L,[{},{}]);let[w,C]=s.get(L),b=!0;if(C[S[V]]||(b=!1,w[S[V]]=S[I]),S[N].forEach(({[T]:v,[I]:P})=>{C[v]||(b=!1,w[v]=P)}),!b)return Promise.resolve(j("",[_]))},W=new String(S[T]);Object.assign(W,S),W.isEscaped=!0,W.callbacks=[D];let Q=Promise.resolve(W);return Object.assign(Q,S),Q.toString=r.toString,Q},u=(S,..._)=>f(se(S,_,t,o)),m=(...S)=>(S=Be(S),u(Array(S.length).fill(""),...S)),l=(S,..._)=>Ne(S,_,t,o),x=(S,..._)=>f(Fe(S,_,t,o)),y=({children:S,nonce:_}={})=>j(`<style id="${e}"${_?` nonce="${_}"`:""}>${S?S[I]:""}</style>`,[({context:D})=>{a.set(D,_)}]);return y[K]=n,{css:u,cx:m,keyframes:l,viewTransition:x,Style:y}},ke=gr({id:Pe}),p=ke.css,nt=ke.cx,B=ke.keyframes,ia=ke.viewTransition,sa=ke.Style;var d={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},A=(e,t)=>{let o=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${o}, ${r}, ${n}, ${t})`},h={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},g={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"};var pa={button:p`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:p`box-shadow: -8px 0 40px ${A(d.textPrimary,.3)};`,fab:p`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:p`box-shadow: 0 24px 80px ${d.inputLine};`,modal:p`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},R={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"},G={mobile:600,tablet:1200};var k=B`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,Gt=B`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, 30px) scale(1.05); }
`,Kt=B`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, -20px) scale(1.08); }
`,Wt=B`
  from { width: 0; }
  to { width: 100%; }
`,ae=p`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: clip;
`,ua=p`
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
`;var qt=p`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`,yr=p`
  ${qt}
  width: 600px;
  height: 600px;
  background: ${A(d.primary,.15)};
  top: -200px;
  right: -150px;
  animation: ${Gt} 12s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 400px;
    height: 400px;
  }
`,br=p`
  ${qt}
  width: 500px;
  height: 500px;
  background: ${A(d.background,.1)};
  bottom: -150px;
  left: -100px;
  animation: ${Kt} 15s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 350px;
    height: 350px;
  }
`,Yt=()=>i(ne,{children:[i("div",{class:yr,"aria-hidden":"true"}),i("div",{class:br,"aria-hidden":"true"})]});var Sr=p`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${d.background};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`,wr=p`
  font-family: ${h.satoshi};
  font-size: 36px;
  font-weight: ${g.bold};
  color: ${d.backgroundDark};
  line-height: 1;
`,Xt=()=>i("div",{class:Sr,"aria-hidden":"true",children:i("span",{class:wr,children:"A"})});var Er=p`
  font-family: ${h.satoshi};
  font-size: 40px;
  font-weight: ${g.bold};
  color: ${d.textOnDark};
  line-height: 1.2;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 28px;
  }
`,Zt=()=>i("h1",{class:Er,children:"ACDG"});var kr=p`
  font-family: ${h.playfair};
  font-size: 18px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${A(d.textOnDark,.82)};
  line-height: 1.6;
  max-width: 380px;
  text-align: center;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 16px;
  }
`,Jt=()=>i("p",{class:kr,children:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio"});var Cr=B`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,$r=p`
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
`,Ar=p`
  background: rgba(166, 41, 13, 0.15);
  border: 1px solid rgba(166, 41, 13, 0.25);
`,vr=p`
  background: rgba(201, 150, 10, 0.15);
  border: 1px solid rgba(201, 150, 10, 0.25);
`,Tr=p`color: #FF8A7A;`,_r=p`color: #FFD066;`,jr=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.semibold};
  margin: 0 0 4px;
  line-height: 1.3;
`,Dr=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: rgba(242, 226, 196, 0.8);
  line-height: 1.5;
  margin: 0;
`,Qt=p`
  flex-shrink: 0;
  margin-top: 2px;
`,Lr=({color:e})=>i("svg",{class:Qt,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),i("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),i("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),Rr=({color:e})=>i("svg",{class:Qt,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("circle",{cx:"12",cy:"12",r:"10"}),i("polyline",{points:"12 6 12 12 16 14"})]}),eo=({type:e,title:t,description:o})=>{let r=e==="error",n=r?"#FF8A7A":"#FFD066";return i("div",{class:nt($r,r?Ar:vr),role:"alert","aria-live":"assertive",children:[r?i(Lr,{color:n}):i(Rr,{color:n}),i("div",{children:[i("p",{class:nt(jr,r?Tr:_r),children:t}),i("p",{class:Dr,children:o})]})]})};var Or=B`
  to { transform: rotate(360deg); }
`,Ir=p`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 48px;
  border-radius: ${R.pill};
  border: none;
  background: ${d.background};
  color: ${d.backgroundDark};
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
    outline: 2px solid ${d.background};
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
`,Pr=p`
  width: 20px;
  height: 20px;
  border: 2px solid ${d.backgroundDark};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${Or} 0.8s linear infinite;
`,to=({onClick:e,loading:t})=>i("button",{class:Ir,onClick:e,disabled:t,type:"button","aria-label":"Entrar na plataforma",children:t?i("div",{class:Pr,"aria-hidden":"true"}):"Entrar na plataforma"});var Mr=p`
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${h.satoshi};
  font-size: 13px;
  color: ${A(d.textOnDark,.6)};
  letter-spacing: 0.5px;
`,oo=()=>i("footer",{class:Mr,children:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o"});var Br=p`
  ${ae}
  background: ${d.backgroundDark};
`,Nr=p`
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
`,ro=({alert:e,onLogin:t,loading:o})=>i("main",{class:Br,"aria-label":"P\xE1gina de login",children:[i(Yt,{}),i("div",{class:Nr,children:[i(Xt,{}),i(Zt,{}),i(Jt,{}),e?i(eo,{type:e.type,title:e.title,description:e.description}):null,i(to,{onClick:t,loading:o})]}),i(oo,{})]});var Fr=B`
  to { transform: rotate(360deg); }
`,Ur=p`
  width: 32px;
  height: 32px;
  border: 3px solid ${d.inputLine};
  border-top-color: ${d.primary};
  border-radius: 50%;
  animation: ${Fr} 0.8s linear infinite;
`,no=()=>i("div",{class:Ur});var Hr=p`
  ${ae}
  background: ${d.background};
  gap: 24px;
`,zr=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${d.textMuted};
  margin: 0;
`,Vr=(e,t)=>{switch(e){case"authenticating":return"Autenticando...";case"loading-permissions":return"Carregando m\xF3dulos...";case"entering-app":return`Entrando em ${t??""}...`}},Ce=({context:e,appName:t})=>i("div",{class:Hr,role:"status","aria-live":"polite","aria-busy":"true",children:[i(no,{}),i("p",{class:zr,children:Vr(e,t)})]});var Gr=p`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
  flex-wrap: wrap;
  gap: 12px;
  animation: ${k} 500ms ease both;
  @media (min-width: ${G.mobile}px) {
    padding: 32px 48px 0;
    flex-wrap: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Kr=p`
  display: flex;
  align-items: center;
  gap: 10px;
`,Wr=p`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${d.backgroundDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${h.satoshi};
  font-size: 18px;
  font-weight: ${g.bold};
  color: ${d.textOnDark};
`,qr=p`
  font-family: ${h.satoshi};
  font-size: 18px;
  font-weight: ${g.bold};
  color: ${d.textPrimary};
`,Yr=p`
  display: flex;
  align-items: center;
  gap: 12px;
`,Xr=p`
  display: none;
  text-align: right;
  @media (min-width: ${G.mobile}px) {
    display: block;
  }
`,Zr=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.medium};
  color: ${d.textPrimary};
  margin: 0;
`,Jr=p`
  font-family: ${h.satoshi};
  font-size: 12px;
  color: ${d.textMuted};
  margin: 0;
`,Qr=p`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${d.backgroundDark};
  color: ${d.textOnDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${h.satoshi};
  font-size: 16px;
  font-weight: ${g.semibold};
`,en=p`
  background: none;
  border: 1px solid ${d.inputLine};
  padding: 8px 18px;
  border-radius: ${R.pill};
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${g.semibold};
  color: ${A(d.textPrimary,.7)};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${d.danger};
    color: ${d.danger};
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,io=({user:e,onLogout:t})=>i("header",{class:Gr,children:[i("div",{class:Kr,children:[i("div",{class:Wr,children:"A"}),i("span",{class:qr,children:"ACDG"})]}),i("div",{class:Yr,children:[i("div",{class:Xr,children:[i("p",{class:Zr,children:e.name}),i("p",{class:Jr,children:e.role})]}),i("div",{class:Qr,"aria-hidden":"true",children:e.initials}),i("button",{class:en,onClick:t,"aria-label":"Sair da plataforma",children:"Sair"})]})]});var tn=p`
  text-align: center;
  margin-bottom: 48px;
  animation: ${k} 600ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,on=p`
  font-family: ${h.satoshi};
  font-size: 24px;
  font-weight: ${g.bold};
  color: ${d.textPrimary};
  margin: 0 0 8px;
  @media (min-width: ${G.mobile}px) {
    font-size: 32px;
  }
`,rn=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${d.textMuted};
  margin: 0;
`,so=({greeting:e,subtitle:t})=>i("div",{class:tn,children:[i("h1",{class:on,children:e}),i("p",{class:rn,children:t})]});var nn=p`
  width: 100%;
  max-width: 720px;
  margin-bottom: 40px;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,sn=p`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${g.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${d.textMuted};
  margin: 0 0 12px;
`,an=p`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: ${d.backgroundDark};
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
    color: ${d.textOnDark};
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,ln=p`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,cn=p`
  flex: 1;
  min-width: 0;
`,pn=p`
  font-family: ${h.satoshi};
  font-size: 16px;
  font-weight: ${g.semibold};
  color: ${d.textOnDark};
  margin: 0 0 4px;
`,fn=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${A(d.textOnDark,.75)};
  margin: 0;
  line-height: 1.5;
`,dn=p`
  font-size: 20px;
  color: ${A(d.textOnDark,.75)};
  flex-shrink: 0;
  transition: transform 200ms ease, color 200ms ease;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,un=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},ao=({app:e,onClick:t})=>i("div",{class:nn,children:[i("p",{class:sn,children:$.lastUsedLabel}),i("div",{class:an,role:"button",tabindex:0,"aria-label":`${e.name}: ${e.description}`,onClick:t,onKeyDown:un(t),children:[i("div",{class:ln,style:{background:A(e.color,.15)},"aria-hidden":"true",children:i("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("div",{class:cn,children:[i("h3",{class:pn,children:e.name}),i("p",{class:fn,children:e.description})]}),i("span",{class:dn,"data-arrow":!0,"aria-hidden":"true",children:"\u2192"})]})]});var mn=p`
  position: relative;
  background: ${d.surface};
  border-radius: ${R.card};
  padding: 24px;
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
    border-color: ${d.inputLine};
  }
  &:hover [data-accent] {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
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
`,xn=p`
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`,hn=p`
  font-family: ${h.satoshi};
  font-size: 15px;
  font-weight: ${g.bold};
  color: ${d.textPrimary};
  margin: 0 0 6px;
`,gn=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${d.textMuted};
  margin: 0;
  line-height: 1.5;
`,yn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},lo=({app:e,index:t,onClick:o})=>{let r=350+t*70;return i("article",{class:mn,style:{animation:`${k} 500ms ease ${r}ms both`},role:"button",tabindex:0,"aria-label":`Abrir ${e.name}`,onClick:o,onKeyDown:yn(o),children:[i("div",{class:xn,style:{background:A(e.color,.12)},"aria-hidden":"true",children:i("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("h3",{class:hn,children:e.name}),i("p",{class:gn,children:e.description}),i("div",{"data-accent":!0,style:{position:"absolute",top:0,left:0,right:0,height:"3px",background:e.color,opacity:.5,transition:"opacity 200ms ease",borderRadius:`${R.card} ${R.card} 0 0`},"aria-hidden":"true"})]})};var bn=p`
  width: 100%;
  max-width: 720px;
`,Sn=p`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${g.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${d.textMuted};
  margin: 0 0 16px;
  animation: ${k} 600ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,wn=p`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  @media (min-width: ${G.mobile}px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`,co=({apps:e,label:t,onSelectApp:o})=>i("nav",{class:bn,"aria-label":"M\xF3dulos dispon\xEDveis",children:[i("p",{class:Sn,children:t}),i("div",{class:wn,children:e.map((r,n)=>i(lo,{app:r,index:n,onClick:()=>o(r.id)},r.id))})]});var En=p`
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,kn=p`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${A(d.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,Cn=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${d.textPrimary};
  margin: 0 0 8px;
`,$n=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${d.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,An=p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${R.pill};
  border: none;
  background: ${d.primary};
  color: white;
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
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,vn=p`
  display: block;
  margin: 12px auto 0;
  background: none;
  border: 1px solid ${d.inputLine};
  padding: 10px 24px;
  border-radius: ${R.pill};
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${g.semibold};
  color: ${d.textMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${d.textPrimary};
    color: ${d.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,Tn=`mailto:${$.emptyContactEmail}?subject=${encodeURIComponent($.emptyContactSubject)}`,po=({onLogout:e})=>i("div",{class:En,children:[i("div",{class:kn,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:d.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),i("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]})}),i("h2",{class:Cn,children:$.emptyTitle}),i("p",{class:$n,children:$.emptyDesc}),i("a",{class:An,href:Tn,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"2",y:"4",width:"20",height:"16",rx:"2"}),i("path",{d:"M22 4L12 13 2 4"})]}),$.emptyContactAdmin]}),i("button",{class:vn,onClick:e,children:$.emptyBackToStart})]});var _n=p`
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,jn=p`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${A(d.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,Dn=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${d.textPrimary};
  margin: 0 0 8px;
`,Ln=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${d.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,Rn=p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${R.pill};
  border: none;
  background: ${d.primary};
  color: white;
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.semibold};
  cursor: pointer;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,fo=({onRetry:e})=>i("div",{class:_n,children:[i("div",{class:jn,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:d.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("line",{x1:"1",y1:"1",x2:"23",y2:"23"}),i("path",{d:"M16.72 11.06A10.94 10.94 0 0 1 19 12.55"}),i("path",{d:"M5 12.55a10.94 10.94 0 0 1 5.17-2.39"}),i("path",{d:"M10.71 5.05A16 16 0 0 1 22.56 9"}),i("path",{d:"M1.42 9a15.91 15.91 0 0 1 4.7-2.88"}),i("path",{d:"M8.53 16.11a6 6 0 0 1 6.95 0"}),i("line",{x1:"12",y1:"20",x2:"12.01",y2:"20"})]})}),i("h2",{class:Dn,children:$.networkErrorTitle}),i("p",{class:Ln,children:$.networkErrorDesc}),i("button",{class:Rn,onClick:e,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("polyline",{points:"23 4 23 10 17 10"}),i("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),$.networkErrorRetry]})]});var On=p`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${d.background};
`,In=p`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  @media (min-width: ${G.mobile}px) {
    padding: 48px;
  }
`,uo=({state:e,onSelectApp:t,onLogout:o,onRetry:r})=>{let{user:n,apps:s,lastUsedAppId:a,error:c}=e;if(!n)return i(Ce,{context:"loading-permissions"});let f=a!==null&&s.length>1?s.find(x=>x.id===a)??null:null,u=c?.type==="network",m=s.length>0,l=Bt(n.firstName);return i("div",{class:On,children:[i(io,{user:n,onLogout:o}),i("main",{class:In,children:[i(so,{greeting:l,subtitle:$.hubSubtitle}),u?i(fo,{onRetry:r}):m?i(ne,{children:[f?i(ao,{app:f,onClick:()=>t(f.id)}):null,i(co,{apps:s,label:$.allModulesLabel(s.length),onSelectApp:t})]}):i(po,{onLogout:o})]})]})};var Pn=p`
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
`,mo=({color:e})=>i("div",{class:Pn,style:{background:A(e,.12)},children:i("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2"}),i("path",{d:"M9 3v18"}),i("path",{d:"M14 9l3 3-3 3"})]})});var Mn=p`
  width: 200px;
  height: 4px;
  background: ${d.inputLine};
  border-radius: 2px;
  overflow: hidden;
  animation: ${k} 500ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Bn=p`
  height: 100%;
  background: ${d.primary};
  border-radius: 2px;
  animation: ${Wt} 2s ease-in-out 400ms both;
  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    animation: none;
  }
`,xo=()=>i("div",{class:Mn,role:"progressbar","aria-valuemin":0,"aria-valuemax":100,children:i("div",{class:Bn})});var Nn=p`
  background: none;
  border: none;
  padding: 0;
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${d.textMuted};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  animation: ${k} 500ms ease 400ms both;
  &:hover {
    color: ${d.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,ho=({onClick:e})=>i("button",{class:Nn,onClick:e,type:"button",children:"N\xE3o \xE9 o que esperava? Voltar"});var Fn=p`
  ${ae}
  background: ${d.background};
  gap: 20px;
  text-align: center;
`,Un=p`
  font-family: ${h.satoshi};
  font-size: 22px;
  font-weight: ${g.bold};
  color: ${d.textPrimary};
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
  color: ${d.textMuted};
  margin: 0;
  animation: ${k} 500ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,go=({app:e,onCancel:t})=>i("div",{class:Fn,role:"status","aria-live":"polite",children:[i(mo,{color:e.color}),i("h2",{class:Un,children:`Entrando em ${e.name}...`}),i("p",{class:Hn,children:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente."}),i(xo,{}),i(ho,{onClick:t})]});var yo=async e=>{try{let t=await fetch("/api/v1/me",{credentials:"same-origin",headers:{"X-Requested-With":"XMLHttpRequest"}});if(t.status===401){e({type:"NO_SESSION"});return}if(!t.ok){e({type:"LOAD_PERMISSIONS_FAILURE"});return}let o=await t.json(),r=o.data??o;e({type:"AUTH_CALLBACK_SUCCESS",user:{name:r.name,firstName:r.firstName,initials:r.initials,role:r.role},apps:r.apps,lastUsedAppId:r.lastUsedAppId??null})}catch{e({type:"LOAD_PERMISSIONS_FAILURE"})}},bo=()=>{let[e,t]=Je(Pt,Ie);Qe(()=>{let f=new URLSearchParams(globalThis.location.search);if(f.get("error")){t({type:"AUTH_CALLBACK_FAILURE",title:$.authErrorTitle,message:$.authErrorDesc});return}if(f.get("reason")==="session_expired"){t({type:"SESSION_EXPIRED"});return}t({type:"INIT_SESSION_CHECK"}),yo(t)},[]);let o=()=>{globalThis.location.href="/auth/login"},r=()=>{globalThis.location.href="/auth/logout"},n=()=>{t({type:"NO_SESSION"})},s=f=>{t({type:"SELECT_APP",appId:f});let u=e.apps.find(m=>m.id===f);u&&setTimeout(()=>{globalThis.location.href=u.route},1500)},a=()=>{t({type:"LOAD_PERMISSIONS_START"}),yo(t)},c=e.error?{type:e.error.type==="session"?"warning":"error",title:e.error.title,description:e.error.message}:null;switch(e.screen){case"landing":return i(ro,{alert:c,onLogin:o});case"loading":{let f=e.lastUsedAppId?e.apps.find(u=>u.id===e.lastUsedAppId):null;return i(Ce,{context:e.loadingContext??"authenticating",appName:f?.name})}case"hub":return i(uo,{state:e,onSelectApp:s,onLogout:r,onRetry:a});case"redirect":{let f=Mt(e);return f?i(go,{app:f,onCancel:n}):i(Ce,{context:"authenticating"})}}};var So=document.getElementById("auth-hub-app");So&&qe(i(bo,{}),So);
