var wo=Object.defineProperty;var ko=(e,t)=>{for(var r in t)wo(e,r,{get:t[r],enumerable:!0})};var Do={Stringify:1,BeforeStream:2,Stream:3},_=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Co=/[&<>'"]/,Le=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let i=o.length-1;r+=o[i],i--,!(i<0);i--){let s=o[i];typeof s=="object"&&t.push(...s.callbacks||[]);let l=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??l)r+=s;else{let d=[r];H(s,d),r=d[0]}}return _(r,t)},H=(e,t)=>{let r=e.search(Co);if(r===-1){t[0]+=e;return}let o,i,s=0;for(i=r;i<e.length;i++){switch(e.charCodeAt(i)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(s,i)+o,s=i+1}t[0]+=e.substring(s,i)},tt=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(i=>i({phase:Do.Stringify,buffer:r,context:o})),r[0]};var J=Symbol("RENDERER"),de=Symbol("ERROR_HANDLER"),w=Symbol("STASH"),Fe=Symbol("INTERNAL"),Be=Symbol("MEMO"),pe=Symbol("PERMALINK");var rt=e=>(e[Fe]=!0,e);var ot=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:rt(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:rt(()=>{e.pop()}),props:{}});let i={tag:"",props:o,type:""};return i[de]=s=>{throw e.pop(),s},i},Se=e=>{let t=[e],r=ot(t);return r.values=t,r.Provider=r,K.push(r),r};var K=[],Tt=e=>{let t=[e],r=o=>{t.push(o.value);let i;try{i=o.children?(Array.isArray(o.children)?new $e("",{},o.children):o.children).toString():""}catch(s){throw t.pop(),s}return i instanceof Promise?i.finally(()=>t.pop()).then(s=>_(s,s.callbacks)):(t.pop(),_(i))};return r.values=t,r.Provider=r,r[J]=ot(t),K.push(r),r},W=e=>e.values.at(-1);var ue={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},ve={},q="data-precedence",je=e=>e.rel==="stylesheet"&&"precedence"in e,ze=(e,t)=>e==="link"?t:ue[e].length>0;var ke={};ko(ke,{button:()=>_o,form:()=>Oo,input:()=>No,link:()=>Io,meta:()=>Po,script:()=>Ro,style:()=>To,title:()=>Ao});var re=e=>Array.isArray(e)?e:[e];var It=new WeakMap,Pt=(e,t,r,o)=>({buffer:i,context:s})=>{if(!i)return;let l=It.get(s)||{};It.set(s,l);let d=l[e]||=[],p=!1,m=ue[e],f=ze(e,o!==void 0);if(f){e:for(let[,u]of d)if(!(e==="link"&&!(u.rel==="stylesheet"&&u[q]!==void 0))){for(let h of m)if((u?.[h]??null)===r?.[h]){p=!0;break e}}}if(p?i[0]=i[0].replaceAll(t,""):f||e==="link"?d.push([t,r,o]):d.unshift([t,r,o]),i[0].indexOf("</head>")!==-1){let u;if(e==="link"||o!==void 0){let h=[];u=d.map(([y,,$],N)=>{if($===void 0)return[y,Number.MAX_SAFE_INTEGER,N];let L=h.indexOf($);return L===-1&&(h.push($),L=h.length-1),[y,L,N]}).sort((y,$)=>y[1]-$[1]||y[2]-$[2]).map(([y])=>y)}else u=d.map(([h])=>h);u.forEach(h=>{i[0]=i[0].replaceAll(h,"")}),i[0]=i[0].replace(/(?=<\/head>)/,u.join(""))}},Ee=(e,t,r)=>_(new B(e,r,re(t??[])).toString()),we=(e,t,r,o)=>{if("itemProp"in r)return Ee(e,t,r);let{precedence:i,blocking:s,...l}=r;i=o?i??"":void 0,o&&(l[q]=i);let d=new B(e,l,re(t||[])).toString();return d instanceof Promise?d.then(p=>_(d,[...p.callbacks||[],Pt(e,p,l,i)])):_(d,[Pt(e,d,l,i)])},Ao=({children:e,...t})=>{let r=Ue();if(r){let o=W(r);if(o==="svg"||o==="head")return new B("title",t,re(e??[]))}return we("title",e,t,!1)},Ro=({children:e,...t})=>{let r=Ue();return["src","async"].some(o=>!t[o])||r&&W(r)==="head"?Ee("script",e,t):we("script",e,t,!1)},To=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,we("style",e,t,!0)):Ee("style",e,t),Io=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?Ee("link",e,t):we("link",e,t,je(t)),Po=({children:e,...t})=>{let r=Ue();return r&&W(r)==="head"?Ee("meta",e,t):we("meta",e,t,!1)},Ot=(e,{children:t,...r})=>new B(e,r,re(t??[])),Oo=e=>(typeof e.action=="function"&&(e.action=pe in e.action?e.action[pe]:void 0),Ot("form",e)),Nt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=pe in t.formAction?t.formAction[pe]:void 0),Ot(e,t)),No=e=>Nt("input",e),_o=e=>Nt("button",e);var Mo=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),fe=e=>Mo.get(e)||e,De=(e,t)=>{for(let[r,o]of Object.entries(e)){let i=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(i,o==null?null:typeof o=="number"?i.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var Ae,Ue=()=>Ae,Lo=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Fo=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Bo=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],nt=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let i=e[r];if(typeof i=="string")H(i,t);else{if(typeof i=="boolean"||i===null||i===void 0)continue;i instanceof B?i.toStringToBuffer(t):typeof i=="number"||i.isEscaped?t[0]+=i:i instanceof Promise?t.unshift("",i):nt(i,t)}}},B=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?tt(_(t[0],t.callbacks)).toString():t[0]:Le(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:i}=this;t[0]+=`<${r}`;let s=Ae&&W(Ae)==="svg"?l=>Lo(fe(l)):l=>fe(l);for(let[l,d]of Object.entries(o))if(l=s(l),l!=="children"){if(l==="style"&&typeof d=="object"){let p="";De(d,(m,f)=>{f!=null&&(p+=`${p?";":""}${m}:${f}`)}),t[0]+=' style="',H(p,t),t[0]+='"'}else if(typeof d=="string")t[0]+=` ${l}="`,H(d,t),t[0]+='"';else if(d!=null)if(typeof d=="number"||d.isEscaped)t[0]+=` ${l}="${d}"`;else if(typeof d=="boolean"&&Bo.includes(l))d&&(t[0]+=` ${l}=""`);else if(l==="dangerouslySetInnerHTML"){if(i.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");i=[_(d.__html)]}else if(d instanceof Promise)t[0]+=` ${l}="`,t.unshift('"',d);else if(typeof d=="function"){if(!l.startsWith("on")&&l!=="ref")throw new Error(`Invalid prop '${l}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${l}="`,H(d.toString(),t),t[0]+='"'}if(Fo.includes(r)&&i.length===0){t[0]+="/>";return}t[0]+=">",nt(i,t),t[0]+=`</${r}>`}},Ce=class extends B{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let i=this.tag.call(null,o);if(!(typeof i=="boolean"||i==null))if(i instanceof Promise)if(K.length===0)t.unshift("",i);else{let s=K.map(l=>[l,l.values.at(-1)]);t.unshift("",i.then(l=>(l instanceof B&&(l.localContexts=s),l)))}else i instanceof B?i.toStringToBuffer(t):typeof i=="number"||i.isEscaped?(t[0]+=i,i.callbacks&&(t.callbacks||=[],t.callbacks.push(...i.callbacks))):H(i,t)}},$e=class extends B{toStringToBuffer(t){nt(this.children,t)}};var _t=!1,Ge=(e,t,r)=>{if(!_t){for(let o in ve)ke[o][J]=ve[o];_t=!0}return typeof e=="function"?new Ce(e,t,r):ke[e]?new Ce(ke[e],t,r):e==="svg"||e==="head"?(Ae||=Tt(""),new B(e,t,[new Ce(Ae,{value:e},r)])):new B(e,t,r)};var me=({children:e})=>new $e("",{children:e},Array.isArray(e)?e:e?[e]:[]);function n(e,t,r){let o;if(!t||!("children"in t))o=Ge(e,t,[]);else{let i=t.children;o=Array.isArray(i)?Ge(e,t,i):Ge(e,t,[i])}return o.key=r,o}var Te="_hp",jo={Change:"Input",DoubleClick:"DblClick"},zo={svg:"2000/svg",math:"1998/Math/MathML"},oe=[],st=new WeakMap,ge,Ut=()=>ge,Y=e=>"t"in e,it={onClick:["click",!1]},Mt=e=>{if(!e.startsWith("on"))return;if(it[e])return it[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return it[e]=[(jo[r]||r).toLowerCase(),!!o]}},Lt=(e,t)=>ge&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Gt=e=>e==null||e===!1?null:e,Uo=(e,t)=>{"value"in t&&(e.value=Gt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Go=(e,t,r)=>{t||={};for(let o in t){let i=t[o];if(o!=="children"&&(!r||r[o]!==i)){o=fe(o);let s=Mt(o);if(s){if(r?.[o]!==i&&(r&&e.removeEventListener(s[0],r[o],s[1]),i!=null)){if(typeof i!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(s[0],i,s[1])}}else if(o==="dangerouslySetInnerHTML"&&i)e.innerHTML=i.__html;else if(o==="ref"){let l;typeof i=="function"?l=i(e)||(()=>i(null)):i&&"current"in i&&(i.current=e,l=()=>i.current=null),st.set(e,l)}else if(o==="style"){let l=e.style;typeof i=="string"?l.cssText=i:(l.cssText="",i!=null&&De(i,l.setProperty.bind(l)))}else{if(o==="value"){let d=e.nodeName;if(d==="SELECT")continue;if((d==="INPUT"||d==="TEXTAREA")&&(e.value=Gt(i),d==="TEXTAREA")){e.textContent=i;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=i);let l=Lt(e,o);i==null||i===!1?e.removeAttribute(l):i===!0?e.setAttribute(l,""):typeof i=="string"||typeof i=="number"?e.setAttribute(l,i):e.setAttribute(l,i.toString())}}}if(r)for(let o in r){let i=r[o];if(o!=="children"&&!(o in t)){o=fe(o);let s=Mt(o);s?e.removeEventListener(s[0],i,s[1]):o==="ref"?st.get(e)?.():e.removeAttribute(Lt(e,o))}}},Wo=(e,t)=>{t[w][0]=0,oe.push([e,t]);let r=t.tag[J]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{oe.pop()}},Wt=(e,t,r,o,i)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[w][1][He]?.forEach(s=>i.push(s)),e.vC.forEach(s=>{if(Y(s))r.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let l=r.length;if(Wt(s,t,r,o,i),s.s){for(let d=l;d<r.length;d++)r[d].s=!0;s.s=!1}}else r.push(s),s.vR?.length&&(o.push(...s.vR),delete s.vR)})},Vo=e=>{for(;e&&(e.tag===Te||!e.e);)e=e.tag===Te||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Vt=e=>{Y(e)||(e[w]?.[1][He]?.forEach(t=>t[2]?.()),st.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Vt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(Re.delete(e),We.delete(e),delete e[w][3],e.a=!0)},at=(e,t,r)=>{e.c=t,Ht(e,t,r)},Ft=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},Bt=Symbol(),Ht=(e,t,r)=>{let o=[],i=[],s=[];Wt(e,t,o,i,s),i.forEach(Vt);let l=r?void 0:t.childNodes,d,p=null;if(r)d=-1;else if(!l.length)d=0;else{let m=Ft(l,Vo(e.nN));m!==void 0?(p=l[m],d=m):d=Ft(l,o.find(f=>f.tag!==Te&&f.e)?.e)??-1,d===-1&&(r=!0)}for(let m=0,f=o.length;m<f;m++,d++){let u=o[m],h;if(u.s&&u.e)h=u.e,u.s=!1;else{let y=r||!u.e;Y(u)?(u.e&&u.d&&(u.e.textContent=u.t),u.d=!1,h=u.e||=document.createTextNode(u.t)):(h=u.e||=u.n?document.createElementNS(u.n,u.tag):document.createElement(u.tag),Go(h,u.props,u.pP),Ht(u,h,y),u.tag==="select"&&Uo(h,u.props))}u.tag===Te?d--:r?h.parentNode||t.appendChild(h):l[d]!==h&&l[d-1]!==h&&(l[d+1]===h?t.appendChild(l[d]):t.insertBefore(h,p||l[d]||null))}if(e.pP&&(e.pP=void 0),s.length){let m=[],f=[];s.forEach(([,u,,h,y])=>{u&&m.push(u),h&&f.push(h),y?.()}),m.forEach(u=>u()),f.length&&requestAnimationFrame(()=>{f.forEach(u=>u())})}},Ho=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),We=new WeakMap,Ve=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let i;try{r||=typeof t.tag=="function"?Wo(e,t):re(t.props.children),r[0]?.tag===""&&r[0][de]&&(i=r[0][de],e[5].push([e,i,t]));let s=o?[...t.pC]:t.vC?[...t.vC]:void 0,l=[],d;for(let p=0;p<r.length;p++){if(Array.isArray(r[p])){r.splice(p,1,...r[p].flat(1/0)),p--;continue}let m=Kt(r[p]);if(m){typeof m.tag=="function"&&!m.tag[Fe]&&(K.length>0&&(m[w][2]=K.map(u=>[u,u.values.at(-1)])),e[5]?.length&&(m[w][3]=e[5].at(-1)));let f;if(s&&s.length){let u=s.findIndex(Y(m)?h=>Y(h):m.key!==void 0?h=>h.key===m.key&&h.tag===m.tag:h=>h.tag===m.tag);u!==-1&&(f=s[u],s.splice(u,1))}if(f)if(Y(m))f.t!==m.t&&(f.t=m.t,f.d=!0),m=f;else{let u=f.pP=f.props;if(f.props=m.props,f.f||=m.f||t.f,typeof m.tag=="function"){let h=f[w][2];f[w][2]=m[w][2]||[],f[w][3]=m[w][3],!f.f&&((f.o||f)===m.o||f.tag[Be]?.(u,f.props))&&Ho(h,f[w][2])&&(f.s=!0)}m=f}else if(!Y(m)&&ge){let u=W(ge);u&&(m.n=u)}if(!Y(m)&&!m.s&&(Ve(e,m),delete m.f),l.push(m),d&&!d.s&&!m.s)for(let u=d;u&&!Y(u);u=u.vC?.at(-1))u.nN=m;d=m}}t.vR=o?[...t.vC,...s||[]]:s||[],t.vC=l,o&&delete t.pC}catch(s){if(t.f=!0,s===Bt){if(i)return;throw s}let[l,d,p]=t[w]?.[3]||[];if(d){let m=()=>Ie([0,!1,e[2]],p),f=We.get(p)||[];f.push(m),We.set(p,f);let u=d(s,()=>{let h=We.get(p);if(h){let y=h.indexOf(m);if(y!==-1)return h.splice(y,1),m()}});if(u){if(e[0]===1)e[1]=!0;else if(Ve(e,p,[u]),(d.length===1||e!==l)&&p.c){at(p,p.c,!1);return}throw Bt}}throw s}finally{i&&e[5].pop()}},Kt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[w]=[0,[]];else{let t=zo[e.tag];t&&(ge||=Se(""),e.props.children=[{tag:ge,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},qt=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>qt(o,t,r)))},jt=(e,t)=>{t[w][2]?.forEach(([r,o])=>{r.values.push(o)});try{Ve(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[w][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&at(t,t.c,!1)},Re=new WeakMap,zt=[],Ie=async(e,t)=>{e[5]||=[];let r=Re.get(t);r&&r[0](void 0);let o,i=new Promise(s=>o=s);if(Re.set(t,[o,()=>{e[2]?e[2](e,t,s=>{jt(s,t)}).then(()=>o(t)):(jt(e,t),o(t))}]),zt.length)zt.at(-1).add(t);else{await Promise.resolve();let s=Re.get(t);s&&(Re.delete(t),s[1]())}return i},Ko=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Ve(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();at(e,o,!0),qt(e,o,t),t.replaceChildren(o)},lt=(e,t)=>{Ko(Kt({tag:"",props:{children:e}}),t)};var ct=(e,t,r)=>({tag:Te,props:{children:e},key:r,e:t,p:1});var qo=0,He=1,Yo=2,Zo=3;var dt=new WeakMap,pt=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var Xo;var Yt=[];var Q=e=>{let t=()=>typeof e=="function"?e():e,r=oe.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,i=o[w][1][qo]||=[],s=o[w][0]++;return i[s]||=[t(),l=>{let d=Xo,p=i[s];if(typeof l=="function"&&(l=l(p[0])),!Object.is(l,p[0]))if(p[0]=l,Yt.length){let[m,f]=Yt.at(-1);Promise.all([m===3?o:Ie([m,!1,d],o),f]).then(([u])=>{if(!u||!(m===2||m===3))return;let h=u.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===u.vC&&Ie([m===3?1:0,!1,d],u)})})})}else Ie([0,!1,d],o)}]},ut=(e,t,r)=>{let o=ne(l=>{s(d=>e(d,l))},[e]),[i,s]=Q(()=>r?r(t):t);return[i,o]},Jo=(e,t,r)=>{let o=oe.at(-1);if(!o)return;let[,i]=o,s=i[w][1][He]||=[],l=i[w][0]++,[d,,p]=s[l]||=[];if(pt(d,r)){p&&p();let m=()=>{f[e]=void 0,f[2]=t()},f=[r,void 0,void 0,void 0,void 0];f[e]=m,s[l]=f}},ft=(e,t)=>Jo(3,e,t);var ne=(e,t)=>{let r=oe.at(-1);if(!r)return e;let[,o]=r,i=o[w][1][Yo]||=[],s=o[w][0]++,l=i[s];return pt(l?.[1],t)?i[s]=[e,t]:e=i[s][0],e};var mt=e=>{let t=dt.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>dt.set(e,[r]),r=>dt.set(e,[void 0,r])),e},gt=(e,t)=>{let r=oe.at(-1);if(!r)return e();let[,o]=r,i=o[w][1][Zo]||=[],s=o[w][0]++,l=i[s];return pt(l?.[1],t)&&(i[s]=[e(),t]),i[s][0]};var Xt=Se({pending:!1,data:null,method:null,action:null}),Zt=new Set,Jt=e=>{Zt.add(e),e.finally(()=>Zt.delete(e))};var ht=(e,t)=>gt(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let i=t(r);return()=>{i?.(),o?.()}},[e]),Qt=Object.create(null),er=Object.create(null),Pe=(e,t,r,o,i)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:l,onError:d,precedence:p,blocking:m,...f}=t,u=null,h=!1,y=ue[e],$=ze(e,o),N=v=>v.getAttribute("rel")==="stylesheet"&&v.getAttribute(q)!==null,L;if($){let v=s.querySelectorAll(e);e:for(let D of v)if(!(e==="link"&&!N(D))){for(let S of y)if(D.getAttribute(S)===t[S]){u=D;break e}}if(!u){let D=y.reduce((S,R)=>t[R]===void 0?S:`${S}-${R}-${t[R]}`,e);h=!er[D],u=er[D]||=(()=>{let S=document.createElement(e);for(let R of y)t[R]!==void 0&&S.setAttribute(R,t[R]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else L=s.querySelectorAll(e);p=o?p??"":void 0,o&&(f[q]=p);let ee=ne(v=>{if($){if(e==="link"&&p!==void 0){let S=!1;for(let R of s.querySelectorAll(e)){let z=R.getAttribute(q);if(z===null){s.insertBefore(v,R);return}if(S&&z!==p){s.insertBefore(v,R);return}z===p&&(S=!0)}s.appendChild(v);return}let D=!1;for(let S of s.querySelectorAll(e)){if(D&&S.getAttribute(q)!==p){s.insertBefore(v,S);return}S.getAttribute(q)===p&&(D=!0)}s.appendChild(v)}else if(e==="link")s.contains(v)||s.appendChild(v);else if(L){let D=!1;for(let S of L)if(S===v){D=!0;break}D||s.insertBefore(v,s.contains(L[0])?L[0]:s.querySelector(e)),L=void 0}},[$,p,e]),ce=ht(t.ref,v=>{let D=y[0];if(r===2&&(v.innerHTML=""),(h||L)&&ee(v),!d&&!l||!D)return;let S=Qt[v.getAttribute(D)]||=new Promise((R,z)=>{v.addEventListener("load",R),v.addEventListener("error",z)});l&&(S=S.then(l)),d&&(S=S.catch(d)),S.catch(()=>{})});if(i&&m==="render"){let v=ue[e][0];if(v&&t[v]){let D=t[v],S=Qt[D]||=new Promise((R,z)=>{ee(u),u.addEventListener("load",R),u.addEventListener("error",z)});mt(S)}}let F={tag:e,type:e,props:{...f,ref:ce},ref:ce};return F.p=r,u&&(F.e=u),ct(F,s)},Qo=e=>{let t=Ut();return(t&&W(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:Pe("title",e,void 0,!1,!1)},en=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:Pe("script",e,1,!1,!0),tn=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,Pe("style",e,2,!0,!0)),rn=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:Pe("link",e,1,je(e),!0),on=e=>Pe("meta",e,void 0,!1,!1),tr=Symbol(),nn=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,i]=Q([null,!1]),s=ne(async m=>{let f=m.isTrusted?t:m.detail[tr];if(typeof f!="function")return;m.preventDefault();let u=new FormData(m.target);i([u,!0]);let h=f(u);h instanceof Promise&&(Jt(h),await h),i([null,!0])},[]),l=ht(e.ref,m=>(m.addEventListener("submit",s),()=>{m.removeEventListener("submit",s)})),[d,p]=o;return o[1]=!1,{tag:Xt,props:{value:{pending:d!==null,data:d,method:d?"post":null,action:d?t:null},children:{tag:"form",props:{...r,ref:l},type:"form",ref:l}},f:p}},rr=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=ne(i=>{i.preventDefault(),i.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[tr]:t}}))},[]);r.ref=ht(r.ref,i=>(i.addEventListener("click",o),()=>{i.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},sn=e=>rr("input",e),an=e=>rr("button",e);Object.assign(ve,{title:Qo,script:en,style:tn,link:rn,meta:on,form:nn,input:sn,button:an});var ie=":-hono-global",cn=new RegExp(`^${ie}{(.*)}$`),Ke="hono-css",Z=Symbol(),O=Symbol(),j=Symbol(),V=Symbol(),qe=Symbol(),ir=Symbol(),Ac=Symbol();var sr=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},ar=e=>e.trim().replace(/\s+/g,"-"),lr=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),dn=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),pn=e=>lr(e)&&!dn.has(e.toLowerCase()),cr=e=>{console.warn(`Invalid slug: ${e}`)},un=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),fn=new RegExp(["("+un+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),mn=e=>e.replace(fn,(t,r,o,i,s)=>r||o||i||s||""),dr=(e,t)=>{let r=[],o=[],i=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let l=0,d=e.length;l<d;l++){s+=e[l];let p=t[l];if(!(typeof p=="boolean"||p===null||p===void 0)){Array.isArray(p)||(p=[p]);for(let m=0,f=p.length;m<f;m++){let u=p[m];if(!(typeof u=="boolean"||u===null||u===void 0))if(typeof u=="string")/([\\"'\/])/.test(u)?s+=u.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=u;else if(typeof u=="number")s+=u;else if(u[ir])s+=u[ir];else if(u[O].startsWith("@keyframes "))r.push(u),s+=` ${u[O].substring(11)} `;else{if(e[l+1]?.match(/^\s*{/))r.push(u),u=`.${u[O]}`;else{r.push(...u[V]),o.push(...u[qe]),u=u[j];let h=u.length;if(h>0){let y=u[h-1];y!==";"&&y!=="}"&&(u+=";")}}s+=`${u||""}`}}}}return[i,mn(s),r,o]},he=(e,t,r,o)=>{let[i,s,l,d]=dr(e,t),p=cn.exec(s);p&&(s=p[1]);let m=sr(i+s),f;if(r){let y=r(m,ar(i),s);y&&(lr(y)?f=y:(o||cr)(y))}let u=(p?ie:"")+(f||m),h=(p?l.map(y=>y[O]):[u,...d]).join(" ");return{[Z]:u,[O]:h,[j]:s,[V]:l,[qe]:d}},Ye=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[Z]:"",[O]:"",[j]:"",[V]:[],[qe]:[o]})}return e},Ze=(e,t,r,o)=>{let[i,s]=dr(e,t),l=sr(i+s),d;if(r){let p=r(l,ar(i),s);p&&(pn(p)?d=p:(o||cr)(p))}return{[Z]:"",[O]:`@keyframes ${d||l}`,[j]:s,[V]:[],[qe]:[]}},gn=0,Xe=(e,t,r,o)=>{e||(e=[`/* h-v-t ${gn++} */`]);let i=Array.isArray(e)?he(e,t,r,o):e,s=i[O],l=he(["view-transition-name:",""],[s],r,o);return i[O]=ie+i[O],i[j]=i[j].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),l[O]=l[Z]=s,l[V]=[...i[V],i],l};var xn=e=>{let t=[],r=0,o=0;for(let i=0,s=e.length;i<s;i++){let l=e[i];if(l==="'"||l==='"'){let d=l;for(i++;i<s;i++){if(e[i]==="\\"){i++;continue}if(e[i]===d)break}continue}if(l==="{"){o++;continue}if(l==="}"){o--,o===0&&(t.push(e.slice(r,i+1)),r=i+1);continue}}return t},xt=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(l,d)=>{let[p,m]=r();if(!p||!m){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(l,d)});return}m.has(l)||(m.add(l),(l.startsWith(ie)?xn(d):[`${l[0]==="@"?"":"."}${l}{${d}}`]).forEach(f=>{p.insertRule(f,p.cssRules.length)}))};return[{toString(){let l=this[Z];return o(l,this[j]),this[V].forEach(({[O]:d,[j]:p})=>{o(d,p)}),this[O]}},({children:l,nonce:d})=>({tag:"style",props:{id:e,nonce:d,children:l&&(Array.isArray(l)?l:[l]).map(p=>p[j])}})]},bn=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,i]=xt({id:e}),s=f=>(f.toString=o.toString,f),l=(f,...u)=>s(he(f,u,t,r));return{css:l,cx:(...f)=>(f=Ye(f),l(Array(f.length).fill(""),...f)),keyframes:(f,...u)=>Ze(f,u,t,r),viewTransition:(f,...u)=>s(Xe(f,u,t,r)),Style:i}},Oe=bn({id:Ke}),Ic=Oe.css,Pc=Oe.cx,Oc=Oe.keyframes,Nc=Oe.viewTransition,_c=Oe.Style;var yn=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,i]=xt({id:e}),s=new WeakMap,l=new WeakMap,d=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),p=$=>{let N=({buffer:F,context:v})=>{let[D,S]=s.get(v),R=Object.keys(D);if(!R.length)return;let z="";if(R.forEach(te=>{S[te]=!0,z+=te.startsWith(ie)?D[te]:`${te[0]==="@"?"":"."}${te}{${D[te]}}`}),s.set(v,[{},S]),F&&d.test(F[0])){F[0]=F[0].replace(d,(te,vo,Eo)=>`${vo}${z}${Eo}`);return}let At=l.get(v),Rt=`<script${At?` nonce="${At}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(z)}<\/script>`;if(F){F[0]=`${Rt}${F[0]}`;return}return Promise.resolve(Rt)},L=({context:F})=>{s.has(F)||s.set(F,[{},{}]);let[v,D]=s.get(F),S=!0;if(D[$[Z]]||(S=!1,v[$[Z]]=$[j]),$[V].forEach(({[O]:R,[j]:z})=>{D[R]||(S=!1,v[R]=z)}),!S)return Promise.resolve(_("",[N]))},ee=new String($[O]);Object.assign(ee,$),ee.isEscaped=!0,ee.callbacks=[L];let ce=Promise.resolve(ee);return Object.assign(ce,$),ce.toString=o.toString,ce},m=($,...N)=>p(he($,N,t,r)),f=(...$)=>($=Ye($),m(Array($.length).fill(""),...$)),u=($,...N)=>Ze($,N,t,r),h=($,...N)=>p(Xe($,N,t,r)),y=({children:$,nonce:N}={})=>_(`<style id="${e}"${N?` nonce="${N}"`:""}>${$?$[j]:""}</style>`,[({context:L})=>{l.set(L,N)}]);return y[J]=i,{css:m,cx:f,keyframes:u,viewTransition:h,Style:y}},Ne=yn({id:Ke}),a=Ne.css,Uc=Ne.cx,se=Ne.keyframes,Gc=Ne.viewTransition,pr=Ne.Style;var A={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.5)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},Sn=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),i=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${i}, ${t})`},g={satoshi:"'Satoshi', sans-serif",playfair:"'Playfair Display', serif",erode:"'Erode', serif"},x={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},M={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Kc={button:a`
    box-shadow:
      2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12),
      -1px -1px 4px rgba(0, 0, 0, 0.06);
  `,panel:a`
    box-shadow: -8px 0 40px ${Sn(A.textPrimary,.3)};
  `,fab:a`
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  `,dialog:a`
    box-shadow: 0 24px 80px ${A.inputLine};
  `,modal:a`
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.04),
      -9px 9px 9px -0.5px rgba(0, 0, 0, 0.04),
      -18px 18px 18px -1.5px rgba(0, 0, 0, 0.08),
      -37px 37px 37px -3px rgba(0, 0, 0, 0.16),
      -75px 75px 75px -6px rgba(0, 0, 0, 0.24),
      -150px 150px 150px -12px rgba(0, 0, 0, 0.48);
  `},_e={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var c={bgBase:"#F8F3EC",bgWarm:"#F0E8DC",bgSage:"#E2E8DF",bgSageDeep:"#D4DDD0",bgCard:"rgba(255,255,255,0.45)",bgCardHover:"rgba(255,255,255,0.65)",bgCardBorder:"rgba(255,255,255,0.6)",bgCardBorderHover:"rgba(79,132,72,0.2)",textPrimary:"#1E2B1A",textSecondary:"#3D5235",textMuted:"#6B7F65",textSoft:"#8B9E85",textLabel:"#5A7154",greenPrimary:"#4F8448",greenDark:"#3D6A37",greenLight:"rgba(79,132,72,0.08)",danger:"#C4422B",dangerLight:"rgba(196,66,43,0.08)",dangerBorder:"rgba(196,66,43,0.15)",inputBorder:"rgba(79,132,72,0.15)",inputBorderFilled:"rgba(79,132,72,0.3)",cardShadow:"0 2px 12px rgba(0,0,0,0.04)",buttonShadow:"0 2px 12px rgba(79,132,72,0.2)",buttonShadowHover:"0 4px 20px rgba(79,132,72,0.3)",successCircleShadow:"0 4px 20px rgba(79,132,72,0.25)",overlayShadow:"0 8px 40px rgba(0,0,0,0.06)"},E={sm:"8px",md:"12px",lg:"16px",xl:"20px"},b={out:"cubic-bezier(0.16, 1, 0.3, 1)",spring:"cubic-bezier(0.34, 1.56, 0.64, 1)"};var Xc=a`
  border: none;
  border-bottom: 2px solid ${A.inputLine};
  background: transparent;
  padding: ${M[2]} 0;
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${x.regular};
  color: ${A.textPrimary};
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease;
  &:focus {
    border-bottom-color: ${A.primary};
  }
`,Jc=a`
  border-bottom-color: ${A.danger};
  &:focus {
    border-bottom-color: ${A.danger};
  }
`,Qc=a`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.bold};
  color: ${A.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,ed=a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${A.primary};
  color: ${A.surfaceLight};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${x.medium};
  border: none;
  border-radius: ${_e.pill};
  padding: ${M[3]} ${M[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
  &:active {
    opacity: 0.8;
  }
`,td=a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${A.primary};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${x.medium};
  border: 2px solid ${A.primary};
  border-radius: ${_e.pill};
  padding: ${M[3]} ${M[5]};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${A.primary};
    color: ${A.surfaceLight};
  }
`,rd=a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${A.danger};
  color: ${A.surfaceLight};
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${x.medium};
  border: none;
  border-radius: ${_e.pill};
  padding: ${M[3]} ${M[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
`,od=a`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,nd=a`
  background: ${A.surface};
  border-radius: ${_e.card};
  padding: ${M[4]};
  transition: box-shadow 0.2s ease;
`,id=a`
  &:hover {
    box-shadow:
      2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12),
      -1px -1px 4px rgba(0, 0, 0, 0.06);
    }
  `,sd=a`
    display: flex;
    flex-direction: column;
    gap: ${M[3]};
  `,ad=a`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${M[3]};
  `,ld=a`
    display: flex;
    align-items: center;
    justify-content: center;
  `,cd=a`
    font-family: ${g.satoshi};
    font-weight: ${x.bold};
    color: ${A.textPrimary};
    line-height: 1.2;
  `,dd=a`
    font-family: ${g.satoshi};
    font-weight: ${x.regular};
    font-size: 16px;
    color: ${A.textPrimary};
    line-height: 1.5;
  `,pd=a`
    font-family: ${g.satoshi};
    font-size: 11px;
    color: ${A.textMuted};
    line-height: 1.4;
  `,ud=a`
    font-family: ${g.satoshi};
    font-size: 11px;
    color: ${A.danger};
    line-height: 1.4;
  `,fd=a`
    font-family: ${g.satoshi};
    font-size: 10px;
    font-weight: ${x.bold};
    color: ${A.textMuted};
    text-transform: uppercase;
    letter-spacing: 1.5px;
  `,md=a`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: ${M[4]} 48px;

    @media (max-width: 1200px) {
      padding: ${M[4]} 40px;
    }

    @media (max-width: 600px) {
      padding: ${M[3]} 20px;
    }
  `,T=a`
    border: none;
    border-bottom: 1.5px solid ${c.inputBorder};
    background: transparent;
    padding: 10px 0;
    font-family: ${g.satoshi};
    font-size: 15px;
    font-weight: ${x.regular};
    color: ${c.textPrimary};
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
    &:focus {
      border-bottom-color: ${c.greenPrimary};
    }
    &::placeholder {
      color: ${c.textSoft};
      font-style: italic;
    }
  `,U=a`
    border-bottom-color: ${c.danger};
    &:focus {
      border-bottom-color: ${c.danger};
    }
  `,k=a`
    font-family: ${g.satoshi};
    font-size: 12px;
    font-weight: ${x.semibold};
    color: ${c.textLabel};
    text-transform: uppercase;
    letter-spacing: 1px;
  `,xe=a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${c.greenPrimary}, ${c.greenDark});
    color: white;
    font-family: ${g.satoshi};
    font-size: 14px;
    font-weight: ${x.semibold};
    border: none;
    border-radius: 100px;
    padding: 12px 28px;
    cursor: pointer;
    box-shadow: ${c.buttonShadow};
    transition: transform 0.2s ${b.out}, box-shadow 0.2s ${b.out};
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${c.buttonShadowHover};
    }
    &:active {
      transform: translateY(0);
    }
    &:focus-visible {
      outline: 2px solid ${c.greenPrimary};
      outline-offset: 2px;
    }
  `,X=a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: ${c.textMuted};
    font-family: ${g.satoshi};
    font-size: 14px;
    font-weight: ${x.semibold};
    border: 1.5px solid rgba(79, 132, 72, 0.2);
    border-radius: 100px;
    padding: 10px 20px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
    &:hover {
      border-color: rgba(79, 132, 72, 0.4);
      color: ${c.textSecondary};
    }
    &:focus-visible {
      outline: 2px solid ${c.greenPrimary};
      outline-offset: 2px;
    }
  `,ur=a`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `,Je=a`
    background: ${c.bgCard};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${c.bgCardBorder};
    border-radius: ${E.xl};
    padding: ${M[5]};
    box-shadow: ${c.cardShadow};
  `,gd=a`
    transition: border-color 0.2s ease, background 0.2s ease;
    &:hover {
      background: ${c.bgCardHover};
      border-color: ${c.bgCardBorderHover};
    }
  `,fr=a`
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: ${E.lg};
    padding: ${M[5]};
    position: relative;
  `,mr=a`
    border-color: rgba(79, 132, 72, 0.3);
    background: rgba(79, 132, 72, 0.04);
  `,gr=a`
    font-family: ${g.erode};
    font-weight: ${x.bold};
    color: ${c.textPrimary};
    line-height: 1.2;
  `,hd=a`
    font-family: ${g.satoshi};
    font-weight: ${x.regular};
    font-size: 15px;
    color: ${c.textPrimary};
    line-height: 1.5;
  `,hr=a`
    font-family: ${g.satoshi};
    font-size: 14px;
    color: ${c.textMuted};
    line-height: 1.5;
  `,I=a`
    font-family: ${g.satoshi};
    font-size: 12.5px;
    color: ${c.danger};
    margin-top: 4px;
  `,C=se`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`,xr=se`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`,ae=se`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`,br=se`
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`,yr=se`
  to { stroke-dashoffset: 0; }
`,Sr=se`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`,G=a`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 24px;
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  `,P=a`
    grid-column: 1 / -1;
  `;var Qe={currentStep:0,showErrors:!1,saving:!1,saveResult:null,fields:{firstName:"",lastName:"",socialName:"",motherName:"",nationality:"",sex:"",phone:"",birthDate:"",gender:"",phoneNumber:""},documents:{cpf:"",nis:"",cnsNumber:"",rgNumber:"",rgUf:"",rgAgency:"",rgDate:"",birthDate:""},address:{locationType:null,housingSituation:"",residenceLocation:"",isShelter:!1,isHomeless:!1,cep:"",street:"",number:"",complement:"",neighborhood:"",state:"",city:""},diagnoses:[],familyMembers:[],specificity:{selectedIdentity:"",description:""},intake:{ingressType:"",originName:"",originContact:"",serviceReason:"",selectedPrograms:[],observation:""},errors:new Map};function $r(e,t){switch(e){case 0:return $n(t);case 1:return vn(t);case 2:return En(t);case 3:return wn(t);case 4:return kn();case 5:return Dn();case 6:return Cn(t);default:return new Map}}function $n(e){let t=new Map;e.fields.firstName.trim()||t.set("firstName","Nome obrigat\xF3rio"),e.fields.lastName.trim()||t.set("lastName","Sobrenome obrigat\xF3rio"),e.fields.motherName.trim()||t.set("motherName","Nome da m\xE3e obrigat\xF3rio"),e.fields.nationality.trim()||t.set("nationality","Nacionalidade obrigat\xF3ria"),(e.fields.sex||e.fields.gender).trim()||t.set("gender","Sexo obrigat\xF3rio");let o=e.fields.birthDate.trim();if(o){let i=o.replace(/\D/g,"");if(i.length!==8)t.set("birthDate","Data deve ter 8 d\xEDgitos (DD/MM/AAAA)");else{let s=i.slice(0,2),l=i.slice(2,4),d=i.slice(4,8),p=new Date(`${d}-${l}-${s}T00:00:00`);isNaN(p.getTime())||p.getDate()!==Number(s)?t.set("birthDate","Data inv\xE1lida"):p>new Date&&t.set("birthDate","Data n\xE3o pode ser futura")}}return t}function vn(e){let t=new Map,r=e.documents.cpf.replace(/\D/g,"");if(r&&r.length!==11&&t.set("cpf","CPF deve ter 11 d\xEDgitos"),!e.documents.birthDate.trim())t.set("birthDate","Data de nascimento obrigat\xF3ria");else{let l=e.documents.birthDate.replace(/\D/g,"");if(l.length!==8)t.set("birthDate","Data deve ter 8 d\xEDgitos (DD/MM/AAAA)");else{let d=l.slice(0,2),p=l.slice(2,4),m=l.slice(4,8),f=new Date(`${m}-${p}-${d}T00:00:00`);isNaN(f.getTime())||f.getDate()!==Number(d)?t.set("birthDate","Data inv\xE1lida"):f>new Date&&t.set("birthDate","Data n\xE3o pode ser futura")}}let o=[e.documents.rgNumber,e.documents.rgUf,e.documents.rgAgency,e.documents.rgDate],i=o.filter(l=>l.trim().length>0);i.length>0&&i.length<o.length&&(e.documents.rgNumber.trim()||t.set("rgNumber","N\xFAmero do RG obrigat\xF3rio"),e.documents.rgUf.trim()||t.set("rgUf","UF do RG obrigat\xF3ria"),e.documents.rgAgency.trim()||t.set("rgAgency","\xD3rg\xE3o emissor obrigat\xF3rio"),e.documents.rgDate.trim()||t.set("rgDate","Data de emiss\xE3o obrigat\xF3ria"));let s=i.length===o.length;return!r&&!e.documents.nis.trim()&&!s&&t.set("cpf","Informe ao menos um documento (CPF, NIS ou RG)"),t}function En(e){let t=new Map,r=e.address;return r.locationType===null&&!r.residenceLocation.trim()&&t.set("locationType","Selecione o tipo de localiza\xE7\xE3o"),r.locationType==="URBANO"?(r.housingSituation.trim()||t.set("housingSituation","Situa\xE7\xE3o de moradia obrigat\xF3ria"),r.state.trim()||t.set("state","Estado obrigat\xF3rio"),r.city.trim()||t.set("city","Cidade obrigat\xF3ria")):r.locationType==="RURAL"||r.locationType==="RUA"?(r.state.trim()||t.set("state","Estado obrigat\xF3rio"),r.city.trim()||t.set("city","Cidade obrigat\xF3ria")):r.residenceLocation.trim()&&(r.housingSituation.trim()||t.set("housingSituation","Situa\xE7\xE3o de moradia obrigat\xF3ria"),r.state.trim()||t.set("state","Estado obrigat\xF3rio"),r.city.trim()||t.set("city","Cidade obrigat\xF3ria")),t}function wn(e){let t=new Map;if(e.diagnoses.length===0)return t.set("diagnoses","Ao menos 1 diagn\xF3stico \xE9 obrigat\xF3rio"),t;for(let r=0;r<e.diagnoses.length;r++){let o=e.diagnoses[r];o&&(o.code.trim()||t.set(`diagnosis_${r}_code`,"C\xF3digo CID obrigat\xF3rio"),o.date.trim()||t.set(`diagnosis_${r}_date`,"Data do diagn\xF3stico obrigat\xF3ria"),o.description.trim()||t.set(`diagnosis_${r}_description`,"Descri\xE7\xE3o obrigat\xF3ria"))}return t}function kn(){return new Map}function Dn(){return new Map}function Cn(e){let t=new Map;return e.intake.ingressType.trim()||t.set("ingressType","Tipo de ingresso obrigat\xF3rio"),e.intake.serviceReason.trim()||t.set("serviceReason","Motivo do atendimento obrigat\xF3rio"),t}var vr=7;function An(e,t,r,o){switch(t){case"fields":return{...e,fields:{...e.fields,[r]:o}};case"documents":return{...e,documents:{...e.documents,[r]:o}};case"address":return{...e,address:{...e.address,[r]:o}};case"specificity":return{...e,specificity:{...e.specificity,[r]:o}};case"intake":return{...e,intake:{...e.intake,[r]:o}};default:return e}}function Er(e,t){switch(t.type){case"UPDATE_FIELD":return An(e,t.section,t.field,t.value);case"NEXT_STEP":{let r=$r(e.currentStep,e);return r.size>0?{...e,errors:r,showErrors:!0}:e.currentStep>=vr-1?e:{...e,currentStep:e.currentStep+1,showErrors:!1,errors:new Map}}case"PREV_STEP":return{...e,currentStep:Math.max(0,e.currentStep-1),showErrors:!1,errors:new Map};case"ADD_DIAGNOSIS":{let r={code:"",date:"",description:"",quickCidId:null};return{...e,diagnoses:[...e.diagnoses,r]}}case"REMOVE_DIAGNOSIS":return{...e,diagnoses:e.diagnoses.filter((r,o)=>o!==t.index)};case"UPDATE_DIAGNOSIS_FIELD":{let r=e.diagnoses.map((o,i)=>i===t.index?{...o,[t.field]:t.value}:o);return{...e,diagnoses:r}}case"APPLY_QUICK_CID":{let r=e.diagnoses.map((o,i)=>i===t.index?{...o,code:t.code,description:t.description,quickCidId:t.code}:o);return{...e,diagnoses:r}}case"ADD_FAMILY_MEMBER":return{...e,familyMembers:[...e.familyMembers,t.member]};case"UPDATE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.map((r,o)=>o===t.index?t.member:r)};case"REMOVE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.filter((r,o)=>o!==t.index)};case"TOGGLE_ADDRESS_FLAG":return{...e,address:{...e.address,[t.field]:!e.address[t.field]}};case"TOGGLE_PROGRAM":{let r=e.intake.selectedPrograms,i=r.includes(t.programId)?r.filter(s=>s!==t.programId):[...r,t.programId];return{...e,intake:{...e.intake,selectedPrograms:i}}}case"SAVE_START":return{...e,saving:!0,saveResult:null};case"SAVE_SUCCESS":return{...e,saving:!1,saveResult:{ok:!0,message:t.message}};case"SAVE_FAILURE":return{...e,saving:!1,saveResult:{ok:!1,message:t.message}};case"SET_LOCATION_TYPE":{let r=t.locationType,o={...e.address,locationType:r,residenceLocation:r==="RUA"?"":r,isHomeless:r==="RUA"};return r==="RUA"?{...e,address:{...o,street:"",complement:"",neighborhood:"",cep:"",housingSituation:"",isShelter:!1}}:r==="RURAL"?{...e,address:{...o,street:"",complement:""}}:{...e,address:o}}case"GO_TO_STEP":return{...e,currentStep:Math.max(0,Math.min(vr-1,t.step)),showErrors:!1,errors:new Map};case"SET_ERRORS":return{...e,errors:t.errors,showErrors:!0};case"CLEAR_ERRORS":return{...e,errors:new Map,showErrors:!1};case"LOAD_DRAFT":return t.state;case"RESET":return Qe}}var bt="registration-wizard-draft";function wr(e){let t={...e,errors:Array.from(e.errors.entries())};localStorage.setItem(bt,JSON.stringify(t))}function kr(){let e=localStorage.getItem(bt);if(!e)return null;let t=JSON.parse(e),r=Array.isArray(t.errors)?new Map(t.errors):new Map;return{...t,errors:r}}function Dr(){localStorage.removeItem(bt)}var yt={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Cr=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Rn=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Ar=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:yt});return Cr(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Rr=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:yt});return Rn(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Tr=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:yt,body:JSON.stringify(t)});return Cr(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var Ir={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),Rr(`/api/v1/patients?${o.toString()}`)},getById:e=>Ar(`/api/v1/patients/${e}`),create:e=>Tr("/api/v1/patients",e)};var Tn=[{id:"familias",icon:"\u{1F3E0}",label:"Familias"},{id:"cadastro",icon:"\u2795",label:"Cadastro"},{id:"relatorios",icon:"\u{1F4CA}",label:"Relatorios"},{id:"config",icon:"\u2699\uFE0F",label:"Configuracoes"}],Or=a`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(79, 132, 72, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  z-index: 100;
  overflow: hidden;
  transition: width 300ms ${b.out};
  &:hover {
    width: 220px;
  }
  @media (max-width: 600px) {
    display: none;
  }
`,In=a`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  flex: 1;
  padding: 0 10px;
  margin-top: 24px;
`,Pn=a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${E.sm};
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${x.medium};
  color: ${c.textMuted};
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
  &:hover {
    background: rgba(79, 132, 72, 0.06);
    color: ${c.textSecondary};
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,On=a`
  background: ${c.greenLight};
  color: ${c.greenPrimary};
  font-weight: ${x.semibold};
  &:hover {
    background: ${c.greenLight};
    color: ${c.greenPrimary};
  }
`,Nn=a`
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
`,_n=a`
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 200ms ${b.out}, transform 200ms ${b.out};
`,Pr=a`
  ${Or} :hover & {
    opacity: 1;
    transform: translateX(0);
  }
`,Mn=a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  width: 100%;
  border-top: 1px solid rgba(79, 132, 72, 0.08);
  margin-top: auto;
`,Ln=a`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${c.greenLight};
  border: 1.5px solid rgba(79, 132, 72, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${x.semibold};
  color: ${c.greenPrimary};
  flex-shrink: 0;
`,Fn=a`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.medium};
  color: ${c.textSecondary};
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 200ms ${b.out}, transform 200ms ${b.out};
`,Nr=({activeItem:e,userName:t="Usuario",userInitials:r="U"})=>n("nav",{class:Or,"aria-label":"Menu principal",children:[n("div",{class:In,children:Tn.map(o=>n("a",{href:o.id==="familias"?"/social-care":`/${o.id}`,class:`${Pn} ${o.id===e?On:""}`,"aria-current":o.id===e?"page":void 0,children:[n("span",{class:Nn,"aria-hidden":"true",children:o.icon}),n("span",{class:`${_n} ${Pr}`,children:o.label})]}))}),n("div",{class:Mn,children:[n("span",{class:Ln,"aria-hidden":"true",children:r}),n("span",{class:`${Fn} ${Pr}`,children:t})]})]});var Bn=a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
`,jn=a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${x.medium};
  color: ${c.textMuted};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ${b.out};
  &:hover {
    color: ${c.textSecondary};
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
    border-radius: ${E.sm};
  }
`,zn=a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${x.medium};
  color: ${c.textSoft};
`,Un=a`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${c.greenPrimary};
`,_r=({backHref:e="/social-care",draftSaved:t=!1})=>n("div",{class:Bn,children:[n("a",{href:e,class:jn,"aria-label":"Voltar para Familias",children:[n("span",{"aria-hidden":"true",children:"\u2190"}),"Voltar para Familias"]}),t&&n("span",{class:zn,children:[n("span",{class:Un,"aria-hidden":"true"}),"Rascunho salvo automaticamente"]})]});var Mr=7,Lr=["Dados Pessoais","Documentos","Endereco","Diagnosticos","Familia","Especificidades","Ingresso"],Gn=a`
  width: 100%;
  height: 3px;
  background: rgba(79, 132, 72, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
`,Wn=a`
  height: 100%;
  background: linear-gradient(90deg, ${c.greenPrimary}, ${c.greenDark});
  border-radius: 2px;
  transition: width 400ms ${b.out};
`,Vn=a`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
  @media (max-width: 600px) {
    display: none;
  }
`,Hn=a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  cursor: default;
`,Kn=a`
  cursor: pointer;
  &:focus-visible {
    outline: none;
  }
`,St=a`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ${b.out};
  flex-shrink: 0;
`,qn=a`
  ${St} background: ${c.greenPrimary};
  border: 2px solid ${c.greenPrimary};
`,Yn=a`
  ${St} background: transparent;
  border: 2px solid ${c.greenPrimary};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.12);
`,Zn=a`
  ${St} background: transparent;
  border: 2px solid rgba(79, 132, 72, 0.2);
`,Fr=a`
  font-family: ${g.satoshi};
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  transition: color 200ms ease;
`,Xn=a`
  ${Fr} color: ${c.greenPrimary};
  font-weight: ${x.semibold};
`,Jn=a`
  ${Fr} color: ${c.textSoft};
  font-weight: ${x.medium};
`,Qn=()=>n("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none","aria-hidden":"true",children:n("path",{d:"M2 5.5L4 7.5L8 3",stroke:"white","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round"})}),ei=()=>n("span",{style:{width:"8px",height:"8px",borderRadius:"50%",background:c.greenPrimary},"aria-hidden":"true"}),ti=({index:e,label:t,status:r,onClick:o})=>{let i=r==="completed"&&o,s=r==="completed"?qn:r==="current"?Yn:Zn,l=r==="pending"?Jn:Xn;return n("div",{class:`${Hn} ${i?Kn:""}`,role:i?"button":void 0,tabIndex:i?0:void 0,onClick:i?o:void 0,onKeyDown:i?d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),o&&o())}:void 0,"aria-label":i?`Voltar para etapa ${e+1}: ${t}`:void 0,children:[n("div",{class:s,children:[r==="completed"&&n(Qn,{}),r==="current"&&n(ei,{})]}),n("span",{class:l,children:t})]})},ri=a`
  display: none;
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.medium};
  color: ${c.textMuted};
  text-align: center;
  @media (max-width: 600px) {
    display: block;
  }
`,Br=({currentStep:e,onGoToStep:t})=>{let r=`${e/(Mr-1)*100}%`;return n("div",{role:"navigation","aria-label":"Progresso do cadastro",children:[n("div",{class:Gn,children:n("div",{class:Wn,style:{width:r}})}),n("div",{class:Vn,children:Lr.map((o,i)=>{let s=i<e?"completed":i===e?"current":"pending";return n(ti,{index:i,label:o,status:s,onClick:s==="completed"&&t?()=>t(i):void 0})})}),n("div",{class:ri,children:["Etapa ",e+1," de ",Mr," \u2014"," ",Lr[e]]})]})};var oi=a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(79, 132, 72, 0.08);
`,ni=a`
  ${X};
`,ii=a`
  ${xe};
`,si=a`
  visibility: hidden;
`,jr=({currentStep:e,isLastStep:t,saving:r,onBack:o,onNext:i})=>{let s=e===0,l=r?"Salvando...":t?"Salvar Cadastro":"Proximo \u2192";return n("div",{class:oi,children:[n("button",{type:"button",class:`${ni} ${s?si:""}`,onClick:o,disabled:r,"aria-label":"Voltar para etapa anterior",children:"\u2190 Anterior"}),n("button",{type:"button",class:`${ii} ${r?ur:""}`,onClick:i,disabled:r,"aria-label":t?"Salvar cadastro":"Avancar para proxima etapa",children:l})]})};var zr=a`
  position: fixed;
  inset: 0;
  background: rgba(248, 243, 236, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 500ms ${b.out};
`,ai=a`
  ${zr} opacity: 1;
  pointer-events: auto;
`,li=a`
  ${Je} border-radius: ${E.xl};
  padding: 48px 56px;
  text-align: center;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
  animation: ${Sr} 800ms ${b.spring};
  @media (max-width: 600px) {
    padding: 32px 24px;
    margin: 16px;
  }
`,ci=a`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${c.greenPrimary}, ${c.greenDark});
  box-shadow: ${c.successCircleShadow};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: ${br} 600ms ${b.spring};
`,di=a`
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: ${yr} 500ms ${b.out} 400ms forwards;
`,pi=()=>n("div",{class:ci,children:n("svg",{width:"28",height:"28",viewBox:"0 0 28 28",fill:"none","aria-hidden":"true",children:n("path",{class:di,d:"M7 14.5L12 19.5L21 9.5",stroke:"white","stroke-width":"2.5","stroke-linecap":"round","stroke-linejoin":"round"})})}),ui=a`
  font-family: ${g.erode};
  font-size: 24px;
  font-weight: ${x.bold};
  color: ${c.textPrimary};
  margin: 0 0 8px;
  animation: ${C} 500ms ${b.out} 600ms both;
`,fi=a`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${c.textMuted};
  line-height: 1.5;
  margin: 0 0 24px;
  animation: ${C} 500ms ${b.out} 750ms both;
`,mi=a`
  display: flex;
  gap: 12px;
  justify-content: center;
  animation: ${C} 500ms ${b.out} 900ms both;
`,gi=a`
  ${X};
`,hi=a`
  ${xe};
`,Ur=({visible:e,onNewRegistration:t,onViewFamilies:r})=>n("div",{class:e?ai:zr,role:"dialog","aria-modal":"true","aria-labelledby":"success-title",children:n("div",{class:li,children:[n(pi,{}),n("h2",{id:"success-title",class:ui,children:"Cadastro realizado!"}),n("p",{class:fi,children:"A familia foi cadastrada com sucesso no sistema Conecta."}),n("div",{class:mi,children:[n("button",{type:"button",class:gi,onClick:t,children:"Novo cadastro"}),n("button",{type:"button",class:hi,onClick:r,children:"Ver familias \u2192"})]})]})});var Gr=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,$t=a`
  color: ${c.danger};
`,be=({label:e,name:t,placeholder:r,required:o,full:i,value:s,error:l,maxLength:d,onInput:p})=>n("div",{class:`${Gr} ${i?P:""}`,children:[n("label",{class:k,for:t,children:[e,o&&n("span",{class:$t,children:"*"})]}),n("input",{id:t,name:t,type:"text",class:`${T} ${l?U:""}`,value:s,placeholder:r,maxLength:d,onInput:m=>p(m.target.value)}),l&&n("span",{class:I,role:"alert",children:l})]}),xi=a`
  ${T} appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B9E85' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  padding-right: 24px;
  cursor: pointer;
`,bi=({label:e,name:t,required:r,value:o,error:i,options:s,onInput:l})=>n("div",{class:Gr,children:[n("label",{class:k,for:t,children:[e,r&&n("span",{class:$t,children:"*"})]}),n("select",{id:t,name:t,class:`${xi} ${i?U:""}`,value:o,onChange:d=>l(d.target.value),children:s.map(d=>n("option",{value:d.value,children:d.label},d.value))}),i&&n("span",{class:I,role:"alert",children:i})]}),yi=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,Si=a`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`,Wr=a`
  flex: 1;
  padding: 14px 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(79, 132, 72, 0.1);
  border-radius: ${E.md};
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${x.medium};
  color: ${c.textMuted};
  cursor: pointer;
  transition: all 150ms ${b.out};
  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,$i=a`
  ${Wr} background: ${c.greenLight};
  border-color: ${c.greenPrimary};
  color: ${c.greenPrimary};
  font-weight: ${x.semibold};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`,vi=a`
  border-color: rgba(196, 66, 43, 0.3);
`,Ei=({options:e,selected:t,onSelect:r,error:o,label:i})=>n("div",{class:`${yi} ${P}`,children:[n("span",{class:k,children:[i,n("span",{class:$t,children:"*"})]}),n("div",{class:Si,role:"radiogroup","aria-label":i,children:e.map(s=>{let l=t===s.value;return n("div",{role:"radio","aria-checked":l?"true":"false",tabIndex:0,class:`${l?$i:Wr} ${o&&!l?vi:""}`,onClick:()=>r(s.value),onKeyDown:d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),r(s.value))},children:s.label})})}),o&&n("span",{class:I,role:"alert",children:o})]}),wi=[{value:"",label:"Selecione..."},{value:"Brasileira",label:"Brasileira"},{value:"Naturalizada",label:"Naturalizada"},{value:"Estrangeira",label:"Estrangeira"}],ki=[{value:"MASCULINO",label:"Masculino"},{value:"FEMININO",label:"Feminino"},{value:"OUTRO",label:"Outro"}],Di=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},Ci=e=>e.replace(/\D/g,""),Ai=a`
  animation: ${C} 500ms ${b.out};
`,Vr=({fields:e,errors:t,onUpdate:r})=>n("div",{class:Ai,children:n("div",{class:G,children:[n(be,{label:"Nome",name:"firstName",placeholder:"Nome do paciente",required:!0,value:e.firstName,error:t.get("firstName"),onInput:o=>r("firstName",o)}),n(be,{label:"Sobrenome",name:"lastName",placeholder:"Sobrenome",required:!0,value:e.lastName,error:t.get("lastName"),onInput:o=>r("lastName",o)}),n(be,{label:"Nome social",name:"socialName",placeholder:"Nome social (opcional)",value:e.socialName,onInput:o=>r("socialName",o)}),n(be,{label:"Nome da mae",name:"motherName",placeholder:"Nome completo da mae",required:!0,value:e.motherName,error:t.get("motherName"),onInput:o=>r("motherName",o)}),n(be,{label:"Data de nascimento",name:"birthDate",placeholder:"DD/MM/AAAA",required:!0,value:Di(e.birthDate),error:t.get("birthDate"),onInput:o=>r("birthDate",Ci(o))}),n(bi,{label:"Nacionalidade",name:"nationality",required:!0,value:e.nationality,error:t.get("nationality"),options:wi,onInput:o=>r("nationality",o)}),n(Ei,{label:"Sexo",options:ki,selected:e.sex||null,onSelect:o=>r("sex",o),error:t.get("sex")}),n(be,{label:"Telefone",name:"phone",placeholder:"(00) 00000-0000",value:e.phone,onInput:o=>r("phone",o)})]})});var Ri=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,Ti=a`
  color: ${c.danger};
`,le=({label:e,name:t,placeholder:r,required:o,full:i,value:s,error:l,onInput:d})=>n("div",{class:`${Ri} ${i?P:""}`,children:[n("label",{class:k,for:t,children:[e,o&&n("span",{class:Ti,children:"*"})]}),n("input",{id:t,name:t,type:"text",class:`${T} ${l?U:""}`,value:s,placeholder:r,onInput:p=>d(p.target.value)}),l&&n("span",{class:I,role:"alert",children:l})]}),Ii=a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(196, 66, 43, 0.06);
  border: 1px solid ${c.dangerBorder};
  border-radius: ${E.md};
  animation: ${ae} 500ms ${b.out};
`,Pi=a`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${c.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.bold};
  flex-shrink: 0;
`,Oi=a`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.medium};
  color: ${c.danger};
  line-height: 1.4;
`,Ni=({message:e})=>e?n("div",{class:Ii,role:"alert",children:[n("span",{class:Pi,"aria-hidden":"true",children:"!"}),n("span",{class:Oi,children:e})]}):null,_i=a`
  display: flex;
  align-items: center;
  gap: 8px;
  grid-column: 1 / -1;
  margin-top: 8px;
`,Mi=a`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${x.semibold};
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 100px;
  background: ${c.greenLight};
  color: ${c.greenPrimary};
`,Li=a`
  font-family: ${g.erode};
  font-size: 13px;
  font-weight: ${x.semibold};
  color: ${c.textSecondary};
`,Fi=e=>{let t=e.replace(/\D/g,"").slice(0,11);return t.length<=3?t:t.length<=6?`${t.slice(0,3)}.${t.slice(3)}`:t.length<=9?`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6)}`:`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6,9)}-${t.slice(9)}`},Bi=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},Hr=e=>e.replace(/\D/g,""),ji=a`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${C} 500ms ${b.out};
`,Kr=({documents:e,errors:t,onUpdate:r})=>n("div",{class:ji,children:[t.get("documents")&&n(Ni,{message:t.get("documents")??""}),n("div",{class:G,children:[n(le,{label:"CPF",name:"cpf",placeholder:"000.000.000-00",value:Fi(e.cpf),error:t.get("cpf"),onInput:o=>r("cpf",Hr(o))}),n(le,{label:"NIS",name:"nis",placeholder:"Numero do NIS",value:e.nis,error:t.get("nis"),onInput:o=>r("nis",o)}),n(le,{label:"CNS",name:"cnsNumber",placeholder:"Numero do CNS",value:e.cnsNumber,error:t.get("cnsNumber"),onInput:o=>r("cnsNumber",o)}),n("div",{class:_i,children:[n("span",{class:Mi,children:"RG"}),n("span",{class:Li,children:"Preencha todos ou nenhum"})]}),n(le,{label:"Numero do RG",name:"rgNumber",placeholder:"Numero",value:e.rgNumber,error:t.get("rgNumber"),onInput:o=>r("rgNumber",o)}),n(le,{label:"UF",name:"rgUf",placeholder:"Estado emissor",value:e.rgUf,error:t.get("rgUf"),onInput:o=>r("rgUf",o)}),n(le,{label:"Orgao emissor",name:"rgAgency",placeholder:"Ex: SSP",value:e.rgAgency,error:t.get("rgAgency"),onInput:o=>r("rgAgency",o)}),n(le,{label:"Data de emissao",name:"rgDate",placeholder:"DD/MM/AAAA",value:Bi(e.rgDate),error:t.get("rgDate"),onInput:o=>r("rgDate",Hr(o))})]})]});var Yr=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,vt=a`
  color: ${c.danger};
`,ye=({label:e,name:t,placeholder:r,required:o,full:i,value:s,error:l,onInput:d})=>n("div",{class:`${Yr} ${i?P:""}`,children:[n("label",{class:k,for:t,children:[e,o&&n("span",{class:vt,children:"*"})]}),n("input",{id:t,name:t,type:"text",class:`${T} ${l?U:""}`,value:s,placeholder:r,onInput:p=>d(p.target.value)}),l&&n("span",{class:I,role:"alert",children:l})]}),zi=a`
  ${T} appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B9E85' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  padding-right: 24px;
  cursor: pointer;
`,qr=({label:e,name:t,required:r,value:o,error:i,options:s,onInput:l})=>n("div",{class:Yr,children:[n("label",{class:k,for:t,children:[e,r&&n("span",{class:vt,children:"*"})]}),n("select",{id:t,name:t,class:`${zi} ${i?U:""}`,value:o,onChange:d=>l(d.target.value),children:s.map(d=>n("option",{value:d.value,children:d.label},d.value))}),i&&n("span",{class:I,role:"alert",children:i})]}),Ui=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: 1 / -1;
`,Gi=a`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`,Zr=a`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px 16px;
  min-height: 100px;
  gap: 4px;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(79, 132, 72, 0.1);
  border-radius: ${E.md};
  cursor: pointer;
  transition: all 150ms ${b.out};
  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,Wi=a`
  ${Zr} background: ${c.greenLight};
  border-color: ${c.greenPrimary};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`,Vi=a`
  border-color: rgba(196, 66, 43, 0.3);
`,Hi=a`
  font-size: 28px;
  margin-bottom: 4px;
`,Xr=a`
  font-family: ${g.erode};
  font-size: 14px;
  font-weight: ${x.semibold};
  color: ${c.textPrimary};
`,Ki=a`
  ${Xr} color: ${c.greenPrimary};
`,Jr=a`
  font-family: ${g.satoshi};
  font-size: 11px;
  color: ${c.textSoft};
  text-align: center;
  line-height: 1.3;
`,qi=a`
  ${Jr} color: ${c.greenDark};
`,Yi=[{type:"URBANO",icon:"\u{1F3D7}\uFE0F",label:"Urbano",description:"Zona urbana do municipio"},{type:"RURAL",icon:"\u{1F33E}",label:"Rural",description:"Zona rural ou distrito"},{type:"RUA",icon:"\u{1F6CC}",label:"Rua",description:"Pessoa em situacao de rua"}],Zi=({icon:e,label:t,description:r,selected:o,hasError:i,onSelect:s})=>n("div",{role:"radio","aria-checked":o?"true":"false",tabIndex:0,class:`${o?Wi:Zr} ${i&&!o?Vi:""}`,onClick:s,onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),s())},children:[n("span",{class:Hi,"aria-hidden":"true",children:e}),n("span",{class:o?Ki:Xr,children:t}),n("span",{class:o?qi:Jr,children:r})]}),Xi=a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(79, 132, 72, 0.06);
  border: 1px solid rgba(79, 132, 72, 0.12);
  border-radius: ${E.md};
  grid-column: 1 / -1;
  animation: ${ae} 500ms ${b.out};
`,Ji=a`
  font-size: 16px;
  color: ${c.greenPrimary};
  flex-shrink: 0;
`,Qi=a`
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${x.medium};
  color: ${c.textSecondary};
  line-height: 1.4;
`,es={RURAL:"Rua e Complemento nao se aplicam para area rural.",RUA:"Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS."},ts=a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(196, 66, 43, 0.06);
  border: 1px solid ${c.dangerBorder};
  border-radius: ${E.md};
  animation: ${ae} 500ms ${b.out};
`,rs=a`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${c.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.bold};
  flex-shrink: 0;
`,os=a`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.medium};
  color: ${c.danger};
  line-height: 1.4;
`,ns=[{value:"",label:"Selecione..."},...["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(e=>({value:e,label:e}))],is=[{value:"",label:"Selecione..."},{value:"PROPRIA",label:"Propria"},{value:"ALUGADA",label:"Alugada"},{value:"CEDIDA",label:"Cedida"},{value:"SITUACAO_DE_RUA",label:"Situacao de rua"},{value:"OUTROS",label:"Outros"}],ss=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=5?t:`${t.slice(0,5)}-${t.slice(5)}`},as=a`
  animation: ${C} 400ms ${b.out};
`,ls=a`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${C} 500ms ${b.out};
`,Qr=({address:e,errors:t,onUpdate:r,onSetLocationType:o})=>{let i=e.locationType,s=i==="URBANO",l=i==="RURAL",d=i!==null;return n("div",{class:ls,children:[t.get("address")&&n("div",{class:ts,role:"alert",children:[n("span",{class:rs,"aria-hidden":"true",children:"!"}),n("span",{class:os,children:t.get("address")})]}),n("div",{class:G,children:[n("div",{class:Ui,children:[n("span",{class:k,children:["Tipo de localizacao",n("span",{class:vt,children:"*"})]}),n("div",{class:Gi,role:"radiogroup","aria-label":"Tipo de localizacao",children:Yi.map(p=>n(Zi,{type:p.type,icon:p.icon,label:p.label,description:p.description,selected:i===p.type,hasError:!!t.get("locationType")||!!t.get("residenceLocation"),onSelect:()=>o(p.type)}))}),(t.get("locationType")||t.get("residenceLocation"))&&n("span",{class:I,role:"alert",children:t.get("locationType")||t.get("residenceLocation")})]}),(i==="RURAL"||i==="RUA")&&n("div",{class:Xi,role:"status",children:[n("span",{class:Ji,"aria-hidden":"true",children:"\u2139"}),n("span",{class:Qi,children:es[i]})]}),d&&n("div",{class:`${G} ${P} ${as}`,children:[s&&n(qr,{label:"Situacao de moradia",name:"housingSituation",required:!0,value:e.housingSituation,error:t.get("housingSituation"),options:is,onInput:p=>r("housingSituation",p)}),(s||l)&&n(ye,{label:"CEP",name:"cep",placeholder:"00000-000",value:ss(e.cep),error:t.get("cep"),onInput:p=>r("cep",p.replace(/\D/g,""))}),s&&n(me,{children:[n(ye,{label:"Rua",name:"street",placeholder:"Nome da rua",value:e.street,error:t.get("street"),onInput:p=>r("street",p)}),n(ye,{label:"Numero",name:"addressNumber",placeholder:"Numero",value:e.number,error:t.get("number"),onInput:p=>r("number",p)}),n(ye,{label:"Complemento",name:"complement",placeholder:"Apto, bloco, etc.",value:e.complement,onInput:p=>r("complement",p)})]}),(s||l)&&n(ye,{label:"Bairro",name:"neighborhood",placeholder:"Bairro",value:e.neighborhood,error:t.get("neighborhood"),onInput:p=>r("neighborhood",p)}),n(qr,{label:"Estado",name:"addressState",required:!0,value:e.state,error:t.get("state"),options:ns,onInput:p=>r("state",p)}),n(ye,{label:"Cidade",name:"city",placeholder:"Nome da cidade",required:!0,value:e.city,error:t.get("city"),onInput:p=>r("city",p)})]})]})]})};var cs=[{code:"G80",description:"Paralisia cerebral"},{code:"Q90",description:"Sindrome de Down"},{code:"F84.0",description:"Autismo infantil"},{code:"E70",description:"Fenilcetonuria"},{code:"G71.0",description:"Distrofia muscular"},{code:"R69",description:"Causas desconhecidas de morbidade"},{code:"Z03",description:"Observacao e avaliacao medica"},{code:"Z03.9",description:"Observacao por suspeita nao especificada"}],ds=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},ps=e=>e.replace(/\D/g,""),us=a`
  position: absolute;
  top: 12px;
  right: 44px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
`,eo=a`
  font-family: ${g.satoshi};
  font-size: 11px;
  font-weight: ${x.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${c.textSoft};
`,fs=a`
  ${eo} color: ${c.greenPrimary};
`,to=a`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(79, 132, 72, 0.2);
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ${b.out};
`,ms=a`
  ${to} border-color: ${c.greenPrimary};
  background: ${c.greenPrimary};
`,gs=()=>n("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none","aria-hidden":"true",children:n("path",{d:"M2 5.5L4 7.5L8 3",stroke:"white","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round"})}),hs=({isComplete:e})=>n("div",{class:us,children:[n("span",{class:e?fs:eo,children:e?"Completo":"Pendente"}),n("div",{class:e?ms:to,children:e&&n(gs,{})})]}),ro=a`
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${x.medium};
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: rgba(255, 255, 255, 0.3);
  color: ${c.textMuted};
  cursor: pointer;
  transition: all 150ms ${b.out};
  white-space: nowrap;
  &:hover {
    border-color: ${c.greenPrimary};
    color: ${c.greenPrimary};
    background: ${c.greenLight};
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,xs=a`
  ${ro} border-color: ${c.greenPrimary};
  background: ${c.greenPrimary};
  color: white;
  font-weight: ${x.semibold};
  &:hover {
    background: ${c.greenDark};
    border-color: ${c.greenDark};
    color: white;
  }
`,bs=({code:e,label:t,isActive:r,onClick:o})=>n("button",{type:"button",class:r?xs:ro,onClick:o,children:[e," \u2014 ",t]}),ys=a`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: transparent;
  color: ${c.textMuted};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  &:hover {
    border-color: ${c.danger};
    color: ${c.danger};
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,Ss=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,$s=a`
  color: ${c.danger};
`,Et=({label:e,name:t,placeholder:r,required:o,full:i,value:s,error:l,onInput:d})=>n("div",{class:`${Ss} ${i?P:""}`,children:[n("label",{class:k,for:t,children:[e,o&&n("span",{class:$s,children:"*"})]}),n("input",{id:t,name:t,type:"text",class:`${T} ${l?U:""}`,value:s,placeholder:r,onInput:p=>d(p.target.value)}),l&&n("span",{class:I,role:"alert",children:l})]}),vs=a`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  grid-column: 1 / -1;
`,Es=a`
  animation: ${C} 500ms ${b.out};
`,ws=a`
  & + & {
    margin-top: 12px;
  }
`,ks=a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(196, 66, 43, 0.06);
  border: 1px solid ${c.dangerBorder};
  border-radius: ${E.md};
  animation: ${ae} 500ms ${b.out};
`,Ds=a`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${c.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.bold};
  flex-shrink: 0;
`,Cs=a`
  font-family: ${g.satoshi};
  font-size: 13px;
  font-weight: ${x.medium};
  color: ${c.danger};
  line-height: 1.4;
`,As=a`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${c.textMuted};
  text-align: center;
  padding: 32px 0;
`,Rs=a`
  ${X} align-self: flex-start;
`,Ts=a`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${C} 500ms ${b.out};
`,Is=e=>e.code.trim()!==""&&e.date.trim()!==""&&e.description.trim()!=="",oo=({diagnoses:e,errors:t,onUpdateEntry:r,onAddDiagnosis:o,onRemoveDiagnosis:i,onApplyQuickCid:s})=>n("div",{class:Ts,children:[t.get("diagnoses")&&n("div",{class:ks,role:"alert",children:[n("span",{class:Ds,"aria-hidden":"true",children:"!"}),n("span",{class:Cs,children:t.get("diagnoses")})]}),e.length===0&&n("p",{class:As,children:"Nenhum diagnostico adicionado. Clique abaixo para adicionar."}),e.map((l,d)=>{let p=Is(l);return n("div",{class:`${fr} ${p?mr:""} ${Es} ${ws}`,children:[n(hs,{isComplete:p}),n("button",{type:"button",class:ys,onClick:()=>i(d),"aria-label":`Remover diagnostico ${d+1}`,children:"\xD7"}),n("div",{class:G,children:[n(Et,{label:"Codigo CID",name:`diag_${d}_code`,placeholder:"Ex: G80, F84.0",required:!0,value:l.code,error:t.get(`diagnosis_${d}_code`),onInput:m=>r(d,"code",m)}),n(Et,{label:"Data do diagnostico",name:`diag_${d}_date`,placeholder:"DD/MM/AAAA",required:!0,value:ds(l.date),error:t.get(`diagnosis_${d}_date`),onInput:m=>r(d,"date",ps(m))}),n(Et,{label:"Descricao",name:`diag_${d}_desc`,placeholder:"Descricao do diagnostico",required:!0,full:!0,value:l.description,error:t.get(`diagnosis_${d}_description`),onInput:m=>r(d,"description",m)}),n("div",{class:vs,children:cs.map(m=>n(bs,{code:m.code,label:m.description,isActive:l.quickCidId===m.code,onClick:()=>s(d,m.code,m.description)}))})]})]})}),n("button",{type:"button",class:Rs,onClick:o,children:"+ Adicionar diagnostico"})]});var Ps=a`
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(79, 132, 72, 0.08);
  align-items: center;
  animation: ${C} 500ms ${b.out};
  @media (max-width: 600px) {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
  }
`,Os=a`
  font-family: ${g.satoshi};
  font-size: 12px;
  color: ${c.textSoft};
  font-variant-numeric: tabular-nums;
  min-width: 20px;
`,Ns=a`
  font-family: ${g.erode};
  font-size: 16px;
  font-weight: ${x.semibold};
  color: ${c.textPrimary};
`,_s=a`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${c.textMuted};
  @media (max-width: 600px) {
    grid-column: 2 / -1;
    grid-row: 2;
  }
`,Ms=a`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: transparent;
  color: ${c.textMuted};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  &:hover {
    border-color: ${c.danger};
    color: ${c.danger};
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,Ls=e=>{let t=[];return(e.relationshipLabel||e.relationship)&&t.push(e.relationshipLabel||e.relationship),(e.sex||e.gender)&&t.push(e.sex||e.gender),t.push(e.livesWithPatient?"Reside":"Nao reside"),e.documents&&e.documents.length>0&&t.push(e.documents.map(r=>r.type.toUpperCase()).join(", ")),t.join(" | ")},Fs=({index:e,name:t,meta:r,isReference:o,onRemove:i})=>n("div",{class:Ps,children:[n("span",{class:Os,children:String(e+1).padStart(2,"0")}),n("span",{class:Ns,children:t||"Sem nome"}),n("span",{class:_s,children:r}),!o&&i?n("button",{type:"button",class:Ms,onClick:i,"aria-label":`Remover membro ${t}`,children:"\xD7"}):n("span",{})]}),lo=a`
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${x.medium};
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: rgba(255, 255, 255, 0.3);
  color: ${c.textMuted};
  cursor: pointer;
  transition: all 150ms ${b.out};
  &:hover {
    border-color: ${c.greenPrimary};
    color: ${c.greenPrimary};
    background: ${c.greenLight};
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,Bs=a`
  ${lo} border-color: ${c.greenPrimary};
  background: ${c.greenPrimary};
  color: white;
  font-weight: ${x.semibold};
  &:hover {
    background: ${c.greenDark};
    border-color: ${c.greenDark};
    color: white;
  }
`,js=({label:e,isActive:t,onToggle:r})=>n("button",{type:"button",class:t?Bs:lo,"aria-pressed":t?"true":"false",onClick:r,children:e}),zs=a`
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(79, 132, 72, 0.1);
  border-radius: ${E.md};
  padding: 16px;
  margin-top: 12px;
  animation: ${C} 400ms ${b.out};
`,Us=a`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
`,Gs=a`
  font-family: ${g.satoshi};
  font-size: 10px;
  font-weight: ${x.semibold};
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 100px;
  background: ${c.greenLight};
  color: ${c.greenPrimary};
`,Ws=a`
  font-family: ${g.erode};
  font-size: 13px;
  font-weight: ${x.semibold};
  color: ${c.textSecondary};
`,Vs=a`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,wt={cpf:"CPF",rg:"RG",cn:"Certidao de Nascimento",cns:"CNS",te:"Titulo de Eleitor",ctps:"CTPS"},Hs={cpf:[{key:"number",label:"Numero do CPF",placeholder:"000.000.000-00"}],rg:[{key:"number",label:"Numero do RG",placeholder:"Numero"},{key:"uf",label:"UF",placeholder:"Estado"},{key:"agency",label:"Orgao emissor",placeholder:"Ex: SSP"},{key:"date",label:"Data de emissao",placeholder:"DD/MM/AAAA"}],cn:[{key:"matricula",label:"Matricula",placeholder:"32 digitos",full:!0}],cns:[{key:"number",label:"Numero do CNS",placeholder:"15 digitos",full:!0}],te:[{key:"number",label:"Numero",placeholder:"Numero do titulo"},{key:"zona",label:"Zona",placeholder:"Zona"},{key:"secao",label:"Secao",placeholder:"Secao"},{key:"uf",label:"UF",placeholder:"Estado"}],ctps:[{key:"number",label:"Numero",placeholder:"Numero da CTPS"},{key:"serie",label:"Serie",placeholder:"Serie"},{key:"uf",label:"UF",placeholder:"Estado"}]},Me=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,Ks=a`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`,qs=a`
  border: 1.5px solid rgba(79, 132, 72, 0.15);
  border-radius: ${E.lg};
  padding: 24px;
  background: rgba(255, 255, 255, 0.2);
  animation: ${C} 400ms ${b.out};
`,Ys=a`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`,Zs=a`
  ${X} font-size: 13px;
  padding: 8px 16px;
`,Xs=a`
  ${xe} font-size: 13px;
  padding: 8px 16px;
`,no=a`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
`,Dt=a`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid rgba(79, 132, 72, 0.2);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 150ms ease;
`,io=a`
  ${Dt} background: ${c.greenPrimary};
  border-color: ${c.greenPrimary};
`,so=a`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${c.textMuted};
`,ao=()=>n("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none","aria-hidden":"true",children:n("path",{d:"M2 5.5L4 7.5L8 3",stroke:"white","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round"})}),Js=a`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${c.textMuted};
  text-align: center;
  padding: 24px 0;
`,Qs=a`
  ${X} align-self: flex-start;
`,ea=a`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${C} 500ms ${b.out};
`,ta=a`
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${x.semibold};
  color: ${c.textLabel};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
`,kt={name:"",birthDate:"",sex:"",relationship:"",livesWithPatient:!0,isDisabled:!1,selectedDocTypes:[],docFields:{}},co=({familyMembers:e,onAddMember:t,onRemoveMember:r})=>{let[o,i]=Q(!1),[s,l]=Q(kt),d=f=>{let h=s.selectedDocTypes.includes(f)?s.selectedDocTypes.filter(y=>y!==f):[...s.selectedDocTypes,f];l({...s,selectedDocTypes:h})},p=(f,u,h)=>{let y=s.docFields[f]||{};l({...s,docFields:{...s.docFields,[f]:{...y,[u]:h}}})},m=()=>{if(!s.name.trim()||!s.relationship.trim())return;let f=s.selectedDocTypes.map(h=>({type:h,fields:s.docFields[h]||{}})),u={name:s.name,birthDate:s.birthDate,sex:s.sex,gender:s.sex,relationship:s.relationship,relationshipLabel:s.relationship,livesWithPatient:s.livesWithPatient,isDisabled:s.isDisabled,hasDisability:s.isDisabled,documents:f.length>0?f:void 0};t(u),l(kt),i(!1)};return n("div",{class:ea,children:[e.length===0&&!o&&n("p",{class:Js,children:"Nenhum membro familiar adicionado. Este passo e opcional."}),e.map((f,u)=>n(Fs,{index:u,name:f.name,meta:Ls(f),isReference:u===0,onRemove:()=>r(u)})),o&&n("div",{class:qs,children:[n("div",{class:G,children:[n("div",{class:Me,children:[n("label",{class:k,for:"fm-name",children:"Nome *"}),n("input",{id:"fm-name",type:"text",class:T,value:s.name,placeholder:"Nome completo",onInput:f=>l({...s,name:f.target.value})})]}),n("div",{class:Me,children:[n("label",{class:k,for:"fm-birth",children:"Data de nascimento"}),n("input",{id:"fm-birth",type:"text",class:T,value:s.birthDate,placeholder:"DD/MM/AAAA",onInput:f=>l({...s,birthDate:f.target.value})})]}),n("div",{class:Me,children:[n("label",{class:k,for:"fm-sex",children:"Sexo"}),n("input",{id:"fm-sex",type:"text",class:T,value:s.sex,placeholder:"Masculino, Feminino, Outro",onInput:f=>l({...s,sex:f.target.value})})]}),n("div",{class:Me,children:[n("label",{class:k,for:"fm-rel",children:"Parentesco *"}),n("input",{id:"fm-rel",type:"text",class:T,value:s.relationship,placeholder:"Conjuge, Filho(a), etc.",onInput:f=>l({...s,relationship:f.target.value})})]}),n("div",{class:no,role:"checkbox","aria-checked":s.livesWithPatient?"true":"false",tabIndex:0,onClick:()=>l({...s,livesWithPatient:!s.livesWithPatient}),onKeyDown:f=>{(f.key==="Enter"||f.key===" ")&&(f.preventDefault(),l({...s,livesWithPatient:!s.livesWithPatient}))},children:[n("div",{class:s.livesWithPatient?io:Dt,children:s.livesWithPatient&&n(ao,{})}),n("span",{class:so,children:"Reside com o paciente"})]}),n("div",{class:no,role:"checkbox","aria-checked":s.isDisabled?"true":"false",tabIndex:0,onClick:()=>l({...s,isDisabled:!s.isDisabled}),onKeyDown:f=>{(f.key==="Enter"||f.key===" ")&&(f.preventDefault(),l({...s,isDisabled:!s.isDisabled}))},children:[n("div",{class:s.isDisabled?io:Dt,children:s.isDisabled&&n(ao,{})}),n("span",{class:so,children:"Pessoa com deficiencia"})]}),n("div",{class:P,children:[n("span",{class:ta,children:"Documentos"}),n("div",{class:Ks,children:Object.keys(wt).map(f=>n(js,{label:wt[f],docType:f,isActive:s.selectedDocTypes.includes(f),onToggle:()=>d(f)}))})]}),s.selectedDocTypes.map(f=>n("div",{class:`${P}`,children:n("div",{class:zs,children:[n("div",{class:Us,children:[n("span",{class:Gs,children:f.toUpperCase()}),n("span",{class:Ws,children:wt[f]})]}),n("div",{class:Vs,children:Hs[f].map(u=>n("div",{class:`${Me} ${u.full?P:""}`,children:[n("label",{class:k,children:u.label}),n("input",{type:"text",class:T,value:(s.docFields[f]||{})[u.key]||"",placeholder:u.placeholder,onInput:h=>p(f,u.key,h.target.value)})]}))})]})}))]}),n("div",{class:Ys,children:[n("button",{type:"button",class:Zs,onClick:()=>{l(kt),i(!1)},children:"Cancelar"}),n("button",{type:"button",class:Xs,onClick:m,children:"Confirmar"})]})]}),!o&&n("button",{type:"button",class:Qs,onClick:()=>i(!0),children:"+ Adicionar membro"})]})};var ra=a`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${C} 500ms ${b.out};
`,oa=a`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${c.textMuted};
  line-height: 1.5;
`,na=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,ia=a`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
`,po=a`
  padding: 14px 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(79, 132, 72, 0.1);
  border-radius: ${E.md};
  font-family: ${g.satoshi};
  font-size: 14px;
  font-weight: ${x.medium};
  color: ${c.textMuted};
  cursor: pointer;
  transition: all 150ms ${b.out};
  min-width: 120px;
  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,sa=a`
  ${po} background: ${c.greenLight};
  border-color: ${c.greenPrimary};
  color: ${c.greenPrimary};
  font-weight: ${x.semibold};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`,aa=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 480px;
  animation: ${C} 400ms ${b.out};
`,la=[{value:"INDIGENA",label:"Indigena"},{value:"QUILOMBOLA",label:"Quilombola"},{value:"CIGANO",label:"Cigano(a)"},{value:"RIBEIRINHO",label:"Ribeirinho(a)"},{value:"EXTRATIVISTA",label:"Extrativista"},{value:"OUTRO",label:"Outro"}],uo=({specificity:e,errors:t,onUpdate:r})=>n("div",{class:ra,children:[n("p",{class:oa,children:"Este passo e opcional. Selecione uma identidade social caso aplicavel."}),n("div",{class:na,children:[n("span",{class:k,children:"Identidade sociocultural"}),n("div",{class:ia,role:"radiogroup","aria-label":"Identidade sociocultural",children:la.map(o=>{let i=e.selectedIdentity===o.value;return n("div",{role:"radio","aria-checked":i?"true":"false",tabIndex:0,class:i?sa:po,onClick:()=>r("selectedIdentity",o.value),onKeyDown:s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),r("selectedIdentity",o.value))},children:o.label})})})]}),e.selectedIdentity&&n("div",{class:aa,children:[n("label",{class:k,for:"specificity-desc",children:"Descricao adicional"}),n("input",{id:"specificity-desc",type:"text",class:`${T} ${t.get("description")?a`
                border-bottom-color: ${c.danger};
              `:""}`,value:e.description,placeholder:"Descreva detalhes adicionais",onInput:o=>r("description",o.target.value)}),t.get("description")&&n("span",{class:I,role:"alert",children:t.get("description")})]})]});var et=a`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,Ct=a`
  color: ${c.danger};
`,fo=({label:e,name:t,placeholder:r,required:o,full:i,value:s,error:l,onInput:d})=>n("div",{class:`${et} ${i?P:""}`,children:[n("label",{class:k,for:t,children:[e,o&&n("span",{class:Ct,children:"*"})]}),n("input",{id:t,name:t,type:"text",class:`${T} ${l?U:""}`,value:s,placeholder:r,onInput:p=>d(p.target.value)}),l&&n("span",{class:I,role:"alert",children:l})]}),ca=a`
  ${T} appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B9E85' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  padding-right: 24px;
  cursor: pointer;
`,da=({label:e,name:t,required:r,value:o,error:i,options:s,onInput:l})=>n("div",{class:et,children:[n("label",{class:k,for:t,children:[e,r&&n("span",{class:Ct,children:"*"})]}),n("select",{id:t,name:t,class:`${ca} ${i?U:""}`,value:o,onChange:d=>l(d.target.value),children:s.map(d=>n("option",{value:d.value,children:d.label},d.value))}),i&&n("span",{class:I,role:"alert",children:i})]}),mo=a`
  border: 1.5px solid ${c.inputBorder};
  border-radius: ${E.sm};
  padding: 12px 16px;
  font-family: ${g.satoshi};
  font-size: 15px;
  color: ${c.textPrimary};
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: ${c.greenPrimary};
  }
  &::placeholder {
    color: ${c.textSoft};
    font-style: italic;
  }
`,pa=a`
  border-color: ${c.danger};
  &:focus {
    border-color: ${c.danger};
  }
`,go=a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1.5px solid rgba(79, 132, 72, 0.1);
  border-radius: ${E.md};
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 150ms ${b.out};
  &:hover {
    border-color: rgba(79, 132, 72, 0.2);
    background: rgba(255, 255, 255, 0.5);
  }
  &:focus-visible {
    outline: 2px solid ${c.greenPrimary};
    outline-offset: 2px;
  }
`,ua=a`
  ${go} border-color: ${c.greenPrimary};
  background: ${c.greenLight};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`,ho=a`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid rgba(79, 132, 72, 0.2);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 150ms ease;
`,fa=a`
  ${ho} background: ${c.greenPrimary};
  border-color: ${c.greenPrimary};
`,xo=a`
  font-family: ${g.satoshi};
  font-size: 14px;
  color: ${c.textMuted};
`,ma=a`
  ${xo} color: ${c.greenPrimary};
  font-weight: ${x.medium};
`,ga=()=>n("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none","aria-hidden":"true",children:n("path",{d:"M2 5.5L4 7.5L8 3",stroke:"white","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round"})}),ha=({label:e,selected:t,onToggle:r})=>n("div",{class:t?ua:go,role:"checkbox","aria-checked":t?"true":"false",tabIndex:0,onClick:r,onKeyDown:o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),r())},children:[n("div",{class:t?fa:ho,children:t&&n(ga,{})}),n("span",{class:t?ma:xo,children:e})]}),xa=a`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  grid-column: 1 / -1;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`,ba=a`
  font-family: ${g.satoshi};
  font-size: 12px;
  font-weight: ${x.semibold};
  color: ${c.textLabel};
  text-transform: uppercase;
  letter-spacing: 1px;
  grid-column: 1 / -1;
  margin-top: 8px;
`,ya=[{value:"",label:"Selecione..."},{value:"DEMANDA_ESPONTANEA",label:"Demanda espontanea"},{value:"BUSCA_ATIVA",label:"Busca ativa"},{value:"ENCAMINHAMENTO",label:"Encaminhamento"},{value:"REINCIDENCIA",label:"Reincidencia"}],Sa=[{id:"BPC",label:"BPC (Beneficio de Prestacao Continuada)"},{id:"BOLSA_FAMILIA",label:"Bolsa Familia"},{id:"AUXILIO_BRASIL",label:"Auxilio Brasil"},{id:"PETI",label:"PETI"},{id:"OUTROS",label:"Outros programas"}],$a=a`
  animation: ${C} 500ms ${b.out};
`,bo=({intake:e,errors:t,onUpdate:r,onToggleProgram:o})=>n("div",{class:$a,children:n("div",{class:G,children:[n(da,{label:"Tipo de ingresso",name:"ingressType",required:!0,value:e.ingressType,error:t.get("ingressType"),options:ya,onInput:i=>r("ingressType",i)}),n(fo,{label:"Nome da origem",name:"originName",placeholder:"Instituicao ou pessoa",value:e.originName,onInput:i=>r("originName",i)}),n(fo,{label:"Contato da origem",name:"originContact",placeholder:"Telefone ou email",value:e.originContact,onInput:i=>r("originContact",i)}),n("div",{class:`${et} ${P}`,children:[n("label",{class:k,for:"serviceReason",children:["Motivo do atendimento",n("span",{class:Ct,children:"*"})]}),n("textarea",{id:"serviceReason",class:`${mo} ${t.get("serviceReason")?pa:""}`,value:e.serviceReason,placeholder:"Descreva o motivo do atendimento",onInput:i=>r("serviceReason",i.target.value)}),t.get("serviceReason")&&n("span",{class:I,role:"alert",children:t.get("serviceReason")})]}),n("span",{class:ba,children:"Programas sociais vinculados"}),n("div",{class:xa,children:Sa.map(i=>n(ha,{label:i.label,selected:e.selectedPrograms.includes(i.id),onToggle:()=>o(i.id)}))}),n("div",{class:`${et} ${P}`,children:[n("label",{class:k,for:"observation",children:"Observacao"}),n("textarea",{id:"observation",class:mo,value:e.observation,placeholder:"Observacoes adicionais (opcional)",onInput:i=>r("observation",i.target.value)})]})]})});var va=7,yo=[{num:"01",title:"Dados Pessoais",desc:"Informacoes basicas do paciente."},{num:"02",title:"Documentos",desc:"Documentos de identificacao civil."},{num:"03",title:"Endereco",desc:"Localizacao e dados residenciais."},{num:"04",title:"Diagnosticos",desc:"Diagnosticos medicos e CIDs."},{num:"05",title:"Composicao Familiar",desc:"Membros do nucleo familiar."},{num:"06",title:"Especificidades (opcional)",desc:"Identidade sociocultural."},{num:"07",title:"Ingresso",desc:"Informacoes de entrada no servico."}],Ea={UNAUTHORIZED:"Sessao expirada. Faca login novamente.",FORBIDDEN:"Sem permissao para cadastrar.",VALIDATION_ERROR:"Dados invalidos. Revise os campos.",SERVER_ERROR:"Erro no servidor. Tente novamente.",NETWORK_ERROR:"Sem conexao. Verifique sua internet.",NOT_FOUND:"Servico indisponivel."},wa=a`
  display: flex;
  min-height: 100vh;
  background: ${c.bgBase};
`,ka=a`
  flex: 1;
  margin-left: 64px;
  padding: 24px 48px 48px;
  max-width: 900px;
  animation: ${xr} 600ms ${b.out};
  @media (max-width: 600px) {
    margin-left: 0;
    padding: 16px 20px 32px;
  }
`,Da=a`
  ${Je} padding: 40px;
  margin-top: 24px;
  @media (max-width: 600px) {
    padding: 24px 16px;
  }
`,Ca=a`
  margin-bottom: 32px;
`,Aa=a`
  font-family: ${c.textSoft};
  font-size: 12px;
  font-weight: 600;
  color: ${c.textSoft};
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
`,Ra=a`
  ${gr} font-size: 22px;
  margin: 0 0 4px;
`,Ta=a`
  ${hr} margin: 0;
`,So=()=>{let[e,t]=ut(Er,kr()??Qe);ft(()=>{wr(e)},[e]);let r=e.showErrors?e.errors:new Map,o=p=>(m,f)=>{t({type:"UPDATE_FIELD",section:p,field:m,value:f})},i=yo[e.currentStep]??yo[0],s=e.currentStep===va-1,l=e.saveResult?.ok===!0,d=async()=>{if(s){t({type:"SAVE_START"});let p=await Ir.create(e);p.ok?(Dr(),t({type:"SAVE_SUCCESS",message:"Cadastro salvo com sucesso!"})):t({type:"SAVE_FAILURE",message:Ea[p.error]??"Erro desconhecido."})}else t({type:"NEXT_STEP"})};return n("div",{class:wa,children:[n(Nr,{activeItem:"cadastro"}),n("main",{class:ka,children:[n(_r,{draftSaved:e.currentStep>0}),n(Br,{currentStep:e.currentStep,onGoToStep:p=>t({type:"GO_TO_STEP",step:p})}),n("div",{class:Da,children:[n("div",{class:Ca,children:[n("div",{class:Aa,children:["Etapa ",i.num]}),n("h2",{class:Ra,children:i.title}),n("p",{class:Ta,children:i.desc})]}),e.currentStep===0&&n(Vr,{fields:e.fields,errors:r,onUpdate:o("fields")}),e.currentStep===1&&n(Kr,{documents:e.documents,errors:r,onUpdate:o("documents")}),e.currentStep===2&&n(Qr,{address:e.address,errors:r,onUpdate:o("address"),onSetLocationType:p=>t({type:"SET_LOCATION_TYPE",locationType:p})}),e.currentStep===3&&n(oo,{diagnoses:e.diagnoses,errors:r,onUpdateEntry:(p,m,f)=>t({type:"UPDATE_DIAGNOSIS_FIELD",index:p,field:m,value:f}),onAddDiagnosis:()=>t({type:"ADD_DIAGNOSIS"}),onRemoveDiagnosis:p=>t({type:"REMOVE_DIAGNOSIS",index:p}),onApplyQuickCid:(p,m,f)=>t({type:"APPLY_QUICK_CID",index:p,code:m,description:f})}),e.currentStep===4&&n(co,{familyMembers:e.familyMembers,onAddMember:p=>t({type:"ADD_FAMILY_MEMBER",member:p}),onRemoveMember:p=>t({type:"REMOVE_FAMILY_MEMBER",index:p})}),e.currentStep===5&&n(uo,{specificity:e.specificity,errors:r,onUpdate:o("specificity")}),e.currentStep===6&&n(bo,{intake:e.intake,errors:r,onUpdate:o("intake"),onToggleProgram:p=>t({type:"TOGGLE_PROGRAM",programId:p})}),n(jr,{currentStep:e.currentStep,isLastStep:s,saving:e.saving,onBack:()=>t({type:"PREV_STEP"}),onNext:d})]})]}),n(Ur,{visible:l,onNewRegistration:()=>t({type:"RESET"}),onViewFamilies:()=>{globalThis.location.href="/social-care"}})]})};var $o=document.getElementById("registration-app");$o&&lt(n(me,{children:[n(pr,{}),n(So,{})]}),$o);
