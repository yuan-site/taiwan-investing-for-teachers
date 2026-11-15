(() => {
const money = x => new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(x);
const number = x => x.toLocaleString("zh-TW",{maximumFractionDigits:2});
const pct = x => number(x) + "%";
const field = (label,value, min=0,max=100000000,step=1) => ({label,value,min,max,step});
const table = (heads,rows) => `<div class="scrolltable"><table><thead><tr>${heads.map(x=>'<th scope="col">'+x+'</th>').join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;
const summary = (label,result,explain,alert=false) => ({html:`<p>${label}<strong class="metric">${result}</strong></p><p>${explain}</p>`,alert});
const tools={
 budget:{title:"可投入資金試算",intro:"用一組每月收支，試算留足近期用錢與預備金提撥後的餘額。",fields:[field("每月實領收入（元）",62000),field("生活與固定支出（元）",42000),field("近期支出提存（元／月）",6000),field("預備金提撥（元／月）",5000)],run:([a,b,c,d])=>{
   const x=a-b-c-d;return summary("每月剩餘",money(x),`${money(a)} − ${money(b)} − ${money(c)} − ${money(d)}。${x<0?"目前有資金缺口，先檢視支出或提撥安排。":x===0?"本例沒有額外可投入的餘額。":"這是每月帳面餘額，投入前仍需考量用錢期限與波動承受度。"}`,x<0)
 }},
 order:{title:"零股委託與成本試算",intro:"模擬一筆買進限價單。假設賣方有足夠股數，且此筆委託無排隊與其他撮合限制。",fields:[field("買進限價（元）",50,.01,1000000,.01),field("模擬賣方報價（元）",49,.01,1000000,.01),field("委託股數（股）",50,1,999),field("買進手續費率（%）",.1425,0,10,.0001),field("單筆最低手續費（元）",1),field("假設賣出價（元）",52,.01,1000000,.01),field("賣出交易稅率（%）",.3,0,10,.001)],run:([limit,ask,shares,fee,minFee,sell,tax])=>{
   if(limit<ask)return summary("模擬結果","暫未成交",`買方限價 ${number(limit)} 元，低於目前賣價 ${number(ask)} 元。`,true);
   const buy=ask*shares, proceeds=sell*shares, cost=Math.max(minFee,buy*fee/100), exit=Math.max(minFee,proceeds*fee/100), charge=proceeds*tax/100, pnl=proceeds-buy-cost-exit-charge;
   return summary("模擬來回損益",money(pnl),`買入本金 ${money(buy)}，買進手續費約 ${money(cost)}。假設賣出收入 ${money(proceeds)}，賣出手續費約 ${money(exit)}、交易稅約 ${money(charge)}。本例賣出費率與最低費用沿用買進設定，未模擬券商逐筆取整。`,pnl<0)
 }},
 etf:{title:"ETF 比較與折溢價",intro:"比較兩檔虛構基金。費率為每年假設值，集中度以第一大持股的權重示意。",fields:[field("甲基金淨值（元）",20,.01,10000,.01),field("甲基金市價（元）",21,.01,10000,.01),field("甲年費率（%）",.35,0,100,.01),field("甲第一大持股（%）",30,0,100,.1),field("乙基金淨值（元）",26,.01,10000,.01),field("乙基金市價（元）",25.8,.01,10000,.01),field("乙年費率（%）",.6,0,100,.01),field("乙第一大持股（%）",12,0,100,.1)],run:([an,ap,af,aw,bn,bp,bf,bw])=>{
   const gap=(p,n)=>{const x=(p/n-1)*100;return Math.abs(x)<1e-8?"與淨值相同":(x>0?"溢價 ":"折價 ")+pct(Math.abs(x))};
   return {html:table(["基金","折溢價","假設年費率","第一大持股"],[["甲",gap(ap,an),pct(af),pct(aw)],["乙",gap(bp,bn),pct(bf),pct(bw)]])+"<p>折溢價＝（市價 ÷ 淨值 − 1）× 100%。比較前應確認價格與淨值的估值時間。</p>"}
 }},
 lever:{title:"每日倍數報酬模擬",intro:"輸入兩天的指數漲跌，比較每日正向與反向產品的累積報酬。忽略費用與追蹤差異。",fields:[field("第 1 天指數漲跌（%）",10,-49,49,.1),field("第 2 天指數漲跌（%）",-10,-49,49,.1)],run:([a,b])=>{
   const rows=[["原指數",1],["每日正向 2 倍",2],["每日反向 1 倍",-1]].map(([label,m])=>[label,pct(a*m),pct(b*m),pct(((1+a*m/100)*(1+b*m/100)-1)*100)]);
   return {html:table(["標的","第 1 天","第 2 天","兩天累積"],rows)+"<p>兩天累積報酬＝第 1 天報酬因子 × 第 2 天報酬因子 − 1。</p>"}
 }},
 finance:{title:"財報與現金流比較",intro:"兩家公司營收皆為 1,000 萬元。調整獲利與營業現金流，再找出需要追查的差距。",fields:[field("甲公司稅後淨利（萬元）",120,-1000,1000),field("甲公司營業現金流（萬元）",15,-10000,10000),field("乙公司稅後淨利（萬元）",90,-1000,1000),field("乙公司營業現金流（萬元）",110,-10000,10000)],run:([a,b,c,d])=>({html:table(["公司","淨利率","營業現金流減淨利（萬元）"],[["甲",pct(a/10),number(b-a)],["乙",pct(c/10),number(d-c)]])+"<p>差距較大時，可再看應收帳款、存貨、折舊及現金流量表附註。各期的差距可能來自不同原因。</p>"})},
 trend:{title:"走勢與均線觀察",intro:"切換相同價格序列上的短期與較長期平均。折線資料是虛構的每日收盤值。",fields:[field("移動平均期間（天）",3,2,8)],run:([period])=>{
   const prices=[26,25,24,26,29,28,27,25,26,30,29,31];
   const averages=prices.map((_,i)=>i+1<period?null:prices.slice(i-period+1,i+1).reduce((s,v)=>s+v,0)/period);
   return {plot:{prices,averages},html:`<p>第 12 天收盤價 ${prices.at(-1)} 元，${period} 日均線為 ${number(averages.at(-1))} 元。</p><canvas width="600" height="236" role="img" aria-label="虛構每日收盤價與移動平均走勢"></canvas><p>藍線為收盤價，橘線為移動平均。選較長的觀察期間，再比對轉折出現的時間。</p><details><summary>查看原始數值</summary>${table(["日","收盤（元）","均線（元）"],prices.map((v,i)=>[i+1,v,averages[i]===null?"資料未滿":number(averages[i])]))}</details>`};
 }},
 evidence:{title:"消息與數據查證",intro:"一家公司公布上月營收 12 億元，去年同月是 10 億元。當天股價下跌 3%。市場貼文寫著「大戶已知下月訂單大減」。",choices:[{label:"依照可取得的公告，能核對哪一項？",items:["下月訂單已證實大減","上月營收年增 20%","特定投資人的真實交易動機"],value:1}],run:([x])=>summary("核對結果",x===1?"選對了":"再對照公告","營收年增率＝（12 − 10）÷ 10＝20%。股價變動可以查證，跌價原因與下月訂單則需要額外資料。",x!==1)},
 compare:{title:"兩家公司並排研究",intro:"虛構案例：甲公司營收年增 12%，最大客戶占營收 55%。乙公司營收年增 6%，最大客戶占營收 15%。",choices:[{label:"要檢查甲公司的營運風險，最適合先查哪項？",items:["大客戶合約期限與替代訂單","只查股價排名","只比較近期人氣"],value:0}],run:([x])=>summary("查證方向",x===0?"選對了":"再看客戶比重","甲的成長較快，但對單一客戶依賴較高。進一步檢查合約期限、續約條件與營收組成，再一起比較兩家公司的獲利和估值。",x!==0)},
 saving:{title:"定期投入與單筆投入",intro:"用三期示範價格比較兩種投入方式。假設可買入小數股、期末價格等於第三期價格，忽略手續費與股利。",fields:[field("每期投入（元）",5000,1),field("第一期單價（元）",50,.01,100000,.01),field("第二期單價（元）",40,.01,100000,.01),field("第三期單價（元）",55,.01,100000,.01)],run:([d,a,b,c])=>{
   const cost=3*d, staged=d/a+d/b+d/c,lump=cost/a;
   return {html:table(["做法","累積股數","平均成本／股","期末損益"],[["分三期",number(staged),money(cost/staged),money(staged*c-cost)],["第一期單筆",number(lump),money(cost/lump),money(lump*c-cost)]])+"<p>兩種方式的總投入相同。試著讓第二期價格高於第一期，觀察結論會如何改變。</p>"};
 }},
 risk:{title:"組合下跌情境",intro:"設定股票部位比重與兩類資產的價格變動，估算假設情境下的整體損益。",fields:[field("組合金額（元）",200000,1),field("股票占比（%）",70,0,100),field("股票變動（%）",-20,-100,100,.1),field("其他資產變動（%）",-5,-100,100,.1)],run:([size,w,a,b])=>{
   const ret=(w*a+(100-w)*b)/100;return summary("組合變動",`${money(size*ret/100)}（${pct(ret)}）`,`加權變動＝${pct(w)} × ${pct(a)} ＋ ${pct(100-w)} × ${pct(b)}。試著讓兩類資產同時下跌，觀察組合風險。`,ret<0);
 }}
};
function plot(canvas,{prices,averages}) {
 const ctx=canvas.getContext("2d");
 if(!ctx)return;
 const width=canvas.width,height=canvas.height,min=Math.floor(Math.min(...prices))-1,max=Math.ceil(Math.max(...prices))+1;
 const x=i=>42+i*(width-68)/(prices.length-1),y=v=>height-32-(v-min)*(height-53)/(max-min);
 ctx.font="14px sans-serif";
 ctx.fillStyle="#4c6077";
 for(let v=min;v<=max;v+=2){
   ctx.fillText(v,10,y(v)+5);
   ctx.strokeStyle="#d7e2ef";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(42,y(v));ctx.lineTo(width-22,y(v));ctx.stroke();
 }
 for(const [series,color] of [[prices,"#2E86DE"],[averages,"#C97706"]]){
   ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();let started=false;
   series.forEach((v,i)=>{if(v!==null){if(started)ctx.lineTo(x(i),y(v));else{ctx.moveTo(x(i),y(v));started=true}}});
   ctx.stroke();
 }
}
window.COURSE_TOOLS=tools;
window.drawCoursePlot=plot;
})();
