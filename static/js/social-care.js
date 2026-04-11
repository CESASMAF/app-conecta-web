var pn=Object.defineProperty;var dn=(e,t)=>{for(var n in t)pn(e,n,{get:t[n],enumerable:!0})};var mn={Stringify:1,BeforeStream:2,Stream:3},R=(e,t)=>{let n=new String(e);return n.isEscaped=!0,n.callbacks=t,n},hn=/[&<>'"]/,Se=async(e,t)=>{let n="";t||=[];let r=await Promise.all(e);for(let o=r.length-1;n+=r[o],o--,!(o<0);o--){let s=r[o];typeof s=="object"&&t.push(...s.callbacks||[]);let i=s.isEscaped;if(s=await(typeof s=="object"?s.toString():s),typeof s=="object"&&t.push(...s.callbacks||[]),s.isEscaped??i)n+=s;else{let l=[n];M(s,l),n=l[0]}}return R(n,t)},M=(e,t)=>{let n=e.search(hn);if(n===-1){t[0]+=e;return}let r,o,s=0;for(o=n;o<e.length;o++){switch(e.charCodeAt(o)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(s,o)+r,s=o+1}t[0]+=e.substring(s,o)},Me=e=>{let t=e.callbacks;if(!t?.length)return e;let n=[e],r={};return t.forEach(o=>o({phase:mn.Stringify,buffer:n,context:r})),n[0]};var W=Symbol("RENDERER"),X=Symbol("ERROR_HANDLER"),b=Symbol("STASH"),be=Symbol("INTERNAL"),Ee=Symbol("MEMO"),Y=Symbol("PERMALINK");var Ne=e=>(e[be]=!0,e);var Fe=e=>({value:t,children:n})=>{if(!n)return;let r={children:[{tag:Ne(()=>{e.push(t)}),props:{}}]};Array.isArray(n)?r.children.push(...n.flat()):r.children.push(n),r.children.push({tag:Ne(()=>{e.pop()}),props:{}});let o={tag:"",props:r,type:""};return o[X]=s=>{throw e.pop(),s},o},ne=e=>{let t=[e],n=Fe(t);return n.values=t,n.Provider=n,N.push(n),n};var N=[],rt=e=>{let t=[e],n=r=>{t.push(r.value);let o;try{o=r.children?(Array.isArray(r.children)?new oe("",{},r.children):r.children).toString():""}catch(s){throw t.pop(),s}return o instanceof Promise?o.finally(()=>t.pop()).then(s=>R(s,s.callbacks)):(t.pop(),R(o))};return n.values=t,n.Provider=n,n[W]=Fe(t),N.push(n),n},P=e=>e.values.at(-1);var J={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},re={},F="data-precedence",Ce=e=>e.rel==="stylesheet"&&"precedence"in e,we=(e,t)=>e==="link"?t:J[e].length>0;var ae={};dn(ae,{button:()=>wn,form:()=>En,input:()=>Cn,link:()=>Sn,meta:()=>bn,script:()=>yn,style:()=>gn,title:()=>xn});var K=e=>Array.isArray(e)?e:[e];var st=new WeakMap,it=(e,t,n,r)=>({buffer:o,context:s})=>{if(!o)return;let i=st.get(s)||{};st.set(s,i);let l=i[e]||=[],u=!1,f=J[e],p=we(e,r!==void 0);if(p){e:for(let[,a]of l)if(!(e==="link"&&!(a.rel==="stylesheet"&&a[F]!==void 0))){for(let m of f)if((a?.[m]??null)===n?.[m]){u=!0;break e}}}if(u?o[0]=o[0].replaceAll(t,""):p||e==="link"?l.push([t,n,r]):l.unshift([t,n,r]),o[0].indexOf("</head>")!==-1){let a;if(e==="link"||r!==void 0){let m=[];a=l.map(([x,,g],A)=>{if(g===void 0)return[x,Number.MAX_SAFE_INTEGER,A];let D=m.indexOf(g);return D===-1&&(m.push(g),D=m.length-1),[x,D,A]}).sort((x,g)=>x[1]-g[1]||x[2]-g[2]).map(([x])=>x)}else a=l.map(([m])=>m);a.forEach(m=>{o[0]=o[0].replaceAll(m,"")}),o[0]=o[0].replace(/(?=<\/head>)/,a.join(""))}},se=(e,t,n)=>R(new O(e,n,K(t??[])).toString()),ie=(e,t,n,r)=>{if("itemProp"in n)return se(e,t,n);let{precedence:o,blocking:s,...i}=n;o=r?o??"":void 0,r&&(i[F]=o);let l=new O(e,i,K(t||[])).toString();return l instanceof Promise?l.then(u=>R(l,[...u.callbacks||[],it(e,u,i,o)])):R(l,[it(e,l,i,o)])},xn=({children:e,...t})=>{let n=ke();if(n){let r=P(n);if(r==="svg"||r==="head")return new O("title",t,K(e??[]))}return ie("title",e,t,!1)},yn=({children:e,...t})=>{let n=ke();return["src","async"].some(r=>!t[r])||n&&P(n)==="head"?se("script",e,t):ie("script",e,t,!1)},gn=({children:e,...t})=>["href","precedence"].every(n=>n in t)?(t["data-href"]=t.href,delete t.href,ie("style",e,t,!0)):se("style",e,t),Sn=({children:e,...t})=>["onLoad","onError"].some(n=>n in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?se("link",e,t):ie("link",e,t,Ce(t)),bn=({children:e,...t})=>{let n=ke();return n&&P(n)==="head"?se("meta",e,t):ie("meta",e,t,!1)},at=(e,{children:t,...n})=>new O(e,n,K(t??[])),En=e=>(typeof e.action=="function"&&(e.action=Y in e.action?e.action[Y]:void 0),at("form",e)),lt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=Y in t.formAction?t.formAction[Y]:void 0),at(e,t)),Cn=e=>lt("input",e),wn=e=>lt("button",e);var kn=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),Q=e=>kn.get(e)||e,le=(e,t)=>{for(let[n,r]of Object.entries(e)){let o=n[0]==="-"||!/[A-Z]/.test(n)?n:n.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);t(o,r==null?null:typeof r=="number"?o.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}};var fe,ke=()=>fe,vn=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,An=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Rn=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],Be=(e,t)=>{for(let n=0,r=e.length;n<r;n++){let o=e[n];if(typeof o=="string")M(o,t);else{if(typeof o=="boolean"||o===null||o===void 0)continue;o instanceof O?o.toStringToBuffer(t):typeof o=="number"||o.isEscaped?t[0]+=o:o instanceof Promise?t.unshift("",o):Be(o,t)}}},O=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,n,r){this.tag=t,this.props=n,this.children=r}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([n,r])=>{n.values.push(r)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([n])=>{n.values.pop()})}return t.length===1?"callbacks"in t?Me(R(t[0],t.callbacks)).toString():t[0]:Se(t,t.callbacks)}toStringToBuffer(t){let n=this.tag,r=this.props,{children:o}=this;t[0]+=`<${n}`;let s=fe&&P(fe)==="svg"?i=>vn(Q(i)):i=>Q(i);for(let[i,l]of Object.entries(r))if(i=s(i),i!=="children"){if(i==="style"&&typeof l=="object"){let u="";le(l,(f,p)=>{p!=null&&(u+=`${u?";":""}${f}:${p}`)}),t[0]+=' style="',M(u,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${i}="`,M(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${i}="${l}"`;else if(typeof l=="boolean"&&Rn.includes(i))l&&(t[0]+=` ${i}=""`);else if(i==="dangerouslySetInnerHTML"){if(o.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");o=[R(l.__html)]}else if(l instanceof Promise)t[0]+=` ${i}="`,t.unshift('"',l);else if(typeof l=="function"){if(!i.startsWith("on")&&i!=="ref")throw new Error(`Invalid prop '${i}' of type 'function' supplied to '${n}'.`)}else t[0]+=` ${i}="`,M(l.toString(),t),t[0]+='"'}if(An.includes(n)&&o.length===0){t[0]+="/>";return}t[0]+=">",Be(o,t),t[0]+=`</${n}>`}},ce=class extends O{toStringToBuffer(t){let{children:n}=this,r={...this.props};n.length&&(r.children=n.length===1?n[0]:n);let o=this.tag.call(null,r);if(!(typeof o=="boolean"||o==null))if(o instanceof Promise)if(N.length===0)t.unshift("",o);else{let s=N.map(i=>[i,i.values.at(-1)]);t.unshift("",o.then(i=>(i instanceof O&&(i.localContexts=s),i)))}else o instanceof O?o.toStringToBuffer(t):typeof o=="number"||o.isEscaped?(t[0]+=o,o.callbacks&&(t.callbacks||=[],t.callbacks.push(...o.callbacks))):M(o,t)}},oe=class extends O{toStringToBuffer(t){Be(this.children,t)}};var ct=!1,ve=(e,t,n)=>{if(!ct){for(let r in re)ae[r][W]=re[r];ct=!0}return typeof e=="function"?new ce(e,t,n):ae[e]?new ce(ae[e],t,n):e==="svg"||e==="head"?(fe||=rt(""),new O(e,t,[new ce(fe,{value:e},n)])):new O(e,t,n)};var Ae=({children:e})=>new oe("",{children:e},Array.isArray(e)?e:e?[e]:[]);function c(e,t,n){let r;if(!t||!("children"in t))r=ve(e,t,[]);else{let o=t.children;r=Array.isArray(o)?ve(e,t,o):ve(e,t,[o])}return r.key=n,r}var pe="_hp",Tn={Change:"Input",DoubleClick:"DblClick"},Dn={svg:"2000/svg",math:"1998/Math/MathML"},q=[],He=new WeakMap,ee,xt=()=>ee,B=e=>"t"in e,Ve={onClick:["click",!1]},ft=e=>{if(!e.startsWith("on"))return;if(Ve[e])return Ve[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,n,r]=t;return Ve[e]=[(Tn[n]||n).toLowerCase(),!!r]}},ut=(e,t)=>ee&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,yt=e=>e==null||e===!1?null:e,$n=(e,t)=>{"value"in t&&(e.value=yt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},On=(e,t,n)=>{t||={};for(let r in t){let o=t[r];if(r!=="children"&&(!n||n[r]!==o)){r=Q(r);let s=ft(r);if(s){if(n?.[r]!==o&&(n&&e.removeEventListener(s[0],n[r],s[1]),o!=null)){if(typeof o!="function")throw new Error(`Event handler for "${r}" is not a function`);e.addEventListener(s[0],o,s[1])}}else if(r==="dangerouslySetInnerHTML"&&o)e.innerHTML=o.__html;else if(r==="ref"){let i;typeof o=="function"?i=o(e)||(()=>o(null)):o&&"current"in o&&(o.current=e,i=()=>o.current=null),He.set(e,i)}else if(r==="style"){let i=e.style;typeof o=="string"?i.cssText=o:(i.cssText="",o!=null&&le(o,i.setProperty.bind(i)))}else{if(r==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=yt(o),l==="TEXTAREA")){e.textContent=o;continue}}else(r==="checked"&&e.nodeName==="INPUT"||r==="selected"&&e.nodeName==="OPTION")&&(e[r]=o);let i=ut(e,r);o==null||o===!1?e.removeAttribute(i):o===!0?e.setAttribute(i,""):typeof o=="string"||typeof o=="number"?e.setAttribute(i,o):e.setAttribute(i,o.toString())}}}if(n)for(let r in n){let o=n[r];if(r!=="children"&&!(r in t)){r=Q(r);let s=ft(r);s?e.removeEventListener(s[0],o,s[1]):r==="ref"?He.get(e)?.():e.removeAttribute(ut(e,r))}}},_n=(e,t)=>{t[b][0]=0,q.push([e,t]);let n=t.tag[W]||t.tag,r=n.defaultProps?{...n.defaultProps,...t.props}:t.props;try{return[n.call(null,r)]}finally{q.pop()}},gt=(e,t,n,r,o)=>{e.vR?.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[b][1][De]?.forEach(s=>o.push(s)),e.vC.forEach(s=>{if(B(s))n.push(s);else if(typeof s.tag=="function"||s.tag===""){s.c=t;let i=n.length;if(gt(s,t,n,r,o),s.s){for(let l=i;l<n.length;l++)n[l].s=!0;s.s=!1}}else n.push(s),s.vR?.length&&(r.push(...s.vR),delete s.vR)})},Ln=e=>{for(;e&&(e.tag===pe||!e.e);)e=e.tag===pe||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},St=e=>{B(e)||(e[b]?.[1][De]?.forEach(t=>t[2]?.()),He.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(St)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(ue.delete(e),Re.delete(e),delete e[b][3],e.a=!0)},We=(e,t,n)=>{e.c=t,bt(e,t,n)},pt=(e,t)=>{if(t){for(let n=0,r=e.length;n<r;n++)if(e[n]===t)return n}},dt=Symbol(),bt=(e,t,n)=>{let r=[],o=[],s=[];gt(e,t,r,o,s),o.forEach(St);let i=n?void 0:t.childNodes,l,u=null;if(n)l=-1;else if(!i.length)l=0;else{let f=pt(i,Ln(e.nN));f!==void 0?(u=i[f],l=f):l=pt(i,r.find(p=>p.tag!==pe&&p.e)?.e)??-1,l===-1&&(n=!0)}for(let f=0,p=r.length;f<p;f++,l++){let a=r[f],m;if(a.s&&a.e)m=a.e,a.s=!1;else{let x=n||!a.e;B(a)?(a.e&&a.d&&(a.e.textContent=a.t),a.d=!1,m=a.e||=document.createTextNode(a.t)):(m=a.e||=a.n?document.createElementNS(a.n,a.tag):document.createElement(a.tag),On(m,a.props,a.pP),bt(a,m,x),a.tag==="select"&&$n(m,a.props))}a.tag===pe?l--:n?m.parentNode||t.appendChild(m):i[l]!==m&&i[l-1]!==m&&(i[l+1]===m?t.appendChild(i[l]):t.insertBefore(m,u||i[l]||null))}if(e.pP&&(e.pP=void 0),s.length){let f=[],p=[];s.forEach(([,a,,m,x])=>{a&&f.push(a),m&&p.push(m),x?.()}),f.forEach(a=>a()),p.length&&requestAnimationFrame(()=>{p.forEach(a=>a())})}},Pn=(e,t)=>!!(e&&e.length===t.length&&e.every((n,r)=>n[1]===t[r][1])),Re=new WeakMap,Te=(e,t,n)=>{let r=!n&&t.pC;n&&(t.pC||=t.vC);let o;try{n||=typeof t.tag=="function"?_n(e,t):K(t.props.children),n[0]?.tag===""&&n[0][X]&&(o=n[0][X],e[5].push([e,o,t]));let s=r?[...t.pC]:t.vC?[...t.vC]:void 0,i=[],l;for(let u=0;u<n.length;u++){if(Array.isArray(n[u])){n.splice(u,1,...n[u].flat(1/0)),u--;continue}let f=Et(n[u]);if(f){typeof f.tag=="function"&&!f.tag[be]&&(N.length>0&&(f[b][2]=N.map(a=>[a,a.values.at(-1)])),e[5]?.length&&(f[b][3]=e[5].at(-1)));let p;if(s&&s.length){let a=s.findIndex(B(f)?m=>B(m):f.key!==void 0?m=>m.key===f.key&&m.tag===f.tag:m=>m.tag===f.tag);a!==-1&&(p=s[a],s.splice(a,1))}if(p)if(B(f))p.t!==f.t&&(p.t=f.t,p.d=!0),f=p;else{let a=p.pP=p.props;if(p.props=f.props,p.f||=f.f||t.f,typeof f.tag=="function"){let m=p[b][2];p[b][2]=f[b][2]||[],p[b][3]=f[b][3],!p.f&&((p.o||p)===f.o||p.tag[Ee]?.(a,p.props))&&Pn(m,p[b][2])&&(p.s=!0)}f=p}else if(!B(f)&&ee){let a=P(ee);a&&(f.n=a)}if(!B(f)&&!f.s&&(Te(e,f),delete f.f),i.push(f),l&&!l.s&&!f.s)for(let a=l;a&&!B(a);a=a.vC?.at(-1))a.nN=f;l=f}}t.vR=r?[...t.vC,...s||[]]:s||[],t.vC=i,r&&delete t.pC}catch(s){if(t.f=!0,s===dt){if(o)return;throw s}let[i,l,u]=t[b]?.[3]||[];if(l){let f=()=>de([0,!1,e[2]],u),p=Re.get(u)||[];p.push(f),Re.set(u,p);let a=l(s,()=>{let m=Re.get(u);if(m){let x=m.indexOf(f);if(x!==-1)return m.splice(x,1),f()}});if(a){if(e[0]===1)e[1]=!0;else if(Te(e,u,[a]),(l.length===1||e!==i)&&u.c){We(u,u.c,!1);return}throw dt}}throw s}finally{o&&e[5].pop()}},Et=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[b]=[0,[]];else{let t=Dn[e.tag];t&&(ee||=ne(""),e.props.children=[{tag:ee,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Ct=(e,t,n)=>{e.c===t&&(e.c=n,e.vC.forEach(r=>Ct(r,t,n)))},mt=(e,t)=>{t[b][2]?.forEach(([n,r])=>{n.values.push(r)});try{Te(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[b][2]?.forEach(([n])=>{n.values.pop()}),(e[0]!==1||!e[1])&&We(t,t.c,!1)},ue=new WeakMap,ht=[],de=async(e,t)=>{e[5]||=[];let n=ue.get(t);n&&n[0](void 0);let r,o=new Promise(s=>r=s);if(ue.set(t,[r,()=>{e[2]?e[2](e,t,s=>{mt(s,t)}).then(()=>r(t)):(mt(e,t),r(t))}]),ht.length)ht.at(-1).add(t);else{await Promise.resolve();let s=ue.get(t);s&&(ue.delete(t),s[1]())}return o},jn=(e,t)=>{let n=[];n[5]=[],n[4]=!0,Te(n,e,void 0),n[4]=!1;let r=document.createDocumentFragment();We(e,r,!0),Ct(e,r,t),t.replaceChildren(r)},ze=(e,t)=>{jn(Et({tag:"",props:{children:e}}),t)};var Ue=(e,t,n)=>({tag:pe,props:{children:e},key:n,e:t,p:1});var In=0,De=1,Mn=2,Nn=3;var Ke=new WeakMap,qe=(e,t)=>!e||!t||e.length!==t.length||t.some((n,r)=>n!==e[r]);var Fn;var wt=[];var me=e=>{let t=()=>typeof e=="function"?e():e,n=q.at(-1);if(!n)return[t(),()=>{}];let[,r]=n,o=r[b][1][In]||=[],s=r[b][0]++;return o[s]||=[t(),i=>{let l=Fn,u=o[s];if(typeof i=="function"&&(i=i(u[0])),!Object.is(i,u[0]))if(u[0]=i,wt.length){let[f,p]=wt.at(-1);Promise.all([f===3?r:de([f,!1,l],r),p]).then(([a])=>{if(!a||!(f===2||f===3))return;let m=a.vC;requestAnimationFrame(()=>{setTimeout(()=>{m===a.vC&&de([f===3?1:0,!1,l],a)})})})}else de([0,!1,l],r)}]},Ge=(e,t,n)=>{let r=V(i=>{s(l=>e(l,i))},[e]),[o,s]=me(()=>n?n(t):t);return[o,r]},Bn=(e,t,n)=>{let r=q.at(-1);if(!r)return;let[,o]=r,s=o[b][1][De]||=[],i=o[b][0]++,[l,,u]=s[i]||=[];if(qe(l,n)){u&&u();let f=()=>{p[e]=void 0,p[2]=t()},p=[n,void 0,void 0,void 0,void 0];p[e]=f,s[i]=p}},$e=(e,t)=>Bn(3,e,t);var V=(e,t)=>{let n=q.at(-1);if(!n)return e;let[,r]=n,o=r[b][1][Mn]||=[],s=r[b][0]++,i=o[s];return qe(i?.[1],t)?o[s]=[e,t]:e=o[s][0],e};var Ze=e=>{let t=Ke.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(n=>Ke.set(e,[n]),n=>Ke.set(e,[void 0,n])),e},Xe=(e,t)=>{let n=q.at(-1);if(!n)return e();let[,r]=n,o=r[b][1][Nn]||=[],s=r[b][0]++,i=o[s];return qe(i?.[1],t)&&(o[s]=[e(),t]),o[s][0]};var vt=ne({pending:!1,data:null,method:null,action:null}),kt=new Set,At=e=>{kt.add(e),e.finally(()=>kt.delete(e))};var Ye=(e,t)=>Xe(()=>n=>{let r;e&&(typeof e=="function"?r=e(n)||(()=>{e(null)}):e&&"current"in e&&(e.current=n,r=()=>{e.current=null}));let o=t(n);return()=>{o?.(),r?.()}},[e]),Rt=Object.create(null),Tt=Object.create(null),he=(e,t,n,r,o)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let s=document.head,{onLoad:i,onError:l,precedence:u,blocking:f,...p}=t,a=null,m=!1,x=J[e],g=we(e,r),A=S=>S.getAttribute("rel")==="stylesheet"&&S.getAttribute(F)!==null,D;if(g){let S=s.querySelectorAll(e);e:for(let E of S)if(!(e==="link"&&!A(E))){for(let y of x)if(E.getAttribute(y)===t[y]){a=E;break e}}if(!a){let E=x.reduce((y,C)=>t[C]===void 0?y:`${y}-${C}-${t[C]}`,e);m=!Tt[E],a=Tt[E]||=(()=>{let y=document.createElement(e);for(let C of x)t[C]!==void 0&&y.setAttribute(C,t[C]);return t.rel&&y.setAttribute("rel",t.rel),y})()}}else D=s.querySelectorAll(e);u=r?u??"":void 0,r&&(p[F]=u);let z=V(S=>{if(g){if(e==="link"&&u!==void 0){let y=!1;for(let C of s.querySelectorAll(e)){let L=C.getAttribute(F);if(L===null){s.insertBefore(S,C);return}if(y&&L!==u){s.insertBefore(S,C);return}L===u&&(y=!0)}s.appendChild(S);return}let E=!1;for(let y of s.querySelectorAll(e)){if(E&&y.getAttribute(F)!==u){s.insertBefore(S,y);return}y.getAttribute(F)===u&&(E=!0)}s.appendChild(S)}else if(e==="link")s.contains(S)||s.appendChild(S);else if(D){let E=!1;for(let y of D)if(y===S){E=!0;break}E||s.insertBefore(S,s.contains(D[0])?D[0]:s.querySelector(e)),D=void 0}},[g,u,e]),Z=Ye(t.ref,S=>{let E=x[0];if(n===2&&(S.innerHTML=""),(m||D)&&z(S),!l&&!i||!E)return;let y=Rt[S.getAttribute(E)]||=new Promise((C,L)=>{S.addEventListener("load",C),S.addEventListener("error",L)});i&&(y=y.then(i)),l&&(y=y.catch(l)),y.catch(()=>{})});if(o&&f==="render"){let S=J[e][0];if(S&&t[S]){let E=t[S],y=Rt[E]||=new Promise((C,L)=>{z(a),a.addEventListener("load",C),a.addEventListener("error",L)});Ze(y)}}let $={tag:e,type:e,props:{...p,ref:Z},ref:Z};return $.p=n,a&&($.e=a),Ue($,s)},Vn=e=>{let t=xt();return(t&&P(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:he("title",e,void 0,!1,!1)},Hn=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:he("script",e,1,!1,!0),Wn=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,he("style",e,2,!0,!0)),zn=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:he("link",e,1,Ce(e),!0),Un=e=>he("meta",e,void 0,!1,!1),Dt=Symbol(),Kn=e=>{let{action:t,...n}=e;typeof t!="function"&&(n.action=t);let[r,o]=me([null,!1]),s=V(async f=>{let p=f.isTrusted?t:f.detail[Dt];if(typeof p!="function")return;f.preventDefault();let a=new FormData(f.target);o([a,!0]);let m=p(a);m instanceof Promise&&(At(m),await m),o([null,!0])},[]),i=Ye(e.ref,f=>(f.addEventListener("submit",s),()=>{f.removeEventListener("submit",s)})),[l,u]=r;return r[1]=!1,{tag:vt,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...n,ref:i},type:"form",ref:i}},f:u}},$t=(e,{formAction:t,...n})=>{if(typeof t=="function"){let r=V(o=>{o.preventDefault(),o.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Dt]:t}}))},[]);n.ref=Ye(n.ref,o=>(o.addEventListener("click",r),()=>{o.removeEventListener("click",r)}))}return{tag:e,props:n,type:e,ref:n.ref}},qn=e=>$t("input",e),Gn=e=>$t("button",e);Object.assign(re,{title:Vn,script:Hn,style:Wn,link:zn,meta:Un,form:Kn,input:qn,button:Gn});var G=":-hono-global",Xn=new RegExp(`^${G}{(.*)}$`),Oe="hono-css",H=Symbol(),k=Symbol(),_=Symbol(),j=Symbol(),_e=Symbol(),Lt=Symbol(),Ks=Symbol();var Pt=e=>{let t=0,n=11;for(;t<e.length;)n=101*n+e.charCodeAt(t++)>>>0;return"css-"+n},jt=e=>e.trim().replace(/\s+/g,"-"),It=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),Yn=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),Jn=e=>It(e)&&!Yn.has(e.toLowerCase()),Mt=e=>{console.warn(`Invalid slug: ${e}`)},Qn=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),eo=new RegExp(["("+Qn+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),to=e=>e.replace(eo,(t,n,r,o,s)=>n||r||o||s||""),Nt=(e,t)=>{let n=[],r=[],o=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",s="";for(let i=0,l=e.length;i<l;i++){s+=e[i];let u=t[i];if(!(typeof u=="boolean"||u===null||u===void 0)){Array.isArray(u)||(u=[u]);for(let f=0,p=u.length;f<p;f++){let a=u[f];if(!(typeof a=="boolean"||a===null||a===void 0))if(typeof a=="string")/([\\"'\/])/.test(a)?s+=a.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):s+=a;else if(typeof a=="number")s+=a;else if(a[Lt])s+=a[Lt];else if(a[k].startsWith("@keyframes "))n.push(a),s+=` ${a[k].substring(11)} `;else{if(e[i+1]?.match(/^\s*{/))n.push(a),a=`.${a[k]}`;else{n.push(...a[j]),r.push(...a[_e]),a=a[_];let m=a.length;if(m>0){let x=a[m-1];x!==";"&&x!=="}"&&(a+=";")}}s+=`${a||""}`}}}}return[o,to(s),n,r]},te=(e,t,n,r)=>{let[o,s,i,l]=Nt(e,t),u=Xn.exec(s);u&&(s=u[1]);let f=Pt(o+s),p;if(n){let x=n(f,jt(o),s);x&&(It(x)?p=x:(r||Mt)(x))}let a=(u?G:"")+(p||f),m=(u?i.map(x=>x[k]):[a,...l]).join(" ");return{[H]:a,[k]:m,[_]:s,[j]:i,[_e]:l}},Le=e=>{for(let t=0,n=e.length;t<n;t++){let r=e[t];typeof r=="string"&&(e[t]={[H]:"",[k]:"",[_]:"",[j]:[],[_e]:[r]})}return e},Pe=(e,t,n,r)=>{let[o,s]=Nt(e,t),i=Pt(o+s),l;if(n){let u=n(i,jt(o),s);u&&(Jn(u)?l=u:(r||Mt)(u))}return{[H]:"",[k]:`@keyframes ${l||i}`,[_]:s,[j]:[],[_e]:[]}},no=0,je=(e,t,n,r)=>{e||(e=[`/* h-v-t ${no++} */`]);let o=Array.isArray(e)?te(e,t,n,r):e,s=o[k],i=te(["view-transition-name:",""],[s],n,r);return o[k]=G+o[k],o[_]=o[_].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,s),i[k]=i[H]=s,i[j]=[...o[j],o],i};var ro=e=>{let t=[],n=0,r=0;for(let o=0,s=e.length;o<s;o++){let i=e[o];if(i==="'"||i==='"'){let l=i;for(o++;o<s;o++){if(e[o]==="\\"){o++;continue}if(e[o]===l)break}continue}if(i==="{"){r++;continue}if(i==="}"){r--,r===0&&(t.push(e.slice(n,o+1)),n=o+1);continue}}return t},Je=({id:e})=>{let t,n=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),r=(i,l)=>{let[u,f]=n();if(!u||!f){Promise.resolve().then(()=>{if(!n()[0])throw new Error("style sheet not found");r(i,l)});return}f.has(i)||(f.add(i),(i.startsWith(G)?ro(l):[`${i[0]==="@"?"":"."}${i}{${l}}`]).forEach(p=>{u.insertRule(p,u.cssRules.length)}))};return[{toString(){let i=this[H];return r(i,this[_]),this[j].forEach(({[k]:l,[_]:u})=>{r(l,u)}),this[k]}},({children:i,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:i&&(Array.isArray(i)?i:[i]).map(u=>u[_])}})]},so=({id:e,classNameSlug:t,onInvalidSlug:n})=>{let[r,o]=Je({id:e}),s=p=>(p.toString=r.toString,p),i=(p,...a)=>s(te(p,a,t,n));return{css:i,cx:(...p)=>(p=Le(p),i(Array(p.length).fill(""),...p)),keyframes:(p,...a)=>Pe(p,a,t,n),viewTransition:(p,...a)=>s(je(p,a,t,n)),Style:o}},xe=so({id:Oe}),Zs=xe.css,Xs=xe.cx,Ys=xe.keyframes,Js=xe.viewTransition,Qs=xe.Style;var io=({id:e,classNameSlug:t,onInvalidSlug:n})=>{let[r,o]=Je({id:e}),s=new WeakMap,i=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),u=g=>{let A=({buffer:$,context:S})=>{let[E,y]=s.get(S),C=Object.keys(E);if(!C.length)return;let L="";if(C.forEach(U=>{y[U]=!0,L+=U.startsWith(G)?E[U]:`${U[0]==="@"?"":"."}${U}{${E[U]}}`}),s.set(S,[{},y]),$&&l.test($[0])){$[0]=$[0].replace(l,(U,fn,un)=>`${fn}${L}${un}`);return}let nt=i.get(S),ot=`<script${nt?` nonce="${nt}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(L)}<\/script>`;if($){$[0]=`${ot}${$[0]}`;return}return Promise.resolve(ot)},D=({context:$})=>{s.has($)||s.set($,[{},{}]);let[S,E]=s.get($),y=!0;if(E[g[H]]||(y=!1,S[g[H]]=g[_]),g[j].forEach(({[k]:C,[_]:L})=>{E[C]||(y=!1,S[C]=L)}),!y)return Promise.resolve(R("",[A]))},z=new String(g[k]);Object.assign(z,g),z.isEscaped=!0,z.callbacks=[D];let Z=Promise.resolve(z);return Object.assign(Z,g),Z.toString=r.toString,Z},f=(g,...A)=>u(te(g,A,t,n)),p=(...g)=>(g=Le(g),f(Array(g.length).fill(""),...g)),a=(g,...A)=>Pe(g,A,t,n),m=(g,...A)=>u(je(g,A,t,n)),x=({children:g,nonce:A}={})=>R(`<style id="${e}"${A?` nonce="${A}"`:""}>${g?g[_]:""}</style>`,[({context:D})=>{i.set(D,A)}]);return x[W]=o,{css:f,cx:p,keyframes:a,viewTransition:m,Style:x}},ye=io({id:Oe}),d=ye.css,ii=ye.cx,ai=ye.keyframes,li=ye.viewTransition,ci=ye.Style;var Ft=(e,t)=>{switch(t.type){case"LOAD_START":return{...e,loading:!0};case"LOAD_SUCCESS":return{...e,loading:!1,families:t.families};case"LOAD_FAILURE":return{...e,loading:!1};case"SET_SEARCH":return{...e,searchQuery:t.query};case"SELECT_PATIENT":return t.id===e.selectedPatientId&&e.panelVisible?{...e,panelVisible:!1}:{...e,selectedPatientId:t.id,panelVisible:!0,panelView:"dados",patientDetail:null,fichas:[],detailLoading:!0};case"DETAIL_START":return{...e,detailLoading:!0};case"DETAIL_SUCCESS":return{...e,detailLoading:!1,patientDetail:t.detail,fichas:t.fichas};case"DETAIL_FAILURE":return{...e,detailLoading:!1};case"CLOSE_PANEL":return{...e,panelVisible:!1};case"SHOW_FICHAS":return{...e,panelView:"fichas"};case"SHOW_DADOS":return{...e,panelView:"dados"};case"SET_TAB":return{...e,activeTab:t.tab}}},Bt=(e,t)=>{let n=t.trim();if(n==="")return e;let r=n.toLowerCase();return e.filter(o=>[o.firstName,o.lastName,o.fullName].some(s=>s?.toLowerCase().includes(r)))};var Vt={families:[],searchQuery:"",selectedPatientId:null,panelVisible:!1,panelView:"dados",patientDetail:null,fichas:[],loading:!1,detailLoading:!1,activeTab:"familias"};var Qe={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Ht=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},ao=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},Wt=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:Qe});return Ht(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},zt=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:Qe});return ao(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Ut=async(e,t)=>{try{let n=await fetch(e,{method:"POST",credentials:"same-origin",headers:Qe,body:JSON.stringify(t)});return Ht(n)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var et={search:(e,t=20,n)=>{let r=new URLSearchParams;return e&&r.set("search",e),n&&r.set("cursor",n),r.set("limit",String(t)),zt(`/api/v1/patients?${r.toString()}`)},getById:e=>Wt(`/api/v1/patients/${e}`),create:e=>Ut("/api/v1/patients",e)};var h={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",primary:"#4F8448",danger:"#A6290D",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},Ie=(e,t)=>{let n=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16);return`rgba(${n}, ${r}, ${o}, ${t})`},w={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},v={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"},T={1:"4px",2:"8px",3:"16px",4:"24px",5:"32px",6:"40px",7:"48px",8:"56px",9:"64px",10:"72px"},gi={button:d`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:d`box-shadow: -8px 0 40px ${Ie(h.textPrimary,.3)};`,fab:d`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:d`box-shadow: 0 24px 80px ${h.inputLine};`,modal:d`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},tt={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var lo=d`
  display: flex;
  align-items: baseline;
  gap: ${T[4]};
  padding: ${T[3]} 0;
  font-family: ${w.satoshi};
`,Kt=d`
  font-size: 14px;
  font-weight: ${v.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: ${T[1]} 0;
  border-bottom: 2px solid transparent;
  color: ${h.textMuted};
  transition: color 250ms ease, border-color 250ms ease;
  &:hover { color: ${h.textPrimary}; }
`,qt=d`
  color: ${h.textPrimary};
  border-bottom-color: ${h.textPrimary};
`,co=d`
  font-size: 14px;
  font-weight: ${v.bold};
  color: ${h.textMuted};
  margin-left: auto;
`,Gt=({activeTab:e,familyCount:t,onTabChange:n})=>c("nav",{class:lo,children:[c("button",{class:`${Kt} ${e==="familias"?qt:""}`,onClick:()=>n("familias"),type:"button",children:"Familias"}),c("button",{class:`${Kt} ${e==="cadastro"?qt:""}`,onClick:()=>n("cadastro"),type:"button",children:"Cadastro"}),c("span",{class:co,children:[t," familias cadastradas"]})]});var fo=d`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`,uo=d`
  border: none;
  border-bottom: 1px solid ${h.inputLine};
  padding: 8px 32px 8px 28px;
  font-family: ${w.satoshi};
  font-size: 18px;
  color: ${h.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${h.textPrimary}; }
  &::placeholder {
    color: ${h.textMuted};
    font-family: ${w.playfair};
    font-style: italic;
    font-weight: 300;
  }
`,po=d`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.5;
  pointer-events: none;
`,mo=d`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: ${T[1]};
  color: ${h.textMuted};
  font-size: 18px;
  line-height: 1;
  &:hover { color: ${h.textPrimary}; }
`,Zt=({query:e,onSearch:t,onClear:n})=>c("div",{class:fo,children:[c("svg",{class:po,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2",children:[c("circle",{cx:"11",cy:"11",r:"8"}),c("path",{d:"m21 21-4.3-4.3"})]}),c("input",{class:uo,type:"text",placeholder:"Buscar paciente...",value:e,onInput:r=>t(r.target.value)}),e.length>0&&c("button",{class:mo,onClick:n,type:"button","aria-label":"Limpar busca",children:"\xD7"})]});var ho=d`
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  transition: color 250ms ease;
  color: ${h.textPrimary};
  font-family: ${w.satoshi};
`,xo=d`
  color: ${h.textMuted};
`,yo=d`
  font-size: 40px;
  font-weight: ${v.regular};
  transition: font-weight 250ms ease;
  line-height: 1.1;
`,go=d`
  font-weight: ${v.bold};
`,So=d`
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
  pointer-events: none;
  font-size: 16px;
  font-weight: ${v.medium};
  white-space: nowrap;
`,bo=d`
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
`,Xt=({lastName:e,firstName:t,memberCount:n,isSelected:r,isOtherSelected:o,onSelect:s})=>{let i=r;return c("div",{class:`${ho} ${o&&!r?xo:""}`,onClick:s,"data-selected":String(r),"data-expanded":String(i),children:[c("span",{class:`${yo} ${r?go:""}`,children:e}),c("span",{class:`${So} ${i?bo:""}`,children:[t," \xB7 ",n," membros"]})]})};var Eo=d`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
`,Yt=({families:e,selectedId:t,onSelect:n})=>c("div",{class:Eo,"data-has-selection":String(t!==null),children:e.map(r=>c(Xt,{lastName:r.lastName??"\u2014",firstName:r.firstName??"",memberCount:r.memberCount,isSelected:r.patientId===t,isOtherSelected:t!==null&&r.patientId!==t,onSelect:()=>n(r.patientId)},r.patientId))});var Co=d`
  display: flex;
  flex-direction: column;
  padding: ${T[5]};
  gap: ${T[4]};
  overflow-y: auto;
  height: 100%;
`,wo=d`
  font-family: ${w.satoshi};
  font-size: 48px;
  font-weight: ${v.bold};
  color: ${h.textOnDark};
  margin: 0;
`,ko=d`
  display: flex;
  align-items: center;
  justify-content: space-between;
`,ge=d`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${h.borderOnDark};
  background: transparent;
  color: ${h.textOnDark};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 200ms ease, border-color 200ms ease;
  &:hover { background: rgba(242, 226, 196, 0.1); }
`,vo=d`
  ${ge}
  &:hover { background: rgba(166, 41, 13, 0.2); }
`,Jt=d`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,Qt=d`
  font-family: ${w.satoshi};
  font-size: 11px;
  font-weight: ${v.bold};
  color: rgba(242, 226, 196, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,en=d`
  font-family: ${w.satoshi};
  font-size: 16px;
  font-weight: ${v.medium};
  color: ${h.textOnDark};
`,Ao=d`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${T[3]};
`,Ro=d`
  display: flex;
  gap: ${T[2]};
  margin-top: auto;
`,I=({label:e,value:t})=>c("div",{class:Jt,children:[c("span",{class:Qt,children:e}),c("span",{class:en,children:t??"\u2014"})]}),tn=({detail:e,onShowFichas:t,onEdit:n,onClose:r})=>{let o=e.personalData,s=e.civilDocuments,i=e.address;return c("div",{class:Co,children:[c("div",{class:ko,children:[c("h2",{class:wo,children:"Dados"}),c("div",{style:{display:"flex",gap:"8px"},children:[c("button",{class:ge,onClick:t,type:"button","aria-label":"Ver fichas",children:c("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2",children:[c("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),c("polyline",{points:"14 2 14 8 20 8"})]})}),c("button",{class:ge,onClick:n,type:"button","aria-label":"Editar",children:c("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2",children:[c("path",{d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"}),c("path",{d:"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"})]})}),c("button",{class:`${ge} ${vo}`,onClick:r,type:"button","aria-label":"Fechar",children:"\xD7"})]})]}),c("div",{class:Ao,children:[c(I,{label:"Nome",value:o?.firstName??null}),c(I,{label:"Sobrenome",value:o?.lastName??null}),c(I,{label:"Nome da mae",value:o?.motherName??null}),c(I,{label:"Data de nascimento",value:o?.birthDate??null}),c(I,{label:"Sexo",value:o?.sex??null}),c(I,{label:"Telefone",value:o?.phone??null}),c(I,{label:"CPF",value:s?.cpf??null}),c(I,{label:"NIS",value:s?.nis??null}),c(I,{label:"Cidade",value:i?.city??null}),c(I,{label:"Estado",value:i?.state??null})]}),e.diagnoses.length>0&&c("div",{class:Jt,children:[c("span",{class:Qt,children:"Diagnosticos"}),e.diagnoses.map((l,u)=>c("span",{class:en,children:[l.icdCode," \u2014 ",l.description]},u))]}),c("div",{class:Ro,children:c("button",{class:ge,onClick:t,type:"button",children:"Ver fichas"})})]})};var To=d`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  transition: opacity 150ms ease;
  font-family: ${w.satoshi};
  font-size: 16px;
  font-weight: ${v.medium};
  color: ${h.textOnDark};
  &:hover { opacity: 1 !important; }
`,Do=d`
  opacity: 0.9;
`,$o=d`
  opacity: 0.5;
`,Oo=d`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`,_o=d`
  background: ${h.primary};
`,Lo=d`
  background: ${h.textMuted};
`,nn=({name:e,filled:t,onFichaClick:n})=>c("div",{class:`${To} ${t?Do:$o}`,onClick:n,"data-filled":String(t),children:[c("span",{class:`${Oo} ${t?_o:Lo}`}),c("span",{children:e})]});var Po=d`
  display: flex;
  flex-direction: column;
  padding: ${T[5]};
  gap: ${T[4]};
  overflow-y: auto;
  height: 100%;
`,jo=d`
  display: flex;
  align-items: center;
  justify-content: space-between;
`,Io=d`
  font-family: ${w.satoshi};
  font-size: 48px;
  font-weight: ${v.bold};
  color: ${h.textOnDark};
  margin: 0;
`,Mo=d`
  font-family: ${w.playfair};
  font-size: 15px;
  font-weight: 300;
  font-style: italic;
  color: rgba(242, 226, 196, 0.7);
`,on=d`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${h.borderOnDark};
  background: transparent;
  color: ${h.textOnDark};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 200ms ease;
  &:hover { background: rgba(242, 226, 196, 0.1); }
`,No=d`
  &:hover { background: rgba(166, 41, 13, 0.2); }
`,Fo=d`
  display: flex;
  flex-direction: column;
`,rn=({lastName:e,fichas:t,filledCount:n,onBack:r,onClose:o,onFichaClick:s})=>c("div",{class:Po,children:[c("div",{class:jo,children:[c("div",{children:[c("h2",{class:Io,children:"Fichas"}),c("span",{class:Mo,children:[e," \xB7 ",n,"/",t.length," preenchidas"]})]}),c("div",{style:{display:"flex",gap:"8px"},children:[c("button",{class:on,onClick:r,type:"button","aria-label":"Voltar",children:c("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2",children:c("polyline",{points:"15 18 9 12 15 6"})})}),c("button",{class:`${on} ${No}`,onClick:o,type:"button","aria-label":"Fechar",children:"\xD7"})]})]}),c("div",{class:Fo,children:t.map((i,l)=>c(nn,{name:i.name,filled:i.filled,onFichaClick:()=>s(i.route)},l))})]});var Bo=d`
  position: fixed;
  inset: 0;
  background: ${Ie(h.textPrimary,.05)};
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;
  z-index: 90;
`,Vo=d`
  opacity: 1;
  pointer-events: auto;
`,Ho=d`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: min(56vw, 720px);
  background: ${h.backgroundDark};
  border-radius: ${tt.panel} 0 0 ${tt.panel};
  transform: translateX(100%);
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: -8px 0 40px ${Ie(h.textPrimary,.3)};
  overflow: hidden;
`,Wo=d`
  transform: translateX(0);
`,sn=({visible:e,view:t,detail:n,fichas:r,onClose:o,onShowFichas:s,onShowDados:i})=>{let l=r.filter(p=>p.filled).length,u=n?.personalData?.lastName??"\u2014",f=p=>{p&&(globalThis.location.href=p)};return c(Ae,{children:[c("div",{class:`${Bo} ${e?Vo:""}`,onClick:o}),c("aside",{class:`${Ho} ${e?Wo:""}`,children:[n&&t==="dados"&&c(tn,{detail:n,onShowFichas:s,onEdit:()=>{},onClose:o}),n&&t==="fichas"&&c(rn,{lastName:u,fichas:r,filledCount:l,onBack:i,onClose:o,onFichaClick:f})]})]})};var zo=d`
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${h.primary};
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${w.satoshi};
  font-size: 28px;
  font-weight: ${v.bold};
  box-shadow: 0 4px 24px rgba(79, 132, 72, 0.35);
  transition: transform 200ms ease, box-shadow 200ms ease;
  z-index: 80;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 32px rgba(79, 132, 72, 0.45);
  }
`,an=()=>c("button",{class:zo,onClick:()=>{globalThis.location.href="/patient-registration"},type:"button","aria-label":"Novo cadastro",children:"+"});var Uo=d`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 48px;
  background: ${h.background};
`,Ko=d`
  max-width: 420px;
  padding: ${T[2]} 0;
`,qo=e=>[{name:"Composicao familiar",filled:e.familyMembers.length>0,route:`/family-composition/${e.patientId}`},{name:"Acesso a beneficios eventuais",filled:e.socialIdentity!=null,route:null},{name:"Condicoes de saude da familia",filled:e.healthStatus!=null,route:null},{name:"Convivencia familiar e comunitaria",filled:e.communitySupportNetwork!=null,route:null},{name:"Condicoes educacionais da familia",filled:e.educationalStatus!=null,route:null},{name:"Situacoes de violencia e violacao de direitos",filled:e.violationReports.length>0,route:null},{name:"Condicoes de trabalho e rendimento da familia",filled:e.workAndIncome!=null,route:null},{name:"Especificidades sociais, etnicas ou culturais",filled:e.socioeconomicSituation!=null,route:null},{name:"Forma de ingresso e motivo do primeiro atendimento",filled:e.intakeInfo!=null,route:null},{name:"Condicoes habitacionais da familia",filled:e.housingCondition!=null,route:null}],Go=e=>({patientId:e.patientId,personId:e.personId,personalData:e.personalData?{firstName:e.personalData.firstName,lastName:e.personalData.lastName,motherName:e.personalData.motherName??"",nationality:"",sex:"",birthDate:e.personalData.birthDate??"",phone:e.personalData.phone??null,socialName:null}:null,civilDocuments:e.civilDocuments?{cpf:e.civilDocuments.cpf??null,nis:null}:null,address:e.address?{street:e.address.street??null,city:e.address.city??null,state:e.address.state??null,cep:e.address.cep??null}:null,diagnoses:e.diagnoses.map(t=>({icdCode:t.icdCode??"",description:t.description,date:""})),familyMembers:e.familyMembers.map(t=>({personId:t.memberId,relationship:t.relationship,birthDate:""}))}),ln=()=>{let[e,t]=Ge(Ft,Vt);$e(()=>{t({type:"LOAD_START"}),et.search().then(o=>{o.ok?t({type:"LOAD_SUCCESS",families:o.value.data}):t({type:"LOAD_FAILURE"})})},[]),$e(()=>{let o=s=>{s.key==="Escape"&&e.panelVisible&&t({type:"CLOSE_PANEL"})};return globalThis.addEventListener("keydown",o),()=>globalThis.removeEventListener("keydown",o)},[e.panelVisible]);let n=V(o=>{t({type:"SELECT_PATIENT",id:o}),et.getById(o).then(s=>{if(s.ok){let i=qo(s.value),l=Go(s.value);t({type:"DETAIL_SUCCESS",detail:l,fichas:i})}else t({type:"DETAIL_FAILURE"})})},[]),r=Bt(e.families,e.searchQuery);return c("main",{class:Uo,children:[c(Gt,{activeTab:e.activeTab,familyCount:e.families.length,onTabChange:o=>t({type:"SET_TAB",tab:o})}),c("div",{class:Ko,children:c(Zt,{query:e.searchQuery,onSearch:o=>t({type:"SET_SEARCH",query:o}),onClear:()=>t({type:"SET_SEARCH",query:""})})}),c(Yt,{families:r,selectedId:e.selectedPatientId,onSelect:n}),c(sn,{visible:e.panelVisible,view:e.panelView,detail:e.patientDetail,fichas:e.fichas,onClose:()=>t({type:"CLOSE_PANEL"}),onShowFichas:()=>t({type:"SHOW_FICHAS"}),onShowDados:()=>t({type:"SHOW_DADOS"})}),c(an,{})]})};var cn=document.getElementById("social-care-app");cn&&ze(c(ln,{}),cn);
