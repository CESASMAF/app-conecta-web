var Eo=Object.defineProperty;var bo=(e,t)=>{for(var o in t)Eo(e,o,{get:t[o],enumerable:!0})};var $o={Stringify:1,BeforeStream:2,Stream:3},w=(e,t)=>{let o=new String(e);return o.isEscaped=!0,o.callbacks=t,o},To=/[&<>'"]/,$e=async(e,t)=>{let o="";t||=[];let r=await Promise.all(e);for(let s=r.length-1;o+=r[s],s--,!(s<0);s--){let n=r[s];typeof n=="object"&&t.push(...n.callbacks||[]);let i=n.isEscaped;if(n=await(typeof n=="object"?n.toString():n),typeof n=="object"&&t.push(...n.callbacks||[]),n.isEscaped??i)o+=n;else{let l=[o];N(n,l),o=l[0]}}return w(o,t)},N=(e,t)=>{let o=e.search(To);if(o===-1){t[0]+=e;return}let r,s,n=0;for(s=o;s<e.length;s++){switch(e.charCodeAt(s)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(n,s)+r,n=s+1}t[0]+=e.substring(n,s)},Ne=e=>{let t=e.callbacks;if(!t?.length)return e;let o=[e],r={};return t.forEach(s=>s({phase:$o.Stringify,buffer:o,context:r})),o[0]};var V=Symbol("RENDERER"),ee=Symbol("ERROR_HANDLER"),A=Symbol("STASH"),Te=Symbol("INTERNAL"),Ae=Symbol("MEMO"),te=Symbol("PERMALINK");var qe=e=>(e[Te]=!0,e);var Fe=e=>({value:t,children:o})=>{if(!o)return;let r={children:[{tag:qe(()=>{e.push(t)}),props:{}}]};Array.isArray(o)?r.children.push(...o.flat()):r.children.push(o),r.children.push({tag:qe(()=>{e.pop()}),props:{}});let s={tag:"",props:r,type:""};return s[ee]=n=>{throw e.pop(),n},s},ie=e=>{let t=[e],o=Fe(t);return o.values=t,o.Provider=o,q.push(o),o};var q=[],ut=e=>{let t=[e],o=r=>{t.push(r.value);let s;try{s=r.children?(Array.isArray(r.children)?new ve("",{},r.children):r.children).toString():""}catch(n){throw t.pop(),n}return s instanceof Promise?s.finally(()=>t.pop()).then(n=>w(n,n.callbacks)):(t.pop(),w(s))};return o.values=t,o.Provider=o,o[V]=Fe(t),q.push(o),o},U=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},ae={},F="data-precedence",ke=e=>e.rel==="stylesheet"&&"precedence"in e,Re=(e,t)=>e==="link"?t:oe[e].length>0;var ue={};bo(ue,{button:()=>Lo,form:()=>Co,input:()=>wo,link:()=>Ro,meta:()=>_o,script:()=>vo,style:()=>ko,title:()=>Ao});var G=e=>Array.isArray(e)?e:[e];var pt=new WeakMap,dt=(e,t,o,r)=>({buffer:s,context:n})=>{if(!s)return;let i=pt.get(n)||{};pt.set(n,i);let l=i[e]||=[],m=!1,p=oe[e],u=Re(e,r!==void 0);if(u){e:for(let[,a]of l)if(!(e==="link"&&!(a.rel==="stylesheet"&&a[F]!==void 0))){for(let g of p)if((a?.[g]??null)===o?.[g]){m=!0;break e}}}if(m?s[0]=s[0].replaceAll(t,""):u||e==="link"?l.push([t,o,r]):l.unshift([t,o,r]),s[0].indexOf("</head>")!==-1){let a;if(e==="link"||r!==void 0){let g=[];a=l.map(([S,,b],C)=>{if(b===void 0)return[S,Number.MAX_SAFE_INTEGER,C];let L=g.indexOf(b);return L===-1&&(g.push(b),L=g.length-1),[S,L,C]}).sort((S,b)=>S[1]-b[1]||S[2]-b[2]).map(([S])=>S)}else a=l.map(([g])=>g);a.forEach(g=>{s[0]=s[0].replaceAll(g,"")}),s[0]=s[0].replace(/(?=<\/head>)/,a.join(""))}},le=(e,t,o)=>w(new P(e,o,G(t??[])).toString()),ce=(e,t,o,r)=>{if("itemProp"in o)return le(e,t,o);let{precedence:s,blocking:n,...i}=o;s=r?s??"":void 0,r&&(i[F]=s);let l=new P(e,i,G(t||[])).toString();return l instanceof Promise?l.then(m=>w(l,[...m.callbacks||[],dt(e,m,i,s)])):w(l,[dt(e,l,i,s)])},Ao=({children:e,...t})=>{let o=_e();if(o){let r=U(o);if(r==="svg"||r==="head")return new P("title",t,G(e??[]))}return ce("title",e,t,!1)},vo=({children:e,...t})=>{let o=_e();return["src","async"].some(r=>!t[r])||o&&U(o)==="head"?le("script",e,t):ce("script",e,t,!1)},ko=({children:e,...t})=>["href","precedence"].every(o=>o in t)?(t["data-href"]=t.href,delete t.href,ce("style",e,t,!0)):le("style",e,t),Ro=({children:e,...t})=>["onLoad","onError"].some(o=>o in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?le("link",e,t):ce("link",e,t,ke(t)),_o=({children:e,...t})=>{let o=_e();return o&&U(o)==="head"?le("meta",e,t):ce("meta",e,t,!1)},ft=(e,{children:t,...o})=>new P(e,o,G(t??[])),Co=e=>(typeof e.action=="function"&&(e.action=te in e.action?e.action[te]:void 0),ft("form",e)),mt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=te in t.formAction?t.formAction[te]:void 0),ft(e,t)),wo=e=>mt("input",e),Lo=e=>mt("button",e);var Oo=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),re=e=>Oo.get(e)||e,pe=(e,t)=>{for(let[o,r]of Object.entries(e)){let s=o[0]==="-"||!/[A-Z]/.test(o)?o:o.replace(/[A-Z]/g,n=>`-${n.toLowerCase()}`);t(s,r==null?null:typeof r=="number"?s.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}};var fe,_e=()=>fe,Do=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Po=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],jo=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],He=(e,t)=>{for(let o=0,r=e.length;o<r;o++){let s=e[o];if(typeof s=="string")N(s,t);else{if(typeof s=="boolean"||s===null||s===void 0)continue;s instanceof P?s.toStringToBuffer(t):typeof s=="number"||s.isEscaped?t[0]+=s:s instanceof Promise?t.unshift("",s):He(s,t)}}},P=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,o,r){this.tag=t,this.props=o,this.children=r}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([o,r])=>{o.values.push(r)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([o])=>{o.values.pop()})}return t.length===1?"callbacks"in t?Ne(w(t[0],t.callbacks)).toString():t[0]:$e(t,t.callbacks)}toStringToBuffer(t){let o=this.tag,r=this.props,{children:s}=this;t[0]+=`<${o}`;let n=fe&&U(fe)==="svg"?i=>Do(re(i)):i=>re(i);for(let[i,l]of Object.entries(r))if(i=n(i),i!=="children"){if(i==="style"&&typeof l=="object"){let m="";pe(l,(p,u)=>{u!=null&&(m+=`${m?";":""}${p}:${u}`)}),t[0]+=' style="',N(m,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${i}="`,N(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${i}="${l}"`;else if(typeof l=="boolean"&&jo.includes(i))l&&(t[0]+=` ${i}=""`);else if(i==="dangerouslySetInnerHTML"){if(s.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");s=[w(l.__html)]}else if(l instanceof Promise)t[0]+=` ${i}="`,t.unshift('"',l);else if(typeof l=="function"){if(!i.startsWith("on")&&i!=="ref")throw new Error(`Invalid prop '${i}' of type 'function' supplied to '${o}'.`)}else t[0]+=` ${i}="`,N(l.toString(),t),t[0]+='"'}if(Po.includes(o)&&s.length===0){t[0]+="/>";return}t[0]+=">",He(s,t),t[0]+=`</${o}>`}},de=class extends P{toStringToBuffer(t){let{children:o}=this,r={...this.props};o.length&&(r.children=o.length===1?o[0]:o);let s=this.tag.call(null,r);if(!(typeof s=="boolean"||s==null))if(s instanceof Promise)if(q.length===0)t.unshift("",s);else{let n=q.map(i=>[i,i.values.at(-1)]);t.unshift("",s.then(i=>(i instanceof P&&(i.localContexts=n),i)))}else s instanceof P?s.toStringToBuffer(t):typeof s=="number"||s.isEscaped?(t[0]+=s,s.callbacks&&(t.callbacks||=[],t.callbacks.push(...s.callbacks))):N(s,t)}},ve=class extends P{toStringToBuffer(t){He(this.children,t)}};var ht=!1,Ce=(e,t,o)=>{if(!ht){for(let r in ae)ue[r][V]=ae[r];ht=!0}return typeof e=="function"?new de(e,t,o):ue[e]?new de(ue[e],t,o):e==="svg"||e==="head"?(fe||=ut(""),new P(e,t,[new de(fe,{value:e},o)])):new P(e,t,o)};function c(e,t,o){let r;if(!t||!("children"in t))r=Ce(e,t,[]);else{let s=t.children;r=Array.isArray(s)?Ce(e,t,s):Ce(e,t,[s])}return r.key=o,r}var he="_hp",Mo={Change:"Input",DoubleClick:"DblClick"},Uo={svg:"2000/svg",math:"1998/Math/MathML"},Y=[],Ve=new WeakMap,se,$t=()=>se,H=e=>"t"in e,ze={onClick:["click",!1]},gt=e=>{if(!e.startsWith("on"))return;if(ze[e])return ze[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,o,r]=t;return ze[e]=[(Mo[o]||o).toLowerCase(),!!r]}},xt=(e,t)=>se&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Tt=e=>e==null||e===!1?null:e,Bo=(e,t)=>{"value"in t&&(e.value=Tt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},No=(e,t,o)=>{t||={};for(let r in t){let s=t[r];if(r!=="children"&&(!o||o[r]!==s)){r=re(r);let n=gt(r);if(n){if(o?.[r]!==s&&(o&&e.removeEventListener(n[0],o[r],n[1]),s!=null)){if(typeof s!="function")throw new Error(`Event handler for "${r}" is not a function`);e.addEventListener(n[0],s,n[1])}}else if(r==="dangerouslySetInnerHTML"&&s)e.innerHTML=s.__html;else if(r==="ref"){let i;typeof s=="function"?i=s(e)||(()=>s(null)):s&&"current"in s&&(s.current=e,i=()=>s.current=null),Ve.set(e,i)}else if(r==="style"){let i=e.style;typeof s=="string"?i.cssText=s:(i.cssText="",s!=null&&pe(s,i.setProperty.bind(i)))}else{if(r==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Tt(s),l==="TEXTAREA")){e.textContent=s;continue}}else(r==="checked"&&e.nodeName==="INPUT"||r==="selected"&&e.nodeName==="OPTION")&&(e[r]=s);let i=xt(e,r);s==null||s===!1?e.removeAttribute(i):s===!0?e.setAttribute(i,""):typeof s=="string"||typeof s=="number"?e.setAttribute(i,s):e.setAttribute(i,s.toString())}}}if(o)for(let r in o){let s=o[r];if(r!=="children"&&!(r in t)){r=re(r);let n=gt(r);n?e.removeEventListener(n[0],s,n[1]):r==="ref"?Ve.get(e)?.():e.removeAttribute(xt(e,r))}}},qo=(e,t)=>{t[A][0]=0,Y.push([e,t]);let o=t.tag[V]||t.tag,r=o.defaultProps?{...o.defaultProps,...t.props}:t.props;try{return[o.call(null,r)]}finally{Y.pop()}},At=(e,t,o,r,s)=>{e.vR?.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[A][1][Oe]?.forEach(n=>s.push(n)),e.vC.forEach(n=>{if(H(n))o.push(n);else if(typeof n.tag=="function"||n.tag===""){n.c=t;let i=o.length;if(At(n,t,o,r,s),n.s){for(let l=i;l<o.length;l++)o[l].s=!0;n.s=!1}}else o.push(n),n.vR?.length&&(r.push(...n.vR),delete n.vR)})},Fo=e=>{for(;e&&(e.tag===he||!e.e);)e=e.tag===he||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},vt=e=>{H(e)||(e[A]?.[1][Oe]?.forEach(t=>t[2]?.()),Ve.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(vt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(me.delete(e),we.delete(e),delete e[A][3],e.a=!0)},Ke=(e,t,o)=>{e.c=t,kt(e,t,o)},yt=(e,t)=>{if(t){for(let o=0,r=e.length;o<r;o++)if(e[o]===t)return o}},St=Symbol(),kt=(e,t,o)=>{let r=[],s=[],n=[];At(e,t,r,s,n),s.forEach(vt);let i=o?void 0:t.childNodes,l,m=null;if(o)l=-1;else if(!i.length)l=0;else{let p=yt(i,Fo(e.nN));p!==void 0?(m=i[p],l=p):l=yt(i,r.find(u=>u.tag!==he&&u.e)?.e)??-1,l===-1&&(o=!0)}for(let p=0,u=r.length;p<u;p++,l++){let a=r[p],g;if(a.s&&a.e)g=a.e,a.s=!1;else{let S=o||!a.e;H(a)?(a.e&&a.d&&(a.e.textContent=a.t),a.d=!1,g=a.e||=document.createTextNode(a.t)):(g=a.e||=a.n?document.createElementNS(a.n,a.tag):document.createElement(a.tag),No(g,a.props,a.pP),kt(a,g,S),a.tag==="select"&&Bo(g,a.props))}a.tag===he?l--:o?g.parentNode||t.appendChild(g):i[l]!==g&&i[l-1]!==g&&(i[l+1]===g?t.appendChild(i[l]):t.insertBefore(g,m||i[l]||null))}if(e.pP&&(e.pP=void 0),n.length){let p=[],u=[];n.forEach(([,a,,g,S])=>{a&&p.push(a),g&&u.push(g),S?.()}),p.forEach(a=>a()),u.length&&requestAnimationFrame(()=>{u.forEach(a=>a())})}},Ho=(e,t)=>!!(e&&e.length===t.length&&e.every((o,r)=>o[1]===t[r][1])),we=new WeakMap,Le=(e,t,o)=>{let r=!o&&t.pC;o&&(t.pC||=t.vC);let s;try{o||=typeof t.tag=="function"?qo(e,t):G(t.props.children),o[0]?.tag===""&&o[0][ee]&&(s=o[0][ee],e[5].push([e,s,t]));let n=r?[...t.pC]:t.vC?[...t.vC]:void 0,i=[],l;for(let m=0;m<o.length;m++){if(Array.isArray(o[m])){o.splice(m,1,...o[m].flat(1/0)),m--;continue}let p=Rt(o[m]);if(p){typeof p.tag=="function"&&!p.tag[Te]&&(q.length>0&&(p[A][2]=q.map(a=>[a,a.values.at(-1)])),e[5]?.length&&(p[A][3]=e[5].at(-1)));let u;if(n&&n.length){let a=n.findIndex(H(p)?g=>H(g):p.key!==void 0?g=>g.key===p.key&&g.tag===p.tag:g=>g.tag===p.tag);a!==-1&&(u=n[a],n.splice(a,1))}if(u)if(H(p))u.t!==p.t&&(u.t=p.t,u.d=!0),p=u;else{let a=u.pP=u.props;if(u.props=p.props,u.f||=p.f||t.f,typeof p.tag=="function"){let g=u[A][2];u[A][2]=p[A][2]||[],u[A][3]=p[A][3],!u.f&&((u.o||u)===p.o||u.tag[Ae]?.(a,u.props))&&Ho(g,u[A][2])&&(u.s=!0)}p=u}else if(!H(p)&&se){let a=U(se);a&&(p.n=a)}if(!H(p)&&!p.s&&(Le(e,p),delete p.f),i.push(p),l&&!l.s&&!p.s)for(let a=l;a&&!H(a);a=a.vC?.at(-1))a.nN=p;l=p}}t.vR=r?[...t.vC,...n||[]]:n||[],t.vC=i,r&&delete t.pC}catch(n){if(t.f=!0,n===St){if(s)return;throw n}let[i,l,m]=t[A]?.[3]||[];if(l){let p=()=>ge([0,!1,e[2]],m),u=we.get(m)||[];u.push(p),we.set(m,u);let a=l(n,()=>{let g=we.get(m);if(g){let S=g.indexOf(p);if(S!==-1)return g.splice(S,1),p()}});if(a){if(e[0]===1)e[1]=!0;else if(Le(e,m,[a]),(l.length===1||e!==i)&&m.c){Ke(m,m.c,!1);return}throw St}}throw n}finally{s&&e[5].pop()}},Rt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[A]=[0,[]];else{let t=Uo[e.tag];t&&(se||=ie(""),e.props.children=[{tag:se,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},_t=(e,t,o)=>{e.c===t&&(e.c=o,e.vC.forEach(r=>_t(r,t,o)))},Et=(e,t)=>{t[A][2]?.forEach(([o,r])=>{o.values.push(r)});try{Le(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[A][2]?.forEach(([o])=>{o.values.pop()}),(e[0]!==1||!e[1])&&Ke(t,t.c,!1)},me=new WeakMap,bt=[],ge=async(e,t)=>{e[5]||=[];let o=me.get(t);o&&o[0](void 0);let r,s=new Promise(n=>r=n);if(me.set(t,[r,()=>{e[2]?e[2](e,t,n=>{Et(n,t)}).then(()=>r(t)):(Et(e,t),r(t))}]),bt.length)bt.at(-1).add(t);else{await Promise.resolve();let n=me.get(t);n&&(me.delete(t),n[1]())}return s},zo=(e,t)=>{let o=[];o[5]=[],o[4]=!0,Le(o,e,void 0),o[4]=!1;let r=document.createDocumentFragment();Ke(e,r,!0),_t(e,r,t),t.replaceChildren(r)},We=(e,t)=>{zo(Rt({tag:"",props:{children:e}}),t)};var Ge=(e,t,o)=>({tag:he,props:{children:e},key:o,e:t,p:1});var Vo=0,Oe=1,Ko=2,Wo=3;var Ye=new WeakMap,Ze=(e,t)=>!e||!t||e.length!==t.length||t.some((o,r)=>o!==e[r]);var Go;var Ct=[];var xe=e=>{let t=()=>typeof e=="function"?e():e,o=Y.at(-1);if(!o)return[t(),()=>{}];let[,r]=o,s=r[A][1][Vo]||=[],n=r[A][0]++;return s[n]||=[t(),i=>{let l=Go,m=s[n];if(typeof i=="function"&&(i=i(m[0])),!Object.is(i,m[0]))if(m[0]=i,Ct.length){let[p,u]=Ct.at(-1);Promise.all([p===3?r:ge([p,!1,l],r),u]).then(([a])=>{if(!a||!(p===2||p===3))return;let g=a.vC;requestAnimationFrame(()=>{setTimeout(()=>{g===a.vC&&ge([p===3?1:0,!1,l],a)})})})}else ge([0,!1,l],r)}]},Je=(e,t,o)=>{let r=Z(i=>{n(l=>e(l,i))},[e]),[s,n]=xe(()=>o?o(t):t);return[s,r]},Yo=(e,t,o)=>{let r=Y.at(-1);if(!r)return;let[,s]=r,n=s[A][1][Oe]||=[],i=s[A][0]++,[l,,m]=n[i]||=[];if(Ze(l,o)){m&&m();let p=()=>{u[e]=void 0,u[2]=t()},u=[o,void 0,void 0,void 0,void 0];u[e]=p,n[i]=u}},Qe=(e,t)=>Yo(3,e,t);var Z=(e,t)=>{let o=Y.at(-1);if(!o)return e;let[,r]=o,s=r[A][1][Ko]||=[],n=r[A][0]++,i=s[n];return Ze(i?.[1],t)?s[n]=[e,t]:e=s[n][0],e};var Xe=e=>{let t=Ye.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(o=>Ye.set(e,[o]),o=>Ye.set(e,[void 0,o])),e},et=(e,t)=>{let o=Y.at(-1);if(!o)return e();let[,r]=o,s=r[A][1][Wo]||=[],n=r[A][0]++,i=s[n];return Ze(i?.[1],t)&&(s[n]=[e(),t]),s[n][0]};var Lt=ie({pending:!1,data:null,method:null,action:null}),wt=new Set,Ot=e=>{wt.add(e),e.finally(()=>wt.delete(e))};var tt=(e,t)=>et(()=>o=>{let r;e&&(typeof e=="function"?r=e(o)||(()=>{e(null)}):e&&"current"in e&&(e.current=o,r=()=>{e.current=null}));let s=t(o);return()=>{s?.(),r?.()}},[e]),Dt=Object.create(null),Pt=Object.create(null),ye=(e,t,o,r,s)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let n=document.head,{onLoad:i,onError:l,precedence:m,blocking:p,...u}=t,a=null,g=!1,S=oe[e],b=Re(e,r),C=$=>$.getAttribute("rel")==="stylesheet"&&$.getAttribute(F)!==null,L;if(b){let $=n.querySelectorAll(e);e:for(let v of $)if(!(e==="link"&&!C(v))){for(let E of S)if(v.getAttribute(E)===t[E]){a=v;break e}}if(!a){let v=S.reduce((E,k)=>t[k]===void 0?E:`${E}-${k}-${t[k]}`,e);g=!Pt[v],a=Pt[v]||=(()=>{let E=document.createElement(e);for(let k of S)t[k]!==void 0&&E.setAttribute(k,t[k]);return t.rel&&E.setAttribute("rel",t.rel),E})()}}else L=n.querySelectorAll(e);m=r?m??"":void 0,r&&(u[F]=m);let K=Z($=>{if(b){if(e==="link"&&m!==void 0){let E=!1;for(let k of n.querySelectorAll(e)){let M=k.getAttribute(F);if(M===null){n.insertBefore($,k);return}if(E&&M!==m){n.insertBefore($,k);return}M===m&&(E=!0)}n.appendChild($);return}let v=!1;for(let E of n.querySelectorAll(e)){if(v&&E.getAttribute(F)!==m){n.insertBefore($,E);return}E.getAttribute(F)===m&&(v=!0)}n.appendChild($)}else if(e==="link")n.contains($)||n.appendChild($);else if(L){let v=!1;for(let E of L)if(E===$){v=!0;break}v||n.insertBefore($,n.contains(L[0])?L[0]:n.querySelector(e)),L=void 0}},[b,m,e]),X=tt(t.ref,$=>{let v=S[0];if(o===2&&($.innerHTML=""),(g||L)&&K($),!l&&!i||!v)return;let E=Dt[$.getAttribute(v)]||=new Promise((k,M)=>{$.addEventListener("load",k),$.addEventListener("error",M)});i&&(E=E.then(i)),l&&(E=E.catch(l)),E.catch(()=>{})});if(s&&p==="render"){let $=oe[e][0];if($&&t[$]){let v=t[$],E=Dt[v]||=new Promise((k,M)=>{K(a),a.addEventListener("load",k),a.addEventListener("error",M)});Xe(E)}}let O={tag:e,type:e,props:{...u,ref:X},ref:X};return O.p=o,a&&(O.e=a),Ge(O,n)},Zo=e=>{let t=$t();return(t&&U(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ye("title",e,void 0,!1,!1)},Jo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ye("script",e,1,!1,!0),Qo=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ye("style",e,2,!0,!0)),Xo=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ye("link",e,1,ke(e),!0),er=e=>ye("meta",e,void 0,!1,!1),jt=Symbol(),tr=e=>{let{action:t,...o}=e;typeof t!="function"&&(o.action=t);let[r,s]=xe([null,!1]),n=Z(async p=>{let u=p.isTrusted?t:p.detail[jt];if(typeof u!="function")return;p.preventDefault();let a=new FormData(p.target);s([a,!0]);let g=u(a);g instanceof Promise&&(Ot(g),await g),s([null,!0])},[]),i=tt(e.ref,p=>(p.addEventListener("submit",n),()=>{p.removeEventListener("submit",n)})),[l,m]=r;return r[1]=!1,{tag:Lt,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...o,ref:i},type:"form",ref:i}},f:m}},It=(e,{formAction:t,...o})=>{if(typeof t=="function"){let r=Z(s=>{s.preventDefault(),s.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[jt]:t}}))},[]);o.ref=tt(o.ref,s=>(s.addEventListener("click",r),()=>{s.removeEventListener("click",r)}))}return{tag:e,props:o,type:e,ref:o.ref}},or=e=>It("input",e),rr=e=>It("button",e);Object.assign(ae,{title:Zo,script:Jo,style:Qo,link:Xo,meta:er,form:tr,input:or,button:rr});var J=":-hono-global",nr=new RegExp(`^${J}{(.*)}$`),De="hono-css",z=Symbol(),_=Symbol(),j=Symbol(),B=Symbol(),Pe=Symbol(),Bt=Symbol(),Ai=Symbol();var Nt=e=>{let t=0,o=11;for(;t<e.length;)o=101*o+e.charCodeAt(t++)>>>0;return"css-"+o},qt=e=>e.trim().replace(/\s+/g,"-"),Ft=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),ir=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),ar=e=>Ft(e)&&!ir.has(e.toLowerCase()),Ht=e=>{console.warn(`Invalid slug: ${e}`)},lr=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),cr=new RegExp(["("+lr+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),ur=e=>e.replace(cr,(t,o,r,s,n)=>o||r||s||n||""),zt=(e,t)=>{let o=[],r=[],s=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",n="";for(let i=0,l=e.length;i<l;i++){n+=e[i];let m=t[i];if(!(typeof m=="boolean"||m===null||m===void 0)){Array.isArray(m)||(m=[m]);for(let p=0,u=m.length;p<u;p++){let a=m[p];if(!(typeof a=="boolean"||a===null||a===void 0))if(typeof a=="string")/([\\"'\/])/.test(a)?n+=a.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):n+=a;else if(typeof a=="number")n+=a;else if(a[Bt])n+=a[Bt];else if(a[_].startsWith("@keyframes "))o.push(a),n+=` ${a[_].substring(11)} `;else{if(e[i+1]?.match(/^\s*{/))o.push(a),a=`.${a[_]}`;else{o.push(...a[B]),r.push(...a[Pe]),a=a[j];let g=a.length;if(g>0){let S=a[g-1];S!==";"&&S!=="}"&&(a+=";")}}n+=`${a||""}`}}}}return[s,ur(n),o,r]},ne=(e,t,o,r)=>{let[s,n,i,l]=zt(e,t),m=nr.exec(n);m&&(n=m[1]);let p=Nt(s+n),u;if(o){let S=o(p,qt(s),n);S&&(Ft(S)?u=S:(r||Ht)(S))}let a=(m?J:"")+(u||p),g=(m?i.map(S=>S[_]):[a,...l]).join(" ");return{[z]:a,[_]:g,[j]:n,[B]:i,[Pe]:l}},je=e=>{for(let t=0,o=e.length;t<o;t++){let r=e[t];typeof r=="string"&&(e[t]={[z]:"",[_]:"",[j]:"",[B]:[],[Pe]:[r]})}return e},Ie=(e,t,o,r)=>{let[s,n]=zt(e,t),i=Nt(s+n),l;if(o){let m=o(i,qt(s),n);m&&(ar(m)?l=m:(r||Ht)(m))}return{[z]:"",[_]:`@keyframes ${l||i}`,[j]:n,[B]:[],[Pe]:[]}},pr=0,Me=(e,t,o,r)=>{e||(e=[`/* h-v-t ${pr++} */`]);let s=Array.isArray(e)?ne(e,t,o,r):e,n=s[_],i=ne(["view-transition-name:",""],[n],o,r);return s[_]=J+s[_],s[j]=s[j].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,n),i[_]=i[z]=n,i[B]=[...s[B],s],i};var fr=e=>{let t=[],o=0,r=0;for(let s=0,n=e.length;s<n;s++){let i=e[s];if(i==="'"||i==='"'){let l=i;for(s++;s<n;s++){if(e[s]==="\\"){s++;continue}if(e[s]===l)break}continue}if(i==="{"){r++;continue}if(i==="}"){r--,r===0&&(t.push(e.slice(o,s+1)),o=s+1);continue}}return t},ot=({id:e})=>{let t,o=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),r=(i,l)=>{let[m,p]=o();if(!m||!p){Promise.resolve().then(()=>{if(!o()[0])throw new Error("style sheet not found");r(i,l)});return}p.has(i)||(p.add(i),(i.startsWith(J)?fr(l):[`${i[0]==="@"?"":"."}${i}{${l}}`]).forEach(u=>{m.insertRule(u,m.cssRules.length)}))};return[{toString(){let i=this[z];return r(i,this[j]),this[B].forEach(({[_]:l,[j]:m})=>{r(l,m)}),this[_]}},({children:i,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:i&&(Array.isArray(i)?i:[i]).map(m=>m[j])}})]},mr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,s]=ot({id:e}),n=u=>(u.toString=r.toString,u),i=(u,...a)=>n(ne(u,a,t,o));return{css:i,cx:(...u)=>(u=je(u),i(Array(u.length).fill(""),...u)),keyframes:(u,...a)=>Ie(u,a,t,o),viewTransition:(u,...a)=>n(Me(u,a,t,o)),Style:s}},Se=mr({id:De}),Ri=Se.css,_i=Se.cx,Ci=Se.keyframes,wi=Se.viewTransition,Li=Se.Style;var hr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,s]=ot({id:e}),n=new WeakMap,i=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),m=b=>{let C=({buffer:O,context:$})=>{let[v,E]=n.get($),k=Object.keys(v);if(!k.length)return;let M="";if(k.forEach(W=>{E[W]=!0,M+=W.startsWith(J)?v[W]:`${W[0]==="@"?"":"."}${W}{${v[W]}}`}),n.set($,[{},E]),O&&l.test(O[0])){O[0]=O[0].replace(l,(W,yo,So)=>`${yo}${M}${So}`);return}let lt=i.get($),ct=`<script${lt?` nonce="${lt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(M)}<\/script>`;if(O){O[0]=`${ct}${O[0]}`;return}return Promise.resolve(ct)},L=({context:O})=>{n.has(O)||n.set(O,[{},{}]);let[$,v]=n.get(O),E=!0;if(v[b[z]]||(E=!1,$[b[z]]=b[j]),b[B].forEach(({[_]:k,[j]:M})=>{v[k]||(E=!1,$[k]=M)}),!E)return Promise.resolve(w("",[C]))},K=new String(b[_]);Object.assign(K,b),K.isEscaped=!0,K.callbacks=[L];let X=Promise.resolve(K);return Object.assign(X,b),X.toString=r.toString,X},p=(b,...C)=>m(ne(b,C,t,o)),u=(...b)=>(b=je(b),p(Array(b.length).fill(""),...b)),a=(b,...C)=>Ie(b,C,t,o),g=(b,...C)=>m(Me(b,C,t,o)),S=({children:b,nonce:C}={})=>w(`<style id="${e}"${C?` nonce="${C}"`:""}>${b?b[j]:""}</style>`,[({context:L})=>{i.set(L,C)}]);return S[V]=s,{css:p,cx:u,keyframes:a,viewTransition:g,Style:S}},Ee=hr({id:De}),h=Ee.css,I=Ee.cx,Ui=Ee.keyframes,Bi=Ee.viewTransition,Ni=Ee.Style;var Vt=(e,t)=>{switch(t.type){case"SET_TAB":return{...e,activeTab:t.tab};case"LOAD_STATS_START":return{...e,dashboardStatus:"loading",dashboardError:null};case"LOAD_STATS_SUCCESS":return{...e,dashboardStatus:"loaded",stats:t.stats};case"LOAD_STATS_FAILURE":return{...e,dashboardStatus:"error",dashboardError:t.error};case"LOAD_PEOPLE_START":return{...e,peopleStatus:"loading",peopleError:null};case"LOAD_PEOPLE_SUCCESS":return{...e,peopleStatus:"loaded",people:t.people};case"LOAD_PEOPLE_FAILURE":return{...e,peopleStatus:"error",peopleError:t.error};case"CREATE_PERSON_SUCCESS":return{...e,people:[...e.people,t.person]};case"UPDATE_PERSON_SUCCESS":return{...e,people:e.people.map(o=>o.personId===t.person.personId?t.person:o)};case"SELECT_TABLE":return{...e,selectedTable:t.tableName};case"LOAD_LOOKUPS_START":return{...e,lookupsStatus:"loading",lookupsError:null};case"LOAD_LOOKUPS_SUCCESS":return{...e,lookupsStatus:"loaded",lookupEntries:t.entries};case"LOAD_LOOKUPS_FAILURE":return{...e,lookupsStatus:"error",lookupsError:t.error};case"TOGGLE_ENTRY_SUCCESS":return{...e,lookupEntries:e.lookupEntries.map(o=>o.id===t.entry.id?t.entry:o)};case"LOAD_REQUESTS_START":return{...e,requestsStatus:"loading",requestsError:null};case"LOAD_REQUESTS_SUCCESS":return{...e,requestsStatus:"loaded",requests:t.requests};case"LOAD_REQUESTS_FAILURE":return{...e,requestsStatus:"error",requestsError:t.error};case"APPROVE_REQUEST_SUCCESS":return{...e,requests:e.requests.map(o=>o.id===t.request.id?t.request:o)};case"REJECT_REQUEST_SUCCESS":return{...e,requests:e.requests.map(o=>o.id===t.request.id?t.request:o)};case"LOAD_AUDIT_START":return{...e,auditStatus:"loading",auditError:null};case"LOAD_AUDIT_SUCCESS":return{...e,auditStatus:"loaded",auditEntries:t.entries};case"LOAD_AUDIT_FAILURE":return{...e,auditStatus:"error",auditError:t.error};case"SHOW_TOAST":return{...e,toasts:[...e.toasts,t.toast]};case"DISMISS_TOAST":return{...e,toasts:e.toasts.filter(o=>o.id!==t.toastId)}}};var rt=(e,t)=>{switch(t){case"dashboard":return e.dashboardStatus;case"pessoas":return e.peopleStatus;case"lookups":return e.lookupsStatus;case"solicitacoes":return e.requestsStatus;case"auditoria":return e.auditStatus}},Kt=e=>e.requests.filter(t=>t.status==="pendente").length;var Wt={activeTab:"dashboard",dashboardStatus:"idle",dashboardError:null,stats:null,peopleStatus:"idle",peopleError:null,people:[],lookupsStatus:"idle",lookupsError:null,selectedTable:null,lookupEntries:[],requestsStatus:"idle",requestsError:null,requests:[],auditStatus:"idle",auditError:null,auditEntries:[],toasts:[]};var x={pageTitle:"Painel Administrativo",pageSubtitle:"Gerencie pessoas, tabelas de refer\xEAncia, solicita\xE7\xF5es e auditoria",tabDashboard:"Dashboard",tabPessoas:"Pessoas",tabLookups:"Tabelas de Refer\xEAncia",tabSolicitacoes:"Solicita\xE7\xF5es",tabAuditoria:"Auditoria",statsTotalPeople:"Total de pessoas",statsActiveRoles:"Pap\xE9is ativos",statsPendingRequests:"Solicita\xE7\xF5es pendentes",statsRecentAudit:"A\xE7\xF5es recentes",peopleSearchPlaceholder:"Buscar por nome ou CPF...",peopleCreateButton:"Cadastrar pessoa",peopleEmptyState:"Nenhuma pessoa encontrada",lookupsSelectTable:"Selecione uma tabela",lookupsToggleActive:"Ativar",lookupsToggleInactive:"Desativar",lookupsEmptyState:"Nenhuma entrada nesta tabela",requestsApproveButton:"Aprovar",requestsRejectButton:"Rejeitar",requestsEmptyState:"Nenhuma solicita\xE7\xE3o pendente",requestsPendingBadge:"Pendente",requestsApprovedBadge:"Aprovado",requestsRejectedBadge:"Rejeitado",auditEmptyState:"Nenhum registro de auditoria",loadingDashboard:"Carregando estat\xEDsticas...",loadingPeople:"Carregando pessoas...",loadingLookups:"Carregando entradas...",loadingRequests:"Carregando solicita\xE7\xF5es...",loadingAudit:"Carregando auditoria...",errorDashboard:"Erro ao carregar estat\xEDsticas",errorPeople:"Erro ao carregar pessoas",errorLookups:"Erro ao carregar entradas",errorRequests:"Erro ao carregar solicita\xE7\xF5es",errorAudit:"Erro ao carregar auditoria",errorRetry:"Tentar novamente",toastPersonCreated:"Pessoa cadastrada com sucesso",toastPersonUpdated:"Pessoa atualizada com sucesso",toastEntryToggled:"Entrada atualizada com sucesso",toastRequestApproved:"Solicita\xE7\xE3o aprovada",toastRequestRejected:"Solicita\xE7\xE3o rejeitada",toastGenericError:"Ocorreu um erro inesperado"};var st={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},nt=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}};var Q=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:st});return nt(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var Ue=async(e,t)=>{try{let o=await fetch(e,{method:"PUT",credentials:"same-origin",headers:st,body:JSON.stringify(t)});return nt(o)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Gt=async(e,t)=>{try{let o=await fetch(e,{method:"PATCH",credentials:"same-origin",headers:st,body:t!==void 0?JSON.stringify(t):void 0});return nt(o)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var Yt=()=>Q("/api/admin/stats"),Zt=()=>Q("/api/admin/people");var Jt=(e=50,t=0)=>Q(`/api/admin/audit?limit=${e}&offset=${t}`);var Qt=e=>Q(`/api/admin/lookups/${e}`);var Xt=(e,t)=>Gt(`/api/admin/lookups/${e}/${t}/toggle`),eo=()=>Q("/api/admin/lookups/requests");var to=e=>Ue(`/api/admin/lookups/requests/${e}/approve`,{}),oo=(e,t)=>Ue(`/api/admin/lookups/requests/${e}/reject`,{reviewNote:t});var d={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},Sr=(e,t)=>{let o=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),s=parseInt(e.slice(5,7),16);return`rgba(${o}, ${r}, ${s}, ${t})`},y={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},T={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},f={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Zi={button:h`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:h`box-shadow: -8px 0 40px ${Sr(d.textPrimary,.3)};`,fab:h`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:h`box-shadow: 0 24px 80px ${d.inputLine};`,modal:h`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},R={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"},D={mobile:600,tablet:1200};var Er=h`
  padding: ${f[4]} ${f[3]} ${f[2]};
  @media (min-width: ${D.mobile}px) {
    padding: ${f[5]} ${f[6]} ${f[3]};
  }
`,br=h`
  font-family: ${y.erode};
  font-size: 24px;
  font-weight: ${T.bold};
  color: ${d.textPrimary};
  margin: 0 0 ${f[1]} 0;
  @media (min-width: ${D.mobile}px) {
    font-size: 28px;
  }
`,$r=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.textMuted};
  margin: 0;
`,ro=({title:e,subtitle:t})=>c("header",{class:Er,children:[c("h1",{class:br,children:e}),c("p",{class:$r,children:t})]});var Tr=h`
  display: flex;
  gap: ${f[1]};
  padding: 0 ${f[3]};
  overflow-x: auto;
  border-bottom: 1px solid ${d.inputLine};
  @media (min-width: ${D.mobile}px) {
    padding: 0 ${f[6]};
    gap: ${f[2]};
  }
`,Ar=h`
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: ${f[2]} ${f[3]};
  font-family: ${y.satoshi};
  font-size: 13px;
  font-weight: ${T.medium};
  color: ${d.textMuted};
  cursor: pointer;
  white-space: nowrap;
  transition: color 150ms ease, border-color 150ms ease;
  position: relative;
  &:hover {
    color: ${d.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: -2px;
  }
`,vr=h`
  color: ${d.primary};
  border-bottom-color: ${d.primary};
  font-weight: ${T.semibold};
`,kr=h`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 6px;
  border-radius: ${R.pill};
  background: ${d.danger};
  color: ${d.surfaceLight};
  font-family: ${y.satoshi};
  font-size: 11px;
  font-weight: ${T.bold};
`,so=({tabs:e,activeTab:t,pendingCount:o,onSelectTab:r})=>c("nav",{class:Tr,role:"tablist","aria-label":"Abas do painel administrativo",children:e.map(s=>c("button",{class:I(Ar,s.id===t&&vr),role:"tab","aria-selected":s.id===t,onClick:()=>r(s.id),children:[s.label,s.id==="solicitacoes"&&o>0&&c("span",{class:kr,"aria-label":`${o} pendentes`,children:o})]},s.id))});var Rr=h`
  background: ${d.surfaceLight};
  border-radius: ${R.card};
  padding: ${f[4]};
  border: 1px solid ${d.inputLine};
  display: flex;
  flex-direction: column;
  gap: ${f[1]};
`,_r=h`
  font-family: ${y.erode};
  font-size: 28px;
  font-weight: ${T.bold};
  color: ${d.textPrimary};
  margin: 0;
`,Cr=h`
  font-family: ${y.satoshi};
  font-size: 13px;
  font-weight: ${T.medium};
  color: ${d.textMuted};
  margin: 0;
`,be=({label:e,value:t})=>c("div",{class:Rr,children:[c("p",{class:_r,children:t}),c("p",{class:Cr,children:e})]});var wr=h`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${f[3]};
  padding: ${f[4]} ${f[3]};
  @media (min-width: ${D.mobile}px) {
    grid-template-columns: repeat(4, 1fr);
    padding: ${f[4]} ${f[6]};
  }
`,no=({stats:e})=>c("div",{class:wr,children:[c(be,{label:x.statsTotalPeople,value:e.totalPeople}),c(be,{label:x.statsActiveRoles,value:e.activeRoles}),c(be,{label:x.statsPendingRequests,value:e.pendingRequests}),c(be,{label:x.statsRecentAudit,value:e.recentAuditCount})]});var Lr=h`
  display: flex;
  flex-direction: column;
  gap: ${f[2]};
  padding: ${f[4]} ${f[3]};
  @media (min-width: ${D.mobile}px) {
    padding: ${f[4]} ${f[6]};
  }
`,Or=h`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${d.surfaceLight};
  border: 1px solid ${d.inputLine};
  border-radius: ${R.card};
  padding: ${f[3]};
  gap: ${f[3]};
`,Dr=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  font-weight: ${T.medium};
  color: ${d.textPrimary};
  margin: 0;
`,io=h`
  font-family: ${y.satoshi};
  font-size: 12px;
  font-weight: ${T.regular};
  color: ${d.textMuted};
  margin: 0;
`,Pr=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  color: ${d.textMuted};
  text-align: center;
  padding: ${f[7]};
`,ao=({people:e})=>e.length===0?c("p",{class:Pr,children:x.peopleEmptyState}):c("div",{class:Lr,children:e.map(t=>c("div",{class:Or,children:[c("div",{children:[c("p",{class:Dr,children:t.fullName}),c("p",{class:io,children:t.cpf??"Sem CPF"})]}),c("p",{class:io,children:t.createdAt.slice(0,10)})]},t.personId))});var jr=[{value:"dominio_tipo_identidade",label:"Tipo de Identidade"},{value:"dominio_tipo_deficiencia",label:"Tipo de Defici\xEAncia"},{value:"dominio_parentesco",label:"Parentesco"},{value:"dominio_programa_social",label:"Programa Social"},{value:"dominio_condicao_ocupacao",label:"Condi\xE7\xE3o de Ocupa\xE7\xE3o"},{value:"dominio_tipo_ingresso",label:"Tipo de Ingresso"},{value:"dominio_escolaridade",label:"Escolaridade"},{value:"dominio_tipo_beneficio",label:"Tipo de Benef\xEDcio"},{value:"dominio_efeito_condicionalidade",label:"Efeito de Condicionalidade"},{value:"dominio_tipo_violacao",label:"Tipo de Viola\xE7\xE3o"},{value:"dominio_servico_vinculo",label:"Servi\xE7o de V\xEDnculo"},{value:"dominio_tipo_medida",label:"Tipo de Medida"},{value:"dominio_unidade_realizacao",label:"Unidade de Realiza\xE7\xE3o"}],Ir=h`
  padding: ${f[4]} ${f[3]};
  display: flex;
  flex-direction: column;
  gap: ${f[3]};
  @media (min-width: ${D.mobile}px) {
    padding: ${f[4]} ${f[6]};
  }
`,Mr=h`
  border: 1px solid ${d.inputLine};
  border-radius: ${R.dropdown};
  padding: ${f[2]} ${f[3]};
  font-family: ${y.satoshi};
  font-size: 14px;
  color: ${d.textPrimary};
  background: ${d.surfaceLight};
  max-width: 280px;
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,Ur=h`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${d.surfaceLight};
  border: 1px solid ${d.inputLine};
  border-radius: ${R.card};
  padding: ${f[2]} ${f[3]};
`,Br=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.textPrimary};
`,Nr=h`
  border: none;
  padding: ${f[1]} ${f[3]};
  border-radius: ${R.pill};
  font-family: ${y.satoshi};
  font-size: 12px;
  font-weight: ${T.semibold};
  cursor: pointer;
  transition: opacity 150ms ease;
  &:hover {
    opacity: 0.85;
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,qr=h`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,Fr=h`
  background: ${d.inputLine};
  color: ${d.textPrimary};
`,Hr=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  color: ${d.textMuted};
  text-align: center;
  padding: ${f[5]};
`,lo=({selectedTable:e,entries:t,onSelectTable:o,onToggleEntry:r})=>c("div",{class:Ir,children:[c("select",{class:Mr,value:e??"","aria-label":x.lookupsSelectTable,onChange:s=>{let n=s.target.value;n&&o(n)},children:[c("option",{value:"",disabled:!0,children:x.lookupsSelectTable}),jr.map(s=>c("option",{value:s.value,children:s.label},s.value))]}),e&&t.length===0&&c("p",{class:Hr,children:x.lookupsEmptyState}),t.map(s=>c("div",{class:Ur,children:[c("span",{class:Br,children:s.label}),c("button",{type:"button",class:I(Nr,s.active?qr:Fr),onClick:()=>r(s.id),children:s.active?x.lookupsToggleActive:x.lookupsToggleInactive})]},s.id))]});var zr=h`
  display: flex;
  flex-direction: column;
  gap: ${f[2]};
  padding: ${f[4]} ${f[3]};
  @media (min-width: ${D.mobile}px) {
    padding: ${f[4]} ${f[6]};
  }
`,Vr=h`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${f[2]};
  background: ${d.surfaceLight};
  border: 1px solid ${d.inputLine};
  border-radius: ${R.card};
  padding: ${f[3]};
`,Kr=h`
  display: flex;
  flex-direction: column;
  gap: 2px;
`,Wr=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  font-weight: ${T.medium};
  color: ${d.textPrimary};
  margin: 0;
`,Gr=h`
  font-family: ${y.satoshi};
  font-size: 12px;
  color: ${d.textMuted};
  margin: 0;
`,it=h`
  display: inline-block;
  padding: 2px ${f[2]};
  border-radius: ${R.pill};
  font-family: ${y.satoshi};
  font-size: 11px;
  font-weight: ${T.semibold};
`,Yr=h`
  background: ${d.warning};
  color: ${d.textPrimary};
`,Zr=h`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,Jr=h`
  background: ${d.danger};
  color: ${d.surfaceLight};
`,Qr=h`
  display: flex;
  gap: ${f[2]};
`,co=h`
  border: none;
  padding: ${f[1]} ${f[3]};
  border-radius: ${R.pill};
  font-family: ${y.satoshi};
  font-size: 12px;
  font-weight: ${T.semibold};
  cursor: pointer;
  transition: opacity 150ms ease;
  &:hover {
    opacity: 0.85;
  }
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,Xr=h`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,es=h`
  background: ${d.danger};
  color: ${d.surfaceLight};
`,ts=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  color: ${d.textMuted};
  text-align: center;
  padding: ${f[7]};
`,os=e=>{switch(e){case"pendente":return I(it,Yr);case"aprovado":return I(it,Zr);case"rejeitado":return I(it,Jr)}},rs=e=>{switch(e){case"pendente":return x.requestsPendingBadge;case"aprovado":return x.requestsApprovedBadge;case"rejeitado":return x.requestsRejectedBadge}},uo=({requests:e,onApprove:t,onReject:o})=>e.length===0?c("p",{class:ts,children:x.requestsEmptyState}):c("div",{class:zr,children:e.map(r=>c("div",{class:Vr,children:[c("div",{class:Kr,children:[c("p",{class:Wr,children:[r.label,c("span",{class:os(r.status),style:{marginLeft:"8px"},children:rs(r.status)})]}),c("p",{class:Gr,children:[r.tableName," \u2014 ",r.createdAt.slice(0,10)]})]}),r.status==="pendente"&&c("div",{class:Qr,children:[c("button",{class:I(co,Xr),onClick:()=>t(r.id),children:x.requestsApproveButton}),c("button",{class:I(co,es),onClick:()=>o(r.id),children:x.requestsRejectButton})]})]},r.id))});var ss=h`
  display: flex;
  flex-direction: column;
  gap: ${f[2]};
  padding: ${f[4]} ${f[3]};
  @media (min-width: ${D.mobile}px) {
    padding: ${f[4]} ${f[6]};
  }
`,ns=h`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${f[2]};
  background: ${d.surfaceLight};
  border: 1px solid ${d.inputLine};
  border-radius: ${R.card};
  padding: ${f[2]} ${f[3]};
`,is=h`
  display: flex;
  flex-direction: column;
  gap: 2px;
`,as=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  font-weight: ${T.medium};
  color: ${d.textPrimary};
  margin: 0;
`,ls=h`
  font-family: ${y.satoshi};
  font-size: 12px;
  color: ${d.textMuted};
  margin: 0;
`,cs=h`
  font-family: ${y.satoshi};
  font-size: 12px;
  color: ${d.textMuted};
  white-space: nowrap;
`,us=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  color: ${d.textMuted};
  text-align: center;
  padding: ${f[7]};
`,ps=e=>{let t=new Date(e),o=String(t.getDate()).padStart(2,"0"),r=String(t.getMonth()+1).padStart(2,"0"),s=t.getFullYear(),n=String(t.getHours()).padStart(2,"0"),i=String(t.getMinutes()).padStart(2,"0");return`${o}/${r}/${s} ${n}:${i}`},po=({entries:e})=>e.length===0?c("p",{class:us,children:x.auditEmptyState}):c("div",{class:ss,children:e.map(t=>c("div",{class:ns,children:[c("div",{class:is,children:[c("p",{class:as,children:t.action}),c("p",{class:ls,children:t.actorName})]}),c("span",{class:cs,children:ps(t.timestamp)})]},t.id))});var ds=h`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${f[7]};
  gap: ${f[3]};
`,fs=h`
  width: 24px;
  height: 24px;
  border: 3px solid ${d.inputLine};
  border-top-color: ${d.primary};
  border-radius: 50%;
  animation: adminSpin 700ms linear infinite;
  @keyframes adminSpin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border-top-color: ${d.inputLine};
    &::after {
      content: "...";
    }
  }
`,ms=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.textMuted};
`,fo=({message:e})=>c("div",{class:ds,role:"status","aria-label":e,children:[c("div",{class:fs}),c("span",{class:ms,children:e})]});var hs=h`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${f[7]};
  gap: ${f[3]};
`,gs=h`
  font-family: ${y.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.danger};
  text-align: center;
`,xs=h`
  background: none;
  border: 1px solid ${d.danger};
  padding: ${f[2]} ${f[4]};
  border-radius: ${R.pill};
  font-family: ${y.satoshi};
  font-size: 13px;
  font-weight: ${T.semibold};
  color: ${d.danger};
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease;
  &:hover {
    background: ${d.danger};
    color: ${d.surfaceLight};
  }
  &:focus-visible {
    outline: 2px solid ${d.danger};
    outline-offset: 2px;
  }
`,mo=({message:e,retryLabel:t,onRetry:o})=>c("div",{class:hs,role:"alert",children:[c("span",{class:gs,children:e}),c("button",{class:xs,onClick:o,children:t})]});var ys=h`
  position: fixed;
  bottom: ${f[4]};
  right: ${f[4]};
  display: flex;
  flex-direction: column;
  gap: ${f[2]};
  z-index: 1000;
  max-width: 360px;
`,at=h`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${f[3]};
  padding: ${f[3]};
  border-radius: ${R.dropdown};
  font-family: ${y.satoshi};
  font-size: 13px;
  font-weight: ${T.medium};
  animation: toastIn 250ms ease;
  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Ss=h`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,Es=h`
  background: ${d.danger};
  color: ${d.surfaceLight};
`,bs=h`
  background: ${d.backgroundDark};
  color: ${d.textOnDark};
`,$s=h`
  background: none;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  padding: 0 ${f[1]};
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`,Ts=e=>{switch(e){case"success":return I(at,Ss);case"error":return I(at,Es);case"info":return I(at,bs)}},ho=({toasts:e,onDismiss:t})=>e.length===0?null:c("div",{class:ys,"aria-live":"polite",children:e.map(o=>c("div",{class:Ts(o.variant),role:"alert",children:[c("span",{children:o.message}),c("button",{class:$s,onClick:()=>t(o.id),"aria-label":"Fechar",children:"x"})]},o.id))});var As=[{id:"dashboard",label:x.tabDashboard},{id:"pessoas",label:x.tabPessoas},{id:"lookups",label:x.tabLookups},{id:"solicitacoes",label:x.tabSolicitacoes},{id:"auditoria",label:x.tabAuditoria}],vs=h`
  min-height: 100vh;
  background: ${d.background};
`,Be=async(e,t,o)=>{switch(e){case"dashboard":{t({type:"LOAD_STATS_START"});let r=await Yt();t(r.ok?{type:"LOAD_STATS_SUCCESS",stats:r.value}:{type:"LOAD_STATS_FAILURE",error:x.errorDashboard});break}case"pessoas":{t({type:"LOAD_PEOPLE_START"});let r=await Zt();t(r.ok?{type:"LOAD_PEOPLE_SUCCESS",people:r.value}:{type:"LOAD_PEOPLE_FAILURE",error:x.errorPeople});break}case"lookups":{if(!o)break;t({type:"LOAD_LOOKUPS_START"});let r=await Qt(o);t(r.ok?{type:"LOAD_LOOKUPS_SUCCESS",entries:r.value}:{type:"LOAD_LOOKUPS_FAILURE",error:x.errorLookups});break}case"solicitacoes":{t({type:"LOAD_REQUESTS_START"});let r=await eo();t(r.ok?{type:"LOAD_REQUESTS_SUCCESS",requests:r.value}:{type:"LOAD_REQUESTS_FAILURE",error:x.errorRequests});break}case"auditoria":{t({type:"LOAD_AUDIT_START"});let r=await Jt();t(r.ok?{type:"LOAD_AUDIT_SUCCESS",entries:r.value}:{type:"LOAD_AUDIT_FAILURE",error:x.errorAudit});break}}},go=()=>{let[e,t]=Je(Vt,Wt);Qe(()=>{Be("dashboard",t)},[]);let o=a=>{t({type:"SET_TAB",tab:a}),rt(e,a)==="idle"&&Be(a,t,e.selectedTable)},r=a=>{t({type:"SELECT_TABLE",tableName:a}),Be("lookups",t,a)},s=async a=>{if(!e.selectedTable)return;let g=await Xt(e.selectedTable,a);g.ok?(t({type:"TOGGLE_ENTRY_SUCCESS",entry:g.value}),t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"success",message:x.toastEntryToggled}})):t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"error",message:x.toastGenericError}})},n=async a=>{let g=await to(a);g.ok?(t({type:"APPROVE_REQUEST_SUCCESS",request:g.value}),t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"success",message:x.toastRequestApproved}})):t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"error",message:x.toastGenericError}})},i=async a=>{let g=await oo(a,"");g.ok?(t({type:"REJECT_REQUEST_SUCCESS",request:g.value}),t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"success",message:x.toastRequestRejected}})):t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"error",message:x.toastGenericError}})},l=()=>{Be(e.activeTab,t,e.selectedTable)},m={dashboard:x.loadingDashboard,pessoas:x.loadingPeople,lookups:x.loadingLookups,solicitacoes:x.loadingRequests,auditoria:x.loadingAudit},p={dashboard:e.dashboardError??x.errorDashboard,pessoas:e.peopleError??x.errorPeople,lookups:e.lookupsError??x.errorLookups,solicitacoes:e.requestsError??x.errorRequests,auditoria:e.auditError??x.errorAudit},u=rt(e,e.activeTab);return c("div",{class:vs,children:[c(ro,{title:x.pageTitle,subtitle:x.pageSubtitle}),c(so,{tabs:As,activeTab:e.activeTab,pendingCount:Kt(e),onSelectTab:o}),u==="loading"&&c(fo,{message:m[e.activeTab]}),u==="error"&&c(mo,{message:p[e.activeTab],retryLabel:x.errorRetry,onRetry:l}),u!=="loading"&&u!=="error"&&e.activeTab==="dashboard"&&e.stats&&c(no,{stats:e.stats}),u!=="loading"&&u!=="error"&&e.activeTab==="pessoas"&&c(ao,{people:e.people}),u!=="loading"&&u!=="error"&&e.activeTab==="lookups"&&c(lo,{selectedTable:e.selectedTable,entries:e.lookupEntries,onSelectTable:r,onToggleEntry:s}),u!=="loading"&&u!=="error"&&e.activeTab==="solicitacoes"&&c(uo,{requests:e.requests,onApprove:n,onReject:i}),u!=="loading"&&u!=="error"&&e.activeTab==="auditoria"&&c(po,{entries:e.auditEntries}),c(ho,{toasts:e.toasts,onDismiss:a=>t({type:"DISMISS_TOAST",toastId:a})})]})};var xo=document.getElementById("admin-hub-app");xo&&We(c(go,{}),xo);
