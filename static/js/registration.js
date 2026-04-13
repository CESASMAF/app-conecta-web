var Lr=Object.defineProperty;var jr=(e,t)=>{for(var r in t)Lr(e,r,{get:t[r],enumerable:!0})};var Br={Stringify:1,BeforeStream:2,Stream:3},D=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},Fr=/[&<>'"]/,we=async(e,t)=>{let r="";t||=[];let n=await Promise.all(e);for(let o=n.length-1;r+=n[o],o--,!(o<0);o--){let i=n[o];typeof i=="object"&&t.push(...i.callbacks||[]);let a=i.isEscaped;if(i=await(typeof i=="object"?i.toString():i),typeof i=="object"&&t.push(...i.callbacks||[]),i.isEscaped??a)r+=i;else{let l=[r];B(i,l),r=l[0]}}return D(r,t)},B=(e,t)=>{let r=e.search(Fr);if(r===-1){t[0]+=e;return}let n,o,i=0;for(o=r;o<e.length;o++){switch(e.charCodeAt(o)){case 34:n="&quot;";break;case 39:n="&#39;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}t[0]+=e.substring(i,o)+n,i=o+1}t[0]+=e.substring(i,o)},Ve=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],n={};return t.forEach(o=>o({phase:Br.Stringify,buffer:r,context:n})),r[0]};var W=Symbol("RENDERER"),re=Symbol("ERROR_HANDLER"),C=Symbol("STASH"),Re=Symbol("INTERNAL"),ke=Symbol("MEMO"),ne=Symbol("PERMALINK");var Ue=e=>(e[Re]=!0,e);var Ge=e=>({value:t,children:r})=>{if(!r)return;let n={children:[{tag:Ue(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?n.children.push(...r.flat()):n.children.push(r),n.children.push({tag:Ue(()=>{e.pop()}),props:{}});let o={tag:"",props:n,type:""};return o[re]=i=>{throw e.pop(),i},o},fe=e=>{let t=[e],r=Ge(t);return r.values=t,r.Provider=r,F.push(r),r};var F=[],gt=e=>{let t=[e],r=n=>{t.push(n.value);let o;try{o=n.children?(Array.isArray(n.children)?new de("",{},n.children):n.children).toString():""}catch(i){throw t.pop(),i}return o instanceof Promise?o.finally(()=>t.pop()).then(i=>D(i,i.callbacks)):(t.pop(),D(o))};return r.values=t,r.Provider=r,r[W]=Ge(t),F.push(r),r},M=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},pe={},z="data-precedence",De=e=>e.rel==="stylesheet"&&"precedence"in e,Te=(e,t)=>e==="link"?t:oe[e].length>0;var he={};jr(he,{button:()=>Yr,form:()=>Wr,input:()=>Kr,link:()=>Gr,meta:()=>Hr,script:()=>Vr,style:()=>Ur,title:()=>zr});var X=e=>Array.isArray(e)?e:[e];var xt=new WeakMap,yt=(e,t,r,n)=>({buffer:o,context:i})=>{if(!o)return;let a=xt.get(i)||{};xt.set(i,a);let l=a[e]||=[],f=!1,p=oe[e],m=Te(e,n!==void 0);if(m){e:for(let[,c]of l)if(!(e==="link"&&!(c.rel==="stylesheet"&&c[z]!==void 0))){for(let g of p)if((c?.[g]??null)===r?.[g]){f=!0;break e}}}if(f?o[0]=o[0].replaceAll(t,""):m||e==="link"?l.push([t,r,n]):l.unshift([t,r,n]),o[0].indexOf("</head>")!==-1){let c;if(e==="link"||n!==void 0){let g=[];c=l.map(([b,,E],k)=>{if(E===void 0)return[b,Number.MAX_SAFE_INTEGER,k];let T=g.indexOf(E);return T===-1&&(g.push(E),T=g.length-1),[b,T,k]}).sort((b,E)=>b[1]-E[1]||b[2]-E[2]).map(([b])=>b)}else c=l.map(([g])=>g);c.forEach(g=>{o[0]=o[0].replaceAll(g,"")}),o[0]=o[0].replace(/(?=<\/head>)/,c.join(""))}},ue=(e,t,r)=>D(new P(e,r,X(t??[])).toString()),me=(e,t,r,n)=>{if("itemProp"in r)return ue(e,t,r);let{precedence:o,blocking:i,...a}=r;o=n?o??"":void 0,n&&(a[z]=o);let l=new P(e,a,X(t||[])).toString();return l instanceof Promise?l.then(f=>D(l,[...f.callbacks||[],yt(e,f,a,o)])):D(l,[yt(e,l,a,o)])},zr=({children:e,...t})=>{let r=_e();if(r){let n=M(r);if(n==="svg"||n==="head")return new P("title",t,X(e??[]))}return me("title",e,t,!1)},Vr=({children:e,...t})=>{let r=_e();return["src","async"].some(n=>!t[n])||r&&M(r)==="head"?ue("script",e,t):me("script",e,t,!1)},Ur=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,me("style",e,t,!0)):ue("style",e,t),Gr=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?ue("link",e,t):me("link",e,t,De(t)),Hr=({children:e,...t})=>{let r=_e();return r&&M(r)==="head"?ue("meta",e,t):me("meta",e,t,!1)},bt=(e,{children:t,...r})=>new P(e,r,X(t??[])),Wr=e=>(typeof e.action=="function"&&(e.action=ne in e.action?e.action[ne]:void 0),bt("form",e)),St=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=ne in t.formAction?t.formAction[ne]:void 0),bt(e,t)),Kr=e=>St("input",e),Yr=e=>St("button",e);var qr=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),se=e=>qr.get(e)||e,ge=(e,t)=>{for(let[r,n]of Object.entries(e)){let o=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,i=>`-${i.toLowerCase()}`);t(o,n==null?null:typeof n=="number"?o.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${n}`:`${n}px`:n)}};var ye,_e=()=>ye,Xr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Zr=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Jr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],He=(e,t)=>{for(let r=0,n=e.length;r<n;r++){let o=e[r];if(typeof o=="string")B(o,t);else{if(typeof o=="boolean"||o===null||o===void 0)continue;o instanceof P?o.toStringToBuffer(t):typeof o=="number"||o.isEscaped?t[0]+=o:o instanceof Promise?t.unshift("",o):He(o,t)}}},P=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,n){this.tag=t,this.props=r,this.children=n}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,n])=>{r.values.push(n)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Ve(D(t[0],t.callbacks)).toString():t[0]:we(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,n=this.props,{children:o}=this;t[0]+=`<${r}`;let i=ye&&M(ye)==="svg"?a=>Xr(se(a)):a=>se(a);for(let[a,l]of Object.entries(n))if(a=i(a),a!=="children"){if(a==="style"&&typeof l=="object"){let f="";ge(l,(p,m)=>{m!=null&&(f+=`${f?";":""}${p}:${m}`)}),t[0]+=' style="',B(f,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${a}="`,B(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${a}="${l}"`;else if(typeof l=="boolean"&&Jr.includes(a))l&&(t[0]+=` ${a}=""`);else if(a==="dangerouslySetInnerHTML"){if(o.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");o=[D(l.__html)]}else if(l instanceof Promise)t[0]+=` ${a}="`,t.unshift('"',l);else if(typeof l=="function"){if(!a.startsWith("on")&&a!=="ref")throw new Error(`Invalid prop '${a}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${a}="`,B(l.toString(),t),t[0]+='"'}if(Zr.includes(r)&&o.length===0){t[0]+="/>";return}t[0]+=">",He(o,t),t[0]+=`</${r}>`}},xe=class extends P{toStringToBuffer(t){let{children:r}=this,n={...this.props};r.length&&(n.children=r.length===1?r[0]:r);let o=this.tag.call(null,n);if(!(typeof o=="boolean"||o==null))if(o instanceof Promise)if(F.length===0)t.unshift("",o);else{let i=F.map(a=>[a,a.values.at(-1)]);t.unshift("",o.then(a=>(a instanceof P&&(a.localContexts=i),a)))}else o instanceof P?o.toStringToBuffer(t):typeof o=="number"||o.isEscaped?(t[0]+=o,o.callbacks&&(t.callbacks||=[],t.callbacks.push(...o.callbacks))):B(o,t)}},de=class extends P{toStringToBuffer(t){He(this.children,t)}};var Et=!1,Pe=(e,t,r)=>{if(!Et){for(let n in pe)he[n][W]=pe[n];Et=!0}return typeof e=="function"?new xe(e,t,r):he[e]?new xe(he[e],t,r):e==="svg"||e==="head"?(ye||=gt(""),new P(e,t,[new xe(ye,{value:e},r)])):new P(e,t,r)};var ie=({children:e})=>new de("",{children:e},Array.isArray(e)?e:e?[e]:[]);function s(e,t,r){let n;if(!t||!("children"in t))n=Pe(e,t,[]);else{let o=t.children;n=Array.isArray(o)?Pe(e,t,o):Pe(e,t,[o])}return n.key=r,n}var Se="_hp",Qr={Change:"Input",DoubleClick:"DblClick"},en={svg:"2000/svg",math:"1998/Math/MathML"},Z=[],Ke=new WeakMap,ae,kt=()=>ae,V=e=>"t"in e,We={onClick:["click",!1]},vt=e=>{if(!e.startsWith("on"))return;if(We[e])return We[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,n]=t;return We[e]=[(Qr[r]||r).toLowerCase(),!!n]}},Ct=(e,t)=>ae&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Dt=e=>e==null||e===!1?null:e,tn=(e,t)=>{"value"in t&&(e.value=Dt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},rn=(e,t,r)=>{t||={};for(let n in t){let o=t[n];if(n!=="children"&&(!r||r[n]!==o)){n=se(n);let i=vt(n);if(i){if(r?.[n]!==o&&(r&&e.removeEventListener(i[0],r[n],i[1]),o!=null)){if(typeof o!="function")throw new Error(`Event handler for "${n}" is not a function`);e.addEventListener(i[0],o,i[1])}}else if(n==="dangerouslySetInnerHTML"&&o)e.innerHTML=o.__html;else if(n==="ref"){let a;typeof o=="function"?a=o(e)||(()=>o(null)):o&&"current"in o&&(o.current=e,a=()=>o.current=null),Ke.set(e,a)}else if(n==="style"){let a=e.style;typeof o=="string"?a.cssText=o:(a.cssText="",o!=null&&ge(o,a.setProperty.bind(a)))}else{if(n==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Dt(o),l==="TEXTAREA")){e.textContent=o;continue}}else(n==="checked"&&e.nodeName==="INPUT"||n==="selected"&&e.nodeName==="OPTION")&&(e[n]=o);let a=Ct(e,n);o==null||o===!1?e.removeAttribute(a):o===!0?e.setAttribute(a,""):typeof o=="string"||typeof o=="number"?e.setAttribute(a,o):e.setAttribute(a,o.toString())}}}if(r)for(let n in r){let o=r[n];if(n!=="children"&&!(n in t)){n=se(n);let i=vt(n);i?e.removeEventListener(i[0],o,i[1]):n==="ref"?Ke.get(e)?.():e.removeAttribute(Ct(e,n))}}},nn=(e,t)=>{t[C][0]=0,Z.push([e,t]);let r=t.tag[W]||t.tag,n=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,n)]}finally{Z.pop()}},Tt=(e,t,r,n,o)=>{e.vR?.length&&(n.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[C][1][Me]?.forEach(i=>o.push(i)),e.vC.forEach(i=>{if(V(i))r.push(i);else if(typeof i.tag=="function"||i.tag===""){i.c=t;let a=r.length;if(Tt(i,t,r,n,o),i.s){for(let l=a;l<r.length;l++)r[l].s=!0;i.s=!1}}else r.push(i),i.vR?.length&&(n.push(...i.vR),delete i.vR)})},on=e=>{for(;e&&(e.tag===Se||!e.e);)e=e.tag===Se||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},_t=e=>{V(e)||(e[C]?.[1][Me]?.forEach(t=>t[2]?.()),Ke.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(_t)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(be.delete(e),Oe.delete(e),delete e[C][3],e.a=!0)},Ye=(e,t,r)=>{e.c=t,Pt(e,t,r)},$t=(e,t)=>{if(t){for(let r=0,n=e.length;r<n;r++)if(e[r]===t)return r}},At=Symbol(),Pt=(e,t,r)=>{let n=[],o=[],i=[];Tt(e,t,n,o,i),o.forEach(_t);let a=r?void 0:t.childNodes,l,f=null;if(r)l=-1;else if(!a.length)l=0;else{let p=$t(a,on(e.nN));p!==void 0?(f=a[p],l=p):l=$t(a,n.find(m=>m.tag!==Se&&m.e)?.e)??-1,l===-1&&(r=!0)}for(let p=0,m=n.length;p<m;p++,l++){let c=n[p],g;if(c.s&&c.e)g=c.e,c.s=!1;else{let b=r||!c.e;V(c)?(c.e&&c.d&&(c.e.textContent=c.t),c.d=!1,g=c.e||=document.createTextNode(c.t)):(g=c.e||=c.n?document.createElementNS(c.n,c.tag):document.createElement(c.tag),rn(g,c.props,c.pP),Pt(c,g,b),c.tag==="select"&&tn(g,c.props))}c.tag===Se?l--:r?g.parentNode||t.appendChild(g):a[l]!==g&&a[l-1]!==g&&(a[l+1]===g?t.appendChild(a[l]):t.insertBefore(g,f||a[l]||null))}if(e.pP&&(e.pP=void 0),i.length){let p=[],m=[];i.forEach(([,c,,g,b])=>{c&&p.push(c),g&&m.push(g),b?.()}),p.forEach(c=>c()),m.length&&requestAnimationFrame(()=>{m.forEach(c=>c())})}},sn=(e,t)=>!!(e&&e.length===t.length&&e.every((r,n)=>r[1]===t[n][1])),Oe=new WeakMap,Ie=(e,t,r)=>{let n=!r&&t.pC;r&&(t.pC||=t.vC);let o;try{r||=typeof t.tag=="function"?nn(e,t):X(t.props.children),r[0]?.tag===""&&r[0][re]&&(o=r[0][re],e[5].push([e,o,t]));let i=n?[...t.pC]:t.vC?[...t.vC]:void 0,a=[],l;for(let f=0;f<r.length;f++){if(Array.isArray(r[f])){r.splice(f,1,...r[f].flat(1/0)),f--;continue}let p=Ot(r[f]);if(p){typeof p.tag=="function"&&!p.tag[Re]&&(F.length>0&&(p[C][2]=F.map(c=>[c,c.values.at(-1)])),e[5]?.length&&(p[C][3]=e[5].at(-1)));let m;if(i&&i.length){let c=i.findIndex(V(p)?g=>V(g):p.key!==void 0?g=>g.key===p.key&&g.tag===p.tag:g=>g.tag===p.tag);c!==-1&&(m=i[c],i.splice(c,1))}if(m)if(V(p))m.t!==p.t&&(m.t=p.t,m.d=!0),p=m;else{let c=m.pP=m.props;if(m.props=p.props,m.f||=p.f||t.f,typeof p.tag=="function"){let g=m[C][2];m[C][2]=p[C][2]||[],m[C][3]=p[C][3],!m.f&&((m.o||m)===p.o||m.tag[ke]?.(c,m.props))&&sn(g,m[C][2])&&(m.s=!0)}p=m}else if(!V(p)&&ae){let c=M(ae);c&&(p.n=c)}if(!V(p)&&!p.s&&(Ie(e,p),delete p.f),a.push(p),l&&!l.s&&!p.s)for(let c=l;c&&!V(c);c=c.vC?.at(-1))c.nN=p;l=p}}t.vR=n?[...t.vC,...i||[]]:i||[],t.vC=a,n&&delete t.pC}catch(i){if(t.f=!0,i===At){if(o)return;throw i}let[a,l,f]=t[C]?.[3]||[];if(l){let p=()=>Ee([0,!1,e[2]],f),m=Oe.get(f)||[];m.push(p),Oe.set(f,m);let c=l(i,()=>{let g=Oe.get(f);if(g){let b=g.indexOf(p);if(b!==-1)return g.splice(b,1),p()}});if(c){if(e[0]===1)e[1]=!0;else if(Ie(e,f,[c]),(l.length===1||e!==a)&&f.c){Ye(f,f.c,!1);return}throw At}}throw i}finally{o&&e[5].pop()}},Ot=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[C]=[0,[]];else{let t=en[e.tag];t&&(ae||=fe(""),e.props.children=[{tag:ae,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},It=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(n=>It(n,t,r)))},wt=(e,t)=>{t[C][2]?.forEach(([r,n])=>{r.values.push(n)});try{Ie(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[C][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&Ye(t,t.c,!1)},be=new WeakMap,Rt=[],Ee=async(e,t)=>{e[5]||=[];let r=be.get(t);r&&r[0](void 0);let n,o=new Promise(i=>n=i);if(be.set(t,[n,()=>{e[2]?e[2](e,t,i=>{wt(i,t)}).then(()=>n(t)):(wt(e,t),n(t))}]),Rt.length)Rt.at(-1).add(t);else{await Promise.resolve();let i=be.get(t);i&&(be.delete(t),i[1]())}return o},an=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Ie(r,e,void 0),r[4]=!1;let n=document.createDocumentFragment();Ye(e,n,!0),It(e,n,t),t.replaceChildren(n)},qe=(e,t)=>{an(Ot({tag:"",props:{children:e}}),t)};var Xe=(e,t,r)=>({tag:Se,props:{children:e},key:r,e:t,p:1});var ln=0,Me=1,cn=2,fn=3;var Ze=new WeakMap,Je=(e,t)=>!e||!t||e.length!==t.length||t.some((r,n)=>r!==e[n]);var dn;var Mt=[];var L=e=>{let t=()=>typeof e=="function"?e():e,r=Z.at(-1);if(!r)return[t(),()=>{}];let[,n]=r,o=n[C][1][ln]||=[],i=n[C][0]++;return o[i]||=[t(),a=>{let l=dn,f=o[i];if(typeof a=="function"&&(a=a(f[0])),!Object.is(a,f[0]))if(f[0]=a,Mt.length){let[p,m]=Mt.at(-1);Promise.all([p===3?n:Ee([p,!1,l],n),m]).then(([c])=>{if(!c||!(p===2||p===3))return;let g=c.vC;requestAnimationFrame(()=>{setTimeout(()=>{g===c.vC&&Ee([p===3?1:0,!1,l],c)})})})}else Ee([0,!1,l],n)}]},Qe=(e,t,r)=>{let n=J(a=>{i(l=>e(l,a))},[e]),[o,i]=L(()=>r?r(t):t);return[o,n]},pn=(e,t,r)=>{let n=Z.at(-1);if(!n)return;let[,o]=n,i=o[C][1][Me]||=[],a=o[C][0]++,[l,,f]=i[a]||=[];if(Je(l,r)){f&&f();let p=()=>{m[e]=void 0,m[2]=t()},m=[r,void 0,void 0,void 0,void 0];m[e]=p,i[a]=m}},et=(e,t)=>pn(3,e,t);var J=(e,t)=>{let r=Z.at(-1);if(!r)return e;let[,n]=r,o=n[C][1][cn]||=[],i=n[C][0]++,a=o[i];return Je(a?.[1],t)?o[i]=[e,t]:e=o[i][0],e};var tt=e=>{let t=Ze.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>Ze.set(e,[r]),r=>Ze.set(e,[void 0,r])),e},rt=(e,t)=>{let r=Z.at(-1);if(!r)return e();let[,n]=r,o=n[C][1][fn]||=[],i=n[C][0]++,a=o[i];return Je(a?.[1],t)&&(o[i]=[e(),t]),o[i][0]};var Lt=fe({pending:!1,data:null,method:null,action:null}),Nt=new Set,jt=e=>{Nt.add(e),e.finally(()=>Nt.delete(e))};var nt=(e,t)=>rt(()=>r=>{let n;e&&(typeof e=="function"?n=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,n=()=>{e.current=null}));let o=t(r);return()=>{o?.(),n?.()}},[e]),Bt=Object.create(null),Ft=Object.create(null),ve=(e,t,r,n,o)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let i=document.head,{onLoad:a,onError:l,precedence:f,blocking:p,...m}=t,c=null,g=!1,b=oe[e],E=Te(e,n),k=v=>v.getAttribute("rel")==="stylesheet"&&v.getAttribute(z)!==null,T;if(E){let v=i.querySelectorAll(e);e:for(let $ of v)if(!(e==="link"&&!k($))){for(let S of b)if($.getAttribute(S)===t[S]){c=$;break e}}if(!c){let $=b.reduce((S,w)=>t[w]===void 0?S:`${S}-${w}-${t[w]}`,e);g=!Ft[$],c=Ft[$]||=(()=>{let S=document.createElement(e);for(let w of b)t[w]!==void 0&&S.setAttribute(w,t[w]);return t.rel&&S.setAttribute("rel",t.rel),S})()}}else T=i.querySelectorAll(e);f=n?f??"":void 0,n&&(m[z]=f);let Y=J(v=>{if(E){if(e==="link"&&f!==void 0){let S=!1;for(let w of i.querySelectorAll(e)){let I=w.getAttribute(z);if(I===null){i.insertBefore(v,w);return}if(S&&I!==f){i.insertBefore(v,w);return}I===f&&(S=!0)}i.appendChild(v);return}let $=!1;for(let S of i.querySelectorAll(e)){if($&&S.getAttribute(z)!==f){i.insertBefore(v,S);return}S.getAttribute(z)===f&&($=!0)}i.appendChild(v)}else if(e==="link")i.contains(v)||i.appendChild(v);else if(T){let $=!1;for(let S of T)if(S===v){$=!0;break}$||i.insertBefore(v,i.contains(T[0])?T[0]:i.querySelector(e)),T=void 0}},[E,f,e]),te=nt(t.ref,v=>{let $=b[0];if(r===2&&(v.innerHTML=""),(g||T)&&Y(v),!l&&!a||!$)return;let S=Bt[v.getAttribute($)]||=new Promise((w,I)=>{v.addEventListener("load",w),v.addEventListener("error",I)});a&&(S=S.then(a)),l&&(S=S.catch(l)),S.catch(()=>{})});if(o&&p==="render"){let v=oe[e][0];if(v&&t[v]){let $=t[v],S=Bt[$]||=new Promise((w,I)=>{Y(c),c.addEventListener("load",w),c.addEventListener("error",I)});tt(S)}}let _={tag:e,type:e,props:{...m,ref:te},ref:te};return _.p=r,c&&(_.e=c),Xe(_,i)},un=e=>{let t=kt();return(t&&M(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:ve("title",e,void 0,!1,!1)},mn=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:ve("script",e,1,!1,!0),hn=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,ve("style",e,2,!0,!0)),gn=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:ve("link",e,1,De(e),!0),xn=e=>ve("meta",e,void 0,!1,!1),zt=Symbol(),yn=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[n,o]=L([null,!1]),i=J(async p=>{let m=p.isTrusted?t:p.detail[zt];if(typeof m!="function")return;p.preventDefault();let c=new FormData(p.target);o([c,!0]);let g=m(c);g instanceof Promise&&(jt(g),await g),o([null,!0])},[]),a=nt(e.ref,p=>(p.addEventListener("submit",i),()=>{p.removeEventListener("submit",i)})),[l,f]=n;return n[1]=!1,{tag:Lt,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...r,ref:a},type:"form",ref:a}},f}},Vt=(e,{formAction:t,...r})=>{if(typeof t=="function"){let n=J(o=>{o.preventDefault(),o.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[zt]:t}}))},[]);r.ref=nt(r.ref,o=>(o.addEventListener("click",n),()=>{o.removeEventListener("click",n)}))}return{tag:e,props:r,type:e,ref:r.ref}},bn=e=>Vt("input",e),Sn=e=>Vt("button",e);Object.assign(pe,{title:un,script:mn,style:hn,link:gn,meta:xn,form:yn,input:bn,button:Sn});var Q=":-hono-global",vn=new RegExp(`^${Q}{(.*)}$`),Ne="hono-css",U=Symbol(),R=Symbol(),O=Symbol(),j=Symbol(),Le=Symbol(),Ht=Symbol(),ca=Symbol();var Wt=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Kt=e=>e.trim().replace(/\s+/g,"-"),Yt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),Cn=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),$n=e=>Yt(e)&&!Cn.has(e.toLowerCase()),qt=e=>{console.warn(`Invalid slug: ${e}`)},An=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),wn=new RegExp(["("+An+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),Rn=e=>e.replace(wn,(t,r,n,o,i)=>r||n||o||i||""),Xt=(e,t)=>{let r=[],n=[],o=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",i="";for(let a=0,l=e.length;a<l;a++){i+=e[a];let f=t[a];if(!(typeof f=="boolean"||f===null||f===void 0)){Array.isArray(f)||(f=[f]);for(let p=0,m=f.length;p<m;p++){let c=f[p];if(!(typeof c=="boolean"||c===null||c===void 0))if(typeof c=="string")/([\\"'\/])/.test(c)?i+=c.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):i+=c;else if(typeof c=="number")i+=c;else if(c[Ht])i+=c[Ht];else if(c[R].startsWith("@keyframes "))r.push(c),i+=` ${c[R].substring(11)} `;else{if(e[a+1]?.match(/^\s*{/))r.push(c),c=`.${c[R]}`;else{r.push(...c[j]),n.push(...c[Le]),c=c[O];let g=c.length;if(g>0){let b=c[g-1];b!==";"&&b!=="}"&&(c+=";")}}i+=`${c||""}`}}}}return[o,Rn(i),r,n]},le=(e,t,r,n)=>{let[o,i,a,l]=Xt(e,t),f=vn.exec(i);f&&(i=f[1]);let p=Wt(o+i),m;if(r){let b=r(p,Kt(o),i);b&&(Yt(b)?m=b:(n||qt)(b))}let c=(f?Q:"")+(m||p),g=(f?a.map(b=>b[R]):[c,...l]).join(" ");return{[U]:c,[R]:g,[O]:i,[j]:a,[Le]:l}},je=e=>{for(let t=0,r=e.length;t<r;t++){let n=e[t];typeof n=="string"&&(e[t]={[U]:"",[R]:"",[O]:"",[j]:[],[Le]:[n]})}return e},Be=(e,t,r,n)=>{let[o,i]=Xt(e,t),a=Wt(o+i),l;if(r){let f=r(a,Kt(o),i);f&&($n(f)?l=f:(n||qt)(f))}return{[U]:"",[R]:`@keyframes ${l||a}`,[O]:i,[j]:[],[Le]:[]}},kn=0,Fe=(e,t,r,n)=>{e||(e=[`/* h-v-t ${kn++} */`]);let o=Array.isArray(e)?le(e,t,r,n):e,i=o[R],a=le(["view-transition-name:",""],[i],r,n);return o[R]=Q+o[R],o[O]=o[O].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,i),a[R]=a[U]=i,a[j]=[...o[j],o],a};var Tn=e=>{let t=[],r=0,n=0;for(let o=0,i=e.length;o<i;o++){let a=e[o];if(a==="'"||a==='"'){let l=a;for(o++;o<i;o++){if(e[o]==="\\"){o++;continue}if(e[o]===l)break}continue}if(a==="{"){n++;continue}if(a==="}"){n--,n===0&&(t.push(e.slice(r,o+1)),r=o+1);continue}}return t},ot=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),n=(a,l)=>{let[f,p]=r();if(!f||!p){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");n(a,l)});return}p.has(a)||(p.add(a),(a.startsWith(Q)?Tn(l):[`${a[0]==="@"?"":"."}${a}{${l}}`]).forEach(m=>{f.insertRule(m,f.cssRules.length)}))};return[{toString(){let a=this[U];return n(a,this[O]),this[j].forEach(({[R]:l,[O]:f})=>{n(l,f)}),this[R]}},({children:a,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:a&&(Array.isArray(a)?a:[a]).map(f=>f[O])}})]},_n=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[n,o]=ot({id:e}),i=m=>(m.toString=n.toString,m),a=(m,...c)=>i(le(m,c,t,r));return{css:a,cx:(...m)=>(m=je(m),a(Array(m.length).fill(""),...m)),keyframes:(m,...c)=>Be(m,c,t,r),viewTransition:(m,...c)=>i(Fe(m,c,t,r)),Style:o}},Ce=_n({id:Ne}),pa=Ce.css,ua=Ce.cx,ma=Ce.keyframes,ha=Ce.viewTransition,ga=Ce.Style;var Pn=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[n,o]=ot({id:e}),i=new WeakMap,a=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),f=E=>{let k=({buffer:_,context:v})=>{let[$,S]=i.get(v),w=Object.keys($);if(!w.length)return;let I="";if(w.forEach(q=>{S[q]=!0,I+=q.startsWith(Q)?$[q]:`${q[0]==="@"?"":"."}${q}{${$[q]}}`}),i.set(v,[{},S]),_&&l.test(_[0])){_[0]=_[0].replace(l,(q,Mr,Nr)=>`${Mr}${I}${Nr}`);return}let mt=a.get(v),ht=`<script${mt?` nonce="${mt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(I)}<\/script>`;if(_){_[0]=`${ht}${_[0]}`;return}return Promise.resolve(ht)},T=({context:_})=>{i.has(_)||i.set(_,[{},{}]);let[v,$]=i.get(_),S=!0;if($[E[U]]||(S=!1,v[E[U]]=E[O]),E[j].forEach(({[R]:w,[O]:I})=>{$[w]||(S=!1,v[w]=I)}),!S)return Promise.resolve(D("",[k]))},Y=new String(E[R]);Object.assign(Y,E),Y.isEscaped=!0,Y.callbacks=[T];let te=Promise.resolve(Y);return Object.assign(te,E),te.toString=n.toString,te},p=(E,...k)=>f(le(E,k,t,r)),m=(...E)=>(E=je(E),p(Array(E.length).fill(""),...E)),c=(E,...k)=>Be(E,k,t,r),g=(E,...k)=>f(Fe(E,k,t,r)),b=({children:E,nonce:k}={})=>D(`<style id="${e}"${k?` nonce="${k}"`:""}>${E?E[O]:""}</style>`,[({context:T})=>{a.set(T,k)}]);return b[W]=o,{css:p,cx:m,keyframes:c,viewTransition:g,Style:b}},$e=Pn({id:Ne}),d=$e.css,Ae=$e.cx,Zt=$e.keyframes,Ca=$e.viewTransition,Jt=$e.Style;var u={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},ze=(e,t)=>{let r=parseInt(e.slice(1,3),16),n=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16);return`rgba(${r}, ${n}, ${o}, ${t})`},x={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},A={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},h={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},Ra={button:d`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:d`box-shadow: -8px 0 40px ${ze(u.textPrimary,.3)};`,fab:d`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:d`box-shadow: 0 24px 80px ${u.inputLine};`,modal:d`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},N={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};function Qt(e,t){switch(e){case 0:return On(t);case 1:return In(t);case 2:return Mn(t);case 3:return Nn(t);case 4:return Ln();case 5:return jn();case 6:return Bn(t);default:return new Map}}function On(e){let t=new Map;return e.fields.firstName.trim()||t.set("firstName","Nome obrigat\xF3rio"),e.fields.lastName.trim()||t.set("lastName","Sobrenome obrigat\xF3rio"),e.fields.motherName.trim()||t.set("motherName","Nome da m\xE3e obrigat\xF3rio"),e.fields.nationality.trim()||t.set("nationality","Nacionalidade obrigat\xF3ria"),e.fields.gender.trim()||t.set("gender","G\xEAnero obrigat\xF3rio"),t}function In(e){let t=new Map,r=e.documents.cpf.replace(/\D/g,"");if(r?r.length!==11&&t.set("cpf","CPF deve ter 11 d\xEDgitos"):t.set("cpf","CPF obrigat\xF3rio"),!e.documents.birthDate.trim())t.set("birthDate","Data de nascimento obrigat\xF3ria");else if(!/^\d{4}-\d{2}-\d{2}$/.test(e.documents.birthDate))t.set("birthDate","Data deve estar no formato YYYY-MM-DD");else{let a=new Date(e.documents.birthDate);isNaN(a.getTime())?t.set("birthDate","Data inv\xE1lida"):a>new Date&&t.set("birthDate","Data n\xE3o pode ser futura")}let n=[e.documents.rgNumber,e.documents.rgUf,e.documents.rgAgency,e.documents.rgDate],o=n.filter(i=>i.trim().length>0);return o.length>0&&o.length<n.length&&(e.documents.rgNumber.trim()||t.set("rgNumber","N\xFAmero do RG obrigat\xF3rio"),e.documents.rgUf.trim()||t.set("rgUf","UF do RG obrigat\xF3ria"),e.documents.rgAgency.trim()||t.set("rgAgency","\xD3rg\xE3o emissor obrigat\xF3rio"),e.documents.rgDate.trim()||t.set("rgDate","Data de emiss\xE3o obrigat\xF3ria")),t}function Mn(e){let t=new Map;return e.address.housingSituation.trim()||t.set("housingSituation","Situa\xE7\xE3o de moradia obrigat\xF3ria"),e.address.residenceLocation.trim()||t.set("residenceLocation","Localiza\xE7\xE3o da resid\xEAncia obrigat\xF3ria"),e.address.state.trim()||t.set("state","Estado obrigat\xF3rio"),e.address.city.trim()||t.set("city","Cidade obrigat\xF3ria"),t}function Nn(e){let t=new Map;if(e.diagnoses.length===0)return t.set("diagnoses","Ao menos 1 diagn\xF3stico \xE9 obrigat\xF3rio"),t;for(let r=0;r<e.diagnoses.length;r++){let n=e.diagnoses[r];n.code.trim()||t.set(`diagnosis_${r}_code`,"C\xF3digo CID obrigat\xF3rio"),n.date.trim()||t.set(`diagnosis_${r}_date`,"Data do diagn\xF3stico obrigat\xF3ria"),n.description.trim()||t.set(`diagnosis_${r}_description`,"Descri\xE7\xE3o obrigat\xF3ria")}return t}function Ln(){return new Map}function jn(){return new Map}function Bn(e){let t=new Map;return e.intake.ingressType.trim()||t.set("ingressType","Tipo de ingresso obrigat\xF3rio"),e.intake.serviceReason.trim()||t.set("serviceReason","Motivo do atendimento obrigat\xF3rio"),t}var Fn=7;function zn(e,t,r,n){switch(t){case"fields":return{...e,fields:{...e.fields,[r]:n}};case"documents":return{...e,documents:{...e.documents,[r]:n}};case"address":return{...e,address:{...e.address,[r]:n}};case"specificity":return{...e,specificity:{...e.specificity,[r]:n}};case"intake":return{...e,intake:{...e.intake,[r]:n}};default:return e}}function er(e,t){switch(t.type){case"UPDATE_FIELD":return zn(e,t.section,t.field,t.value);case"NEXT_STEP":{let r=Qt(e.currentStep,e);return r.size>0?{...e,errors:r,showErrors:!0}:e.currentStep>=Fn-1?e:{...e,currentStep:e.currentStep+1,showErrors:!1,errors:new Map}}case"PREV_STEP":return{...e,currentStep:Math.max(0,e.currentStep-1),showErrors:!1,errors:new Map};case"ADD_DIAGNOSIS":{let r={code:"",date:"",description:""};return{...e,diagnoses:[...e.diagnoses,r]}}case"REMOVE_DIAGNOSIS":return{...e,diagnoses:e.diagnoses.filter((r,n)=>n!==t.index)};case"APPLY_QUICK_CID":{let r=e.diagnoses.map((n,o)=>o===t.index?{...n,code:t.code,description:t.description}:n);return{...e,diagnoses:r}}case"ADD_FAMILY_MEMBER":return{...e,familyMembers:[...e.familyMembers,t.member]};case"UPDATE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.map((r,n)=>n===t.index?t.member:r)};case"REMOVE_FAMILY_MEMBER":return{...e,familyMembers:e.familyMembers.filter((r,n)=>n!==t.index)};case"TOGGLE_PROGRAM":{let r=e.intake.selectedPrograms,o=r.includes(t.programId)?r.filter(i=>i!==t.programId):[...r,t.programId];return{...e,intake:{...e.intake,selectedPrograms:o}}}case"SAVE_START":return{...e,saving:!0,saveResult:null};case"SAVE_SUCCESS":return{...e,saving:!1,saveResult:{ok:!0,message:t.message}};case"SAVE_FAILURE":return{...e,saving:!1,saveResult:{ok:!1,message:t.message}}}}var tr={currentStep:0,showErrors:!1,saving:!1,saveResult:null,fields:{firstName:"",lastName:"",socialName:"",motherName:"",nationality:"",gender:"",phoneNumber:""},documents:{cpf:"",nis:"",cnsNumber:"",rgNumber:"",rgUf:"",rgAgency:"",rgDate:"",birthDate:""},address:{housingSituation:"",residenceLocation:"",cep:"",street:"",number:"",complement:"",neighborhood:"",state:"",city:""},diagnoses:[],familyMembers:[],specificity:{selectedIdentity:"",description:""},intake:{ingressType:"",originName:"",originContact:"",serviceReason:"",selectedPrograms:[],observation:""},errors:new Map};var st="registration-wizard-draft";function rr(e){let t={...e,errors:Array.from(e.errors.entries())};localStorage.setItem(st,JSON.stringify(t))}function nr(){let e=localStorage.getItem(st);if(!e)return null;let t=JSON.parse(e),r=Array.isArray(t.errors)?new Map(t.errors):new Map;return{...t,errors:r}}function or(){localStorage.removeItem(st)}var it={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},sr=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Vn=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},ir=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:it});return sr(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},ar=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:it});return Vn(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},lr=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:it,body:JSON.stringify(t)});return sr(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var cr={search:(e,t=20,r)=>{let n=new URLSearchParams;return e&&n.set("search",e),r&&n.set("cursor",r),n.set("limit",String(t)),ar(`/api/v1/patients?${n.toString()}`)},getById:e=>ir(`/api/v1/patients/${e}`),create:e=>lr("/api/v1/patients",e)};var Un=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${u.textMuted};
`,Gn=d`
  text-decoration: none;
  color: ${u.textMuted};
  font-weight: ${A.medium};
  &:hover { color: ${u.textPrimary}; }
`,Hn=d`
  color: ${u.textPrimary};
  font-weight: ${A.semibold};
`,fr=()=>s("nav",{class:Un,children:[s("a",{href:"/social-care",class:Gn,children:"Familias"}),s("span",{children:"/"}),s("span",{class:Hn,children:"Cadastro"})]});var Wn=d`
  font-family: ${x.satoshi};
  font-size: 38px;
  font-weight: ${A.bold};
  color: ${u.textPrimary};
  margin: 0;
  line-height: 1.2;
`,dr=()=>s("h1",{class:Wn,children:"Cadastrar Pessoa de Referencia"});var Kn=d`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
`,Yn=d`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: ${h[1]};
`,at=d`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${x.satoshi};
  font-size: 14px;
  font-weight: ${A.bold};
  transition: background 0.2s, border-color 0.2s;
`,qn=d`
  ${at}
  background: transparent;
  border: 1.5px solid ${u.inputLine};
  color: ${u.textMuted};
`,Xn=d`
  ${at}
  background: ${u.textPrimary};
  border: 1.5px solid ${u.textPrimary};
  color: ${u.background};
`,Zn=d`
  ${at}
  background: ${u.primary};
  border: 1.5px solid ${u.primary};
  color: white;
`,pr=d`
  flex: 1;
  height: 2px;
  min-width: 24px;
  margin: 0 ${h[2]};
`,Jn=d`
  ${pr}
  background: ${u.primary};
`,Qn=d`
  ${pr}
  background: ${u.inputLine};
`,eo=d`
  font-family: ${x.satoshi};
  font-size: 11px;
  font-weight: ${A.medium};
  color: ${u.textMuted};
  margin-top: ${h[1]};
  text-align: center;
  white-space: nowrap;
`,ur=({current:e,total:t,labels:r})=>{let n=Array.from({length:t},(o,i)=>i);return s("div",{class:Kn,children:n.map(o=>{let i=o>e,a=o===e,l=o<e;return s(ie,{children:[s("div",{class:Yn,children:[s("div",{class:l?Zn:a?Xn:qn,children:l?s("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"white","stroke-width":"3",children:s("path",{d:"M5 13l4 4L19 7"})}):o+1}),r&&r[o]&&s("span",{class:eo,children:r[o]})]}),o<t-1&&s("div",{class:l?Jn:Qn})]})})})};var to=["Dados Pessoais","Documentos","Endereco","Diagnosticos","Familia","Especificidades","Ingresso"],mr=({currentStep:e})=>s(ur,{current:e,total:7,labels:to});var ro=d`
  border-radius: ${N.pill};
  font-family: ${x.playfair};
  font-style: italic;
  font-size: 16px;
  padding: 12px 24px;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, background 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`,no=d`
  background: ${u.primary};
  color: white;
`,oo=d`
  background: transparent;
  color: ${u.textPrimary};
  border: 1.5px solid ${u.textPrimary};
`,so=d`
  background: transparent;
  color: ${u.danger};
  border: none;
`,io={primary:no,secondary:oo,danger:so},G=({variant:e,disabled:t,onClick:r,children:n})=>s("button",{class:Ae(ro,io[e]),disabled:t,onClick:r,type:"button",children:n});var ao=d`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${h[5]};
`,hr=({currentStep:e,totalSteps:t,saving:r,onBack:n,onNext:o})=>{let i=e===0,a=e===t-1;return s("div",{class:ao,children:[i?s("div",{}):s(G,{variant:"secondary",onClick:n,disabled:r,children:"Voltar"}),s(G,{variant:"primary",onClick:o,disabled:r,children:a?"Salvar":"Proximo"})]})};var lo=d`
  display: flex;
  flex-direction: column;
  gap: ${h[1]};
  width: 100%;
`,co=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${A.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${u.textMuted};
`,fo=d`
  border: none;
  border-bottom: 1px solid ${u.inputLine};
  padding: 8px 0;
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${u.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${u.textPrimary}; }
  &::placeholder {
    color: ${u.textMuted};
    font-family: ${x.playfair};
    font-style: italic;
    font-weight: 300;
  }
`,po=d`
  border-bottom: 2px solid ${u.danger};
  &:focus { border-bottom: 2px solid ${u.danger}; }
`,uo=d`
  font-family: ${x.satoshi};
  font-size: 11px;
  color: ${u.danger};
  margin-top: ${h[1]};
`,mo=d`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`,y=({label:e,value:t,onChange:r,error:n,type:o,disabled:i})=>s("div",{class:Ae(lo,i?mo:void 0),children:[s("label",{class:co,children:e}),s("input",{class:Ae(fo,n?po:void 0),type:o??"text",value:t,onInput:a=>r(a.target.value),disabled:i}),n&&s("span",{class:uo,children:n})]});var ho=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,ee=d`
  min-width: 280px;
  flex: 1;
`,go=d`
  display: flex;
  flex-direction: column;
  gap: ${h[1]};
`,xo=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${A.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${u.textMuted};
`,yo=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${u.textPrimary};
  cursor: pointer;
`,bo=d`
  font-family: ${x.satoshi};
  font-size: 11px;
  color: ${u.danger};
  margin-top: ${h[1]};
`,So=[{value:"MASCULINO",label:"Masculino"},{value:"FEMININO",label:"Feminino"},{value:"NAO_BINARIO",label:"Nao binario"}],gr=({fields:e,errors:t,onUpdate:r})=>s("div",{class:ho,children:[s("div",{class:ee,children:s(y,{label:"Nome",value:e.firstName,onChange:n=>r("firstName",n),error:t.get("firstName")})}),s("div",{class:ee,children:s(y,{label:"Sobrenome",value:e.lastName,onChange:n=>r("lastName",n),error:t.get("lastName")})}),s("div",{class:ee,children:s(y,{label:"Nome social",value:e.socialName,onChange:n=>r("socialName",n)})}),s("div",{class:ee,children:s(y,{label:"Nome da mae",value:e.motherName,onChange:n=>r("motherName",n),error:t.get("motherName")})}),s("div",{class:ee,children:s(y,{label:"Nacionalidade",value:e.nationality,onChange:n=>r("nationality",n),error:t.get("nationality")})}),s("div",{class:ee,children:s("div",{class:go,children:[s("span",{class:xo,children:"Genero"}),So.map(n=>s("label",{class:yo,children:[s("input",{type:"radio",name:"gender",value:n.value,checked:e.gender===n.value,onChange:()=>r("gender",n.value)}),n.label]})),t.get("gender")&&s("span",{class:bo,children:t.get("gender")})]})}),s("div",{class:ee,children:s(y,{label:"Telefone",value:e.phoneNumber,onChange:n=>r("phoneNumber",n)})})]});var Eo=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,K=d`
  min-width: 280px;
  flex: 1;
`,vo=d`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: rgba(38, 29, 17, 0.6);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`,Co=e=>{let t=e.replace(/\D/g,"").slice(0,11);return t.length<=3?t:t.length<=6?`${t.slice(0,3)}.${t.slice(3)}`:t.length<=9?`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6)}`:`${t.slice(0,3)}.${t.slice(3,6)}.${t.slice(6,9)}-${t.slice(9)}`},xr=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=2?t:t.length<=4?`${t.slice(0,2)}/${t.slice(2)}`:`${t.slice(0,2)}/${t.slice(2,4)}/${t.slice(4)}`},lt=e=>e.replace(/\D/g,""),yr=({documents:e,errors:t,onUpdate:r})=>s("div",{class:Eo,children:[s("div",{class:K,children:s(y,{label:"CPF",value:Co(e.cpf),onChange:n=>r("cpf",lt(n)),error:t.get("cpf")})}),s("div",{class:K,children:s(y,{label:"Data de nascimento",value:xr(e.birthDate),onChange:n=>r("birthDate",lt(n)),error:t.get("birthDate")})}),s("div",{class:K,children:s(y,{label:"NIS",value:e.nis,onChange:n=>r("nis",n),error:t.get("nis")})}),s("div",{class:K,children:s(y,{label:"CNS",value:e.cnsNumber,onChange:n=>r("cnsNumber",n),error:t.get("cnsNumber")})}),s("span",{class:vo,children:"RG (preencha todos ou nenhum)"}),s("div",{class:K,children:s(y,{label:"Numero do RG",value:e.rgNumber,onChange:n=>r("rgNumber",n),error:t.get("rgNumber")})}),s("div",{class:K,children:s(y,{label:"UF",value:e.rgUf,onChange:n=>r("rgUf",n),error:t.get("rgUf")})}),s("div",{class:K,children:s(y,{label:"Orgao emissor",value:e.rgAgency,onChange:n=>r("rgAgency",n),error:t.get("rgAgency")})}),s("div",{class:K,children:s(y,{label:"Data de emissao",value:xr(e.rgDate),onChange:n=>r("rgDate",lt(n)),error:t.get("rgDate")})})]});var $o=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,H=d`
  min-width: 280px;
  flex: 1;
`,br=d`
  border: none;
  border-bottom: 1px solid ${u.inputLine};
  padding: 8px 0;
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${u.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  cursor: pointer;
  &:focus { border-bottom: 2px solid ${u.textPrimary}; }
`,ct=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${A.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${u.textMuted};
`,ft=d`
  font-family: ${x.satoshi};
  font-size: 11px;
  color: ${u.danger};
  margin-top: 4px;
`,Ao=d`
  display: flex;
  gap: ${h[4]};
  padding: 8px 0;
`,Sr=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${u.textPrimary};
  cursor: pointer;
`,wl=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${u.textPrimary};
  cursor: pointer;
  padding: 8px 0;
  width: 100%;
`,wo=[{value:"",label:"Selecione..."},{value:"PROPRIA",label:"Propria"},{value:"ALUGADA",label:"Alugada"},{value:"CEDIDA",label:"Cedida"},{value:"SITUACAO_DE_RUA",label:"Situacao de rua"},{value:"OUTROS",label:"Outros"}],Ro=["","AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"],ko=e=>{let t=e.replace(/\D/g,"").slice(0,8);return t.length<=5?t:`${t.slice(0,5)}-${t.slice(5)}`},Er=({address:e,errors:t,onUpdate:r})=>{let[n,o]=L(e.housingSituation==="SITUACAO_DE_RUA"),i=a=>{let l=a==="SITUACAO_DE_RUA";o(l),r("housingSituation",a),l&&(r("street",""),r("number",""),r("complement",""),r("neighborhood",""))};return s("div",{class:$o,children:[s("div",{class:H,children:s("div",{children:[s("label",{class:ct,children:"Situacao de moradia"}),s("select",{class:br,value:e.housingSituation,onChange:a=>i(a.target.value),children:wo.map(a=>s("option",{value:a.value,children:a.label}))}),t.get("housingSituation")&&s("span",{class:ft,children:t.get("housingSituation")})]})}),s("div",{class:H,children:s("div",{children:[s("label",{class:ct,children:"Localizacao"}),s("div",{class:Ao,children:[s("label",{class:Sr,children:[s("input",{type:"radio",name:"residenceLocation",value:"URBANO",checked:e.residenceLocation==="URBANO",onChange:()=>r("residenceLocation","URBANO")}),"Urbano"]}),s("label",{class:Sr,children:[s("input",{type:"radio",name:"residenceLocation",value:"RURAL",checked:e.residenceLocation==="RURAL",onChange:()=>r("residenceLocation","RURAL")}),"Rural"]})]}),t.get("residenceLocation")&&s("span",{class:ft,children:t.get("residenceLocation")})]})}),s("div",{class:H,children:s(y,{label:"CEP",value:ko(e.cep),onChange:a=>r("cep",a.replace(/\D/g,"")),error:t.get("cep")})}),s("div",{class:H,children:s(y,{label:"Rua",value:e.street,onChange:a=>r("street",a),error:t.get("street"),disabled:n})}),s("div",{class:H,children:s(y,{label:"Numero",value:e.number,onChange:a=>r("number",a),error:t.get("number"),disabled:n})}),s("div",{class:H,children:s(y,{label:"Complemento",value:e.complement,onChange:a=>r("complement",a),disabled:n})}),s("div",{class:H,children:s(y,{label:"Bairro",value:e.neighborhood,onChange:a=>r("neighborhood",a),error:t.get("neighborhood"),disabled:n})}),s("div",{class:H,children:s("div",{children:[s("label",{class:ct,children:"Estado"}),s("select",{class:br,value:e.state,onChange:a=>r("state",a.target.value),children:Ro.map(a=>s("option",{value:a,children:a||"Selecione..."}))}),t.get("state")&&s("span",{class:ft,children:t.get("state")})]})}),s("div",{class:H,children:s(y,{label:"Cidade",value:e.city,onChange:a=>r("city",a),error:t.get("city")})})]})};var Do=d`
  display: flex;
  flex-direction: column;
  gap: ${h[5]};
`,To=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
  padding: ${h[4]};
  border: 1px solid ${u.inputLine};
  border-radius: ${N.card};
  position: relative;
`,dt=d`
  min-width: 280px;
  flex: 1;
`,_o=d`
  position: absolute;
  top: ${h[2]};
  right: ${h[2]};
  border: none;
  background: transparent;
  color: ${u.danger};
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: ${h[1]};
  &:hover { opacity: 0.7; }
`,Po=d`
  display: flex;
  gap: ${h[2]};
  flex-wrap: wrap;
  margin-top: ${h[1]};
`,Oo=d`
  font-family: ${x.satoshi};
  font-size: 12px;
  font-weight: ${A.medium};
  padding: 4px 10px;
  border-radius: ${N.pill};
  border: 1px solid ${u.inputLine};
  background: transparent;
  color: ${u.textPrimary};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${u.surface}; }
`,Io=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${u.textMuted};
  text-align: center;
  padding: ${h[5]} 0;
`,Mo=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  color: ${u.danger};
`,No=[{code:"G80",description:"Paralisia cerebral"},{code:"Q90",description:"Sindrome de Down"},{code:"F84.0",description:"Autismo infantil"},{code:"E70",description:"Fenilcetonuria"},{code:"G71.0",description:"Distrofia muscular"}],vr=({diagnoses:e,errors:t,onUpdateEntry:r,onAddDiagnosis:n,onRemoveDiagnosis:o,onApplyQuickCid:i})=>s("div",{class:Do,children:[t.get("diagnoses")&&s("span",{class:Mo,children:t.get("diagnoses")}),e.length===0&&s("p",{class:Io,children:"Nenhum diagnostico adicionado. Clique abaixo para adicionar."}),e.map((a,l)=>s("div",{class:To,children:[s("button",{class:_o,type:"button",onClick:()=>o(l),"aria-label":"Remover diagnostico",children:"\xD7"}),s("div",{class:dt,children:[s(y,{label:"Codigo CID",value:a.code,onChange:f=>r(l,"code",f),error:t.get(`diagnosis_${l}_code`)}),s("div",{class:Po,children:No.map(f=>s("button",{class:Oo,type:"button",onClick:()=>i(l,f.code,f.description),children:f.code}))})]}),s("div",{class:dt,children:s(y,{label:"Data do diagnostico",value:a.date,onChange:f=>r(l,"date",f),error:t.get(`diagnosis_${l}_date`)})}),s("div",{class:dt,children:s(y,{label:"Descricao",value:a.description,onChange:f=>r(l,"description",f),error:t.get(`diagnosis_${l}_description`)})})]})),s(G,{variant:"secondary",onClick:n,children:"Adicionar diagnostico"})]});var Lo=d`
  display: flex;
  flex-direction: column;
  gap: ${h[4]};
`,jo=d`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${h[3]} ${h[4]};
  border: 1px solid ${u.inputLine};
  border-radius: ${N.card};
  font-family: ${x.satoshi};
`,Bo=d`
  display: flex;
  flex-direction: column;
  gap: 2px;
`,Fo=d`
  font-size: 16px;
  font-weight: ${A.semibold};
  color: ${u.textPrimary};
`,zo=d`
  font-size: 13px;
  color: ${u.textMuted};
`,Vo=d`
  border: none;
  background: transparent;
  color: ${u.danger};
  font-size: 18px;
  cursor: pointer;
  padding: ${h[1]};
  &:hover { opacity: 0.7; }
`,Uo=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[4]};
  padding: ${h[4]};
  border: 1px solid ${u.primary};
  border-radius: ${N.card};
`,ce=d`
  min-width: 200px;
  flex: 1;
`,Go=d`
  width: 100%;
  display: flex;
  gap: ${h[3]};
  justify-content: flex-end;
`,Ho=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${u.textMuted};
  text-align: center;
  padding: ${h[4]} 0;
`,Cr=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${u.textPrimary};
  cursor: pointer;
`,$r={name:"",birthDate:"",gender:"",relationship:"",livesWithPatient:!0,isDisabled:!1},Ar=({familyMembers:e,onAddMember:t,onRemoveMember:r})=>{let[n,o]=L(!1),[i,a]=L($r),l=()=>{i.name.trim()&&i.relationship.trim()&&(t(i),a($r),o(!1))};return s("div",{class:Lo,children:[e.length===0&&!n&&s("p",{class:Ho,children:"Nenhum membro familiar adicionado. Este passo e opcional."}),e.map((f,p)=>s("div",{class:jo,children:[s("div",{class:Bo,children:[s("span",{class:Fo,children:f.name}),s("span",{class:zo,children:[f.relationship," | ",f.gender," | ",f.livesWithPatient?"Reside":"Nao reside"]})]}),s("button",{class:Vo,type:"button",onClick:()=>r(p),"aria-label":"Remover membro",children:"\xD7"})]})),n&&s("div",{class:Uo,children:[s("div",{class:ce,children:s(y,{label:"Nome",value:i.name,onChange:f=>a({...i,name:f})})}),s("div",{class:ce,children:s(y,{label:"Data de nascimento",value:i.birthDate,onChange:f=>a({...i,birthDate:f})})}),s("div",{class:ce,children:s(y,{label:"Genero",value:i.gender,onChange:f=>a({...i,gender:f})})}),s("div",{class:ce,children:s(y,{label:"Parentesco",value:i.relationship,onChange:f=>a({...i,relationship:f})})}),s("div",{class:ce,children:s("label",{class:Cr,children:[s("input",{type:"checkbox",checked:i.livesWithPatient,onChange:()=>a({...i,livesWithPatient:!i.livesWithPatient})}),"Reside com o paciente"]})}),s("div",{class:ce,children:s("label",{class:Cr,children:[s("input",{type:"checkbox",checked:i.isDisabled,onChange:()=>a({...i,isDisabled:!i.isDisabled})}),"Pessoa com deficiencia"]})}),s("div",{class:Go,children:[s(G,{variant:"danger",onClick:()=>o(!1),children:"Cancelar"}),s(G,{variant:"primary",onClick:l,children:"Confirmar"})]})]}),!n&&s(G,{variant:"secondary",onClick:()=>o(!0),children:"Adicionar membro"})]})};var Wo=d`
  display: flex;
  flex-direction: column;
  gap: ${h[4]};
`,Ko=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${u.textMuted};
`,Yo=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[3]};
`,wr=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 15px;
  color: ${u.textPrimary};
  cursor: pointer;
  padding: ${h[2]} ${h[3]};
  border: 1px solid ${u.inputLine};
  border-radius: 100px;
  transition: border-color 0.15s, background 0.15s;
  &:hover { background: ${u.surface}; }
`,qo=d`
  ${wr}
  border-color: ${u.primary};
  background: rgba(79, 132, 72, 0.06);
`,Xo=d`
  max-width: 480px;
`,Zo=[{value:"INDIGENA",label:"Indigena"},{value:"QUILOMBOLA",label:"Quilombola"},{value:"CIGANO",label:"Cigano(a)"},{value:"RIBEIRINHO",label:"Ribeirinho(a)"},{value:"EXTRATIVISTA",label:"Extrativista"},{value:"OUTRO",label:"Outro"}],Rr=({specificity:e,errors:t,onUpdate:r})=>s("div",{class:Wo,children:[s("p",{class:Ko,children:"Este passo e opcional. Selecione uma identidade social caso aplicavel."}),s("div",{class:Yo,children:Zo.map(n=>s("label",{class:e.selectedIdentity===n.value?qo:wr,children:[s("input",{type:"radio",name:"selectedIdentity",value:n.value,checked:e.selectedIdentity===n.value,onChange:()=>r("selectedIdentity",n.value),style:"display:none"}),n.label]}))}),e.selectedIdentity&&s("div",{class:Xo,children:s(y,{label:"Descricao adicional",value:e.description,onChange:n=>r("description",n),error:t.get("description")})})]});var Jo=d`
  display: flex;
  flex-wrap: wrap;
  gap: ${h[6]};
`,pt=d`
  min-width: 280px;
  flex: 1;
`,Qo=d`
  width: 100%;
`,ut=d`
  font-family: ${x.satoshi};
  font-size: 13px;
  font-weight: ${A.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${u.textMuted};
`,es=d`
  border: none;
  border-bottom: 1px solid ${u.inputLine};
  padding: 8px 0;
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${u.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  cursor: pointer;
  &:focus { border-bottom: 2px solid ${u.textPrimary}; }
`,kr=d`
  font-family: ${x.satoshi};
  font-size: 11px;
  color: ${u.danger};
  margin-top: 4px;
`,Dr=d`
  border: 1px solid ${u.inputLine};
  border-radius: ${N.dropdown};
  padding: ${h[3]};
  font-family: ${x.satoshi};
  font-size: 16px;
  color: ${u.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  &:focus { border-color: ${u.textPrimary}; }
`,ts=d`
  ${Dr}
  border-color: ${u.danger};
  &:focus { border-color: ${u.danger}; }
`,rs=d`
  display: flex;
  flex-direction: column;
  gap: ${h[2]};
  width: 100%;
`,ns=d`
  display: flex;
  align-items: center;
  gap: ${h[2]};
  font-family: ${x.satoshi};
  font-size: 15px;
  color: ${u.textPrimary};
  cursor: pointer;
`,os=[{value:"",label:"Selecione..."},{value:"DEMANDA_ESPONTANEA",label:"Demanda espontanea"},{value:"BUSCA_ATIVA",label:"Busca ativa"},{value:"ENCAMINHAMENTO",label:"Encaminhamento"},{value:"REINCIDENCIA",label:"Reincidencia"}],ss=[{id:"BPC",label:"BPC (Beneficio de Prestacao Continuada)"},{id:"BOLSA_FAMILIA",label:"Bolsa Familia"},{id:"AUXILIO_BRASIL",label:"Auxilio Brasil"},{id:"PETI",label:"PETI"},{id:"OUTROS",label:"Outros programas"}],Tr=({intake:e,errors:t,onUpdate:r,onToggleProgram:n})=>s("div",{class:Jo,children:[s("div",{class:pt,children:s("div",{children:[s("label",{class:ut,children:"Tipo de ingresso"}),s("select",{class:es,value:e.ingressType,onChange:o=>r("ingressType",o.target.value),children:os.map(o=>s("option",{value:o.value,children:o.label}))}),t.get("ingressType")&&s("span",{class:kr,children:t.get("ingressType")})]})}),s("div",{class:pt,children:s(y,{label:"Nome da origem",value:e.originName,onChange:o=>r("originName",o)})}),s("div",{class:pt,children:s(y,{label:"Contato da origem",value:e.originContact,onChange:o=>r("originContact",o)})}),s("div",{class:Qo,children:[s("label",{class:ut,children:"Motivo do atendimento"}),s("textarea",{class:t.get("serviceReason")?ts:Dr,value:e.serviceReason,onInput:o=>r("serviceReason",o.target.value)}),t.get("serviceReason")&&s("span",{class:kr,children:t.get("serviceReason")})]}),s("div",{class:rs,children:[s("label",{class:ut,children:"Programas sociais vinculados"}),ss.map(o=>s("label",{class:ns,children:[s("input",{type:"checkbox",checked:e.selectedPrograms.includes(o.id),onChange:()=>n(o.id)}),o.label]}))]})]});var is=Zt`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,as=d`
  display: flex;
  align-items: center;
  gap: ${h[3]};
  padding: ${h[3]} ${h[4]};
  background: ${ze(u.danger,.06)};
  border: 1px solid ${ze(u.danger,.12)};
  border-radius: ${N.dropdown};
  animation: ${is} 400ms ease-out;
`,ls=d`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${u.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${x.satoshi};
  font-size: 14px;
  font-weight: ${A.bold};
  flex-shrink: 0;
`,cs=d`
  font-family: ${x.satoshi};
  font-size: 14px;
  color: ${u.danger};
  flex: 1;
`,fs=d`
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${u.danger};
  font-size: 18px;
  line-height: 1;
  padding: ${h[1]};
  opacity: 0.7;
  &:hover { opacity: 1; }
`,_r=({message:e,onDismiss:t})=>s("div",{class:as,role:"alert",children:[s("div",{class:ls,children:"!"}),s("span",{class:cs,children:e}),t&&s("button",{class:fs,onClick:t,type:"button","aria-label":"Fechar",children:"\xD7"})]});var Pr=7,ds=d`
  display: flex;
  flex-direction: column;
  gap: ${h[5]};
  padding: ${h[5]} ${h[6]};
  max-width: 960px;
  margin: 0 auto;
`,Or=()=>{let[e,t]=Qe(er,nr()??tr);et(()=>{rr(e)},[e]);let r=async()=>{if(e.currentStep===Pr-1){t({type:"SAVE_START"});let a=await cr.create(e);a.ok?(or(),t({type:"SAVE_SUCCESS",message:"Cadastro salvo com sucesso!"})):t({type:"SAVE_FAILURE",message:a.error.message})}else t({type:"NEXT_STEP"})},n=()=>{t({type:"PREV_STEP"})},o=e.showErrors?e.errors:new Map,i=a=>(l,f)=>{t({type:"UPDATE_FIELD",section:a,field:l,value:f})};return s("div",{class:ds,children:[s(fr,{}),s(dr,{}),s(mr,{currentStep:e.currentStep}),e.saveResult&&!e.saveResult.ok&&s(_r,{message:e.saveResult.message}),e.currentStep===0&&s(gr,{fields:e.fields,errors:o,onUpdate:i("fields")}),e.currentStep===1&&s(yr,{documents:e.documents,errors:o,onUpdate:i("documents")}),e.currentStep===2&&s(Er,{address:e.address,errors:o,onUpdate:i("address")}),e.currentStep===3&&s(vr,{diagnoses:e.diagnoses,errors:o,onUpdateEntry:(a,l,f)=>{let p=e.diagnoses[a];if(!p)return;let m={...p,[l]:f};t({type:"APPLY_QUICK_CID",index:a,code:m.code,description:m.description})},onAddDiagnosis:()=>t({type:"ADD_DIAGNOSIS"}),onRemoveDiagnosis:a=>t({type:"REMOVE_DIAGNOSIS",index:a}),onApplyQuickCid:(a,l,f)=>t({type:"APPLY_QUICK_CID",index:a,code:l,description:f})}),e.currentStep===4&&s(Ar,{familyMembers:e.familyMembers,onAddMember:a=>t({type:"ADD_FAMILY_MEMBER",member:a}),onRemoveMember:a=>t({type:"REMOVE_FAMILY_MEMBER",index:a})}),e.currentStep===5&&s(Rr,{specificity:e.specificity,errors:o,onUpdate:i("specificity")}),e.currentStep===6&&s(Tr,{intake:e.intake,errors:o,onUpdate:i("intake"),onToggleProgram:a=>t({type:"TOGGLE_PROGRAM",programId:a})}),s(hr,{currentStep:e.currentStep,totalSteps:Pr,saving:e.saving,onBack:n,onNext:r})]})};var Ir=document.getElementById("registration-app");Ir&&qe(s(ie,{children:[s(Jt,{}),s(Or,{})]}),Ir);
