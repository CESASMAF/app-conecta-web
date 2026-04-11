var Co=Object.defineProperty;var $o=(e,t)=>{for(var o in t)Co(e,o,{get:t[o],enumerable:!0})};var Ao={Stringify:1,BeforeStream:2,Stream:3},_=(e,t)=>{let o=new String(e);return o.isEscaped=!0,o.callbacks=t,o},vo=/[&<>'"]/,Ce=async(e,t)=>{let o="";t||=[];let r=await Promise.all(e);for(let n=r.length-1;o+=r[n],n--,!(n<0);n--){let s=r[n];typeof s=="object"&&t.push(...s.callbacks||[]);let a=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??a)o+=s;else{let c=[o];F(s,c),o=c[0]}}return _(o,t)},F=(e,t)=>{let o=e.search(vo);if(o===-1){t[0]+=e;return}let r,n,s=0;for(n=o;n<e.length;n++){switch(e.charCodeAt(n)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(s,n)+r,s=n+1}t[0]+=e.substring(s,n)},Fe=e=>{let t=e.callbacks;if(!t?.length)return e;let o=[e],r={};return t.forEach(n=>n({phase:Ao.Stringify,buffer:o,context:r})),o[0]};var K=Symbol("RENDERER"),ee=Symbol("ERROR_HANDLER"),E=Symbol("STASH"),$e=Symbol("INTERNAL"),Ae=Symbol("MEMO"),te=Symbol("PERMALINK");var Ue=e=>(e[$e]=!0,e);var He=e=>({value:t,children:o})=>{if(!o)return;let r={children:[{tag:Ue(()=>{e.push(t)}),props:{}}]};Array.isArray(o)?r.children.push(...o.flat()):r.children.push(o),r.children.push({tag:Ue(()=>{e.pop()}),props:{}});let n={tag:"",props:r,type:""};return n[ee]=s=>{throw e.pop(),s},n},le=e=>{let t=[e],o=He(t);return o.values=t,o.Provider=o,U.push(o),o};var U=[],at=e=>{let t=[e],o=r=>{t.push(r.value);let n;try{n=r.children?(Array.isArray(r.children)?new ce("",{},r.children):r.children).toString():""}catch(s){throw t.pop(),s}return n instanceof Promise?n.finally(()=>t.pop()).then(s=>_(s,s.callbacks)):(t.pop(),_(n))};return o.values=t,o.Provider=o,o[K]=He(t),U.push(o),o},M=e=>e.values.at(-1);var oe={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},pe={},H="data-precedence",ve=e=>e.rel==="stylesheet"&&"precedence"in e,Te=(e,t)=>e==="link"?t:oe[e].length>0;var ue={};$o(ue,{button:()=>Io,form:()=>Ro,input:()=>Oo,link:()=>Do,meta:()=>Lo,script:()=>_o,style:()=>jo,title:()=>To});var Y=e=>Array.isArray(e)?e:[e];var lt=new WeakMap,ct=(e,t,o,r)=>({buffer:n,context:s})=>{if(!n)return;let a=lt.get(s)||{};lt.set(s,a);let c=a[e]||=[],f=!1,d=oe[e],m=Te(e,r!==void 0);if(m){e:for(let[,l]of c)if(!(e==="link"&&!(l.rel==="stylesheet"&&l[H]!==void 0))){for(let x of d)if((l?.[x]??null)===o?.[x]){f=!0;break e}}}if(f?n[0]=n[0].replaceAll(t,""):m||e==="link"?c.push([t,o,r]):c.unshift([t,o,r]),n[0].indexOf("</head>")!==-1){let l;if(e==="link"||r!==void 0){let x=[];l=c.map(([y,,S],T)=>{if(S===void 0)return[y,Number.MAX_SAFE_INTEGER,T];let j=x.indexOf(S);return j===-1&&(x.push(S),j=x.length-1),[y,j,T]}).sort((y,S)=>y[1]-S[1]||y[2]-S[2]).map(([y])=>y)}else l=c.map(([x])=>x);l.forEach(x=>{n[0]=n[0].replaceAll(x,"")}),n[0]=n[0].replace(/(?=<\/head>)/,l.join(""))}},fe=(e,t,o)=>_(new R(e,o,Y(t??[])).toString()),de=(e,t,o,r)=>{if("itemProp"in o)return fe(e,t,o);let{precedence:n,blocking:s,...a}=o;n=r?n??"":void 0,r&&(a[H]=n);let c=new R(e,a,Y(t||[])).toString();return c instanceof Promise?c.then(f=>_(c,[...f.callbacks||[],ct(e,f,a,n)])):_(c,[ct(e,c,a,n)])},To=({children:e,...t})=>{let o=_e();if(o){let r=M(o);if(r==="svg"||r==="head")return new R("title",t,Y(e??[]))}return de("title",e,t,!1)},_o=({children:e,...t})=>{let o=_e();return["src","async"].some(r=>!t[r])||o&&M(o)==="head"?fe("script",e,t):de("script",e,t,!1)},jo=({children:e,...t})=>["href","precedence"].every(o=>o in t)?(t["data-href"]=t.href,delete t.href,de("style",e,t,!0)):fe("style",e,t),Do=({children:e,...t})=>["onLoad","onError"].some(o=>o in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?fe("link",e,t):de("link",e,t,ve(t)),Lo=({children:e,...t})=>{let o=_e();return o&&M(o)==="head"?fe("meta",e,t):de("meta",e,t,!1)},pt=(e,{children:t,...o})=>new R(e,o,Y(t??[])),Ro=e=>(typeof e.action=="function"&&(e.action=te in e.action?e.action[te]:void 0),pt("form",e)),ft=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=te in t.formAction?t.formAction[te]:void 0),pt(e,t)),Oo=e=>ft("input",e),Io=e=>ft("button",e);var Po=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),re=e=>Po.get(e)||e,me=(e,t)=>{for(let[o,r]of Object.entries(e)){let n=o[0]==="-"||!/[A-Z]/.test(o)?o:o.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(n,r==null?null:typeof r=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}};var he,_e=()=>he,Mo=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Bo=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],No=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],ze=(e,t)=>{for(let o=0,r=e.length;o<r;o++){let n=e[o];if(typeof n=="string")F(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof R?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):ze(n,t)}}},R=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,o,r){this.tag=t,this.props=o,this.children=r}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([o,r])=>{o.values.push(r)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([o])=>{o.values.pop()})}return t.length===1?"callbacks"in t?Fe(_(t[0],t.callbacks)).toString():t[0]:Ce(t,t.callbacks)}toStringToBuffer(t){let o=this.tag,r=this.props,{children:n}=this;t[0]+=`<${o}`;let s=he&&M(he)==="svg"?a=>Mo(re(a)):a=>re(a);for(let[a,c]of Object.entries(r))if(a=s(a),a!=="children"){if(a==="style"&&typeof c=="object"){let f="";me(c,(d,m)=>{m!=null&&(f+=`${f?";":""}${d}:${m}`)}),t[0]+=' style="',F(f,t),t[0]+='"'}else if(typeof c=="string")t[0]+=` ${a}="`,F(c,t),t[0]+='"';else if(c!=null)if(typeof c=="number"||c.isEscaped)t[0]+=` ${a}="${c}"`;else if(typeof c=="boolean"&&No.includes(a))c&&(t[0]+=` ${a}=""`);else if(a==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[_(c.__html)]}else if(c instanceof Promise)t[0]+=` ${a}="`,t.unshift('"',c);else if(typeof c=="function"){if(!a.startsWith("on")&&a!=="ref")throw new Error(`Invalid prop '${a}' of type 'function' supplied to '${o}'.`)}else t[0]+=` ${a}="`,F(c.toString(),t),t[0]+='"'}if(Bo.includes(o)&&n.length===0){t[0]+="/>";return}t[0]+=">",ze(n,t),t[0]+=`</${o}>`}},xe=class extends R{toStringToBuffer(t){let{children:o}=this,r={...this.props};o.length&&(r.children=o.length===1?o[0]:o);let n=this.tag.call(null,r);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(U.length===0)t.unshift("",n);else{let s=U.map(a=>[a,a.values.at(-1)]);t.unshift("",n.then(a=>(a instanceof R&&(a.localContexts=s),a)))}else n instanceof R?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):F(n,t)}},ce=class extends R{toStringToBuffer(t){ze(this.children,t)}};var dt=!1,je=(e,t,o)=>{if(!dt){for(let r in pe)ue[r][K]=pe[r];dt=!0}return typeof e=="function"?new xe(e,t,o):ue[e]?new xe(ue[e],t,o):e==="svg"||e==="head"?(he||=at(""),new R(e,t,[new xe(he,{value:e},o)])):new R(e,t,o)};var ne=({children:e})=>new ce("",{children:e},Array.isArray(e)?e:e?[e]:[]);function i(e,t,o){let r;if(!t||!("children"in t))r=je(e,t,[]);else{let n=t.children;r=Array.isArray(n)?je(e,t,n):je(e,t,[n])}return r.key=o,r}var ye="_hp",Fo={Change:"Input",DoubleClick:"DblClick"},Uo={svg:"2000/svg",math:"1998/Math/MathML"},X=[],Ge=new WeakMap,ie,bt=()=>ie,z=e=>"t"in e,Ve={onClick:["click",!1]},ut=e=>{if(!e.startsWith("on"))return;if(Ve[e])return Ve[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,o,r]=t;return Ve[e]=[(Fo[o]||o).toLowerCase(),!!r]}},mt=(e,t)=>ie&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,St=e=>e==null||e===!1?null:e,Ho=(e,t)=>{"value"in t&&(e.value=St(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},zo=(e,t,o)=>{t||={};for(let r in t){let n=t[r];if(r!=="children"&&(!o||o[r]!==n)){r=re(r);let s=ut(r);if(s){if(o?.[r]!==n&&(o&&e.removeEventListener(s[0],o[r],s[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${r}" is not a function`);e.addEventListener(s[0],n,s[1])}}else if(r==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(r==="ref"){let a;typeof n=="function"?a=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,a=()=>n.current=null),Ge.set(e,a)}else if(r==="style"){let a=e.style;typeof n=="string"?a.cssText=n:(a.cssText="",n!=null&&me(n,a.setProperty.bind(a)))}else{if(r==="value"){let c=e.nodeName;if(c==="SELECT")continue;if((c==="INPUT"||c==="TEXTAREA")&&(e.value=St(n),c==="TEXTAREA")){e.textContent=n;continue}}else(r==="checked"&&e.nodeName==="INPUT"||r==="selected"&&e.nodeName==="OPTION")&&(e[r]=n);let a=mt(e,r);n==null||n===!1?e.removeAttribute(a):n===!0?e.setAttribute(a,""):typeof n=="string"||typeof n=="number"?e.setAttribute(a,n):e.setAttribute(a,n.toString())}}}if(o)for(let r in o){let n=o[r];if(r!=="children"&&!(r in t)){r=re(r);let s=ut(r);s?e.removeEventListener(s[0],n,s[1]):r==="ref"?Ge.get(e)?.():e.removeAttribute(mt(e,r))}}},Vo=(e,t)=>{t[E][0]=0,X.push([e,t]);let o=t.tag[K]||t.tag,r=o.defaultProps?{...o.defaultProps,...t.props}:t.props;try{return[o.call(null,r)]}finally{X.pop()}},wt=(e,t,o,r,n)=>{e.vR?.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[E][1][Re]?.forEach(s=>n.push(s)),e.vC.forEach(s=>{if(z(s))o.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let a=o.length;if(wt(s,t,o,r,n),s.s){for(let c=a;c<o.length;c++)o[c].s=!0;s.s=!1}}else o.push(s),s.vR?.length&&(r.push(...s.vR),delete s.vR)})},Go=e=>{for(;e&&(e.tag===ye||!e.e);)e=e.tag===ye||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},Et=e=>{z(e)||(e[E]?.[1][Re]?.forEach(t=>t[2]?.()),Ge.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(Et)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(ge.delete(e),De.delete(e),delete e[E][3],e.a=!0)},Ke=(e,t,o)=>{e.c=t,kt(e,t,o)},xt=(e,t)=>{if(t){for(let o=0,r=e.length;o<r;o++)if(e[o]===t)return o}},ht=Symbol(),kt=(e,t,o)=>{let r=[],n=[],s=[];wt(e,t,r,n,s),n.forEach(Et);let a=o?void 0:t.childNodes,c,f=null;if(o)c=-1;else if(!a.length)c=0;else{let d=xt(a,Go(e.nN));d!==void 0?(f=a[d],c=d):c=xt(a,r.find(m=>m.tag!==ye&&m.e)?.e)??-1,c===-1&&(o=!0)}for(let d=0,m=r.length;d<m;d++,c++){let l=r[d],x;if(l.s&&l.e)x=l.e,l.s=!1;else{let y=o||!l.e;z(l)?(l.e&&l.d&&(l.e.textContent=l.t),l.d=!1,x=l.e||=document.createTextNode(l.t)):(x=l.e||=l.n?document.createElementNS(l.n,l.tag):document.createElement(l.tag),zo(x,l.props,l.pP),kt(l,x,y),l.tag==="select"&&Ho(x,l.props))}l.tag===ye?c--:o?x.parentNode||t.appendChild(x):a[c]!==x&&a[c-1]!==x&&(a[c+1]===x?t.appendChild(a[c]):t.insertBefore(x,f||a[c]||null))}if(e.pP&&(e.pP=void 0),s.length){let d=[],m=[];s.forEach(([,l,,x,y])=>{l&&d.push(l),x&&m.push(x),y?.()}),d.forEach(l=>l()),m.length&&requestAnimationFrame(()=>{m.forEach(l=>l())})}},Ko=(e,t)=>!!(e&&e.length===t.length&&e.every((o,r)=>o[1]===t[r][1])),De=new WeakMap,Le=(e,t,o)=>{let r=!o&&t.pC;o&&(t.pC||=t.vC);let n;try{o||=typeof t.tag=="function"?Vo(e,t):Y(t.props.children),o[0]?.tag===""&&o[0][ee]&&(n=o[0][ee],e[5].push([e,n,t]));let s=r?[...t.pC]:t.vC?[...t.vC]:void 0,a=[],c;for(let f=0;f<o.length;f++){if(Array.isArray(o[f])){o.splice(f,1,...o[f].flat(1/0)),f--;continue}let d=Ct(o[f]);if(d){typeof d.tag=="function"&&!d.tag[$e]&&(U.length>0&&(d[E][2]=U.map(l=>[l,l.values.at(-1)])),e[5]?.length&&(d[E][3]=e[5].at(-1)));let m;if(s&&s.length){let l=s.findIndex(z(d)?x=>z(x):d.key!==void 0?x=>x.key===d.key&&x.tag===d.tag:x=>x.tag===d.tag);l!==-1&&(m=s[l],s.splice(l,1))}if(m)if(z(d))m.t!==d.t&&(m.t=d.t,m.d=!0),d=m;else{let l=m.pP=m.props;if(m.props=d.props,m.f||=d.f||t.f,typeof d.tag=="function"){let x=m[E][2];m[E][2]=d[E][2]||[],m[E][3]=d[E][3],!m.f&&((m.o||m)===d.o||m.tag[Ae]?.(l,m.props))&&Ko(x,m[E][2])&&(m.s=!0)}d=m}else if(!z(d)&&ie){let l=M(ie);l&&(d.n=l)}if(!z(d)&&!d.s&&(Le(e,d),delete d.f),a.push(d),c&&!c.s&&!d.s)for(let l=c;l&&!z(l);l=l.vC?.at(-1))l.nN=d;c=d}}t.vR=r?[...t.vC,...s||[]]:s||[],t.vC=a,r&&delete t.pC}catch(s){if(t.f=!0,s===ht){if(n)return;throw s}let[a,c,f]=t[E]?.[3]||[];if(c){let d=()=>be([0,!1,e[2]],f),m=De.get(f)||[];m.push(d),De.set(f,m);let l=c(s,()=>{let x=De.get(f);if(x){let y=x.indexOf(d);if(y!==-1)return x.splice(y,1),d()}});if(l){if(e[0]===1)e[1]=!0;else if(Le(e,f,[l]),(c.length===1||e!==a)&&f.c){Ke(f,f.c,!1);return}throw ht}}throw s}finally{n&&e[5].pop()}},Ct=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[E]=[0,[]];else{let t=Uo[e.tag];t&&(ie||=le(""),e.props.children=[{tag:ie,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},$t=(e,t,o)=>{e.c===t&&(e.c=o,e.vC.forEach(r=>$t(r,t,o)))},gt=(e,t)=>{t[E][2]?.forEach(([o,r])=>{o.values.push(r)});try{Le(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[E][2]?.forEach(([o])=>{o.values.pop()}),(e[0]!==1||!e[1])&&Ke(t,t.c,!1)},ge=new WeakMap,yt=[],be=async(e,t)=>{e[5]||=[];let o=ge.get(t);o&&o[0](void 0);let r,n=new Promise(s=>r=s);if(ge.set(t,[r,()=>{e[2]?e[2](e,t,s=>{gt(s,t)}).then(()=>r(t)):(gt(e,t),r(t))}]),yt.length)yt.at(-1).add(t);else{await Promise.resolve();let s=ge.get(t);s&&(ge.delete(t),s[1]())}return n},Wo=(e,t)=>{let o=[];o[5]=[],o[4]=!0,Le(o,e,void 0),o[4]=!1;let r=document.createDocumentFragment();Ke(e,r,!0),$t(e,r,t),t.replaceChildren(r)},We=(e,t)=>{Wo(Ct({tag:"",props:{children:e}}),t)};var qe=(e,t,o)=>({tag:ye,props:{children:e},key:o,e:t,p:1});var qo=0,Re=1,Yo=2,Xo=3;var Ye=new WeakMap,Xe=(e,t)=>!e||!t||e.length!==t.length||t.some((o,r)=>o!==e[r]);var Zo;var At=[];var Se=e=>{let t=()=>typeof e=="function"?e():e,o=X.at(-1);if(!o)return[t(),()=>{}];let[,r]=o,n=r[E][1][qo]||=[],s=r[E][0]++;return n[s]||=[t(),a=>{let c=Zo,f=n[s];if(typeof a=="function"&&(a=a(f[0])),!Object.is(a,f[0]))if(f[0]=a,At.length){let[d,m]=At.at(-1);Promise.all([d===3?r:be([d,!1,c],r),m]).then(([l])=>{if(!l||!(d===2||d===3))return;let x=l.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===l.vC&&be([d===3?1:0,!1,c],l)})})})}else be([0,!1,c],r)}]},Ze=(e,t,o)=>{let r=Z(a=>{s(c=>e(c,a))},[e]),[n,s]=Se(()=>o?o(t):t);return[n,r]},Jo=(e,t,o)=>{let r=X.at(-1);if(!r)return;let[,n]=r,s=n[E][1][Re]||=[],a=n[E][0]++,[c,,f]=s[a]||=[];if(Xe(c,o)){f&&f();let d=()=>{m[e]=void 0,m[2]=t()},m=[o,void 0,void 0,void 0,void 0];m[e]=d,s[a]=m}},Je=(e,t)=>Jo(3,e,t);var Z=(e,t)=>{let o=X.at(-1);if(!o)return e;let[,r]=o,n=r[E][1][Yo]||=[],s=r[E][0]++,a=n[s];return Xe(a?.[1],t)?n[s]=[e,t]:e=n[s][0],e};var Qe=e=>{let t=Ye.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(o=>Ye.set(e,[o]),o=>Ye.set(e,[void 0,o])),e},et=(e,t)=>{let o=X.at(-1);if(!o)return e();let[,r]=o,n=r[E][1][Xo]||=[],s=r[E][0]++,a=n[s];return Xe(a?.[1],t)&&(n[s]=[e(),t]),n[s][0]};var Tt=le({pending:!1,data:null,method:null,action:null}),vt=new Set,_t=e=>{vt.add(e),e.finally(()=>vt.delete(e))};var tt=(e,t)=>et(()=>o=>{let r;e&&(typeof e=="function"?r=e(o)||(()=>{e(null)}):e&&"current"in e&&(e.current=o,r=()=>{e.current=null}));let n=t(o);return()=>{n?.(),r?.()}},[e]),jt=Object.create(null),Dt=Object.create(null),we=(e,t,o,r,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:a,onError:c,precedence:f,blocking:d,...m}=t,l=null,x=!1,y=oe[e],S=Te(e,r),T=w=>w.getAttribute("rel")==="stylesheet"&&w.getAttribute(H)!==null,j;if(S){let w=s.querySelectorAll(e);e:for(let C of w)if(!(e==="link"&&!T(C))){for(let b of y)if(C.getAttribute(b)===t[b]){l=C;break e}}if(!l){let C=y.reduce((b,A)=>t[A]===void 0?b:`${b}-${A}-${t[A]}`,e);x=!Dt[C],l=Dt[C]||=(()=>{let b=document.createElement(e);for(let A of y)t[A]!==void 0&&b.setAttribute(A,t[A]);return t.rel&&b.setAttribute("rel",t.rel),b})()}}else j=s.querySelectorAll(e);f=r?f??"":void 0,r&&(m[H]=f);let W=Z(w=>{if(S){if(e==="link"&&f!==void 0){let b=!1;for(let A of s.querySelectorAll(e)){let P=A.getAttribute(H);if(P===null){s.insertBefore(w,A);return}if(b&&P!==f){s.insertBefore(w,A);return}P===f&&(b=!0)}s.appendChild(w);return}let C=!1;for(let b of s.querySelectorAll(e)){if(C&&b.getAttribute(H)!==f){s.insertBefore(w,b);return}b.getAttribute(H)===f&&(C=!0)}s.appendChild(w)}else if(e==="link")s.contains(w)||s.appendChild(w);else if(j){let C=!1;for(let b of j)if(b===w){C=!0;break}C||s.insertBefore(w,s.contains(j[0])?j[0]:s.querySelector(e)),j=void 0}},[S,f,e]),Q=tt(t.ref,w=>{let C=y[0];if(o===2&&(w.innerHTML=""),(x||j)&&W(w),!c&&!a||!C)return;let b=jt[w.getAttribute(C)]||=new Promise((A,P)=>{w.addEventListener("load",A),w.addEventListener("error",P)});a&&(b=b.then(a)),c&&(b=b.catch(c)),b.catch(()=>{})});if(n&&d==="render"){let w=oe[e][0];if(w&&t[w]){let C=t[w],b=jt[C]||=new Promise((A,P)=>{W(l),l.addEventListener("load",A),l.addEventListener("error",P)});Qe(b)}}let D={tag:e,type:e,props:{...m,ref:Q},ref:Q};return D.p=o,l&&(D.e=l),qe(D,s)},Qo=e=>{let t=bt();return(t&&M(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:we("title",e,void 0,!1,!1)},er=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:we("script",e,1,!1,!0),tr=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,we("style",e,2,!0,!0)),or=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:we("link",e,1,ve(e),!0),rr=e=>we("meta",e,void 0,!1,!1),Lt=Symbol(),nr=e=>{let{action:t,...o}=e;typeof t!="function"&&(o.action=t);let[r,n]=Se([null,!1]),s=Z(async d=>{let m=d.isTrusted?t:d.detail[Lt];if(typeof m!="function")return;d.preventDefault();let l=new FormData(d.target);n([l,!0]);let x=m(l);x instanceof Promise&&(_t(x),await x),n([null,!0])},[]),a=tt(e.ref,d=>(d.addEventListener("submit",s),()=>{d.removeEventListener("submit",s)})),[c,f]=r;return r[1]=!1,{tag:Tt,props:{value:{pending:c!==null,data:c,method:c?"post":null,action:c?t:null},children:{tag:"form",props:{...o,ref:a},type:"form",ref:a}},f}},Rt=(e,{formAction:t,...o})=>{if(typeof t=="function"){let r=Z(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Lt]:t}}))},[]);o.ref=tt(o.ref,n=>(n.addEventListener("click",r),()=>{n.removeEventListener("click",r)}))}return{tag:e,props:o,type:e,ref:o.ref}},ir=e=>Rt("input",e),sr=e=>Rt("button",e);Object.assign(pe,{title:Qo,script:er,style:tr,link:or,meta:rr,form:nr,input:ir,button:sr});var Oe={screen:"landing",loadingContext:null,user:null,apps:[],lastUsedAppId:null,error:null};var $={landingTitle:"ACDG",landingTagline:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio",landingButton:"Entrar na plataforma",landingFooter:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o",authErrorTitle:"Falha na autentica\xE7\xE3o",authErrorDesc:"N\xE3o foi poss\xEDvel concluir o login. Verifique suas credenciais ou entre em contato com o suporte.",sessionExpiredTitle:"Sess\xE3o expirada",sessionExpiredDesc:"Sua sess\xE3o expirou por inatividade. Fa\xE7a login novamente para continuar.",greeting:e=>{let t=new Date().getHours();return`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`},hubSubtitle:"Selecione um m\xF3dulo para continuar",lastUsedLabel:"\xDALTIMO ACESSADO",allModulesLabel:e=>e>1?`TODOS OS M\xD3DULOS (${e})`:"SEU M\xD3DULO",logoutButton:"Sair",emptyTitle:"Nenhum m\xF3dulo dispon\xEDvel",emptyDesc:"Sua conta ainda n\xE3o tem acesso a nenhum m\xF3dulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permiss\xF5es necess\xE1rias.",emptyContactAdmin:"Falar com o administrador",emptyContactEmail:"admin@acdg.gov.br",emptyContactSubject:"Solicita\xE7\xE3o de acesso - ACDG",emptyBackToStart:"Voltar ao in\xEDcio",networkErrorTitle:"Erro ao carregar m\xF3dulos",networkErrorDesc:"N\xE3o foi poss\xEDvel carregar suas permiss\xF5es. Verifique sua conex\xE3o com a internet e tente novamente.",networkErrorRetry:"Tentar novamente",redirectTitle:e=>`Entrando em ${e}...`,redirectSubtitle:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente.",redirectCancel:"N\xE3o \xE9 o que esperava? Voltar",loadingAuth:"Autenticando...",loadingPermissions:"Carregando m\xF3dulos...",loadingApp:e=>`Entrando em ${e}...`};var Pt=(e,t)=>{switch(t.type){case"INIT_SESSION_CHECK":return{...e,screen:"loading",loadingContext:"authenticating"};case"NO_SESSION":return{...e,screen:"landing",loadingContext:null,error:null};case"SESSION_EXPIRED":return{...e,screen:"landing",loadingContext:null,user:null,error:{type:"session",title:$.sessionExpiredTitle,message:$.sessionExpiredDesc}};case"AUTH_START":return{...e,screen:"loading",loadingContext:"authenticating",error:null};case"AUTH_CALLBACK_SUCCESS":{let{user:o,apps:r,lastUsedAppId:n}=t;return r.length===0?{...e,screen:"hub",loadingContext:null,user:o,apps:r,lastUsedAppId:null,error:null}:r.length===1?{...e,screen:"redirect",loadingContext:null,user:o,apps:r,lastUsedAppId:r[0].id,error:null}:{...e,screen:"hub",loadingContext:null,user:o,apps:r,lastUsedAppId:n,error:null}}case"AUTH_CALLBACK_FAILURE":return{...e,screen:"landing",loadingContext:null,error:{type:"auth",title:t.title,message:t.message}};case"LOAD_PERMISSIONS_START":return{...e,screen:"loading",loadingContext:"loading-permissions",error:null};case"LOAD_PERMISSIONS_SUCCESS":{let{apps:o,lastUsedAppId:r}=t;return o.length===1?{...e,screen:"redirect",loadingContext:null,apps:o,lastUsedAppId:o[0].id}:{...e,screen:"hub",loadingContext:null,apps:o,lastUsedAppId:r}}case"LOAD_PERMISSIONS_FAILURE":return{...e,screen:"hub",loadingContext:null,error:{type:"network",title:$.networkErrorTitle,message:$.networkErrorDesc}};case"SELECT_APP":return{...e,screen:"loading",loadingContext:"entering-app",lastUsedAppId:t.appId};case"LOGOUT_START":return{...e,screen:"loading",loadingContext:"authenticating"};case"LOGOUT_COMPLETE":return{...Oe,screen:"landing"}}},Mt=e=>e.screen==="redirect"&&e.apps.length===1?e.apps[0]??null:null,Bt=e=>{let t=new Date().getHours();return`${t<12?"Bom dia":t<18?"Boa tarde":"Boa noite"}, ${e}`};var J=":-hono-global",lr=new RegExp(`^${J}{(.*)}$`),Ie="hono-css",V=Symbol(),v=Symbol(),O=Symbol(),N=Symbol(),Pe=Symbol(),Nt=Symbol(),Ws=Symbol();var Ft=e=>{let t=0,o=11;for(;t<e.length;)o=101*o+e.charCodeAt(t++)>>>0;return"css-"+o},Ut=e=>e.trim().replace(/\s+/g,"-"),Ht=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),cr=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),pr=e=>Ht(e)&&!cr.has(e.toLowerCase()),zt=e=>{console.warn(`Invalid slug: ${e}`)},fr=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),dr=new RegExp(["("+fr+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),ur=e=>e.replace(dr,(t,o,r,n,s)=>o||r||n||s||""),Vt=(e,t)=>{let o=[],r=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let a=0,c=e.length;a<c;a++){s+=e[a];let f=t[a];if(!(typeof f=="boolean"||f===null||f===void 0)){Array.isArray(f)||(f=[f]);for(let d=0,m=f.length;d<m;d++){let l=f[d];if(!(typeof l=="boolean"||l===null||l===void 0))if(typeof l=="string")/([\\"'\/])/.test(l)?s+=l.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=l;else if(typeof l=="number")s+=l;else if(l[Nt])s+=l[Nt];else if(l[v].startsWith("@keyframes "))o.push(l),s+=` ${l[v].substring(11)} `;else{if(e[a+1]?.match(/^\s*{/))o.push(l),l=`.${l[v]}`;else{o.push(...l[N]),r.push(...l[Pe]),l=l[O];let x=l.length;if(x>0){let y=l[x-1];y!==";"&&y!=="}"&&(l+=";")}}s+=`${l||""}`}}}}return[n,ur(s),o,r]},se=(e,t,o,r)=>{let[n,s,a,c]=Vt(e,t),f=lr.exec(s);f&&(s=f[1]);let d=Ft(n+s),m;if(o){let y=o(d,Ut(n),s);y&&(Ht(y)?m=y:(r||zt)(y))}let l=(f?J:"")+(m||d),x=(f?a.map(y=>y[v]):[l,...c]).join(" ");return{[V]:l,[v]:x,[O]:s,[N]:a,[Pe]:c}},Me=e=>{for(let t=0,o=e.length;t<o;t++){let r=e[t];typeof r=="string"&&(e[t]={[V]:"",[v]:"",[O]:"",[N]:[],[Pe]:[r]})}return e},Be=(e,t,o,r)=>{let[n,s]=Vt(e,t),a=Ft(n+s),c;if(o){let f=o(a,Ut(n),s);f&&(pr(f)?c=f:(r||zt)(f))}return{[V]:"",[v]:`@keyframes ${c||a}`,[O]:s,[N]:[],[Pe]:[]}},mr=0,Ne=(e,t,o,r)=>{e||(e=[`/* h-v-t ${mr++} */`]);let n=Array.isArray(e)?se(e,t,o,r):e,s=n[v],a=se(["view-transition-name:",""],[s],o,r);return n[v]=J+n[v],n[O]=n[O].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),a[v]=a[V]=s,a[N]=[...n[N],n],a};var hr=e=>{let t=[],o=0,r=0;for(let n=0,s=e.length;n<s;n++){let a=e[n];if(a==="'"||a==='"'){let c=a;for(n++;n<s;n++){if(e[n]==="\\"){n++;continue}if(e[n]===c)break}continue}if(a==="{"){r++;continue}if(a==="}"){r--,r===0&&(t.push(e.slice(o,n+1)),o=n+1);continue}}return t},ot=({id:e})=>{let t,o=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),r=(a,c)=>{let[f,d]=o();if(!f||!d){Promise.resolve().then(()=>{if(!o()[0])throw new Error("style sheet not found");r(a,c)});return}d.has(a)||(d.add(a),(a.startsWith(J)?hr(c):[`${a[0]==="@"?"":"."}${a}{${c}}`]).forEach(m=>{f.insertRule(m,f.cssRules.length)}))};return[{toString(){let a=this[V];return r(a,this[O]),this[N].forEach(({[v]:c,[O]:f})=>{r(c,f)}),this[v]}},({children:a,nonce:c})=>({tag:"style",props:{id:e,nonce:c,children:a&&(Array.isArray(a)?a:[a]).map(f=>f[O])}})]},gr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,n]=ot({id:e}),s=m=>(m.toString=r.toString,m),a=(m,...l)=>s(se(m,l,t,o));return{css:a,cx:(...m)=>(m=Me(m),a(Array(m.length).fill(""),...m)),keyframes:(m,...l)=>Be(m,l,t,o),viewTransition:(m,...l)=>s(Ne(m,l,t,o)),Style:n}},Ee=gr({id:Ie}),Xs=Ee.css,Zs=Ee.cx,Js=Ee.keyframes,Qs=Ee.viewTransition,ea=Ee.Style;var yr=({id:e,classNameSlug:t,onInvalidSlug:o})=>{let[r,n]=ot({id:e}),s=new WeakMap,a=new WeakMap,c=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),f=S=>{let T=({buffer:D,context:w})=>{let[C,b]=s.get(w),A=Object.keys(C);if(!A.length)return;let P="";if(A.forEach(q=>{b[q]=!0,P+=q.startsWith(J)?C[q]:`${q[0]==="@"?"":"."}${q}{${C[q]}}`}),s.set(w,[{},b]),D&&c.test(D[0])){D[0]=D[0].replace(c,(q,Eo,ko)=>`${Eo}${P}${ko}`);return}let it=a.get(w),st=`<script${it?` nonce="${it}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(P)}<\/script>`;if(D){D[0]=`${st}${D[0]}`;return}return Promise.resolve(st)},j=({context:D})=>{s.has(D)||s.set(D,[{},{}]);let[w,C]=s.get(D),b=!0;if(C[S[V]]||(b=!1,w[S[V]]=S[O]),S[N].forEach(({[v]:A,[O]:P})=>{C[A]||(b=!1,w[A]=P)}),!b)return Promise.resolve(_("",[T]))},W=new String(S[v]);Object.assign(W,S),W.isEscaped=!0,W.callbacks=[j];let Q=Promise.resolve(W);return Object.assign(Q,S),Q.toString=r.toString,Q},d=(S,...T)=>f(se(S,T,t,o)),m=(...S)=>(S=Me(S),d(Array(S.length).fill(""),...S)),l=(S,...T)=>Be(S,T,t,o),x=(S,...T)=>f(Ne(S,T,t,o)),y=({children:S,nonce:T}={})=>_(`<style id="${e}"${T?` nonce="${T}"`:""}>${S?S[O]:""}</style>`,[({context:j})=>{a.set(j,T)}]);return y[K]=n,{css:d,cx:m,keyframes:l,viewTransition:x,Style:y}},ke=yr({id:Ie}),p=ke.css,rt=ke.cx,B=ke.keyframes,aa=ke.viewTransition,la=ke.Style;var u={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.5)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},I=(e,t)=>{let o=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${o}, ${r}, ${n}, ${t})`},h={satoshi:"'Satoshi', sans-serif",playfair:"'Playfair Display', serif",erode:"'Erode', serif"},g={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"};var da={button:p`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:p`box-shadow: -8px 0 40px ${I(u.textPrimary,.3)};`,fab:p`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:p`box-shadow: 0 24px 80px ${u.inputLine};`,modal:p`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},L={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"},G={mobile:600,tablet:1200};var k=B`
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
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
`,xa=p`
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
`,br=p`
  ${qt}
  width: 600px;
  height: 600px;
  background: ${I(u.primary,.15)};
  top: -200px;
  right: -150px;
  animation: ${Gt} 12s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 400px;
    height: 400px;
  }
`,Sr=p`
  ${qt}
  width: 500px;
  height: 500px;
  background: ${I(u.background,.1)};
  bottom: -150px;
  left: -100px;
  animation: ${Kt} 15s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 350px;
    height: 350px;
  }
`,Yt=()=>i(ne,{children:[i("div",{class:br,"aria-hidden":"true"}),i("div",{class:Sr,"aria-hidden":"true"})]});var wr=p`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${u.background};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`,Er=p`
  font-family: ${h.satoshi};
  font-size: 36px;
  font-weight: ${g.bold};
  color: ${u.backgroundDark};
  line-height: 1;
`,Xt=()=>i("div",{class:wr,"aria-hidden":"true",children:i("span",{class:Er,children:"A"})});var kr=p`
  font-family: ${h.satoshi};
  font-size: 40px;
  font-weight: ${g.bold};
  color: ${u.textOnDark};
  line-height: 1.2;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 28px;
  }
`,Zt=()=>i("h1",{class:kr,children:"ACDG"});var Cr=p`
  font-family: ${h.playfair};
  font-size: 18px;
  font-style: italic;
  font-weight: ${g.light};
  color: rgba(242, 226, 196, 0.82);
  line-height: 1.6;
  max-width: 380px;
  text-align: center;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 16px;
  }
`,Jt=()=>i("p",{class:Cr,children:"Plataforma integrada de assist\xEAncia e cuidado social para gest\xE3o de fam\xEDlias e acompanhamento comunit\xE1rio"});var $r=B`
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
  animation: ${$r} 500ms ease both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,vr=p`
  background: rgba(166, 41, 13, 0.15);
  border: 1px solid rgba(166, 41, 13, 0.25);
`,Tr=p`
  background: rgba(201, 150, 10, 0.15);
  border: 1px solid rgba(201, 150, 10, 0.25);
`,_r=p`color: #FF8A7A;`,jr=p`color: #FFD066;`,Dr=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.semibold};
  margin: 0 0 4px;
  line-height: 1.3;
`,Lr=p`
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
`,Rr=({color:e})=>i("svg",{class:Qt,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),i("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),i("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),Or=({color:e})=>i("svg",{class:Qt,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("circle",{cx:"12",cy:"12",r:"10"}),i("polyline",{points:"12 6 12 12 16 14"})]}),eo=({type:e,title:t,description:o})=>{let r=e==="error",n=r?"#FF8A7A":"#FFD066";return i("div",{class:rt(Ar,r?vr:Tr),role:"alert","aria-live":"assertive",children:[r?i(Rr,{color:n}):i(Or,{color:n}),i("div",{children:[i("p",{class:rt(Dr,r?_r:jr),children:t}),i("p",{class:Lr,children:o})]})]})};var Ir=B`
  to { transform: rotate(360deg); }
`,to=p`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  border-radius: ${L.pill};
  border: none;
  background: ${u.background};
  color: ${u.backgroundDark};
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
    outline: 2px solid ${u.background};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,Pr=p`
  transition: transform 300ms ease;
  ${to}:hover & {
    transform: translateX(4px);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,Mr=p`
  width: 20px;
  height: 20px;
  border: 2px solid ${u.backgroundDark};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${Ir} 0.8s linear infinite;
`,Br=()=>i("svg",{class:Pr,width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("line",{x1:"5",y1:"12",x2:"19",y2:"12"}),i("polyline",{points:"12 5 19 12 12 19"})]}),oo=({onClick:e,loading:t})=>i("button",{class:to,onClick:e,disabled:t,type:"button","aria-label":"Entrar na plataforma",children:["Entrar na plataforma",t?i("div",{class:Mr,"aria-hidden":"true"}):i(Br,{})]});var Nr=p`
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${h.satoshi};
  font-size: 13px;
  color: rgba(242, 226, 196, 0.5);
  letter-spacing: 0.5px;
`,ro=()=>i("footer",{class:Nr,children:"ACDG \u2014 Assist\xEAncia e Cuidado em Desenvolvimento e Gest\xE3o"});var Fr=p`
  ${ae}
  background: ${u.backgroundDark};
`,Ur=p`
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
`,no=({alert:e,onLogin:t,loading:o})=>i("main",{class:Fr,"aria-label":"P\xE1gina de login",children:[i(Yt,{}),i("div",{class:Ur,children:[i(Xt,{}),i(Zt,{}),i(Jt,{}),e?i(eo,{type:e.type,title:e.title,description:e.description}):null,i(oo,{onClick:t,loading:o})]}),i(ro,{})]});var Hr=B`
  to { transform: rotate(360deg); }
`,zr=p`
  width: 32px;
  height: 32px;
  border: 3px solid ${u.inputLine};
  border-top-color: ${u.primary};
  border-radius: 50%;
  animation: ${Hr} 0.8s linear infinite;
`,io=()=>i("div",{class:zr});var Vr=p`
  ${ae}
  background: ${u.background};
  gap: 24px;
`,Gr=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${u.textMuted};
  margin: 0;
`,Kr=(e,t)=>{switch(e){case"authenticating":return"Autenticando...";case"loading-permissions":return"Carregando m\xF3dulos...";case"entering-app":return`Entrando em ${t??""}...`}},nt=({context:e,appName:t})=>i("div",{class:Vr,role:"status","aria-live":"polite","aria-busy":"true",children:[i(io,{}),i("p",{class:Gr,children:Kr(e,t)})]});var Wr=p`
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
`,qr=p`
  display: flex;
  align-items: center;
  gap: 10px;
`,Yr=p`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${u.backgroundDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${h.satoshi};
  font-size: 18px;
  font-weight: ${g.bold};
  color: ${u.textOnDark};
`,Xr=p`
  font-family: ${h.satoshi};
  font-size: 18px;
  font-weight: ${g.bold};
  color: ${u.textPrimary};
`,Zr=p`
  display: flex;
  align-items: center;
  gap: 12px;
`,Jr=p`
  display: none;
  text-align: right;
  @media (min-width: ${G.mobile}px) {
    display: block;
  }
`,Qr=p`
  font-family: ${h.satoshi};
  font-size: 14px;
  font-weight: ${g.medium};
  color: ${u.textPrimary};
  margin: 0;
`,en=p`
  font-family: ${h.satoshi};
  font-size: 12px;
  color: ${u.textMuted};
  margin: 0;
`,tn=p`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${u.backgroundDark};
  color: ${u.textOnDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${h.satoshi};
  font-size: 16px;
  font-weight: ${g.semibold};
`,on=p`
  background: none;
  border: 1px solid ${u.inputLine};
  padding: 8px 18px;
  border-radius: ${L.pill};
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${g.semibold};
  color: ${u.textMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${u.danger};
    color: ${u.danger};
  }
  &:focus-visible {
    outline: 2px solid ${u.primary};
    outline-offset: 2px;
  }
`,so=({user:e,onLogout:t})=>i("header",{class:Wr,children:[i("div",{class:qr,children:[i("div",{class:Yr,children:"A"}),i("span",{class:Xr,children:"ACDG"})]}),i("div",{class:Zr,children:[i("div",{class:Jr,children:[i("p",{class:Qr,children:e.name}),i("p",{class:en,children:e.role})]}),i("div",{class:tn,"aria-hidden":"true",children:e.initials}),i("button",{class:on,onClick:t,"aria-label":"Sair da plataforma",children:"Sair"})]})]});var rn=p`
  text-align: center;
  margin-bottom: 48px;
  animation: ${k} 600ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,nn=p`
  font-family: ${h.satoshi};
  font-size: 24px;
  font-weight: ${g.bold};
  color: ${u.textPrimary};
  margin: 0 0 8px;
  @media (min-width: ${G.mobile}px) {
    font-size: 32px;
  }
`,sn=p`
  font-family: ${h.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${u.textMuted};
  margin: 0;
`,ao=({greeting:e,subtitle:t})=>i("div",{class:rn,children:[i("h1",{class:nn,children:e}),i("p",{class:sn,children:t})]});var an=p`
  width: 100%;
  max-width: 720px;
  margin-bottom: 40px;
  animation: ${k} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,ln=p`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${g.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${u.textMuted};
  margin: 0 0 12px;
`,cn=p`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: ${u.backgroundDark};
  border-radius: ${L.card};
  cursor: pointer;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }
  &:hover [data-arrow] {
    transform: translateX(4px);
    color: ${u.textOnDark};
  }
  &:focus-visible {
    outline: 2px solid ${u.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,pn=p`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,fn=p`
  flex: 1;
  min-width: 0;
`,dn=p`
  font-family: ${h.satoshi};
  font-size: 16px;
  font-weight: ${g.semibold};
  color: ${u.textOnDark};
  margin: 0 0 4px;
`,un=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: rgba(242, 226, 196, 0.75);
  margin: 0;
  line-height: 1.5;
`,mn=p`
  font-size: 20px;
  color: rgba(242, 226, 196, 0.6);
  flex-shrink: 0;
  transition: transform 200ms ease, color 200ms ease;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`,xn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},lo=({app:e,onClick:t})=>i("div",{class:an,children:[i("p",{class:ln,children:$.lastUsedLabel}),i("div",{class:cn,role:"button",tabindex:0,"aria-label":`${e.name}: ${e.description}`,onClick:t,onKeyDown:xn(t),children:[i("div",{class:pn,style:{background:I(e.color,.15)},"aria-hidden":"true",children:i("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("div",{class:fn,children:[i("h3",{class:dn,children:e.name}),i("p",{class:un,children:e.description})]}),i("span",{class:mn,"data-arrow":!0,"aria-hidden":"true",children:"\u2192"})]})]});var hn=p`
  position: relative;
  background: ${u.surface};
  border-radius: ${L.card};
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
    border-color: ${u.inputLine};
  }
  &:hover [data-accent] {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid ${u.primary};
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
`,gn=p`
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`,yn=p`
  font-family: ${h.satoshi};
  font-size: 15px;
  font-weight: ${g.bold};
  color: ${u.textPrimary};
  margin: 0 0 6px;
`,bn=p`
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${u.textMuted};
  margin: 0;
  line-height: 1.5;
`,Sn=e=>t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e())},co=({app:e,index:t,onClick:o})=>{let r=350+t*70;return i("article",{class:hn,style:{animation:`${k} 500ms ease ${r}ms both`},role:"button",tabindex:0,"aria-label":`Abrir ${e.name}`,onClick:o,onKeyDown:Sn(o),children:[i("div",{class:gn,style:{background:I(e.color,.12)},"aria-hidden":"true",children:i("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:i("circle",{cx:"12",cy:"12",r:"8",stroke:e.color,"stroke-width":"1.5"})})}),i("h3",{class:yn,children:e.name}),i("p",{class:bn,children:e.description}),i("div",{"data-accent":!0,style:{position:"absolute",top:0,left:0,right:0,height:"3px",background:e.color,opacity:.5,transition:"opacity 200ms ease",borderRadius:`${L.card} ${L.card} 0 0`},"aria-hidden":"true"})]})};var wn=p`
  width: 100%;
  max-width: 720px;
`,En=p`
  font-family: ${h.satoshi};
  font-size: 10px;
  font-weight: ${g.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${u.textMuted};
  margin: 0 0 16px;
  animation: ${k} 600ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,kn=p`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  @media (min-width: ${G.mobile}px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`,po=({apps:e,label:t,onSelectApp:o})=>i("nav",{class:wn,"aria-label":"M\xF3dulos dispon\xEDveis",children:[i("p",{class:En,children:t}),i("div",{class:kn,children:e.map((r,n)=>i(co,{app:r,index:n,onClick:()=>o(r.id)},r.id))})]});var Cn=p`
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
  background: ${I(u.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,An=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${u.textPrimary};
  margin: 0 0 8px;
`,vn=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${u.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,Tn=p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${L.pill};
  border: none;
  background: ${u.primary};
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
    outline: 2px solid ${u.primary};
    outline-offset: 2px;
  }
`,_n=p`
  display: block;
  margin: 12px auto 0;
  background: none;
  border: 1px solid ${u.inputLine};
  padding: 10px 24px;
  border-radius: ${L.pill};
  font-family: ${h.satoshi};
  font-size: 13px;
  font-weight: ${g.semibold};
  color: ${u.textMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${u.textPrimary};
    color: ${u.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${u.primary};
    outline-offset: 2px;
  }
`,jn=`mailto:${$.emptyContactEmail}?subject=${encodeURIComponent($.emptyContactSubject)}`,fo=({onLogout:e})=>i("div",{class:Cn,children:[i("div",{class:$n,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:u.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),i("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]})}),i("h2",{class:An,children:$.emptyTitle}),i("p",{class:vn,children:$.emptyDesc}),i("a",{class:Tn,href:jn,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"2",y:"4",width:"20",height:"16",rx:"2"}),i("path",{d:"M22 4L12 13 2 4"})]}),$.emptyContactAdmin]}),i("button",{class:_n,onClick:e,children:$.emptyBackToStart})]});var Dn=p`
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
  background: ${I(u.danger,.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`,Rn=p`
  font-family: ${h.satoshi};
  font-size: 20px;
  font-weight: ${g.bold};
  color: ${u.textPrimary};
  margin: 0 0 8px;
`,On=p`
  font-family: ${h.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${u.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`,In=p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${L.pill};
  border: none;
  background: ${u.primary};
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
    outline: 2px solid ${u.primary};
    outline-offset: 2px;
  }
`,uo=({onRetry:e})=>i("div",{class:Dn,children:[i("div",{class:Ln,"aria-hidden":"true",children:i("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:u.danger,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",children:[i("line",{x1:"1",y1:"1",x2:"23",y2:"23"}),i("path",{d:"M16.72 11.06A10.94 10.94 0 0 1 19 12.55"}),i("path",{d:"M5 12.55a10.94 10.94 0 0 1 5.17-2.39"}),i("path",{d:"M10.71 5.05A16 16 0 0 1 22.56 9"}),i("path",{d:"M1.42 9a15.91 15.91 0 0 1 4.7-2.88"}),i("path",{d:"M8.53 16.11a6 6 0 0 1 6.95 0"}),i("line",{x1:"12",y1:"20",x2:"12.01",y2:"20"})]})}),i("h2",{class:Rn,children:$.networkErrorTitle}),i("p",{class:On,children:$.networkErrorDesc}),i("button",{class:In,onClick:e,children:[i("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("polyline",{points:"23 4 23 10 17 10"}),i("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),$.networkErrorRetry]})]});var Pn=p`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${u.background};
`,Mn=p`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  @media (min-width: ${G.mobile}px) {
    padding: 48px;
  }
`,mo=({state:e,onSelectApp:t,onLogout:o,onRetry:r})=>{let{user:n,apps:s,lastUsedAppId:a,error:c}=e;if(!n)return null;let f=a!==null&&s.length>1?s.find(x=>x.id===a)??null:null,d=c?.type==="network",m=s.length>0,l=Bt(n.firstName);return i("div",{class:Pn,children:[i(so,{user:n,onLogout:o}),i("main",{class:Mn,children:[i(ao,{greeting:l,subtitle:$.hubSubtitle}),d?i(uo,{onRetry:r}):m?i(ne,{children:[f?i(lo,{app:f,onClick:()=>t(f.id)}):null,i(po,{apps:s,label:$.allModulesLabel(s.length),onSelectApp:t})]}):i(fo,{onLogout:o})]})]})};var Bn=p`
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
`,xo=({color:e})=>i("div",{class:Bn,style:{background:I(e,.12)},children:i("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:e,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",children:[i("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2"}),i("path",{d:"M9 3v18"}),i("path",{d:"M14 9l3 3-3 3"})]})});var Nn=p`
  width: 200px;
  height: 4px;
  background: ${u.inputLine};
  border-radius: 2px;
  overflow: hidden;
  animation: ${k} 500ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Fn=p`
  height: 100%;
  background: ${u.primary};
  border-radius: 2px;
  animation: ${Wt} 2s ease-in-out 400ms both;
  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    animation: none;
  }
`,ho=()=>i("div",{class:Nn,role:"progressbar","aria-valuemin":0,"aria-valuemax":100,children:i("div",{class:Fn})});var Un=p`
  background: none;
  border: none;
  padding: 0;
  font-family: ${h.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${g.light};
  color: ${u.textMuted};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  animation: ${k} 500ms ease 400ms both;
  &:hover {
    color: ${u.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${u.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,go=({onClick:e})=>i("button",{class:Un,onClick:e,type:"button",children:"N\xE3o \xE9 o que esperava? Voltar"});var Hn=p`
  ${ae}
  background: ${u.background};
  gap: 20px;
  text-align: center;
`,zn=p`
  font-family: ${h.satoshi};
  font-size: 22px;
  font-weight: ${g.bold};
  color: ${u.textPrimary};
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
  color: ${u.textMuted};
  margin: 0;
  animation: ${k} 500ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,yo=({app:e,onCancel:t})=>i("div",{class:Hn,role:"status","aria-live":"polite",children:[i(xo,{color:e.color}),i("h2",{class:zn,children:`Entrando em ${e.name}...`}),i("p",{class:Vn,children:"Voc\xEA tem acesso a um m\xF3dulo. Redirecionando automaticamente."}),i(ho,{}),i(go,{onClick:t})]});var bo=async e=>{try{let t=await fetch("/api/v1/me",{credentials:"same-origin",headers:{"X-Requested-With":"XMLHttpRequest"}});if(t.status===401){e({type:"NO_SESSION"});return}if(!t.ok){e({type:"LOAD_PERMISSIONS_FAILURE"});return}let o=await t.json(),r=o.data??o;e({type:"AUTH_CALLBACK_SUCCESS",user:{name:r.name,firstName:r.firstName,initials:r.initials,role:r.role},apps:r.apps,lastUsedAppId:r.lastUsedAppId??null})}catch{e({type:"LOAD_PERMISSIONS_FAILURE"})}},So=()=>{let[e,t]=Ze(Pt,Oe);Je(()=>{let f=new URLSearchParams(globalThis.location.search);if(f.get("error")){t({type:"AUTH_CALLBACK_FAILURE",title:$.authErrorTitle,message:$.authErrorDesc});return}if(f.get("reason")==="session_expired"){t({type:"SESSION_EXPIRED"});return}t({type:"INIT_SESSION_CHECK"}),bo(t)},[]);let o=()=>{globalThis.location.href="/auth/login"},r=()=>{globalThis.location.href="/auth/logout"},n=()=>{t({type:"NO_SESSION"})},s=f=>{t({type:"SELECT_APP",appId:f});let d=e.apps.find(m=>m.id===f);d&&setTimeout(()=>{globalThis.location.href=d.route},1500)},a=()=>{t({type:"LOAD_PERMISSIONS_START"}),bo(t)},c=e.error?{type:e.error.type==="session"?"warning":"error",title:e.error.title,description:e.error.message}:null;switch(e.screen){case"landing":return i(no,{alert:c,onLogin:o});case"loading":{let f=e.lastUsedAppId?e.apps.find(d=>d.id===e.lastUsedAppId):null;return i(nt,{context:e.loadingContext??"authenticating",appName:f?.name})}case"hub":return i(mo,{state:e,onSelectApp:s,onLogout:r,onRetry:a});case"redirect":{let f=Mt(e);return f?i(yo,{app:f,onCancel:n}):i(nt,{context:"authenticating"})}}};var wo=document.getElementById("auth-hub-app");wo&&We(i(So,{}),wo);
