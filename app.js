const QB=window.QB||{};
let S={mode:'all',questions:[],idx:0,score:0,wrong:0,answered:false,started:false,finished:false,wrongList:[],status:[]};
function jumpTo(i){if(i>=0&&i<S.questions.length){S.idx=i;S.answered=!!S.status[i];renderQ();window.scrollTo({top:0,behavior:'smooth'});}}
function shuffle(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}
function saveProgress(){if(!S.started||S.finished)return;const d={mode:S.mode,idx:S.idx,score:S.score,wrong:S.wrong,status:S.status,wrongList:S.wrongList,order:S.questions.map(q=>({b:q.bank||(q.type==='choice'?'choice':q.type==='truefalse'?'truefalse':'fillblank'),i:q.origIndex,t:q.type}))};try{localStorage.setItem('qz_p',JSON.stringify(d));}catch(e){}}
function clearProgress(){try{localStorage.removeItem('qz_p');}catch(e){}}
function loadProgress(){try{const r=localStorage.getItem('qz_p');return r?JSON.parse(r):null;}catch(e){return null;}}
function restoreQuestions(s){let qs=[];for(const it of s.order){const bk=QB[it.b];if(!bk)continue;const q=bk[it.i];if(!q)continue;qs.push({...q,type:it.t,origIndex:it.i,bank:it.b});}if(qs.length===0)return false;S.questions=qs;S.mode=s.mode;S.idx=s.idx;S.score=s.score;S.wrong=s.wrong;S.status=s.status;S.wrongList=s.wrongList||[];S.answered=false;S.started=true;S.finished=false;return true;}
function buildQuestions(){
let qs=[];
if(S.mode==='all'||S.mode==='choice')QB.choice&&QB.choice.forEach((q,i)=>qs.push({...q,type:'choice',origIndex:i,bank:'choice'}));
if(S.mode==='all'||S.mode==='truefalse')QB.truefalse&&QB.truefalse.forEach((q,i)=>qs.push({...q,type:'truefalse',origIndex:i,bank:'truefalse'}));
if(S.mode==='all'||S.mode==='fillblank')QB.fillblank&&QB.fillblank.forEach((q,i)=>qs.push({...q,type:'fillblank',origIndex:i,bank:'fillblank'}));
S.questions=shuffle(qs);S.status=new Array(S.questions.length).fill(null);
S.idx=0;S.score=0;S.wrong=0;S.answered=false;S.finished=false;S.wrongList=[];
}
function h(tag,attrs,...children){
const el=document.createElement(tag);
if(attrs)Object.entries(attrs).forEach(([k,v])=>{if(k==='className')el.className=v;else if(k.startsWith('on'))el.addEventListener(k.slice(2).toLowerCase(),v);else el.setAttribute(k,v);});
children.flat().forEach(c=>{if(typeof c==='string')el.appendChild(document.createTextNode(c));else if(c instanceof Node)el.appendChild(c);});
return el;
}
const A=document.getElementById('app');
function renderStart(){
const T=(QB.choice?.length||0)+(QB.truefalse?.length||0)+(QB.fillblank?.length||0);
A.innerHTML='';
A.appendChild(h('div',{className:'start fade-in'},h('div',{className:'card'},
h('div',{className:'s-title'},'期末复习测验'),
h('div',{className:'s-sub'},'东南亚与南亚国家概况<br>选择题+判断题+填空题 · 共'+T+'题'),
h('div',{className:'s-stats'},
h('div',{className:'stat-i'},h('div',{className:'stat-n'},String(T)),h('div',{className:'stat-l'},'总题数')),
h('div',{className:'stat-i'},h('div',{className:'stat-n'},String(QB.choice?.length||0)),h('div',{className:'stat-l'},'选择题')),
h('div',{className:'stat-i'},h('div',{className:'stat-n'},String(QB.truefalse?.length||0)),h('div',{className:'stat-l'},'判断题')),
h('div',{className:'stat-i'},h('div',{className:'stat-n'},String(QB.fillblank?.length||0)),h('div',{className:'stat-l'},'填空题'))),
h('div',{className:'modes'},
h('button',{className:'m-btn on',onClick:()=>{S.mode='all';updateBtns();}},'全部'),
h('button',{className:'m-btn',onClick:()=>{S.mode='choice';updateBtns();}},'仅选择'),
h('button',{className:'m-btn',onClick:()=>{S.mode='truefalse';updateBtns();}},'仅判断'),
h('button',{className:'m-btn',onClick:()=>{S.mode='fillblank';updateBtns();}},'仅填空')),
(()=>{const saved=loadProgress();if(saved)return h('div',{},h('button',{className:'btn btn-p',style:'font-size:16px;padding:14px 48px;marginBottom:12px',onClick:()=>{if(!restoreQuestions(saved)){clearProgress();renderStart();return;}S.started=true;renderQ();}},'继续答题 ('+(saved.idx+1)+'/'+saved.order.length+')'),h('div',{style:'marginTop:8px'},h('button',{className:'btn btn-s',style:'font-size:13px',onClick:()=>{clearProgress();renderStart();}},'重新开始')));return h('button',{className:'btn btn-p',style:'font-size:16px;padding:14px 48px;',onClick:startQuiz},'开始答题');})())));
}
function updateBtns(){document.querySelectorAll('.m-btn').forEach(b=>{const t=b.textContent;const m=t==='全部'?'all':t==='仅选择'?'choice':t==='仅判断'?'truefalse':'fillblank';b.classList.toggle('on',S.mode===m);});}
function startQuiz(){clearProgress();buildQuestions();S.started=true;renderQ();}
function renderQ(){
if(S.finished){renderResult();return;}
const q=S.questions[S.idx];
A.innerHTML='';S.answered=false;
const tl=q.type==='choice'?'选择题':q.type==='truefalse'?'判断题':'填空题';
const tc=q.type==='choice'?'t-choice':q.type==='truefalse'?'t-tf':'t-blank';
const pct=((S.idx)/S.questions.length*100).toFixed(0);
A.appendChild(h('div',{className:'card fade-in'},
h('div',{className:'top-bar'},q.c?h('div',{className:'country-tag'},q.c):null,h('div',{className:'progress-wrap'},h('div',{className:'progress-fill',style:'width:'+pct+'%'})),h('div',{className:'progress-text'},(S.idx+1)+'/'+S.questions.length)),
h('div',{className:'num-nav'},...S.questions.map((_,i)=>{let c='num-dot';if(i===S.idx)c+=' cur';else if(S.status[i]==='ok')c+=' ok';else if(S.status[i]==='ng')c+=' ng';return h('div',{className:c,onClick:()=>jumpTo(i)},String(i+1));})),
h('div',{className:'q-num'},'第'+(S.idx+1)+'题',h('span',{className:'q-type '+tc},tl)),
h('div',{className:'q-text'},q.q),
h('div',{id:'answer-area'}),
h('div',{className:'expl',id:'expl'}),
h('div',{className:'actions',id:'actions'})));
const area=document.getElementById('answer-area');
if(q.type==='fillblank')renderFillBlank(area,q);else renderOpts(area,q);
}
function renderOpts(area,q){
const isTF=q.type==='truefalse';
const labels=isTF?['对','错']:['A','B','C','D'];
const texts=isTF?['正确','错误']:q.o;
const c=h('div',{className:'options'});
texts.forEach((t,i)=>{c.appendChild(h('div',{className:'opt',onClick:()=>selectAnswer(i)},h('div',{className:'lbl'},labels[i]),h('div',{},t)));});
area.appendChild(c);
}
function renderFillBlank(area,q){
const parts=q.a.split(';');
const hint=parts.length>1?('共'+parts.length+'个空，用空格或分号分隔'):'';
const wrap=h('div',{className:'blk-wrap'});
const inp=h('input',{className:'blk-inp',type:'text',placeholder:hint||'输入答案',id:'blk-inp'});
const sub=h('button',{className:'blk-submit',onClick:checkFillBlank},'确认');
wrap.appendChild(inp);wrap.appendChild(sub);area.appendChild(wrap);
if(hint)area.insertBefore(h('div',{style:'font-size:12px;color:var(--text-muted);margin-bottom:8px;text-align:center'},hint),wrap);
inp.addEventListener('keydown',e=>{if(e.key==='Enter')checkFillBlank();});
}
function selectAnswer(idx){
if(S.answered)return;S.answered=true;
const q=S.questions[S.idx];
const ci=q.type==='truefalse'?(q.a?0:1):(Array.isArray(q.a)?q.a:q.a);
const im=Array.isArray(ci);
const ok=im?ci.includes(idx):idx===ci;
const opts=document.querySelectorAll('.opt');
opts.forEach(o=>o.classList.add('disabled'));
if(ok){S.score++;S.status[S.idx]='ok';if(im)ci.forEach(i=>opts[i].classList.add('correct'));else opts[idx].classList.add('correct');}
else{S.wrong++;S.status[S.idx]='ng';opts[idx].classList.add('wrong');if(im)ci.forEach(i=>opts[i].classList.add('show-correct'));else opts[ci].classList.add('show-correct');
const expl=document.getElementById('expl');expl.className='expl show';expl.innerHTML='<strong>解析：</strong>'+(q.e||'');
const lb=q.type==='truefalse'?['对','错']:['A','B','C','D'];
S.wrongList.push({q:q.q,ua:lb[idx],ca:im?ci.map(i=>lb[i]).join('+'):lb[ci],type:q.type==='choice'?'选择题':'判断题',country:q.c||'',expl:q.e||''});}
saveProgress();showNav();
}
function checkFillBlank(){
if(S.answered)return;S.answered=true;
const q=S.questions[S.idx];
const inp=document.getElementById('blk-inp');
const ua=inp.value.trim();
const answers=q.a.split(';');
const norm=s=>s.replace(/[\s，,。、；;：:！!？?\-\—]+/g,'').toLowerCase();
const nu=norm(ua);
const pr=answers.map(a=>{const na=norm(a);if(nu===na)return true;if(na.length>=2&&nu.includes(na))return true;if(na.length>=2&&na.includes(nu)&&nu.length>=2)return true;if(answers.length>1&&nu.includes(na)&&na.length>=2)return true;return false;});
const mc=pr.filter(Boolean).length;
const ok=mc===answers.length;
if(ok){S.score++;S.status[S.idx]='ok';inp.classList.add('ok');inp.disabled=true;document.querySelector('.blk-submit').disabled=true;}
else{S.wrong++;S.status[S.idx]='ng';inp.classList.add('ng');inp.disabled=true;document.querySelector('.blk-submit').disabled=true;
const expl=document.getElementById('expl');expl.className='expl show';
if(answers.length>1){const fb=answers.map((a,i)=>pr[i]?'<span style="color:#8cb4a0">✓'+a+'</span>':'<span style="color:#e8b4ad">✗'+a+'</span>').join(' ；');expl.innerHTML='<strong>正确答案：</strong>'+answers.join('；')+'<br><span class="fb">你的答案：'+(ua||'(空)')+'<br>'+fb+'</span>';}
else{expl.innerHTML='<strong>正确答案：</strong>'+answers.join('；');}
S.wrongList.push({q:q.q,ua:ua||'(空)',ca:answers.join('；'),type:'填空题',country:q.c||'',expl:''});}
saveProgress();showNav();
}
function showNav(){const acts=document.getElementById('actions');acts.innerHTML='';if(S.idx<S.questions.length-1)acts.appendChild(h('button',{className:'btn btn-p',onClick:nextQ},'下一题'));else acts.appendChild(h('button',{className:'btn btn-p',onClick:finish},'查看结果'));}
function nextQ(){S.idx++;S.answered=false;renderQ();window.scrollTo({top:0,behavior:'smooth'});}
function finish(){S.finished=true;clearProgress();renderResult();}
function renderResult(){
const T=S.questions.length;const pct=T>0?Math.round(S.score/T*100):0;
let emoji,msg,color;
if(pct>=90){emoji='🏆';msg='掌握得非常扎实！';color='#d4a853';}
else if(pct>=70){emoji='👍';msg='不错，继续加油！';color='#8ab4e0';}
else if(pct>=50){emoji='📚';msg='还需努力，建议加强复习。';color='#e8b45a';}
else{emoji='💪';msg='基础较薄弱，建议系统复习。';color='#c47858';}
const wl=S.wrongList;
A.innerHTML='';
A.appendChild(h('div',{className:'result fade-in'},h('div',{className:'card'},
h('div',{style:'fontSize:48px;marginBottom:8px'},emoji),
h('div',{className:'r-title',style:'color:'+color},pct+' 分'),
h('div',{className:'r-msg'},msg),
h('div',{className:'score-row'},
h('div',{className:'score-item'},h('div',{className:'score-val',style:'color:#3d8b6e'},String(S.score)),h('div',{className:'score-lbl'},'正确')),
h('div',{className:'score-item'},h('div',{className:'score-val',style:'color:#c44536'},String(S.wrong)),h('div',{className:'score-lbl'},'错误')),
h('div',{className:'score-item'},h('div',{className:'score-val'},String(T)),h('div',{className:'score-lbl'},'总题数'))),
wl.length>0?h('div',{className:'review-section'},h('h3','错题复盘（'+wl.length+'题）'),...wl.map((w,i)=>h('div',{className:'rv-item'},h('div',{className:'rv-meta'},w.type+(w.country?' · '+w.country:'')),h('div',{className:'rv-q'},w.q),h('div',{className:'rv-ur'},'你的答案：'+w.ua),h('div',{className:'rv-ca'},'正确答案：'+w.ca),w.expl?h('div',{style:'fontSize:11px;color:var(--text-dim);marginTop:3px'},w.expl):null))):h('div',{style:'marginTop:12px;color:var(--correct);fontSize:15px'},'全部答对！'),
h('div',{className:'actions',style:'marginTop:24px'},
h('button',{className:'btn btn-p',onClick:()=>{clearProgress();buildQuestions();S.finished=false;renderQ();window.scrollTo(0,0);}},'重新答题'),
h('button',{className:'btn btn-s',onClick:()=>{renderStart();}},'返回首页')))));
}
renderStart();