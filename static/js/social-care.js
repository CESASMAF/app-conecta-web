var hr=Object.defineProperty;var xr=(e,t)=>{for(var r in t)hr(e,r,{get:t[r],enumerable:!0})};var gr={Stringify:1,BeforeStream:2,Stream:3},A=(e,t)=>{let r=new String(e);return r.isEscaped=!0,r.callbacks=t,r},yr=/[&<>'"]/,we=async(e,t)=>{let r="";t||=[];let o=await Promise.all(e);for(let n=o.length-1;r+=o[n],n--,!(n<0);n--){let i=o[n];typeof i=="object"&&t.push(...i.callbacks||[]);let s=i.isEscaped;if(i=await(typeof i=="object"?i.toString():i),typeof i=="object"&&t.push(...i.callbacks||[]),i.isEscaped??s)r+=i;else{let l=[r];I(i,l),r=l[0]}}return A(r,t)},I=(e,t)=>{let r=e.search(yr);if(r===-1){t[0]+=e;return}let o,n,i=0;for(n=r;n<e.length;n++){switch(e.charCodeAt(n)){case 34:o="&quot;";break;case 39:o="&#39;";break;case 38:o="&amp;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t[0]+=e.substring(i,n)+o,i=n+1}t[0]+=e.substring(i,n)},Me=e=>{let t=e.callbacks;if(!t?.length)return e;let r=[e],o={};return t.forEach(n=>n({phase:gr.Stringify,buffer:r,context:o})),r[0]};var V=Symbol("RENDERER"),Z=Symbol("ERROR_HANDLER"),w=Symbol("STASH"),Ee=Symbol("INTERNAL"),ve=Symbol("MEMO"),J=Symbol("PERMALINK");var Fe=e=>(e[Ee]=!0,e);var Be=e=>({value:t,children:r})=>{if(!r)return;let o={children:[{tag:Fe(()=>{e.push(t)}),props:{}}]};Array.isArray(r)?o.children.push(...r.flat()):o.children.push(r),o.children.push({tag:Fe(()=>{e.pop()}),props:{}});let n={tag:"",props:o,type:""};return n[Z]=i=>{throw e.pop(),i},n},ne=e=>{let t=[e],r=Be(t);return r.values=t,r.Provider=r,N.push(r),r};var N=[],lt=e=>{let t=[e],r=o=>{t.push(o.value);let n;try{n=o.children?(Array.isArray(o.children)?new oe("",{},o.children):o.children).toString():""}catch(i){throw t.pop(),i}return n instanceof Promise?n.finally(()=>t.pop()).then(i=>A(i,i.callbacks)):(t.pop(),A(n))};return r.values=t,r.Provider=r,r[V]=Be(t),N.push(r),r},L=e=>e.values.at(-1);var Q={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},ie={},M="data-precedence",$e=e=>e.rel==="stylesheet"&&"precedence"in e,ke=(e,t)=>e==="link"?t:Q[e].length>0;var le={};xr(le,{button:()=>Cr,form:()=>$r,input:()=>kr,link:()=>Er,meta:()=>vr,script:()=>Sr,style:()=>wr,title:()=>br});var q=e=>Array.isArray(e)?e:[e];var ct=new WeakMap,ft=(e,t,r,o)=>({buffer:n,context:i})=>{if(!n)return;let s=ct.get(i)||{};ct.set(i,s);let l=s[e]||=[],p=!1,d=Q[e],u=ke(e,o!==void 0);if(u){e:for(let[,c]of l)if(!(e==="link"&&!(c.rel==="stylesheet"&&c[M]!==void 0))){for(let h of d)if((c?.[h]??null)===r?.[h]){p=!0;break e}}}if(p?n[0]=n[0].replaceAll(t,""):u||e==="link"?l.push([t,r,o]):l.unshift([t,r,o]),n[0].indexOf("</head>")!==-1){let c;if(e==="link"||o!==void 0){let h=[];c=l.map(([x,,y],C)=>{if(y===void 0)return[x,Number.MAX_SAFE_INTEGER,C];let D=h.indexOf(y);return D===-1&&(h.push(y),D=h.length-1),[x,D,C]}).sort((x,y)=>x[1]-y[1]||x[2]-y[2]).map(([x])=>x)}else c=l.map(([h])=>h);c.forEach(h=>{n[0]=n[0].replaceAll(h,"")}),n[0]=n[0].replace(/(?=<\/head>)/,c.join(""))}},se=(e,t,r)=>A(new R(e,r,q(t??[])).toString()),ae=(e,t,r,o)=>{if("itemProp"in r)return se(e,t,r);let{precedence:n,blocking:i,...s}=r;n=o?n??"":void 0,o&&(s[M]=n);let l=new R(e,s,q(t||[])).toString();return l instanceof Promise?l.then(p=>A(l,[...p.callbacks||[],ft(e,p,s,n)])):A(l,[ft(e,l,s,n)])},br=({children:e,...t})=>{let r=Ce();if(r){let o=L(r);if(o==="svg"||o==="head")return new R("title",t,q(e??[]))}return ae("title",e,t,!1)},Sr=({children:e,...t})=>{let r=Ce();return["src","async"].some(o=>!t[o])||r&&L(r)==="head"?se("script",e,t):ae("script",e,t,!1)},wr=({children:e,...t})=>["href","precedence"].every(r=>r in t)?(t["data-href"]=t.href,delete t.href,ae("style",e,t,!0)):se("style",e,t),Er=({children:e,...t})=>["onLoad","onError"].some(r=>r in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?se("link",e,t):ae("link",e,t,$e(t)),vr=({children:e,...t})=>{let r=Ce();return r&&L(r)==="head"?se("meta",e,t):ae("meta",e,t,!1)},dt=(e,{children:t,...r})=>new R(e,r,q(t??[])),$r=e=>(typeof e.action=="function"&&(e.action=J in e.action?e.action[J]:void 0),dt("form",e)),pt=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=J in t.formAction?t.formAction[J]:void 0),dt(e,t)),kr=e=>pt("input",e),Cr=e=>pt("button",e);var Ar=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),ee=e=>Ar.get(e)||e,ce=(e,t)=>{for(let[r,o]of Object.entries(e)){let n=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,i=>`-${i.toLowerCase()}`);t(n,o==null?null:typeof o=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${o}`:`${o}px`:o)}};var de,Ce=()=>de,Dr=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Tr=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Rr=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],ze=(e,t)=>{for(let r=0,o=e.length;r<o;r++){let n=e[r];if(typeof n=="string")I(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof R?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):ze(n,t)}}},R=class{tag;props;key;children;isEscaped=!0;localContexts;constructor(t,r,o){this.tag=t,this.props=r,this.children=o}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){let t=[""];this.localContexts?.forEach(([r,o])=>{r.values.push(o)});try{this.toStringToBuffer(t)}finally{this.localContexts?.forEach(([r])=>{r.values.pop()})}return t.length===1?"callbacks"in t?Me(A(t[0],t.callbacks)).toString():t[0]:we(t,t.callbacks)}toStringToBuffer(t){let r=this.tag,o=this.props,{children:n}=this;t[0]+=`<${r}`;let i=de&&L(de)==="svg"?s=>Dr(ee(s)):s=>ee(s);for(let[s,l]of Object.entries(o))if(s=i(s),s!=="children"){if(s==="style"&&typeof l=="object"){let p="";ce(l,(d,u)=>{u!=null&&(p+=`${p?";":""}${d}:${u}`)}),t[0]+=' style="',I(p,t),t[0]+='"'}else if(typeof l=="string")t[0]+=` ${s}="`,I(l,t),t[0]+='"';else if(l!=null)if(typeof l=="number"||l.isEscaped)t[0]+=` ${s}="${l}"`;else if(typeof l=="boolean"&&Rr.includes(s))l&&(t[0]+=` ${s}=""`);else if(s==="dangerouslySetInnerHTML"){if(n.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");n=[A(l.__html)]}else if(l instanceof Promise)t[0]+=` ${s}="`,t.unshift('"',l);else if(typeof l=="function"){if(!s.startsWith("on")&&s!=="ref")throw new Error(`Invalid prop '${s}' of type 'function' supplied to '${r}'.`)}else t[0]+=` ${s}="`,I(l.toString(),t),t[0]+='"'}if(Tr.includes(r)&&n.length===0){t[0]+="/>";return}t[0]+=">",ze(n,t),t[0]+=`</${r}>`}},fe=class extends R{toStringToBuffer(t){let{children:r}=this,o={...this.props};r.length&&(o.children=r.length===1?r[0]:r);let n=this.tag.call(null,o);if(!(typeof n=="boolean"||n==null))if(n instanceof Promise)if(N.length===0)t.unshift("",n);else{let i=N.map(s=>[s,s.values.at(-1)]);t.unshift("",n.then(s=>(s instanceof R&&(s.localContexts=i),s)))}else n instanceof R?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?(t[0]+=n,n.callbacks&&(t.callbacks||=[],t.callbacks.push(...n.callbacks))):I(n,t)}},oe=class extends R{toStringToBuffer(t){ze(this.children,t)}};var mt=!1,Ae=(e,t,r)=>{if(!mt){for(let o in ie)le[o][V]=ie[o];mt=!0}return typeof e=="function"?new fe(e,t,r):le[e]?new fe(le[e],t,r):e==="svg"||e==="head"?(de||=lt(""),new R(e,t,[new fe(de,{value:e},r)])):new R(e,t,r)};var De=({children:e})=>new oe("",{children:e},Array.isArray(e)?e:e?[e]:[]);function a(e,t,r){let o;if(!t||!("children"in t))o=Ae(e,t,[]);else{let n=t.children;o=Array.isArray(n)?Ae(e,t,n):Ae(e,t,[n])}return o.key=r,o}var me="_hp",Or={Change:"Input",DoubleClick:"DblClick"},_r={svg:"2000/svg",math:"1998/Math/MathML"},X=[],Ve=new WeakMap,te,St=()=>te,F=e=>"t"in e,He={onClick:["click",!1]},ut=e=>{if(!e.startsWith("on"))return;if(He[e])return He[e];let t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){let[,r,o]=t;return He[e]=[(Or[r]||r).toLowerCase(),!!o]}},ht=(e,t)=>te&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,wt=e=>e==null||e===!1?null:e,Lr=(e,t)=>{"value"in t&&(e.value=wt(t.value),!e.multiple&&e.selectedIndex===-1&&(e.selectedIndex=0))},Pr=(e,t,r)=>{t||={};for(let o in t){let n=t[o];if(o!=="children"&&(!r||r[o]!==n)){o=ee(o);let i=ut(o);if(i){if(r?.[o]!==n&&(r&&e.removeEventListener(i[0],r[o],i[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${o}" is not a function`);e.addEventListener(i[0],n,i[1])}}else if(o==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(o==="ref"){let s;typeof n=="function"?s=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,s=()=>n.current=null),Ve.set(e,s)}else if(o==="style"){let s=e.style;typeof n=="string"?s.cssText=n:(s.cssText="",n!=null&&ce(n,s.setProperty.bind(s)))}else{if(o==="value"){let l=e.nodeName;if(l==="SELECT")continue;if((l==="INPUT"||l==="TEXTAREA")&&(e.value=wt(n),l==="TEXTAREA")){e.textContent=n;continue}}else(o==="checked"&&e.nodeName==="INPUT"||o==="selected"&&e.nodeName==="OPTION")&&(e[o]=n);let s=ht(e,o);n==null||n===!1?e.removeAttribute(s):n===!0?e.setAttribute(s,""):typeof n=="string"||typeof n=="number"?e.setAttribute(s,n):e.setAttribute(s,n.toString())}}}if(r)for(let o in r){let n=r[o];if(o!=="children"&&!(o in t)){o=ee(o);let i=ut(o);i?e.removeEventListener(i[0],n,i[1]):o==="ref"?Ve.get(e)?.():e.removeAttribute(ht(e,o))}}},jr=(e,t)=>{t[w][0]=0,X.push([e,t]);let r=t.tag[V]||t.tag,o=r.defaultProps?{...r.defaultProps,...t.props}:t.props;try{return[r.call(null,o)]}finally{X.pop()}},Et=(e,t,r,o,n)=>{e.vR?.length&&(o.push(...e.vR),delete e.vR),typeof e.tag=="function"&&e[w][1][Oe]?.forEach(i=>n.push(i)),e.vC.forEach(i=>{if(F(i))r.push(i);else if(typeof i.tag=="function"||i.tag===""){i.c=t;let s=r.length;if(Et(i,t,r,o,n),i.s){for(let l=s;l<r.length;l++)r[l].s=!0;i.s=!1}}else r.push(i),i.vR?.length&&(o.push(...i.vR),delete i.vR)})},Ir=e=>{for(;e&&(e.tag===me||!e.e);)e=e.tag===me||!e.vC?.[0]?e.nN:e.vC[0];return e?.e},vt=e=>{F(e)||(e[w]?.[1][Oe]?.forEach(t=>t[2]?.()),Ve.get(e.e)?.(),e.p===2&&e.vC?.forEach(t=>t.p=2),e.vC?.forEach(vt)),e.p||(e.e?.remove(),delete e.e),typeof e.tag=="function"&&(pe.delete(e),Te.delete(e),delete e[w][3],e.a=!0)},We=(e,t,r)=>{e.c=t,$t(e,t,r)},xt=(e,t)=>{if(t){for(let r=0,o=e.length;r<o;r++)if(e[r]===t)return r}},gt=Symbol(),$t=(e,t,r)=>{let o=[],n=[],i=[];Et(e,t,o,n,i),n.forEach(vt);let s=r?void 0:t.childNodes,l,p=null;if(r)l=-1;else if(!s.length)l=0;else{let d=xt(s,Ir(e.nN));d!==void 0?(p=s[d],l=d):l=xt(s,o.find(u=>u.tag!==me&&u.e)?.e)??-1,l===-1&&(r=!0)}for(let d=0,u=o.length;d<u;d++,l++){let c=o[d],h;if(c.s&&c.e)h=c.e,c.s=!1;else{let x=r||!c.e;F(c)?(c.e&&c.d&&(c.e.textContent=c.t),c.d=!1,h=c.e||=document.createTextNode(c.t)):(h=c.e||=c.n?document.createElementNS(c.n,c.tag):document.createElement(c.tag),Pr(h,c.props,c.pP),$t(c,h,x),c.tag==="select"&&Lr(h,c.props))}c.tag===me?l--:r?h.parentNode||t.appendChild(h):s[l]!==h&&s[l-1]!==h&&(s[l+1]===h?t.appendChild(s[l]):t.insertBefore(h,p||s[l]||null))}if(e.pP&&(e.pP=void 0),i.length){let d=[],u=[];i.forEach(([,c,,h,x])=>{c&&d.push(c),h&&u.push(h),x?.()}),d.forEach(c=>c()),u.length&&requestAnimationFrame(()=>{u.forEach(c=>c())})}},Nr=(e,t)=>!!(e&&e.length===t.length&&e.every((r,o)=>r[1]===t[o][1])),Te=new WeakMap,Re=(e,t,r)=>{let o=!r&&t.pC;r&&(t.pC||=t.vC);let n;try{r||=typeof t.tag=="function"?jr(e,t):q(t.props.children),r[0]?.tag===""&&r[0][Z]&&(n=r[0][Z],e[5].push([e,n,t]));let i=o?[...t.pC]:t.vC?[...t.vC]:void 0,s=[],l;for(let p=0;p<r.length;p++){if(Array.isArray(r[p])){r.splice(p,1,...r[p].flat(1/0)),p--;continue}let d=kt(r[p]);if(d){typeof d.tag=="function"&&!d.tag[Ee]&&(N.length>0&&(d[w][2]=N.map(c=>[c,c.values.at(-1)])),e[5]?.length&&(d[w][3]=e[5].at(-1)));let u;if(i&&i.length){let c=i.findIndex(F(d)?h=>F(h):d.key!==void 0?h=>h.key===d.key&&h.tag===d.tag:h=>h.tag===d.tag);c!==-1&&(u=i[c],i.splice(c,1))}if(u)if(F(d))u.t!==d.t&&(u.t=d.t,u.d=!0),d=u;else{let c=u.pP=u.props;if(u.props=d.props,u.f||=d.f||t.f,typeof d.tag=="function"){let h=u[w][2];u[w][2]=d[w][2]||[],u[w][3]=d[w][3],!u.f&&((u.o||u)===d.o||u.tag[ve]?.(c,u.props))&&Nr(h,u[w][2])&&(u.s=!0)}d=u}else if(!F(d)&&te){let c=L(te);c&&(d.n=c)}if(!F(d)&&!d.s&&(Re(e,d),delete d.f),s.push(d),l&&!l.s&&!d.s)for(let c=l;c&&!F(c);c=c.vC?.at(-1))c.nN=d;l=d}}t.vR=o?[...t.vC,...i||[]]:i||[],t.vC=s,o&&delete t.pC}catch(i){if(t.f=!0,i===gt){if(n)return;throw i}let[s,l,p]=t[w]?.[3]||[];if(l){let d=()=>ue([0,!1,e[2]],p),u=Te.get(p)||[];u.push(d),Te.set(p,u);let c=l(i,()=>{let h=Te.get(p);if(h){let x=h.indexOf(d);if(x!==-1)return h.splice(x,1),d()}});if(c){if(e[0]===1)e[1]=!0;else if(Re(e,p,[c]),(l.length===1||e!==s)&&p.c){We(p,p.c,!1);return}throw gt}}throw i}finally{n&&e[5].pop()}},kt=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[w]=[0,[]];else{let t=_r[e.tag];t&&(te||=ne(""),e.props.children=[{tag:te,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Ct=(e,t,r)=>{e.c===t&&(e.c=r,e.vC.forEach(o=>Ct(o,t,r)))},yt=(e,t)=>{t[w][2]?.forEach(([r,o])=>{r.values.push(o)});try{Re(e,t,void 0)}catch{return}if(t.a){delete t.a;return}t[w][2]?.forEach(([r])=>{r.values.pop()}),(e[0]!==1||!e[1])&&We(t,t.c,!1)},pe=new WeakMap,bt=[],ue=async(e,t)=>{e[5]||=[];let r=pe.get(t);r&&r[0](void 0);let o,n=new Promise(i=>o=i);if(pe.set(t,[o,()=>{e[2]?e[2](e,t,i=>{yt(i,t)}).then(()=>o(t)):(yt(e,t),o(t))}]),bt.length)bt.at(-1).add(t);else{await Promise.resolve();let i=pe.get(t);i&&(pe.delete(t),i[1]())}return n},Mr=(e,t)=>{let r=[];r[5]=[],r[4]=!0,Re(r,e,void 0),r[4]=!1;let o=document.createDocumentFragment();We(e,o,!0),Ct(e,o,t),t.replaceChildren(o)},Ke=(e,t)=>{Mr(kt({tag:"",props:{children:e}}),t)};var Ue=(e,t,r)=>({tag:me,props:{children:e},key:r,e:t,p:1});var Fr=0,Oe=1,Br=2,zr=3;var qe=new WeakMap,Xe=(e,t)=>!e||!t||e.length!==t.length||t.some((r,o)=>r!==e[o]);var Hr;var At=[];var he=e=>{let t=()=>typeof e=="function"?e():e,r=X.at(-1);if(!r)return[t(),()=>{}];let[,o]=r,n=o[w][1][Fr]||=[],i=o[w][0]++;return n[i]||=[t(),s=>{let l=Hr,p=n[i];if(typeof s=="function"&&(s=s(p[0])),!Object.is(s,p[0]))if(p[0]=s,At.length){let[d,u]=At.at(-1);Promise.all([d===3?o:ue([d,!1,l],o),u]).then(([c])=>{if(!c||!(d===2||d===3))return;let h=c.vC;requestAnimationFrame(()=>{setTimeout(()=>{h===c.vC&&ue([d===3?1:0,!1,l],c)})})})}else ue([0,!1,l],o)}]},Ye=(e,t,r)=>{let o=B(s=>{i(l=>e(l,s))},[e]),[n,i]=he(()=>r?r(t):t);return[n,o]},Vr=(e,t,r)=>{let o=X.at(-1);if(!o)return;let[,n]=o,i=n[w][1][Oe]||=[],s=n[w][0]++,[l,,p]=i[s]||=[];if(Xe(l,r)){p&&p();let d=()=>{u[e]=void 0,u[2]=t()},u=[r,void 0,void 0,void 0,void 0];u[e]=d,i[s]=u}},_e=(e,t)=>Vr(3,e,t);var B=(e,t)=>{let r=X.at(-1);if(!r)return e;let[,o]=r,n=o[w][1][Br]||=[],i=o[w][0]++,s=n[i];return Xe(s?.[1],t)?n[i]=[e,t]:e=n[i][0],e};var Ge=e=>{let t=qe.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(r=>qe.set(e,[r]),r=>qe.set(e,[void 0,r])),e},Ze=(e,t)=>{let r=X.at(-1);if(!r)return e();let[,o]=r,n=o[w][1][zr]||=[],i=o[w][0]++,s=n[i];return Xe(s?.[1],t)&&(n[i]=[e(),t]),n[i][0]};var Tt=ne({pending:!1,data:null,method:null,action:null}),Dt=new Set,Rt=e=>{Dt.add(e),e.finally(()=>Dt.delete(e))};var Je=(e,t)=>Ze(()=>r=>{let o;e&&(typeof e=="function"?o=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,o=()=>{e.current=null}));let n=t(r);return()=>{n?.(),o?.()}},[e]),Ot=Object.create(null),_t=Object.create(null),xe=(e,t,r,o,n)=>{if(t?.itemProp)return{tag:e,props:t,type:e,ref:t.ref};let i=document.head,{onLoad:s,onError:l,precedence:p,blocking:d,...u}=t,c=null,h=!1,x=Q[e],y=ke(e,o),C=b=>b.getAttribute("rel")==="stylesheet"&&b.getAttribute(M)!==null,D;if(y){let b=i.querySelectorAll(e);e:for(let v of b)if(!(e==="link"&&!C(v))){for(let g of x)if(v.getAttribute(g)===t[g]){c=v;break e}}if(!c){let v=x.reduce((g,$)=>t[$]===void 0?g:`${g}-${$}-${t[$]}`,e);h=!_t[v],c=_t[v]||=(()=>{let g=document.createElement(e);for(let $ of x)t[$]!==void 0&&g.setAttribute($,t[$]);return t.rel&&g.setAttribute("rel",t.rel),g})()}}else D=i.querySelectorAll(e);p=o?p??"":void 0,o&&(u[M]=p);let K=B(b=>{if(y){if(e==="link"&&p!==void 0){let g=!1;for(let $ of i.querySelectorAll(e)){let _=$.getAttribute(M);if(_===null){i.insertBefore(b,$);return}if(g&&_!==p){i.insertBefore(b,$);return}_===p&&(g=!0)}i.appendChild(b);return}let v=!1;for(let g of i.querySelectorAll(e)){if(v&&g.getAttribute(M)!==p){i.insertBefore(b,g);return}g.getAttribute(M)===p&&(v=!0)}i.appendChild(b)}else if(e==="link")i.contains(b)||i.appendChild(b);else if(D){let v=!1;for(let g of D)if(g===b){v=!0;break}v||i.insertBefore(b,i.contains(D[0])?D[0]:i.querySelector(e)),D=void 0}},[y,p,e]),G=Je(t.ref,b=>{let v=x[0];if(r===2&&(b.innerHTML=""),(h||D)&&K(b),!l&&!s||!v)return;let g=Ot[b.getAttribute(v)]||=new Promise(($,_)=>{b.addEventListener("load",$),b.addEventListener("error",_)});s&&(g=g.then(s)),l&&(g=g.catch(l)),g.catch(()=>{})});if(n&&d==="render"){let b=Q[e][0];if(b&&t[b]){let v=t[b],g=Ot[v]||=new Promise(($,_)=>{K(c),c.addEventListener("load",$),c.addEventListener("error",_)});Ge(g)}}let T={tag:e,type:e,props:{...u,ref:G},ref:G};return T.p=r,c&&(T.e=c),Ue(T,i)},Wr=e=>{let t=St();return(t&&L(t))?.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:xe("title",e,void 0,!1,!1)},Kr=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:xe("script",e,1,!1,!0),Ur=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,xe("style",e,2,!0,!0)),qr=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:xe("link",e,1,$e(e),!0),Xr=e=>xe("meta",e,void 0,!1,!1),Lt=Symbol(),Yr=e=>{let{action:t,...r}=e;typeof t!="function"&&(r.action=t);let[o,n]=he([null,!1]),i=B(async d=>{let u=d.isTrusted?t:d.detail[Lt];if(typeof u!="function")return;d.preventDefault();let c=new FormData(d.target);n([c,!0]);let h=u(c);h instanceof Promise&&(Rt(h),await h),n([null,!0])},[]),s=Je(e.ref,d=>(d.addEventListener("submit",i),()=>{d.removeEventListener("submit",i)})),[l,p]=o;return o[1]=!1,{tag:Tt,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...r,ref:s},type:"form",ref:s}},f:p}},Pt=(e,{formAction:t,...r})=>{if(typeof t=="function"){let o=B(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Lt]:t}}))},[]);r.ref=Je(r.ref,n=>(n.addEventListener("click",o),()=>{n.removeEventListener("click",o)}))}return{tag:e,props:r,type:e,ref:r.ref}},Gr=e=>Pt("input",e),Zr=e=>Pt("button",e);Object.assign(ie,{title:Wr,script:Kr,style:Ur,link:qr,meta:Xr,form:Yr,input:Gr,button:Zr});var Y=":-hono-global",Qr=new RegExp(`^${Y}{(.*)}$`),Le="hono-css",z=Symbol(),k=Symbol(),O=Symbol(),P=Symbol(),Pe=Symbol(),Nt=Symbol(),Xs=Symbol();var Mt=e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"css-"+r},Ft=e=>e.trim().replace(/\s+/g,"-"),Bt=e=>/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(e),en=new Set(["default","inherit","initial","none","revert","revert-layer","unset"]),tn=e=>Bt(e)&&!en.has(e.toLowerCase()),zt=e=>{console.warn(`Invalid slug: ${e}`)},rn=['"(?:(?:\\\\[\\s\\S]|[^"\\\\])*)"',"'(?:(?:\\\\[\\s\\S]|[^'\\\\])*)'"].join("|"),nn=new RegExp(["("+rn+")","(?:"+["^\\s+","\\/\\*.*?\\*\\/\\s*","\\/\\/.*\\n\\s*","\\s+$"].join("|")+")","\\s*;\\s*(}|$)\\s*","\\s*([{};:,])\\s*","(\\s)\\s+"].join("|"),"g"),on=e=>e.replace(nn,(t,r,o,n,i)=>r||o||n||i||""),Ht=(e,t)=>{let r=[],o=[],n=e[0].match(/^\s*\/\*(.*?)\*\//)?.[1]||"",i="";for(let s=0,l=e.length;s<l;s++){i+=e[s];let p=t[s];if(!(typeof p=="boolean"||p===null||p===void 0)){Array.isArray(p)||(p=[p]);for(let d=0,u=p.length;d<u;d++){let c=p[d];if(!(typeof c=="boolean"||c===null||c===void 0))if(typeof c=="string")/([\\"'\/])/.test(c)?i+=c.replace(/([\\"']|(?<=<)\/)/g,"\\$1"):i+=c;else if(typeof c=="number")i+=c;else if(c[Nt])i+=c[Nt];else if(c[k].startsWith("@keyframes "))r.push(c),i+=` ${c[k].substring(11)} `;else{if(e[s+1]?.match(/^\s*{/))r.push(c),c=`.${c[k]}`;else{r.push(...c[P]),o.push(...c[Pe]),c=c[O];let h=c.length;if(h>0){let x=c[h-1];x!==";"&&x!=="}"&&(c+=";")}}i+=`${c||""}`}}}}return[n,on(i),r,o]},re=(e,t,r,o)=>{let[n,i,s,l]=Ht(e,t),p=Qr.exec(i);p&&(i=p[1]);let d=Mt(n+i),u;if(r){let x=r(d,Ft(n),i);x&&(Bt(x)?u=x:(o||zt)(x))}let c=(p?Y:"")+(u||d),h=(p?s.map(x=>x[k]):[c,...l]).join(" ");return{[z]:c,[k]:h,[O]:i,[P]:s,[Pe]:l}},je=e=>{for(let t=0,r=e.length;t<r;t++){let o=e[t];typeof o=="string"&&(e[t]={[z]:"",[k]:"",[O]:"",[P]:[],[Pe]:[o]})}return e},Ie=(e,t,r,o)=>{let[n,i]=Ht(e,t),s=Mt(n+i),l;if(r){let p=r(s,Ft(n),i);p&&(tn(p)?l=p:(o||zt)(p))}return{[z]:"",[k]:`@keyframes ${l||s}`,[O]:i,[P]:[],[Pe]:[]}},sn=0,Ne=(e,t,r,o)=>{e||(e=[`/* h-v-t ${sn++} */`]);let n=Array.isArray(e)?re(e,t,r,o):e,i=n[k],s=re(["view-transition-name:",""],[i],r,o);return n[k]=Y+n[k],n[O]=n[O].replace(/(?<=::view-transition(?:[a-z-]*)\()(?=\))/g,i),s[k]=s[z]=i,s[P]=[...n[P],n],s};var ln=e=>{let t=[],r=0,o=0;for(let n=0,i=e.length;n<i;n++){let s=e[n];if(s==="'"||s==='"'){let l=s;for(n++;n<i;n++){if(e[n]==="\\"){n++;continue}if(e[n]===l)break}continue}if(s==="{"){o++;continue}if(s==="}"){o--,o===0&&(t.push(e.slice(r,n+1)),r=n+1);continue}}return t},Qe=({id:e})=>{let t,r=()=>(t||(t=document.querySelector(`style#${e}`)?.sheet,t&&(t.addedStyles=new Set)),t?[t,t.addedStyles]:[]),o=(s,l)=>{let[p,d]=r();if(!p||!d){Promise.resolve().then(()=>{if(!r()[0])throw new Error("style sheet not found");o(s,l)});return}d.has(s)||(d.add(s),(s.startsWith(Y)?ln(l):[`${s[0]==="@"?"":"."}${s}{${l}}`]).forEach(u=>{p.insertRule(u,p.cssRules.length)}))};return[{toString(){let s=this[z];return o(s,this[O]),this[P].forEach(({[k]:l,[O]:p})=>{o(l,p)}),this[k]}},({children:s,nonce:l})=>({tag:"style",props:{id:e,nonce:l,children:s&&(Array.isArray(s)?s:[s]).map(p=>p[O])}})]},cn=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=Qe({id:e}),i=u=>(u.toString=o.toString,u),s=(u,...c)=>i(re(u,c,t,r));return{css:s,cx:(...u)=>(u=je(u),s(Array(u.length).fill(""),...u)),keyframes:(u,...c)=>Ie(u,c,t,r),viewTransition:(u,...c)=>i(Ne(u,c,t,r)),Style:n}},ge=cn({id:Le}),Zs=ge.css,Js=ge.cx,Qs=ge.keyframes,ea=ge.viewTransition,ta=ge.Style;var fn=({id:e,classNameSlug:t,onInvalidSlug:r})=>{let[o,n]=Qe({id:e}),i=new WeakMap,s=new WeakMap,l=new RegExp(`(<style id="${e}"(?: nonce="[^"]*")?>.*?)(</style>)`),p=y=>{let C=({buffer:T,context:b})=>{let[v,g]=i.get(b),$=Object.keys(v);if(!$.length)return;let _="";if($.forEach(U=>{g[U]=!0,_+=U.startsWith(Y)?v[U]:`${U[0]==="@"?"":"."}${U}{${v[U]}}`}),i.set(b,[{},g]),T&&l.test(T[0])){T[0]=T[0].replace(l,(U,mr,ur)=>`${mr}${_}${ur}`);return}let st=s.get(b),at=`<script${st?` nonce="${st}"`:""}>document.querySelector('#${e}').textContent+=${JSON.stringify(_)}<\/script>`;if(T){T[0]=`${at}${T[0]}`;return}return Promise.resolve(at)},D=({context:T})=>{i.has(T)||i.set(T,[{},{}]);let[b,v]=i.get(T),g=!0;if(v[y[z]]||(g=!1,b[y[z]]=y[O]),y[P].forEach(({[k]:$,[O]:_})=>{v[$]||(g=!1,b[$]=_)}),!g)return Promise.resolve(A("",[C]))},K=new String(y[k]);Object.assign(K,y),K.isEscaped=!0,K.callbacks=[D];let G=Promise.resolve(K);return Object.assign(G,y),G.toString=o.toString,G},d=(y,...C)=>p(re(y,C,t,r)),u=(...y)=>(y=je(y),d(Array(y.length).fill(""),...y)),c=(y,...C)=>Ie(y,C,t,r),h=(y,...C)=>p(Ne(y,C,t,r)),x=({children:y,nonce:C}={})=>A(`<style id="${e}"${C?` nonce="${C}"`:""}>${y?y[O]:""}</style>`,[({context:D})=>{s.set(D,C)}]);return x[V]=n,{css:d,cx:u,keyframes:c,viewTransition:h,Style:x}},ye=fn({id:Le}),f=ye.css,la=ye.cx,be=ye.keyframes,ca=ye.viewTransition,fa=ye.Style;var Vt=(e,t)=>{switch(t.type){case"LOAD_START":return{...e,loading:!0};case"LOAD_SUCCESS":return{...e,loading:!1,families:t.families};case"LOAD_FAILURE":return{...e,loading:!1};case"SET_SEARCH":return{...e,searchQuery:t.query};case"SELECT_PATIENT":return t.id===e.selectedPatientId&&e.panelVisible?{...e,panelVisible:!1}:{...e,selectedPatientId:t.id,panelVisible:!0,panelView:"dados",patientDetail:null,fichas:[],detailLoading:!0};case"DETAIL_START":return{...e,detailLoading:!0};case"DETAIL_SUCCESS":return{...e,detailLoading:!1,patientDetail:t.detail,fichas:t.fichas};case"DETAIL_FAILURE":return{...e,detailLoading:!1};case"CLOSE_PANEL":return{...e,panelVisible:!1};case"SHOW_FICHAS":return{...e,panelView:"fichas"};case"SHOW_DADOS":return{...e,panelView:"dados"};case"SET_TAB":return{...e,activeTab:t.tab}}},Wt=(e,t)=>{let r=t.trim();if(r==="")return e;let o=r.toLowerCase();return e.filter(n=>[n.firstName,n.lastName,n.fullName].some(i=>i?.toLowerCase().includes(o)))};var Kt={families:[],searchQuery:"",selectedPatientId:null,panelVisible:!1,panelView:"dados",patientDetail:null,fichas:[],loading:!1,detailLoading:!1,activeTab:"familias"};var et={"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},Ut=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status===204)return{ok:!0,value:void 0};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{return{ok:!0,value:(await e.json()).data}}catch{return{ok:!1,error:"SERVER_ERROR"}}},dn=async e=>{if(e.status===401)return globalThis.location.href="/auth/login",{ok:!1,error:"UNAUTHORIZED"};if(e.status===403)return{ok:!1,error:"FORBIDDEN"};if(e.status===404)return{ok:!1,error:"NOT_FOUND"};if(e.status>=400&&e.status<500)return{ok:!1,error:"VALIDATION_ERROR"};if(e.status>=500)return{ok:!1,error:"SERVER_ERROR"};try{let t=await e.json();return{ok:!0,value:{data:t.data,meta:t.meta}}}catch{return{ok:!1,error:"SERVER_ERROR"}}},qt=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:et});return Ut(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Xt=async e=>{try{let t=await fetch(e,{credentials:"same-origin",headers:et});return dn(t)}catch{return{ok:!1,error:"NETWORK_ERROR"}}},Yt=async(e,t)=>{try{let r=await fetch(e,{method:"POST",credentials:"same-origin",headers:et,body:JSON.stringify(t)});return Ut(r)}catch{return{ok:!1,error:"NETWORK_ERROR"}}};var tt={search:(e,t=20,r)=>{let o=new URLSearchParams;return e&&o.set("search",e),r&&o.set("cursor",r),o.set("limit",String(t)),Xt(`/api/v1/patients?${o.toString()}`)},getById:e=>qt(`/api/v1/patients/${e}`),create:e=>Yt("/api/v1/patients",e)};var m={background:"#F2E2C4",backgroundDark:"#172D48",surface:"#FAF0E0",surfaceLight:"#FFFBF4",cardAlternate:"#C8BBA4",bgBase:"#F8F3EC",bgWarm:"#F0E8DC",bgSage:"#E2E8DF",bgSageDeep:"#D4DDD0",bgCard:"rgba(255,255,255,0.45)",bgCardHover:"rgba(255,255,255,0.65)",bgCardBorder:"rgba(255,255,255,0.6)",bgCardBorderHover:"rgba(79,132,72,0.2)",textPrimary:"#261D11",textOnDark:"#F2E2C4",textMuted:"rgba(38, 29, 17, 0.65)",antiFlash:"#EBEBEB",textSagePrimary:"#1E2B1A",textSageSecondary:"#3D5235",textSageMuted:"#6B7F65",textSageSoft:"#8B9E85",primary:"#4F8448",primaryDark:"#3D6A37",danger:"#A6290D",dangerAlt:"#C4422B",warning:"#C9960A",inputLine:"rgba(38, 29, 17, 0.2)",borderOnDark:"#F2E2C4"},j=(e,t)=>{let r=parseInt(e.slice(1,3),16),o=parseInt(e.slice(3,5),16),n=parseInt(e.slice(5,7),16);return`rgba(${r}, ${o}, ${n}, ${t})`},S={satoshi:"Satoshi, sans-serif",playfair:"Playfair Display, serif",erode:"Erode, serif"},E={light:"300",regular:"400",medium:"500",semibold:"600",bold:"700"};var ba={button:f`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,panel:f`box-shadow: -8px 0 40px ${j(m.textPrimary,.3)};`,fab:f`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,dialog:f`box-shadow: 0 24px 80px ${m.inputLine};`,modal:f`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `},W={pill:"100px",panel:"24px",card:"12px",dropdown:"8px",modal:"6px",checkbox:"4px",small:"3px"};var pn=f`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid ${j(m.primary,.08)};
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
`,mn=f`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${m.primary}, ${m.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: ${S.erode};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  text-decoration: none;
  transition: transform 150ms ease, box-shadow 150ms ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px ${j(m.primary,.3)};
  }
`,un=f`
  font-family: ${S.erode};
  font-size: 14px;
  color: ${m.textSageSecondary};
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
    color: ${m.primary};
  }
`,hn=f`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 12px;
`,xn=f`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  text-decoration: none;
  color: ${m.textSageMuted};
  white-space: nowrap;
  border: none;
  background: none;
  font-family: inherit;
  width: 100%;

  &:hover {
    background: ${j(m.primary,.08)};
    color: ${m.textSageSecondary};
  }
`,gn=f`
  background: ${j(m.primary,.08)};
  color: ${m.primary};
`,yn=f`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
`,bn=f`
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`,Sn=f`
  margin-left: auto;
  background: ${m.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: ${W.pill};
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,wn=f`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 12px;
  width: 100%;
`,En=f`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${m.bgSage}, ${m.bgSageDeep});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: ${m.primaryDark};
  flex-shrink: 0;
`,vn=f`
  font-size: 12px;
  color: ${m.textSageMuted};
  white-space: nowrap;
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`,$n=[{id:"familias",icon:"\u2630",label:"Familias",hasBadge:!0,href:"/social-care"},{id:"cadastro",icon:"+",label:"Cadastro",hasBadge:!1,href:"/patient-registration"},{id:"relatorios",icon:"\u25A6",label:"Relatorios",hasBadge:!1,href:"#"},{id:"config",icon:"\u2699",label:"Config",hasBadge:!1,href:"#"}],Gt=({userName:e,userInitials:t,familyCount:r,activeItem:o})=>a("nav",{class:pn,"aria-label":"Menu lateral",children:[a("a",{href:"/hub",class:mn,"aria-label":"Voltar para o Hub",children:"C"}),a("a",{href:"/hub",class:un,"aria-label":"Voltar para o Hub",children:"Conecta"}),a("div",{class:hn,role:"list",children:$n.map(n=>a("a",{class:`${xn} ${n.id===o?gn:""}`,href:n.href,"aria-current":n.id===o?"page":void 0,"aria-label":n.label,role:"listitem",children:[a("span",{class:yn,"aria-hidden":"true",children:n.icon}),a("span",{class:bn,children:n.label}),n.hasBadge&&a("span",{class:Sn,"aria-label":`${r} familias`,children:r})]},n.id))}),a("div",{class:wn,children:[a("div",{class:En,"aria-hidden":"true",children:t}),a("div",{class:vn,children:e})]})]});var kn=f`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`,Cn=f`
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  background: ${m.bgCard};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${m.bgCardBorder};
  border-radius: ${W.pill};
  font-family: ${S.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${m.textSagePrimary};
  outline: none;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &::placeholder {
    color: ${m.textSageSoft};
    font-style: italic;
  }

  &:focus {
    border-color: ${m.bgCardBorderHover};
    box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
  }
`,An=f`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: ${m.textSageSoft};
  pointer-events: none;
  width: 14px;
  height: 14px;
`,Dn=f`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  color: ${m.textSageMuted};
  font-size: 16px;
  line-height: 1;
  transition: color 150ms ease;
  &:hover { color: ${m.textSagePrimary}; }
`,Zt=({query:e,onSearch:t,onClear:r})=>a("div",{class:kn,children:[a("svg",{class:An,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2",children:[a("circle",{cx:"11",cy:"11",r:"8"}),a("path",{d:"m21 21-4.3-4.3"})]}),a("input",{class:Cn,type:"text",placeholder:"Buscar por nome, CPF...",value:e,onInput:o=>t(o.target.value),"aria-label":"Buscar familias"}),e.length>0&&a("button",{class:Dn,onClick:r,type:"button","aria-label":"Limpar busca",children:"\xD7"})]});var Tn=be`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,Rn=be`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 0.7;
    transform: translateY(0);
  }
`,On=f`
  background: ${m.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${m.bgCardBorder};
  border-radius: 16px;
  padding: clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem) clamp(1rem, 0.75rem + 1vw, 1.375rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  transform: translateY(8px);
  animation: ${Tn} 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--stagger, 0ms);

  &:hover {
    background: ${m.bgCardHover};
    border-color: ${m.bgCardBorderHover};
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(79, 132, 72, 0.06);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`,_n=f`
  background: ${m.bgCardHover};
  border-color: ${m.bgCardBorderHover};
  box-shadow: 0 4px 20px rgba(79, 132, 72, 0.08);
`,Ln=f`
  animation-name: ${Rn};

  &:hover {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 0.7;
  }
`,Pn=f`
  font-family: ${S.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  font-weight: ${E.medium};
  color: ${m.textSageSoft};
  width: 24px;
  text-align: center;
  flex-shrink: 0;
`,jn=f`
  flex: 1;
  min-width: 0;
`,In=f`
  font-family: ${S.erode};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 1rem);
  font-weight: ${E.semibold};
  color: ${m.textSagePrimary};
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,Nn=f`
  font-family: ${S.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  color: ${m.textSageMuted};
  margin-top: 2px;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,Mn=f`
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  color: ${m.textSageSoft};
  width: 100px;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;

  & strong {
    color: ${m.textSageSecondary};
    font-weight: ${E.semibold};
  }

  @media (max-width: 768px) {
    display: none;
  }
`,Fn=f`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80px;
  justify-content: flex-end;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`,Bn=f`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
`,Jt=f`
  background: ${m.primary};
`,Qt=f`
  background: ${m.dangerAlt};
`,er=f`
  font-size: 10px;
  font-weight: ${E.semibold};
  letter-spacing: 0.5px;
  text-transform: uppercase;
`,tr=f`
  color: ${m.primary};
`,rr=f`
  color: ${m.dangerAlt};
`,zn=f`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 0.375rem;
    font-size: clamp(0.625rem, 0.5625rem + 0.25vw, 0.6875rem);
    color: ${m.textSageSoft};
  }
`,Hn=f`
  display: flex;
  align-items: center;
  gap: 6px;
`,Vn=f`
  width: 6px;
  height: 6px;
  border-radius: 50%;
`,nr=({index:e,displayName:t,diagnosis:r,memberCount:o,isActive:n,isSelected:i,onSelect:s})=>{let l=n?"Ativo":"Inativo",p=o===1?"membro":"membros";return a("div",{class:`${On} ${i?_n:""} ${n?"":Ln}`,style:`--stagger: ${e*60}ms`,onClick:s,role:"button",tabIndex:0,"aria-label":`${t}, ${o} ${p}, ${l}`,onKeyDown:d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),s())},children:[a("span",{class:Pn,children:String(e+1).padStart(2,"0")}),a("div",{class:jn,children:[a("div",{class:In,children:t}),r&&a("div",{class:Nn,children:r})]}),a("span",{class:Mn,children:[a("strong",{children:o})," ",p]}),a("div",{class:Fn,children:[a("span",{class:`${Bn} ${n?Jt:Qt}`}),a("span",{class:`${er} ${n?tr:rr}`,children:l})]}),a("div",{class:zn,children:[a("span",{children:[o," ",p]}),a("span",{class:Hn,children:[a("span",{class:`${Vn} ${n?Jt:Qt}`}),a("span",{class:`${er} ${n?tr:rr}`,children:l})]})]})]})};var Wn=f`
  display: flex;
  align-items: center;
  padding: 0 clamp(1rem, 0.75rem + 1vw, 1.375rem) 0.75rem;
  font-size: 10px;
  font-weight: ${E.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${m.textSageSoft};
  font-family: ${S.satoshi};

  @media (max-width: 768px) {
    display: none;
  }
`,Kn=f`
  flex: 1;
`,Un=f`
  width: 100px;
  text-align: right;
`,qn=f`
  width: 80px;
  text-align: right;
`,Xn=f`
  transition: margin-right 450ms cubic-bezier(0.4, 0, 0.2, 1);
`,Yn=f`
  margin-right: 46%;

  @media (max-width: 1200px) {
    margin-right: 50%;
  }

  @media (max-width: 768px) {
    margin-right: 0;
  }
`,Gn=f`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,Zn=e=>e.lastName&&e.firstName?`${e.lastName}, ${e.firstName}`:e.fullName??"\u2014",or=({families:e,selectedId:t,onSelect:r,panelOpen:o})=>a("div",{class:`${Xn} ${o?Yn:""}`,children:[a("div",{class:Wn,children:[a("span",{class:Kn,children:"Referencia / Diagnostico"}),a("span",{class:Un,children:"Membros"}),a("span",{class:qn,children:"Status"})]}),a("div",{class:Gn,role:"list",children:e.map((n,i)=>a(nr,{index:i,displayName:Zn(n),diagnosis:n.primaryDiagnosis,memberCount:n.memberCount,isActive:!0,isSelected:n.patientId===t,onSelect:()=>r(n.patientId)},n.patientId))})]});var Jn=f`
  padding: clamp(0.75rem, 0.5rem + 1vw, 1rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
`,rt=f`
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);
`,nt=f`
  font-family: ${S.satoshi};
  font-size: 10px;
  font-weight: ${E.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${m.textSageSoft};
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(79, 132, 72, 0.08);
`,ot=f`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`,Qn=f`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,eo=f`
  grid-column: 1 / -1;
`,to=f`
  font-family: ${S.satoshi};
  font-size: 11px;
  font-weight: ${E.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${m.textSageSoft};
`,ro=f`
  font-family: ${S.satoshi};
  font-weight: ${E.regular};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 0.9375rem);
  color: ${m.textSagePrimary};
`,no=f`
  color: ${m.textSageSoft};
  font-style: italic;
`,H=({label:e,value:t,fullWidth:r})=>a("div",{class:`${Qn} ${r?eo:""}`,children:[a("span",{class:to,children:e}),a("span",{class:`${ro} ${t?"":no}`,children:t||"Nao informado"})]}),ir=({detail:e})=>{let t=e.personalData,r=e.civilDocuments,o=e.address,n=t&&`${t.firstName??""} ${t.lastName??""}`.trim()||null;return a("div",{class:Jn,children:[a("div",{class:rt,children:[a("div",{class:nt,children:"Dados Pessoais"}),a("div",{class:ot,children:[a(H,{label:"Nome Completo",value:n}),a(H,{label:"Data de Nascimento",value:t?.birthDate??null}),a(H,{label:"CPF",value:r?.cpf??null}),a(H,{label:"Telefone",value:t?.phone??null}),a(H,{label:"Nome da Mae",value:t?.motherName??null,fullWidth:!0})]})]}),a("div",{class:rt,children:[a("div",{class:nt,children:"Endereco"}),a("div",{class:ot,children:[a(H,{label:"Logradouro",value:o?.street??null,fullWidth:!0}),a(H,{label:"Cidade",value:o?.city??null}),a(H,{label:"CEP",value:o?.cep??null})]})]}),e.diagnoses.length>0&&a("div",{class:rt,children:[a("div",{class:nt,children:"Diagnosticos"}),a("div",{class:ot,children:e.diagnoses.map((i,s)=>a(H,{label:i.icdCode||`Diagnostico ${s+1}`,value:i.description},s))})]})]})};var oo=f`
  padding: clamp(0.75rem, 0.5rem + 1vw, 1rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
`,io=f`
  display: flex;
  flex-direction: column;
`,so=f`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(79, 132, 72, 0.06);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    padding-left: 0.5rem;
  }
`,ao=f`
  font-size: 11px;
  font-weight: ${E.medium};
  color: ${m.textSageSoft};
  min-width: 20px;
  font-variant-numeric: tabular-nums;
  font-family: ${S.satoshi};
`,lo=f`
  flex: 1;
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${E.regular};
  color: ${m.textSageSecondary};
  font-family: ${S.satoshi};
  transition: color 150ms cubic-bezier(0.16, 1, 0.3, 1);

  div:hover > & {
    color: ${m.textSagePrimary};
  }
`,co=f`
  font-size: 10px;
  font-weight: ${E.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: ${W.pill};
  font-family: ${S.satoshi};
`,fo=f`
  background: rgba(79, 132, 72, 0.1);
  color: ${m.primary};
`,po=f`
  background: rgba(107, 127, 101, 0.08);
  color: ${m.textSageSoft};
`,mo=f`
  font-size: 14px;
  color: ${m.textSageSoft};
  opacity: 0;
  transform: translateX(-4px);
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);

  div:hover > & {
    opacity: 1;
    transform: translateX(0);
  }
`,sr=({fichas:e,onFichaClick:t})=>a("div",{class:oo,children:a("div",{class:io,children:e.map((r,o)=>a("div",{class:so,onClick:()=>t(r.route),role:"button",tabIndex:0,"aria-label":`${r.name}, ${r.filled?"preenchida":"pendente"}`,onKeyDown:n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),t(r.route))},children:[a("span",{class:ao,children:String(o+1).padStart(2,"0")}),a("span",{class:lo,children:r.name}),a("span",{class:`${co} ${r.filled?fo:po}`,children:r.filled?"Preenchida":"Pendente"}),a("span",{class:mo,"aria-hidden":"true",children:"\u2192"})]},o))})});var uo=f`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 44%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  transform: translateX(100%);
  transition: transform 450ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 30;

  @media (max-width: 1200px) {
    width: 50%;
  }

  @media (max-width: 768px) {
    width: 100%;
    z-index: 50;
  }
`,ho=f`
  transform: translateX(0);
`,xo=f`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms,
              transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms;
`,go=f`
  opacity: 1;
  transform: translateX(0);
`,yo=f`
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(0.75rem, 0.5rem + 0.75vw, 1rem);
  border-bottom: 1px solid rgba(79, 132, 72, 0.1);
`,bo=f`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: clamp(0.75rem, 0.5rem + 0.75vw, 1rem);
`,So=f`
  font-family: ${S.erode};
  font-size: clamp(1.25rem, 1rem + 1.25vw, 1.75rem);
  font-weight: ${E.bold};
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: ${m.textSagePrimary};
`,wo=f`
  font-family: ${S.satoshi};
  font-weight: ${E.regular};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${m.textSageMuted};
  font-style: italic;
  margin-bottom: 0.75rem;
`,Eo=f`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.4);
  color: ${m.textSageSecondary};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
    color: ${m.textSagePrimary};
  }
`,vo=f`
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(79, 132, 72, 0.1);
`,ar=f`
  flex: 1;
  padding: 0.75rem 1rem;
  font-family: ${S.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  font-weight: ${E.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${m.textSageSoft};
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    color: ${m.textSageSecondary};
  }
`,lr=f`
  color: ${m.primary};

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 1rem;
    right: 1rem;
    height: 2px;
    background: ${m.primary};
    border-radius: 1px;
  }
`,cr=({visible:e,view:t,detail:r,fichas:o,onClose:n,onShowFichas:i,onShowDados:s})=>{let l=r?.personalData,p=l&&`${l.firstName??""} ${l.lastName??""}`.trim()||"\u2014",d=r?.diagnoses?.[0]?`${r.diagnoses[0].description}${r.diagnoses[0].icdCode?` (${r.diagnoses[0].icdCode})`:""}`:null,u=c=>{c&&(globalThis.location.href=c)};return a("aside",{class:`${uo} ${e?ho:""}`,"aria-label":"Painel de detalhes","aria-hidden":!e,children:a("div",{class:`${xo} ${e?go:""}`,children:[a("div",{class:yo,children:a("div",{class:bo,children:[a("div",{children:[a("h3",{class:So,children:p}),d&&a("p",{class:wo,children:d})]}),a("button",{class:Eo,onClick:n,type:"button","aria-label":"Fechar painel",children:"\xD7"})]})}),a("div",{class:vo,children:[a("button",{class:`${ar} ${t==="dados"?lr:""}`,onClick:s,type:"button","aria-label":"Aba dados",children:"Dados"}),a("button",{class:`${ar} ${t==="fichas"?lr:""}`,onClick:i,type:"button","aria-label":"Aba fichas",children:"Fichas"})]}),r&&t==="dados"&&a(ir,{detail:r}),r&&t==="fichas"&&a(sr,{fichas:o,onFichaClick:u})]})})};var $o=f`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 2rem + 4vw, 5rem) clamp(1rem, 0.5rem + 2vw, 1.5rem);
  text-align: center;
`,ko=f`
  font-size: 48px;
  color: ${m.textSageSoft};
  margin-bottom: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  opacity: 0.4;
`,Co=f`
  font-family: ${S.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  font-weight: ${E.bold};
  color: ${m.textSageSecondary};
  margin-bottom: 0.5rem;
`,Ao=f`
  font-family: ${S.satoshi};
  font-style: italic;
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${m.textSageMuted};
  max-width: 17.5rem;
`,it=({icon:e,title:t,description:r})=>a("div",{class:$o,children:[a("span",{class:ko,children:e}),a("div",{class:Co,children:t}),a("div",{class:Ao,children:r})]});var Do=be`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`,To=f`
  background: ${m.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${m.bgCardBorder};
  border-radius: 16px;
  padding: clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem) clamp(1rem, 0.75rem + 1vw, 1.375rem);
  display: flex;
  align-items: center;
  gap: 1rem;
`,Se=f`
  background: linear-gradient(
    90deg,
    ${j(m.primary,.04)} 25%,
    ${j(m.primary,.08)} 50%,
    ${j(m.primary,.04)} 75%
  );
  background-size: 800px 100%;
  animation: ${Do} 1.8s infinite ease-in-out;
  border-radius: 8px;
  height: 12px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.6;
  }
`,Ro=f`
  ${Se};
  width: 16px;
  flex-shrink: 0;
`,Oo=f`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`,_o=f`
  ${Se};
  width: 60%;
`,Lo=f`
  ${Se};
  width: 40%;
`,Po=f`
  ${Se};
  width: 60px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`,jo=f`
  ${Se};
  width: 50px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`,fr=({count:e=6})=>a("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:Array.from({length:e},(t,r)=>a("div",{class:To,children:[a("div",{class:Ro}),a("div",{class:Oo,children:[a("div",{class:_o}),a("div",{class:Lo})]}),a("div",{class:Po}),a("div",{class:jo})]},r))});var Io=f`
  :-hono-global {
    body {
      background: ${m.bgSageDeep} !important;
      font-family: ${S.satoshi};
      color: ${m.textSagePrimary};
      min-height: 100vh;
      overflow-x: hidden;
    }
  }
`,No=f`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${m.bgBase} 0%, ${m.bgWarm} 25%, ${m.bgSage} 55%, ${m.bgSageDeep} 100%);
  pointer-events: none;
`,Mo=f`
  position: fixed;
  top: -15%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 132, 72, 0.07) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
`,Fo=f`
  position: fixed;
  bottom: -20%;
  left: -5%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 160, 100, 0.05) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
`,Bo=f`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
`,zo=f`
  margin-left: 64px;
  flex: 1;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1.5rem, 1rem + 2vw, 3rem);
  max-width: min(90%, 72rem);
  position: relative;
  transition: margin-left 300ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 768px) {
    margin-left: 0;
    padding: clamp(1rem, 0.5rem + 2vw, 1.5rem) clamp(0.75rem, 0.5rem + 1vw, 1.25rem);
  }
`,Ho=f`
  margin-bottom: clamp(1.5rem, 1rem + 1.5vw, 2.25rem);
`,Vo=f`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: clamp(0.75rem, 0.5rem + 1vw, 1.25rem);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`,Wo=f`
  font-family: ${S.erode};
  font-size: clamp(2rem, 1.5rem + 2.5vw, 2.625rem);
  font-weight: ${E.bold};
  color: ${m.textSagePrimary};
  letter-spacing: -0.03em;
  line-height: 1;
`,Ko=f`
  font-family: ${S.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${m.textSageMuted};
  font-weight: ${E.medium};
  margin-top: 0.375rem;

  & strong {
    color: ${m.textSageSecondary};
    font-weight: ${E.semibold};
  }
`,Uo=f`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    width: 100%;
  }
`,qo=f`
  width: clamp(12rem, 10rem + 8vw, 17.5rem);

  @media (max-width: 768px) {
    width: 100%;
  }
`,Xo=f`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, ${m.primary}, ${m.primaryDark});
  color: #fff;
  border: none;
  border-radius: ${W.pill};
  font-family: ${S.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${E.semibold};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 12px rgba(79, 132, 72, 0.2);
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(79, 132, 72, 0.3);
  }
`,Yo=e=>[{name:"Composicao familiar",filled:e.familyMembers.length>0,route:`/family-composition/${e.patientId}`},{name:"Acesso a beneficios eventuais",filled:e.socialIdentity!=null,route:null},{name:"Condicoes de saude da familia",filled:e.healthStatus!=null,route:null},{name:"Convivencia familiar e comunitaria",filled:e.communitySupportNetwork!=null,route:null},{name:"Condicoes educacionais da familia",filled:e.educationalStatus!=null,route:null},{name:"Situacoes de violencia e violacao de direitos",filled:e.violationReports.length>0,route:null},{name:"Condicoes de trabalho e rendimento da familia",filled:e.workAndIncome!=null,route:null},{name:"Especificidades sociais, etnicas ou culturais",filled:e.socioeconomicSituation!=null,route:null},{name:"Forma de ingresso e motivo do primeiro atendimento",filled:e.intakeInfo!=null,route:null},{name:"Condicoes habitacionais da familia",filled:e.housingCondition!=null,route:null}],Go=e=>({patientId:e.patientId,personId:e.personId,personalData:e.personalData?{firstName:e.personalData.firstName,lastName:e.personalData.lastName,motherName:e.personalData.motherName??"",nationality:"",sex:"",birthDate:e.personalData.birthDate??"",phone:e.personalData.phone??null,socialName:null}:null,civilDocuments:e.civilDocuments?{cpf:e.civilDocuments.cpf??null,nis:null}:null,address:e.address?{street:e.address.street??null,city:e.address.city??null,state:e.address.state??null,cep:e.address.cep??null}:null,diagnoses:e.diagnoses.map(t=>({icdCode:t.icdCode??"",description:t.description,date:""})),familyMembers:e.familyMembers.map(t=>({personId:t.memberId,relationship:t.relationship,birthDate:""}))}),dr=()=>{let[e,t]=Ye(Vt,Kt);_e(()=>{t({type:"LOAD_START"}),tt.search().then(l=>{l.ok?t({type:"LOAD_SUCCESS",families:l.value.data}):t({type:"LOAD_FAILURE"})})},[]),_e(()=>{let l=p=>{p.key==="Escape"&&e.panelVisible&&t({type:"CLOSE_PANEL"})};return globalThis.addEventListener("keydown",l),()=>globalThis.removeEventListener("keydown",l)},[e.panelVisible]);let r=B(l=>{t({type:"SELECT_PATIENT",id:l}),tt.getById(l).then(p=>{if(p.ok){let d=Yo(p.value),u=Go(p.value);t({type:"DETAIL_SUCCESS",detail:u,fichas:d})}else t({type:"DETAIL_FAILURE"})})},[]),o=Wt(e.families,e.searchQuery),n=e.searchQuery.trim().length>0,i=!e.loading&&e.families.length===0,s=!e.loading&&n&&o.length===0;return a(De,{children:[a("div",{class:Io}),a("div",{class:No}),a("div",{class:Mo}),a("div",{class:Fo}),a("div",{class:Bo,children:[a(Gt,{userName:"Usuario",userInitials:"US",familyCount:e.families.length,activeItem:"familias"}),a("main",{class:zo,children:[a("div",{class:Ho,children:a("div",{class:Vo,children:[a("div",{children:[a("h1",{class:Wo,children:"Familias"}),a("p",{class:Ko,children:[a("strong",{children:e.families.length})," cadastradas"]})]}),a("div",{class:Uo,children:[a("div",{class:qo,children:a(Zt,{query:e.searchQuery,onSearch:l=>t({type:"SET_SEARCH",query:l}),onClear:()=>t({type:"SET_SEARCH",query:""})})}),a("a",{href:"/patient-registration",class:Xo,"aria-label":"Novo cadastro",children:[a("span",{"aria-hidden":"true",children:"+"}),"Novo Cadastro"]})]})]})}),e.loading&&a(fr,{count:6}),i&&a(it,{icon:"\u25C9",title:"Nenhuma familia cadastrada",description:"Comece adicionando o primeiro cadastro usando o botao acima."}),s&&a(it,{icon:"\u2315",title:"Nenhum resultado",description:"Nenhuma familia encontrada para o termo buscado. Tente outro nome ou CPF."}),!e.loading&&!i&&!s&&a(or,{families:o,selectedId:e.selectedPatientId,onSelect:r,panelOpen:e.panelVisible}),a(cr,{visible:e.panelVisible,view:e.panelView,detail:e.patientDetail,fichas:e.fichas,onClose:()=>t({type:"CLOSE_PANEL"}),onShowFichas:()=>t({type:"SHOW_FICHAS"}),onShowDados:()=>t({type:"SHOW_DADOS"})})]})]})]})};var pr=document.getElementById("social-care-app");pr&&Ke(a(dr,{}),pr);
