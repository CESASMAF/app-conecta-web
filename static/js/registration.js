var Hr=Object.defineProperty;var Gr=(e,t)=>{for(var r in t)Hr(e,r,{get:t[r],enumerable:!0})};var Wr={Stringify:1,BeforeStream:2,Stream:3},T=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Ur=/[&<>'"]/,Ee=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let i=o.length-1;r+=o[i],i--,!(i<0);i--){let s=o[i];typeof s=="object"&&t.push(...s.callbacks||[]);let l=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??l)r+=s;else{let d=[r];F(s,d),r=d[0]}}return T(r,t)},F=(e,t)=>{let r=e.search(Ur);if(r===-1){t[0]+=e;return}let o,i,s=0;for(i=r;i<e.length;i++){switch(e.charCodeAt(i)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,i)+o,s=i+1}t[0]+=e.substring(s,i)},Fe=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(i=>i({phase:Wr.Stringify,buffer:r,context:o})),r[0]};var U=Symbol("RENDERER"),te=Symbol("ERROR_HANDLER"),E=Symbol("STASH"),Ce=Symbol("INTERNAL"),ke=Symbol("MEMO"),re=Symbol("PERMALINK");var Ve=e=>(e[Ce]=!0,e);var He=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:Ve(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:Ve(()=>{e.pop()}),props:{}});let i={tag:"",props:o,type:""};return i[te]=s=>{throw e.pop(),s},i},ce=e=>{let t=[e],r=He(t);return r.values=t,r.Provider=r,V.push(r),r};var V=[],ut=e=>{let t=[e],r=o=>{t.push(o.value);let i;try{i=o.children?(Array.isArray(o.children)?new de("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return i instanceof Promise?i.finally(()=>t.pop()).then(s=>T(s,s.callbacks)):(t.pop(),T(i))};return r.values=t,r.Provider=r,r[U]=He(t),V.push(r),r},j=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},me={},H="data-precedence",Ae=e=>e.rel==="stylesheet"&&"precedence"in e,Re=(e,t)=>e==="link"?t:oe[e].length>0;var ue={};Gr(ue,{button:()=>eo,form:()=>Jr,input:()=>Qr,link:()=>Xr,meta:()=>Zr,script:()=>Yr,style:()=>qr,title:()=>Kr});var X=e=>Array.isArray(e)?e:[e];var gt=new WeakMap,ht=(e,t,r,o)=>({buffer:i,context:s})=>{if(!i)return;let l=gt.get(s)||{};gt.set(s,l);let d=l[e]||=[],f=!1,m=oe[e],u=Re(e,o!==void 0);if(u){e:for(let[,p]of d)if(!(e==="link"&&!(p.rel==="stylesheet"&&p[H]!==void 0))){for(let h of m)if((p?.[h]??null)===r?.[h]){f=!0;break e}}}if(f?i[0]=i[0].replaceAll(t,""):u||e==="link"?d.push([t,r,o]):d.unshift([t,r,o]),i[0].indexOf("</head>")!==-1){let p;if(e==="link"||o!==void 0){let h=[];p=d.map(([x,,v],D)=>{if(v===void 0)return[x,Number.MAX_SAFE_INTEGER,D];let O=h.indexOf(v);return O===-1&&(h.push(v),O=h.length-1),[x,O,D]}).sort((x,v)=>x[1]-v[1]||x[2]-v[2]).map(([x])=>x)}else p=d.map(([h])=>h);p.forEach(h=>{i[0]=i[0].replaceAll(h,"")}),i[0]=i[0].replace(/(?=<\/head>)/,p.join(""))}},pe=(e,t,r)=>T(new N(e,r,X(t??[])).toString()),fe=(e,t,r,o)=>{if("itemProp"in r)return pe(e,t,r);let{precedence:i,blocking:s,...l}=r;i=o?i??"":void 0,o&&(l[H]=i);let d=new N(e,l,X(t||[])).toString();return d instanceof Promise?d.then(f=>T(d,[...f.callbacks||[],ht(e,f,l,i)])):T(d,[ht(e,d,l,i)])},Kr=({children:e,...t})=>{let r=De();if(r){let o=j(r);if(o==="svg"||o==="head")return new N("title",t,X(e??[]))}return fe("title",e,t,!1)},Yr=({children:e,...t})=>{let r=De();return["src","async"].some(o=>!t[o])||r&&j(r)==="head"?pe("script",e,t):fe("script",e,t,!1)},qr=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,fe("style",e,t,!0)):pe("style",e,t),Xr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?pe("link",e,t):fe("link",e,t,Ae(t)),Zr=({children:e,...t})=>{let r=De();return r&&j(r)==="head"?pe("meta",e,t):fe("meta",e,t,!1)},bt=(e,{children:t,...r})=>new N(e,r,X(t??[])),Jr=e=>(typeof e.action=="function"&&(e.action=re in e.action?e.action[re]:void 0),bt("form",e)),yt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=re in t.formAction?t.formAction[re]:void 0),bt(e,t)),Qr=e=>yt("input",e),eo=e=>yt("button",e);var to=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),ne=e=>to.get(e)||e,ge=(e,t)=>{for(let[r,o]of Object.entries(e)){let i=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(i,o==null?null:typeof o=="number"?i.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var be,De=()=>be,ro=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,oo=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],no=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Ge=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let i=e[r];if(typeof i=="string")F(i,t);else{if(typeof i=="boolean"||i===null||i===void 0)continue;i instanceof N?i.toStringToBuffer(t):typeof i=="number"||i.isEscaped?t[0]+=i:i instanceof Promise?t.unshift("",i):Ge(i,t)}}},N=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Fe(T(t[0],t.callbacks)).toString():t[0]:Ee(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:i}=this;t[0]+=`<${r}`;let s=be&&j(be)==="svg"?l=>ro(ne(l)):l=>ne(l);for(let[l,d]of Object.entries(o))if(l=s(l),l!=="children"){if(l==="style"&&typeof d=="object"){let f="";ge(d,(m,u)=>{u!=null&&(f+=`${f?";":""}${m}:${u}`)}),t[0]+=' style="',F(f,t),t[0]+='"'}else if(typeof d=="string")t[0]+=` ${l}="`,F(d,t),t[0]+='"';else if(d!=null)if(typeof d=="number"||d.isEscaped)t[0]+=` ${l}="${d}"`;else if(typeof d=="boolean"&&no.includes(l))d&&(t[0]+=` ${l}=""`);else if(l==="dangerouslySetInnerHTML"){if(i.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");i=[T(d.__html)]}else if(d instanceof Promise)t[0]+=` ${l}="`,t.unshift('"',d);else if(typeof d=="function"){if(!l.startsWith("on")&&l!=="ref")throw new Error(`Invalid prop '${l}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${l}="`,F(d.toString(),t),t[0]+='"'}if(oo.includes(r)&&i.length===0){t[0]+="/>";return}t[0]+=">",Ge(i,t),t[0]+=`</${r}>`}},he=class extends N{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let i=this.tag.call(null,o);if(!(typeof i=="boolean"||i==null))if(i instanceof Promise)if(V.length===0)t.unshift("",i);else{let s=V.map(l=>[l,l.values.at(-1)]);t.unshift("",i.then(l=>(l instanceof N&&(l.localContexts=s),l)))}else i instanceof N?i.toStringToBuffer(t):typeof i=="number"||i.isEscaped?(t[0]+=i,i.callbacks&&(t.callbacks||=[],t.callbacks.push(...i.callbacks))):F(i,t)}},de=class extends N{toStringToBuffer(t){Ge(this.children,t)}};var xt=!1,Te=(e,t,r)=>{if(!xt){for(let o in me)ue[o][U]=me[o];xt=!0}return typeof e=="function"?new he(e,t,r):ue[e]?new he(ue[e],t,r):e==="svg"||e==="head"?(be||=ut(""),new N(e,t,[new he(be,{value:e},r)])):new N(e,t,r)};var K=({children:e})=>new de("",{children:e},Array.isArray(e)?e:e?[e]:[]);function n(e,t,r){let o;if(!t||!("children"in t))o=Te(e,t,[]);else{let i=t.children;o=Array.isArray(i)?Te(e,t,i):Te(e,t,[i])}return o.key=r,o}var xe="_hp",io={Change:"Input",DoubleClick:"DblClick"},ao={svg:"2000/svg",math:"1998/Math/MathML"},Z=[],Ue=new WeakMap,ie,kt=()=>ie,G=e=>"t"in e,We={onClick:["click",!1]},St=e=>{if(!e.startsWith("on"))return;if(We[e])return We[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return We[e]=[(io[r]||r).toLowerCase(),!!o]}},vt=(e,t)=>ie&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,At=e=>e==null||e===!1?null:e,so=(e,t)=>{"value"in t&&(e.value=At(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},lo=(e,t,r)=>{t||={};for(let o in t){let i=t[o];if(o!=="children"&&(!r||r[o]!==i)){o=ne(o);let s=St(o);if(s){if(r?.[o]!==i&&(r&&e.removeEventListener(s[0],r[o],s[1]),i!=null)){if(typeof i!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],i,s[1])}}else if(o==="dangerouslySetInnerHTML"&&i)e.innerHTML=i.__html;else if(o==="ref"){let l;typeof i=="function"?l=i(e)||(()=>i(null)):i&&"current"in i&&(i.current=e,l=()=>i.current=null),Ue.set(e,l)}else if(o==="style"){let l=e.style;typeof i=="string"?l.cssText=i:(l.cssText="",i!=null&&ge(i,l.setProperty.bind(l)))}else{if(o==="value"){let d=e.nodeName;if(d==="SELECT")continue;if((d==="INPUT"||d==="TEXTAREA")&&(e.value=At(i),d==="TEXTAREA")){e.textContent=i;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=i);let l=vt(e,o);i==null||i===!1?e.removeAttribute(l):i===!0?e.setAttribute(l,""):typeof i=="string"||typeof i=="number"?e.setAttribute(l,i):e.setAttribute(l,i.toString())}}}if(r)for(let o in r){let i=r[o];if(o!=="children"&&!(o in t)){o=ne(o);let s=St(o);s?e.removeEventListener(s[0],i,s[1]):o==="ref"?Ue.get(e)?.():e.removeAttribute(vt(e,o))}}},co=(e,t)=>{t[E][0]=0,Z.push([e,t]);let r=t.tag[U]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{Z.pop()}},Rt=(e,t,r,o,i)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[E][1][_e]?.forEach(s=>i.push(s)),e.vC.forEach(s=>{if(G(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let l=r.length;if(Rt(s,t,r,o,i),s.s){for(let d=l;d<r.length;d++)r[d].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},mo=e=>{for(;e&&(e.tag===xe||!e.e);)e=e.tag===xe||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Dt=e=>{G(e)||(e[E]?.[1][_e]?.forEach(t=>t[2]?.()),Ue.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Dt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(ye.delete(e),Oe.delete(e),delete e[E][3],e.a=!0)},Ke=(e,t,r)=>{e.c=t,Tt(e,t,r)},$t=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},wt=Symbol(),Tt=(e,t,r)=>{let o=[],i=[],s=[];Rt(e,t,o,i,s),i.forEach(Dt);let l=r?void 0:t.childNodes,d,f=null;if(r)d=-1;else if(!l.length)d=0;else{let m=$t(l,mo(e.nN));m!==void 0?(f=l[m],d=m):d=$t(l,o.find(u=>u.tag!==xe&&u.e)?.e)??-1,d===-1&&(r=!0)}for(let m=0,u=o.length;m<u;m++,d++){let p=o[m],h;if(p.s&&p.e)h=p.e,p.s=!1;else{let x=r||!p.e;G(p)?(p.e&&p.d&&(p.e.textContent=p.t),p.d=!1,h=p.e||=document.createTextNode(p.t)):(h=p.e||=p.n?document.createElementNS(p.n,p.tag):document.createElement(p.tag),lo(h,p.props,p.pP),Tt(p,h,x),p.tag==="select"&&so(h,p.props))}p.tag===xe?d--:r?h.parentNode||t.appendChild(h):l[d]!==h&&l[d-1]!==h&&(l[d+1]===h?t.appendChild(l[d]):t.insertBefore(h,f||l[d]||null))}if(e.pP&&(e.pP=void 0),s.length){let m=[],u=[];s.forEach(([,p,,h,x])=>{p&&m.push(p),h&&u.push(h),x?.()}),m.forEach(p=>p()),u.length&&requestAnimationFrame(()=>{u.forEach(p=>p())})}},po=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Oe=new WeakMap,Pe=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let i;try{r||=typeof t.tag=="function"?co(e,t):X(t.props.children),r[0]?.tag===""&&r[0][te]&&(i=r[0][te],e[5].push([e,i,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,l=[],d;for(let f=0;f<r.length;f++){if(Array.isArray(r[f])){r.splice(f,1,...r[f].flat(1/0)),f--;continue}let m=Ot(r[f]);if(m){typeof m.tag=="function"&&!m.tag[Ce]&&(V.length>0&&(m[E][2]=V.map(p=>[p,p.values.at(-1)])),e[5]?.length&&(m[E][3]=e[5].at(-1)));let u;if(s&&s.length){let p=s.findIndex(G(m)?h=>G(h):m.key!==void 0?h=>h.key===m.key&&h.tag===m.tag:h=>h.tag===m.tag);p!==-1&&(u=s[p],s.splice(p,1))}if(u)if(G(m))u.t!==m.t&&(u.t=m.t,u.d=!0),m=u;else{let p=u.pP=u.props;if(u.props=m.props,u.f||=m.f||t.f,typeof m.tag=="function"){let h=u[E][2];u[E][2]=m[E][2]||[],u[E][3]=m[E][3],!u.f&&((u.o||u)===m.o||u.tag[ke]?.(p,u.props))&&po(h,u[E][2])&&(u.s=!0)}m=u}else if(!G(m)&&ie){let p=j(ie);p&&(m.n=p)}if(!G(m)&&!m.s&&(Pe(e,m),delete m.f),l.push(m),d&&!d.s&&!m.s)for(let p=d;p&&!G(p);p=p.vC?.at(-1))p.nN=m;d=m}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=l,o&&delete t.pC}catch(s){if(t.f=!0,s===wt){if(i)return;throw s}let[l,d,f]=t[E]?.[3]||[];if(d){let m=()=>Se([0,!1,e[2]],f),u=Oe.get(f)||[];u.push(m),Oe.set(f,u);let p=d(s,()=>{let h=Oe.get(f);if(h){let x=h.indexOf(m);if(x!==-1)return h.splice(x,1),m()}});if(p){if(e[0]===1)e[1]=!0;else if(Pe(e,f,[p]),(d.length===1||e!==l)&&f.c){Ke(f,f.c,!1);return}throw wt}}throw s}finally{i&&e[5].pop()}},Ot=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[E]=[0,[]];else{let t=ao[e.tag];t&&(ie||=ce(""),e.props.children=[{tag:ie,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Pt=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Pt(o,t,r)))},Et=(e,t)=>{t[E][2]?.forEach(([r,o])=>{r.values.push(o)});try{Pe(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[E][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Ke(t,t.c,!1)},ye=new WeakMap,Ct=[],Se=async(e,t)=>{e[5]||=[];let r=ye.get(t);r&&r[0](void 0);let o,i=new Promise(s=>o=s);if(ye.set(t,[o,()=>{e[2]?e[2](e,t,s=>{Et(s,t)}).then(()=>o(t)):(Et(e,t),o(t))}]),Ct.length)Ct.at(-1).add(t);else{await Promise.resolve();let s=ye.get(t);s&&(ye.delete(t),s[1]())}return i},fo=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Pe(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();Ke(e,o,!0),Pt(e,o,t),t.replaceChildren(o)},Ye=(e,t)=>{fo(Ot({tag:"",props:{children:e}}),t)};var qe=(e,t,r)=>({tag:xe,props:{children:e},key:r,e:t,p:1});var uo=0,_e=1,go=2,ho=3;var Xe=new WeakMap,Ze=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var bo;var _t=[];var L=e=>{let t=()=>typeof e=="function"?e():e,r=Z.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,i=o[E][1][uo]||=[],s=o[E][0]++;return i[s]||=[t(),l=>{let d=bo,f=i[s];if(typeof l=="function"&&(l=l(f[0])),!Object.is(l,f[0]))if(f[0]=l,_t.length){let[m,u]=_t.at(-1);Promise.all([m===3?o:Se([m,!1,d],o),u]).then(([p])=>{if(!p||!(m===2||m===3))return;let h=p.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===p.vC&&Se([m===3?1:0,!1,d],p)})})})}else Se([0,!1,d],o)}]},Je=(e,t,r)=>{let o=J(l=>{s(d=>e(d,l))},[e]),[i,s]=L(()=>r?r(t):t);return[i,o]},yo=(e,t,r)=>{let o=Z.at(-1);if(!o)return;let[,i]=o,s=i[E][1][_e]||=[],l=i[E][0]++,[d,,f]=s[l]||=[];if(Ze(d,r)){f&&f();let m=()=>{u[e]=void 0,u[2]=t()},u=[r,void 0,void 0,void 0,void 0];u[e]=m,s[l]=u}},Qe=(e,t)=>yo(3,e,t);var J=(e,t)=>{let r=Z.at(-1);if(!r)return e;let[,o]=r,i=o[E][1][go]||=[],s=o[E][0]++,l=i[s];return Ze(l?.[1],t)?i[s]=[e,t]:e=i[s][0],e};var et=e=>{let t=Xe.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>Xe.set(e,[r]),r=>Xe.set(e,[void 0,r])),e},tt=(e,t)=>{let r=Z.at(-1);if(!r)return e();let[,o]=r,i=o[E][1][ho]||=[],s=o[E][0]++,l=i[s];return Ze(l?.[1],t)&&(i[s]=[e(),t]),i[s][0]};var It=ce({pending:!1,data:null,method:null,action:null}),Nt=new Set,Mt=e=>{Nt.add(e),e.finally(()=>Nt.delete(e))};var rt=(e,t)=>tt(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let i=t(r);return()=>{i?.(),o?.()}},[e]),jt=Object.create(null),Lt=Object.create(null),ve=(e,t,r,o,i)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:l,onError:d,precedence:f,blocking:m,...u}=t,p=null,h=!1,x=oe[e],v=Re(e,o),D=$=>$.getAttribute("rel")==="stylesheet"&&$.getAttribute(H)!==null,O;if(v){let $=s.querySelectorAll(e);e:for(let k of $)if(!(e==="link"&&!D(k))){for(let S of x)if(k.getAttribute(S)===t[S]){p=k;break e}}if(!p){let k=x.reduce((S,A)=>t[A]===void 0?S:`${S}-${A}-${t[A]}`,e);h=!Lt[k],p=Lt[k]||=(()=>{let S=document.createElement(e);for(let A of x)t[A]!==void 0&&S.setAttribute(A,t[A]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else O=s.querySelectorAll(e);f=o?f??"":void 0,o&&(u[H]=f);let Y=J($=>{if(v){if(e==="link"&&f!==void 0){let S=!1;for(let A of s.querySelectorAll(e)){let M=A.getAttribute(H);if(M===null){s.insertBefore($,A);return}if(S&&M!==f){s.insertBefore($,A);return}M===f&&(S=!0)}s.appendChild($);return}let k=!1;for(let S of s.querySelectorAll(e)){if(k&&S.getAttribute(H)!==f){s.insertBefore($,S);return}S.getAttribute(H)===f&&(k=!0)}s.appendChild($)}else if(e==="link")s.contains($)||s.appendChild($);else if(O){let k=!1;for(let S of O)if(S===$){k=!0;break}k||s.insertBefore($,s.contains(O[0])?O[0]:s.querySelector(e)),O=void 0}},[v,f,e]),ee=rt(t.ref,$=>{let k=x[0];if(r===2&&($.innerHTML=""),(h||O)&&Y($),!d&&!l||!k)return;let S=jt[$.getAttribute(k)]||=new Promise((A,M)=>{$.addEventListener("load",A),$.addEventListener("error",M)});l&&(S=S.then(l)),d&&(S=S.catch(d)),S.catch(()=>{})});if(i&&m==="render"){let $=oe[e][0];if($&&t[$]){let k=t[$],S=jt[k]||=new Promise((A,M)=>{Y(p),p.addEventListener("load",A),p.addEventListener("error",M)});et(S)}}let P={tag:e,type:e,props:{...u,ref:ee},ref:ee};return P.p=r,p&&(P.e=p),qe(P,s)},xo=e=>{let t=kt();return(t&&j(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ve("title",e,void 0,!1,!1)},So=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ve("script",e,1,!1,!0),vo=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ve("style",e,2,!0,!0)),$o=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ve("link",e,1,Ae(e),!0),wo=e=>ve("meta",e,void 0,!1,!1),zt=Symbol(),Eo=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,i]=L([null,!1]),s=J(async m=>{let u=m.isTrusted?t:m.detail[zt];if(typeof u!="function")return;m.preventDefault();let p=new FormData(m.target);i([p,!0]);let h=u(p);h instanceof Promise&&(Mt(h),await h),i([null,!0])},[]),l=rt(e.ref,m=>(m.addEventListener("submit",s),()=>{m.removeEventListener("submit",s)})),[d,f]=o;return o[1]=!1,{tag:It,props:{value:{pending:d!==null,data:d,method:d?"post":null,action:d?t:null},children:{tag:"form",props:{...r,ref:l},type:"form",ref:l}},f}},Bt=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=J(i=>{i.preventDefault(),i.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[zt]:t}}))},[]);r.ref=rt(r.ref,i=>(i.addEventListener("click",o),()=>{i.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},Co=e=>Bt("input",e),ko=e=>Bt("button",e);Object.assign(me,{title:xo,script:So,style:vo,link:$o,meta:wo,form:Eo,input:Co,button:ko});var Q=":-hono-global",Ro=new RegExp(`^${Q}{(.*)}$`),Ne="hono-css",W=Symbol(),R=Symbol(),I=Symbol(),z=Symbol(),Ie=Symbol(),Ht=Symbol(),zl=Symbol();var Gt=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Wt=e=>e.trim().replace(/\s+/g,"-"),Ut=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),Do=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),To=e=>Ut(e)&&!Do.has(e.toLowerCase()),Kt=e=>{console.warn(`Invalid slug: ${e}`)},Oo=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),Po=new RegExp(["("+Oo+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),_o=e=>e.replace(Po,(t,r,o,i,s)=>r||o||i||s||""),Yt=(e,t)=>{let r=[],o=[],i=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let l=0,d=e.length;l<d;l++){s+=e[l];let f=t[l];if(!(typeof f=="boolean"||f===null||f===void 0)){Array.isArray(f)||(f=[f]);for(let m=0,u=f.length;m<u;m++){let p=f[m];if(!(typeof p=="boolean"||p===null||p===void 0))if(typeof p=="string")/([\\"'\/])/.test(p)?s+=p.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=p;else if(typeof p=="number")s+=p;else if(p[Ht])s+=p[Ht];else if(p[R].startsWith("@keyframes "))r.push(p),s+=` ${p[R].substring(11)} `;else{if(e[l+1]?.match(/^\s*{/))r.push(p),p=`.${p[R]}`;else{r.push(...p[z]),o.push(...p[Ie]),p=p[I];let h=p.length;if(h>0){let x=p[h-1];x!==";"&&x!=="}"&&(p+=";")}}s+=`${p||""}`}}}}return[i,_o(s),r,o]},ae=(e,t,r,o)=>{let[i,s,l,d]=Yt(e,t),f=Ro.exec(s);f&&(s=f[1]);let m=Gt(i+s),u;if(r){let x=r(m,Wt(i),s);x&&(Ut(x)?u=x:(o||Kt)(x))}let p=(f?Q:"")+(u||m),h=(f?l.map(x=>x[R]):[p,...d]).join(" ");return{[W]:p,[R]:h,[I]:s,[z]:l,[Ie]:d}},Me=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[W]:"",[R]:"",[I]:"",[z]:[],[Ie]:[o]})}return e},je=(e,t,r,o)=>{let[i,s]=Yt(e,t),l=Gt(i+s),d;if(r){let f=r(l,Wt(i),s);f&&(To(f)?d=f:(o||Kt)(f))}return{[W]:"",[R]:`@keyframes ${d||l}`,[I]:s,[z]:[],[Ie]:[]}},No=0,Le=(e,t,r,o)=>{e||(e=[`/* h-v-t ${No++} */`]);let i=Array.isArray(e)?ae(e,t,r,o):e,s=i[R],l=ae(["view-transition-name:",""],[s],r,o);return i[R]=Q+i[R],i[I]=i[I].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),l[R]=l[W]=s,l[z]=[...i[z],i],l};var Mo=e=>{let t=[],r=0,o=0;for(let i=0,s=e.length;i<s;i++){let l=e[i];if(l==="'"||l==='"'){let d=l;for(i++;i<s;i++){if(e[i]==="\\"){i++;continue}if(e[i]===d)break}continue}if(l==="{"){o++;continue}if(l==="}"){o--,o===0&&(t.push(e.slice(r,i+1)),r=i+1);continue}}return t},ot=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(l,d)=>{let[f,m]=r();if(!f||!m){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(l,d)});return}m.has(l)||(m.add(l),(l.startsWith(Q)?Mo(d):[`${l[0]==="@"?"":"."}${l}{${d}}`]).forEach(u=>{f.insertRule(u,f.cssRules.length)}))};return[{toString(){let l=this[W];return o(l,this[I]),this[z].forEach(({[R]:d,[I]:f})=>{o(d,f)}),this[R]}},({children:l,nonce:d})=>({tag:"style",props:{id:e,nonce:d,children:l&&(Array.isArray(l)?l:[l]).map(f=>f[I])}})]},jo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,i]=ot({id:e}),s=u=>(u.toString=o.toString,u),l=(u,...p)=>s(ae(u,p,t,r));return{css:l,cx:(...u)=>(u=Me(u),l(Array(u.length).fill(""),...u)),keyframes:(u,...p)=>je(u,p,t,r),viewTransition:(u,...p)=>s(Le(u,p,t,r)),Style:i}},$e=jo({id:Ne}),Vl=$e.css,Hl=$e.cx,Gl=$e.keyframes,Wl=$e.viewTransition,Ul=$e.Style;var Lo=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,i]=ot({id:e}),s=new WeakMap,l=new WeakMap,d=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),f=v=>{let D=({buffer:P,context:$})=>{let[k,S]=s.get($),A=Object.keys(k);if(!A.length)return;let M="";if(A.forEach(q=>{S[q]=!0,M+=q.startsWith(Q)?k[q]:`${q[0]==="@"?"":"."}${q}{${k[q]}}`}),s.set($,[{},S]),P&&d.test(P[0])){P[0]=P[0].replace(d,(q,Fr,Vr)=>`${Fr}${M}${Vr}`);return}let pt=l.get($),ft=`<script${pt?` nonce="${pt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(M)}<\/script>`;if(P){P[0]=`${ft}${P[0]}`;return}return Promise.resolve(ft)},O=({context:P})=>{s.has(P)||s.set(P,[{},{}]);let[$,k]=s.get(P),S=!0;if(k[v[W]]||(S=!1,$[v[W]]=v[I]),v[z].forEach(({[R]:A,[I]:M})=>{k[A]||(S=!1,$[A]=M)}),!S)return Promise.resolve(T("",[D]))},Y=new String(v[R]);Object.assign(Y,v),Y.isEscaped=!0,Y.callbacks=[O];let ee=Promise.resolve(Y);return Object.assign(ee,v),ee.toString=o.toString,ee},m=(v,...D)=>f(ae(v,D,t,r)),u=(...v)=>(v=Me(v),m(Array(v.length).fill(""),...v)),p=(v,...D)=>je(v,D,t,r),h=(v,...D)=>f(Le(v,D,t,r)),x=({children:v,nonce:D}={})=>T(`<style id="${e}"${D?` nonce="${D}"`:""}>${v?v[I]:""}</style>`,[({context:O})=>{l.set(O,D)}]);return x[U]=i,{css:m,cx:u,keyframes:p,viewTransition:h,Style:x}},we=Lo({id:Ne}),c=we.css,C=we.cx,_=we.keyframes,Ql=we.viewTransition,qt=we.Style;var a={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},g=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),i=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${i}, ${t})`},b={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},y={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},B={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},oc={button:c`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:c`box-shadow: -8px 0 40px ${g(a.textPrimary,.3)};`,fab:c`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:c`box-shadow: 0 24px 80px ${a.inputLine};`,modal:c`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},se={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};function Xt(e,t){switch(e){case 0:return zo(t);case 1:return Bo(t);case 2:return Fo(t);case 3:return Vo(t);case 4:return Ho();case 5:return Go();case 6:return Wo(t);default:return new Map}}function zo(e){let t=new Map;return e.fields.firstName.trim()||t.set("firstName","Nome obrigat\xF3rio"),e.fields.lastName.trim()||t.set("lastName","Sobrenome obrigat\xF3rio"),e.fields.motherName.trim()||t.set("motherName","Nome da m\xE3e obrigat\xF3rio"),e.fields.nationality.trim()||t.set("nationality","Nacionalidade obrigat\xF3ria"),e.fields.gender.trim()||t.set("gender","G\xEAnero obrigat\xF3rio"),t}function Bo(e){let t=new Map,r=e.documents.cpf.replace(/\D/g,"");if(r?r.length!==11&&t.set("cpf","CPF deve ter 11 d\xEDgitos"):t.set("cpf","CPF obrigat\xF3rio"),!e.documents.birthDate.trim())t.set("birthDate","Data de nascimento obrigat\xF3ria");else{let s=e.documents.birthDate.replace(/\D/g,"");if(s.length!==8)t.set("birthDate","Data deve estar no formato DD/MM/AAAA");else{let l=s.slice(0,2),d=s.slice(2,4),m=`${s.slice(4,8)}-${d}-${l}`,u=new Date(m);isNaN(u.getTime())||u.getUTCDate()!==Number(l)?t.set("birthDate","Data inv\xE1lida"):u>new Date&&t.set("birthDate","Data n\xE3o pode ser futura")}}let o=[e.documents.rgNumber,e.documents.rgUf,e.documents.rgAgency,e.documents.rgDate],i=o.filter(s=>s.trim().length>0);return i.length>0&&i.length<o.length&&(e.documents.rgNumber.trim()||t.set("rgNumber","N\xFAmero do RG obrigat\xF3rio"),e.documents.rgUf.trim()||t.set("rgUf","UF do RG obrigat\xF3ria"),e.documents.rgAgency.trim()||t.set("rgAgency","\xD3rg\xE3o emissor obrigat\xF3rio"),e.documents.rgDate.trim()||t.set("rgDate","Data de emiss\xE3o obrigat\xF3ria")),t}function Fo(e){let t=new Map;return e.address.housingSituation.trim()||t.set("housingSituation","Situa\xE7\xE3o de moradia obrigat\xF3ria"),e.address.residenceLocation.trim()||t.set("residenceLocation","Localiza\xE7\xE3o da resid\xEAncia obrigat\xF3ria"),e.address.state.trim()||t.set("state","Estado obrigat\xF3rio"),e.address.city.trim()||t.set("city","Cidade obrigat\xF3ria"),t}function Vo(e){let t=new Map;if(e.diagnoses.length===0)return t.set("diagnoses","Ao menos 1 diagn\xF3stico \xE9 obrigat\xF3rio"),t;for(let r=0;r<e.diagnoses.length;r++){let o=e.diagnoses[r];o.code.trim()||t.set(`diagnosis_${r}_code`,"C\xF3digo CID obrigat\xF3rio"),o.date.trim()||t.set(`diagnosis_${r}_date`,"Data do diagn\xF3stico obrigat\xF3ria"),o.description.trim()||t.set(`diagnosis_${r}_description`,"Descri\xE7\xE3o obrigat\xF3ria")}return t}function Ho(){return new Map}function Go(){return new Map}function Wo(e){let t=new Map;return e.intake.ingressType.trim()||t.set("ingressType","Tipo de ingresso obrigat\xF3rio"),e.intake.serviceReason.trim()||t.set("serviceReason","Motivo do atendimento obrigat\xF3rio"),t}var Uo=7;function Ko(e,t,r,o){switch(t){case"fields":return{...e,fields:{...e.fields,[r]:o}};case"documents":return{...e,documents:{...e.documents,[r]:o}};case"address":return{...e,address:{...e.address,[r]:o}};case"specificity":return{...e,specificity:{...e.specificity,[r]:o}};case"intake":return{...e,intake:{...e.intake,[r]:o}};default:return e}}function Zt(e,t){switch(t.type){case"UPDATE_FIELD":return Ko(e,t.section,t.field,t.value);case"NEXT_STEP":{let r=Xt(e.currentStep,e);return r.size>0?{...e,errors:r,showErrors:!0}:e.currentStep>=Uo-1?e:{...e,currentStep:e.currentStep+1,showErrors:!1,errors:new Map}}case"PREV_STEP":return{...e,currentStep:Math.max(0,e.currentStep-1),showErrors:!1,errors:new Map};case"ADD_DIAGNOSIS":{let r={code:"",date:"",description:""};return{...e,diagnoses:[...e.diagnoses,r]}}case"REMOVE_DIAGNOSIS":return{...e,diagnoses:e.diagnoses.filter((r,o)=>o!==t.index)};case"APPLY_QUICK_CID":{let r=e.diagnoses.map((o,i)=>i===t.index?{...o,code:t.code,description:t.description}:o);return{...e,diagnoses:r}}case"UPDATE_DIAGNOSIS_FIELD":{let r=e.diagnoses.map((o,i)=>i===t.index?{...o,[t.field]:t.value}:o);return{...e,diagnoses:r}}case"ADD_FAMILY_MEMBER":return{...e,familyMembers:[...e.familyMembers,t.member]};case"UPDATE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.map((r,o)=>o===t.index?t.member:r)};case"REMOVE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.filter((r,o)=>o!==t.index)};case"TOGGLE_PROGRAM":{let r=e.intake.selectedPrograms,i=r.includes(t.programId)?r.filter(s=>s!==t.programId):[...r,t.programId];return{...e,intake:{...e.intake,selectedPrograms:i}}}case"SAVE_START":return{...e,saving:!0,saveResult:null};case"SAVE_SUCCESS":return{...e,saving:!1,saveResult:{ok:!0,message:t.message}};case"SAVE_FAILURE":return{...e,saving:!1,saveResult:{ok:!1,message:t.message}}}}var Jt={currentStep:0,showErrors:!1,saving:!1,saveResult:null,fields:{firstName:"",lastName:"",socialName:"",motherName:"",nationality:"",gender:"",phoneNumber:""},documents:{cpf:"",nis:"",cnsNumber:"",rgNumber:"",rgUf:"",rgAgency:"",rgDate:"",birthDate:""},address:{housingSituation:"",residenceLocation:"",cep:"",street:"",number:"",complement:"",neighborhood:"",state:"",city:""},diagnoses:[],familyMembers:[],specificity:{selectedIdentity:"",description:"",observations:""},intake:{ingressType:"",originName:"",originContact:"",serviceReason:"",selectedPrograms:[],observation:""},errors:new Map};var nt="registration-wizard-draft";function Qt(e){let t={...e,errors:Array.from(e.errors.entries())};localStorage.setItem(nt,JSON.stringify(t))}function er(){let e=localStorage.getItem(nt);if(!e)return null;let t=JSON.parse(e),r=Array.isArray(t.errors)?new Map(t.errors):new Map;return{...t,errors:r}}function it(){localStorage.removeItem(nt)}var at={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},tr=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Yo=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},rr=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:at});return tr(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},or=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:at});return Yo(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},nr=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:at,body:JSON.stringify(t)});return tr(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var ir={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),or(`/api/v1/patients?${o.toString()}`)},getById:e=>rr(`/api/v1/patients/${e}`),create:e=>nr("/api/v1/patients",e)};var qo=c`
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
`,Xo=c`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: ${b.erode};
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
`,Zo=c`
  font-family: ${b.erode};
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
`,Jo=c`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 12px;
`,Qo=c`
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
`,en=c`
  background: ${g(a.primary,.08)};
  color: ${a.primary};
`,tn=c`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
`,rn=c`
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`,on=c`
  margin-left: auto;
  background: ${a.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: ${se.pill};
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,nn=c`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 12px;
  width: 100%;
`,an=c`
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
`,sn=c`
  font-size: 12px;
  color: ${a.textSageMuted};
  white-space: nowrap;
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,ln=[{id:"familias",icon:"\u2630",label:"Familias",hasBadge:!0,href:"/social-care"},{id:"cadastro",icon:"+",label:"Cadastro",hasBadge:!1,href:"/patient-registration"},{id:"relatorios",icon:"\u25A6",label:"Relatorios",hasBadge:!1,href:"#"},{id:"config",icon:"\u2699",label:"Config",hasBadge:!1,href:"#"}],ar=({userName:e,userInitials:t,familyCount:r,activeItem:o})=>n("nav",{class:qo,"aria-label":"Menu lateral",children:[n("a",{href:"/hub",class:Xo,"aria-label":"Voltar para o Hub",children:"C"}),n("a",{href:"/hub",class:Zo,"aria-label":"Voltar para o Hub",children:"Conecta"}),n("div",{class:Jo,role:"list",children:ln.map(i=>n("a",{class:`${Qo} ${i.id===o?en:""}`,href:i.href,"aria-current":i.id===o?"page":void 0,"aria-label":i.label,role:"listitem",children:[n("span",{class:tn,"aria-hidden":"true",children:i.icon}),n("span",{class:rn,children:i.label}),i.hasBadge&&n("span",{class:on,"aria-label":`${r} familias`,children:r})]},i.id))}),n("div",{class:nn,children:[n("div",{class:an,"aria-hidden":"true",children:t}),n("div",{class:sn,children:e})]})]});var cn=_`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`,dn=c`
  width: 100%;
  max-width: min(90%, 48rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${cn} 400ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,mn=c`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${b.satoshi};
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
`,pn=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  color: ${a.textSageSoft};
  font-weight: ${y.medium};
`,sr=()=>n("div",{class:dn,children:[n("a",{href:"/social-care",class:mn,"aria-label":"Voltar para Fam\xEDlias",children:"\u2190 Voltar para Fam\xEDlias"}),n("span",{class:pn,children:"Rascunho salvo automaticamente"})]});var fn=c`
  font-family: ${b.satoshi};
  font-size: 38px;
  font-weight: ${y.bold};
  color: ${a.textPrimary};
  margin: 0;
  line-height: 1.2;
`,lr=()=>n("h1",{class:fn,children:"Cadastrar Pessoa de Referencia"});var cr=["Pessoais","Docs","Endere\xE7o","Diag.","Fam\xEDlia","Espec.","Ingresso"],dr=7,un=c`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  width: 100%;
  max-width: min(90%, 48rem);
`,gn=c`
  width: 100%;
  height: 3px;
  background: ${g(a.primary,.1)};
  border-radius: 2px;
  overflow: hidden;
`,hn=c`
  height: 100%;
  background: linear-gradient(90deg, ${a.primary}, ${a.primaryDark});
  border-radius: 2px;
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
`,bn=c`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;

  @media (max-width: 600px) {
    display: none;
  }
`,yn=c`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  cursor: default;
`,xn=c`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
`,Sn=c`
  background: ${g(a.primary,.15)};
`,vn=c`
  background: #fff;
  border-color: ${a.primary};
  box-shadow: 0 0 0 3px ${g(a.primary,.12)};
`,$n=c`
  background: ${a.primary};
  box-shadow: 0 0 0 3px ${g(a.primary,.1)};
`,wn=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.75rem);
  white-space: nowrap;
  font-weight: ${y.medium};
  transition: color 150ms ease;
  color: ${a.textSageSoft};
`,En=c`
  color: ${a.textSageSecondary};
  font-weight: ${y.semibold};
`,Cn=c`
  color: ${a.primary};
`,kn=c`
  display: none;
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  color: ${a.textSageSoft};
  text-align: center;
  font-weight: ${y.medium};
  padding: 0.75rem 0;
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);

  @media (max-width: 600px) {
    display: block;
  }
`,mr=({currentStep:e})=>{let t=e/(dr-1)*100;return n(K,{children:[n("div",{class:un,children:[n("div",{class:gn,children:n("div",{class:hn,style:`width: ${t}%`})}),n("div",{class:bn,children:cr.map((r,o)=>{let i=o<e,s=o===e;return n("div",{class:yn,children:[n("div",{class:C(xn,i?$n:s?vn:Sn)}),n("span",{class:C(wn,i?Cn:s?En:void 0),children:r})]},o)})})]}),n("div",{class:kn,children:["Etapa ",e+1," de ",dr," \u2014 ",cr[e]]})]})};var An=c`
  border-radius: ${se.pill};
  font-family: ${b.playfair};
  font-style: italic;
  font-size: 16px;
  padding: 12px 24px;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, background 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`,Rn=c`
  background: ${a.primary};
  color: white;
`,Dn=c`
  background: transparent;
  color: ${a.textPrimary};
  border: 1.5px solid ${a.textPrimary};
`,Tn=c`
  background: transparent;
  color: ${a.danger};
  border: none;
`,On={primary:Rn,secondary:Dn,danger:Tn},st=({variant:e,disabled:t,onClick:r,children:o})=>n("button",{class:C(An,On[e]),disabled:t,onClick:r,type:"button",children:o});var Pn=c`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${B[5]};
`,pr=({currentStep:e,totalSteps:t,saving:r,onBack:o,onNext:i})=>{let s=e===0,l=e===t-1;return n("div",{class:Pn,children:[s?n("div",{}):n(st,{variant:"secondary",onClick:o,disabled:r,children:"Voltar"}),n(st,{variant:"primary",onClick:i,disabled:r,children:l?"Salvar":"Proximo"})]})};var _n=c`
  display: flex;
  flex-direction: column;
  gap: ${B[1]};
  width: 100%;
`,Nn=c`
  font-family: ${b.satoshi};
  font-size: 13px;
  font-weight: ${y.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${a.textMuted};
`,In=c`
  border: none;
  border-bottom: 1px solid ${a.inputLine};
  padding: 8px 0;
  font-family: ${b.satoshi};
  font-size: 16px;
  color: ${a.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${a.textPrimary}; }
  &::placeholder {
    color: ${a.textMuted};
    font-family: ${b.playfair};
    font-style: italic;
    font-weight: 300;
  }
`,Mn=c`
  border-bottom: 2px solid ${a.danger};
  &:focus { border-bottom: 2px solid ${a.danger}; }
`,jn=c`
  font-family: ${b.satoshi};
  font-size: 11px;
  color: ${a.danger};
  margin-top: ${B[1]};
`,Ln=c`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,w=({label:e,value:t,onChange:r,error:o,type:i,disabled:s})=>n("div",{class:C(_n,s?Ln:void 0),children:[n("label",{class:Nn,children:e}),n("input",{class:C(In,o?Mn:void 0),type:i??"text",value:t,onInput:l=>r(l.target.value),disabled:s}),o&&n("span",{class:jn,children:o})]});var zn=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Uc=c`
  grid-column: 1 / -1;
`,fr=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  margin-bottom: 0.375rem;
`,Bn=c`
  display: flex;
  gap: 0.625rem;
  margin-top: 0.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`,Fn=c`
  flex: 1;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid ${g(a.primary,.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${y.medium};
  color: ${a.textSageMuted};

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: ${g(a.primary,.2)};
  }
`,Vn=c`
  background: ${g(a.primary,.08)};
  border-color: ${a.primary};
  color: ${a.primary};
  font-weight: ${y.semibold};
  box-shadow: 0 0 0 3px ${g(a.primary,.08)};
`,Hn=c`
  border-color: ${g(a.dangerAlt,.3)};
`,ur=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.dangerAlt};
  margin-top: 0.25rem;
`,Gn=e=>{let t=e.replace(/\D/g,"").slice(0,11);return t.length<=2?t:t.length<=7?`(${t.slice(0,2)}) ${t.slice(2)}`:`(${t.slice(0,2)}) ${t.slice(2,7)}-${t.slice(7)}`},Wn=e=>e.replace(/\D/g,""),Un=[{value:"MASCULINO",label:"Masculino"},{value:"FEMININO",label:"Feminino"},{value:"OUTRO",label:"Outro"}],Kn=["Brasileira","Naturalizada","Estrangeira"],Yn=c`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${b.satoshi};
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
`,qn=c`
  border-color: ${a.dangerAlt};
`,gr=({fields:e,errors:t,onUpdate:r})=>n("div",{class:zn,children:[n("div",{children:n(w,{label:"Nome",value:e.firstName,onChange:o=>r("firstName",o),error:t.get("firstName")})}),n("div",{children:n(w,{label:"Sobrenome",value:e.lastName,onChange:o=>r("lastName",o),error:t.get("lastName")})}),n("div",{children:n(w,{label:"Nome Social",value:e.socialName,onChange:o=>r("socialName",o)})}),n("div",{children:n(w,{label:"Nome da M\xE3e",value:e.motherName,onChange:o=>r("motherName",o),error:t.get("motherName")})}),n("div",{children:[n("label",{class:fr,children:"Nacionalidade"}),n("select",{class:C(Yn,t.get("nationality")?qn:void 0),value:e.nationality,onChange:o=>r("nationality",o.target.value),"aria-label":"Nacionalidade",children:[n("option",{value:"",children:"Selecione..."}),Kn.map(o=>n("option",{value:o,children:o}))]}),t.get("nationality")&&n("div",{class:ur,children:t.get("nationality")})]}),n("div",{children:[n("label",{class:fr,children:"Sexo"}),n("div",{class:Bn,children:Un.map(o=>n("button",{type:"button",class:C(Fn,e.gender===o.value?Vn:void 0,t.get("gender")&&!e.gender?Hn:void 0),onClick:()=>r("gender",o.value),"aria-label":`Sexo: ${o.label}`,"aria-pressed":e.gender===o.value,children:o.label}))}),t.get("gender")&&n("div",{class:ur,children:t.get("gender")})]}),n("div",{children:n(w,{label:"Telefone",value:Gn(e.phoneNumber),onChange:o=>r("phoneNumber",Wn(o))})})]});var Xn=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Jc=c`
  grid-column: 1 / -1;
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  padding-top: 1rem;
  border-top: 1px solid ${g(a.primary,.08)};
  margin-top: 0.5rem;
`,Zn=c`
  grid-column: 1 / -1;
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: ${g(a.dangerAlt,.06)};
  border: 1px solid ${g(a.dangerAlt,.15)};
  border-radius: 12px;
  font-family: ${b.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${y.medium};
  color: ${a.dangerAlt};
  line-height: 1.4;
`,Jn=e=>{let t=e.replace(/\D/g,"").slice(0,11);return t.length<=3?t:t.length<=8?`${t.slice(0,3)}.${t.slice(3)}`:t.length<=10?`${t.slice(0,3)}.${t.slice(3,8)}.${t.slice(8)}`:`${t.slice(0,3)}.${t.slice(3,8)}.${t.slice(8,10)}-${t.slice(10)}`},Qn=e=>{let t=e.replace(/\D/g,"").slice(0,15);return t.length<=3?t:t.length<=7?`${t.slice(0,3)} ${t.slice(3)}`:t.length<=11?`${t.slice(0,3)} ${t.slice(3,7)} ${t.slice(7)}`:`${t.slice(0,3)} ${t.slice(3,7)} ${t.slice(7,11)} ${t.slice(11)}`};var ei=e=>{let t=e.replace(/\D/g,"").slice(0,11);return t.length<=3?t:t.length<=6?`${t.slice(0,3)}.${t.slice(3)}`:t.length<=9?`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6)}`:`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6,9)}-${t.slice(9)}`},ti=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},ze=e=>e.replace(/\D/g,""),hr=({documents:e,errors:t,onUpdate:r})=>n("div",{class:Xn,children:[t.get("documents")&&n("div",{class:Zn,children:t.get("documents")}),n("div",{children:n(w,{label:"CPF",value:ei(e.cpf),onChange:o=>r("cpf",ze(o)),error:t.get("cpf")})}),n("div",{children:n(w,{label:"NIS",value:Jn(e.nis),onChange:o=>r("nis",ze(o)),error:t.get("nis")})}),n("div",{children:n(w,{label:"CNS",value:Qn(e.cnsNumber),onChange:o=>r("cnsNumber",ze(o)),error:t.get("cnsNumber")})}),n("div",{children:n(w,{label:"Data de Nascimento",value:ti(e.birthDate),onChange:o=>r("birthDate",ze(o)),error:t.get("birthDate")})})]});var ri=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,oi=c`
  grid-column: 1 / -1;
`,lt=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  margin-bottom: 1rem;
`,ni=c`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`,ii=c`
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
`,ai=c`
  background: ${g(a.primary,.08)};
  border-color: ${a.primary};
  box-shadow: 0 0 0 3px ${g(a.primary,.08)};
`,si=c`
  border-color: ${g(a.dangerAlt,.3)};
`,li=c`
  font-size: 1.75rem;
  line-height: 1;
  margin-bottom: 0.25rem;
`,ci=c`
  font-family: ${b.erode};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${y.semibold};
  color: ${a.textSagePrimary};
`,di=c`
  color: ${a.primary};
`,mi=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.6875rem);
  color: ${a.textSageSoft};
  text-align: center;
  line-height: 1.3;
`,pi=c`
  color: ${a.primaryDark};
`,ct=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.dangerAlt};
  margin-top: 0.25rem;
`,br=c`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem);
  background: ${g(a.primary,.06)};
  border: 1px solid ${g(a.primary,.12)};
  border-radius: 12px;
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${y.medium};
  color: ${a.textSageSecondary};
  line-height: 1.4;
`,yr=c`
  font-size: 1rem;
  color: ${a.primary};
  flex-shrink: 0;
`,xr=c`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${b.satoshi};
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
`,le=c`
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
`,id=c`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 0;
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
`,fi=["","AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"],ui=[{value:"",label:"Selecione..."},{value:"Propria",label:"Pr\xF3pria"},{value:"Alugada",label:"Alugada"},{value:"Cedida",label:"Cedida"},{value:"Outros",label:"Outros"}],gi=[{value:"URBANO",icon:"\u{1F3D7}",label:"Urbano",desc:"Resid\xEAncia em \xE1rea urbana"},{value:"RURAL",icon:"\u{1F33E}",label:"Rural",desc:"Resid\xEAncia em \xE1rea rural"},{value:"RUA",icon:"\u{1F6CC}",label:"Situa\xE7\xE3o de Rua",desc:"Pessoa sem moradia fixa"}],hi=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=5?t:`${t.slice(0,5)}-${t.slice(5)}`},Sr=({address:e,errors:t,onUpdate:r})=>{let[o,i]=L(e.residenceLocation),s=o==="RUA",l=o==="RURAL",d=o!=="",f=m=>{i(m),r("residenceLocation",m),m==="RUA"?(r("housingSituation",""),r("street",""),r("number",""),r("complement",""),r("neighborhood",""),r("cep","")):m==="RURAL"&&(r("street",""),r("complement",""))};return n("div",{children:[n("div",{class:oi,style:"margin-bottom: clamp(1.25rem, 1rem + 1vw, 1.5rem)",children:[n("label",{class:lt,children:"Qual a situacao de moradia?"}),n("div",{class:ni,children:gi.map(m=>n("button",{type:"button",class:C(ii,o===m.value?ai:void 0,t.get("residenceLocation")&&!o?si:void 0),onClick:()=>f(m.value),"aria-label":`Moradia: ${m.label}`,"aria-pressed":o===m.value,children:[n("div",{class:li,children:m.icon}),n("div",{class:C(ci,o===m.value?di:void 0),children:m.label}),n("div",{class:C(mi,o===m.value?pi:void 0),children:m.desc})]}))}),t.get("residenceLocation")&&n("div",{class:ct,children:t.get("residenceLocation")})]}),d&&n("div",{class:ri,children:[s&&n("div",{class:br,children:[n("span",{class:yr,children:"\u24D8"}),"Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS."]}),l&&n("div",{class:br,children:[n("span",{class:yr,children:"\u24D8"}),"Rua e Complemento nao se aplicam para area rural."]}),n("div",{class:s?le:void 0,children:[n("label",{class:lt,children:"Tipo de Moradia"}),n("select",{class:xr,value:e.housingSituation,onChange:m=>r("housingSituation",m.target.value),disabled:s,"aria-label":"Tipo de moradia",children:ui.map(m=>n("option",{value:m.value,children:m.label}))}),t.get("housingSituation")&&n("div",{class:ct,children:t.get("housingSituation")})]}),n("div",{class:s?le:void 0,children:n(w,{label:"CEP",value:hi(e.cep),onChange:m=>r("cep",m.replace(/\D/g,"")),error:t.get("cep"),disabled:s})}),n("div",{class:s||l?le:void 0,children:n(w,{label:"Rua",value:e.street,onChange:m=>r("street",m),error:t.get("street"),disabled:s||l})}),n("div",{class:s?le:void 0,children:n(w,{label:"N\xFAmero",value:e.number,onChange:m=>r("number",m),error:t.get("number"),disabled:s})}),n("div",{class:s||l?le:void 0,children:n(w,{label:"Complemento",value:e.complement,onChange:m=>r("complement",m),disabled:s||l})}),n("div",{class:s?le:void 0,children:n(w,{label:"Bairro",value:e.neighborhood,onChange:m=>r("neighborhood",m),error:t.get("neighborhood"),disabled:s})}),n("div",{children:[n("label",{class:lt,children:"Estado"}),n("select",{class:xr,value:e.state,onChange:m=>r("state",m.target.value),"aria-label":"Estado",children:fi.map(m=>n("option",{value:m,children:m||"Selecione..."}))}),t.get("state")&&n("div",{class:ct,children:t.get("state")})]}),n("div",{children:n(w,{label:"Cidade",value:e.city,onChange:m=>r("city",m),error:t.get("city")})})]})]})};var bi=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},yi=e=>e.replace(/\D/g,""),xi=_`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,Si=c`
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
`,vi=c`
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: ${g(a.dangerAlt,.06)};
  border: 1px solid ${g(a.dangerAlt,.15)};
  border-radius: 12px;
  font-family: ${b.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${y.medium};
  color: ${a.dangerAlt};
  line-height: 1.4;
`,$i=c`
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  position: relative;
  animation: ${xi} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,wi=c`
  border-color: ${g(a.primary,.3)};
  background: ${g(a.primary,.04)};
`,Ei=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem) clamp(1rem, 0.875rem + 0.5vw, 1.5rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Ci=c`
  grid-column: 1 / -1;
`,ki=c`
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
`,Ai=c`
  position: absolute;
  top: 0.75rem;
  right: 2.75rem;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: ${b.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.6875rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${a.textSageSoft};
  white-space: nowrap;
`,Ri=c`
  color: ${a.primary};
`,Di=c`
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
`,Ti=c`
  border-color: ${a.primary};
  background: ${a.primary};
  color: #fff;
`,Oi=c`
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`,Pi=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  font-weight: ${y.medium};
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
`,_i=c`
  border-color: ${a.primary};
  color: #fff;
  background: ${a.primary};
  font-weight: ${y.semibold};
`,Ni=c`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px dashed ${g(a.primary,.2)};
  color: ${a.textSageMuted};
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
  border-radius: 12px;
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${a.primary};
    color: ${a.primary};
    background: ${g(a.primary,.08)};
  }
`,Ii=c`
  text-align: center;
  padding: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0;
  color: ${a.textSageSoft};
  font-family: ${b.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
`,Mi=[{code:"G80",desc:"Paralisia cerebral"},{code:"Q90",desc:"S\xEDndrome de Down"},{code:"F84.0",desc:"Autismo"},{code:"E70",desc:"Fenilceton\xFAria"},{code:"G71.0",desc:"Distrofia muscular"},{code:"R69",desc:"Morbidade n/e"},{code:"Z03",desc:"Obs. por suspeita"},{code:"Z03.9",desc:"Obs. n/e"}],vr=({diagnoses:e,errors:t,onUpdateEntry:r,onAddDiagnosis:o,onRemoveDiagnosis:i,onApplyQuickCid:s})=>{let l=d=>d.code.trim()!==""&&d.date.trim().length===10&&d.description.trim()!=="";return n("div",{class:Si,children:[t.get("diagnoses")&&n("div",{class:vi,children:t.get("diagnoses")}),e.length===0&&n("p",{class:Ii,children:"Nenhum diagnostico adicionado. Clique abaixo para adicionar."}),e.map((d,f)=>{let m=l(d);return n("div",{class:C($i,m?wi:void 0),style:`--stagger: ${f*60}ms`,children:[n("div",{class:C(Ai,m?Ri:void 0),children:[n("span",{class:C(Di,m?Ti:void 0),children:"\u2713"}),n("span",{children:m?"Completo":"Pendente"})]}),n("button",{class:ki,type:"button",onClick:()=>i(f),"aria-label":"Remover diagnostico",children:"\xD7"}),n("div",{class:Ei,children:[n("div",{children:n(w,{label:"C\xF3digo CID",value:d.code,onChange:u=>r(f,"code",u),error:t.get(`diagnosis_${f}_code`)})}),n("div",{children:n(w,{label:"Data",value:bi(d.date),onChange:u=>r(f,"date",yi(u)),error:t.get(`diagnosis_${f}_date`)})}),n("div",{class:Ci,children:n(w,{label:"Descri\xE7\xE3o",value:d.description,onChange:u=>r(f,"description",u),error:t.get(`diagnosis_${f}_description`)})}),n("div",{class:Oi,children:Mi.map(u=>n("button",{type:"button",class:C(Pi,d.code===u.code?_i:void 0),onClick:()=>s(f,u.code,u.desc),"aria-label":`CID ${u.code} - ${u.desc}`,children:[u.code," \u2014 ",u.desc]}))})]})]})}),n("button",{class:Ni,type:"button",onClick:o,"aria-label":"Adicionar diagnostico",children:"+ Adicionar diagnostico"})]})};var Rr=_`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,ji=c`
  display: flex;
  flex-direction: column;
`,Li=c`
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  align-items: center;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1.5rem);
  padding: 0.75rem 0;
  border-bottom: 1px solid ${g(a.primary,.08)};
  animation: ${Rr} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
  }
`,$r=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.textSageSoft};
  font-variant-numeric: tabular-nums;
  min-width: 20px;
`,wr=c`
  font-family: ${b.erode};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  font-weight: ${y.semibold};
  color: ${a.textSagePrimary};
`,Er=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};

  @media (max-width: 600px) {
    grid-column: 2;
    font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  }
`,zi=c`
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
`,bd=c`
  text-align: center;
  padding: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0;
  color: ${a.textSageSoft};
  font-family: ${b.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
`,Bi=c`
  border: 1.5px solid ${a.primary};
  border-radius: 16px;
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  margin-top: 0.75rem;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: ${Rr} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Fi=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1rem) clamp(1rem, 0.875rem + 0.5vw, 1.5rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Cr=c`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${b.satoshi};
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
`,kr=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
`,Ar=c`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 0;
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
`,Vi=c`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
`,Hi=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${y.semibold};
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
`,Gi=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${y.semibold};
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
`,Wi=c`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px dashed ${g(a.primary,.2)};
  color: ${a.textSageMuted};
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
  border-radius: 12px;
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  cursor: pointer;
  transition: all 150ms ease;
  margin-top: 0.75rem;

  &:hover {
    border-color: ${a.primary};
    color: ${a.primary};
    background: ${g(a.primary,.08)};
  }
`,Ui=c`
  display: inline-block;
  font-family: ${b.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.1vw, 0.6875rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${a.primary};
  background: ${g(a.primary,.08)};
  padding: 0.125rem 0.5rem;
  border-radius: 100px;
`,Ki=c`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1.5rem);
  padding: 0.75rem 0;
  border-bottom: 1.5px solid ${g(a.primary,.12)};
`,Yi=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},qi=[{value:"CONJUGE",label:"C\xF4njuge / Companheiro(a)"},{value:"FILHO",label:"Filho(a)"},{value:"ENTEADO",label:"Enteado(a)"},{value:"PAI",label:"Pai"},{value:"MAE",label:"M\xE3e"},{value:"AVO",label:"Av\xF4 / Av\xF3"},{value:"NETO",label:"Neto(a)"},{value:"IRMAO",label:"Irm\xE3o / Irm\xE3"},{value:"TIO",label:"Tio(a)"},{value:"SOBRINHO",label:"Sobrinho(a)"},{value:"PRIMO",label:"Primo(a)"},{value:"OUTRO_PARENTE",label:"Outro Parente"},{value:"NAO_PARENTE",label:"N\xE3o Parente"}],Xi=["Masculino","Feminino","Outro"],dt={name:"",birthDate:"",gender:"",relationship:"",livesWithPatient:!0,isDisabled:!1},Dr=({referencePerson:e,familyMembers:t,onAddMember:r,onRemoveMember:o})=>{let[i,s]=L(!1),[l,d]=L(dt),f=()=>{l.name.trim()&&l.relationship.trim()&&(r(l),d(dt),s(!1))},m=()=>{d(dt),s(!1)},u=`${e.firstName} ${e.lastName}`.trim(),p=e.birthDate?Yi(e.birthDate):"";return n("div",{class:ji,children:[n("div",{class:Ki,children:[n("span",{class:$r,children:"01"}),n("div",{children:[n("span",{class:wr,children:u}),n("span",{class:Er,children:[" ","Pessoa de refer\xEAncia | ",e.gender," ",p?`| ${p}`:""]})]}),n("span",{class:Ui,children:"Refer\xEAncia"})]}),t.map((h,x)=>n("div",{class:Li,style:`animation-delay: ${(x+1)*60}ms`,children:[n("span",{class:$r,children:String(x+2).padStart(2,"0")}),n("span",{class:wr,children:h.name}),n("span",{class:Er,children:[h.relationship," | ",h.gender," | ",h.livesWithPatient?"Reside":"N\xE3o reside"]}),n("button",{class:zi,type:"button",onClick:()=>o(x),"aria-label":`Remover ${h.name}`,children:"\xD7"})]})),i&&n("div",{class:Bi,children:[n("div",{class:Fi,children:[n("div",{children:n(w,{label:"Nome",value:l.name,onChange:h=>d({...l,name:h})})}),n("div",{children:n(w,{label:"Data de Nascimento",value:l.birthDate,onChange:h=>d({...l,birthDate:h})})}),n("div",{children:[n("label",{class:kr,children:"Sexo"}),n("select",{class:Cr,value:l.gender,onChange:h=>d({...l,gender:h.target.value}),"aria-label":"Sexo",children:[n("option",{value:"",children:"Selecione..."}),Xi.map(h=>n("option",{value:h,children:h}))]})]}),n("div",{children:[n("label",{class:kr,children:"Parentesco"}),n("select",{class:Cr,value:l.relationship,onChange:h=>d({...l,relationship:h.target.value}),"aria-label":"Parentesco",children:[n("option",{value:"",children:"Selecione..."}),qi.map(h=>n("option",{value:h.value,children:h.label}))]})]}),n("div",{children:n("label",{class:Ar,children:[n("input",{type:"checkbox",checked:l.livesWithPatient,onChange:()=>d({...l,livesWithPatient:!l.livesWithPatient})}),"Reside com o paciente"]})}),n("div",{children:n("label",{class:Ar,children:[n("input",{type:"checkbox",checked:l.isDisabled,onChange:()=>d({...l,isDisabled:!l.isDisabled})}),"Pessoa com defici\xEAncia"]})})]}),n("div",{class:Vi,children:[n("button",{class:Hi,type:"button",onClick:m,children:"Cancelar"}),n("button",{class:Gi,type:"button",onClick:f,"aria-label":"Confirmar membro",children:"Confirmar"})]})]}),!i&&n("button",{class:Wi,type:"button",onClick:()=>s(!0),"aria-label":"Adicionar membro",children:"+ Adicionar membro"})]})};var Zi=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Ji=c`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${b.satoshi};
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
`,Tr=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
`,Qi=c`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid ${g(a.primary,.12)};
  border-radius: 12px;
  padding: 0.75rem;
  font-family: ${b.satoshi};
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
`,ea=c`
  grid-column: 1 / -1;
`,ta=["Quilombola","Indigena","Ribeirinho","Cigano","Extrativista","Pescador artesanal","Pertencente a comunidade de terreiro","Nenhuma das anteriores"],Or=({specificity:e,errors:t,onUpdate:r})=>n("div",{class:Zi,children:[n("div",{children:[n("label",{class:Tr,children:"Identidade Social"}),n("select",{class:Ji,value:e.selectedIdentity,onChange:o=>r("selectedIdentity",o.target.value),"aria-label":"Identidade social",children:[n("option",{value:"",children:"Selecione..."}),ta.map(o=>n("option",{value:o,children:o}))]})]}),n("div",{children:n(w,{label:"Descri\xE7\xE3o",value:e.description,onChange:o=>r("description",o),error:t.get("description")})}),n("div",{class:ea,children:[n("label",{class:Tr,children:"Observa\xE7\xF5es"}),n("textarea",{class:Qi,placeholder:"Informa\xE7\xF5es complementares sobre especificidades...","aria-label":"Observa\xE7\xF5es sobre especificidades",value:e.observations,onInput:o=>r("observations",o.target.value)})]})]});var ra=c`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,Pr=c`
  grid-column: 1 / -1;
`,mt=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
`,oa=c`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${g(a.primary,.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${b.satoshi};
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
`,na=c`
  border-color: ${a.dangerAlt};
`,_r=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${a.dangerAlt};
  margin-top: 0.25rem;
`,Nr=c`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid ${g(a.primary,.12)};
  border-radius: 12px;
  padding: 0.75rem;
  font-family: ${b.satoshi};
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
`,ia=c`
  border-color: ${a.dangerAlt};

  &:focus {
    border-color: ${a.dangerAlt};
  }
`,aa=c`
  grid-column: 1 / -1;
  font-family: ${b.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${y.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${a.textSageSoft};
  padding-top: 1rem;
  border-top: 1px solid ${g(a.primary,.08)};
  margin-top: 0.5rem;
`,sa=c`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,la=c`
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
`,ca=c`
  border-color: ${a.primary};
  background: ${g(a.primary,.08)};
  box-shadow: 0 0 0 3px ${g(a.primary,.08)};
`,da=c`
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
`,ma=c`
  background: ${a.primary};
  border-color: ${a.primary};
  color: #fff;
`,pa=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
`,fa=c`
  color: ${a.primary};
  font-weight: ${y.medium};
`,ua=[{value:"",label:"Selecione..."},{value:"DEMANDA_ESPONTANEA",label:"Demanda espont\xE2nea"},{value:"BUSCA_ATIVA",label:"Busca ativa"},{value:"ENCAMINHAMENTO",label:"Encaminhamento"},{value:"REINCIDENCIA",label:"Reincid\xEAncia"}],ga=[{id:"BPC",label:"BPC (Benef\xEDcio de Presta\xE7\xE3o Continuada)"},{id:"BOLSA_FAMILIA",label:"Bolsa Fam\xEDlia"},{id:"AUXILIO_BRASIL",label:"Aux\xEDlio Brasil"},{id:"PETI",label:"PETI"},{id:"OUTROS",label:"Outros programas"}],Ir=({intake:e,errors:t,onUpdate:r,onToggleProgram:o})=>n("div",{class:ra,children:[n("div",{children:[n("label",{class:mt,children:"Tipo de Ingresso"}),n("select",{class:C(oa,t.get("ingressType")?na:void 0),value:e.ingressType,onChange:i=>r("ingressType",i.target.value),"aria-label":"Tipo de ingresso",children:ua.map(i=>n("option",{value:i.value,children:i.label}))}),t.get("ingressType")&&n("div",{class:_r,children:t.get("ingressType")})]}),n("div",{children:n(w,{label:"Nome da Origem",value:e.originName,onChange:i=>r("originName",i)})}),n("div",{children:n(w,{label:"Contato da Origem",value:e.originContact,onChange:i=>r("originContact",i)})}),n("div",{class:Pr,children:[n("label",{class:mt,children:"Motivo do Atendimento"}),n("textarea",{class:C(Nr,t.get("serviceReason")?ia:void 0),value:e.serviceReason,onInput:i=>r("serviceReason",i.target.value),placeholder:"Descreva o motivo do primeiro atendimento...","aria-label":"Motivo do atendimento"}),t.get("serviceReason")&&n("div",{class:_r,children:t.get("serviceReason")})]}),n("div",{class:aa,children:"Programas sociais vinculados"}),n("div",{class:sa,children:ga.map(i=>{let s=e.selectedPrograms.includes(i.id);return n("button",{type:"button",class:C(la,s?ca:void 0),onClick:()=>o(i.id),"aria-label":`Programa: ${i.label}`,"aria-pressed":s,children:[n("div",{class:C(da,s?ma:void 0),children:"\u2713"}),n("span",{class:C(pa,s?fa:void 0),children:i.label})]})})}),n("div",{class:Pr,children:[n("label",{class:mt,children:"Observa\xE7\xE3o"}),n("textarea",{class:Nr,value:e.observation,onInput:i=>r("observation",i.target.value),placeholder:"Anota\xE7\xF5es gerais sobre o ingresso...","aria-label":"Observa\xE7\xE3o de ingresso"})]})]});var ha=_`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,ba=c`
  display: flex;
  align-items: center;
  gap: ${B[3]};
  padding: ${B[3]} ${B[4]};
  background: ${g(a.danger,.06)};
  border: 1px solid ${g(a.danger,.12)};
  border-radius: ${se.dropdown};
  animation: ${ha} 400ms ease-out;
`,ya=c`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${a.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${b.satoshi};
  font-size: 14px;
  font-weight: ${y.bold};
  flex-shrink: 0;
`,xa=c`
  font-family: ${b.satoshi};
  font-size: 14px;
  color: ${a.danger};
  flex: 1;
`,Sa=c`
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${a.danger};
  font-size: 18px;
  line-height: 1;
  padding: ${B[1]};
  opacity: 0.7;
  &:hover { opacity: 1; }
`,Mr=({message:e,onDismiss:t})=>n("div",{class:ba,role:"alert",children:[n("div",{class:ya,children:"!"}),n("span",{class:xa,children:e}),t&&n("button",{class:Sa,onClick:t,type:"button","aria-label":"Fechar",children:"\xD7"})]});var va=_`
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`,$a=_`
  to { stroke-dashoffset: 0; }
`,wa=_`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`,Be=_`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,Ea=c`
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
  animation: ${Be} 500ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Ca=c`
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
  animation: ${wa} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,ka=c`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${a.primary}, ${a.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(1rem, 0.75rem + 1vw, 1.25rem);
  box-shadow: 0 4px 20px ${g(a.primary,.25)};
  animation: ${va} 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Aa=c`
  width: 28px;
  height: 28px;
  stroke: white;
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: ${$a} 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    stroke-dashoffset: 0;
  }
`,Ra=c`
  font-family: ${b.erode};
  font-size: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  font-weight: ${y.bold};
  color: ${a.textSagePrimary};
  margin-bottom: 0.5rem;
  animation: ${Be} 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Da=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${a.textSageMuted};
  line-height: 1.5;
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  animation: ${Be} 500ms cubic-bezier(0.16, 1, 0.3, 1) 750ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Ta=c`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  animation: ${Be} 500ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Oa=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${y.semibold};
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
`,Pa=c`
  font-family: ${b.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${y.semibold};
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
`,jr=({message:e,onNewRegistration:t})=>n("div",{class:Ea,role:"dialog","aria-label":"Cadastro realizado com sucesso",children:n("div",{class:Ca,children:[n("div",{class:ka,children:n("svg",{class:Aa,viewBox:"0 0 24 24",children:n("polyline",{points:"6 12 10 16 18 8"})})}),n("div",{class:Ra,children:"Cadastro realizado!"}),n("div",{class:Da,children:"A familia foi cadastrada com sucesso no sistema Conecta."}),n("div",{class:Ta,children:[n("button",{class:Oa,type:"button",onClick:t,"aria-label":"Novo cadastro",children:"Novo cadastro"}),n("a",{href:"/social-care",class:Pa,"aria-label":"Ver familias",children:"Ver familias \u2192"})]})]})});var Lr=7,_a=[{number:"Etapa 01",title:"Dados Pessoais",desc:"Informa\xE7\xF5es b\xE1sicas da pessoa de refer\xEAncia."},{number:"Etapa 02",title:"Documentos",desc:"CPF, NIS, CNS e documentos de identifica\xE7\xE3o."},{number:"Etapa 03",title:"Endere\xE7o",desc:"Situa\xE7\xE3o de moradia e localiza\xE7\xE3o."},{number:"Etapa 04",title:"Diagn\xF3sticos",desc:"Pelo menos um diagn\xF3stico \xE9 obrigat\xF3rio."},{number:"Etapa 05",title:"Composi\xE7\xE3o Familiar",desc:"Membros da fam\xEDlia (opcional)."},{number:"Etapa 06",title:"Especificidades (opcional)",desc:"Identidade social, \xE9tnica ou cultural."},{number:"Etapa 07",title:"Ingresso",desc:"Tipo de ingresso e motivo do atendimento."}],Na=c`
  :-hono-global {
    body { background: ${a.bgSageDeep} !important; }
  }
`,Ia=c`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${a.bgBase} 0%, ${a.bgWarm} 25%, ${a.bgSage} 55%, ${a.bgSageDeep} 100%);
`,Ma=c`
  position: fixed;
  top: -10%;
  right: 5%;
  width: min(450px, 50vw);
  height: min(450px, 50vw);
  border-radius: 50%;
  background: radial-gradient(circle, ${g(a.primary,.06)} 0%, transparent 70%);
  z-index: 0;
`,ja=c`
  position: fixed;
  bottom: -15%;
  left: 10%;
  width: min(500px, 55vw);
  height: min(500px, 55vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 160, 100, 0.04) 0%, transparent 70%);
  z-index: 0;
`,La=c`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
`,za=c`
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
`,Ba=_`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,Fa=c`
  background: ${a.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${a.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1.5rem, 1rem + 2vw, 2.75rem);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: min(90%, 48rem);
  animation: ${Ba} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,zr=()=>{let[e,t]=Je(Zt,er()??Jt);Qe(()=>{Qt(e)},[e]);let r=async()=>{if(e.currentStep===Lr-1){t({type:"SAVE_START"});let d=await ir.create(e);d.ok?(it(),t({type:"SAVE_SUCCESS",message:"Cadastro realizado!"})):t({type:"SAVE_FAILURE",message:d.error.message})}else t({type:"NEXT_STEP"})},o=()=>{t({type:"PREV_STEP"})},i=e.showErrors?e.errors:new Map,s=_a[e.currentStep],l=d=>(f,m)=>{t({type:"UPDATE_FIELD",section:d,field:f,value:m})};return n(K,{children:[n("div",{class:Na}),n("div",{class:Ia}),n("div",{class:Ma}),n("div",{class:ja}),n("div",{class:La,children:[n(ar,{userName:"Usuario",userInitials:"US",familyCount:0,activeItem:"cadastro"}),n("main",{class:za,children:[n(sr,{}),n(mr,{currentStep:e.currentStep}),n("div",{class:Fa,children:[s&&n(lr,{stepNumber:s.number,title:s.title,description:s.desc}),e.saveResult&&!e.saveResult.ok&&n(Mr,{message:e.saveResult.message}),e.currentStep===0&&n(gr,{fields:e.fields,errors:i,onUpdate:l("fields")}),e.currentStep===1&&n(hr,{documents:e.documents,errors:i,onUpdate:l("documents")}),e.currentStep===2&&n(Sr,{address:e.address,errors:i,onUpdate:l("address")}),e.currentStep===3&&n(vr,{diagnoses:e.diagnoses,errors:i,onUpdateEntry:(d,f,m)=>{t({type:"UPDATE_DIAGNOSIS_FIELD",index:d,field:f,value:m})},onAddDiagnosis:()=>t({type:"ADD_DIAGNOSIS"}),onRemoveDiagnosis:d=>t({type:"REMOVE_DIAGNOSIS",index:d}),onApplyQuickCid:(d,f,m)=>t({type:"APPLY_QUICK_CID",index:d,code:f,description:m})}),e.currentStep===4&&n(Dr,{referencePerson:{firstName:e.fields.firstName,lastName:e.fields.lastName,birthDate:e.documents.birthDate,gender:e.fields.gender},familyMembers:e.familyMembers,onAddMember:d=>t({type:"ADD_FAMILY_MEMBER",member:d}),onRemoveMember:d=>t({type:"REMOVE_FAMILY_MEMBER",index:d})}),e.currentStep===5&&n(Or,{specificity:e.specificity,errors:i,onUpdate:l("specificity")}),e.currentStep===6&&n(Ir,{intake:e.intake,errors:i,onUpdate:l("intake"),onToggleProgram:d=>t({type:"TOGGLE_PROGRAM",programId:d})}),n(pr,{currentStep:e.currentStep,totalSteps:Lr,saving:e.saving,onBack:o,onNext:r})]},e.currentStep)]})]}),e.saveResult?.ok&&n(jr,{message:e.saveResult.message,onNewRegistration:()=>{it(),globalThis.location.reload()}})]})};var Br=document.getElementById("registration-app");Br&&Ye(n(K,{children:[n(qt,{}),n(zr,{})]}),Br);
