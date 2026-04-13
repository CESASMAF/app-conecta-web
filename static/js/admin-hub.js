var Ho=Object.defineProperty;var qo=(e,t)=>{for(var o in t)Ho(e,o,{get:t[o],enumerable:!0})};var zo={Stringify:1,BeforeStream:2,Stream:3},D=(e,t)=>{let o=new String(e);return o.isEscaped=!0,o.callbacks=t,o},Vo=/[&<>'"]/,Ie=async(e,t)=>{let o="";t||=[];let s=await Promise.all(e);for(let n=s.length-1;o+=s[n],n--,!(n<0);n--){let i=s[n];typeof i=="object"&&t.push(...i.callbacks||[]);let p=i.isEscaped;if(i=await(typeof i=="object"?i.toString():i),typeof i=="object"&&t.push(...i.callbacks||[]),i.isEscaped??p)o+=i;else{let l=[o];V(i,l),o=l[0]}}return D(o,t)},V=(e,t)=>{let o=e.search(Vo);if(o===-1){t[0]+=e;return}let s,n,i=0;for(n=o;n<e.length;n++){switch(e.charCodeAt(n)){case 34:s="&quot;";break;case 39:s="&#39;";break;case 38:s="&amp;";break;case 60:s="&lt;";break;case 62:s="&gt;";break;default:continue}t[0]+=e.substring(i,n)+s,i=n+1}t[0]+=e.substring(i,n)},tt=e=>{let t=e.callbacks;if(!t?.length)return e;let o=[e],s={};return t.forEach(n=>n({phase:zo.Stringify,buffer:o,context:s})),o[0]};var X=Symbol("RENDERER"),le=Symbol("ERROR_HANDLER"),k=Symbol("STASH"),Ne=Symbol("INTERNAL"),Be=Symbol("MEMO"),ce=Symbol("PERMALINK");var ot=e=>(e[Ne]=!0,e);var rt=e=>({value:t,children:o})=>{if(!o)return;let s={children:[{tag:ot(()=>{e.push(t)}),props:{}}]};Array.isArray(o)?s.children.push(...o.flat()):s.children.push(o),s.children.push({tag:ot(()=>{e.pop()}),props:{}});let n={tag:"",props:s,type:""};return n[le]=i=>{throw e.pop(),i},n},ye=e=>{let t=[e],o=rt(t);return o.values=t,o.Provider=o,W.push(o),o};var W=[],Rt=e=>{let t=[e],o=s=>{t.push(s.value);let n;try{n=s.children?(Array.isArray(s.children)?new be("",{},s.children):s.children).toString():""}catch(i){throw t.pop(),i}return n instanceof Promise?n.finally(()=>t.pop()).then(i=>D(i,i.callbacks)):(t.pop(),D(n))};return o.values=t,o.Provider=o,o[X]=rt(t),W.push(o),o},F=e=>e.values.at(-1);var pe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},Se={},K="data-precedence",Fe=e=>e.rel==="stylesheet"&&"precedence"in e,Ue=(e,t)=>e==="link"?t:pe[e].length>0;var $e={};qo($e,{button:()=>Qo,form:()=>Xo,input:()=>Zo,link:()=>Yo,meta:()=>Jo,script:()=>Ko,style:()=>Go,title:()=>Wo});var te=e=>Array.isArray(e)?e:[e];var _t=new WeakMap,Dt=(e,t,o,s)=>({buffer:n,context:i})=>{if(!n)return;let p=_t.get(i)||{};_t.set(i,p);let l=p[e]||=[],d=!1,f=pe[e],m=Ue(e,s!==void 0);if(m){e:for(let[,c]of l)if(!(e==="link"&&!(c.rel==="stylesheet"&&c[K]!==void 0))){for(let x of f)if((c?.[x]??null)===o?.[x]){d=!0;break e}}}if(d?n[0]=n[0].replaceAll(t,""):m||e==="link"?l.push([t,o,s]):l.unshift([t,o,s]),n[0].indexOf("</head>")!==-1){let c;if(e==="link"||s!==void 0){let x=[];c=l.map(([b,,E],_)=>{if(E===void 0)return[b,Number.MAX_SAFE_INTEGER,_];let L=x.indexOf(E);return L===-1&&(x.push(E),L=x.length-1),[b,L,_]}).sort((b,E)=>b[1]-E[1]||b[2]-E[2]).map(([b])=>b)}else c=l.map(([x])=>x);c.forEach(x=>{n[0]=n[0].replaceAll(x,"")}),n[0]=n[0].replace(/(?=<\/head>)/,c.join(""))}},Ee=(e,t,o)=>D(new P(e,o,te(t??[])).toString()),ve=(e,t,o,s)=>{if("itemProp"in o)return Ee(e,t,o);let{precedence:n,blocking:i,...p}=o;n=s?n??"":void 0,s&&(p[K]=n);let l=new P(e,p,te(t||[])).toString();return l instanceof Promise?l.then(d=>D(l,[...d.callbacks||[],Dt(e,d,p,n)])):D(l,[Dt(e,l,p,n)])},Wo=({children:e,...t})=>{let o=He();if(o){let s=F(o);if(s==="svg"||s==="head")return new P("title",t,te(e??[]))}return ve("title",e,t,!1)},Ko=({children:e,...t})=>{let o=He();return["src","async"].some(s=>!t[s])||o&&F(o)==="head"?Ee("script",e,t):ve("script",e,t,!1)},Go=({children:e,...t})=>["href","precedence"].every(o=>o in t)?(t["data-href"]=t.href,delete t.href,ve("style",e,t,!0)):Ee("style",e,t),Yo=({children:e,...t})=>["onLoad","onError"].some(o=>o in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?Ee("link",e,t):ve("link",e,t,Fe(t)),Jo=({children:e,...t})=>{let o=He();return o&&F(o)==="head"?Ee("meta",e,t):ve("meta",e,t,!1)},Lt=(e,{children:t,...o})=>new P(e,o,te(t??[])),Xo=e=>(typeof e.action=="function"&&(e.action=ce in e.action?e.action[ce]:void 0),Lt("form",e)),Ot=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=ce in t.formAction?t.formAction[ce]:void 0),Lt(e,t)),Zo=e=>Ot("input",e),Qo=e=>Ot("button",e);var er=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),de=e=>er.get(e)||e,ke=(e,t)=>{for(let[o,s]of Object.entries(e)){let n=o[0]==="-"||!/[A-Z]/.test(o)?o:o.replace(/[A-Z]/g,i=>`-${i.toLowerCase()}`);t(n,s==null?null:typeof s=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${s}`:`${s}px`:s)}};var we,He=()=>we,tr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,or=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],rr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],st=(e,t)=>{for(let o=0,s=e.length;o<s;o++){let n=e[o];if(typeof n=="string")V(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof P?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):st(n,t)}}},P=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,o,s){this.tag=t,this.props=o,this.children=s}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([o,s])=>{o.values.push(s)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([o])=>{o.values.pop()})}return t.length===1?"callbacks"in t?tt(D(t[0],t.callbacks)).toString():t[0]:Ie(t,t.callbacks)}toStringToBuffer(t){let o=this.tag,s=this.props,{children:n}=this;t[0]+=`<${o}`;let i=we&&F(we)==="svg"?p=>tr(de(p)):p=>de(p);for(let[p,l]of Object.entries(s))if(p=i(p),p!=="children"){if(p==="style"&&typeof l=="object"){let d="";ke(l,(f,m)=>{m!=null&&(d+=`${d?";":""}${f}:${m}`)}),t[0]+=' style="',V(d,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${p}="`,V(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${p}="${l}"`;else if(typeof l=="boolean"&&rr.includes(p))l&&(t[0]+=` ${p}=""`);else if(p==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[D(l.__html)]}else if(l instanceof Promise)t[0]+=` ${p}="`,t.unshift('"',l);else if(typeof l=="function"){if(!p.startsWith("on")&&p!=="ref")throw new Error(`Invalid prop '${p}' of type 'function' supplied to '${o}'.`)}else t[0]+=` ${p}="`,V(l.toString(),t),t[0]+='"'}if(or.includes(o)&&n.length===0){t[0]+="/>";return}t[0]+=">",st(n,t),t[0]+=`</${o}>`}},Ae=class extends P{toStringToBuffer(t){let{children:o}=this,s={...this.props};o.length&&(s.children=o.length===1?o[0]:o);let n=this.tag.call(null,s);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(W.length===0)t.unshift("",n);else{let i=W.map(p=>[p,p.values.at(-1)]);t.unshift("",n.then(p=>(p instanceof P&&(p.localContexts=i),p)))}else n instanceof P?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):V(n,t)}},be=class extends P{toStringToBuffer(t){st(this.children,t)}};var jt=!1,qe=(e,t,o)=>{if(!jt){for(let s in Se)$e[s][X]=Se[s];jt=!0}return typeof e=="function"?new Ae(e,t,o):$e[e]?new Ae($e[e],t,o):e==="svg"||e==="head"?(we||=Rt(""),new P(e,t,[new Ae(we,{value:e},o)])):new P(e,t,o)};var T=({children:e})=>new be("",{children:e},Array.isArray(e)?e:e?[e]:[]);function r(e,t,o){let s;if(!t||!("children"in t))s=qe(e,t,[]);else{let n=t.children;s=Array.isArray(n)?qe(e,t,n):qe(e,t,[n])}return s.key=o,s}var Ce="_hp",sr={Change:"Input",DoubleClick:"DblClick"},nr={svg:"2000/svg",math:"1998/Math/MathML"},oe=[],at=new WeakMap,ue,Ut=()=>ue,G=e=>"t"in e,nt={onClick:["click",!1]},Pt=e=>{if(!e.startsWith("on"))return;if(nt[e])return nt[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,o,s]=t;return nt[e]=[(sr[o]||o).toLowerCase(),!!s]}},Mt=(e,t)=>ue&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Ht=e=>e==null||e===!1?null:e,ar=(e,t)=>{"value"in t&&(e.value=Ht(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},ir=(e,t,o)=>{t||={};for(let s in t){let n=t[s];if(s!=="children"&&(!o||o[s]!==n)){s=de(s);let i=Pt(s);if(i){if(o?.[s]!==n&&(o&&e.removeEventListener(i[0],o[s],i[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${s}" is not a function`);e.addEventListener(i[0],n,i[1])}}else if(s==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(s==="ref"){let p;typeof n=="function"?p=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,p=()=>n.current=null),at.set(e,p)}else if(s==="style"){let p=e.style;typeof n=="string"?p.cssText=n:(p.cssText="",n!=null&&ke(n,p.setProperty.bind(p)))}else{if(s==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=Ht(n),l==="TEXTAREA")){e.textContent=n;continue}}else(s==="checked"&&e.nodeName==="INPUT"||s==="selected"&&e.nodeName==="OPTION")&&(e[s]=n);let p=Mt(e,s);n==null||n===!1?e.removeAttribute(p):n===!0?e.setAttribute(p,""):typeof n=="string"||typeof n=="number"?e.setAttribute(p,n):e.setAttribute(p,n.toString())}}}if(o)for(let s in o){let n=o[s];if(s!=="children"&&!(s in t)){s=de(s);let i=Pt(s);i?e.removeEventListener(i[0],n,i[1]):s==="ref"?at.get(e)?.():e.removeAttribute(Mt(e,s))}}},lr=(e,t)=>{t[k][0]=0,oe.push([e,t]);let o=t.tag[X]||t.tag,s=o.defaultProps?{...o.defaultProps,...t.props}:t.props;try{return[o.call(null,s)]}finally{oe.pop()}},qt=(e,t,o,s,n)=>{e.vR?.length&&(s.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[k][1][We]?.forEach(i=>n.push(i)),e.vC.forEach(i=>{if(G(i))o.push(i);else if(typeof i.tag=="function"||i.tag===""){i.c=t;let p=o.length;if(qt(i,t,o,s,n),i.s){for(let l=p;l<o.length;l++)o[l].s=!0;i.s=!1}}else o.push(i),i.vR?.length&&(s.push(...i.vR),delete i.vR)})},cr=e=>{for(;e&&(e.tag===Ce||!e.e);)e=e.tag===Ce||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},zt=e=>{G(e)||(e[k]?.[1][We]?.forEach(t=>t[2]?.()),at.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(zt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(Te.delete(e),ze.delete(e),delete e[k][3],e.a=!0)},it=(e,t,o)=>{e.c=t,Vt(e,t,o)},It=(e,t)=>{if(t){for(let o=0,s=e.length;o<s;o++)if(e[o]===t)return o}},Nt=Symbol(),Vt=(e,t,o)=>{let s=[],n=[],i=[];qt(e,t,s,n,i),n.forEach(zt);let p=o?void 0:t.childNodes,l,d=null;if(o)l=-1;else if(!p.length)l=0;else{let f=It(p,cr(e.nN));f!==void 0?(d=p[f],l=f):l=It(p,s.find(m=>m.tag!==Ce&&m.e)?.e)??-1,l===-1&&(o=!0)}for(let f=0,m=s.length;f<m;f++,l++){let c=s[f],x;if(c.s&&c.e)x=c.e,c.s=!1;else{let b=o||!c.e;G(c)?(c.e&&c.d&&(c.e.textContent=c.t),c.d=!1,x=c.e||=document.createTextNode(c.t)):(x=c.e||=c.n?document.createElementNS(c.n,c.tag):document.createElement(c.tag),ir(x,c.props,c.pP),Vt(c,x,b),c.tag==="select"&&ar(x,c.props))}c.tag===Ce?l--:o?x.parentNode||t.appendChild(x):p[l]!==x&&p[l-1]!==x&&(p[l+1]===x?t.appendChild(p[l]):t.insertBefore(x,d||p[l]||null))}if(e.pP&&(e.pP=void 0),i.length){let f=[],m=[];i.forEach(([,c,,x,b])=>{c&&f.push(c),x&&m.push(x),b?.()}),f.forEach(c=>c()),m.length&&requestAnimationFrame(()=>{m.forEach(c=>c())})}},pr=(e,t)=>!!(e&&e.length===t.length&&e.every((o,s)=>o[1]===t[s][1])),ze=new WeakMap,Ve=(e,t,o)=>{let s=!o&&t.pC;o&&(t.pC||=t.vC);let n;try{o||=typeof t.tag=="function"?lr(e,t):te(t.props.children),o[0]?.tag===""&&o[0][le]&&(n=o[0][le],e[5].push([e,n,t]));let i=s?[...t.pC]:t.vC?[...t.vC]:void 0,p=[],l;for(let d=0;d<o.length;d++){if(Array.isArray(o[d])){o.splice(d,1,...o[d].flat(1/0)),d--;continue}let f=Wt(o[d]);if(f){typeof f.tag=="function"&&!f.tag[Ne]&&(W.length>0&&(f[k][2]=W.map(c=>[c,c.values.at(-1)])),e[5]?.length&&(f[k][3]=e[5].at(-1)));let m;if(i&&i.length){let c=i.findIndex(G(f)?x=>G(x):f.key!==void 0?x=>x.key===f.key&&x.tag===f.tag:x=>x.tag===f.tag);c!==-1&&(m=i[c],i.splice(c,1))}if(m)if(G(f))m.t!==f.t&&(m.t=f.t,m.d=!0),f=m;else{let c=m.pP=m.props;if(m.props=f.props,m.f||=f.f||t.f,typeof f.tag=="function"){let x=m[k][2];m[k][2]=f[k][2]||[],m[k][3]=f[k][3],!m.f&&((m.o||m)===f.o||m.tag[Be]?.(c,m.props))&&pr(x,m[k][2])&&(m.s=!0)}f=m}else if(!G(f)&&ue){let c=F(ue);c&&(f.n=c)}if(!G(f)&&!f.s&&(Ve(e,f),delete f.f),p.push(f),l&&!l.s&&!f.s)for(let c=l;c&&!G(c);c=c.vC?.at(-1))c.nN=f;l=f}}t.vR=s?[...t.vC,...i||[]]:i||[],t.vC=p,s&&delete t.pC}catch(i){if(t.f=!0,i===Nt){if(n)return;throw i}let[p,l,d]=t[k]?.[3]||[];if(l){let f=()=>Re([0,!1,e[2]],d),m=ze.get(d)||[];m.push(f),ze.set(d,m);let c=l(i,()=>{let x=ze.get(d);if(x){let b=x.indexOf(f);if(b!==-1)return x.splice(b,1),f()}});if(c){if(e[0]===1)e[1]=!0;else if(Ve(e,d,[c]),(l.length===1||e!==p)&&d.c){it(d,d.c,!1);return}throw Nt}}throw i}finally{n&&e[5].pop()}},Wt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[k]=[0,[]];else{let t=nr[e.tag];t&&(ue||=ye(""),e.props.children=[{tag:ue,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Kt=(e,t,o)=>{e.c===t&&(e.c=o,e.vC.forEach(s=>Kt(s,t,o)))},Bt=(e,t)=>{t[k][2]?.forEach(([o,s])=>{o.values.push(s)});try{Ve(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[k][2]?.forEach(([o])=>{o.values.pop()}),(e[0]!==1||!e[1])&&it(t,t.c,!1)},Te=new WeakMap,Ft=[],Re=async(e,t)=>{e[5]||=[];let o=Te.get(t);o&&o[0](void 0);let s,n=new Promise(i=>s=i);if(Te.set(t,[s,()=>{e[2]?e[2](e,t,i=>{Bt(i,t)}).then(()=>s(t)):(Bt(e,t),s(t))}]),Ft.length)Ft.at(-1).add(t);else{await Promise.resolve();let i=Te.get(t);i&&(Te.delete(t),i[1]())}return n},dr=(e,t)=>{let o=[];o[5]=[],o[4]=!0,Ve(o,e,void 0),o[4]=!1;let s=document.createDocumentFragment();it(e,s,!0),Kt(e,s,t),t.replaceChildren(s)},lt=(e,t)=>{dr(Wt({tag:"",props:{children:e}}),t)};var ct=(e,t,o)=>({tag:Ce,props:{children:e},key:o,e:t,p:1});var ur=0,We=1,fr=2,mr=3;var pt=new WeakMap,dt=(e,t)=>!e||!t||e.length!==t.length||t.some((o,s)=>o!==e[s]);var xr;var Gt=[];var U=e=>{let t=()=>typeof e=="function"?e():e,o=oe.at(-1);if(!o)return[t(),()=>{}];let[,s]=o,n=s[k][1][ur]||=[],i=s[k][0]++;return n[i]||=[t(),p=>{let l=xr,d=n[i];if(typeof p=="function"&&(p=p(d[0])),!Object.is(p,d[0]))if(d[0]=p,Gt.length){let[f,m]=Gt.at(-1);Promise.all([f===3?s:Re([f,!1,l],s),m]).then(([c])=>{if(!c||!(f===2||f===3))return;let x=c.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===c.vC&&Re([f===3?1:0,!1,l],c)})})})}else Re([0,!1,l],s)}]},ut=(e,t,o)=>{let s=re(p=>{i(l=>e(l,p))},[e]),[n,i]=U(()=>o?o(t):t);return[n,s]},hr=(e,t,o)=>{let s=oe.at(-1);if(!s)return;let[,n]=s,i=n[k][1][We]||=[],p=n[k][0]++,[l,,d]=i[p]||=[];if(dt(l,o)){d&&d();let f=()=>{m[e]=void 0,m[2]=t()},m=[o,void 0,void 0,void 0,void 0];m[e]=f,i[p]=m}},_e=(e,t)=>hr(3,e,t);var re=(e,t)=>{let o=oe.at(-1);if(!o)return e;let[,s]=o,n=s[k][1][fr]||=[],i=s[k][0]++,p=n[i];return dt(p?.[1],t)?n[i]=[e,t]:e=n[i][0],e};var ft=e=>{let t=pt.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(o=>pt.set(e,[o]),o=>pt.set(e,[void 0,o])),e},mt=(e,t)=>{let o=oe.at(-1);if(!o)return e();let[,s]=o,n=s[k][1][mr]||=[],i=s[k][0]++,p=n[i];return dt(p?.[1],t)&&(n[i]=[e(),t]),n[i][0]};var Jt=ye({pending:!1,data:null,method:null,action:null}),Yt=new Set,Xt=e=>{Yt.add(e),e.finally(()=>Yt.delete(e))};var xt=(e,t)=>mt(()=>o=>{let s;e&&(typeof e=="function"?s=e(o)||(()=>{e(null)}):e&&"current"in e&&(e.current=o,s=()=>{e.current=null}));let n=t(o);return()=>{n?.(),s?.()}},[e]),Zt=Object.create(null),Qt=Object.create(null),De=(e,t,o,s,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let i=document.head,{onLoad:p,onError:l,precedence:d,blocking:f,...m}=t,c=null,x=!1,b=pe[e],E=Ue(e,s),_=$=>$.getAttribute("rel")==="stylesheet"&&$.getAttribute(K)!==null,L;if(E){let $=i.querySelectorAll(e);e:for(let A of $)if(!(e==="link"&&!_(A))){for(let v of b)if(A.getAttribute(v)===t[v]){c=A;break e}}if(!c){let A=b.reduce((v,w)=>t[w]===void 0?v:`${v}-${w}-${t[w]}`,e);x=!Qt[A],c=Qt[A]||=(()=>{let v=document.createElement(e);for(let w of b)t[w]!==void 0&&v.setAttribute(w,t[w]);return t.rel&&v.setAttribute("rel",t.rel),v})()}}else L=i.querySelectorAll(e);d=s?d??"":void 0,s&&(m[K]=d);let Q=re($=>{if(E){if(e==="link"&&d!==void 0){let v=!1;for(let w of i.querySelectorAll(e)){let I=w.getAttribute(K);if(I===null){i.insertBefore($,w);return}if(v&&I!==d){i.insertBefore($,w);return}I===d&&(v=!0)}i.appendChild($);return}let A=!1;for(let v of i.querySelectorAll(e)){if(A&&v.getAttribute(K)!==d){i.insertBefore($,v);return}v.getAttribute(K)===d&&(A=!0)}i.appendChild($)}else if(e==="link")i.contains($)||i.appendChild($);else if(L){let A=!1;for(let v of L)if(v===$){A=!0;break}A||i.insertBefore($,i.contains(L[0])?L[0]:i.querySelector(e)),L=void 0}},[E,d,e]),ie=xt(t.ref,$=>{let A=b[0];if(o===2&&($.innerHTML=""),(x||L)&&Q($),!l&&!p||!A)return;let v=Zt[$.getAttribute(A)]||=new Promise((w,I)=>{$.addEventListener("load",w),$.addEventListener("error",I)});p&&(v=v.then(p)),l&&(v=v.catch(l)),v.catch(()=>{})});if(n&&f==="render"){let $=pe[e][0];if($&&t[$]){let A=t[$],v=Zt[A]||=new Promise((w,I)=>{Q(c),c.addEventListener("load",w),c.addEventListener("error",I)});ft(v)}}let O={tag:e,type:e,props:{...m,ref:ie},ref:ie};return O.p=o,c&&(O.e=c),ct(O,i)},gr=e=>{let t=Ut();return(t&&F(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:De("title",e,void 0,!1,!1)},yr=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:De("script",e,1,!1,!0),br=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,De("style",e,2,!0,!0)),Sr=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:De("link",e,1,Fe(e),!0),Er=e=>De("meta",e,void 0,!1,!1),eo=Symbol(),vr=e=>{let{action:t,...o}=e;typeof t!="function"&&(o.action=t);let[s,n]=U([null,!1]),i=re(async f=>{let m=f.isTrusted?t:f.detail[eo];if(typeof m!="function")return;f.preventDefault();let c=new FormData(f.target);n([c,!0]);let x=m(c);x instanceof Promise&&(Xt(x),await x),n([null,!0])},[]),p=xt(e.ref,f=>(f.addEventListener("submit",i),()=>{f.removeEventListener("submit",i)})),[l,d]=s;return s[1]=!1,{tag:Jt,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...o,ref:p},type:"form",ref:p}},f:d}},to=(e,{formAction:t,...o})=>{if(typeof t=="function"){let s=re(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[eo]:t}}))},[]);o.ref=xt(o.ref,n=>(n.addEventListener("click",s),()=>{n.removeEventListener("click",s)}))}return{tag:e,props:o,type:e,ref:o.ref}},$r=e=>to("input",e),kr=e=>to("button",e);Object.assign(Se,{title:gr,script:yr,style:br,link:Sr,meta:Er,form:vr,input:$r,button:kr});var se=":-hono-global",wr=new RegExp(`^${se}{(.*)}$`),Ke="hono-css",Y=Symbol(),C=Symbol(),M=Symbol(),H=Symbol(),Ge=Symbol(),so=Symbol(),Pi=Symbol();var no=e=>{let t=0,o=11;for(;t<e.length;)o=101*o+e.charCodeAt(t++)>>>0;return"css-"+o},ao=e=>e.trim().replace(/\s+/g,"-"),io=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),Tr=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),Cr=e=>io(e)&&!Tr.has(e.toLowerCase()),lo=e=>{console.warn(`Invalid slug: ${e}`)},Rr=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),_r=new RegExp(["("+Rr+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),Dr=e=>e.replace(_r,(t,o,s,n,i)=>o||s||n||i||""),co=(e,t)=>{let o=[],s=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",i="";for(let p=0,l=e.length;p<l;p++){i+=e[p];let d=t[p];if(!(typeof d=="boolean"||d===null||d===void 0)){Array.isArray(d)||(d=[d]);for(let f=0,m=d.length;f<m;f++){let c=d[f];if(!(typeof c=="boolean"||c===null||c===void 0))if(typeof c=="string")/([\\"'\/])/.test(c)?i+=c.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):i+=c;else if(typeof c=="number")i+=c;else if(c[so])i+=c[so];else if(c[C].startsWith("@keyframes "))o.push(c),i+=` ${c[C].substring(11)} `;else{if(e[p+1]?.match(/^\s*{/))o.push(c),c=`.${c[C]}`;else{o.push(...c[H]),s.push(...c[Ge]),c=c[M];let x=c.length;if(x>0){let b=c[x-1];b!==";"&&b!=="}"&&(c+=";")}}i+=`${c||""}`}}}}return[n,Dr(i),o,s]},fe=(e,t,o,s)=>{let[n,i,p,l]=co(e,t),d=wr.exec(i);d&&(i=d[1]);let f=no(n+i),m;if(o){let b=o(f,ao(n),i);b&&(io(b)?m=b:(s||lo)(b))}let c=(d?se:"")+(m||f),x=(d?p.map(b=>b[C]):[c,...l]).join(" ");return{[Y]:c,[C]:x,[M]:i,[H]:p,[Ge]:l}},Ye=e=>{for(let t=0,o=e.length;t<o;t++){let s=e[t];typeof s=="string"&&(e[t]={[Y]:"",[C]:"",[M]:"",[H]:[],[Ge]:[s]})}return e},Je=(e,t,o,s)=>{let[n,i]=co(e,t),p=no(n+i),l;if(o){let d=o(p,ao(n),i);d&&(Cr(d)?l=d:(s||lo)(d))}return{[Y]:"",[C]:`@keyframes ${l||p}`,[M]:i,[H]:[],[Ge]:[]}},Lr=0,Xe=(e,t,o,s)=>{e||(e=[`/* h-v-t ${Lr++} */`]);let n=Array.isArray(e)?fe(e,t,o,s):e,i=n[C],p=fe(["view-transition-name:",""],[i],o,s);return n[C]=se+n[C],n[M]=n[M].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,i),p[C]=p[Y]=i,p[H]=[...n[H],n],p};var jr=e=>{let t=[],o=0,s=0;for(let n=0,i=e.length;n<i;n++){let p=e[n];if(p==="'"||p==='"'){let l=p;for(n++;n<i;n++){if(e[n]==="\\"){n++;continue}if(e[n]===l)break}continue}if(p==="{"){s++;continue}if(p==="}"){s--,s===0&&(t.push(e.slice(o,n+1)),o=n+1);continue}}return t},ht=({id:e})=>{let t,o=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),s=(p,l)=>{let[d,f]=o();if(!d||!f){Promise.resolve().then(()=>{if(!o()[0])throw new Error("style sheet not found");s(p,l)});return}f.has(p)||(f.add(p),(p.startsWith(se)?jr(l):[`${p[0]==="@"?"":"."}${p}{${l}}`]).forEach(m=>{d.insertRule(m,d.cssRules.length)}))};return[{toString(){let p=this[Y];return s(p,this[M]),this[H].forEach(({[C]:l,[M]:d})=>{s(l,d)}),this[C]}},({children:p,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:p&&(Array.isArray(p)?p:[p]).map(d=>d[M])}})]},Pr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[s,n]=ht({id:e}),i=m=>(m.toString=s.toString,m),p=(m,...c)=>i(fe(m,c,t,o));return{css:p,cx:(...m)=>(m=Ye(m),p(Array(m.length).fill(""),...m)),keyframes:(m,...c)=>Je(m,c,t,o),viewTransition:(m,...c)=>i(Xe(m,c,t,o)),Style:n}},Le=Pr({id:Ke}),Ni=Le.css,Bi=Le.cx,Fi=Le.keyframes,Ui=Le.viewTransition,Hi=Le.Style;var Mr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[s,n]=ht({id:e}),i=new WeakMap,p=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),d=E=>{let _=({buffer:O,context:$})=>{let[A,v]=i.get($),w=Object.keys(A);if(!w.length)return;let I="";if(w.forEach(ee=>{v[ee]=!0,I+=ee.startsWith(se)?A[ee]:`${ee[0]==="@"?"":"."}${ee}{${A[ee]}}`}),i.set($,[{},v]),O&&l.test(O[0])){O[0]=O[0].replace(l,(ee,Fo,Uo)=>`${Fo}${I}${Uo}`);return}let Tt=p.get($),Ct=`<script${Tt?` nonce="${Tt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(I)}<\/script>`;if(O){O[0]=`${Ct}${O[0]}`;return}return Promise.resolve(Ct)},L=({context:O})=>{i.has(O)||i.set(O,[{},{}]);let[$,A]=i.get(O),v=!0;if(A[E[Y]]||(v=!1,$[E[Y]]=E[M]),E[H].forEach(({[C]:w,[M]:I})=>{A[w]||(v=!1,$[w]=I)}),!v)return Promise.resolve(D("",[_]))},Q=new String(E[C]);Object.assign(Q,E),Q.isEscaped=!0,Q.callbacks=[L];let ie=Promise.resolve(Q);return Object.assign(ie,E),ie.toString=s.toString,ie},f=(E,..._)=>d(fe(E,_,t,o)),m=(...E)=>(E=Ye(E),f(Array(E.length).fill(""),...E)),c=(E,..._)=>Je(E,_,t,o),x=(E,..._)=>d(Xe(E,_,t,o)),b=({children:E,nonce:_}={})=>D(`<style id="${e}"${_?` nonce="${_}"`:""}>${E?E[M]:""}</style>`,[({context:L})=>{p.set(L,_)}]);return b[X]=n,{css:f,cx:m,keyframes:c,viewTransition:x,Style:b}},Oe=Mr({id:Ke}),u=Oe.css,Yi=Oe.cx,N=Oe.keyframes,Ji=Oe.viewTransition,Xi=Oe.Style;var a={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},y=(e,t)=>{let o=parseInt(e.slice(1,3),16),s=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${o}, ${s}, ${n}, ${t})`},g={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},h={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},Z={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},tl={button:u`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:u`box-shadow: -8px 0 40px ${y(a.textPrimary,.3)};`,fab:u`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:u`box-shadow: 0 24px 80px ${a.inputLine};`,modal:u`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},S={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var gt={type:null,targetId:null,targetLabel:null},j=(e,t,o)=>({...e,[t]:o}),po=(e,t)=>{switch(t.type){case"SWITCH_TAB":return{...e,activeTab:t.tab,error:null};case"LOAD_DASHBOARD_START":return{...e,tabStates:j(e.tabStates,"dashboard","loading")};case"LOAD_DASHBOARD_SUCCESS":return{...e,tabStates:j(e.tabStates,"dashboard","loaded"),stats:t.stats,requests:t.pendingRequests,auditEntries:t.recentAudit};case"LOAD_DASHBOARD_FAILURE":return{...e,tabStates:j(e.tabStates,"dashboard","error"),error:{title:t.title,message:t.message}};case"LOAD_PEOPLE_START":return{...e,tabStates:j(e.tabStates,"pessoas","loading")};case"LOAD_PEOPLE_SUCCESS":return{...e,tabStates:j(e.tabStates,"pessoas","loaded"),people:t.people};case"LOAD_PEOPLE_FAILURE":return{...e,tabStates:j(e.tabStates,"pessoas","error")};case"SET_PEOPLE_SEARCH":return{...e,peopleSearch:t.query};case"LOAD_LOOKUPS_START":return{...e,tabStates:j(e.tabStates,"lookups","loading")};case"LOAD_LOOKUPS_SUCCESS":return{...e,tabStates:j(e.tabStates,"lookups","loaded"),lookupTables:t.tables};case"LOAD_LOOKUPS_FAILURE":return{...e,tabStates:j(e.tabStates,"lookups","error")};case"SELECT_LOOKUP_TABLE":return{...e,selectedTable:t.tableName,lookupEntries:[]};case"LOAD_ENTRIES_SUCCESS":return{...e,lookupEntries:t.entries};case"TOGGLE_ENTRY_SUCCESS":{let o=e.lookupEntries.map(s=>s.id===t.entryId?{...s,active:t.active}:s);return{...e,lookupEntries:o}}case"LOAD_REQUESTS_START":return{...e,tabStates:j(e.tabStates,"solicitacoes","loading")};case"LOAD_REQUESTS_SUCCESS":return{...e,tabStates:j(e.tabStates,"solicitacoes","loaded"),requests:t.requests};case"LOAD_REQUESTS_FAILURE":return{...e,tabStates:j(e.tabStates,"solicitacoes","error")};case"LOAD_AUDIT_START":return{...e,tabStates:j(e.tabStates,"auditoria","loading")};case"LOAD_AUDIT_SUCCESS":return{...e,tabStates:j(e.tabStates,"auditoria","loaded"),auditEntries:t.entries,auditTotal:t.total,auditOffset:t.entries.length};case"LOAD_MORE_AUDIT_SUCCESS":return{...e,auditEntries:[...e.auditEntries,...t.entries],auditTotal:t.total,auditOffset:e.auditOffset+t.entries.length};case"LOAD_AUDIT_FAILURE":return{...e,tabStates:j(e.tabStates,"auditoria","error")};case"OPEN_MODAL":return{...e,modal:{type:t.modalType,targetId:t.targetId,targetLabel:t.targetLabel}};case"CLOSE_MODAL":return{...e,modal:gt};case"APPROVE_SUCCESS":{let o=e.requests.map(s=>s.id===t.requestId?{...s,status:"aprovado"}:s);return{...e,requests:o,modal:gt}}case"REJECT_SUCCESS":{let o=e.requests.map(s=>s.id===t.requestId?{...s,status:"rejeitado"}:s);return{...e,requests:o,modal:gt}}case"SHOW_TOAST":return{...e,toast:t.toast};case"HIDE_TOAST":return{...e,toast:null}}};var uo={activeTab:"dashboard",tabStates:{dashboard:"idle",pessoas:"idle",lookups:"idle",solicitacoes:"idle",auditoria:"idle"},stats:null,people:[],peopleSearch:"",lookupTables:[],selectedTable:null,lookupEntries:[],requests:[],auditEntries:[],auditTotal:0,auditOffset:0,modal:{type:null,targetId:null,targetLabel:null},toast:null,error:null};var Ir=u`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${a.backgroundDark};
  padding: 16px 20px;
  @media (min-width: 600px) {
    padding: 20px 48px;
  }
`,Nr=u`
  display: flex;
  align-items: center;
  gap: 12px;
`,Br=u`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${a.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.satoshi};
  font-weight: ${h.bold};
  font-size: 16px;
  color: ${a.backgroundDark};
`,Fr=u`
  font-family: ${g.satoshi};
  font-weight: ${h.bold};
  font-size: 18px;
  color: ${a.textOnDark};
`,Ur=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 18px;
  color: ${y("#F2E2C4",.6)};
  margin-left: 6px;
`,Hr=u`
  display: flex;
  align-items: center;
  gap: 10px;
`,qr=u`
  display: none;
  text-align: right;
  @media (min-width: 600px) {
    display: block;
  }
`,zr=u`
  font-family: ${g.satoshi};
  font-weight: ${h.medium};
  font-size: 14px;
  color: ${a.textOnDark};
`,Vr=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 12px;
  color: ${y("#F2E2C4",.5)};
`,Wr=u`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${y("#F2E2C4",.15)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 14px;
  color: ${a.textOnDark};
`,fo=({user:e})=>r("header",{class:Ir,children:[r("div",{class:Nr,children:[r("div",{class:Br,"aria-hidden":"true",children:"A"}),r("span",{children:[r("span",{class:Fr,children:"ACDG"}),r("span",{class:Ur,children:"Administracao"})]})]}),r("div",{class:Hr,children:[r("div",{class:qr,children:[r("div",{class:zr,children:e.name}),r("div",{class:Vr,children:e.role})]}),r("div",{class:Wr,"aria-hidden":"true",children:e.initials})]})]});var Kr=u`
  background: ${a.surface};
  padding: 0 20px;
  border-bottom: 1px solid ${a.inputLine};
  display: flex;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  @media (min-width: 600px) {
    padding: 0 48px;
    overflow-x: visible;
  }
`,Gr=e=>u`
    padding: 14px 24px;
    border: none;
    border-bottom: 2px solid ${e?a.backgroundDark:"transparent"};
    background: ${e?y(a.backgroundDark,.06):"none"};
    font-family: ${g.satoshi};
    font-weight: ${h.semibold};
    font-size: 12px;
    letter-spacing: 0.3px;
    color: ${e?a.textPrimary:a.textMuted};
    cursor: pointer;
    transition: all 200ms ease;
    white-space: nowrap;
    &:hover {
      color: ${a.textPrimary};
    }
    &:focus-visible {
      outline: 2px solid ${a.primary};
      outline-offset: 2px;
    }
    @media (min-width: 600px) {
      font-size: 13px;
    }
  `,Yr=u`
  background: ${a.danger};
  color: white;
  font-family: ${g.satoshi};
  font-weight: ${h.bold};
  font-size: 10px;
  padding: 2px 6px;
  border-radius: ${S.pill};
  margin-left: 6px;
`,Jr=({label:e,isActive:t,badge:o,onClick:s,ariaLabel:n})=>r("button",{class:Gr(t),role:"tab","aria-selected":t,"aria-label":n,type:"button",onClick:s,children:[e,o!==void 0&&o>0&&r("span",{class:Yr,"aria-hidden":"true",children:o})]}),Xr=[{tab:"dashboard",label:"Dashboard"},{tab:"pessoas",label:"Pessoas"},{tab:"lookups",label:"Lookup Tables"},{tab:"solicitacoes",label:"Solicitacoes"},{tab:"auditoria",label:"Auditoria"}],mo=({activeTab:e,pendingCount:t,onTabChange:o})=>r("nav",{role:"tablist","aria-label":"Secoes do admin",class:Kr,children:Xr.map(({tab:s,label:n})=>r(Jr,{tab:s,label:n,isActive:e===s,badge:s==="solicitacoes"?t:void 0,ariaLabel:s==="solicitacoes"&&t>0?`Solicitacoes, ${t} pendentes`:void 0,onClick:()=>o(s)},s))});var Zr=e=>u`
    background: ${a.surface};
    border-radius: ${S.card};
    padding: 20px;
    border: ${e?`2px solid ${a.warning}`:"1px solid transparent"};
    transition: all 200ms ease;
    &:hover {
      border-color: ${a.inputLine};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
  `,Qr=e=>u`
    font-family: ${g.satoshi};
    font-weight: ${h.bold};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: ${e?a.warning:a.textMuted};
    margin: 0;
  `,es=u`
  font-family: ${g.playfair};
  font-style: italic;
  font-weight: ${h.regular};
  font-size: 36px;
  color: ${a.textPrimary};
  line-height: 1;
  margin: 8px 0 0;
`,ts=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 12px;
  color: ${a.textMuted};
  margin-top: 6px;
`,je=({label:e,value:t,detail:o,highlight:s=!1})=>r("div",{class:Zr(s),children:[r("p",{class:Qr(s),children:e}),r("p",{class:es,children:t}),o&&r("p",{class:ts,children:o})]});var os=u`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${Z[4]};
`,rs=u`
  font-family: ${g.satoshi};
  font-weight: ${h.bold};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${a.textMuted};
`,ss=u`
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  color: white;
  background: ${a.primary};
  border: none;
  border-radius: ${S.pill};
  padding: 8px 18px;
  cursor: pointer;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,ns=u`
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 12px;
  color: ${a.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  &:hover {
    color: ${a.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,R=({title:e,actionLabel:t,onAction:o,linkLabel:s,onLink:n})=>r("div",{class:os,children:[r("h3",{class:rs,children:e}),r("div",{children:[t&&o&&r("button",{class:ss,type:"button",onClick:o,children:t}),s&&n&&r("button",{class:ns,type:"button",onClick:n,children:s})]})]});var as=u`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${a.surface};
  border-radius: ${S.dropdown};
  border: 1px solid transparent;
  transition: all 200ms ease;
  &:hover {
    border-color: ${a.inputLine};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
`,is=u`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${y(a.warning,.12)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`,ls=u`
  flex: 1;
  min-width: 0;
`,cs=u`
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 14px;
  color: ${a.textPrimary};
  margin: 0;
`,ps=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 12px;
  color: ${a.textMuted};
  margin: 2px 0 0;
`,ds=u`
  display: flex;
  gap: 10px;
  flex-shrink: 0;
`,us=u`
  padding: 8px 18px;
  border-radius: ${S.pill};
  background: ${y(a.primary,.12)};
  color: ${a.primary};
  border: none;
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    background: ${a.primary};
    color: white;
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,fs=u`
  padding: 8px 18px;
  border-radius: ${S.pill};
  background: ${y(a.danger,.08)};
  color: ${a.danger};
  border: none;
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    background: ${a.danger};
    color: white;
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,xo=({title:e,meta:t,onApprove:o,onReject:s})=>r("div",{class:as,role:"group",children:[r("div",{class:is,"aria-hidden":"true",children:"!"}),r("div",{class:ls,children:[r("p",{class:cs,children:e}),r("p",{class:ps,children:t})]}),r("div",{class:ds,children:[r("button",{class:us,type:"button",onClick:o,children:"Aprovar"}),r("button",{class:fs,type:"button",onClick:s,children:"Rejeitar"})]})]});var ms=u`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${y(a.textPrimary,.06)};
  flex-wrap: wrap;
  &:last-child {
    border-bottom: none;
  }
  @media (min-width: 600px) {
    flex-wrap: nowrap;
  }
`,xs=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 12px;
  color: ${a.textMuted};
  white-space: nowrap;
  min-width: 120px;
`,hs=e=>e.includes("CREATED")?{bg:y(a.primary,.1),fg:a.primary}:e.includes("ASSIGNED")||e.includes("APPROVED")?{bg:y(a.backgroundDark,.1),fg:a.backgroundDark}:e.includes("TOGGLED")||e.includes("REJECTED")?{bg:y(a.warning,.1),fg:a.warning}:{bg:y(a.textPrimary,.06),fg:a.textMuted},gs=e=>{let t=hs(e);return u`
    font-family: ${g.satoshi};
    font-weight: ${h.semibold};
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 4px;
    min-width: 100px;
    text-align: center;
    background: ${t.bg};
    color: ${t.fg};
    white-space: nowrap;
  `},ys=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 13px;
  color: ${a.textPrimary};
  flex: 1;
`,bs=u`
  font-family: ${g.satoshi};
  font-weight: ${h.medium};
  font-size: 12px;
  color: ${a.textMuted};
  min-width: 100px;
  text-align: right;
`,Ze=({timestamp:e,action:t,description:o,actorName:s})=>r("div",{class:ms,children:[r("span",{class:xs,children:e}),r("span",{class:gs(t),children:t}),r("span",{class:ys,children:o}),r("span",{class:bs,children:s})]});var Ss=N`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`,et=u`
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    ${y(a.textPrimary,.06)} 0%,
    ${y(a.textPrimary,.12)} 50%,
    ${y(a.textPrimary,.06)} 100%
  );
  background-size: 400px 100%;
  animation: ${Ss} 1.5s linear infinite;
`,Es=u`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`,Qe=u`
  ${et};
  height: 100px;
  border-radius: 12px;
`,ne=u`
  ${et};
  height: 48px;
  margin-bottom: 8px;
  border-radius: 8px;
`,vs=u`
  ${et};
  height: 40px;
  max-width: 400px;
  margin-bottom: 24px;
`,$s=u`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`,me=u`
  ${et};
  height: 72px;
  border-radius: 12px;
`,ks=()=>r(T,{children:[r("div",{class:Es,children:[r("div",{class:Qe}),r("div",{class:Qe}),r("div",{class:Qe}),r("div",{class:Qe})]}),r("div",{class:ne}),r("div",{class:ne}),r("div",{class:ne})]}),As=()=>r(T,{children:[r("div",{class:vs}),r("div",{class:ne}),r("div",{class:ne}),r("div",{class:ne}),r("div",{class:ne})]}),ws=()=>r("div",{class:$s,children:[r("div",{class:me}),r("div",{class:me}),r("div",{class:me}),r("div",{class:me}),r("div",{class:me}),r("div",{class:me})]}),q=({variant:e})=>r("div",{role:"status","aria-label":"Carregando dados...",children:[e==="dashboard"&&r(ks,{}),e==="table"&&r(As,{}),e==="grid"&&r(ws,{})]});var Ts=N`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,Cs=u`
  padding: 24px;
  background: ${y(a.danger,.05)};
  border: 1px solid ${y(a.danger,.15)};
  border-radius: ${S.card};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${Ts} 400ms ease-out;
`,Rs=u`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: ${a.danger};
`,_s=u`
  flex: 1;
`,Ds=u`
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 14px;
  color: ${a.danger};
  margin: 0 0 4px;
`,Ls=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 13px;
  color: ${a.textMuted};
  margin: 0;
`,Os=u`
  margin-left: auto;
  padding: 8px 16px;
  border: 1px solid ${a.danger};
  border-radius: ${S.pill};
  background: none;
  color: ${a.danger};
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
  align-self: center;
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
  &:hover {
    background: ${y(a.danger,.08)};
  }
`,z=({title:e,message:t,onRetry:o})=>r("div",{class:Cs,role:"alert",children:[r("svg",{class:Rs,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","aria-hidden":"true",children:[r("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),r("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),r("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),r("div",{class:_s,children:[r("h4",{class:Ds,children:e}),r("p",{class:Ls,children:t})]}),r("button",{class:Os,type:"button",onClick:o,children:"Tentar novamente"})]});var js=u`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${Z[7]} ${Z[4]};
  gap: ${Z[3]};
`,Ps=u`
  font-size: 40px;
  opacity: 0.4;
  color: ${a.textMuted};
`,Ms=u`
  font-family: ${g.playfair};
  font-style: italic;
  font-weight: ${h.light};
  font-size: 18px;
  color: ${a.textMuted};
  text-align: center;
`,B=({message:e,icon:t})=>r("div",{class:js,children:[t&&r("span",{class:Ps,children:t}),r("p",{class:Ms,children:e})]});var go=N`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,Is=u`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  animation: ${go} 500ms ease;
  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`,ho=u`
  margin-bottom: ${Z[5]};
  animation: ${go} 600ms ease;
  animation-delay: 100ms;
  animation-fill-mode: both;
`,Ns=u`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,yo=({stats:e,requests:t,auditEntries:o,loadState:s,error:n,onApprove:i,onReject:p,onSeeAllRequests:l,onSeeAllAudit:d,onRetry:f})=>{if(s==="loading")return r(q,{variant:"dashboard"});if(s==="error"&&n)return r(z,{title:n.title,message:n.message,onRetry:f});if(!e)return r(B,{message:"Nenhuma atividade ainda",icon:"---"});let m=t.filter(c=>c.status==="pendente");return r(T,{children:[r("div",{class:Is,children:[r(je,{label:"Pessoas",value:e.people.total}),r(je,{label:"Roles Ativos",value:e.roles.active}),r(je,{label:"Solicitacoes Pendentes",value:e.pendingRequests,highlight:!0}),r(je,{label:"Acoes no Audit",value:e.audit.total,detail:"Ultimos 30 dias"})]}),r("div",{class:ho,children:[r(R,{title:"Solicitacoes pendentes",linkLabel:"Ver todas",onLink:l}),m.length>0?r("div",{class:Ns,children:m.map(c=>r(xo,{title:c.label,meta:`${c.tableName} - ${c.requestedBy}`,onApprove:()=>i(c.id,c.label),onReject:()=>p(c.id,c.label)},c.id))}):r(B,{message:"Nenhuma solicitacao pendente",icon:"---"})]}),r("div",{class:ho,children:[r(R,{title:"Atividade recente",linkLabel:"Ver audit completo",onLink:d}),o.length>0?o.slice(0,5).map(c=>r(Ze,{timestamp:c.timestamp,action:c.action,description:c.details??"-",actorName:c.actorName},c.id)):r(B,{message:"Nenhuma atividade registrada",icon:"---"})]})]})};var Bs=u`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${a.surface};
  border-radius: ${S.pill};
  border: 1px solid ${a.inputLine};
  max-width: 400px;
  margin-bottom: 24px;
  transition: border-color 200ms ease;
  &:focus-within {
    border-color: ${a.backgroundDark};
  }
`,Fs=u`
  width: 16px;
  height: 16px;
  color: ${a.textMuted};
  flex-shrink: 0;
`,Us=u`
  border: none;
  background: none;
  font-family: ${g.playfair};
  font-style: italic;
  font-weight: ${h.light};
  font-size: 14px;
  color: ${a.textPrimary};
  flex: 1;
  outline: none;
  &::placeholder {
    color: ${a.textMuted};
  }
`,xe=({placeholder:e,value:t,onChange:o,ariaLabel:s,disabled:n=!1})=>r("div",{class:Bs,children:[r("svg",{class:Fs,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","aria-hidden":"true",children:[r("circle",{cx:"11",cy:"11",r:"8"}),r("path",{d:"m21 21-4.3-4.3"})]}),r("input",{class:Us,type:"text",placeholder:e,value:t,"aria-label":s,disabled:n,onInput:i=>o(i.target.value)})]});var Hs=u`
  display: block;
  overflow-x: auto;
  @media (min-width: 600px) {
    display: block;
  }
`,qs=u`
  width: 100%;
  border-collapse: collapse;
  background: ${a.surface};
  border-radius: ${S.card};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`,Pe=u`
  font-family: ${g.satoshi};
  font-weight: ${h.bold};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${a.textMuted};
  padding: 12px 16px;
  text-align: left;
  background: ${y(a.textPrimary,.03)};
  border-bottom: 1px solid ${a.inputLine};
`,Me=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid ${y(a.textPrimary,.06)};
  color: ${a.textPrimary};
`,zs=u`
  font-weight: ${h.semibold};
`,Vs=u`
  transition: background 150ms ease;
  &:hover {
    background: ${y(a.textPrimary,.02)};
  }
  &:last-child td {
    border-bottom: none;
  }
`,Ws=e=>u`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: ${S.pill};
    font-family: ${g.satoshi};
    font-weight: ${h.semibold};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${e?y(a.primary,.12):y(a.textPrimary,.06)};
    color: ${e?a.primary:a.textMuted};
  `,Ks=e=>u`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  `,Gs=u`
  display: inline-flex;
  padding: 3px 8px;
  border-radius: ${S.pill};
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 10px;
  background: ${y(a.backgroundDark,.1)};
  color: ${a.backgroundDark};
  margin-right: 4px;
`,Ys=(e,t)=>{if(!t.trim())return e;let o=t.toLowerCase().replace(/[.\-/]/g,"");return e.filter(s=>s.name.toLowerCase().includes(o)||s.cpf.replace(/[.\-/]/g,"").includes(o))},bo=({people:e,searchQuery:t})=>{let o=Ys(e,t);return o.length===0?null:r("div",{class:Hs,children:r("table",{class:qs,"aria-label":"Lista de pessoas",children:[r("thead",{children:r("tr",{children:[r("th",{class:Pe,children:"Nome"}),r("th",{class:Pe,children:"CPF"}),r("th",{class:Pe,children:"Nascimento"}),r("th",{class:Pe,children:"Roles"}),r("th",{class:Pe,children:"Status"})]})}),r("tbody",{children:o.map(s=>r("tr",{class:Vs,children:[r("td",{class:Me,children:r("span",{class:zs,children:s.name})}),r("td",{class:Me,children:s.cpf}),r("td",{class:Me,children:s.birthDate}),r("td",{class:Me,children:s.roles.map(n=>r("span",{class:Gs,children:n},n))}),r("td",{class:Me,children:r("span",{class:Ws(s.active),children:[r("span",{class:Ks(s.active)}),s.active?"Ativo":"Inativo"]})})]},s.id))})]})})};var So=u`
  display: flex;
  flex-direction: column;
`,Js=(e,t)=>{if(!t.trim())return e;let o=t.toLowerCase().replace(/[.\-/]/g,"");return e.filter(s=>s.name.toLowerCase().includes(o)||s.cpf.replace(/[.\-/]/g,"").includes(o))},Eo=({people:e,searchQuery:t,loadState:o,onSearch:s,onCreate:n,onRetry:i})=>{if(o==="loading")return r(q,{variant:"table"});if(o==="error")return r(z,{title:"Erro ao carregar pessoas",message:"O servico people-context nao respondeu. Tente novamente em alguns instantes.",onRetry:i});if(e.length===0)return r("div",{class:So,children:[r(R,{title:"Pessoas"}),r(B,{message:"Nenhuma pessoa cadastrada",icon:"---"})]});let p=Js(e,t);return r("div",{class:So,children:[r(R,{title:"Pessoas",actionLabel:"+ Nova Pessoa",onAction:n}),r(xe,{placeholder:"Buscar por nome ou CPF...",value:t,onChange:s,ariaLabel:"Buscar pessoas"}),p.length>0?r(bo,{people:p,searchQuery:""}):r(B,{message:`Nenhum resultado para "${t}"`,icon:"---"})]})};var Xs=e=>u`
    background: ${a.surface};
    border-radius: ${S.card};
    padding: 16px;
    border: 1px solid transparent;
    ${e?`border-left: 3px solid ${a.primary};`:""} cursor: pointer;
    transition: all 200ms ease;
    &:hover {
      border-color: ${a.inputLine};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    &:focus-visible {
      outline: 2px solid ${a.primary};
      outline-offset: 2px;
    }
  `,Zs=u`
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  color: ${a.textPrimary};
  margin: 0;
`,Qs=u`
  font-family: ${g.playfair};
  font-style: italic;
  font-weight: ${h.light};
  font-size: 13px;
  color: ${a.textMuted};
  margin: 4px 0 0;
`,vo=({tableName:e,entryCount:t,isSelected:o,onClick:s})=>{let n=i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),s())};return r("div",{class:Xs(o),role:"button",tabindex:0,"aria-label":`Ver ${e}, ${t} valores ativos`,onClick:s,onKeyDown:n,children:[r("p",{class:Zs,children:e}),r("p",{class:Qs,children:[t," valores"]})]})};var en=e=>u`
    width: 40px;
    height: 22px;
    border-radius: 11px;
    background: ${e?a.primary:a.inputLine};
    position: relative;
    cursor: pointer;
    transition: background 200ms ease;
    border: none;
    padding: 0;
    &:focus-visible {
      outline: 2px solid ${a.primary};
      outline-offset: 2px;
    }
  `,tn=e=>u`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 200ms ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transform: ${e?"translateX(18px)":"translateX(0)"};
    pointer-events: none;
  `,$o=({checked:e,label:t,onToggle:o})=>r("button",{class:en(e),role:"switch","aria-checked":e,"aria-label":e?`Desativar valor ${t}`:`Ativar valor ${t}`,type:"button",onClick:o,children:r("span",{class:tn(e)})});var on=N`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,rn=u`
  background: ${a.surfaceLight};
  border-radius: ${S.panel};
  padding: 24px;
  margin-top: 24px;
  animation: ${on} 400ms ease;
`,sn=u`
  width: 100%;
  border-collapse: collapse;
  background: ${a.surface};
  border-radius: ${S.card};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`,yt=u`
  font-family: ${g.satoshi};
  font-weight: ${h.bold};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${a.textMuted};
  padding: 12px 16px;
  text-align: left;
  background: ${y(a.textPrimary,.03)};
  border-bottom: 1px solid ${a.inputLine};
`,bt=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid ${y(a.textPrimary,.06)};
  color: ${a.textPrimary};
`,nn=u`
  transition: background 150ms ease;
  &:hover {
    background: ${y(a.textPrimary,.02)};
  }
  &:last-child td {
    border-bottom: none;
  }
`,an=e=>u`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: ${S.pill};
    font-family: ${g.satoshi};
    font-weight: ${h.semibold};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${e?y(a.primary,.12):y(a.textPrimary,.06)};
    color: ${e?a.primary:a.textMuted};
  `,ko=({tableName:e,entries:t,onToggle:o,onCreateEntry:s})=>r("div",{class:rn,children:[r(R,{title:`Detalhes: ${e}`,actionLabel:"+ Novo Valor",onAction:s}),r("table",{class:sn,"aria-label":`Valores da tabela ${e}`,children:[r("thead",{children:r("tr",{children:[r("th",{class:yt,children:"Valor"}),r("th",{class:yt,children:"Status"}),r("th",{class:yt,children:"Ativo"})]})}),r("tbody",{children:t.map(n=>r("tr",{class:nn,children:[r("td",{class:bt,children:n.label}),r("td",{class:bt,children:r("span",{class:an(n.active),children:n.active?"Ativo":"Inativo"})}),r("td",{class:bt,children:r($o,{checked:n.active,label:n.label,onToggle:()=>o(n.id)})})]},n.id))})]})]});var ln=u`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`,Ao=({tables:e,selectedTable:t,entries:o,loadState:s,onSelectTable:n,onToggleEntry:i,onCreateEntry:p,onRetry:l})=>{let[d,f]=U("");if(s==="loading")return r(q,{variant:"grid"});if(s==="error")return r(z,{title:"Erro ao carregar tabelas",message:"O servico social-care nao respondeu.",onRetry:l});if(e.length===0)return r(T,{children:[r(R,{title:"Lookup Tables"}),r(B,{message:"Nenhuma tabela encontrada",icon:"---"})]});let m=d.trim()?e.filter(c=>c.tableName.toLowerCase().includes(d.toLowerCase())):e;return r(T,{children:[r(R,{title:"Lookup Tables"}),r(xe,{placeholder:"Buscar tabela...",value:d,onChange:f,ariaLabel:"Buscar lookup tables"}),r("div",{class:ln,children:m.map(c=>r(vo,{tableName:c.tableName,entryCount:c.entryCount,isSelected:t===c.tableName,onClick:()=>n(c.tableName)},c.tableName))}),t&&r(ko,{tableName:t,entries:o,onToggle:i,onCreateEntry:p})]})};var cn=u`
  display: block;
  overflow-x: auto;
`,pn=u`
  width: 100%;
  border-collapse: collapse;
  background: ${a.surface};
  border-radius: ${S.card};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`,he=u`
  font-family: ${g.satoshi};
  font-weight: ${h.bold};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${a.textMuted};
  padding: 12px 16px;
  text-align: left;
  background: ${y(a.textPrimary,.03)};
  border-bottom: 1px solid ${a.inputLine};
`,ge=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid ${y(a.textPrimary,.06)};
  color: ${a.textPrimary};
`,dn=u`
  font-weight: ${h.semibold};
`,un=u`
  transition: background 150ms ease;
  &:hover {
    background: ${y(a.textPrimary,.02)};
  }
  &:last-child td {
    border-bottom: none;
  }
`,fn=e=>{let o={pendente:{bg:y(a.warning,.12),fg:a.warning},aprovado:{bg:y(a.primary,.12),fg:a.primary},rejeitado:{bg:y(a.danger,.08),fg:a.danger}}[e];return u`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: ${S.pill};
    font-family: ${g.satoshi};
    font-weight: ${h.semibold};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${o.bg};
    color: ${o.fg};
  `},mn=u`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`,xn=u`
  padding: 8px 18px;
  border-radius: ${S.pill};
  background: ${y(a.primary,.12)};
  color: ${a.primary};
  border: none;
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    background: ${a.primary};
    color: white;
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,hn=u`
  padding: 8px 18px;
  border-radius: ${S.pill};
  background: ${y(a.danger,.08)};
  color: ${a.danger};
  border: none;
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    background: ${a.danger};
    color: white;
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,gn=u`
  display: flex;
  gap: 10px;
`,wo=u`
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 12px;
  color: ${a.textMuted};
`,yn=e=>{let t={pendente:0,aprovado:1,rejeitado:2};return[...e].sort((o,s)=>(t[o.status]??3)-(t[s.status]??3))},To=({requests:e,onApprove:t,onReject:o})=>{let s=yn(e);return r("div",{class:cn,children:r("table",{class:pn,"aria-label":"Lista de solicitacoes",children:[r("thead",{children:r("tr",{children:[r("th",{class:he,children:"Tabela"}),r("th",{class:he,children:"Valor Proposto"}),r("th",{class:he,children:"Solicitante"}),r("th",{class:he,children:"Data"}),r("th",{class:he,children:"Status"}),r("th",{class:he,children:"Acoes"})]})}),r("tbody",{children:s.map(n=>r("tr",{class:un,children:[r("td",{class:ge,children:n.tableName}),r("td",{class:ge,children:r("span",{class:dn,children:n.label})}),r("td",{class:ge,children:n.requestedBy}),r("td",{class:ge,children:n.createdAt}),r("td",{class:ge,children:r("span",{class:fn(n.status),children:[r("span",{class:mn}),n.status]})}),r("td",{class:ge,children:n.status==="pendente"?r("div",{class:gn,children:[r("button",{class:xn,type:"button",onClick:()=>t(n.id,n.label),children:"Aprovar"}),r("button",{class:hn,type:"button",onClick:()=>o(n.id,n.label),children:"Rejeitar"})]}):n.status==="aprovado"?r("span",{class:wo,children:["Aprovado em ",n.updatedAt]}):r("span",{class:wo,children:["Motivo: ",n.reviewNote??"-"]})})]},n.id))})]})})};var Co=({requests:e,loadState:t,onApprove:o,onReject:s,onRetry:n})=>t==="loading"?r(q,{variant:"table"}):t==="error"?r(z,{title:"Erro ao carregar solicitacoes",message:"Tente novamente em alguns instantes.",onRetry:n}):e.length===0?r(T,{children:[r(R,{title:"Solicitacoes"}),r(B,{message:"Nenhuma solicitacao pendente",icon:"---"})]}):r(T,{children:[r(R,{title:"Solicitacoes"}),r(To,{requests:e,onApprove:o,onReject:s})]});var bn=u`
  margin-bottom: 24px;
`,Sn=u`
  display: block;
  margin: 0 auto;
  padding: 10px 24px;
  border: 1px solid ${a.inputLine};
  border-radius: ${S.pill};
  background: none;
  color: ${a.textMuted};
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    border-color: ${a.textPrimary};
    color: ${a.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,Ro=({entries:e,total:t,offset:o,loadState:s,onLoadMore:n,onRetry:i})=>{let[p,l]=U("");if(s==="loading")return r(q,{variant:"table"});if(s==="error")return r(z,{title:"Erro ao carregar auditoria",message:"Tente novamente em alguns instantes.",onRetry:i});if(e.length===0)return r(T,{children:[r(R,{title:"Auditoria"}),r(B,{message:"Nenhum registro de auditoria",icon:"---"})]});let d=p.trim()?e.filter(f=>f.action.toLowerCase().includes(p.toLowerCase())||f.actorName.toLowerCase().includes(p.toLowerCase())):e;return r(T,{children:[r(R,{title:"Auditoria"}),r(xe,{placeholder:"Buscar por acao ou ator...",value:p,onChange:l,ariaLabel:"Buscar auditoria"}),r("div",{class:bn,role:"log","aria-label":"Historico de auditoria",children:d.map(f=>r(Ze,{timestamp:f.timestamp,action:f.action,description:f.details??"-",actorName:f.actorName},f.id))}),o<t&&r("button",{class:Sn,type:"button",onClick:n,children:"Carregar mais..."})]})};var En=N`
  from { opacity: 0; }
  to { opacity: 1; }
`,vn=N`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`,$n=u`
  position: fixed;
  inset: 0;
  background: ${y(a.textPrimary,.4)};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  animation: ${En} 300ms ease;
`,kn=u`
  background: ${a.surfaceLight};
  border-radius: ${S.panel};
  padding: 32px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 24px 80px ${y(a.textPrimary,.2)};
  animation: ${vn} 400ms ease;
`,An=u`
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 18px;
  color: ${a.textPrimary};
  margin: 0 0 12px;
`,_o=u`
  font-family: ${g.playfair};
  font-style: italic;
  font-weight: ${h.light};
  font-size: 14px;
  color: ${a.textMuted};
  margin: 0 0 20px;
  line-height: 1.5;
`,wn=u`
  width: 100%;
  padding: 12px;
  border: 1px solid ${a.inputLine};
  border-radius: ${S.dropdown};
  font-family: ${g.satoshi};
  font-weight: ${h.regular};
  font-size: 14px;
  color: ${a.textPrimary};
  resize: vertical;
  min-height: 80px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 20px;
  &:focus {
    border-color: ${a.backgroundDark};
  }
  &::placeholder {
    color: ${a.textMuted};
  }
`,Tn=u`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`,Cn=u`
  background: none;
  border: 1px solid ${a.inputLine};
  color: ${a.textMuted};
  padding: 10px 24px;
  border-radius: ${S.pill};
  font-family: ${g.satoshi};
  font-weight: ${h.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    border-color: ${a.textPrimary};
    color: ${a.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${a.primary};
    outline-offset: 2px;
  }
`,Rn=e=>u`
    background: ${e==="approve"?a.primary:a.danger};
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: ${S.pill};
    font-family: ${g.satoshi};
    font-weight: ${h.semibold};
    font-size: 13px;
    cursor: pointer;
    transition: all 200ms ease;
    &:hover {
      opacity: 0.9;
    }
    &:focus-visible {
      outline: 2px solid ${a.primary};
      outline-offset: 2px;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,Do=({type:e,targetLabel:t,onConfirm:o,onCancel:s})=>{let[n,i]=U(""),p=d=>{d.key==="Escape"&&s()},l=()=>{e==="reject"?o(n):o()};return r("div",{class:$n,onClick:s,onKeyDown:p,children:r("div",{class:kn,role:"dialog","aria-labelledby":"modal-title","aria-modal":"true",onClick:d=>d.stopPropagation(),children:[r("h3",{id:"modal-title",class:An,children:e==="approve"?"Aprovar solicitacao":"Rejeitar solicitacao"}),e==="approve"?r("p",{class:_o,children:['Deseja aprovar a inclusao do valor "',t,'"? Esta acao ira adicionar o valor imediatamente.']}):r(T,{children:[r("p",{class:_o,children:"Informe o motivo da rejeicao. Esta informacao sera enviada ao solicitante."}),r("textarea",{class:wn,placeholder:"Motivo da rejeicao (obrigatorio)...",value:n,onInput:d=>i(d.target.value)})]}),r("div",{class:Tn,children:[r("button",{class:Cn,type:"button",onClick:s,children:"Cancelar"}),r("button",{class:Rn(e),type:"button",onClick:l,disabled:e==="reject"&&n.trim().length===0,"aria-label":e==="reject"?"Confirmar rejeicao da solicitacao":void 0,children:e==="approve"?"Aprovar":"Rejeitar"})]})]})})};var _n=N`
  from { transform: translateX(-50%) translateY(150%); }
  to { transform: translateX(-50%) translateY(0); }
`,Dn=e=>u`
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: ${S.pill};
    font-family: ${g.satoshi};
    font-weight: ${h.semibold};
    font-size: 13px;
    color: white;
    background: ${e==="success"?a.primary:a.danger};
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    z-index: 6000;
    animation: ${_n} 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    white-space: nowrap;
  `,Lo=({type:e,message:t,onDismiss:o})=>r("div",{class:Dn(e),role:e==="error"?"alert":"status","aria-live":e==="error"?"assertive":"polite",onClick:o,children:t});var Ln=u`
  padding: 20px;
  background: ${a.background};
  min-height: calc(100vh - 140px);
  @media (min-width: 600px) {
    padding: 32px 48px;
  }
`,Oo=({user:e,loadDashboard:t,loadTabData:o,onApproveRequest:s,onRejectRequest:n,onToggleEntry:i,onSelectLookupTable:p})=>{let[l,d]=ut(po,uo);_e(()=>{t(d)},[]),_e(()=>{l.tabStates[l.activeTab]==="idle"&&o(l.activeTab,d)},[l.activeTab]),_e(()=>{if(l.toast){let x=setTimeout(()=>d({type:"HIDE_TOAST"}),4e3);return()=>clearTimeout(x)}},[l.toast]);let f=(x,b,E)=>{d({type:"OPEN_MODAL",modalType:x,targetId:b,targetLabel:E})},m=x=>{l.modal.targetId&&(l.modal.type==="approve"?s(l.modal.targetId,x,d):l.modal.type==="reject"&&x&&n(l.modal.targetId,x,d))},c=l.requests.filter(x=>x.status==="pendente").length;return r(T,{children:[r(fo,{user:e}),r(mo,{activeTab:l.activeTab,pendingCount:c,onTabChange:x=>d({type:"SWITCH_TAB",tab:x})}),r("main",{class:Ln,children:[l.activeTab==="dashboard"&&r(yo,{stats:l.stats,requests:l.requests,auditEntries:l.auditEntries,loadState:l.tabStates.dashboard,error:l.error,onApprove:(x,b)=>f("approve",x,b),onReject:(x,b)=>f("reject",x,b),onSeeAllRequests:()=>d({type:"SWITCH_TAB",tab:"solicitacoes"}),onSeeAllAudit:()=>d({type:"SWITCH_TAB",tab:"auditoria"}),onRetry:()=>t(d)}),l.activeTab==="pessoas"&&r(Eo,{people:l.people,searchQuery:l.peopleSearch,loadState:l.tabStates.pessoas,onSearch:x=>d({type:"SET_PEOPLE_SEARCH",query:x}),onCreate:()=>{},onRetry:()=>o("pessoas",d)}),l.activeTab==="lookups"&&r(Ao,{tables:l.lookupTables,selectedTable:l.selectedTable,entries:l.lookupEntries,loadState:l.tabStates.lookups,onSelectTable:x=>p(x,d),onToggleEntry:x=>l.selectedTable&&i(l.selectedTable,x,d),onCreateEntry:()=>{},onRetry:()=>o("lookups",d)}),l.activeTab==="solicitacoes"&&r(Co,{requests:l.requests,loadState:l.tabStates.solicitacoes,onApprove:(x,b)=>f("approve",x,b),onReject:(x,b)=>f("reject",x,b),onRetry:()=>o("solicitacoes",d)}),l.activeTab==="auditoria"&&r(Ro,{entries:l.auditEntries,total:l.auditTotal,offset:l.auditOffset,loadState:l.tabStates.auditoria,onLoadMore:()=>o("auditoria",d),onRetry:()=>o("auditoria",d)})]}),l.modal.type&&l.modal.targetLabel&&r(Do,{type:l.modal.type,targetLabel:l.modal.targetLabel,onConfirm:m,onCancel:()=>d({type:"CLOSE_MODAL"})}),l.toast&&r(Lo,{type:l.toast.type,message:l.toast.message,onDismiss:()=>d({type:"HIDE_TOAST"})})]})};var J={brandTitle:"ACDG",brandSubtitle:"Administracao",tabDashboard:"Dashboard",tabPessoas:"Pessoas",tabLookups:"Lookup Tables",tabSolicitacoes:"Solicitacoes",tabSolicitacoesAria:e=>`Solicitacoes, ${e} pendentes`,tabAuditoria:"Auditoria",statPeople:"Pessoas",statRoles:"Roles Ativos",statPending:"Solicitacoes Pendentes",statAudit:"Acoes no Audit",statPeopleDetail:e=>`${e} cadastradas este mes`,statRolesDetail:e=>`${e} assistentes sociais`,statPendingDetail:"Aguardando aprovacao",statAuditDetail:"Ultimos 30 dias",pendingSectionTitle:"Solicitacoes pendentes",pendingSeeAll:"Ver todas",recentSectionTitle:"Atividade recente",recentSeeAll:"Ver audit completo",pessoasTitle:"Pessoas",pessoasCreate:"+ Nova Pessoa",pessoasSearch:"Buscar por nome ou CPF...",pessoasEmpty:"Nenhuma pessoa cadastrada",pessoasEmptyDesc:"Cadastre a primeira pessoa para comecar a gerenciar o sistema.",pessoasSearchEmpty:e=>`Nenhum resultado para "${e}"`,lookupsTitle:"Lookup Tables",lookupsSearch:"Buscar tabela...",lookupsEmpty:"Nenhuma tabela encontrada",lookupsEmptyDesc:"As lookup tables serao carregadas do backend social-care.",lookupDetailTitle:e=>`Detalhes: ${e}`,lookupCreateEntry:"+ Novo Valor",lookupCardAria:(e,t)=>`Ver ${e}, ${t} valores ativos`,toggleOnAria:e=>`Desativar valor ${e}`,toggleOffAria:e=>`Ativar valor ${e}`,solicitacoesTitle:"Solicitacoes",solicitacoesEmpty:"Nenhuma solicitacao pendente",solicitacoesEmptyDesc:"Todas as solicitacoes foram processadas. Novas solicitacoes aparecerao aqui.",btnApprove:"Aprovar",btnReject:"Rejeitar",approvedAt:e=>`Aprovado em ${e}`,rejectedReason:e=>`Motivo: ${e}`,auditoriaTitle:"Auditoria",auditoriaSearch:"Buscar por acao ou ator...",auditoriaEmpty:"Nenhum registro de auditoria",auditoriaEmptyDesc:"Acoes administrativas serao registradas aqui automaticamente.",auditoriaLoadMore:"Carregar mais...",approveModalTitle:"Aprovar solicitacao",approveModalDesc:e=>`Deseja aprovar a inclusao do valor "${e}"? Esta acao ira adicionar o valor imediatamente.`,approveModalConfirm:"Aprovar",rejectModalTitle:"Rejeitar solicitacao",rejectModalDesc:"Informe o motivo da rejeicao. Esta informacao sera enviada ao solicitante.",rejectModalPlaceholder:"Motivo da rejeicao (obrigatorio)...",rejectModalConfirm:"Rejeitar",rejectModalConfirmAria:"Confirmar rejeicao da solicitacao",modalCancel:"Cancelar",toastApproved:"Solicitacao aprovada com sucesso",toastRejected:"Solicitacao rejeitada com sucesso",toastToggled:(e,t)=>`"${e}" ${t?"ativado":"desativado"} com sucesso`,toastError:"Erro ao processar solicitacao. Tente novamente.",toastPersonCreated:"Pessoa cadastrada com sucesso",toastRoleAssigned:"Role atribuido com sucesso",errorDashboardTitle:"Erro ao carregar dados",errorDashboardDesc:"Nao foi possivel conectar aos servicos. Verifique se os backends estao acessiveis.",errorPeopleTitle:"Erro ao carregar pessoas",errorPeopleDesc:"O servico people-context nao respondeu. Tente novamente em alguns instantes.",errorLookupsTitle:"Erro ao carregar tabelas",errorLookupsDesc:"O servico social-care nao respondeu.",errorRequestsTitle:"Erro ao carregar solicitacoes",errorAuditTitle:"Erro ao carregar auditoria",errorRetry:"Tentar novamente",errorPermission:"Voce nao tem mais permissao para acessar esta area",dashboardEmpty:"Nenhuma atividade ainda",dashboardEmptyDesc:"Comece cadastrando pessoas ou configurando lookup tables para ver atividade aqui."};var St={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Et=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}};var ae=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:St});return Et(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var vt=async(e,t)=>{try{let o=await fetch(e,{method:"PUT",credentials:"same-origin",headers:St,body:JSON.stringify(t)});return Et(o)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},jo=async(e,t)=>{try{let o=await fetch(e,{method:"PATCH",credentials:"same-origin",headers:St,body:t!==void 0?JSON.stringify(t):void 0});return Et(o)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var Po=()=>ae("/api/admin/stats"),Mo=()=>ae("/api/admin/people");var $t=(e,t)=>ae(`/api/admin/audit?limit=${e}&offset=${t}`);var kt=e=>ae(`/api/admin/lookups/${e}`);var Io=(e,t)=>jo(`/api/admin/lookups/${e}/${t}/toggle`),At=()=>ae("/api/admin/lookups/requests");var No=e=>vt(`/api/admin/lookups/requests/${e}/approve`,{}),Bo=(e,t)=>vt(`/api/admin/lookups/requests/${e}/reject`,{reviewNote:t});var wt={name:"Admin",role:"admin",initials:"A"},Mn=e=>{if(!e)return wt;try{let t=JSON.parse(e);return typeof t=="object"&&t!==null&&"name"in t&&typeof t.name=="string"&&"role"in t&&typeof t.role=="string"&&"initials"in t&&typeof t.initials=="string"?t:wt}catch{return wt}},In=()=>{let e=document.getElementById("admin-hub-app");if(!e)return;let t=Mn(e.dataset.user),o=async d=>{d({type:"LOAD_DASHBOARD_START"});let[f,m,c]=await Promise.all([Po(),At(),$t(5,0)]);if(!f.ok||!m.ok||!c.ok){d({type:"LOAD_DASHBOARD_FAILURE",title:J.errorDashboardTitle,message:J.errorDashboardDesc});return}let x=m.value.filter(b=>b.status==="pendente").length;d({type:"LOAD_DASHBOARD_SUCCESS",stats:{people:f.value.people,roles:f.value.roles,audit:f.value.audit,pendingRequests:x},pendingRequests:m.value,recentAudit:c.value.entries})};lt(r(Oo,{user:t,loadDashboard:o,loadTabData:async(d,f)=>{switch(d){case"dashboard":await o(f);break;case"pessoas":{f({type:"LOAD_PEOPLE_START"});let m=await Mo();m.ok?f({type:"LOAD_PEOPLE_SUCCESS",people:m.value}):f({type:"LOAD_PEOPLE_FAILURE"});break}case"lookups":{f({type:"LOAD_LOOKUPS_START"});let m=["dominio_tipo_identidade","dominio_tipo_deficiencia","dominio_parentesco","dominio_programa_social","dominio_condicao_ocupacao","dominio_tipo_ingresso","dominio_escolaridade","dominio_tipo_beneficio","dominio_efeito_condicionalidade","dominio_tipo_violacao","dominio_servico_vinculo","dominio_tipo_medida","dominio_unidade_realizacao"],c=await Promise.all(m.map(async x=>{let b=await kt(x);return{tableName:x,entryCount:b.ok?b.value.length:0}}));f({type:"LOAD_LOOKUPS_SUCCESS",tables:c});break}case"solicitacoes":{f({type:"LOAD_REQUESTS_START"});let m=await At();m.ok?f({type:"LOAD_REQUESTS_SUCCESS",requests:m.value}):f({type:"LOAD_REQUESTS_FAILURE"});break}case"auditoria":{f({type:"LOAD_AUDIT_START"});let m=await $t(20,0);m.ok?f({type:"LOAD_AUDIT_SUCCESS",entries:m.value.entries,total:m.value.total}):f({type:"LOAD_AUDIT_FAILURE"});break}}},onApproveRequest:async(d,f,m)=>{(await No(d)).ok?(m({type:"APPROVE_SUCCESS",requestId:d}),m({type:"SHOW_TOAST",toast:{type:"success",message:J.toastApproved}})):(m({type:"CLOSE_MODAL"}),m({type:"SHOW_TOAST",toast:{type:"error",message:J.toastError}}))},onRejectRequest:async(d,f,m)=>{(await Bo(d,f)).ok?(m({type:"REJECT_SUCCESS",requestId:d}),m({type:"SHOW_TOAST",toast:{type:"success",message:J.toastRejected}})):(m({type:"CLOSE_MODAL"}),m({type:"SHOW_TOAST",toast:{type:"error",message:J.toastError}}))},onToggleEntry:async(d,f,m)=>{let c=await Io(d,f);c.ok?(m({type:"TOGGLE_ENTRY_SUCCESS",entryId:f,active:c.value.active}),m({type:"SHOW_TOAST",toast:{type:"success",message:J.toastToggled(c.value.label,c.value.active)}})):m({type:"SHOW_TOAST",toast:{type:"error",message:J.toastError}})},onSelectLookupTable:async(d,f)=>{f({type:"SELECT_LOOKUP_TABLE",tableName:d});let m=await kt(d);m.ok&&f({type:"LOAD_ENTRIES_SUCCESS",entries:m.value})}}),e)};In();
