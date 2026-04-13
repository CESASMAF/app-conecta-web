var yo=Object.defineProperty;var So=(e,t)=>{for(var o in t)yo(e,o,{get:t[o],enumerable:!0})};var bo={Stringify:1,BeforeStream:2,Stream:3},w=(e,t)=>{let o=new String(e);return o.isEscaped=!0,o.callbacks=t,o},Eo=/[&<>'"]/,$e=async(e,t)=>{let o="";t||=[];let r=await Promise.all(e);for(let s=r.length-1;o+=r[s],s--,!(s<0);s--){let n=r[s];typeof n=="object"&&t.push(...n.callbacks||[]);let i=n.isEscaped;if(n=await(typeof n=="object"?n.toString():n),typeof n=="object"&&t.push(...n.callbacks||[]),n.isEscaped??i)o+=n;else{let l=[o];U(n,l),o=l[0]}}return w(o,t)},U=(e,t)=>{let o=e.search(Eo);if(o===-1){t[0]+=e;return}let r,s,n=0;for(s=o;s<e.length;s++){switch(e.charCodeAt(s)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(n,s)+r,n=s+1}t[0]+=e.substring(n,s)},qe=e=>{let t=e.callbacks;if(!t?.length)return e;let o=[e],r={};return t.forEach(s=>s({phase:bo.Stringify,buffer:o,context:r})),o[0]};var V=Symbol("RENDERER"),X=Symbol("ERROR_HANDLER"),v=Symbol("STASH"),Te=Symbol("INTERNAL"),ve=Symbol("MEMO"),ee=Symbol("PERMALINK");var Fe=e=>(e[Te]=!0,e);var He=e=>({value:t,children:o})=>{if(!o)return;let r={children:[{tag:Fe(()=>{e.push(t)}),props:{}}]};Array.isArray(o)?r.children.push(...o.flat()):r.children.push(o),r.children.push({tag:Fe(()=>{e.pop()}),props:{}});let s={tag:"",props:r,type:""};return s[X]=n=>{throw e.pop(),n},s},ie=e=>{let t=[e],o=He(t);return o.values=t,o.Provider=o,q.push(o),o};var q=[],pt=e=>{let t=[e],o=r=>{t.push(r.value);let s;try{s=r.children?(Array.isArray(r.children)?new Ae("",{},r.children):r.children).toString():""}catch(n){throw t.pop(),n}return s instanceof Promise?s.finally(()=>t.pop()).then(n=>w(n,n.callbacks)):(t.pop(),w(s))};return o.values=t,o.Provider=o,o[V]=He(t),q.push(o),o},B=e=>e.values.at(-1);var te={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},ae={},F="data-precedence",ke=e=>e.rel==="stylesheet"&&"precedence"in e,Re=(e,t)=>e==="link"?t:te[e].length>0;var pe={};So(pe,{button:()=>_o,form:()=>Ro,input:()=>Co,link:()=>Ao,meta:()=>ko,script:()=>To,style:()=>vo,title:()=>$o});var G=e=>Array.isArray(e)?e:[e];var ut=new WeakMap,ft=(e,t,o,r)=>({buffer:s,context:n})=>{if(!s)return;let i=ut.get(n)||{};ut.set(n,i);let l=i[e]||=[],f=!1,u=te[e],p=Re(e,r!==void 0);if(p){e:for(let[,a]of l)if(!(e==="link"&&!(a.rel==="stylesheet"&&a[F]!==void 0))){for(let h of u)if((a?.[h]??null)===o?.[h]){f=!0;break e}}}if(f?s[0]=s[0].replaceAll(t,""):p||e==="link"?l.push([t,o,r]):l.unshift([t,o,r]),s[0].indexOf("</head>")!==-1){let a;if(e==="link"||r!==void 0){let h=[];a=l.map(([y,,E],_)=>{if(E===void 0)return[y,Number.MAX_SAFE_INTEGER,_];let O=h.indexOf(E);return O===-1&&(h.push(E),O=h.length-1),[y,O,_]}).sort((y,E)=>y[1]-E[1]||y[2]-E[2]).map(([y])=>y)}else a=l.map(([h])=>h);a.forEach(h=>{s[0]=s[0].replaceAll(h,"")}),s[0]=s[0].replace(/(?=<\/head>)/,a.join(""))}},le=(e,t,o)=>w(new P(e,o,G(t??[])).toString()),ce=(e,t,o,r)=>{if("itemProp"in o)return le(e,t,o);let{precedence:s,blocking:n,...i}=o;s=r?s??"":void 0,r&&(i[F]=s);let l=new P(e,i,G(t||[])).toString();return l instanceof Promise?l.then(f=>w(l,[...f.callbacks||[],ft(e,f,i,s)])):w(l,[ft(e,l,i,s)])},$o=({children:e,...t})=>{let o=Ce();if(o){let r=B(o);if(r==="svg"||r==="head")return new P("title",t,G(e??[]))}return ce("title",e,t,!1)},To=({children:e,...t})=>{let o=Ce();return["src","async"].some(r=>!t[r])||o&&B(o)==="head"?le("script",e,t):ce("script",e,t,!1)},vo=({children:e,...t})=>["href","precedence"].every(o=>o in t)?(t["data-href"]=t.href,delete t.href,ce("style",e,t,!0)):le("style",e,t),Ao=({children:e,...t})=>["onLoad","onError"].some(o=>o in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?le("link",e,t):ce("link",e,t,ke(t)),ko=({children:e,...t})=>{let o=Ce();return o&&B(o)==="head"?le("meta",e,t):ce("meta",e,t,!1)},dt=(e,{children:t,...o})=>new P(e,o,G(t??[])),Ro=e=>(typeof e.action=="function"&&(e.action=ee in e.action?e.action[ee]:void 0),dt("form",e)),mt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=ee in t.formAction?t.formAction[ee]:void 0),dt(e,t)),Co=e=>mt("input",e),_o=e=>mt("button",e);var wo=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),oe=e=>wo.get(e)||e,ue=(e,t)=>{for(let[o,r]of Object.entries(e)){let s=o[0]==="-"||!/[A-Z]/.test(o)?o:o.replace(/[A-Z]/g,n=>`-${n.toLowerCase()}`);t(s,r==null?null:typeof r=="number"?s.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}};var de,Ce=()=>de,Oo=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Lo=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Do=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],ze=(e,t)=>{for(let o=0,r=e.length;o<r;o++){let s=e[o];if(typeof s=="string")U(s,t);else{if(typeof s=="boolean"||s===null||s===void 0)continue;s instanceof P?s.toStringToBuffer(t):typeof s=="number"||s.isEscaped?t[0]+=s:s instanceof Promise?t.unshift("",s):ze(s,t)}}},P=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,o,r){this.tag=t,this.props=o,this.children=r}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([o,r])=>{o.values.push(r)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([o])=>{o.values.pop()})}return t.length===1?"callbacks"in t?qe(w(t[0],t.callbacks)).toString():t[0]:$e(t,t.callbacks)}toStringToBuffer(t){let o=this.tag,r=this.props,{children:s}=this;t[0]+=`<${o}`;let n=de&&B(de)==="svg"?i=>Oo(oe(i)):i=>oe(i);for(let[i,l]of Object.entries(r))if(i=n(i),i!=="children"){if(i==="style"&&typeof l=="object"){let f="";ue(l,(u,p)=>{p!=null&&(f+=`${f?";":""}${u}:${p}`)}),t[0]+=' style="',U(f,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${i}="`,U(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${i}="${l}"`;else if(typeof l=="boolean"&&Do.includes(i))l&&(t[0]+=` ${i}=""`);else if(i==="dangerouslySetInnerHTML"){if(s.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");s=[w(l.__html)]}else if(l instanceof Promise)t[0]+=` ${i}="`,t.unshift('"',l);else if(typeof l=="function"){if(!i.startsWith("on")&&i!=="ref")throw new Error(`Invalid prop '${i}' of type 'function' supplied to '${o}'.`)}else t[0]+=` ${i}="`,U(l.toString(),t),t[0]+='"'}if(Lo.includes(o)&&s.length===0){t[0]+="/>";return}t[0]+=">",ze(s,t),t[0]+=`</${o}>`}},fe=class extends P{toStringToBuffer(t){let{children:o}=this,r={...this.props};o.length&&(r.children=o.length===1?o[0]:o);let s=this.tag.call(null,r);if(!(typeof s=="boolean"||s==null))if(s instanceof Promise)if(q.length===0)t.unshift("",s);else{let n=q.map(i=>[i,i.values.at(-1)]);t.unshift("",s.then(i=>(i instanceof P&&(i.localContexts=n),i)))}else s instanceof P?s.toStringToBuffer(t):typeof s=="number"||s.isEscaped?(t[0]+=s,s.callbacks&&(t.callbacks||=[],t.callbacks.push(...s.callbacks))):U(s,t)}},Ae=class extends P{toStringToBuffer(t){ze(this.children,t)}};var gt=!1,_e=(e,t,o)=>{if(!gt){for(let r in ae)pe[r][V]=ae[r];gt=!0}return typeof e=="function"?new fe(e,t,o):pe[e]?new fe(pe[e],t,o):e==="svg"||e==="head"?(de||=pt(""),new P(e,t,[new fe(de,{value:e},o)])):new P(e,t,o)};function c(e,t,o){let r;if(!t||!("children"in t))r=_e(e,t,[]);else{let s=t.children;r=Array.isArray(s)?_e(e,t,s):_e(e,t,[s])}return r.key=o,r}var ge="_hp",jo={Change:"Input",DoubleClick:"DblClick"},Io={svg:"2000/svg",math:"1998/Math/MathML"},Z=[],We=new WeakMap,re,$t=()=>re,H=e=>"t"in e,Ve={onClick:["click",!1]},ht=e=>{if(!e.startsWith("on"))return;if(Ve[e])return Ve[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,o,r]=t;return Ve[e]=[(jo[o]||o).toLowerCase(),!!r]}},xt=(e,t)=>re&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Tt=e=>e==null||e===!1?null:e,Mo=(e,t)=>{"value"in t&&(e.value=Tt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Bo=(e,t,o)=>{t||={};for(let r in t){let s=t[r];if(r!=="children"&&(!o||o[r]!==s)){r=oe(r);let n=ht(r);if(n){if(o?.[r]!==s&&(o&&e.removeEventListener(n[0],o[r],n[1]),s!=null)){if(typeof s!="function")throw new Error(`Event handler for "${r}" is not a function`);e.addEventListener(n[0],s,n[1])}}else if(r==="dangerouslySetInnerHTML"&&s)e.innerHTML=s.__html;else if(r==="ref"){let i;typeof s=="function"?i=s(e)||(()=>s(null)):s&&"current"in s&&(s.current=e,i=()=>s.current=null),We.set(e,i)}else if(r==="style"){let i=e.style;typeof s=="string"?i.cssText=s:(i.cssText="",s!=null&&ue(s,i.setProperty.bind(i)))}else{if(r==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Tt(s),l==="TEXTAREA")){e.textContent=s;continue}}else(r==="checked"&&e.nodeName==="INPUT"||r==="selected"&&e.nodeName==="OPTION")&&(e[r]=s);let i=xt(e,r);s==null||s===!1?e.removeAttribute(i):s===!0?e.setAttribute(i,""):typeof s=="string"||typeof s=="number"?e.setAttribute(i,s):e.setAttribute(i,s.toString())}}}if(o)for(let r in o){let s=o[r];if(r!=="children"&&!(r in t)){r=oe(r);let n=ht(r);n?e.removeEventListener(n[0],s,n[1]):r==="ref"?We.get(e)?.():e.removeAttribute(xt(e,r))}}},No=(e,t)=>{t[v][0]=0,Z.push([e,t]);let o=t.tag[V]||t.tag,r=o.defaultProps?{...o.defaultProps,...t.props}:t.props;try{return[o.call(null,r)]}finally{Z.pop()}},vt=(e,t,o,r,s)=>{e.vR?.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[v][1][Le]?.forEach(n=>s.push(n)),e.vC.forEach(n=>{if(H(n))o.push(n);else if(typeof n.tag=="function"||n.tag===""){n.c=t;let i=o.length;if(vt(n,t,o,r,s),n.s){for(let l=i;l<o.length;l++)o[l].s=!0;n.s=!1}}else o.push(n),n.vR?.length&&(r.push(...n.vR),delete n.vR)})},Uo=e=>{for(;e&&(e.tag===ge||!e.e);)e=e.tag===ge||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},At=e=>{H(e)||(e[v]?.[1][Le]?.forEach(t=>t[2]?.()),We.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(At)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(me.delete(e),we.delete(e),delete e[v][3],e.a=!0)},Ke=(e,t,o)=>{e.c=t,kt(e,t,o)},yt=(e,t)=>{if(t){for(let o=0,r=e.length;o<r;o++)if(e[o]===t)return o}},St=Symbol(),kt=(e,t,o)=>{let r=[],s=[],n=[];vt(e,t,r,s,n),s.forEach(At);let i=o?void 0:t.childNodes,l,f=null;if(o)l=-1;else if(!i.length)l=0;else{let u=yt(i,Uo(e.nN));u!==void 0?(f=i[u],l=u):l=yt(i,r.find(p=>p.tag!==ge&&p.e)?.e)??-1,l===-1&&(o=!0)}for(let u=0,p=r.length;u<p;u++,l++){let a=r[u],h;if(a.s&&a.e)h=a.e,a.s=!1;else{let y=o||!a.e;H(a)?(a.e&&a.d&&(a.e.textContent=a.t),a.d=!1,h=a.e||=document.createTextNode(a.t)):(h=a.e||=a.n?document.createElementNS(a.n,a.tag):document.createElement(a.tag),Bo(h,a.props,a.pP),kt(a,h,y),a.tag==="select"&&Mo(h,a.props))}a.tag===ge?l--:o?h.parentNode||t.appendChild(h):i[l]!==h&&i[l-1]!==h&&(i[l+1]===h?t.appendChild(i[l]):t.insertBefore(h,f||i[l]||null))}if(e.pP&&(e.pP=void 0),n.length){let u=[],p=[];n.forEach(([,a,,h,y])=>{a&&u.push(a),h&&p.push(h),y?.()}),u.forEach(a=>a()),p.length&&requestAnimationFrame(()=>{p.forEach(a=>a())})}},qo=(e,t)=>!!(e&&e.length===t.length&&e.every((o,r)=>o[1]===t[r][1])),we=new WeakMap,Oe=(e,t,o)=>{let r=!o&&t.pC;o&&(t.pC||=t.vC);let s;try{o||=typeof t.tag=="function"?No(e,t):G(t.props.children),o[0]?.tag===""&&o[0][X]&&(s=o[0][X],e[5].push([e,s,t]));let n=r?[...t.pC]:t.vC?[...t.vC]:void 0,i=[],l;for(let f=0;f<o.length;f++){if(Array.isArray(o[f])){o.splice(f,1,...o[f].flat(1/0)),f--;continue}let u=Rt(o[f]);if(u){typeof u.tag=="function"&&!u.tag[Te]&&(q.length>0&&(u[v][2]=q.map(a=>[a,a.values.at(-1)])),e[5]?.length&&(u[v][3]=e[5].at(-1)));let p;if(n&&n.length){let a=n.findIndex(H(u)?h=>H(h):u.key!==void 0?h=>h.key===u.key&&h.tag===u.tag:h=>h.tag===u.tag);a!==-1&&(p=n[a],n.splice(a,1))}if(p)if(H(u))p.t!==u.t&&(p.t=u.t,p.d=!0),u=p;else{let a=p.pP=p.props;if(p.props=u.props,p.f||=u.f||t.f,typeof u.tag=="function"){let h=p[v][2];p[v][2]=u[v][2]||[],p[v][3]=u[v][3],!p.f&&((p.o||p)===u.o||p.tag[ve]?.(a,p.props))&&qo(h,p[v][2])&&(p.s=!0)}u=p}else if(!H(u)&&re){let a=B(re);a&&(u.n=a)}if(!H(u)&&!u.s&&(Oe(e,u),delete u.f),i.push(u),l&&!l.s&&!u.s)for(let a=l;a&&!H(a);a=a.vC?.at(-1))a.nN=u;l=u}}t.vR=r?[...t.vC,...n||[]]:n||[],t.vC=i,r&&delete t.pC}catch(n){if(t.f=!0,n===St){if(s)return;throw n}let[i,l,f]=t[v]?.[3]||[];if(l){let u=()=>he([0,!1,e[2]],f),p=we.get(f)||[];p.push(u),we.set(f,p);let a=l(n,()=>{let h=we.get(f);if(h){let y=h.indexOf(u);if(y!==-1)return h.splice(y,1),u()}});if(a){if(e[0]===1)e[1]=!0;else if(Oe(e,f,[a]),(l.length===1||e!==i)&&f.c){Ke(f,f.c,!1);return}throw St}}throw n}finally{s&&e[5].pop()}},Rt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[v]=[0,[]];else{let t=Io[e.tag];t&&(re||=ie(""),e.props.children=[{tag:re,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Ct=(e,t,o)=>{e.c===t&&(e.c=o,e.vC.forEach(r=>Ct(r,t,o)))},bt=(e,t)=>{t[v][2]?.forEach(([o,r])=>{o.values.push(r)});try{Oe(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[v][2]?.forEach(([o])=>{o.values.pop()}),(e[0]!==1||!e[1])&&Ke(t,t.c,!1)},me=new WeakMap,Et=[],he=async(e,t)=>{e[5]||=[];let o=me.get(t);o&&o[0](void 0);let r,s=new Promise(n=>r=n);if(me.set(t,[r,()=>{e[2]?e[2](e,t,n=>{bt(n,t)}).then(()=>r(t)):(bt(e,t),r(t))}]),Et.length)Et.at(-1).add(t);else{await Promise.resolve();let n=me.get(t);n&&(me.delete(t),n[1]())}return s},Fo=(e,t)=>{let o=[];o[5]=[],o[4]=!0,Oe(o,e,void 0),o[4]=!1;let r=document.createDocumentFragment();Ke(e,r,!0),Ct(e,r,t),t.replaceChildren(r)},Ge=(e,t)=>{Fo(Rt({tag:"",props:{children:e}}),t)};var Ze=(e,t,o)=>({tag:ge,props:{children:e},key:o,e:t,p:1});var Ho=0,Le=1,zo=2,Vo=3;var Ye=new WeakMap,Je=(e,t)=>!e||!t||e.length!==t.length||t.some((o,r)=>o!==e[r]);var Wo;var _t=[];var xe=e=>{let t=()=>typeof e=="function"?e():e,o=Z.at(-1);if(!o)return[t(),()=>{}];let[,r]=o,s=r[v][1][Ho]||=[],n=r[v][0]++;return s[n]||=[t(),i=>{let l=Wo,f=s[n];if(typeof i=="function"&&(i=i(f[0])),!Object.is(i,f[0]))if(f[0]=i,_t.length){let[u,p]=_t.at(-1);Promise.all([u===3?r:he([u,!1,l],r),p]).then(([a])=>{if(!a||!(u===2||u===3))return;let h=a.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===a.vC&&he([u===3?1:0,!1,l],a)})})})}else he([0,!1,l],r)}]},Qe=(e,t,o)=>{let r=Y(i=>{n(l=>e(l,i))},[e]),[s,n]=xe(()=>o?o(t):t);return[s,r]},Ko=(e,t,o)=>{let r=Z.at(-1);if(!r)return;let[,s]=r,n=s[v][1][Le]||=[],i=s[v][0]++,[l,,f]=n[i]||=[];if(Je(l,o)){f&&f();let u=()=>{p[e]=void 0,p[2]=t()},p=[o,void 0,void 0,void 0,void 0];p[e]=u,n[i]=p}},De=(e,t)=>Ko(3,e,t);var Y=(e,t)=>{let o=Z.at(-1);if(!o)return e;let[,r]=o,s=r[v][1][zo]||=[],n=r[v][0]++,i=s[n];return Je(i?.[1],t)?s[n]=[e,t]:e=s[n][0],e};var Xe=e=>{let t=Ye.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(o=>Ye.set(e,[o]),o=>Ye.set(e,[void 0,o])),e},et=(e,t)=>{let o=Z.at(-1);if(!o)return e();let[,r]=o,s=r[v][1][Vo]||=[],n=r[v][0]++,i=s[n];return Je(i?.[1],t)&&(s[n]=[e(),t]),s[n][0]};var Ot=ie({pending:!1,data:null,method:null,action:null}),wt=new Set,Lt=e=>{wt.add(e),e.finally(()=>wt.delete(e))};var tt=(e,t)=>et(()=>o=>{let r;e&&(typeof e=="function"?r=e(o)||(()=>{e(null)}):e&&"current"in e&&(e.current=o,r=()=>{e.current=null}));let s=t(o);return()=>{s?.(),r?.()}},[e]),Dt=Object.create(null),Pt=Object.create(null),ye=(e,t,o,r,s)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let n=document.head,{onLoad:i,onError:l,precedence:f,blocking:u,...p}=t,a=null,h=!1,y=te[e],E=Re(e,r),_=$=>$.getAttribute("rel")==="stylesheet"&&$.getAttribute(F)!==null,O;if(E){let $=n.querySelectorAll(e);e:for(let A of $)if(!(e==="link"&&!_(A))){for(let S of y)if(A.getAttribute(S)===t[S]){a=A;break e}}if(!a){let A=y.reduce((S,k)=>t[k]===void 0?S:`${S}-${k}-${t[k]}`,e);h=!Pt[A],a=Pt[A]||=(()=>{let S=document.createElement(e);for(let k of y)t[k]!==void 0&&S.setAttribute(k,t[k]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else O=n.querySelectorAll(e);f=r?f??"":void 0,r&&(p[F]=f);let W=Y($=>{if(E){if(e==="link"&&f!==void 0){let S=!1;for(let k of n.querySelectorAll(e)){let M=k.getAttribute(F);if(M===null){n.insertBefore($,k);return}if(S&&M!==f){n.insertBefore($,k);return}M===f&&(S=!0)}n.appendChild($);return}let A=!1;for(let S of n.querySelectorAll(e)){if(A&&S.getAttribute(F)!==f){n.insertBefore($,S);return}S.getAttribute(F)===f&&(A=!0)}n.appendChild($)}else if(e==="link")n.contains($)||n.appendChild($);else if(O){let A=!1;for(let S of O)if(S===$){A=!0;break}A||n.insertBefore($,n.contains(O[0])?O[0]:n.querySelector(e)),O=void 0}},[E,f,e]),Q=tt(t.ref,$=>{let A=y[0];if(o===2&&($.innerHTML=""),(h||O)&&W($),!l&&!i||!A)return;let S=Dt[$.getAttribute(A)]||=new Promise((k,M)=>{$.addEventListener("load",k),$.addEventListener("error",M)});i&&(S=S.then(i)),l&&(S=S.catch(l)),S.catch(()=>{})});if(s&&u==="render"){let $=te[e][0];if($&&t[$]){let A=t[$],S=Dt[A]||=new Promise((k,M)=>{W(a),a.addEventListener("load",k),a.addEventListener("error",M)});Xe(S)}}let L={tag:e,type:e,props:{...p,ref:Q},ref:Q};return L.p=o,a&&(L.e=a),Ze(L,n)},Go=e=>{let t=$t();return(t&&B(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ye("title",e,void 0,!1,!1)},Zo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ye("script",e,1,!1,!0),Yo=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ye("style",e,2,!0,!0)),Jo=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ye("link",e,1,ke(e),!0),Qo=e=>ye("meta",e,void 0,!1,!1),jt=Symbol(),Xo=e=>{let{action:t,...o}=e;typeof t!="function"&&(o.action=t);let[r,s]=xe([null,!1]),n=Y(async u=>{let p=u.isTrusted?t:u.detail[jt];if(typeof p!="function")return;u.preventDefault();let a=new FormData(u.target);s([a,!0]);let h=p(a);h instanceof Promise&&(Lt(h),await h),s([null,!0])},[]),i=tt(e.ref,u=>(u.addEventListener("submit",n),()=>{u.removeEventListener("submit",n)})),[l,f]=r;return r[1]=!1,{tag:Ot,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...o,ref:i},type:"form",ref:i}},f}},It=(e,{formAction:t,...o})=>{if(typeof t=="function"){let r=Y(s=>{s.preventDefault(),s.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[jt]:t}}))},[]);o.ref=tt(o.ref,s=>(s.addEventListener("click",r),()=>{s.removeEventListener("click",r)}))}return{tag:e,props:o,type:e,ref:o.ref}},er=e=>It("input",e),tr=e=>It("button",e);Object.assign(ae,{title:Go,script:Zo,style:Yo,link:Jo,meta:Qo,form:Xo,input:er,button:tr});var J=":-hono-global",rr=new RegExp(`^${J}{(.*)}$`),Pe="hono-css",z=Symbol(),C=Symbol(),j=Symbol(),N=Symbol(),je=Symbol(),Nt=Symbol(),hi=Symbol();var Ut=e=>{let t=0,o=11;for(;t<e.length;)o=101*o+e.charCodeAt(t++)>>>0;return"css-"+o},qt=e=>e.trim().replace(/\s+/g,"-"),Ft=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),sr=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),nr=e=>Ft(e)&&!sr.has(e.toLowerCase()),Ht=e=>{console.warn(`Invalid slug: ${e}`)},ir=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),ar=new RegExp(["("+ir+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),lr=e=>e.replace(ar,(t,o,r,s,n)=>o||r||s||n||""),zt=(e,t)=>{let o=[],r=[],s=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",n="";for(let i=0,l=e.length;i<l;i++){n+=e[i];let f=t[i];if(!(typeof f=="boolean"||f===null||f===void 0)){Array.isArray(f)||(f=[f]);for(let u=0,p=f.length;u<p;u++){let a=f[u];if(!(typeof a=="boolean"||a===null||a===void 0))if(typeof a=="string")/([\\"'\/])/.test(a)?n+=a.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):n+=a;else if(typeof a=="number")n+=a;else if(a[Nt])n+=a[Nt];else if(a[C].startsWith("@keyframes "))o.push(a),n+=` ${a[C].substring(11)} `;else{if(e[i+1]?.match(/^\s*{/))o.push(a),a=`.${a[C]}`;else{o.push(...a[N]),r.push(...a[je]),a=a[j];let h=a.length;if(h>0){let y=a[h-1];y!==";"&&y!=="}"&&(a+=";")}}n+=`${a||""}`}}}}return[s,lr(n),o,r]},se=(e,t,o,r)=>{let[s,n,i,l]=zt(e,t),f=rr.exec(n);f&&(n=f[1]);let u=Ut(s+n),p;if(o){let y=o(u,qt(s),n);y&&(Ft(y)?p=y:(r||Ht)(y))}let a=(f?J:"")+(p||u),h=(f?i.map(y=>y[C]):[a,...l]).join(" ");return{[z]:a,[C]:h,[j]:n,[N]:i,[je]:l}},Ie=e=>{for(let t=0,o=e.length;t<o;t++){let r=e[t];typeof r=="string"&&(e[t]={[z]:"",[C]:"",[j]:"",[N]:[],[je]:[r]})}return e},Me=(e,t,o,r)=>{let[s,n]=zt(e,t),i=Ut(s+n),l;if(o){let f=o(i,qt(s),n);f&&(nr(f)?l=f:(r||Ht)(f))}return{[z]:"",[C]:`@keyframes ${l||i}`,[j]:n,[N]:[],[je]:[]}},cr=0,Be=(e,t,o,r)=>{e||(e=[`/* h-v-t ${cr++} */`]);let s=Array.isArray(e)?se(e,t,o,r):e,n=s[C],i=se(["view-transition-name:",""],[n],o,r);return s[C]=J+s[C],s[j]=s[j].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,n),i[C]=i[z]=n,i[N]=[...s[N],s],i};var ur=e=>{let t=[],o=0,r=0;for(let s=0,n=e.length;s<n;s++){let i=e[s];if(i==="'"||i==='"'){let l=i;for(s++;s<n;s++){if(e[s]==="\\"){s++;continue}if(e[s]===l)break}continue}if(i==="{"){r++;continue}if(i==="}"){r--,r===0&&(t.push(e.slice(o,s+1)),o=s+1);continue}}return t},ot=({id:e})=>{let t,o=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),r=(i,l)=>{let[f,u]=o();if(!f||!u){Promise.resolve().then(()=>{if(!o()[0])throw new Error("style sheet not found");r(i,l)});return}u.has(i)||(u.add(i),(i.startsWith(J)?ur(l):[`${i[0]==="@"?"":"."}${i}{${l}}`]).forEach(p=>{f.insertRule(p,f.cssRules.length)}))};return[{toString(){let i=this[z];return r(i,this[j]),this[N].forEach(({[C]:l,[j]:f})=>{r(l,f)}),this[C]}},({children:i,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:i&&(Array.isArray(i)?i:[i]).map(f=>f[j])}})]},fr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,s]=ot({id:e}),n=p=>(p.toString=r.toString,p),i=(p,...a)=>n(se(p,a,t,o));return{css:i,cx:(...p)=>(p=Ie(p),i(Array(p.length).fill(""),...p)),keyframes:(p,...a)=>Me(p,a,t,o),viewTransition:(p,...a)=>n(Be(p,a,t,o)),Style:s}},Se=fr({id:Pe}),Si=Se.css,bi=Se.cx,Ei=Se.keyframes,$i=Se.viewTransition,Ti=Se.Style;var dr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,s]=ot({id:e}),n=new WeakMap,i=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),f=E=>{let _=({buffer:L,context:$})=>{let[A,S]=n.get($),k=Object.keys(A);if(!k.length)return;let M="";if(k.forEach(K=>{S[K]=!0,M+=K.startsWith(J)?A[K]:`${K[0]==="@"?"":"."}${K}{${A[K]}}`}),n.set($,[{},S]),L&&l.test(L[0])){L[0]=L[0].replace(l,(K,ho,xo)=>`${ho}${M}${xo}`);return}let lt=i.get($),ct=`<script${lt?` nonce="${lt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(M)}<\/script>`;if(L){L[0]=`${ct}${L[0]}`;return}return Promise.resolve(ct)},O=({context:L})=>{n.has(L)||n.set(L,[{},{}]);let[$,A]=n.get(L),S=!0;if(A[E[z]]||(S=!1,$[E[z]]=E[j]),E[N].forEach(({[C]:k,[j]:M})=>{A[k]||(S=!1,$[k]=M)}),!S)return Promise.resolve(w("",[_]))},W=new String(E[C]);Object.assign(W,E),W.isEscaped=!0,W.callbacks=[O];let Q=Promise.resolve(W);return Object.assign(Q,E),Q.toString=r.toString,Q},u=(E,..._)=>f(se(E,_,t,o)),p=(...E)=>(E=Ie(E),u(Array(E.length).fill(""),...E)),a=(E,..._)=>Me(E,_,t,o),h=(E,..._)=>f(Be(E,_,t,o)),y=({children:E,nonce:_}={})=>w(`<style id="${e}"${_?` nonce="${_}"`:""}>${E?E[j]:""}</style>`,[({context:O})=>{i.set(O,_)}]);return y[V]=s,{css:u,cx:p,keyframes:a,viewTransition:h,Style:y}},be=dr({id:Pe}),g=be.css,D=be.cx,wi=be.keyframes,Oi=be.viewTransition,Li=be.Style;var Vt=(e,t)=>{switch(t.type){case"SET_TAB":return{...e,activeTab:t.tab};case"LOAD_STATS_START":return{...e,dashboardStatus:"loading",dashboardError:null};case"LOAD_STATS_SUCCESS":return{...e,dashboardStatus:"loaded",stats:t.stats};case"LOAD_STATS_FAILURE":return{...e,dashboardStatus:"error",dashboardError:t.error};case"LOAD_PEOPLE_START":return{...e,peopleStatus:"loading",peopleError:null};case"LOAD_PEOPLE_SUCCESS":return{...e,peopleStatus:"loaded",people:t.people};case"LOAD_PEOPLE_FAILURE":return{...e,peopleStatus:"error",peopleError:t.error};case"CREATE_PERSON_SUCCESS":return{...e,people:[...e.people,t.person]};case"UPDATE_PERSON_SUCCESS":return{...e,people:e.people.map(o=>o.personId===t.person.personId?t.person:o)};case"SELECT_TABLE":return{...e,selectedTable:t.tableName};case"LOAD_LOOKUPS_START":return{...e,lookupsStatus:"loading",lookupsError:null};case"LOAD_LOOKUPS_SUCCESS":return{...e,lookupsStatus:"loaded",lookupEntries:t.entries};case"LOAD_LOOKUPS_FAILURE":return{...e,lookupsStatus:"error",lookupsError:t.error};case"TOGGLE_ENTRY_SUCCESS":return{...e,lookupEntries:e.lookupEntries.map(o=>o.id===t.entry.id?t.entry:o)};case"LOAD_REQUESTS_START":return{...e,requestsStatus:"loading",requestsError:null};case"LOAD_REQUESTS_SUCCESS":return{...e,requestsStatus:"loaded",requests:t.requests};case"LOAD_REQUESTS_FAILURE":return{...e,requestsStatus:"error",requestsError:t.error};case"APPROVE_REQUEST_SUCCESS":return{...e,requests:e.requests.map(o=>o.id===t.request.id?t.request:o)};case"REJECT_REQUEST_SUCCESS":return{...e,requests:e.requests.map(o=>o.id===t.request.id?t.request:o)};case"SHOW_TOAST":return{...e,toasts:[...e.toasts,t.toast]};case"DISMISS_TOAST":return{...e,toasts:e.toasts.filter(o=>o.id!==t.toastId)}}};var rt=(e,t)=>{switch(t){case"dashboard":return e.dashboardStatus;case"pessoas":return e.peopleStatus;case"lookups":return e.lookupsStatus;case"solicitacoes":return e.requestsStatus}},Wt=e=>e.requests.filter(t=>t.status==="pendente").length;var Kt={activeTab:"dashboard",dashboardStatus:"idle",dashboardError:null,stats:null,peopleStatus:"idle",peopleError:null,people:[],lookupsStatus:"idle",lookupsError:null,selectedTable:null,lookupEntries:[],requestsStatus:"idle",requestsError:null,requests:[],toasts:[]};var x={pageTitle:"Painel Administrativo",pageSubtitle:"Gerencie pessoas, tabelas de refer\xEAncia e solicita\xE7\xF5es",tabDashboard:"Dashboard",tabPessoas:"Pessoas",tabLookups:"Tabelas de Refer\xEAncia",tabSolicitacoes:"Solicita\xE7\xF5es",statsTotalPeople:"Total de pessoas",statsActiveRoles:"Pap\xE9is ativos",statsPendingRequests:"Solicita\xE7\xF5es pendentes",statsRecentAudit:"A\xE7\xF5es recentes",peopleSearchPlaceholder:"Buscar por nome ou CPF...",peopleCreateButton:"Cadastrar pessoa",peopleEmptyState:"Nenhuma pessoa encontrada",lookupsSelectTable:"Selecione uma tabela",lookupsToggleActive:"Ativar",lookupsToggleInactive:"Desativar",lookupsEmptyState:"Nenhuma entrada nesta tabela",requestsApproveButton:"Aprovar",requestsRejectButton:"Rejeitar",requestsEmptyState:"Nenhuma solicita\xE7\xE3o pendente",requestsPendingBadge:"Pendente",requestsApprovedBadge:"Aprovado",requestsRejectedBadge:"Rejeitado",loadingDashboard:"Carregando estat\xEDsticas...",loadingPeople:"Carregando pessoas...",loadingLookups:"Carregando entradas...",loadingRequests:"Carregando solicita\xE7\xF5es...",errorDashboard:"Erro ao carregar estat\xEDsticas",errorPeople:"Erro ao carregar pessoas",errorLookups:"Erro ao carregar entradas",errorRequests:"Erro ao carregar solicita\xE7\xF5es",errorRetry:"Tentar novamente",toastPersonCreated:"Pessoa cadastrada com sucesso",toastPersonUpdated:"Pessoa atualizada com sucesso",toastEntryToggled:"Entrada atualizada com sucesso",toastRequestApproved:"Solicita\xE7\xE3o aprovada",toastRequestRejected:"Solicita\xE7\xE3o rejeitada",toastGenericError:"Ocorreu um erro inesperado"};var st={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},nt=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}};var ne=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:st});return nt(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var Ne=async(e,t)=>{try{let o=await fetch(e,{method:"PUT",credentials:"same-origin",headers:st,body:JSON.stringify(t)});return nt(o)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Gt=async(e,t)=>{try{let o=await fetch(e,{method:"PATCH",credentials:"same-origin",headers:st,body:t!==void 0?JSON.stringify(t):void 0});return nt(o)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var Zt=()=>ne("/api/admin/stats"),Yt=()=>ne("/api/admin/people");var Jt=e=>ne(`/api/admin/lookups/${e}`);var Qt=(e,t)=>Gt(`/api/admin/lookups/${e}/${t}/toggle`),Xt=()=>ne("/api/admin/lookups/requests");var eo=e=>Ne(`/api/admin/lookups/requests/${e}/approve`,{}),to=(e,t)=>Ne(`/api/admin/lookups/requests/${e}/reject`,{reviewNote:t});var d={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",bgBase:"#F8F3EC",bgWarm:"#F0E8DC",bgSage:"#E2E8DF",bgSageDeep:"#D4DDD0",bgCard:"rgba(255,255,255,0.45)",bgCardHover:"rgba(255,255,255,0.65)",bgCardBorder:"rgba(255,255,255,0.6)",bgCardBorderHover:"rgba(79,132,72,0.2)",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",textSagePrimary:"#1E2B1A",textSageSecondary:"#3D5235",textSageMuted:"#6B7F65",textSageSoft:"#8B9E85",primary:"#4F8448",primaryDark:"#3D6A37",danger:"#A6290D",dangerAlt:"#C4422B",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},xr=(e,t)=>{let o=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),s=parseInt(e.slice(5,7),16);return`rgba(${o}, ${r}, ${s}, ${t})`},b={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},T={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},m={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Fi={button:g`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:g`box-shadow: -8px 0 40px ${xr(d.textPrimary,.3)};`,fab:g`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:g`box-shadow: 0 24px 80px ${d.inputLine};`,modal:g`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},R={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"},I={mobile:600,tablet:1200};var yr=g`
  padding: ${m[4]} ${m[3]} ${m[2]};
  @media (min-width: ${I.mobile}px) {
    padding: ${m[5]} ${m[6]} ${m[3]};
  }
`,Sr=g`
  font-family: ${b.erode};
  font-size: 24px;
  font-weight: ${T.bold};
  color: ${d.textPrimary};
  margin: 0 0 ${m[1]} 0;
  @media (min-width: ${I.mobile}px) {
    font-size: 28px;
  }
`,br=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.textMuted};
  margin: 0;
`,oo=({title:e,subtitle:t})=>c("header",{class:yr,children:[c("h1",{class:Sr,children:e}),c("p",{class:br,children:t})]});var Er=g`
  display: flex;
  gap: ${m[1]};
  padding: 0 ${m[3]};
  overflow-x: auto;
  border-bottom: 1px solid ${d.inputLine};
  @media (min-width: ${I.mobile}px) {
    padding: 0 ${m[6]};
    gap: ${m[2]};
  }
`,$r=g`
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: ${m[2]} ${m[3]};
  font-family: ${b.satoshi};
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
`,Tr=g`
  color: ${d.primary};
  border-bottom-color: ${d.primary};
  font-weight: ${T.semibold};
`,vr=g`
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
  font-family: ${b.satoshi};
  font-size: 11px;
  font-weight: ${T.bold};
`,ro=({tabs:e,activeTab:t,pendingCount:o,onSelectTab:r})=>c("nav",{class:Er,role:"tablist","aria-label":"Abas do painel administrativo",children:e.map(s=>c("button",{class:D($r,s.id===t&&Tr),role:"tab","aria-selected":s.id===t,onClick:()=>r(s.id),children:[s.label,s.id==="solicitacoes"&&o>0&&c("span",{class:vr,"aria-label":`${o} pendentes`,children:o})]},s.id))});var Ar=g`
  background: ${d.surfaceLight};
  border-radius: ${R.card};
  padding: ${m[4]};
  border: 1px solid ${d.inputLine};
  display: flex;
  flex-direction: column;
  gap: ${m[1]};
`,kr=g`
  font-family: ${b.erode};
  font-size: 28px;
  font-weight: ${T.bold};
  color: ${d.textPrimary};
  margin: 0;
`,Rr=g`
  font-family: ${b.satoshi};
  font-size: 13px;
  font-weight: ${T.medium};
  color: ${d.textMuted};
  margin: 0;
`,Ee=({label:e,value:t})=>c("div",{class:Ar,children:[c("p",{class:kr,children:t}),c("p",{class:Rr,children:e})]});var Cr=g`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${m[3]};
  padding: ${m[4]} ${m[3]};
  @media (min-width: ${I.mobile}px) {
    grid-template-columns: repeat(4, 1fr);
    padding: ${m[4]} ${m[6]};
  }
`,_r=g`
  padding: ${m[2]} ${m[3]};
  margin: 0 ${m[3]};
  background: ${d.warning}1a;
  color: ${d.warning};
  border-radius: ${R.small};
  font-family: ${b.satoshi};
  font-size: 0.875rem;
  @media (min-width: ${I.mobile}px) {
    margin: 0 ${m[6]};
  }
`,so=({stats:e})=>c("div",{children:[e.health==="partial"&&c("div",{class:_r,children:"Alguns dados podem estar indispon\\u00edveis"}),c("div",{class:Cr,children:[c(Ee,{label:x.statsTotalPeople,value:e.totalPeople}),c(Ee,{label:x.statsActiveRoles,value:e.activeRoles}),c(Ee,{label:x.statsPendingRequests,value:e.pendingRequests}),c(Ee,{label:x.statsRecentAudit,value:e.recentAuditCount})]})]});var wr=g`
  display: flex;
  flex-direction: column;
  gap: ${m[2]};
  padding: ${m[4]} ${m[3]};
  @media (min-width: ${I.mobile}px) {
    padding: ${m[4]} ${m[6]};
  }
`,Or=g`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${d.surfaceLight};
  border: 1px solid ${d.inputLine};
  border-radius: ${R.card};
  padding: ${m[3]};
  gap: ${m[3]};
`,Lr=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  font-weight: ${T.medium};
  color: ${d.textPrimary};
  margin: 0;
`,no=g`
  font-family: ${b.satoshi};
  font-size: 12px;
  font-weight: ${T.regular};
  color: ${d.textMuted};
  margin: 0;
`,Dr=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  color: ${d.textMuted};
  text-align: center;
  padding: ${m[7]};
`,io=({people:e})=>e.length===0?c("p",{class:Dr,children:x.peopleEmptyState}):c("div",{class:wr,children:e.map(t=>c("div",{class:Or,children:[c("div",{children:[c("p",{class:Lr,children:t.fullName}),c("p",{class:no,children:t.cpf??"Sem CPF"})]}),c("p",{class:no,children:t.createdAt.slice(0,10)})]},t.personId))});var Pr=[{value:"dominio_tipo_identidade",label:"Tipo de Identidade"},{value:"dominio_tipo_deficiencia",label:"Tipo de Defici\xEAncia"},{value:"dominio_parentesco",label:"Parentesco"},{value:"dominio_programa_social",label:"Programa Social"},{value:"dominio_condicao_ocupacao",label:"Condi\xE7\xE3o de Ocupa\xE7\xE3o"},{value:"dominio_tipo_ingresso",label:"Tipo de Ingresso"},{value:"dominio_escolaridade",label:"Escolaridade"},{value:"dominio_tipo_beneficio",label:"Tipo de Benef\xEDcio"},{value:"dominio_efeito_condicionalidade",label:"Efeito de Condicionalidade"},{value:"dominio_tipo_violacao",label:"Tipo de Viola\xE7\xE3o"},{value:"dominio_servico_vinculo",label:"Servi\xE7o de V\xEDnculo"},{value:"dominio_tipo_medida",label:"Tipo de Medida"},{value:"dominio_unidade_realizacao",label:"Unidade de Realiza\xE7\xE3o"}],jr=g`
  padding: ${m[4]} ${m[3]};
  display: flex;
  flex-direction: column;
  gap: ${m[3]};
  @media (min-width: ${I.mobile}px) {
    padding: ${m[4]} ${m[6]};
  }
`,Ir=g`
  border: 1px solid ${d.inputLine};
  border-radius: ${R.dropdown};
  padding: ${m[2]} ${m[3]};
  font-family: ${b.satoshi};
  font-size: 14px;
  color: ${d.textPrimary};
  background: ${d.surfaceLight};
  max-width: 280px;
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid ${d.primary};
    outline-offset: 2px;
  }
`,Mr=g`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${d.surfaceLight};
  border: 1px solid ${d.inputLine};
  border-radius: ${R.card};
  padding: ${m[2]} ${m[3]};
`,Br=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.textPrimary};
`,Nr=g`
  border: none;
  padding: ${m[1]} ${m[3]};
  border-radius: ${R.pill};
  font-family: ${b.satoshi};
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
`,Ur=g`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,qr=g`
  background: ${d.inputLine};
  color: ${d.textPrimary};
`,Fr=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  color: ${d.textMuted};
  text-align: center;
  padding: ${m[5]};
`,ao=({selectedTable:e,entries:t,onSelectTable:o,onToggleEntry:r})=>c("div",{class:jr,children:[c("select",{class:Ir,value:e??"","aria-label":x.lookupsSelectTable,onChange:s=>{let n=s.target.value;n&&o(n)},children:[c("option",{value:"",disabled:!0,children:x.lookupsSelectTable}),Pr.map(s=>c("option",{value:s.value,children:s.label},s.value))]}),e&&t.length===0&&c("p",{class:Fr,children:x.lookupsEmptyState}),t.map(s=>c("div",{class:Mr,children:[c("span",{class:Br,children:s.label}),c("button",{type:"button",class:D(Nr,s.active?Ur:qr),onClick:()=>r(s.id),children:s.active?x.lookupsToggleActive:x.lookupsToggleInactive})]},s.id))]});var Hr=g`
  display: flex;
  flex-direction: column;
  gap: ${m[2]};
  padding: ${m[4]} ${m[3]};
  @media (min-width: ${I.mobile}px) {
    padding: ${m[4]} ${m[6]};
  }
`,zr=g`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${m[2]};
  background: ${d.surfaceLight};
  border: 1px solid ${d.inputLine};
  border-radius: ${R.card};
  padding: ${m[3]};
`,Vr=g`
  display: flex;
  flex-direction: column;
  gap: 2px;
`,Wr=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  font-weight: ${T.medium};
  color: ${d.textPrimary};
  margin: 0;
`,Kr=g`
  font-family: ${b.satoshi};
  font-size: 12px;
  color: ${d.textMuted};
  margin: 0;
`,it=g`
  display: inline-block;
  padding: 2px ${m[2]};
  border-radius: ${R.pill};
  font-family: ${b.satoshi};
  font-size: 11px;
  font-weight: ${T.semibold};
`,Gr=g`
  background: ${d.warning};
  color: ${d.textPrimary};
`,Zr=g`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,Yr=g`
  background: ${d.danger};
  color: ${d.surfaceLight};
`,Jr=g`
  display: flex;
  gap: ${m[2]};
`,lo=g`
  border: none;
  padding: ${m[1]} ${m[3]};
  border-radius: ${R.pill};
  font-family: ${b.satoshi};
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
`,Qr=g`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,Xr=g`
  background: ${d.danger};
  color: ${d.surfaceLight};
`,es=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  color: ${d.textMuted};
  text-align: center;
  padding: ${m[7]};
`,ts=g`
  margin-left: ${m[2]};
`,os=e=>{switch(e){case"pendente":return D(it,Gr);case"aprovado":return D(it,Zr);case"rejeitado":return D(it,Yr)}},rs=e=>{switch(e){case"pendente":return x.requestsPendingBadge;case"aprovado":return x.requestsApprovedBadge;case"rejeitado":return x.requestsRejectedBadge}},co=({requests:e,onApprove:t,onReject:o})=>e.length===0?c("p",{class:es,children:x.requestsEmptyState}):c("div",{class:Hr,children:e.map(r=>c("div",{class:zr,children:[c("div",{class:Vr,children:[c("p",{class:Wr,children:[r.label,c("span",{class:D(os(r.status),ts),children:rs(r.status)})]}),c("p",{class:Kr,children:[r.tableName," \u2014 ",r.createdAt.slice(0,10)]})]}),r.status==="pendente"&&c("div",{class:Jr,children:[c("button",{class:D(lo,Qr),onClick:()=>t(r.id),children:x.requestsApproveButton}),c("button",{class:D(lo,Xr),onClick:()=>o(r.id),children:x.requestsRejectButton})]})]},r.id))});var ss=g`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${m[7]};
  gap: ${m[3]};
`,ns=g`
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
`,is=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.textMuted};
`,po=({message:e})=>c("div",{class:ss,role:"status","aria-label":e,children:[c("div",{class:ns}),c("span",{class:is,children:e})]});var as=g`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${m[7]};
  gap: ${m[3]};
`,ls=g`
  font-family: ${b.satoshi};
  font-size: 14px;
  font-weight: ${T.regular};
  color: ${d.danger};
  text-align: center;
`,cs=g`
  background: none;
  border: 1px solid ${d.danger};
  padding: ${m[2]} ${m[4]};
  border-radius: ${R.pill};
  font-family: ${b.satoshi};
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
`,uo=({message:e,retryLabel:t,onRetry:o})=>c("div",{class:as,role:"alert",children:[c("span",{class:ls,children:e}),c("button",{class:cs,onClick:o,children:t})]});var ps=g`
  position: fixed;
  bottom: ${m[4]};
  right: ${m[4]};
  display: flex;
  flex-direction: column;
  gap: ${m[2]};
  z-index: 1000;
  max-width: 360px;
`,at=g`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${m[3]};
  padding: ${m[3]};
  border-radius: ${R.dropdown};
  font-family: ${b.satoshi};
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
`,us=g`
  background: ${d.primary};
  color: ${d.surfaceLight};
`,fs=g`
  background: ${d.danger};
  color: ${d.surfaceLight};
`,ds=g`
  background: ${d.backgroundDark};
  color: ${d.textOnDark};
`,ms=g`
  background: none;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  padding: 0 ${m[1]};
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`,gs=e=>{switch(e){case"success":return D(at,us);case"error":return D(at,fs);case"info":return D(at,ds)}},fo=({toasts:e,onDismiss:t})=>e.length===0?null:c("div",{class:ps,"aria-live":"polite",children:e.map(o=>c("div",{class:gs(o.variant),role:"alert",children:[c("span",{children:o.message}),c("button",{class:ms,onClick:()=>t(o.id),"aria-label":"Fechar",children:"x"})]},o.id))});var hs=[{id:"dashboard",label:x.tabDashboard},{id:"pessoas",label:x.tabPessoas},{id:"lookups",label:x.tabLookups},{id:"solicitacoes",label:x.tabSolicitacoes}],xs=g`
  min-height: 100vh;
  background: ${d.background};
`,Ue=async(e,t,o)=>{switch(e){case"dashboard":{t({type:"LOAD_STATS_START"});let r=await Zt();t(r.ok?{type:"LOAD_STATS_SUCCESS",stats:r.value}:{type:"LOAD_STATS_FAILURE",error:x.errorDashboard});break}case"pessoas":{t({type:"LOAD_PEOPLE_START"});let r=await Yt();t(r.ok?{type:"LOAD_PEOPLE_SUCCESS",people:r.value}:{type:"LOAD_PEOPLE_FAILURE",error:x.errorPeople});break}case"lookups":{if(!o)break;t({type:"LOAD_LOOKUPS_START"});let r=await Jt(o);t(r.ok?{type:"LOAD_LOOKUPS_SUCCESS",entries:r.value}:{type:"LOAD_LOOKUPS_FAILURE",error:x.errorLookups});break}case"solicitacoes":{t({type:"LOAD_REQUESTS_START"});let r=await Xt();t(r.ok?{type:"LOAD_REQUESTS_SUCCESS",requests:r.value}:{type:"LOAD_REQUESTS_FAILURE",error:x.errorRequests});break}}},mo=()=>{let[e,t]=Qe(Vt,Kt);De(()=>{Ue("dashboard",t)},[]),De(()=>{if(e.toasts.length===0)return;let a=e.toasts[e.toasts.length-1];if(!a)return;let h=setTimeout(()=>{t({type:"DISMISS_TOAST",toastId:a.id})},4e3);return()=>clearTimeout(h)},[e.toasts.length]);let o=a=>{t({type:"SET_TAB",tab:a}),rt(e,a)==="idle"&&Ue(a,t,e.selectedTable)},r=a=>{t({type:"SELECT_TABLE",tableName:a}),Ue("lookups",t,a)},s=async a=>{if(!e.selectedTable)return;let h=await Qt(e.selectedTable,a);h.ok?(t({type:"TOGGLE_ENTRY_SUCCESS",entry:h.value}),t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"success",message:x.toastEntryToggled}})):t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"error",message:x.toastGenericError}})},n=async a=>{let h=await eo(a);h.ok?(t({type:"APPROVE_REQUEST_SUCCESS",request:h.value}),t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"success",message:x.toastRequestApproved}})):t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"error",message:x.toastGenericError}})},i=async a=>{let h=globalThis.prompt("Motivo da rejei\xE7\xE3o:");if(h===null)return;let y=await to(a,h);y.ok?(t({type:"REJECT_REQUEST_SUCCESS",request:y.value}),t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"success",message:x.toastRequestRejected}})):t({type:"SHOW_TOAST",toast:{id:crypto.randomUUID(),variant:"error",message:x.toastGenericError}})},l=()=>{Ue(e.activeTab,t,e.selectedTable)},f={dashboard:x.loadingDashboard,pessoas:x.loadingPeople,lookups:x.loadingLookups,solicitacoes:x.loadingRequests},u={dashboard:e.dashboardError??x.errorDashboard,pessoas:e.peopleError??x.errorPeople,lookups:e.lookupsError??x.errorLookups,solicitacoes:e.requestsError??x.errorRequests},p=rt(e,e.activeTab);return c("div",{class:xs,children:[c(oo,{title:x.pageTitle,subtitle:x.pageSubtitle}),c(ro,{tabs:hs,activeTab:e.activeTab,pendingCount:Wt(e),onSelectTab:o}),p==="loading"&&c(po,{message:f[e.activeTab]}),p==="error"&&c(uo,{message:u[e.activeTab],retryLabel:x.errorRetry,onRetry:l}),p!=="loading"&&p!=="error"&&e.activeTab==="dashboard"&&e.stats&&c(so,{stats:e.stats}),p!=="loading"&&p!=="error"&&e.activeTab==="pessoas"&&c(io,{people:e.people}),p!=="loading"&&p!=="error"&&e.activeTab==="lookups"&&c(ao,{selectedTable:e.selectedTable,entries:e.lookupEntries,onSelectTable:r,onToggleEntry:s}),p!=="loading"&&p!=="error"&&e.activeTab==="solicitacoes"&&c(co,{requests:e.requests,onApprove:n,onReject:i}),c(fo,{toasts:e.toasts,onDismiss:a=>t({type:"DISMISS_TOAST",toastId:a})})]})};var go=document.getElementById("admin-hub-app");go&&Ge(c(mo,{}),go);
