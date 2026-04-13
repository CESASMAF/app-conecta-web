var Fr=Object.defineProperty;var Vr=(e,t)=>{for(var r in t)Fr(e,r,{get:t[r],enumerable:!0})};var Hr={Stringify:1,BeforeStream:2,Stream:3},T=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Wr=/[&<>'"]/,$e=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let i=o.length-1;r+=o[i],i--,!(i<0);i--){let s=o[i];typeof s=="object"&&t.push(...s.callbacks||[]);let c=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??c)r+=s;else{let d=[r];B(s,d),r=d[0]}}return T(r,t)},B=(e,t)=>{let r=e.search(Wr);if(r===-1){t[0]+=e;return}let o,i,s=0;for(i=r;i<e.length;i++){switch(e.charCodeAt(i)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,i)+o,s=i+1}t[0]+=e.substring(s,i)},Be=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(i=>i({phase:Hr.Stringify,buffer:r,context:o})),r[0]};var G=Symbol("RENDERER"),ee=Symbol("ERROR_HANDLER"),E=Symbol("STASH"),Ee=Symbol("INTERNAL"),Ce=Symbol("MEMO"),te=Symbol("PERMALINK");var Fe=e=>(e[Ee]=!0,e);var Ve=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:Fe(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:Fe(()=>{e.pop()}),props:{}});let i={tag:"",props:o,type:""};return i[ee]=s=>{throw e.pop(),s},i},se=e=>{let t=[e],r=Ve(t);return r.values=t,r.Provider=r,F.push(r),r};var F=[],ft=e=>{let t=[e],r=o=>{t.push(o.value);let i;try{i=o.children?(Array.isArray(o.children)?new le("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return i instanceof Promise?i.finally(()=>t.pop()).then(s=>T(s,s.callbacks)):(t.pop(),T(i))};return r.values=t,r.Provider=r,r[G]=Ve(t),F.push(r),r},j=e=>e.values.at(-1);var re={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},ce={},V="data-precedence",ke=e=>e.rel==="stylesheet"&&"precedence"in e,Ae=(e,t)=>e==="link"?t:re[e].length>0;var pe={};Vr(pe,{button:()=>Jr,form:()=>Xr,input:()=>Zr,link:()=>Yr,meta:()=>qr,script:()=>Ur,style:()=>Kr,title:()=>Gr});var q=e=>Array.isArray(e)?e:[e];var ut=new WeakMap,gt=(e,t,r,o)=>({buffer:i,context:s})=>{if(!i)return;let c=ut.get(s)||{};ut.set(s,c);let d=c[e]||=[],f=!1,m=re[e],u=Ae(e,o!==void 0);if(u){e:for(let[,p]of d)if(!(e==="link"&&!(p.rel==="stylesheet"&&p[V]!==void 0))){for(let b of m)if((p?.[b]??null)===r?.[b]){f=!0;break e}}}if(f?i[0]=i[0].replaceAll(t,""):u||e==="link"?d.push([t,r,o]):d.unshift([t,r,o]),i[0].indexOf("</head>")!==-1){let p;if(e==="link"||o!==void 0){let b=[];p=d.map(([S,,w],D)=>{if(w===void 0)return[S,Number.MAX_SAFE_INTEGER,D];let O=b.indexOf(w);return O===-1&&(b.push(w),O=b.length-1),[S,O,D]}).sort((S,w)=>S[1]-w[1]||S[2]-w[2]).map(([S])=>S)}else p=d.map(([b])=>b);p.forEach(b=>{i[0]=i[0].replaceAll(b,"")}),i[0]=i[0].replace(/(?=<\/head>)/,p.join(""))}},me=(e,t,r)=>T(new N(e,r,q(t??[])).toString()),de=(e,t,r,o)=>{if("itemProp"in r)return me(e,t,r);let{precedence:i,blocking:s,...c}=r;i=o?i??"":void 0,o&&(c[V]=i);let d=new N(e,c,q(t||[])).toString();return d instanceof Promise?d.then(f=>T(d,[...f.callbacks||[],gt(e,f,c,i)])):T(d,[gt(e,d,c,i)])},Gr=({children:e,...t})=>{let r=Re();if(r){let o=j(r);if(o==="svg"||o==="head")return new N("title",t,q(e??[]))}return de("title",e,t,!1)},Ur=({children:e,...t})=>{let r=Re();return["src","async"].some(o=>!t[o])||r&&j(r)==="head"?me("script",e,t):de("script",e,t,!1)},Kr=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,de("style",e,t,!0)):me("style",e,t),Yr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?me("link",e,t):de("link",e,t,ke(t)),qr=({children:e,...t})=>{let r=Re();return r&&j(r)==="head"?me("meta",e,t):de("meta",e,t,!1)},ht=(e,{children:t,...r})=>new N(e,r,q(t??[])),Xr=e=>(typeof e.action=="function"&&(e.action=te in e.action?e.action[te]:void 0),ht("form",e)),bt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=te in t.formAction?t.formAction[te]:void 0),ht(e,t)),Zr=e=>bt("input",e),Jr=e=>bt("button",e);var Qr=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),oe=e=>Qr.get(e)||e,fe=(e,t)=>{for(let[r,o]of Object.entries(e)){let i=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(i,o==null?null:typeof o=="number"?i.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var ge,Re=()=>ge,eo=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,to=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],ro=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],He=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let i=e[r];if(typeof i=="string")B(i,t);else{if(typeof i=="boolean"||i===null||i===void 0)continue;i instanceof N?i.toStringToBuffer(t):typeof i=="number"||i.isEscaped?t[0]+=i:i instanceof Promise?t.unshift("",i):He(i,t)}}},N=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Be(T(t[0],t.callbacks)).toString():t[0]:$e(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:i}=this;t[0]+=`<${r}`;let s=ge&&j(ge)==="svg"?c=>eo(oe(c)):c=>oe(c);for(let[c,d]of Object.entries(o))if(c=s(c),c!=="children"){if(c==="style"&&typeof d=="object"){let f="";fe(d,(m,u)=>{u!=null&&(f+=`${f?";":""}${m}:${u}`)}),t[0]+=' style="',B(f,t),t[0]+='"'}else if(typeof d=="string")t[0]+=` ${c}="`,B(d,t),t[0]+='"';else if(d!=null)if(typeof d=="number"||d.isEscaped)t[0]+=` ${c}="${d}"`;else if(typeof d=="boolean"&&ro.includes(c))d&&(t[0]+=` ${c}=""`);else if(c==="dangerouslySetInnerHTML"){if(i.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");i=[T(d.__html)]}else if(d instanceof Promise)t[0]+=` ${c}="`,t.unshift('"',d);else if(typeof d=="function"){if(!c.startsWith("on")&&c!=="ref")throw new Error(`Invalid prop '${c}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${c}="`,B(d.toString(),t),t[0]+='"'}if(to.includes(r)&&i.length===0){t[0]+="/>";return}t[0]+=">",He(i,t),t[0]+=`</${r}>`}},ue=class extends N{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let i=this.tag.call(null,o);if(!(typeof i=="boolean"||i==null))if(i instanceof Promise)if(F.length===0)t.unshift("",i);else{let s=F.map(c=>[c,c.values.at(-1)]);t.unshift("",i.then(c=>(c instanceof N&&(c.localContexts=s),c)))}else i instanceof N?i.toStringToBuffer(t):typeof i=="number"||i.isEscaped?(t[0]+=i,i.callbacks&&(t.callbacks||=[],t.callbacks.push(...i.callbacks))):B(i,t)}},le=class extends N{toStringToBuffer(t){He(this.children,t)}};var xt=!1,De=(e,t,r)=>{if(!xt){for(let o in ce)pe[o][G]=ce[o];xt=!0}return typeof e=="function"?new ue(e,t,r):pe[e]?new ue(pe[e],t,r):e==="svg"||e==="head"?(ge||=ft(""),new N(e,t,[new ue(ge,{value:e},r)])):new N(e,t,r)};var U=({children:e})=>new le("",{children:e},Array.isArray(e)?e:e?[e]:[]);function n(e,t,r){let o;if(!t||!("children"in t))o=De(e,t,[]);else{let i=t.children;o=Array.isArray(i)?De(e,t,i):De(e,t,[i])}return o.key=r,o}var be="_hp",oo={Change:"Input",DoubleClick:"DblClick"},no={svg:"2000/svg",math:"1998/Math/MathML"},X=[],Ge=new WeakMap,ne,Ct=()=>ne,H=e=>"t"in e,We={onClick:["click",!1]},yt=e=>{if(!e.startsWith("on"))return;if(We[e])return We[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return We[e]=[(oo[r]||r).toLowerCase(),!!o]}},St=(e,t)=>ne&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,kt=e=>e==null||e===!1?null:e,io=(e,t)=>{"value"in t&&(e.value=kt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},ao=(e,t,r)=>{t||={};for(let o in t){let i=t[o];if(o!=="children"&&(!r||r[o]!==i)){o=oe(o);let s=yt(o);if(s){if(r?.[o]!==i&&(r&&e.removeEventListener(s[0],r[o],s[1]),i!=null)){if(typeof i!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],i,s[1])}}else if(o==="dangerouslySetInnerHTML"&&i)e.innerHTML=i.__html;else if(o==="ref"){let c;typeof i=="function"?c=i(e)||(()=>i(null)):i&&"current"in i&&(i.current=e,c=()=>i.current=null),Ge.set(e,c)}else if(o==="style"){let c=e.style;typeof i=="string"?c.cssText=i:(c.cssText="",i!=null&&fe(i,c.setProperty.bind(c)))}else{if(o==="value"){let d=e.nodeName;if(d==="SELECT")continue;if((d==="INPUT"||d==="TEXTAREA")&&(e.value=kt(i),d==="TEXTAREA")){e.textContent=i;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=i);let c=St(e,o);i==null||i===!1?e.removeAttribute(c):i===!0?e.setAttribute(c,""):typeof i=="string"||typeof i=="number"?e.setAttribute(c,i):e.setAttribute(c,i.toString())}}}if(r)for(let o in r){let i=r[o];if(o!=="children"&&!(o in t)){o=oe(o);let s=yt(o);s?e.removeEventListener(s[0],i,s[1]):o==="ref"?Ge.get(e)?.():e.removeAttribute(St(e,o))}}},so=(e,t)=>{t[E][0]=0,X.push([e,t]);let r=t.tag[G]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{X.pop()}},At=(e,t,r,o,i)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[E][1][Pe]?.forEach(s=>i.push(s)),e.vC.forEach(s=>{if(H(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let c=r.length;if(At(s,t,r,o,i),s.s){for(let d=c;d<r.length;d++)r[d].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},lo=e=>{for(;e&&(e.tag===be||!e.e);)e=e.tag===be||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Rt=e=>{H(e)||(e[E]?.[1][Pe]?.forEach(t=>t[2]?.()),Ge.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Rt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(he.delete(e),Te.delete(e),delete e[E][3],e.a=!0)},Ue=(e,t,r)=>{e.c=t,Dt(e,t,r)},vt=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},wt=Symbol(),Dt=(e,t,r)=>{let o=[],i=[],s=[];At(e,t,o,i,s),i.forEach(Rt);let c=r?void 0:t.childNodes,d,f=null;if(r)d=-1;else if(!c.length)d=0;else{let m=vt(c,lo(e.nN));m!==void 0?(f=c[m],d=m):d=vt(c,o.find(u=>u.tag!==be&&u.e)?.e)??-1,d===-1&&(r=!0)}for(let m=0,u=o.length;m<u;m++,d++){let p=o[m],b;if(p.s&&p.e)b=p.e,p.s=!1;else{let S=r||!p.e;H(p)?(p.e&&p.d&&(p.e.textContent=p.t),p.d=!1,b=p.e||=document.createTextNode(p.t)):(b=p.e||=p.n?document.createElementNS(p.n,p.tag):document.createElement(p.tag),ao(b,p.props,p.pP),Dt(p,b,S),p.tag==="select"&&io(b,p.props))}p.tag===be?d--:r?b.parentNode||t.appendChild(b):c[d]!==b&&c[d-1]!==b&&(c[d+1]===b?t.appendChild(c[d]):t.insertBefore(b,f||c[d]||null))}if(e.pP&&(e.pP=void 0),s.length){let m=[],u=[];s.forEach(([,p,,b,S])=>{p&&m.push(p),b&&u.push(b),S?.()}),m.forEach(p=>p()),u.length&&requestAnimationFrame(()=>{u.forEach(p=>p())})}},co=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Te=new WeakMap,Oe=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let i;try{r||=typeof t.tag=="function"?so(e,t):q(t.props.children),r[0]?.tag===""&&r[0][ee]&&(i=r[0][ee],e[5].push([e,i,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,c=[],d;for(let f=0;f<r.length;f++){if(Array.isArray(r[f])){r.splice(f,1,...r[f].flat(1/0)),f--;continue}let m=Tt(r[f]);if(m){typeof m.tag=="function"&&!m.tag[Ee]&&(F.length>0&&(m[E][2]=F.map(p=>[p,p.values.at(-1)])),e[5]?.length&&(m[E][3]=e[5].at(-1)));let u;if(s&&s.length){let p=s.findIndex(H(m)?b=>H(b):m.key!==void 0?b=>b.key===m.key&&b.tag===m.tag:b=>b.tag===m.tag);p!==-1&&(u=s[p],s.splice(p,1))}if(u)if(H(m))u.t!==m.t&&(u.t=m.t,u.d=!0),m=u;else{let p=u.pP=u.props;if(u.props=m.props,u.f||=m.f||t.f,typeof m.tag=="function"){let b=u[E][2];u[E][2]=m[E][2]||[],u[E][3]=m[E][3],!u.f&&((u.o||u)===m.o||u.tag[Ce]?.(p,u.props))&&co(b,u[E][2])&&(u.s=!0)}m=u}else if(!H(m)&&ne){let p=j(ne);p&&(m.n=p)}if(!H(m)&&!m.s&&(Oe(e,m),delete m.f),c.push(m),d&&!d.s&&!m.s)for(let p=d;p&&!H(p);p=p.vC?.at(-1))p.nN=m;d=m}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=c,o&&delete t.pC}catch(s){if(t.f=!0,s===wt){if(i)return;throw s}let[c,d,f]=t[E]?.[3]||[];if(d){let m=()=>xe([0,!1,e[2]],f),u=Te.get(f)||[];u.push(m),Te.set(f,u);let p=d(s,()=>{let b=Te.get(f);if(b){let S=b.indexOf(m);if(S!==-1)return b.splice(S,1),m()}});if(p){if(e[0]===1)e[1]=!0;else if(Oe(e,f,[p]),(d.length===1||e!==c)&&f.c){Ue(f,f.c,!1);return}throw wt}}throw s}finally{i&&e[5].pop()}},Tt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[E]=[0,[]];else{let t=no[e.tag];t&&(ne||=se(""),e.props.children=[{tag:ne,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Ot=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Ot(o,t,r)))},$t=(e,t)=>{t[E][2]?.forEach(([r,o])=>{r.values.push(o)});try{Oe(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[E][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Ue(t,t.c,!1)},he=new WeakMap,Et=[],xe=async(e,t)=>{e[5]||=[];let r=he.get(t);r&&r[0](void 0);let o,i=new Promise(s=>o=s);if(he.set(t,[o,()=>{e[2]?e[2](e,t,s=>{$t(s,t)}).then(()=>o(t)):($t(e,t),o(t))}]),Et.length)Et.at(-1).add(t);else{await Promise.resolve();let s=he.get(t);s&&(he.delete(t),s[1]())}return i},mo=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Oe(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();Ue(e,o,!0),Ot(e,o,t),t.replaceChildren(o)},Ke=(e,t)=>{mo(Tt({tag:"",props:{children:e}}),t)};var Ye=(e,t,r)=>({tag:be,props:{children:e},key:r,e:t,p:1});var po=0,Pe=1,fo=2,uo=3;var qe=new WeakMap,Xe=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var go;var Pt=[];var L=e=>{let t=()=>typeof e=="function"?e():e,r=X.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,i=o[E][1][po]||=[],s=o[E][0]++;return i[s]||=[t(),c=>{let d=go,f=i[s];if(typeof c=="function"&&(c=c(f[0])),!Object.is(c,f[0]))if(f[0]=c,Pt.length){let[m,u]=Pt.at(-1);Promise.all([m===3?o:xe([m,!1,d],o),u]).then(([p])=>{if(!p||!(m===2||m===3))return;let b=p.vC;requestAnimationFrame(()=>{setTimeout(()=>{b===p.vC&&xe([m===3?1:0,!1,d],p)})})})}else xe([0,!1,d],o)}]},Ze=(e,t,r)=>{let o=Z(c=>{s(d=>e(d,c))},[e]),[i,s]=L(()=>r?r(t):t);return[i,o]},ho=(e,t,r)=>{let o=X.at(-1);if(!o)return;let[,i]=o,s=i[E][1][Pe]||=[],c=i[E][0]++,[d,,f]=s[c]||=[];if(Xe(d,r)){f&&f();let m=()=>{u[e]=void 0,u[2]=t()},u=[r,void 0,void 0,void 0,void 0];u[e]=m,s[c]=u}},Je=(e,t)=>ho(3,e,t);var Z=(e,t)=>{let r=X.at(-1);if(!r)return e;let[,o]=r,i=o[E][1][fo]||=[],s=o[E][0]++,c=i[s];return Xe(c?.[1],t)?i[s]=[e,t]:e=i[s][0],e};var Qe=e=>{let t=qe.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>qe.set(e,[r]),r=>qe.set(e,[void 0,r])),e},et=(e,t)=>{let r=X.at(-1);if(!r)return e();let[,o]=r,i=o[E][1][uo]||=[],s=o[E][0]++,c=i[s];return Xe(c?.[1],t)&&(i[s]=[e(),t]),i[s][0]};var Nt=se({pending:!1,data:null,method:null,action:null}),_t=new Set,Mt=e=>{_t.add(e),e.finally(()=>_t.delete(e))};var tt=(e,t)=>et(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let i=t(r);return()=>{i?.(),o?.()}},[e]),It=Object.create(null),jt=Object.create(null),ye=(e,t,r,o,i)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:c,onError:d,precedence:f,blocking:m,...u}=t,p=null,b=!1,S=re[e],w=Ae(e,o),D=$=>$.getAttribute("rel")==="stylesheet"&&$.getAttribute(V)!==null,O;if(w){let $=s.querySelectorAll(e);e:for(let C of $)if(!(e==="link"&&!D(C))){for(let v of S)if(C.getAttribute(v)===t[v]){p=C;break e}}if(!p){let C=S.reduce((v,A)=>t[A]===void 0?v:`${v}-${A}-${t[A]}`,e);b=!jt[C],p=jt[C]||=(()=>{let v=document.createElement(e);for(let A of S)t[A]!==void 0&&v.setAttribute(A,t[A]);return t.rel&&v.setAttribute("rel",t.rel),v})()}}else O=s.querySelectorAll(e);f=o?f??"":void 0,o&&(u[V]=f);let K=Z($=>{if(w){if(e==="link"&&f!==void 0){let v=!1;for(let A of s.querySelectorAll(e)){let I=A.getAttribute(V);if(I===null){s.insertBefore($,A);return}if(v&&I!==f){s.insertBefore($,A);return}I===f&&(v=!0)}s.appendChild($);return}let C=!1;for(let v of s.querySelectorAll(e)){if(C&&v.getAttribute(V)!==f){s.insertBefore($,v);return}v.getAttribute(V)===f&&(C=!0)}s.appendChild($)}else if(e==="link")s.contains($)||s.appendChild($);else if(O){let C=!1;for(let v of O)if(v===$){C=!0;break}C||s.insertBefore($,s.contains(O[0])?O[0]:s.querySelector(e)),O=void 0}},[w,f,e]),Q=tt(t.ref,$=>{let C=S[0];if(r===2&&($.innerHTML=""),(b||O)&&K($),!d&&!c||!C)return;let v=It[$.getAttribute(C)]||=new Promise((A,I)=>{$.addEventListener("load",A),$.addEventListener("error",I)});c&&(v=v.then(c)),d&&(v=v.catch(d)),v.catch(()=>{})});if(i&&m==="render"){let $=re[e][0];if($&&t[$]){let C=t[$],v=It[C]||=new Promise((A,I)=>{K(p),p.addEventListener("load",A),p.addEventListener("error",I)});Qe(v)}}let P={tag:e,type:e,props:{...u,ref:Q},ref:Q};return P.p=r,p&&(P.e=p),Ye(P,s)},bo=e=>{let t=Ct();return(t&&j(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ye("title",e,void 0,!1,!1)},xo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ye("script",e,1,!1,!0),yo=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ye("style",e,2,!0,!0)),So=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ye("link",e,1,ke(e),!0),vo=e=>ye("meta",e,void 0,!1,!1),Lt=Symbol(),wo=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,i]=L([null,!1]),s=Z(async m=>{let u=m.isTrusted?t:m.detail[Lt];if(typeof u!="function")return;m.preventDefault();let p=new FormData(m.target);i([p,!0]);let b=u(p);b instanceof Promise&&(Mt(b),await b),i([null,!0])},[]),c=tt(e.ref,m=>(m.addEventListener("submit",s),()=>{m.removeEventListener("submit",s)})),[d,f]=o;return o[1]=!1,{tag:Nt,props:{value:{pending:d!==null,data:d,method:d?"post":null,action:d?t:null},children:{tag:"form",props:{...r,ref:c},type:"form",ref:c}},f}},zt=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=Z(i=>{i.preventDefault(),i.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Lt]:t}}))},[]);r.ref=tt(r.ref,i=>(i.addEventListener("click",o),()=>{i.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},$o=e=>zt("input",e),Eo=e=>zt("button",e);Object.assign(ce,{title:bo,script:xo,style:yo,link:So,meta:vo,form:wo,input:$o,button:Eo});var J=":-hono-global",ko=new RegExp(`^${J}{(.*)}$`),_e="hono-css",W=Symbol(),R=Symbol(),M=Symbol(),z=Symbol(),Ne=Symbol(),Vt=Symbol(),_l=Symbol();var Ht=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Wt=e=>e.trim().replace(/\s+/g,"-"),Gt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),Ao=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),Ro=e=>Gt(e)&&!Ao.has(e.toLowerCase()),Ut=e=>{console.warn(`Invalid slug: ${e}`)},Do=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),To=new RegExp(["("+Do+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),Oo=e=>e.replace(To,(t,r,o,i,s)=>r||o||i||s||""),Kt=(e,t)=>{let r=[],o=[],i=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let c=0,d=e.length;c<d;c++){s+=e[c];let f=t[c];if(!(typeof f=="boolean"||f===null||f===void 0)){Array.isArray(f)||(f=[f]);for(let m=0,u=f.length;m<u;m++){let p=f[m];if(!(typeof p=="boolean"||p===null||p===void 0))if(typeof p=="string")/([\\"'\/])/.test(p)?s+=p.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=p;else if(typeof p=="number")s+=p;else if(p[Vt])s+=p[Vt];else if(p[R].startsWith("@keyframes "))r.push(p),s+=` ${p[R].substring(11)} `;else{if(e[c+1]?.match(/^\s*{/))r.push(p),p=`.${p[R]}`;else{r.push(...p[z]),o.push(...p[Ne]),p=p[M];let b=p.length;if(b>0){let S=p[b-1];S!==";"&&S!=="}"&&(p+=";")}}s+=`${p||""}`}}}}return[i,Oo(s),r,o]},ie=(e,t,r,o)=>{let[i,s,c,d]=Kt(e,t),f=ko.exec(s);f&&(s=f[1]);let m=Ht(i+s),u;if(r){let S=r(m,Wt(i),s);S&&(Gt(S)?u=S:(o||Ut)(S))}let p=(f?J:"")+(u||m),b=(f?c.map(S=>S[R]):[p,...d]).join(" ");return{[W]:p,[R]:b,[M]:s,[z]:c,[Ne]:d}},Me=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[W]:"",[R]:"",[M]:"",[z]:[],[Ne]:[o]})}return e},Ie=(e,t,r,o)=>{let[i,s]=Kt(e,t),c=Ht(i+s),d;if(r){let f=r(c,Wt(i),s);f&&(Ro(f)?d=f:(o||Ut)(f))}return{[W]:"",[R]:`@keyframes ${d||c}`,[M]:s,[z]:[],[Ne]:[]}},Po=0,je=(e,t,r,o)=>{e||(e=[`/* h-v-t ${Po++} */`]);let i=Array.isArray(e)?ie(e,t,r,o):e,s=i[R],c=ie(["view-transition-name:",""],[s],r,o);return i[R]=J+i[R],i[M]=i[M].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),c[R]=c[W]=s,c[z]=[...i[z],i],c};var No=e=>{let t=[],r=0,o=0;for(let i=0,s=e.length;i<s;i++){let c=e[i];if(c==="'"||c==='"'){let d=c;for(i++;i<s;i++){if(e[i]==="\\"){i++;continue}if(e[i]===d)break}continue}if(c==="{"){o++;continue}if(c==="}"){o--,o===0&&(t.push(e.slice(r,i+1)),r=i+1);continue}}return t},rt=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(c,d)=>{let[f,m]=r();if(!f||!m){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(c,d)});return}m.has(c)||(m.add(c),(c.startsWith(J)?No(d):[`${c[0]==="@"?"":"."}${c}{${d}}`]).forEach(u=>{f.insertRule(u,f.cssRules.length)}))};return[{toString(){let c=this[W];return o(c,this[M]),this[z].forEach(({[R]:d,[M]:f})=>{o(d,f)}),this[R]}},({children:c,nonce:d})=>({tag:"style",props:{id:e,nonce:d,children:c&&(Array.isArray(c)?c:[c]).map(f=>f[M])}})]},Mo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,i]=rt({id:e}),s=u=>(u.toString=o.toString,u),c=(u,...p)=>s(ie(u,p,t,r));return{css:c,cx:(...u)=>(u=Me(u),c(Array(u.length).fill(""),...u)),keyframes:(u,...p)=>Ie(u,p,t,r),viewTransition:(u,...p)=>s(je(u,p,t,r)),Style:i}},Se=Mo({id:_e}),Il=Se.css,jl=Se.cx,Ll=Se.keyframes,zl=Se.viewTransition,Bl=Se.Style;var Io=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,i]=rt({id:e}),s=new WeakMap,c=new WeakMap,d=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),f=w=>{let D=({buffer:P,context:$})=>{let[C,v]=s.get($),A=Object.keys(C);if(!A.length)return;let I="";if(A.forEach(Y=>{v[Y]=!0,I+=Y.startsWith(J)?C[Y]:`${Y[0]==="@"?"":"."}${Y}{${C[Y]}}`}),s.set($,[{},v]),P&&d.test(P[0])){P[0]=P[0].replace(d,(Y,zr,Br)=>`${zr}${I}${Br}`);return}let dt=c.get($),pt=`<script${dt?` nonce="${dt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(I)}<\/script>`;if(P){P[0]=`${pt}${P[0]}`;return}return Promise.resolve(pt)},O=({context:P})=>{s.has(P)||s.set(P,[{},{}]);let[$,C]=s.get(P),v=!0;if(C[w[W]]||(v=!1,$[w[W]]=w[M]),w[z].forEach(({[R]:A,[M]:I})=>{C[A]||(v=!1,$[A]=I)}),!v)return Promise.resolve(T("",[D]))},K=new String(w[R]);Object.assign(K,w),K.isEscaped=!0,K.callbacks=[O];let Q=Promise.resolve(K);return Object.assign(Q,w),Q.toString=o.toString,Q},m=(w,...D)=>f(ie(w,D,t,r)),u=(...w)=>(w=Me(w),m(Array(w.length).fill(""),...w)),p=(w,...D)=>Ie(w,D,t,r),b=(w,...D)=>f(je(w,D,t,r)),S=({children:w,nonce:D}={})=>T(`<style id="${e}"${D?` nonce="${D}"`:""}>${w?w[M]:""}</style>`,[({context:O})=>{c.set(O,D)}]);return S[G]=i,{css:m,cx:u,keyframes:p,viewTransition:b,Style:S}},ve=Io({id:_e}),l=ve.css,k=ve.cx,_=ve.keyframes,Kl=ve.viewTransition,Yt=ve.Style;var a={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",bgBase:"#F8F3EC",bgWarm:"#F0E8DC",bgSage:"#E2E8DF",bgSageDeep:"#D4DDD0",bgCard:"rgba(255,255,255,0.45)",bgCardHover:"rgba(255,255,255,0.65)",bgCardBorder:"rgba(255,255,255,0.6)",bgCardBorderHover:"rgba(79,132,72,0.2)",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",textSagePrimary:"#1E2B1A",textSageSecondary:"#3D5235",textSageMuted:"#6B7F65",textSageSoft:"#8B9E85",primary:"#4F8448",primaryDark:"#3D6A37",danger:"#A6290D",dangerAlt:"#C4422B",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},g=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),i=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${i}, ${t})`},h={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},x={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},we={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Zl={button:l`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:l`box-shadow: -8px 0 40px ${g(a.textPrimary,.3)};`,fab:l`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:l`box-shadow: 0 24px 80px ${a.inputLine};`,modal:l`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},Le={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};function qt(e,t){switch(e){case 0:return jo(t);case 1:return Lo(t);case 2:return zo(t);case 3:return Bo(t);case 4:return Fo();case 5:return Vo();case 6:return Ho(t);default:return new Map}}function jo(e){let t=new Map;return e.fields.firstName.trim()||t.set("firstName","Nome obrigat\xF3rio"),e.fields.lastName.trim()||t.set("lastName","Sobrenome obrigat\xF3rio"),e.fields.motherName.trim()||t.set("motherName","Nome da m\xE3e obrigat\xF3rio"),e.fields.nationality.trim()||t.set("nationality","Nacionalidade obrigat\xF3ria"),e.fields.gender.trim()||t.set("gender","G\xEAnero obrigat\xF3rio"),t}function Lo(e){let t=new Map,r=e.documents.cpf.replace(/\D/g,"");if(r?r.length!==11&&t.set("cpf","CPF deve ter 11 d\xEDgitos"):t.set("cpf","CPF obrigat\xF3rio"),!e.documents.birthDate.trim())t.set("birthDate","Data de nascimento obrigat\xF3ria");else if(!/^\d{4}-\d{2}-\d{2}$/.test(e.documents.birthDate))t.set("birthDate","Data deve estar no formato YYYY-MM-DD");else{let c=new Date(e.documents.birthDate);isNaN(c.getTime())?t.set("birthDate","Data inv\xE1lida"):c>new Date&&t.set("birthDate","Data n\xE3o pode ser futura")}let o=[e.documents.rgNumber,e.documents.rgUf,e.documents.rgAgency,e.documents.rgDate],i=o.filter(s=>s.trim().length>0);return i.length>0&&i.length<o.length&&(e.documents.rgNumber.trim()||t.set("rgNumber","N\xFAmero do RG obrigat\xF3rio"),e.documents.rgUf.trim()||t.set("rgUf","UF do RG obrigat\xF3ria"),e.documents.rgAgency.trim()||t.set("rgAgency","\xD3rg\xE3o emissor obrigat\xF3rio"),e.documents.rgDate.trim()||t.set("rgDate","Data de emiss\xE3o obrigat\xF3ria")),t}function zo(e){let t=new Map;return e.address.housingSituation.trim()||t.set("housingSituation","Situa\xE7\xE3o de moradia obrigat\xF3ria"),e.address.residenceLocation.trim()||t.set("residenceLocation","Localiza\xE7\xE3o da resid\xEAncia obrigat\xF3ria"),e.address.state.trim()||t.set("state","Estado obrigat\xF3rio"),e.address.city.trim()||t.set("city","Cidade obrigat\xF3ria"),t}function Bo(e){let t=new Map;if(e.diagnoses.length===0)return t.set("diagnoses","Ao menos 1 diagn\xF3stico \xE9 obrigat\xF3rio"),t;for(let r=0;r<e.diagnoses.length;r++){let o=e.diagnoses[r];o.code.trim()||t.set(`diagnosis_${r}_code`,"C\xF3digo CID obrigat\xF3rio"),o.date.trim()||t.set(`diagnosis_${r}_date`,"Data do diagn\xF3stico obrigat\xF3ria"),o.description.trim()||t.set(`diagnosis_${r}_description`,"Descri\xE7\xE3o obrigat\xF3ria")}return t}function Fo(){return new Map}function Vo(){return new Map}function Ho(e){let t=new Map;return e.intake.ingressType.trim()||t.set("ingressType","Tipo de ingresso obrigat\xF3rio"),e.intake.serviceReason.trim()||t.set("serviceReason","Motivo do atendimento obrigat\xF3rio"),t}var Wo=7;function Go(e,t,r,o){switch(t){case"fields":return{...e,fields:{...e.fields,[r]:o}};case"documents":return{...e,documents:{...e.documents,[r]:o}};case"address":return{...e,address:{...e.address,[r]:o}};case"specificity":return{...e,specificity:{...e.specificity,[r]:o}};case"intake":return{...e,intake:{...e.intake,[r]:o}};default:return e}}function Xt(e,t){switch(t.type){case"UPDATE_FIELD":return Go(e,t.section,t.field,t.value);case"NEXT_STEP":{let r=qt(e.currentStep,e);return r.size>0?{...e,errors:r,showErrors:!0}:e.currentStep>=Wo-1?e:{...e,currentStep:e.currentStep+1,showErrors:!1,errors:new Map}}case"PREV_STEP":return{...e,currentStep:Math.max(0,e.currentStep-1),showErrors:!1,errors:new Map};case"ADD_DIAGNOSIS":{let r={code:"",date:"",description:""};return{...e,diagnoses:[...e.diagnoses,r]}}case"REMOVE_DIAGNOSIS":return{...e,diagnoses:e.diagnoses.filter((r,o)=>o!==t.index)};case"APPLY_QUICK_CID":{let r=e.diagnoses.map((o,i)=>i===t.index?{...o,code:t.code,description:t.description}:o);return{...e,diagnoses:r}}case"ADD_FAMILY_MEMBER":return{...e,familyMembers:[...e.familyMembers,t.member]};case"UPDATE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.map((r,o)=>o===t.index?t.member:r)};case"REMOVE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.filter((r,o)=>o!==t.index)};case"TOGGLE_PROGRAM":{let r=e.intake.selectedPrograms,i=r.includes(t.programId)?r.filter(s=>s!==t.programId):[...r,t.programId];return{...e,intake:{...e.intake,selectedPrograms:i}}}case"SAVE_START":return{...e,saving:!0,saveResult:null};case"SAVE_SUCCESS":return{...e,saving:!1,saveResult:{ok:!0,message:t.message}};case"SAVE_FAILURE":return{...e,saving:!1,saveResult:{ok:!1,message:t.message}}}}var Zt={currentStep:0,showErrors:!1,saving:!1,saveResult:null,fields:{firstName:"",lastName:"",socialName:"",motherName:"",nationality:"",gender:"",phoneNumber:""},documents:{cpf:"",nis:"",cnsNumber:"",rgNumber:"",rgUf:"",rgAgency:"",rgDate:"",birthDate:""},address:{housingSituation:"",residenceLocation:"",cep:"",street:"",number:"",complement:"",neighborhood:"",state:"",city:""},diagnoses:[],familyMembers:[],specificity:{selectedIdentity:"",description:"",observations:""},intake:{ingressType:"",originName:"",originContact:"",serviceReason:"",selectedPrograms:[],observation:""},errors:new Map};var ot="registration-wizard-draft";function Jt(e){let t={...e,errors:Array.from(e.errors.entries())};localStorage.setItem(ot,JSON.stringify(t))}function Qt(){let e=localStorage.getItem(ot);if(!e)return null;let t=JSON.parse(e),r=Array.isArray(t.errors)?new Map(t.errors):new Map;return{...t,errors:r}}function nt(){localStorage.removeItem(ot)}var it={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},er=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Uo=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},tr=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:it});return er(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},rr=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:it});return Uo(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},or=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:it,body:JSON.stringify(t)});return er(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var nr={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),rr(`/api/v1/patients?${o.toString()}`)},getById:e=>tr(`/api/v1/patients/${e}`),create:e=>or("/api/v1/patients",e)};var Ko=l`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid ${g(a.primary,.08)};
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
`,Yo=l`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: ${h.erode};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  text-decoration: none;
  transition: transform 150ms ease, box-shadow 150ms ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px ${g(a.primary,.3)};
  }
`,qo=l`
  font-family: ${h.erode};
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
`,Xo=l`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 12px;
`,Zo=l`
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
    background: ${g(a.primary,.08)};
    color: ${a.textSageSecondary};
  }
`,Jo=l`
  background: ${g(a.primary,.08)};
  color: ${a.primary};
`,Qo=l`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
`,en=l`
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`,tn=l`
  margin-left: auto;
  background: ${a.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: ${Le.pill};
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,rn=l`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 12px;
  width: 100%;
`,on=l`
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
`,nn=l`
  font-size: 12px;
  color: ${a.textSageMuted};
  white-space: nowrap;
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,an=[{id:"familias",icon:"\u2630",label:"Familias",hasBadge:!0,href:"/social-care"},{id:"cadastro",icon:"+",label:"Cadastro",hasBadge:!1,href:"/patient-registration"},{id:"relatorios",icon:"\u25A6",label:"Relatorios",hasBadge:!1,href:"#"},{id:"config",icon:"\u2699",label:"Config",hasBadge:!1,href:"#"}],ir=({userName:e,userInitials:t,familyCount:r,activeItem:o})=>n("nav",{class:Ko,"aria-label":"Menu lateral",children:[n("a",{href:"/hub",class:Yo,"aria-label":"Voltar para o Hub",children:"C"}),n("a",{href:"/hub",class:qo,"aria-label":"Voltar para o Hub",children:"Conecta"}),n("div",{class:Xo,role:"list",children:an.map(i=>n("a",{class:`${Zo} ${i.id===o?Jo:""}`,href:i.href,"aria-current":i.id===o?"page":void 0,"aria-label":i.label,role:"listitem",children:[n("span",{class:Qo,"aria-hidden":"true",children:i.icon}),n("span",{class:en,children:i.label}),i.hasBadge&&n("span",{class:tn,"aria-label":`${r} familias`,children:r})]},i.id))}),n("div",{class:rn,children:[n("div",{class:on,"aria-hidden":"true",children:t}),n("div",{class:nn,children:e})]})]});var sn=_`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`,ln=l`
  width: 100%;
  max-width: min(90%, 48rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${sn} 400ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,cn=l`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${h.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  color: ${a.textSageMuted};
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms ease;
  border: none;
  background: none;
  padding: 0;

  &:hover {
    color: ${a.textSageSecondary};
  }
`,mn=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  color: ${a.textSageSoft};
  font-weight: ${x.medium};
`,ar=()=>n("div",{class:ln,children:[n("a",{href:"/social-care",class:cn,"aria-label":"Voltar para Familias",children:"\u2190 Voltar para Familias"}),n("span",{class:mn,children:"Rascunho salvo automaticamente"})]});var dn=l`
  margin-bottom: clamp(1.5rem, 1rem + 2vw, 2rem);
`,pn=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${a.textSageSoft};
  margin-bottom: 0.5rem;
`,fn=l`
  font-family: ${h.erode};
  font-size: clamp(1.5rem, 1.25rem + 1.25vw, 1.75rem);
  font-weight: ${x.bold};
  letter-spacing: -0.02em;
  color: ${a.textSagePrimary};
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
`,un=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSageMuted};
  line-height: 1.5;
`,sr=({stepNumber:e,title:t,description:r})=>n("div",{class:dn,children:[n("div",{class:pn,children:e}),n("h3",{class:fn,children:t}),n("p",{class:un,children:r})]});var lr=["Pessoais","Docs","Endereco","Diag.","Familia","Espec.","Ingresso"],cr=7,gn=l`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  width: 100%;
  max-width: min(90%, 48rem);
`,hn=l`
  width: 100%;
  height: 3px;
  background: ${g(a.primary,.1)};
  border-radius: 2px;
  overflow: hidden;
`,bn=l`
  height: 100%;
  background: linear-gradient(90deg, ${a.primary}, ${a.primaryDark});
  border-radius: 2px;
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
`,xn=l`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;

  @media (max-width: 600px) {
    display: none;
  }
`,yn=l`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  cursor: default;
`,Sn=l`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
`,vn=l`
  background: ${g(a.primary,.15)};
`,wn=l`
  background: #fff;
  border-color: ${a.primary};
  box-shadow: 0 0 0 3px ${g(a.primary,.12)};
`,$n=l`
  background: ${a.primary};
  box-shadow: 0 0 0 3px ${g(a.primary,.1)};
`,En=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.75rem);
  white-space: nowrap;
  font-weight: ${x.medium};
  transition: color 150ms ease;
  color: ${a.textSageSoft};
`,Cn=l`
  color: ${a.textSageSecondary};
  font-weight: ${x.semibold};
`,kn=l`
  color: ${a.primary};
`,An=l`
  display: none;
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  color: ${a.textSageSoft};
  text-align: center;
  font-weight: ${x.medium};
  padding: 0.75rem 0;
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);

  @media (max-width: 600px) {
    display: block;
  }
`,mr=({currentStep:e})=>{let t=e/(cr-1)*100;return n(U,{children:[n("div",{class:gn,children:[n("div",{class:hn,children:n("div",{class:bn,style:`width: ${t}%`})}),n("div",{class:xn,children:lr.map((r,o)=>{let i=o<e,s=o===e;return n("div",{class:yn,children:[n("div",{class:k(Sn,i?$n:s?wn:vn)}),n("span",{class:k(En,i?kn:s?Cn:void 0),children:r})]},o)})})]}),n("div",{class:An,children:["Etapa ",e+1," de ",cr," \u2014 ",lr[e]]})]})};var Rn=l`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  padding-top: clamp(1.25rem, 1rem + 1vw, 2rem);
  border-top: 1px solid ${g(a.primary,.08)};
`,dr=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${x.semibold};
  border-radius: 100px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  border: none;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`,Dn=l`
  ${dr}
  background: transparent;
  border: 1.5px solid ${g(a.primary,.2)};
  color: ${a.textSageMuted};
  padding: clamp(0.5rem, 0.4rem + 0.5vw, 0.625rem) clamp(1rem, 0.8rem + 1vw, 1.25rem);

  &:hover:not(:disabled) {
    border-color: ${g(a.primary,.4)};
    color: ${a.textSageSecondary};
  }
`,Tn=l`
  ${dr}
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  color: #fff;
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);
  box-shadow: 0 2px 12px ${g(a.primary,.2)};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${g(a.primary,.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover:not(:disabled) {
      transform: none;
    }
  }
`,pr=({currentStep:e,totalSteps:t,saving:r,onBack:o,onNext:i})=>{let s=e===0,c=e===t-1;return n("div",{class:Rn,children:[s?n("div",{}):n("button",{class:Dn,onClick:o,disabled:r,type:"button","aria-label":"Etapa anterior",children:"\u2190 Anterior"}),n("button",{class:Tn,onClick:i,disabled:r,type:"button","aria-label":c?"Salvar cadastro":"Proxima etapa",children:r?"Salvando...":c?"Salvar Cadastro":"Proximo \u2192"})]})};var On=l`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
`,Pn=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${a.textSageSoft};
`,_n=l`
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: ${a.primary};
  }

  &::placeholder {
    color: ${a.textSageSoft};
    font-style: italic;
  }
`,Nn=l`
  border-color: ${g(a.primary,.3)};
`,Mn=l`
  border-bottom: 2px solid ${a.dangerAlt};
  &:focus { border-bottom: 2px solid ${a.dangerAlt}; }
`,In=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.dangerAlt};
  margin-top: 0.25rem;
`,jn=l`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,y=({label:e,value:t,onChange:r,error:o,type:i,disabled:s})=>n("div",{class:k(On,s?jn:void 0),children:[n("label",{class:Pn,children:e}),n("input",{class:k(_n,o?Mn:t?Nn:void 0),type:i??"text",value:t,onInput:c=>r(c.target.value),disabled:s,"aria-label":e}),o&&n("span",{class:In,children:o})]});var Ln=l`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Mc=l`
  grid-column: 1 / -1;
`,fr=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  margin-bottom: 0.375rem;
`,zn=l`
  display: flex;
  gap: 0.625rem;
  margin-top: 0.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`,Bn=l`
  flex: 1;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid ${g(a.primary,.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${x.medium};
  color: ${a.textSageMuted};

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: ${g(a.primary,.2)};
  }
`,Fn=l`
  background: ${g(a.primary,.08)};
  border-color: ${a.primary};
  color: ${a.primary};
  font-weight: ${x.semibold};
  box-shadow: 0 0 0 3px ${g(a.primary,.08)};
`,Vn=l`
  border-color: ${g(a.dangerAlt,.3)};
`,ur=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.dangerAlt};
  margin-top: 0.25rem;
`,Hn=[{value:"MASCULINO",label:"Masculino"},{value:"FEMININO",label:"Feminino"},{value:"OUTRO",label:"Outro"}],Wn=["Brasileira","Naturalizada","Estrangeira"],Gn=l`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${a.primary};
  }
`,Un=l`
  border-color: ${a.dangerAlt};
`,gr=({fields:e,errors:t,onUpdate:r})=>n("div",{class:Ln,children:[n("div",{children:n(y,{label:"Nome",value:e.firstName,onChange:o=>r("firstName",o),error:t.get("firstName")})}),n("div",{children:n(y,{label:"Sobrenome",value:e.lastName,onChange:o=>r("lastName",o),error:t.get("lastName")})}),n("div",{children:n(y,{label:"Nome Social",value:e.socialName,onChange:o=>r("socialName",o)})}),n("div",{children:n(y,{label:"Nome da Mae",value:e.motherName,onChange:o=>r("motherName",o),error:t.get("motherName")})}),n("div",{children:[n("label",{class:fr,children:"Nacionalidade"}),n("select",{class:k(Gn,t.get("nationality")?Un:void 0),value:e.nationality,onChange:o=>r("nationality",o.target.value),"aria-label":"Nacionalidade",children:[n("option",{value:"",children:"Selecione..."}),Wn.map(o=>n("option",{value:o,children:o}))]}),t.get("nationality")&&n("div",{class:ur,children:t.get("nationality")})]}),n("div",{children:[n("label",{class:fr,children:"Sexo"}),n("div",{class:zn,children:Hn.map(o=>n("button",{type:"button",class:k(Bn,e.gender===o.value?Fn:void 0,t.get("gender")&&!e.gender?Vn:void 0),onClick:()=>r("gender",o.value),"aria-label":`Sexo: ${o.label}`,"aria-pressed":e.gender===o.value,children:o.label}))}),t.get("gender")&&n("div",{class:ur,children:t.get("gender")})]}),n("div",{children:n(y,{label:"Telefone",value:e.phoneNumber,onChange:o=>r("phoneNumber",o)})})]});var Kn=l`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Yn=l`
  grid-column: 1 / -1;
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  padding-top: 1rem;
  border-top: 1px solid ${g(a.primary,.08)};
  margin-top: 0.5rem;
`,qn=l`
  grid-column: 1 / -1;
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: ${g(a.dangerAlt,.06)};
  border: 1px solid ${g(a.dangerAlt,.15)};
  border-radius: 12px;
  font-family: ${h.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${x.medium};
  color: ${a.dangerAlt};
  line-height: 1.4;
`,Xn=e=>{let t=e.replace(/\D/g,"").slice(0,11);return t.length<=3?t:t.length<=6?`${t.slice(0,3)}.${t.slice(3)}`:t.length<=9?`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6)}`:`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6,9)}-${t.slice(9)}`},hr=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},at=e=>e.replace(/\D/g,""),br=({documents:e,errors:t,onUpdate:r})=>n("div",{class:Kn,children:[t.get("documents")&&n("div",{class:qn,children:t.get("documents")}),n("div",{children:n(y,{label:"CPF",value:Xn(e.cpf),onChange:o=>r("cpf",at(o)),error:t.get("cpf")})}),n("div",{children:n(y,{label:"NIS",value:e.nis,onChange:o=>r("nis",o),error:t.get("nis")})}),n("div",{children:n(y,{label:"CNS",value:e.cnsNumber,onChange:o=>r("cnsNumber",o),error:t.get("cnsNumber")})}),n("div",{children:n(y,{label:"Data de Nascimento",value:hr(e.birthDate),onChange:o=>r("birthDate",at(o)),error:t.get("birthDate")})}),n("div",{class:Yn,children:"RG (preencha todos ou nenhum)"}),n("div",{children:n(y,{label:"Numero do RG",value:e.rgNumber,onChange:o=>r("rgNumber",o),error:t.get("rgNumber")})}),n("div",{children:n(y,{label:"UF",value:e.rgUf,onChange:o=>r("rgUf",o),error:t.get("rgUf")})}),n("div",{children:n(y,{label:"Orgao Emissor",value:e.rgAgency,onChange:o=>r("rgAgency",o),error:t.get("rgAgency")})}),n("div",{children:n(y,{label:"Data de Emissao",value:hr(e.rgDate),onChange:o=>r("rgDate",at(o)),error:t.get("rgDate")})})]});var Zn=l`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Jn=l`
  grid-column: 1 / -1;
`,st=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  margin-bottom: 1rem;
`,Qn=l`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`,ei=l`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1rem, 0.75rem + 1vw, 1.25rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  gap: 0.25rem;
  min-height: 100px;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid ${g(a.primary,.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
`,ti=l`
  background: ${g(a.primary,.08)};
  border-color: ${a.primary};
  box-shadow: 0 0 0 3px ${g(a.primary,.08)};
`,ri=l`
  border-color: ${g(a.dangerAlt,.3)};
`,oi=l`
  font-size: 1.75rem;
  line-height: 1;
  margin-bottom: 0.25rem;
`,ni=l`
  font-family: ${h.erode};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${x.semibold};
  color: ${a.textSagePrimary};
`,ii=l`
  color: ${a.primary};
`,ai=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.6875rem);
  color: ${a.textSageSoft};
  text-align: center;
  line-height: 1.3;
`,si=l`
  color: ${a.primaryDark};
`,lt=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.dangerAlt};
  margin-top: 0.25rem;
`,xr=l`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem);
  background: ${g(a.primary,.06)};
  border: 1px solid ${g(a.primary,.12)};
  border-radius: 12px;
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.medium};
  color: ${a.textSageSecondary};
  line-height: 1.4;
`,yr=l`
  font-size: 1rem;
  color: ${a.primary};
  flex-shrink: 0;
`,Sr=l`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${a.primary};
  }
`,ae=l`
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
`,Kc=l`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
`,li=["","AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"],ci=[{value:"",label:"Selecione..."},{value:"Propria",label:"Propria"},{value:"Alugada",label:"Alugada"},{value:"Cedida",label:"Cedida"},{value:"Outros",label:"Outros"}],mi=[{value:"URBANO",icon:"\u{1F3D7}",label:"Urbano",desc:"Residencia em area urbana"},{value:"RURAL",icon:"\u{1F33E}",label:"Rural",desc:"Residencia em area rural"},{value:"RUA",icon:"\u{1F6CC}",label:"Situacao de Rua",desc:"Pessoa sem moradia fixa"}],di=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=5?t:`${t.slice(0,5)}-${t.slice(5)}`},vr=({address:e,errors:t,onUpdate:r})=>{let[o,i]=L(e.residenceLocation),s=o==="RUA",c=o==="RURAL",d=o!=="",f=m=>{i(m),r("residenceLocation",m),m==="RUA"?(r("housingSituation",""),r("street",""),r("number",""),r("complement",""),r("neighborhood",""),r("cep","")):m==="RURAL"&&(r("street",""),r("complement",""))};return n("div",{children:[n("div",{class:Jn,style:"margin-bottom: clamp(1.25rem, 1rem + 1vw, 1.5rem)",children:[n("label",{class:st,children:"Qual a situacao de moradia?"}),n("div",{class:Qn,children:mi.map(m=>n("button",{type:"button",class:k(ei,o===m.value?ti:void 0,t.get("residenceLocation")&&!o?ri:void 0),onClick:()=>f(m.value),"aria-label":`Moradia: ${m.label}`,"aria-pressed":o===m.value,children:[n("div",{class:oi,children:m.icon}),n("div",{class:k(ni,o===m.value?ii:void 0),children:m.label}),n("div",{class:k(ai,o===m.value?si:void 0),children:m.desc})]}))}),t.get("residenceLocation")&&n("div",{class:lt,children:t.get("residenceLocation")})]}),d&&n("div",{class:Zn,children:[s&&n("div",{class:xr,children:[n("span",{class:yr,children:"\u24D8"}),"Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS."]}),c&&n("div",{class:xr,children:[n("span",{class:yr,children:"\u24D8"}),"Rua e Complemento nao se aplicam para area rural."]}),n("div",{class:s?ae:void 0,children:[n("label",{class:st,children:"Tipo de Moradia"}),n("select",{class:Sr,value:e.housingSituation,onChange:m=>r("housingSituation",m.target.value),disabled:s,"aria-label":"Tipo de moradia",children:ci.map(m=>n("option",{value:m.value,children:m.label}))}),t.get("housingSituation")&&n("div",{class:lt,children:t.get("housingSituation")})]}),n("div",{class:s?ae:void 0,children:n(y,{label:"CEP",value:di(e.cep),onChange:m=>r("cep",m.replace(/\D/g,"")),error:t.get("cep"),disabled:s})}),n("div",{class:s||c?ae:void 0,children:n(y,{label:"Rua",value:e.street,onChange:m=>r("street",m),error:t.get("street"),disabled:s||c})}),n("div",{class:s?ae:void 0,children:n(y,{label:"Numero",value:e.number,onChange:m=>r("number",m),error:t.get("number"),disabled:s})}),n("div",{class:s||c?ae:void 0,children:n(y,{label:"Complemento",value:e.complement,onChange:m=>r("complement",m),disabled:s||c})}),n("div",{class:s?ae:void 0,children:n(y,{label:"Bairro",value:e.neighborhood,onChange:m=>r("neighborhood",m),error:t.get("neighborhood"),disabled:s})}),n("div",{children:[n("label",{class:st,children:"Estado"}),n("select",{class:Sr,value:e.state,onChange:m=>r("state",m.target.value),"aria-label":"Estado",children:li.map(m=>n("option",{value:m,children:m||"Selecione..."}))}),t.get("state")&&n("div",{class:lt,children:t.get("state")})]}),n("div",{children:n(y,{label:"Cidade",value:e.city,onChange:m=>r("city",m),error:t.get("city")})})]})]})};var pi=_`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,fi=l`
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
`,ui=l`
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: ${g(a.dangerAlt,.06)};
  border: 1px solid ${g(a.dangerAlt,.15)};
  border-radius: 12px;
  font-family: ${h.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${x.medium};
  color: ${a.dangerAlt};
  line-height: 1.4;
`,gi=l`
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  position: relative;
  animation: ${pi} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,hi=l`
  border-color: ${g(a.primary,.3)};
  background: ${g(a.primary,.04)};
`,bi=l`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem) clamp(1rem, 0.875rem + 0.5vw, 1.5rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,xi=l`
  grid-column: 1 / -1;
`,yi=l`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${g(a.primary,.15)};
  background: rgba(255, 255, 255, 0.3);
  color: ${a.textSageMuted};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;

  &:hover {
    border-color: ${a.dangerAlt};
    color: ${a.dangerAlt};
    background: ${g(a.dangerAlt,.08)};
  }
`,Si=l`
  position: absolute;
  top: 0.75rem;
  right: 2.75rem;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: ${h.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.6875rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${a.textSageSoft};
  white-space: nowrap;
`,vi=l`
  color: ${a.primary};
`,wi=l`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 1.5px solid ${g(a.primary,.2)};
  color: transparent;
  background: rgba(255, 255, 255, 0.4);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
`,$i=l`
  border-color: ${a.primary};
  background: ${a.primary};
  color: #fff;
`,Ei=l`
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`,Ci=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  font-weight: ${x.medium};
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid ${g(a.primary,.15)};
  background: rgba(255, 255, 255, 0.3);
  color: ${a.textSageMuted};
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${a.primary};
    color: ${a.primary};
    background: ${g(a.primary,.08)};
  }
`,ki=l`
  border-color: ${a.primary};
  color: #fff;
  background: ${a.primary};
  font-weight: ${x.semibold};
`,Ai=l`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px dashed ${g(a.primary,.2)};
  color: ${a.textSageMuted};
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
  border-radius: 12px;
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${a.primary};
    color: ${a.primary};
    background: ${g(a.primary,.08)};
  }
`,Ri=l`
  text-align: center;
  padding: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0;
  color: ${a.textSageSoft};
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
`,Di=[{code:"G80",desc:"Paralisia cerebral"},{code:"Q90",desc:"Sindrome de Down"},{code:"F84.0",desc:"Autismo"},{code:"E70",desc:"Fenilcetonuria"},{code:"G71.0",desc:"Distrofia muscular"},{code:"R69",desc:"Morbidade n/e"},{code:"Z03",desc:"Obs. por suspeita"},{code:"Z03.9",desc:"Obs. n/e"}],wr=({diagnoses:e,errors:t,onUpdateEntry:r,onAddDiagnosis:o,onRemoveDiagnosis:i,onApplyQuickCid:s})=>{let c=d=>d.code.trim()!==""&&d.date.trim().length===10&&d.description.trim()!=="";return n("div",{class:fi,children:[t.get("diagnoses")&&n("div",{class:ui,children:t.get("diagnoses")}),e.length===0&&n("p",{class:Ri,children:"Nenhum diagnostico adicionado. Clique abaixo para adicionar."}),e.map((d,f)=>{let m=c(d);return n("div",{class:k(gi,m?hi:void 0),style:`--stagger: ${f*60}ms`,children:[n("div",{class:k(Si,m?vi:void 0),children:[n("span",{class:k(wi,m?$i:void 0),children:"\u2713"}),n("span",{children:m?"Completo":"Pendente"})]}),n("button",{class:yi,type:"button",onClick:()=>i(f),"aria-label":"Remover diagnostico",children:"\xD7"}),n("div",{class:bi,children:[n("div",{children:n(y,{label:"Codigo CID",value:d.code,onChange:u=>r(f,"code",u),error:t.get(`diagnosis_${f}_code`)})}),n("div",{children:n(y,{label:"Data",value:d.date,onChange:u=>r(f,"date",u),error:t.get(`diagnosis_${f}_date`)})}),n("div",{class:xi,children:n(y,{label:"Descricao",value:d.description,onChange:u=>r(f,"description",u),error:t.get(`diagnosis_${f}_description`)})}),n("div",{class:Ei,children:Di.map(u=>n("button",{type:"button",class:k(Ci,d.code===u.code?ki:void 0),onClick:()=>s(f,u.code,u.desc),"aria-label":`CID ${u.code} - ${u.desc}`,children:[u.code," \u2014 ",u.desc]}))})]})]})}),n("button",{class:Ai,type:"button",onClick:o,"aria-label":"Adicionar diagnostico",children:"+ Adicionar diagnostico"})]})};var kr=_`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,Ti=l`
  display: flex;
  flex-direction: column;
`,Oi=l`
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  align-items: center;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1.5rem);
  padding: 0.75rem 0;
  border-bottom: 1px solid ${g(a.primary,.08)};
  animation: ${kr} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
  }
`,Pi=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.textSageSoft};
  font-variant-numeric: tabular-nums;
  min-width: 20px;
`,_i=l`
  font-family: ${h.erode};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  font-weight: ${x.semibold};
  color: ${a.textSagePrimary};
`,Ni=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};

  @media (max-width: 600px) {
    grid-column: 2;
    font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  }
`,Mi=l`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${g(a.primary,.15)};
  background: transparent;
  color: ${a.textSageMuted};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;

  &:hover {
    border-color: ${a.dangerAlt};
    color: ${a.dangerAlt};
  }
`,Ii=l`
  text-align: center;
  padding: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0;
  color: ${a.textSageSoft};
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
`,ji=l`
  border: 1.5px solid ${a.primary};
  border-radius: 16px;
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  margin-top: 0.75rem;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: ${kr} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Li=l`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1rem) clamp(1rem, 0.875rem + 0.5vw, 1.5rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,$r=l`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: ${a.primary};
  }
`,Er=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
`,Cr=l`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
`,zi=l`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
`,Bi=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${x.semibold};
  border-radius: 100px;
  background: transparent;
  border: 1.5px solid ${g(a.primary,.2)};
  color: ${a.textSageMuted};
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${g(a.primary,.4)};
    color: ${a.textSageSecondary};
  }
`,Fi=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${x.semibold};
  border-radius: 100px;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  color: #fff;
  border: none;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 2px 12px ${g(a.primary,.2)};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${g(a.primary,.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`,Vi=l`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px dashed ${g(a.primary,.2)};
  color: ${a.textSageMuted};
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
  border-radius: 12px;
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  cursor: pointer;
  transition: all 150ms ease;
  margin-top: 0.75rem;

  &:hover {
    border-color: ${a.primary};
    color: ${a.primary};
    background: ${g(a.primary,.08)};
  }
`,Hi=[{value:"CONJUGE",label:"Conjuge / Companheiro(a)"},{value:"FILHO",label:"Filho(a)"},{value:"ENTEADO",label:"Enteado(a)"},{value:"PAI",label:"Pai"},{value:"MAE",label:"Mae"},{value:"AVO",label:"Avo / Avo"},{value:"NETO",label:"Neto(a)"},{value:"IRMAO",label:"Irmao / Irma"},{value:"TIO",label:"Tio(a)"},{value:"SOBRINHO",label:"Sobrinho(a)"},{value:"PRIMO",label:"Primo(a)"},{value:"OUTRO_PARENTE",label:"Outro Parente"},{value:"NAO_PARENTE",label:"Nao Parente"}],Wi=["Masculino","Feminino","Outro"],ct={name:"",birthDate:"",gender:"",relationship:"",livesWithPatient:!0,isDisabled:!1},Ar=({familyMembers:e,onAddMember:t,onRemoveMember:r})=>{let[o,i]=L(!1),[s,c]=L(ct),d=()=>{s.name.trim()&&s.relationship.trim()&&(t(s),c(ct),i(!1))},f=()=>{c(ct),i(!1)};return n("div",{class:Ti,children:[e.length===0&&!o&&n("p",{class:Ii,children:"Nenhum membro familiar adicionado. Este passo e opcional."}),e.map((m,u)=>n("div",{class:Oi,style:`animation-delay: ${u*60}ms`,children:[n("span",{class:Pi,children:String(u+1).padStart(2,"0")}),n("span",{class:_i,children:m.name}),n("span",{class:Ni,children:[m.relationship," | ",m.gender," | ",m.livesWithPatient?"Reside":"Nao reside"]}),n("button",{class:Mi,type:"button",onClick:()=>r(u),"aria-label":`Remover ${m.name}`,children:"\xD7"})]})),o&&n("div",{class:ji,children:[n("div",{class:Li,children:[n("div",{children:n(y,{label:"Nome",value:s.name,onChange:m=>c({...s,name:m})})}),n("div",{children:n(y,{label:"Data de Nascimento",value:s.birthDate,onChange:m=>c({...s,birthDate:m})})}),n("div",{children:[n("label",{class:Er,children:"Sexo"}),n("select",{class:$r,value:s.gender,onChange:m=>c({...s,gender:m.target.value}),"aria-label":"Sexo",children:[n("option",{value:"",children:"Selecione..."}),Wi.map(m=>n("option",{value:m,children:m}))]})]}),n("div",{children:[n("label",{class:Er,children:"Parentesco"}),n("select",{class:$r,value:s.relationship,onChange:m=>c({...s,relationship:m.target.value}),"aria-label":"Parentesco",children:[n("option",{value:"",children:"Selecione..."}),Hi.map(m=>n("option",{value:m.value,children:m.label}))]})]}),n("div",{children:n("label",{class:Cr,children:[n("input",{type:"checkbox",checked:s.livesWithPatient,onChange:()=>c({...s,livesWithPatient:!s.livesWithPatient})}),"Reside com o paciente"]})}),n("div",{children:n("label",{class:Cr,children:[n("input",{type:"checkbox",checked:s.isDisabled,onChange:()=>c({...s,isDisabled:!s.isDisabled})}),"Pessoa com deficiencia"]})})]}),n("div",{class:zi,children:[n("button",{class:Bi,type:"button",onClick:f,children:"Cancelar"}),n("button",{class:Fi,type:"button",onClick:d,"aria-label":"Confirmar membro",children:"Confirmar"})]})]}),!o&&n("button",{class:Vi,type:"button",onClick:()=>i(!0),"aria-label":"Adicionar membro",children:"+ Adicionar membro"})]})};var Gi=l`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Ui=l`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${a.primary};
  }
`,Rr=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
`,Ki=l`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid ${g(a.primary,.12)};
  border-radius: 12px;
  padding: 0.75rem;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${a.primary};
  }

  &::placeholder {
    color: ${a.textSageSoft};
    font-style: italic;
  }
`,Yi=l`
  grid-column: 1 / -1;
`,qi=["Quilombola","Indigena","Ribeirinho","Cigano","Extrativista","Pescador artesanal","Pertencente a comunidade de terreiro","Nenhuma das anteriores"],Dr=({specificity:e,errors:t,onUpdate:r})=>n("div",{class:Gi,children:[n("div",{children:[n("label",{class:Rr,children:"Identidade Social"}),n("select",{class:Ui,value:e.selectedIdentity,onChange:o=>r("selectedIdentity",o.target.value),"aria-label":"Identidade social",children:[n("option",{value:"",children:"Selecione..."}),qi.map(o=>n("option",{value:o,children:o}))]})]}),n("div",{children:n(y,{label:"Descricao",value:e.description,onChange:o=>r("description",o),error:t.get("description")})}),n("div",{class:Yi,children:[n("label",{class:Rr,children:"Observa\\u00e7\\u00f5es"}),n("textarea",{class:Ki,placeholder:"Informa\\u00e7\\u00f5es complementares sobre especificidades...","aria-label":"Observa\\u00e7\\u00f5es sobre especificidades",value:e.observations,onInput:o=>r("observations",o.target.value)})]})]});var Xi=l`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Tr=l`
  grid-column: 1 / -1;
`,mt=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
`,Zi=l`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${a.primary};
  }
`,Ji=l`
  border-color: ${a.dangerAlt};
`,Or=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.dangerAlt};
  margin-top: 0.25rem;
`,Pr=l`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid ${g(a.primary,.12)};
  border-radius: 12px;
  padding: 0.75rem;
  font-family: ${h.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${a.textSagePrimary};
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${a.primary};
  }

  &::placeholder {
    color: ${a.textSageSoft};
    font-style: italic;
  }
`,Qi=l`
  border-color: ${a.dangerAlt};

  &:focus {
    border-color: ${a.dangerAlt};
  }
`,ea=l`
  grid-column: 1 / -1;
  font-family: ${h.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  padding-top: 1rem;
  border-top: 1px solid ${g(a.primary,.08)};
  margin-top: 0.5rem;
`,ta=l`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,ra=l`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  border: 1.5px solid ${g(a.primary,.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(255, 255, 255, 0.3);

  &:hover {
    border-color: ${g(a.primary,.2)};
    background: rgba(255, 255, 255, 0.5);
  }
`,oa=l`
  border-color: ${a.primary};
  background: ${g(a.primary,.08)};
  box-shadow: 0 0 0 3px ${g(a.primary,.08)};
`,na=l`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid ${g(a.primary,.2)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  color: transparent;
  transition: all 150ms ease;
`,ia=l`
  background: ${a.primary};
  border-color: ${a.primary};
  color: #fff;
`,aa=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
`,sa=l`
  color: ${a.primary};
  font-weight: ${x.medium};
`,la=[{value:"",label:"Selecione..."},{value:"DEMANDA_ESPONTANEA",label:"Demanda espontanea"},{value:"BUSCA_ATIVA",label:"Busca ativa"},{value:"ENCAMINHAMENTO",label:"Encaminhamento"},{value:"REINCIDENCIA",label:"Reincidencia"}],ca=[{id:"BPC",label:"BPC (Beneficio de Prestacao Continuada)"},{id:"BOLSA_FAMILIA",label:"Bolsa Familia"},{id:"AUXILIO_BRASIL",label:"Auxilio Brasil"},{id:"PETI",label:"PETI"},{id:"OUTROS",label:"Outros programas"}],_r=({intake:e,errors:t,onUpdate:r,onToggleProgram:o})=>n("div",{class:Xi,children:[n("div",{children:[n("label",{class:mt,children:"Tipo de Ingresso"}),n("select",{class:k(Zi,t.get("ingressType")?Ji:void 0),value:e.ingressType,onChange:i=>r("ingressType",i.target.value),"aria-label":"Tipo de ingresso",children:la.map(i=>n("option",{value:i.value,children:i.label}))}),t.get("ingressType")&&n("div",{class:Or,children:t.get("ingressType")})]}),n("div",{children:n(y,{label:"Nome da Origem",value:e.originName,onChange:i=>r("originName",i)})}),n("div",{children:n(y,{label:"Contato da Origem",value:e.originContact,onChange:i=>r("originContact",i)})}),n("div",{class:Tr,children:[n("label",{class:mt,children:"Motivo do Atendimento"}),n("textarea",{class:k(Pr,t.get("serviceReason")?Qi:void 0),value:e.serviceReason,onInput:i=>r("serviceReason",i.target.value),placeholder:"Descreva o motivo do primeiro atendimento...","aria-label":"Motivo do atendimento"}),t.get("serviceReason")&&n("div",{class:Or,children:t.get("serviceReason")})]}),n("div",{class:ea,children:"Programas sociais vinculados"}),n("div",{class:ta,children:ca.map(i=>{let s=e.selectedPrograms.includes(i.id);return n("button",{type:"button",class:k(ra,s?oa:void 0),onClick:()=>o(i.id),"aria-label":`Programa: ${i.label}`,"aria-pressed":s,children:[n("div",{class:k(na,s?ia:void 0),children:"\u2713"}),n("span",{class:k(aa,s?sa:void 0),children:i.label})]})})}),n("div",{class:Tr,children:[n("label",{class:mt,children:"Observacao"}),n("textarea",{class:Pr,value:e.observation,onInput:i=>r("observation",i.target.value),placeholder:"Anotacoes gerais sobre o ingresso...","aria-label":"Observacao de ingresso"})]})]});var ma=_`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,da=l`
  display: flex;
  align-items: center;
  gap: ${we[3]};
  padding: ${we[3]} ${we[4]};
  background: ${g(a.danger,.06)};
  border: 1px solid ${g(a.danger,.12)};
  border-radius: ${Le.dropdown};
  animation: ${ma} 400ms ease-out;
`,pa=l`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${a.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${x.bold};
  flex-shrink: 0;
`,fa=l`
  font-family: ${h.satoshi};
  font-size: 14px;
  color: ${a.danger};
  flex: 1;
`,ua=l`
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${a.danger};
  font-size: 18px;
  line-height: 1;
  padding: ${we[1]};
  opacity: 0.7;
  &:hover { opacity: 1; }
`,Nr=({message:e,onDismiss:t})=>n("div",{class:da,role:"alert",children:[n("div",{class:pa,children:"!"}),n("span",{class:fa,children:e}),t&&n("button",{class:ua,onClick:t,type:"button","aria-label":"Fechar",children:"\xD7"})]});var ga=_`
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`,ha=_`
  to { stroke-dashoffset: 0; }
`,ba=_`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`,ze=_`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,xa=l`
  position: fixed;
  inset: 0;
  background: rgba(248, 243, 236, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${ze} 500ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,ya=l`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(2rem, 1.5rem + 2vw, 3rem) clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  text-align: center;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
  animation: ${ba} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Sa=l`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(1rem, 0.75rem + 1vw, 1.25rem);
  box-shadow: 0 4px 20px ${g(a.primary,.25)};
  animation: ${ga} 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,va=l`
  width: 28px;
  height: 28px;
  stroke: white;
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: ${ha} 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    stroke-dashoffset: 0;
  }
`,wa=l`
  font-family: ${h.erode};
  font-size: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  font-weight: ${x.bold};
  color: ${a.textSagePrimary};
  margin-bottom: 0.5rem;
  animation: ${ze} 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,$a=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
  line-height: 1.5;
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  animation: ${ze} 500ms cubic-bezier(0.16, 1, 0.3, 1) 750ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Ea=l`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  animation: ${ze} 500ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Ca=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${x.semibold};
  padding: clamp(0.5rem, 0.4rem + 0.5vw, 0.625rem) clamp(1rem, 0.8rem + 1vw, 1.25rem);
  border-radius: 100px;
  background: transparent;
  border: 1.5px solid ${g(a.primary,.2)};
  color: ${a.textSageMuted};
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${g(a.primary,.4)};
    color: ${a.textSageSecondary};
  }
`,ka=l`
  font-family: ${h.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${x.semibold};
  padding: clamp(0.5rem, 0.4rem + 0.5vw, 0.625rem) clamp(1rem, 0.8rem + 1vw, 1.25rem);
  border-radius: 100px;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  color: #fff;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 150ms ease;
  box-shadow: 0 2px 12px ${g(a.primary,.2)};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${g(a.primary,.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`,Mr=({message:e,onNewRegistration:t})=>n("div",{class:xa,role:"dialog","aria-label":"Cadastro realizado com sucesso",children:n("div",{class:ya,children:[n("div",{class:Sa,children:n("svg",{class:va,viewBox:"0 0 24 24",children:n("polyline",{points:"6 12 10 16 18 8"})})}),n("div",{class:wa,children:"Cadastro realizado!"}),n("div",{class:$a,children:"A familia foi cadastrada com sucesso no sistema Conecta."}),n("div",{class:Ea,children:[n("button",{class:Ca,type:"button",onClick:t,"aria-label":"Novo cadastro",children:"Novo cadastro"}),n("a",{href:"/social-care",class:ka,"aria-label":"Ver familias",children:"Ver familias \u2192"})]})]})});var Ir=7,Aa=[{number:"Etapa 01",title:"Dados Pessoais",desc:"Informacoes basicas da pessoa de referencia."},{number:"Etapa 02",title:"Documentos",desc:"CPF, NIS, CNS e documentos de identificacao."},{number:"Etapa 03",title:"Endereco",desc:"Situacao de moradia e localizacao."},{number:"Etapa 04",title:"Diagnosticos",desc:"Pelo menos um diagnostico e obrigatorio."},{number:"Etapa 05",title:"Composicao Familiar",desc:"Membros da familia (opcional)."},{number:"Etapa 06",title:"Especificidades (opcional)",desc:"Identidade social, etnica ou cultural."},{number:"Etapa 07",title:"Ingresso",desc:"Tipo de ingresso e motivo do atendimento."}],Ra=l`
  :-hono-global {
    body { background: ${a.bgSageDeep} !important; }
  }
`,Da=l`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${a.bgBase} 0%, ${a.bgWarm} 25%, ${a.bgSage} 55%, ${a.bgSageDeep} 100%);
`,Ta=l`
  position: fixed;
  top: -10%;
  right: 5%;
  width: min(450px, 50vw);
  height: min(450px, 50vw);
  border-radius: 50%;
  background: radial-gradient(circle, ${g(a.primary,.06)} 0%, transparent 70%);
  z-index: 0;
`,Oa=l`
  position: fixed;
  bottom: -15%;
  left: 10%;
  width: min(500px, 55vw);
  height: min(500px, 55vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 160, 100, 0.04) 0%, transparent 70%);
  z-index: 0;
`,Pa=l`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
`,_a=l`
  margin-left: 64px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1rem, 0.5rem + 2vw, 2rem);
  overflow-y: auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`,Na=_`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,Ma=l`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1.5rem, 1rem + 2vw, 2.75rem);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: min(90%, 48rem);
  animation: ${Na} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,jr=()=>{let[e,t]=Ze(Xt,Qt()??Zt);Je(()=>{Jt(e)},[e]);let r=async()=>{if(e.currentStep===Ir-1){t({type:"SAVE_START"});let d=await nr.create(e);d.ok?(nt(),t({type:"SAVE_SUCCESS",message:"Cadastro realizado!"})):t({type:"SAVE_FAILURE",message:d.error.message})}else t({type:"NEXT_STEP"})},o=()=>{t({type:"PREV_STEP"})},i=e.showErrors?e.errors:new Map,s=Aa[e.currentStep],c=d=>(f,m)=>{t({type:"UPDATE_FIELD",section:d,field:f,value:m})};return n(U,{children:[n("div",{class:Ra}),n("div",{class:Da}),n("div",{class:Ta}),n("div",{class:Oa}),n("div",{class:Pa,children:[n(ir,{userName:"Usuario",userInitials:"US",familyCount:0,activeItem:"cadastro"}),n("main",{class:_a,children:[n(ar,{}),n(mr,{currentStep:e.currentStep}),n("div",{class:Ma,children:[s&&n(sr,{stepNumber:s.number,title:s.title,description:s.desc}),e.saveResult&&!e.saveResult.ok&&n(Nr,{message:e.saveResult.message}),e.currentStep===0&&n(gr,{fields:e.fields,errors:i,onUpdate:c("fields")}),e.currentStep===1&&n(br,{documents:e.documents,errors:i,onUpdate:c("documents")}),e.currentStep===2&&n(vr,{address:e.address,errors:i,onUpdate:c("address")}),e.currentStep===3&&n(wr,{diagnoses:e.diagnoses,errors:i,onUpdateEntry:(d,f,m)=>{let u=e.diagnoses[d];if(!u)return;let p={...u,[f]:m};t({type:"APPLY_QUICK_CID",index:d,code:p.code,description:p.description})},onAddDiagnosis:()=>t({type:"ADD_DIAGNOSIS"}),onRemoveDiagnosis:d=>t({type:"REMOVE_DIAGNOSIS",index:d}),onApplyQuickCid:(d,f,m)=>t({type:"APPLY_QUICK_CID",index:d,code:f,description:m})}),e.currentStep===4&&n(Ar,{familyMembers:e.familyMembers,onAddMember:d=>t({type:"ADD_FAMILY_MEMBER",member:d}),onRemoveMember:d=>t({type:"REMOVE_FAMILY_MEMBER",index:d})}),e.currentStep===5&&n(Dr,{specificity:e.specificity,errors:i,onUpdate:c("specificity")}),e.currentStep===6&&n(_r,{intake:e.intake,errors:i,onUpdate:c("intake"),onToggleProgram:d=>t({type:"TOGGLE_PROGRAM",programId:d})}),n(pr,{currentStep:e.currentStep,totalSteps:Ir,saving:e.saving,onBack:o,onNext:r})]},e.currentStep)]})]}),e.saveResult?.ok&&n(Mr,{message:e.saveResult.message,onNewRegistration:()=>{nt(),globalThis.location.reload()}})]})};var Lr=document.getElementById("registration-app");Lr&&Ke(n(U,{children:[n(Yt,{}),n(jr,{})]}),Lr);
