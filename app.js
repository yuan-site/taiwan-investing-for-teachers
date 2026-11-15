(() => {
"use strict";
const course=window.COURSE, tools=window.COURSE_TOOLS;
const main=document.getElementById("main");
const key="tw-teacher-investing-v1";
const total=course.reduce((n,g)=>n+g.lessons.length,0);
let state={done:{},answers:{},inputs:{},last:null,plan:{}};
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&typeof saved==="object")state={...state,...saved}}catch{}
let storageWorks=true;
function save(){
 try{localStorage.setItem(key,JSON.stringify(state));storageWorks=true}catch{storageWorks=false}
 return storageWorks;
}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const topicCount=i=>course[i].lessons.filter((_,j)=>state.done[i+"-"+j]).length;
const count=()=>course.reduce((n,_,i)=>n+topicCount(i),0);
const stepPath=(i,j)=>"#/learn/"+(i+1)+"/"+(j+1);
const btn=(label,href,kind="primary",extra="")=>`<a class="btn ${kind}" href="${href}" ${extra}>${label}</a>`;
function nextUnfinished(){
 for(let i=0;i<course.length;i++){
  const j=course[i].lessons.findIndex((_,j)=>!state.done[i+"-"+j]);if(j>=0)return [i,j];
 }
 return null;
}
function continuation(){
 const last=state.last;
 if(Array.isArray(last)&&course[last[0]]?.lessons[last[1]]&&!state.done[last.join("-")])return last;
 return nextUnfinished();
}
const progress=()=>`<div class="progress"><span>已完成 ${count()}／${total} 個小步驟</span><progress max="${total}" value="${count()}" aria-label="全站學習進度"></progress></div>`;
function list(expand){
 return `<ol class="route-list">${course.map((g,i)=>{
  const done=topicCount(i), size=g.lessons.length;
  const first=Math.max(0,g.lessons.findIndex((_,j)=>!state.done[i+"-"+j]));
  const p=stepPath(i,first), current=continuation()?.[0]===i;
  const label=`<span class="num">${String(i+1).padStart(2,"0")}</span><div><strong>${g.title}</strong><span class="desc">${g.desc}</span></div><span class="route-meta${done===size?" done":""}">${done===size?"✓ 已完成":(done?done+"／"+size:size+" 步")}${expand?" ▾":" ›"}</span>`;
  return `<li class="route-item">${expand?`<details ${current?"open":""}><summary>${label}</summary><div class="detail-inner">${btn(done&&done<size?"繼續這個主題":done===size?"複習主題":"進入主題",p,"primary mini")}<ol>${g.lessons.map((l,j)=>`<li><a href="${stepPath(i,j)}">${l.title}</a>${state.done[i+"-"+j]?' <span class="done">✓ 已完成</span>':""}</li>`).join("")}</ol></div></details>`:`<a class="route-link" href="${p}">${label}</a>`}</li>`;
 }).join("")}</ol>`;
}
function home(){
 const next=continuation(), link=next?stepPath(...next):"#/plan";
 main.innerHTML=`<div class="hero-wrap"><section class="container hero"><div>
 <h1 aria-label="給高中老師的一堂投資理財課"><span>給高中老師的</span><span>一堂投資理財課</span></h1><p class="byline">臺北市立陽明高中/王聖淵</p>
 <p class="intro">從整理可投入的資金開始，逐步看懂台股、ETF 與財報。用課堂案例和情境試算，把觀念寫成自己的投資計畫。</p>
 <div class="actions">${btn(next?(state.last||count()?"繼續學習 →":"開始學習 →"):"完成我的投資計畫",link)}${btn("查看學習路線","#/route","plain")}</div>
 ${(state.last||count())&&next?`<p class="muted">接著讀：${course[next[0]].lessons[next[1]].title}</p>`:""}
 </div><div class="hero-art"><img src="hero.webp" alt="桌面上的理財筆記、計算機與藍色文具" width="720" height="540"><span class="caption">10 個主題 · 88 個小步驟</span></div></section></div>
 <section class="container overview"><div class="section-head"><div><h2>學習路線</h2><p>依序學習，或選擇今天想複習的主題。</p></div>${progress()}</div>${list(false)}</section>`;
}
function routes(){
 main.innerHTML=`<div class="container page"><div class="section-head"><div><h1>學習路線</h1><p>展開主題即可選擇步驟，也能按原順序繼續。</p></div>${progress()}</div>${list(true)}</div>`;
}
const source={
 "1-8":['交易制度','https://www.twse.com.tw/zh/products/system/trading.html','集中市場的委託方式與適用時段，以證交所公告為準。'],
 "1-9":['盤中零股交易調整','https://twse-regulation.twse.com.tw/tw/int/DAT01.aspx?FLCODE=FE399225','截至 2026-11-15，盤中零股 9:00 接受委託、9:10 開始撮合。依公告，2026-12-07 起調整為 8:30 接受委託、9:00 開始撮合。'],
 "2-1":['ETF 總覽','https://wwwc.twse.com.tw/zh/products/securities/etf/overview/introduction.html','可從證交所 ETF 專區查詢產品類型及投資特性。'],
 "2-3":['槓桿型及反向型 ETF','https://wwwc.twse.com.tw/zh/products/securities/etf/products/li.html','基金的每日倍數目標不等於多日累積倍數。'],
 "2-5":['指數投資證券商品風險','https://investoredu.twse.com.tw/pages/twse_investmentrisk1_6.aspx','發行人的償付能力是 ETN 的信用風險來源。'],
 "3-2":['公開資訊觀測站','https://mops.twse.com.tw/mops/','查詢時以最新的公司申報及公告為準。'],
 "1-7":['處置及分盤交易揭露','https://www.twse.com.tw/zh/announcement/disclosure-report-d.html','實際措施與期間以個案公告為準。']
};
const risks={"0-5":"借款可能同時帶來投資損失、利息與還款壓力。","1-2":"信用交易可能觸發補繳或強制處分。","1-6":"請先理解補擔保及借款契約條件。","2-3":"槓桿與反向產品涉及每日調整、追蹤差異與放大的波動。","2-4":"利率、匯率與信用變化可能使債券基金價格下跌。","9-1":"跳空或流動性不足時，實際成交價格可能偏離退出門檻。"};
const examples={
 "0-1":["試算範例","每月收入 62,000 元，扣除生活與固定支出 42,000 元、近期支出提存 6,000 元、預備金提撥 5,000 元，剩餘 9,000 元。若有尚未列入的支出，再從這筆餘額扣除。"],
 "1-2":["從自有資金看放大效果","以 40,000 元自有資金和 60,000 元借款買進價值 100,000 元的股票。股票跌至 90,000 元時，未計利息和費用，自有部位只剩 30,000 元，減少 25%。"],
 "1-10":["配息前後比較","持有 100 股，每股 50 元，配息每股 2 元。若除息後剛好以參考價 48 元計算，市值 4,800 元加現金股利 200 元，合計 5,000 元。忽略稅費，實際市價仍可能波動。"],
 "2-3":["比較兩天的報酬","指數先漲 10% 再跌 10%，兩天累積為 1.1 × 0.9 − 1＝−1%。若每日正向兩倍，則為 1.2 × 0.8 − 1＝−4%。此例忽略費用和追蹤差異。"],
 "3-4":["用同一組營收計算","營收 100 萬元，成本 60 萬元，營業費用 20 萬元，稅後淨利 16 萬元。毛利率 40%，營業利益率 20%，稅後淨利率 16%。"],
 "3-5":["試算估值","假設每股盈餘 5 元、股價 80 元，本益比為 16 倍。接著可用不同盈餘假設試算倍數，並核對是否包含一次性收益。"],
 "4-1":["自行畫一根 K 線","開盤 26 元、最高 30 元、最低 25 元、收盤 29 元。實體介於 26 至 29 元，上影線到 30 元，下影線到 25 元。"],
 "4-4":["公式和限制","RSV＝（收盤價 − 觀察期最低）÷（觀察期最高 − 最低）×100。K 平滑 RSV，D 再平滑 K。比較不同看盤平台前要確認週期、起始值與最高等於最低時的處理方式。"],
 "4-5":["公式和限制","先用 12 期 EMA 減去 26 期 EMA 得 DIF，再以 DIF 的 9 期 EMA 作為訊號線。常見柱狀值是 DIF 減去訊號線。各平台的線名和柱狀值尺度可能不同。"],
 "4-8":["公式和限制","RSI＝100 − 100 ÷（1 ＋ 平均漲幅 ÷ 平均跌幅）。以同一套平滑方式比較兩段期間，並檢查上漲或下跌樣本是否過少。"],
 "4-9":["試算參考中線","一種常見 CDP 公式為（前期最高＋前期最低＋2×前期收盤）÷4。前期高 53、低 47、收 50 元，則 CDP 為 50 元。"],
 "5-6":["換算示例","假設每份海外憑證代表 5 股，市價 30 美元、匯率每美元 32 元，換算每股約 192 元。仍要比較兩邊的交易時段、成本與流動性。"],
 "6-6":["查證紀錄範本","依序寫下原始公告、日期、已確認數字、仍缺的資料，以及一個合理的其他解釋。之後再回來驗證。"],
 "7-1":["匯率試算","假設應收 1 萬美元、外幣成本 6,000 美元，淨曝險為 4,000 美元。匯率每美元少 1 元，未考慮避險時約少 4,000 元換算價值。"],
 "8-6":["用兩期看單位成本","假設各投入 4,000 元，單價分別為 50 和 40 元，可買 80 與 100 股。忽略費用，平均成本為 8,000 ÷ 180，約 44.44 元。"],
 "9-0":["試算回本需要的漲幅","100 元跌到 80 元，下跌 20%。從 80 元回到 100 元，漲幅是 20 ÷ 80＝25%。分母不同，兩個百分比不會相同。"]
};
function lesson(i,j){
 const g=course[i], l=g?.lessons[j];
 if(!l){location.replace("#/route");return}
 const id=i+"-"+j, finished=state.done[id];
 state.last=[i,j];save();
 const prev=j?stepPath(i,j-1):i?stepPath(i-1,course[i-1].lessons.length-1):"#/route";
 const next=j+1<g.lessons.length?stepPath(i,j+1):i+1<course.length?stepPath(i+1,0):"#/plan";
 const practiceTool=i===2&&j===3?"lever":g.tool;
 const options=(i+j)%2?[["b",l.b],["a",l.a]]:[["a",l.a],["b",l.b]];
 const citation=source[id], risk=risks[id], example=examples[id];
 main.innerHTML=`<div class="container page">
 <p class="breadcrumbs"><a href="#/route">學習路線</a> › 主題 ${i+1} · ${g.title}</p>
 <div class="learn"><aside class="side"><details ${matchMedia("(min-width:781px)").matches?"open":""}><summary>本主題進度 · ${topicCount(i)}/${g.lessons.length}</summary><ol>${g.lessons.map((x,k)=>`<li><a href="${stepPath(i,k)}" ${j===k?'aria-current="step"':""}><span class="${state.done[i+"-"+k]?"done":""}">${state.done[i+"-"+k]?"✓":k+1+"."}</span>${x.title}${state.done[i+"-"+k]?'<span class="visually-hidden">已完成</span>':""}</a></li>`).join("")}</ol></details></aside>
 <article class="article">
 <div class="status-row"><span>本主題 ${j+1}／${g.lessons.length}${finished?' · <span class="done">✓ 已完成</span>':""}</span><button class="btn plain mini" id="focus" aria-pressed="false">投影閱讀</button></div>
 <h1>${l.title}</h1>
 <section><h2>先理解觀念</h2><p>${l.body}</p></section>
 ${risk?`<section class="note risk"><strong>風險提醒</strong><p>${risk}</p></section>`:""}
 ${example?`<details class="supplement"><summary>${example[0]}</summary><p>${example[1]}</p></details>`:""}
 <section class="quiz"><h2>動手練習</h2><form id="quiz"><fieldset><legend>${l.question}</legend>
 ${options.map(([value,label])=>`<label class="choice"><input required type="radio" name="answer" value="${value}" ${state.answers[id]===value?"checked":""}> ${label}</label>`).join("")}
 </fieldset><button type="submit" class="btn practice">查看答案</button><div class="feedback" id="quiz-result" role="status"></div></form></section>
 <section class="toolbox"><h2>${tools[practiceTool].title}</h2><p>${tools[practiceTool].intro}</p><div class="actions">${btn("開始練習","#/tools/"+practiceTool+"?back="+(i+1)+"-"+(j+1),"practice")}</div></section>
 <details class="supplement"><summary>帶領提示</summary><ol><li>請大家先想一想：「${l.question}」</li><li>先請兩位老師說明各自的理由，再查看答案與解說。</li><li>打開「${tools[practiceTool].title}」，完成範例後調整一項條件，討論結果如何變化。</li></ol></details>
 ${citation?`<details class="supplement"><summary>官方資料與查核日期</summary><p>${citation[2]}</p><p><a href="${citation[1]}" target="_blank" rel="noopener">${citation[0]}（另開視窗）</a> · 查核日期 2026-11-15</p></details>`:""}
 <div class="learn-controls">${btn("← 上一步",prev,"plain")}<div class="actions" style="margin:0">${finished?"":btn("先跳到下一步",next,"plain")}<button id="complete" class="btn primary">${finished?"繼續 →":"完成並繼續 →"}</button></div></div>
 </article></div></div>`;
 const focus=main.querySelector("#focus");
 focus.addEventListener("click",()=>{
  const on=main.querySelector(".learn").classList.toggle("focus");
  focus.setAttribute("aria-pressed",String(on));focus.textContent=on?"顯示步驟清單":"投影閱讀";
 });
 function feedback(answer){
  const box=main.querySelector("#quiz-result");
  box.classList.toggle("try",answer!=="a");
  box.textContent=(answer==="a"?"答對了。":"再想一下。較合適的答案是「"+l.a+"」。")+l.body;
 }
 if(state.answers[id])feedback(state.answers[id]);
 main.querySelector("#quiz").addEventListener("submit",e=>{
  e.preventDefault();const answer=new FormData(e.currentTarget).get("answer");
  state.answers[id]=answer;save();feedback(answer);
 });
 main.querySelector("#complete").addEventListener("click",()=>{
  state.done[id]=true;save();location.hash=next;
 });
}
function workbench(name,params){
 const owns=(k)=>Object.hasOwn(tools,k), selected=owns(name)?name:"budget", tool=tools[selected];
 const match=/^(\d+)-(\d+)$/.exec(params.get("back")??"");
 const back=match&&course[+match[1]-1]?.lessons[+match[2]-1]?params.get("back"):null;
 const suffix=back?"?back="+back:"";
 const returnTo=back?stepPath(+match[1]-1,+match[2]-1):"#/route";
 const fields=tool.fields??tool.choices, vars=state.inputs[selected]??fields.map(f=>f.value);
 main.innerHTML=`<div class="container page"><p class="breadcrumbs"><a href="${returnTo}">${back?"← 返回原步驟":"← 返回學習路線"}</a></p><h1>練習工具</h1>
 <nav class="tool-nav" aria-label="選擇練習工具">${Object.entries(tools).map(([k,v])=>btn(v.title,"#/tools/"+k+suffix,"plain mini",k===selected?'aria-current="page"':"")).join("")}</nav>
 <article class="article"><h2>${tool.title}</h2><p>${tool.intro}</p>
 <form id="tool-form">
 <div class="formgrid">${fields.map((f,j)=>`<label>${f.label}${f.items?`<select name="p${j}">${f.items.map((v,k)=>`<option value="${k}" ${vars[j]===k?"selected":""}>${v}</option>`).join("")}</select>`:`<input type="number" required name="p${j}" min="${f.min}" max="${f.max}" step="${f.step}" value="${esc(vars[j]??f.value)}">`}</label>`).join("")}</div>
 <div class="actions"><button class="btn practice">查看結果</button><button class="btn plain" type="button" id="reset-example">恢復範例</button></div>
 <div role="status" class="feedback" id="tool-result"></div>
 </form>
 ${selected==="order"?'<details class="supplement"><summary>費率與官方來源</summary><p>預填 0.3% 為一般股票賣出交易稅率。現股當日沖銷優惠有適用條件與期限。手續費率及最低費用由券商規定，表中皆可改成練習假設。</p><p><a href="https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-knowledge/rwG2M1N" target="_blank" rel="noopener">財政部稅務入口網｜買賣股票</a> · 查核日期 2026-11-15</p></details>':""}
 <div class="actions">${btn(back?"返回原步驟":"返回學習路線",returnTo,"plain")}</div></article></div>`;
 const form=main.querySelector("#tool-form");
 const output=main.querySelector("#tool-result");
 function display(values,persist){
  const result=tool.run(values);output.classList.toggle("try",!!result.alert);output.innerHTML=result.html;
  if(result.plot)window.drawCoursePlot(output.querySelector("canvas"),result.plot);
  if(persist){state.inputs[selected]=values;save()}
 }
 form.addEventListener("submit",e=>{
  e.preventDefault();const data=new FormData(form), values=fields.map((_,j)=>Number(data.get("p"+j)));
  if(values.every(Number.isFinite))display(values,true);
 });
 main.querySelector("#reset-example").addEventListener("click",()=>{
  const values=fields.map((f,j)=>{form.elements.namedItem("p"+j).value=f.value;return f.value});
  display(values,true);
 });
 if(state.inputs[selected])display(vars,false);
}
const planFields=[
 ["purpose","資金用途與期限","例如：這筆資金預計何時使用？"],
 ["budget","可投入資金","寫下每月投入上限，以及預留的生活與緊急支出。"],
 ["process","研究與選擇流程","買入之前要確認哪些資料？"],
 ["limits","風險界線與退出條件","寫下可承受的損失、單一部位上限和調整條件。"],
 ["review","檢視頻率與下次檢視日","多久回顧一次？哪些重大變化會提前檢視？"]
];
function plan(){
 main.innerHTML=`<div class="container page"><p class="breadcrumbs"><a href="#/route">← 返回學習路線</a></p><h1>我的投資計畫</h1><p class="muted">把想法寫進五個欄位。草稿儲存在這個瀏覽器，也可列印留存。</p><div class="overview" style="padding:18px 0 0"><article class="article">
 <form class="planform" id="plan-form">${planFields.map(([k,label,tip])=>`<label>${label}<textarea maxlength="900" name="${k}" placeholder="${tip}">${esc(state.plan[k]??"")}</textarea></label>`).join("")}
 <div class="actions"><button class="btn primary">儲存計畫</button><button type="button" class="btn plain" id="print">列印計畫</button></div><div class="feedback" id="plan-status" role="status"></div></form></article></div></div>`;
 const f=main.querySelector("#plan-form"), msg=main.querySelector("#plan-status");
 function cache(){
  state.plan=Object.fromEntries(new FormData(f));return save();
 }
 f.addEventListener("input",()=>{cache();msg.textContent=""});
 f.addEventListener("submit",e=>{
  e.preventDefault();const ok=cache();msg.classList.toggle("try",!ok);msg.textContent=ok?"計畫已儲存在這個瀏覽器。":"目前瀏覽器無法儲存，可用列印保留計畫。";
 });
 main.querySelector("#print").addEventListener("click",()=>{
  cache();document.querySelectorAll(".planform textarea").forEach(ta=>{ta.style.height="auto";ta.style.height=Math.max(ta.scrollHeight+5,82)+"px"});
  window.print();
 });
}
function render(keepFocus=false){
 const hash=location.hash;
 if(hash==="#main"){main.focus();return}
 const [path,keys]=hash.slice(1).split("?");
 const [,area,arg,second]=path.split("/");
 const params=new URLSearchParams(keys);
 document.querySelectorAll("[data-nav]").forEach(a=>{
  if(a.dataset.nav===(area==="learn"?"route":area))a.setAttribute("aria-current","page");
  else a.removeAttribute("aria-current");
 });
 if(area==="route")routes();
 else if(area==="learn")lesson(Number(arg)-1,Number(second)-1);
 else if(area==="tools")workbench(arg,params);
 else if(area==="plan")plan();
 else home();
 const h=main.querySelector("h1");
 document.title=area&&h?h.textContent+"｜給高中老師的一堂投資理財課":"給高中老師的一堂投資理財課";
 if(!keepFocus){window.scrollTo(0,0);main.focus({preventScroll:true})}
}
document.querySelector(".skip").addEventListener("click",e=>{e.preventDefault();main.focus()});
window.addEventListener("hashchange",()=>render());
render(true);
})();


