/* ============================================================
   SHARE MARKET MASTERY — book engine
   ============================================================ */

/* ---------- tiny svg helpers (no external images = no copyright,
   works fully offline for the packaged app) ---------- */

function fig(svg, caption){
  return `<div class="fig">${svg}<div class="fig-cap">${caption}</div></div>`;
}

function svgWrap(inner, h=170){
  return `<svg viewBox="0 0 320 ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function gridLines(h=170,n=3){
  let s='';
  for(let i=1;i<n;i++){
    const y = (h/n)*i;
    s += `<line x1="10" y1="${y}" x2="310" y2="${y}" class="grid-line"/>`;
  }
  return s;
}

/* candlestick chart from array of {o,h,l,c} (relative units 0-100) */
function candleSVG(candles, opts={}){
  const H = opts.h || 170, padTop=14, padBot=20;
  const usable = H - padTop - padBot;
  const allVals = candles.flatMap(c=>[c.h,c.l]);
  const max = Math.max(...allVals), min = Math.min(...allVals);
  const range = (max-min)||1;
  const n = candles.length;
  const cw = 300/n;
  const y = v => padTop + (1-(v-min)/range)*usable;
  let bodies = '';
  candles.forEach((c,i)=>{
    const cx = 10 + cw*i + cw/2;
    const up = c.c >= c.o;
    const yh=y(c.h), yl=y(c.l), yo=y(c.o), yc=y(c.c);
    const bodyTop = Math.min(yo,yc), bodyH = Math.max(2,Math.abs(yc-yo));
    bodies += `<line x1="${cx}" y1="${yh}" x2="${cx}" y2="${yl}" class="cs-wick"/>`;
    bodies += `<rect x="${cx-cw*0.28}" y="${bodyTop}" width="${cw*0.56}" height="${bodyH}" class="${up?'cs-up':'cs-down'}" rx="1.5"/>`;
  });
  return svgWrap(gridLines(H)+bodies, H);
}

/* simple line chart from array of numbers 0-100 */
function lineSVG(points, opts={}){
  const H = opts.h || 150, color = opts.color || 'var(--green)';
  const padTop=14,padBot=18;
  const usable = H-padTop-padBot;
  const max=Math.max(...points), min=Math.min(...points), range=(max-min)||1;
  const n=points.length;
  const step = 300/(n-1);
  const pts = points.map((v,i)=>{
    const x = 10+step*i;
    const yv = padTop + (1-(v-min)/range)*usable;
    return `${x},${yv}`;
  }).join(' ');
  const dots = points.map((v,i)=>{
    const x=10+step*i;
    const yv=padTop+(1-(v-min)/range)*usable;
    return `<circle cx="${x}" cy="${yv}" r="2.6" fill="${color}"/>`;
  }).join('');
  return svgWrap(`${gridLines(H)}<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${dots}`, H);
}

/* semicircle gauge (e.g. for RSI 0-100) */
function gaugeSVG(value, label){
  const cx=160, cy=140, r=110;
  const angle = Math.PI * (1 - value/100);
  const nx = cx + r*0.8*Math.cos(angle);
  const ny = cy - r*0.8*Math.sin(angle);
  const arc = `<path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}" fill="none" stroke="#1c2531" stroke-width="16"/>`;
  const zoneRed = `<path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx-r*0.31} ${cy-r*0.95}" fill="none" stroke="var(--red)" stroke-width="16" opacity="0.55"/>`;
  const zoneGreen = `<path d="M ${cx+r*0.31} ${cy-r*0.95} A ${r} ${r} 0 0 1 ${cx+r} ${cy}" fill="none" stroke="var(--green)" stroke-width="16" opacity="0.55"/>`;
  const needle = `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" fill="var(--gold)"/>`;
  const txt = `<text x="160" y="132" text-anchor="middle" fill="#e9edf3" font-size="26" font-weight="800" font-family="JetBrains Mono, monospace">${value}</text>
               <text x="160" y="155" text-anchor="middle" class="axis-txt" font-size="11">${label}</text>`;
  return svgWrap(arc+zoneRed+zoneGreen+needle+txt, 165);
}

/* risk pyramid */
function pyramidSVG(labels){
  const rows = labels.length;
  let shapes='', H=170, rowH = (H-20)/rows;
  labels.forEach((lab,i)=>{
    const y = 10 + rowH*i;
    const widthTop = 40 + (300-40)*(i/rows);
    const widthBot = 40 + (300-40)*((i+1)/rows);
    const x1 = 160-widthTop/2, x2=160+widthTop/2;
    const x3 = 160+widthBot/2, x4=160-widthBot/2;
    const color = i===0? 'var(--red)' : i===rows-1? 'var(--green)' : '#d4af37';
    shapes += `<polygon points="${x1},${y} ${x2},${y} ${x3},${y+rowH-4} ${x4},${y+rowH-4}" fill="${color}" opacity="${0.25+i*0.15}" stroke="${color}" stroke-width="1.2"/>`;
    shapes += `<text x="160" y="${y+rowH/2+2}" text-anchor="middle" fill="#e9edf3" font-size="10.5" font-family="Poppins">${lab}</text>`;
  });
  return svgWrap(shapes, H);
}

/* horizontal flow boxes with arrows */
function flowSVG(steps){
  const n = steps.length;
  const bw = 300/n - 8;
  let shapes='';
  steps.forEach((s,i)=>{
    const x = 10 + (300/n)*i;
    shapes += `<rect x="${x}" y="55" width="${bw}" height="55" rx="8" fill="#111722" stroke="var(--green-dark)" stroke-width="1.3"/>`;
    shapes += `<text x="${x+bw/2}" y="78" text-anchor="middle" fill="#e9edf3" font-size="9.5" font-family="Poppins" font-weight="600">${s.split(' ')[0]}</text>`;
    shapes += `<text x="${x+bw/2}" y="92" text-anchor="middle" fill="#96a2b5" font-size="8" font-family="Poppins">${s.split(' ').slice(1).join(' ')}</text>`;
    if(i<n-1){
      const ax = x+bw+4;
      shapes += `<line x1="${ax}" y1="82" x2="${ax+8}" y2="82" stroke="var(--gold)" stroke-width="2"/><polygon points="${ax+8},77 ${ax+14},82 ${ax+8},87" fill="var(--gold)"/>`;
    }
  });
  return svgWrap(shapes, 150);
}

/* donut chart from [{label,val,color}] */
function donutSVG(segments){
  const total = segments.reduce((a,b)=>a+b.val,0);
  let angle = -90, shapes='', legend='';
  const cx=110, cy=90, r=64, r2=38;
  segments.forEach((s,i)=>{
    const frac = s.val/total;
    const a0 = angle, a1 = angle + frac*360;
    angle = a1;
    const large = (a1-a0)>180?1:0;
    const toXY = (a,rad)=>{
      const rd = (a*Math.PI)/180;
      return [cx+rad*Math.cos(rd), cy+rad*Math.sin(rd)];
    };
    const [x0,y0]=toXY(a0,r), [x1,y1]=toXY(a1,r);
    const [ix1,iy1]=toXY(a1,r2), [ix0,iy0]=toXY(a0,r2);
    shapes += `<path d="M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${r2} ${r2} 0 ${large} 0 ${ix0} ${iy0} Z" fill="${s.color}" opacity="0.9"/>`;
    legend += `<circle cx="230" cy="${28+i*22}" r="5" fill="${s.color}"/><text x="240" y="${32+i*22}" fill="#d7dde6" font-size="10" font-family="Poppins">${s.label} — ${Math.round(frac*100)}%</text>`;
  });
  return svgWrap(shapes+legend, 175);
}

/* small inline glyphs used inside text/callouts */
function glyph(name){
  const map = {
    bull:'M4 18l4-6 3 3 6-9 3 4' ,
    bear:'M4 6l4 6 3-3 6 9 3-4',
    shield:'M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z',
    target:'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M12 12m-0.5 0',
  };
  const d = map[name]||map.target;
  return `<svg style="width:15px;height:15px;vertical-align:-2px;margin-right:3px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

/* ============================================================
   CHAPTER CONTENT (Hinglish, beginner-friendly, image-first)
   ============================================================ */

const CHAPTERS = [

/* ---------------- CH 1 ---------------- */
{
  num:1, group:'beginner', title:'Sharemarket Kya Hai?',
  pages:[
  {
    heading:'Sabse Pehle — Sharemarket Hai Kya?',
    body:`
    <p>Chalo isse ek <b>sabzi mandi</b> se samajhte hai 🥦. Jaise mandi me log sabzi <span class="hi">kharidte</span> aur <span class="lo">bechte</span> hai, waise hi sharemarket ek aisi jagah hai jaha log <b>companies ke chote-chote hisse (shares)</b> kharidte aur bechte hai.</p>
    <p>Jab tum ek company ka share kharidte ho, to tum us company ke <b>chote se malik (owner)</b> ban jate ho. Company jitna profit kamayegi, tumhara share utna hi value me badhega — aur agar company ka business kharab chala, to share ki value gir bhi sakti hai.</p>
    <div class="callout">${glyph('target')}<b>Yaad rakho:</b> Sharemarket "jua" nahi hai — ye ek real business ka hissa kharidne ka tarika hai. Risk hota hai, isliye samajhkar hi invest karna chahiye.</div>
    <p>India me do bade stock exchange hai jaha ye trading hoti hai:</p>
    <ul>
      <li><b>NSE (National Stock Exchange)</b> — sabse bada exchange, jaha ka index hai <b>Nifty 50</b>.</li>
      <li><b>BSE (Bombay Stock Exchange)</b> — Asia ka sabse purana exchange, jaha ka index hai <b>Sensex</b>.</li>
    </ul>
    `
  },
  {
    heading:'Market Kaam Kaise Karta Hai?',
    body:`
    <p>Sharemarket ek <b>digital auction</b> ki tarah kaam karta hai. Jab bahut log ek share <span class="hi">kharidna</span> chahte hai, price <span class="hi">upar</span> jaati hai. Jab log <span class="lo">bechna</span> chahte hai, price <span class="lo">neeche</span> jaati hai.</p>
    ${fig(lineSVG([30,34,32,40,45,42,50,55,52,60,58,65]), 'Price sirf demand aur supply se upar-neeche hoti hai')}
    <p>Ye poora system regulate karta hai <b>SEBI</b> (Securities and Exchange Board of India) — ye ek government body hai jo dhyaan rakhti hai ki koi fraud na ho aur retail investors (yaani hum jaise log) safe rahein.</p>
    <div class="trick-box"><div class="tb-title">💡 SIMPLE TRICK</div>Jab news achhi ho (profit, naya product, growth) → price aksar upar jaati hai.<br>Jab news kharab ho (loss, scandal, slowdown) → price aksar neeche jaati hai.</div>
    `
  },
  {
    heading:'Sharemarket Me Invest Kyu Kare?',
    body:`
    <p>Bank FD me paisa rakhne se usually <b>6-7%</b> return milta hai, lekin mehengai (inflation) bhi <b>6%</b> ke aas-paas badhti hai — matlab tumhara paisa "real me" utna nahi badh raha.</p>
    <p>Sharemarket me achhi companies me <b>long-term</b> invest karne se history me average <b>12-15% salana</b> return dekha gaya hai (guarantee nahi, par possibility hai) — jo <b>compounding</b> ke through bade fund banata hai.</p>
    ${fig(lineSVG([10,12,15,18,24,30,40,55,75,100]), '₹10,000 monthly SIP ka example — time ke saath compounding ka magic')}
    <div class="callout">⚠️ <b>Warning:</b> Market me risk hota hai. Kabhi bhi wo paisa invest mat karo jiski tumhe kal zarurat pad sakti hai. Pehle emergency fund banao, phir invest karo.</div>
    `
  },
  {
    heading:'Primary Market vs Secondary Market',
    body:`
    <p>Sharemarket ke 2 hisse samajhna zaroori hai:</p>
    <ul>
      <li><b>Primary Market</b> — jaha company <b>pehli baar</b> naye shares issue karti hai (jaise IPO). Paisa seedha company ko jaata hai.</li>
      <li><b>Secondary Market</b> — jaha wahi shares baad me investors <b>aapas me</b> trade karte hai (NSE/BSE par). Yaha paisa company ko nahi, dusre investor ko jaata hai.</li>
    </ul>
    ${fig(flowSVG(['Company IPO','Primary Market','Listed Stock','Secondary Market']), 'IPO ke baad share primary se secondary market me shift ho jaata hai')}
    <div class="callout">Jab tum roz apna trading app khol kar share kharidte/bechte ho, wo <b>secondary market</b> hi hai — 99% trading yahi hoti hai.</div>
    `
  },
  {
    heading:'Bull Market vs Bear Market',
    body:`
    <p>Market ke overall mood ko describe karne ke liye ye 2 terms har jagah use hote hai:</p>
    <ul>
      <li><span class="hi">${glyph('bull')}Bull Market</span> — jab market lambe time tak <b>upar</b> trend karta hai, log optimistic hote hai, khareedari zyada hoti hai.</li>
      <li><span class="lo">${glyph('bear')}Bear Market</span> — jab market lambe time tak <b>neeche</b> trend karta hai (usually 20%+ girawat), log pessimistic hote hai, bikwali zyada hoti hai.</li>
    </ul>
    ${fig(lineSVG([20,25,30,28,35,42,48,55,62,70]), 'Bull Market: lambe time tak higher highs banate hue upar jaana')}
    <div class="trick-box"><div class="tb-title">💡 REMEMBER</div>Bull ka horn <b>upar</b> maarta hai (price upar), Bear ka paw <b>neeche</b> maarta hai (price neeche) — isi se naam yaad rakho!</div>
    `
  }
  ]
},

/* ---------------- CH 2 ---------------- */
{
  num:2, group:'beginner', title:'Share/Stock Kya Hota Hai',
  pages:[
  {
    heading:'Ek Share = Company Ka Chota Tukda',
    body:`
    <p>Socho ek pizza 🍕 hai jisme <b>100 slices</b> hai. Agar tumne <b>1 slice</b> khareeda, to tum us pizza ke <b>1%</b> ke malik ho gaye. Company bhi apne aap ko lakhon "shares" me todti hai, aur har share ek chota ownership piece hota hai.</p>
    <p>Jab company profit kamati hai, wo kabhi-kabhi shareholders ko <b>dividend</b> (profit ka hissa) deti hai — ye ek bonus jaisa hota hai.</p>
    ${fig(donutSVG([{label:'Tum',val:1,color:'#12b76a'},{label:'Baaki Shareholders',val:99,color:'#233045'}]), '1 share = company ke tiny hisse ka ownership')}
    `
  },
  {
    heading:'Face Value vs Market Price',
    body:`
    <p>Yaha 2 important terms samjho jo beginners aksar confuse karte hai:</p>
    <ul>
      <li><b>Face Value</b> — company jab share issue karti hai tab uski fixed value (jaise ₹1, ₹2, ₹10). Ye sirf accounting ke liye hota hai.</li>
      <li><b>Market Price</b> — jo price abhi market me trade ho raha hai, jo demand-supply se change hoti rehti hai (jaise ₹450, ₹1200 etc).</li>
    </ul>
    <div class="callout">Face value kabhi change nahi hoti, par market price <b>har second</b> change hoti hai jab tak market khula hai (9:15 AM – 3:30 PM, Mon-Fri).</div>
    <p>Do main types ke shares hote hai:</p>
    <ul>
      <li><span class="hi">Equity Shares</span> — normal shares, voting right milta hai, profit/loss dono ka risk.</li>
      <li><span class="hi">Preference Shares</span> — fixed dividend milta hai, par voting right nahi milta.</li>
    </ul>
    `
  },
  {
    heading:'IPO Kya Hota Hai?',
    body:`
    <p><b>IPO (Initial Public Offering)</b> — jab koi private company <b>pehli baar</b> apne shares public ko bechti hai, taaki wo stock exchange par "listed" ho jaaye.</p>
    ${fig(flowSVG(['Private Company','SEBI Approval','IPO Launch','Stock Listed']), 'Company ka safar: Private se Public tak')}
    <p>IPO me apply karne se tumhe company ke shares "listing" se pehle allot ho sakte hai — agar demand bahut zyada hai (oversubscribed), to allotment lottery jaisa ho jaata hai.</p>
    <div class="trick-box"><div class="tb-title">💡 BEGINNER TIP</div>Naye IPO me paisa lagane se pehle company ki <b>financials, business model aur reason for IPO</b> zaroor padho — sirf "hype" dekhkar mat lagao.</div>
    `
  },
  {
    heading:'Large-cap, Mid-cap, Small-cap',
    body:`
    <p>Companies ko unke <b>market capitalization</b> (total value = share price × total shares) ke hisaab se 3 groups me baata jaata hai:</p>
    <ul>
      <li><b>Large-cap</b> — bahut badi, stable companies (jaise Reliance, TCS). Kam risky, slow-steady growth.</li>
      <li><b>Mid-cap</b> — medium size companies. Growth potential zyada, risk bhi medium.</li>
      <li><b>Small-cap</b> — chhoti companies. High growth potential, par <b>high risk</b> bhi — price bahut zyada upar-neeche ho sakti hai.</li>
    </ul>
    ${fig(pyramidSVG(['Small-cap (High Risk/Reward)','Mid-cap (Balanced)','Large-cap (Stable/Safe)']), 'Jitna neeche pyramid me jaoge, utna stability zyada')}
    <div class="callout">Beginners ke liye tip: portfolio ka bada hissa <b>large-cap</b> me rakho, thoda hissa mid/small-cap me — isse balance bana rehta hai.</div>
    `
  },
  {
    heading:'Dividend Aur Bonus Shares Samjho',
    body:`
    <p>Company apne shareholders ko reward dene ke 2 common tarike:</p>
    <ul>
      <li><b>Dividend</b> — company apne profit ka ek hissa cash ke roop me directly tumhare bank account me deti hai (per share basis, jaise ₹5/share).</li>
      <li><b>Bonus Shares</b> — company tumhe <b>extra free shares</b> deti hai (jaise 1:1 bonus matlab har 1 share ke liye 1 aur free share).</li>
    </ul>
    <div class="trick-box"><div class="tb-title">💡 GOOD TO KNOW</div>Sabhi companies dividend nahi deti — kayi growth companies profit ko business me hi wapas laga deti hai (reinvest) taaki company aur tezi se badhe. Ye galat nahi hai, bas ek alag strategy hai.</div>
    `
  }
  ]
},

/* ---------------- CH 3 ---------------- */
{
  num:3, group:'beginner', title:'Demat & Trading Account',
  pages:[
  {
    heading:'Demat Account vs Trading Account',
    body:`
    <p>Sharemarket me invest karne ke liye tumhe 2 accounts chahiye hote hai — dono alag kaam karte hai:</p>
    <ul>
      <li><b>Demat Account</b> — ye tumhare shares ko <b>digital form me store</b> karta hai (jaise bank account paisa store karta hai, waise ye shares store karta hai).</li>
      <li><b>Trading Account</b> — ye tumhe shares <b>buy/sell</b> karne deta hai (jaise ATM se paisa nikalna/dalna).</li>
    </ul>
    ${fig(flowSVG(['Bank Account','Trading A/c','Demat A/c','Own Shares']), 'Paisa bank se → trading account se order → shares demat me store')}
    `
  },
  {
    heading:'Account Kaise Khole?',
    body:`
    <p>Aaj-kal ye process bilkul <b>online aur 15-20 minute</b> ka hai:</p>
    <ol>
      <li>Ek trusted <b>broker</b> choose karo (Zerodha, Groww, Upstox, Angel One jaise apps).</li>
      <li><b>PAN card, Aadhaar, bank details</b> aur ek selfie/signature upload karo.</li>
      <li><b>KYC verify</b> ho jaane ke baad account ready ho jaata hai.</li>
    </ol>
    <div class="callout">Broker charges dhyan se dekho: <b>Brokerage fee</b> (har trade par), <b>AMC</b> (Demat account ka yearly maintenance charge), aur <b>DP charges</b> (jab share sell karte ho).</div>
    `
  },
  {
    heading:'Order Types Samjho',
    body:`
    <p>Jab tum share buy/sell karte ho, tumhe order type choose karna padta hai:</p>
    <ul>
      <li><b>Market Order</b> — turant, jo bhi current price hai usi par trade ho jaata hai. Fast, par price thodi upar-neeche ho sakti hai.</li>
      <li><b>Limit Order</b> — tum apni pasand ki price set karte ho, order tabhi complete hoga jab market wahi price touch kare.</li>
      <li><b>Stop-Loss Order</b> — agar price tumhare against jaaye, to automatically sell ho jaata hai — loss ko control karne ke liye <b>sabse important tool</b>.</li>
    </ul>
    <div class="trick-box"><div class="tb-title">💡 HIGH TRICK</div>Har trade me <b>Stop-Loss lagana kabhi mat bhoolo</b> — professional traders bhi isi rule se apna paisa bachate hai. "No stop-loss" ek beginner ki sabse badi galti hoti hai.</div>
    `
  },
  {
    heading:'Brokerage Aur Charges Ka Poora Hisaab',
    body:`
    <p>Har trade par chhote-chhote charges lagte hai — inhe samajhna zaroori hai taaki tumhara actual profit clearly pata chale:</p>
    <ul>
      <li><b>Brokerage</b> — broker ki fee (flat ₹20/order ya kabhi free bhi hota hai delivery par).</li>
      <li><b>STT (Securities Transaction Tax)</b> — government tax, har buy/sell par lagta hai.</li>
      <li><b>GST</b> — brokerage par 18% tax.</li>
      <li><b>Stamp Duty</b> — state government ka chhota charge.</li>
      <li><b>DP Charges</b> — jab share demat se sell hota hai, ek fixed charge lagta hai.</li>
    </ul>
    <div class="callout">Intraday/F&O me ye charges baar-baar lagte hai isliye <b>overtrading se bachna</b> chahiye — chhote-chhote charges mil kar profit kaafi kam kar dete hai.</div>
    `
  },
  {
    heading:'Trading App Ka Dashboard Kaise Padhein',
    body:`
    <p>Kisi bhi broker app me ye main sections hote hai jo tumhe roz use karne aayenge:</p>
    <ul>
      <li><b>Watchlist</b> — jo stocks tum follow karna chahte ho, unki list.</li>
      <li><b>Order Book</b> — tumne jo orders lagaye hai (pending, complete, cancelled) uski history.</li>
      <li><b>Positions</b> — abhi tumhare paas jo open trades hai (intraday/F&O).</li>
      <li><b>Holdings</b> — tumhare demat account me jo shares long-term rakhe hai.</li>
      <li><b>Funds</b> — kitna paisa account me available hai trading ke liye.</li>
    </ul>
    ${fig(flowSVG(['Watchlist','Order Book','Positions','Holdings']), 'Trading app ka basic flow — sabse pehle inhe explore karo')}
    `
  }
  ]
},

/* ---------------- CH 4 ---------------- */
{
  num:4, group:'beginner', title:'Nifty, Sensex Aur Indices',
  pages:[
  {
    heading:'Index Kya Hota Hai?',
    body:`
    <p>Index ek <b>"report card"</b> ki tarah hai jo poori market ka mood batata hai. Isme kuch selected top companies ke shares ko mila kar ek number banaya jaata hai.</p>
    <ul>
      <li><b>Nifty 50</b> — NSE ke top 50 companies ka index.</li>
      <li><b>Sensex</b> — BSE ke top 30 companies ka index.</li>
    </ul>
    ${fig(donutSVG([{label:'Banking',val:32,color:'#12b76a'},{label:'IT',val:18,color:'#d4af37'},{label:'Energy',val:14,color:'#e5484d'},{label:'Others',val:36,color:'#324158'}]), 'Nifty ka sector-wise weight (approx example)')}
    <p>Agar Nifty 200 points upar gaya, matlab overall market "green" (upar) hai. Agar neeche gaya, matlab overall market "red" (neeche) hai.</p>
    `
  },
  {
    heading:'Sector Indices Bhi Hote Hai',
    body:`
    <p>Nifty 50 ke alawa specific industries ke bhi index hote hai, jaise:</p>
    <ul>
      <li><b>Nifty Bank</b> — sirf banking companies.</li>
      <li><b>Nifty IT</b> — sirf IT companies.</li>
      <li><b>Nifty Auto, Nifty Pharma, Nifty FMCG</b> — apne-apne sector ke liye.</li>
    </ul>
    <p>Ye sector index tumhe batate hai ki konsa sector abhi <span class="hi">strong</span> chal raha hai aur konsa <span class="lo">weak</span> — smart traders isko dekhkar decide karte hai ki kis sector me invest kare.</p>
    `
  },
  {
    heading:'Index Ko Follow Kyu Kare?',
    body:`
    <p>Index ek <b>benchmark</b> ki tarah kaam karta hai — agar tumhara stock ya mutual fund index se kam return de raha hai, to shayad wo achha investment nahi hai.</p>
    <div class="callout">Beginners ke liye ek popular idea hota hai <b>Index Fund / Index ETF</b> me invest karna — isme tumhe individual company choose nahi karni padti, poore index me automatically diversify ho jaata hai.</div>
    `
  },
  {
    heading:'Index Kaise Calculate Hota Hai?',
    body:`
    <p>Nifty/Sensex "Free-Float Market Capitalization" method se calculate hote hai — simple bhasha me:</p>
    <ol>
      <li>Har company ki <b>market value</b> nikalo (share price × publicly available shares).</li>
      <li>Sabhi 50 (ya 30) companies ki value <b>weighted average</b> me combine karo.</li>
      <li>Jo company jitni badi, index par uska <b>utna hi zyada asar</b> padta hai.</li>
    </ol>
    <div class="callout">Isliye jab koi bahut badi company (jaise Reliance/HDFC Bank) badi move deti hai, poora Nifty index hil jaata hai — chhoti company se utna farak nahi padta.</div>
    `
  },
  {
    heading:'Global Indices Ka India Par Asar',
    body:`
    <p>Aaj ki duniya connected hai — India ka market akela nahi chalta, global cues ka bhi bada role hota hai:</p>
    <ul>
      <li><b>Dow Jones / Nasdaq (USA)</b> — raat ko US market girne/badhne se agle din India ka market bhi asar leta hai.</li>
      <li><b>Crude Oil Prices</b> — India oil import karta hai, mehenga crude India ke market ko negatively affect kar sakta hai.</li>
      <li><b>FII/DII Flow</b> — Foreign aur Domestic Institutional Investors jab bada paisa lagate/nikalte hai, market move karta hai.</li>
    </ul>
    ${fig(lineSVG([40,42,38,45,50,48,55,60,58,65]), 'Global market ke sath India ka correlation aksar dikhta hai')}
    `
  }
  ]
},

/* ---------------- CH 5 ---------------- */
{
  num:5, group:'beginner', title:'Intraday vs Delivery vs Investing',
  pages:[
  {
    heading:'Intraday Trading Kya Hai?',
    body:`
    <p><b>Intraday</b> matlab share ko <b>usi din</b> khareed kar usi din market close hone se pehle bech dena (3:30 PM tak). Raat ko koi position nahi rakhte.</p>
    <div class="callout">⚠️ Intraday me <b>leverage</b> milta hai (jyada quantity trade karne ki power), jisse profit bhi fast hota hai aur <b>loss bhi utna hi fast</b> ho sakta hai. Ye beginners ke liye high-risk hai.</div>
    `
  },
  {
    heading:'Delivery / Long-Term Investing',
    body:`
    <p><b>Delivery</b> trading me tum share khareed kar apne demat account me <b>rakh lete ho</b> — 1 din, 1 mahina, ya saalon tak. Isme koi time-limit nahi hai.</p>
    ${fig(candleSVG([{o:20,h:26,l:18,c:24},{o:24,h:30,l:22,c:28},{o:28,h:29,l:24,c:26},{o:26,h:34,l:25,c:32},{o:32,h:40,l:30,c:38},{o:38,h:44,l:36,c:42}]), 'Long-term me chote-chote ups-downs ke bawajood overall trend upar ja sakta hai')}
    <p>Long-term investing beginners ke liye generally <b>safer aur simpler</b> hoti hai, kyunki tumhe daily market dekhne ki tension nahi hoti — <b>compounding</b> apna kaam karti hai.</p>
    `
  },
  {
    heading:'Swing & Positional Trading',
    body:`
    <p>Intraday aur long-term investing ke beech me 2 aur styles hai:</p>
    <ul>
      <li><b>Swing Trading</b> — kuch din se kuch hafte tak hold karna, chote trend catch karne ke liye.</li>
      <li><b>Positional Trading</b> — kuch hafte se mahino tak hold karna, bade trend catch karne ke liye.</li>
    </ul>
    <div class="trick-box"><div class="tb-title">💡 KONSA STYLE CHUNE?</div>Agar tumhare paas <b>time nahi hai</b> screen dekhne ka → Long-term investing chuno.<br>Agar tum <b>seekhna</b> chahte ho charts → Swing trading se start karo (kam risk, kam stress vs intraday).</div>
    `
  },
  {
    heading:'Leverage Aur Margin Kya Hota Hai?',
    body:`
    <p><b>Leverage</b> broker tumhe extra "buying power" deta hai — jaise ₹10,000 se ₹50,000 ka trade karne ki permission (5x leverage), intraday/F&O me common hai.</p>
    ${fig(pyramidSVG(['5x Leverage = 5x Loss Risk','2x Leverage = 2x Loss Risk','No Leverage = Actual Capital Risk']), 'Leverage jitna zyada, risk utna hi zyada — profit aur loss dono amplify hote hai')}
    <div class="callout">⚠️ Leverage <b>double-edged sword</b> hai — profit jaldi badhta hai, par loss bhi utni hi speed se badhta hai. Beginners ko leverage bahut soch-samajh kar use karna chahiye.</div>
    `
  },
  {
    heading:'Konsa Trading Style Tumhare Liye Best Hai?',
    body:`
    <p>Apne aap se ye 3 sawal poochho:</p>
    <ul>
      <li><b>Kitna time de sakte ho?</b> Poora din → Intraday possible. 1 ghanta → Swing. Bahut kam → Long-term investing.</li>
      <li><b>Risk lene ki capacity?</b> High → Intraday/F&O. Medium → Swing. Low → Long-term.</li>
      <li><b>Goal kya hai?</b> Quick income → Trading styles. Wealth creation → Long-term investing.</li>
    </ul>
    <div class="trick-box"><div class="tb-title">💡 HONEST ADVICE</div>90% naye traders jo seedha intraday se shuru karte hai loss me jaate hai. Beginners ke liye best rasta: pehle <b>long-term investing + thoda swing trading</b> se experience banao, phir dheere-dheere aage badho.</div>
    `
  }
  ]
},

/* ---------------- CH 6 ---------------- */
{
  num:6, group:'beginner', title:'Candlestick Kaise Samjhe',
  pages:[
  {
    heading:'Ek Candle Ki Anatomy',
    body:`
    <p>Har candlestick 4 cheezein batata hai ek fixed time (jaise 1 minute, 1 din, 1 hafta) ke liye:</p>
    <ul>
      <li><b>Open</b> — us time period ki shuruaati price</li>
      <li><b>High</b> — us period ki sabse upar wali price</li>
      <li><b>Low</b> — us period ki sabse neeche wali price</li>
      <li><b>Close</b> — us period ki aakhri price</li>
    </ul>
    ${fig(candleSVG([{o:30,h:60,l:20,c:52},{o:52,h:58,l:24,c:28}]), 'Left: Green candle (Close > Open = price upar gayi). Right: Red candle (Close < Open = price neeche gayi)')}
    <p><span class="hi">Green candle</span> = buyers jeete (bullish). <span class="lo">Red candle</span> = sellers jeete (bearish).</p>
    `
  },
  {
    heading:'Bullish vs Bearish — Rang Ka Matlab',
    body:`
    <p>Candle ka <b>upar wala thin line</b> use hota hai "upper wick" — batata hai price kitni upar tak gayi thi phir wapas aa gayi.</p>
    <p>Candle ka <b>neeche wala thin line</b> use hota hai "lower wick" — batata hai price kitni neeche tak gayi thi phir wapas aa gayi.</p>
    ${fig(candleSVG([{o:35,h:70,l:30,c:60},{o:60,h:65,l:15,c:55},{o:55,h:58,l:50,c:52}]), 'Alag-alag body/wick size alag story batati hai')}
    <div class="callout">Lambi body = strong momentum. Choti body + lambi wick = market me confusion/indecision.</div>
    `
  },
  {
    heading:'3 Basic Patterns Jo Har Beginner Ko Pata Hone Chahiye',
    body:`
    <ul>
      <li><b>Doji</b> — open aur close almost same price, chota body — matlab market confused hai, trend change ho sakta hai.</li>
      <li><b>Hammer</b> — choti body upar, lambi wick neeche — downtrend ke baad aaye to reversal (upar jaane) ka signal.</li>
      <li><b>Engulfing</b> — ek badi candle pichli chhoti candle ko poori tarah "cover" kar leti hai — strong reversal signal.</li>
    </ul>
    ${fig(candleSVG([{o:40,h:42,l:38,c:41},{o:41,h:43,l:30,c:42}]), 'Doji: bahut chota body — market "soch" raha hai')}
    <div class="trick-box"><div class="tb-title">💡 REMEMBER</div>Ek akela candlestick pattern kabhi bhi <b>100% guarantee</b> nahi hota — hamesha volume aur trend ke saath confirm karo.</div>
    `
  },
  {
    heading:'Shooting Star Aur Hanging Man',
    body:`
    <p>Ye 2 patterns dikhne me same hote hai (chota body, lambi upper wick) par context alag matlab deta hai:</p>
    ${fig(candleSVG([{o:38,h:60,l:36,c:40},{o:40,h:42,l:20,c:38}]), 'Left: Shooting Star (uptrend ke baad = bearish reversal). Right: Hammer jaisa dikhta hai par uptrend me aaye to Hanging Man kehlata hai (bearish warning)')}
    <ul>
      <li><b>Shooting Star</b> — uptrend ke baad aata hai, lambi upper wick batati hai buyers try karke fail ho gaye, sellers haavi ho gaye — reversal down ka signal.</li>
      <li><b>Hanging Man</b> — uptrend ke baad aata hai (dikhta hai Hammer jaisa), par yaha ye <b>warning sign</b> hai ki trend palat sakta hai.</li>
    </ul>
    `
  },
  {
    heading:'Spinning Top Aur Marubozu',
    body:`
    <ul>
      <li><b>Spinning Top</b> — chota body, dono taraf (upar-neeche) lambi wicks — market me confusion, koi clear winner nahi (buyers vs sellers barabar).</li>
      <li><b>Marubozu</b> — bina kisi wick ke, poori body hi candle — <b>bahut strong</b> momentum ka signal (green Marubozu = strong buying, red Marubozu = strong selling).</li>
    </ul>
    ${fig(candleSVG([{o:30,h:38,l:22,c:34},{o:20,h:52,l:20,c:52}]), 'Left: Spinning Top (confusion). Right: Marubozu (full-body, koi wick nahi = pure strength)')}
    <div class="callout">Pattern yaad rakhne ka simple tarika: <b>body ka size</b> = "conviction/confidence", <b>wick ka size</b> = "confusion/rejection". Chhoti body + badi wick = doubt. Badi body + choti wick = strong belief.</div>
    `
  }
  ]
},

/* ---------------- CH 7 : Beginner High Tricks ---------------- */
{
  num:7, group:'beginner', title:'High Tricks Chapter (Beginners)',
  pages:[
  {
    heading:'Trend Follow Karna Seekho',
    body:`
    <p>Sabse simple aur powerful rule: <b>"Trend is your friend"</b> — matlab jo direction market chal rahi hai, usi ke saath trade karo, uske against nahi.</p>
    ${fig(lineSVG([20,24,22,28,26,34,32,40,38,46,44,52]), 'Higher Highs + Higher Lows = Uptrend. Isi direction me trade dhoondo.')}
    <ul>
      <li><b>Uptrend</b> — har peak pichle peak se upar, har low pichle low se upar.</li>
      <li><b>Downtrend</b> — har peak pichle peak se neeche, har low pichle low se neeche.</li>
      <li><b>Sideways</b> — price ek range me hi ghoomti rehti hai, koi clear direction nahi.</li>
    </ul>
    `
  },
  {
    heading:'Kaha Invest Kare — Beginner Guide',
    body:`
    <p>Shuru me ye 4 cheezein dekh kar hi companies choose karo:</p>
    <ol>
      <li><b>Business samajh me aata ho</b> — jis company ka kaam tumhe pata hai (jaise bank, FMCG, IT).</li>
      <li><b>Profit consistently ho raha ho</b> — company ka past 3-5 saal ka result dekho.</li>
      <li><b>Zyada karza (debt) na ho</b> — debt-heavy companies risky hoti hai.</li>
      <li><b>Diversify karo</b> — sara paisa ek hi stock me mat lagao, 5-10 alag stocks/sectors me phailao.</li>
    </ol>
    ${fig(donutSVG([{label:'Banking',val:25,color:'#12b76a'},{label:'IT',val:20,color:'#d4af37'},{label:'FMCG',val:20,color:'#4f8cff'},{label:'Pharma',val:15,color:'#e5484d'},{label:'Others',val:20,color:'#324158'}]), 'Ek healthy beginner portfolio diversification ka example')}
    `
  },
  {
    heading:'Support & Resistance — Entry/Exit Ka Trick',
    body:`
    <p><b>Support</b> — wo price level jaha se stock baar-baar upar bounce karta hai (jaise ek "floor").</p>
    <p><b>Resistance</b> — wo price level jaha se stock baar-baar neeche aata hai (jaise ek "ceiling").</p>
    ${fig(lineSVG([40,50,42,52,40,55,41,58,40,56]), 'Price baar-baar 40 (support) se bounce ho rahi hai — ye ek buy zone ho sakta hai')}
    <div class="trick-box"><div class="tb-title">💡 HIGH TRICK</div>Support ke paas <b>buy</b> karna aur resistance ke paas <b>book profit/sell</b> karna — ye beginners ke liye sabse practical strategy hai. Resistance todkar upar nikalna (breakout) bhi strong buy signal hota hai.</div>
    `
  },
  {
    heading:'Beginner Ki Sabse Badi Galtiyan (Avoid Karo!)',
    body:`
    <ul>
      <li><b>Stop-loss na lagana</b> — ek hi bure trade se poora paisa doob sakta hai.</li>
      <li><b>Overtrading</b> — bahut zyada trades karna, sirf "kuch karna hai" isliye.</li>
      <li><b>FOMO</b> (Fear Of Missing Out) — sirf isliye khareedna kyunki price bahut fast bhaag rahi hai.</li>
      <li><b>Bina research ke "tip" follow karna</b> — kisi ne bola "ye stock upar jayega" aur tumne bina check kiye paisa laga diya.</li>
      <li><b>Poora paisa ek hi trade me lagana</b> — hamesha capital ka chota hissa (5-10%) ek trade me lagao.</li>
    </ul>
    <div class="callout">${glyph('shield')}<b>Golden Rule:</b> Pehle capital <b>bachana</b> seekho, profit apne aap aayega. Warren Buffett ka famous rule hai: "Rule No.1 — Never lose money. Rule No.2 — Never forget Rule No.1."</div>
    `
  },
  {
    heading:'Moving Average — Beginner Level Use',
    body:`
    <p>Ek simple aur powerful trick: chart par <b>20-day Moving Average</b> line laga lo (har trading app me free milta hai).</p>
    ${fig(lineSVG([25,28,26,32,30,36,34,40,38,44]), 'Price MA line ke upar chal rahi hai = short-term trend bullish hai')}
    <ul>
      <li>Price MA line ke <b>upar</b> chal rahi ho → short-term trend <span class="hi">bullish</span> maano.</li>
      <li>Price MA line ke <b>neeche</b> chal rahi ho → short-term trend <span class="lo">bearish</span> maano.</li>
    </ul>
    <div class="trick-box"><div class="tb-title">💡 BEGINNER TRICK</div>Sirf tab buy karne ka socho jab price MA line ke upar ho aur uptrend confirm ho — isse random guessing kaafi kam ho jaati hai.</div>
    `
  },
  {
    heading:'Paper Trading Se Practice Karo (Real Paisa Se Pehle)',
    body:`
    <p><b>Paper Trading</b> matlab virtual/fake money se trading practice karna — bilkul real market conditions me, par bina asli paisa risk kiye.</p>
    <ol>
      <li>Koi paper trading app ya broker ka "practice mode" use karo.</li>
      <li>Kam se kam <b>1-2 mahine</b> isse practice karo — apni strategy test karo.</li>
      <li>Jab consistently achhe results milne lage, tabhi thodi si real (chhoti) amount se start karo.</li>
    </ol>
    <div class="callout">${glyph('target')}Professional traders bhi nayi strategy pehle paper trading me test karte hai. "Pehle seekho, phir kamao" — is order ko kabhi mat badlo.</div>
    `
  }
  ]
},

/* ---------------- CH 8 : Professional ---------------- */
{
  num:8, group:'pro', title:'Advanced Candlestick & Chart Patterns',
  pages:[
  {
    heading:'Multi-Candle Reversal Patterns',
    body:`
    <p>Professional traders sirf ek candle nahi, <b>2-3 candles ka combination</b> dekhte hai — ye zyada reliable signals dete hai.</p>
    ${fig(candleSVG([{o:50,h:52,l:35,c:38},{o:36,h:40,l:30,c:34},{o:33,h:56,l:32,c:54}]), 'Morning Star: badi red candle → chhoti indecision candle → badi green candle = strong bottom reversal')}
    <ul>
      <li><b>Morning Star</b> — downtrend ke end me bottom reversal (bullish).</li>
      <li><b>Evening Star</b> — uptrend ke end me top reversal (bearish) — isi ka opposite.</li>
      <li><b>Three White Soldiers</b> — 3 lagatar badi green candles = strong bullish momentum.</li>
      <li><b>Three Black Crows</b> — 3 lagatar badi red candles = strong bearish momentum.</li>
    </ul>
    `
  },
  {
    heading:'Chart Patterns Jo "Magic" Lagte Hai',
    body:`
    <p>Ye patterns bade timeframe par bante hai aur institutional players inhe closely follow karte hai:</p>
    <ul>
      <li><b>Head & Shoulders</b> — 3 peaks (beech wala sabse bada) = trend reversal signal (top se downtrend).</li>
      <li><b>Double Top / Double Bottom</b> — price 2 baar same level test karke reverse hoti hai.</li>
      <li><b>Triangles (Ascending/Descending/Symmetrical)</b> — price narrow hoti jaati hai, phir ek strong breakout aata hai.</li>
      <li><b>Flags & Pennants</b> — strong move ke baad short consolidation, phir wahi direction continue.</li>
    </ul>
    ${fig(lineSVG([30,45,32,48,30,50,32,20,15,12]), 'Double Top pattern: 2 baar same high test karke price neeche gir gayi')}
    `
  },
  {
    heading:'Volume Ke Bina Pattern Adhoora Hai',
    body:`
    <p>Ye "market ka asli magic" hai jo beginners miss karte hai: <b>koi bhi pattern tab tak trustworthy nahi jab tak volume use confirm na kare.</b></p>
    <p>Breakout hote waqt agar <b>volume normal se 2-3x zyada</b> hai, to move genuine hone ke chances zyada hai. Agar breakout low volume par hua, to wo "fake breakout" (trap) ho sakta hai.</p>
    <div class="callout">${glyph('target')}Pro Trick: Pattern + Trend + Volume — teeno mile to hi high-probability trade banta hai. Sirf pattern dekhkar kabhi trade mat lo.</div>
    `
  },
  {
    heading:'Pattern Ko Trend Ke Saath Combine Karna',
    body:`
    <p>Yehi wo "core magic" hai jo professional traders istemal karte hai: <b>continuation patterns</b> ko trend ki direction me hi trade karna, <b>reversal patterns</b> ko trend ke weak hone par dhoondna.</p>
    <ol>
      <li>Pehle bade timeframe (daily/weekly) pe overall trend dekho.</li>
      <li>Fir chhote timeframe pe entry ke liye pattern dhoondo, usi trend ki direction me.</li>
      <li>Volume se confirm karo.</li>
      <li>Stop-loss aur target pehle se fix karo — emotion se decide mat karo.</li>
    </ol>
    `
  },
  {
    heading:'Cup & Handle Pattern',
    body:`
    <p>Ye ek bullish continuation pattern hai jo "U" shape (cup) banata hai, uske baad ek chota downward drift (handle) — phir strong breakout upar.</p>
    ${fig(lineSVG([50,40,30,25,22,25,30,40,50,55,52,48,58,70]), 'Cup (U-shape) ke baad Handle (chhota dip), phir breakout upar')}
    <div class="trick-box"><div class="tb-title">💡 PRO TRICK</div>Handle ke breakout point par entry lena aur cup ki depth ko target ke liye measure karna — ye pattern institutional accumulation ke baad often banta hai.</div>
    `
  },
  {
    heading:'Wedges — Rising Aur Falling',
    body:`
    <ul>
      <li><b>Rising Wedge</b> — price upar ja rahi hai par narrow hoti jaa rahi hai (converging lines upar ki taraf) — usually <span class="lo">bearish</span> breakdown deta hai, even uptrend me.</li>
      <li><b>Falling Wedge</b> — price neeche ja rahi hai par narrow ho rahi hai — usually <span class="hi">bullish</span> breakout deta hai, even downtrend me.</li>
    </ul>
    ${fig(lineSVG([20,35,28,42,36,48,42,52,48,54]), 'Rising Wedge: price upar par range narrow ho rahi hai — reversal ka warning')}
    <div class="callout">Wedges counter-intuitive hote hai — trend ke against breakout dete hai, isliye beginners inhe aksar misread karte hai.</div>
    `
  },
  {
    heading:'Gap Patterns — Gap Up, Gap Down, Island Reversal',
    body:`
    <ul>
      <li><b>Gap Up</b> — stock pichle din ke close se <b>upar</b> khulta hai (achhi news ka signal, jaise strong results).</li>
      <li><b>Gap Down</b> — stock pichle din ke close se <b>neeche</b> khulta hai (buri news ka signal).</li>
      <li><b>Island Reversal</b> — price ek gap se upar jaati hai, kuch din wahi ghoomti hai, phir ek aur gap se neeche aa jaati hai — beech ka hissa ek "island" jaisa lagta hai, strong reversal signal.</li>
    </ul>
    ${fig(candleSVG([{o:30,h:34,l:28,c:32},{o:45,h:50,l:43,c:48},{o:47,h:49,l:44,c:46},{o:30,h:31,l:22,c:24}]), 'Gap Up ke baad thoda consolidation, phir Gap Down — Island Reversal pattern')}
    `
  },
  {
    heading:'Real Case Study — Sab Kuch Combine Karna',
    body:`
    <p>Chalo dekhte hai ek professional trader kaise sochta hai, step-by-step:</p>
    <ol>
      <li><b>Trend check:</b> Weekly chart pe overall trend uptrend hai.</li>
      <li><b>Pattern dhoondo:</b> Daily chart pe Cup & Handle ban raha hai.</li>
      <li><b>Volume confirm karo:</b> Handle breakout ke time volume normal se 2x zyada hai.</li>
      <li><b>Indicator check:</b> RSI 55-60 range me hai (na overbought, na oversold) — healthy zone.</li>
      <li><b>Entry aur Risk:</b> Breakout candle ke close par entry, stop-loss handle ki low ke neeche, target = cup ki depth jitna upar.</li>
    </ol>
    <div class="callout">${glyph('target')}Yehi hai "market ka asli magic" — koi ek secret trick nahi, balki <b>multiple confirmations ka combination</b> jo probability ko tumhare favor me la deta hai.</div>
    `
  }
  ]
},

/* ---------------- CH 9 : Professional ---------------- */
{
  num:9, group:'pro', title:'Technical Indicators — Pro Tools',
  pages:[
  {
    heading:'Moving Averages (SMA/EMA)',
    body:`
    <p><b>Moving Average</b> price ka average nikal ke ek smooth line banata hai, jisse trend clearly dikhta hai — noise hat jaata hai.</p>
    <ul>
      <li><b>SMA</b> (Simple Moving Average) — last N din ka simple average.</li>
      <li><b>EMA</b> (Exponential Moving Average) — recent price ko zyada weight deta hai, fast react karta hai.</li>
    </ul>
    ${fig(lineSVG([20,25,22,30,28,36,33,42,40,48,46,54]),'Price EMA line ke upar rehna = bullish bias')}
    <div class="trick-box"><div class="tb-title">💡 GOLDEN / DEATH CROSS</div><b>Golden Cross</b>: chhoti MA (50-day) badi MA (200-day) ko upar cross kare = strong bullish signal.<br><b>Death Cross</b>: chhoti MA neeche cross kare badi MA ko = strong bearish signal.</div>
    `
  },
  {
    heading:'RSI — Overbought vs Oversold',
    body:`
    <p><b>RSI (Relative Strength Index)</b> 0-100 ke beech move karta hai aur batata hai stock "kitna kharida ja chuka hai" ya "kitna becha ja chuka hai".</p>
    ${fig(gaugeSVG(72,'RSI — Overbought Zone (>70)'), 'RSI 70 se upar = overbought (price girne ka chance), RSI 30 se neeche = oversold (price badhne ka chance)')}
    <p><b>Divergence</b> ek advanced trick hai: agar price naya high bana rahi hai par RSI naya high nahi bana raha — ye weakness ka signal hai, trend jald reverse ho sakta hai.</p>
    `
  },
  {
    heading:'MACD — Momentum Ka Indicator',
    body:`
    <p><b>MACD</b> (Moving Average Convergence Divergence) 2 lines se bana hota hai: MACD line aur Signal line.</p>
    <ul>
      <li>Jab MACD line, Signal line ko <b>upar</b> cross kare → bullish momentum shuru.</li>
      <li>Jab MACD line, Signal line ko <b>neeche</b> cross kare → bearish momentum shuru.</li>
    </ul>
    ${fig(lineSVG([10,15,22,30,28,20,15,10,8,14,22,30]), 'MACD crossover se momentum shift pakadna')}
    <div class="callout">Pro traders MACD ko trend confirmation ke liye use karte hai, akela entry signal ke liye nahi.</div>
    `
  },
  {
    heading:'Support/Resistance + Fibonacci — Pro Level',
    body:`
    <p><b>Fibonacci Retracement</b> ek mathematical tool hai jo batata hai price kitna "pullback" (wapas) aa sakti hai trend continue hone se pehle. Common levels: <b>23.6%, 38.2%, 50%, 61.8%</b>.</p>
    ${fig(lineSVG([20,40,60,80,68,55,62,75,90]), 'Strong move ke baad price 38-61% tak retrace karke phir trend continue karti hai')}
    <div class="trick-box"><div class="tb-title">💡 CORE MARKET TRICK</div>Jab Fibonacci level, Support/Resistance aur Moving Average — teeno ek hi price zone par milte hai, wahan probability sabse high hoti hai. Isse "Confluence Zone" kehte hai — smart money yehi dekhta hai.</div>
    `
  },
  {
    heading:'Bollinger Bands — Volatility Ka Indicator',
    body:`
    <p><b>Bollinger Bands</b> 3 lines se bante hai: ek Moving Average (middle) aur uske upar-neeche 2 bands (standard deviation se calculate hote hai).</p>
    ${fig(lineSVG([30,35,32,40,38,48,44,58,50,65]), 'Price bands ke bahar jaaye to "overextended" — wapas andar aane ka chance zyada')}
    <ul>
      <li>Bands <b>narrow</b> ho jaaye → low volatility, bada move jald aane wala ho sakta hai ("squeeze").</li>
      <li>Price upper band touch kare → possibly overbought.</li>
      <li>Price lower band touch kare → possibly oversold.</li>
    </ul>
    `
  },
  {
    heading:'VWAP — Volume Weighted Average Price',
    body:`
    <p><b>VWAP</b> din bhar ke trading ka average price nikalta hai, volume ko weight deke — institutional traders ka favorite benchmark hai.</p>
    <div class="callout">Price VWAP ke <b>upar</b> ho to intraday bullish bias, VWAP ke <b>neeche</b> ho to bearish bias — bade players apne bade orders VWAP ke aas-paas hi execute karne ki koshish karte hai taaki market disturb na ho.</div>
    <div class="trick-box"><div class="tb-title">💡 PRO TRICK</div>Intraday trading me VWAP ko ek "fair price" line ki tarah treat karo — bahut door se VWAP ki taraf wapas aane ka tendency hota hai.</div>
    `
  },
  {
    heading:'ADX — Trend Ki Strength Napna',
    body:`
    <p><b>ADX (Average Directional Index)</b> 0-100 ke beech move karta hai, par ye <b>direction nahi, sirf strength</b> batata hai:</p>
    ${fig(gaugeSVG(38,'ADX — Moderate Trend Strength'), 'ADX 25 se upar = strong trend, ADX 20 se neeche = weak/sideways market')}
    <ul>
      <li><b>ADX &lt; 20</b> — weak trend ya sideways market, trend-following strategies avoid karo.</li>
      <li><b>ADX &gt; 25</b> — strong trend chal raha hai, trend-following strategies achhi kaam karengi.</li>
    </ul>
    `
  },
  {
    heading:'Multiple Indicator Confluence — Ek Sample Strategy',
    body:`
    <p>Ek professional-style strategy ka structure aisa dikh sakta hai (sirf example, apna khud test karna zaroori hai):</p>
    <ol>
      <li><b>Trend Filter:</b> Price 50-EMA ke upar ho (uptrend confirm).</li>
      <li><b>Strength Filter:</b> ADX 25 se upar ho (trend strong hai).</li>
      <li><b>Entry Trigger:</b> RSI 40-50 zone se upar cross kare (momentum shift).</li>
      <li><b>Confirmation:</b> Volume above average ho us candle par.</li>
      <li><b>Risk:</b> Stop-loss recent swing low ke neeche, target 1:2 risk-reward minimum.</li>
    </ol>
    <div class="callout">${glyph('target')}Jitne zyada indicators ek hi direction confirm karein, utna hi high-probability setup banta hai — par kabhi bhi 4-5 se zyada indicators ek saath mat use karo, "analysis paralysis" ho jaata hai.</div>
    `
  }
  ]
},

/* ---------------- CH 10 : Professional ---------------- */
{
  num:10, group:'pro', title:'Risk, Psychology & Market Ke Pro Secrets',
  pages:[
  {
    heading:'Risk Management — Sabse Important Skill',
    body:`
    <p>Professional traders "kitna kama sakte hai" se zyada "<b>kitna khoyenge</b>" pe focus karte hai. Yehi unhe beginners se alag banata hai.</p>
    ${fig(pyramidSVG(['High Risk (Options/F&O)','Medium Risk (Swing Trades)','Low Risk (Blue-chip Stocks)','Foundation (Emergency Fund)']), 'Risk pyramid: foundation strong ho, tabhi upar risk lo')}
    <ul>
      <li><b>Position Sizing</b> — kabhi bhi apne total capital ka 2-3% se zyada ek trade me risk mat lo.</li>
      <li><b>Risk:Reward Ratio</b> — kam se kam 1:2 rakho (₹1 risk karke ₹2 kamane ka target).</li>
      <li><b>Stop-loss discipline</b> — jo plan banaya hai usse emotionally deviate mat karo.</li>
    </ul>
    `
  },
  {
    heading:'Trading Psychology — Dimaag Ka Khel',
    body:`
    <p>Market 20% strategy aur <b>80% psychology</b> hai. Do sabse bade dushman hai:</p>
    <ul>
      <li><b>Greed (Lalach)</b> — profit hone ke baad bhi position hold karte rehna, "aur upar jayega" soch kar.</li>
      <li><b>Fear (Dar)</b> — thoda sa loss hote hi panic me sell kar dena, plan follow kiye bina.</li>
    </ul>
    <div class="callout">${glyph('shield')}Har trade ke baad ek <b>trading journal</b> likho — kya socha, kyu entry li, kya result mila. Isse tumhe apni khud ki galtiyan clearly dikhengi.</div>
    `
  },
  {
    heading:'Smart Money Concept — "Market Ka Magic"',
    body:`
    <p>Bade institutional players (FII/DII, big funds) chhote retail traders ki tarah trade nahi karte — unke paas itna capital hota hai ki unke orders khud price move karte hai.</p>
    <ul>
      <li><b>Accumulation</b> — smart money chupke-chupke kharidti hai jab price sideways lagti hai.</li>
      <li><b>Markup</b> — phir price ko upar push karte hai, retail traders FOMO me aakar khareedte hai.</li>
      <li><b>Distribution</b> — smart money apna stock high price par retail ko bech deti hai.</li>
    </ul>
    ${fig(lineSVG([20,21,20,22,21,23,35,50,65,60,45,30]), 'Accumulation (flat) → Markup (upar) → Distribution (top pe flat/gir)')}
    <div class="trick-box"><div class="tb-title">💡 PRO TRICK</div>Volume ko price ke saath dekho — agar price sideways hai par volume gradually badh raha hai, "smart money" accumulate kar rahi ho sakti hai.</div>
    `
  },
  {
    heading:'Options Trading Basics — Call Aur Put',
    body:`
    <p><b>Options</b> ek "right" (zaroorat nahi) hota hai kisi stock ko fixed price par future me buy/sell karne ka. Ye advanced tool hai, sirf achhi understanding ke baad hi use karo.</p>
    <ul>
      <li><b>Call Option</b> — kharidte ho jab tumhe lagta hai price <span class="hi">upar</span> jayegi.</li>
      <li><b>Put Option</b> — kharidte ho jab tumhe lagta hai price <span class="lo">neeche</span> jayegi.</li>
    </ul>
    ${fig(pyramidSVG(['Options (Highest Risk)','Intraday Equity (High Risk)','Swing Trading (Medium)','Long-term Investing (Lower Risk)']), 'Options sabse zyada risky category me aate hai — leverage bahut high hota hai')}
    <div class="callout">⚠️ Options me poora premium (invested amount) zero bhi ho sakta hai agar prediction galat gayi — beginners ko iski poori seriousness samajhe bina isme kabhi nahi utarna chahiye.</div>
    `
  },
  {
    heading:'Hedging — Apna Risk Kam Karne Ka Tareeka',
    body:`
    <p><b>Hedging</b> matlab apni existing position ke against ek "insurance" jaisi position lena, taaki bade loss se bacha ja sake.</p>
    <p>Example: Tumhare paas ek stock ka bada portfolio hai aur tumhe lagta hai short-term me market gir sakta hai. Tum us risk ko kam karne ke liye ek <b>Put Option</b> khareed sakte ho — agar market gira, Put se profit hoga jo portfolio ke loss ko balance karega.</p>
    <div class="trick-box"><div class="tb-title">💡 PRO CONCEPT</div>Hedging se profit maximize nahi hota, balki <b>downside protect</b> hota hai — bade institutional players isse regularly use karte hai apna capital surakshit rakhne ke liye.</div>
    `
  },
  {
    heading:'Apna Trading Plan Banao — Pro Checklist',
    body:`
    <p>Har professional trader ke paas ek likha hua plan hota hai — random decisions nahi lete. Apna khud ka checklist banao:</p>
    <ol>
      <li>Main kis market/timeframe me trade karunga? (intraday/swing/long-term)</li>
      <li>Entry ka criteria kya hai? (pattern + indicator + trend)</li>
      <li>Stop-loss kaha rakhunga? (fixed % ya technical level)</li>
      <li>Target kya hoga? (risk:reward minimum 1:2)</li>
      <li>Ek din/hafte me maximum kitna risk lunga? (total capital ka kitna %)</li>
      <li>Trade ke baad journal me kya likhunga?</li>
    </ol>
    <div class="callout">${glyph('shield')}Plan likhne se emotions control me rehte hai — jab market me action ho raha ho, tab decide karna sabse risky hota hai. Plan pehle se ready rakho.</div>
    `
  },
  {
    heading:'Pro-Level Mistakes Jo Experienced Traders Bhi Karte Hai',
    body:`
    <ul>
      <li><b>Revenge Trading</b> — ek loss ke baad turant "wapas kamane" ke liye bina soche next trade lena.</li>
      <li><b>Over-leveraging</b> — ek achhe trade ke baad overconfidence me bahut zyada size le lena.</li>
      <li><b>Indicator Overload</b> — bahut saare indicators use karke confuse ho jaana, kabhi decide na kar paana.</li>
      <li><b>Plan follow na karna</b> — plan banane ke baad bhi "gut feeling" par trade change kar dena.</li>
    </ul>
    <div class="trick-box"><div class="tb-title">💡 FINAL PRO TIP</div>Consistency, discipline aur risk management — ye teeno mile kar hi long-term me pro trader banate hai, koi single "secret indicator" nahi hota.</div>
    `
  },
  {
    heading:'Taxes Aur Record-Keeping — Pro Traders Ye Bhi Manage Karte Hai',
    body:`
    <p>Professional trading sirf charts tak seemit nahi — apna paisa manage karna bhi utna hi zaroori hai:</p>
    <ul>
      <li><b>Short-term Capital Gains</b> — 1 saal se pehle beche gaye equity shares par tax lagta hai.</li>
      <li><b>Long-term Capital Gains</b> — 1 saal ke baad beche gaye equity shares par alag (usually lower) tax rate hota hai.</li>
      <li><b>Trading Journal</b> — har trade ka record rakhna, taaki tax filing aasan ho aur apni performance bhi track ho sake.</li>
    </ul>
    <div class="callout">Exact tax rates aur rules time ke saath change ho sakte hai — filing se pehle ek qualified CA/tax advisor se zaroor confirm karo.</div>
    `
  },
  {
    heading:'Beginner Se Professional Tak — Tumhara Roadmap',
    body:`
    <ol>
      <li><b>Month 1-2:</b> Basics samjho — market kaise kaam karta hai, demat account kholo, chhoti amount se practice karo.</li>
      <li><b>Month 3-4:</b> Candlestick aur chart patterns seekho, paper trading (virtual money) se practice karo.</li>
      <li><b>Month 5-6:</b> Indicators (MA, RSI, MACD) seekho, apni ek trading strategy banao aur test karo.</li>
      <li><b>Month 6+:</b> Risk management aur psychology master karo, real capital se chhoti size me trade shuru karo.</li>
    </ol>
    <div class="callout">${glyph('bull')}<b>Final Note:</b> Ye book tumhe knowledge deti hai, par sharemarket me risk hamesha rehta hai. Kabhi bhi apni poori "life savings" ek trade me mat lagana. Seekhte raho, patience rakho, aur discipline se trade karo. All the best! 🚀</div>
    `
  }
  ]
}

];

/* ============================================================
   ENRICHMENT PASS — adds one extra chart (candlestick/trend) +
   one extra trick/insight box to EVERY page, on top of the
   original content (nothing removed, only added).
   ============================================================ */

function seededRand(seed){
  const x = Math.sin(seed*99.7 + 13.7)*10000;
  return x - Math.floor(x);
}

function genCandles(seed, n){
  n = n || 6;
  const candles = [];
  let price = 24 + (seed % 22);
  for(let i=0;i<n;i++){
    const dir = seededRand(seed+i*2.1) > 0.46 ? 1 : -1;
    const move = 3 + seededRand(seed+i*3.3)*9;
    const o = price;
    const c = Math.max(6, price + dir*move);
    const h = Math.max(o,c) + seededRand(seed+i*5.5)*4.5;
    const l = Math.max(2, Math.min(o,c) - seededRand(seed+i*7.7)*4.5);
    candles.push({o:o,h:h,l:l,c:c});
    price = c;
  }
  return candles;
}

function genLine(seed, n){
  n = n || 9;
  const pts = [];
  let v = 26 + (seed % 18);
  for(let i=0;i<n;i++){
    v += (seededRand(seed+i*2.3) - 0.36) * 9 + 1.6;
    pts.push(Math.max(6, v));
  }
  return pts;
}

const CHART_CAPTIONS = [
  'Extra practice chart — price action real market jaisa random hoti hai',
  'Ek aur example — isi tarah trend ko chart par pehchano',
  'Bonus chart — candlestick/trend pattern ko baar-baar dekhkar hi practice hoti hai',
  'Aur ek visual — dhyan do kaise har move ke peeche demand-supply chhupi hai',
  'Practice example — apne trading app me isi tarah ke chart dhoondo',
  'Extra reference — trend lines aur candle body dono saath me dekho'
];

const BEGINNER_EXTRA_TIPS = [
  'Candlestick pattern se pehle hamesha <b>overall trend</b> dekho — akela pattern kabhi poori kahani nahi batata.',
  'Market khulte hi (9:15-9:30 AM) volatility zyada hoti hai — beginners chaho to shuru ke 15 minute sirf observe karo, trade baad me karo.',
  'Chhoti candles ka matlab hota hai market "saans le raha hai" — bade move se pehle aksar aisa consolidation hota hai.',
  '<b>Paper trading</b> se practice karte waqt bhi real emotions ki tarah seriously socho — tabhi asli trading me kaam aayega.',
  'Ek achha habit: har hafte apne 2-3 favorite stocks ka chart dekh kar note karo ki price kyu upar/neeche gayi.',
  'Beginners ke liye tip: pehle <b>1-2 sector</b> achhi tarah samjho (jaise banking ya IT), fir dheere-dheere doosre sectors explore karo.',
  'Jab bhi confuse ho ki buy karu ya nahi, apne aap se poochho: "Kya main isi price par naya paisa aaj invest karunga?" — agar jawab "nahi" hai, to shayad abhi sahi time nahi hai.',
  'News dekhkar turant react mat karo — pehle 10-15 minute market ka reaction dekho, phir decide karo.',
  '<b>Small steps:</b> Pehla goal "bada profit" nahi, "bina bade loss ke seekhna" hona chahiye.',
  'Candlestick ke saath hamesha <b>support/resistance</b> zone bhi dekho — akela candle kam reliable hota hai.',
  'Jab market sideways ho (na upar na neeche), naye beginners ko trade kam karna chahiye — is time false signals zyada aate hai.',
  'Apne phone me ek watchlist banao aur usi 8-10 stocks ko roz follow karo — bahut saare stocks track karna beginners ko confuse karta hai.',
  'Green candle ke baad turant khareedna zaroori nahi — pehle dekho volume bhi support kar raha hai ya nahi.',
  'Har trade se pehle khud se poochho: "Agar ye galat gaya to mera loss kitna hoga?" — jawab pata hona chahiye <b>entry lene se pehle</b>.',
  'Beginners ke liye best practice: real paisa lagane se pehle kam se kam 20-30 paper trades karo aur unka result note karo.'
];

const PRO_EXTRA_TIPS = [
  '<b>Confluence Trick:</b> Jab candlestick pattern, moving average aur volume — teeno ek hi direction confirm kare, tabhi high-probability trade maano.',
  'Multi-timeframe analysis: Weekly chart se trend lo, Daily chart se pattern dhoondo, aur entry timing ke liye chhote timeframe (15-min/1-hr) dekho.',
  'Institutional players chhote-chhote orders me apna bada position accumulate karte hai — isliye achanak bade volume spike ko dhyan se dekhna chahiye.',
  'Ek pattern jitna zyada "textbook perfect" dikhta hai, utna hi zyada log usse dekh rahe hote hai — kabhi-kabhi ye hi "trap" (fake breakout) ban jaata hai.',
  '<b>Risk:Reward pehle decide karo, phir entry socho</b> — order reverse me kabhi mat karo (pehle entry, phir risk sochna).',
  'Correlated stocks/sectors ek saath move karte hai — agar Bank Nifty gir raha hai, individual bank stocks me long position lena risky ho sakta hai.',
  'Trend reversal patterns (jaise Head & Shoulders) tabhi zyada reliable hote hai jab wo ek <b>lambe trend ke baad</b> bante hai, beech trend me nahi.',
  'Pro traders apna "worst-case" scenario pehle plan karte hai — best-case sochne se pehle "agar galat gaya to?" ka jawab ready rakho.',
  'Backtesting: koi bhi naya strategy real paise se pehle purane charts par test karo — kam se kam 30-50 historical examples check karo.',
  '<b>Overtrading ek silent killer hai</b> — pro traders bhi kabhi-kabhi "no clear setup" din par koi trade nahi lete, aur ye bhi ek skill hai.',
  'Jab ek hi direction me 3-4 indicators disagree kare, wo "no-trade zone" samjho — clarity na ho to wait karo.',
  'Smart money zyada tar low-volume, quiet periods me accumulate karti hai — sabse "boring" lagne wale charts kabhi-kabhi sabse important hote hai.'
];

CHAPTERS.forEach(function(ch, chIdx){
  ch.pages.forEach(function(pg, pgIdx){
    const seed = (ch.num*17) + (pgIdx*5) + 3;
    const useCandle = (pgIdx + ch.num) % 2 === 0;
    const chartHTML = useCandle
      ? candleSVG(genCandles(seed, 6))
      : lineSVG(genLine(seed, 9));
    const caption = CHART_CAPTIONS[(seed) % CHART_CAPTIONS.length];
    const tipPool = ch.group === 'pro' ? PRO_EXTRA_TIPS : BEGINNER_EXTRA_TIPS;
    const tip = tipPool[(seed + pgIdx*3) % tipPool.length];
    const boxLabel = ch.group === 'pro' ? '🔎 EXTRA PRO INSIGHT' : '✨ EXTRA TIP';

    pg.body += `
    <hr class="div">
    ${fig(chartHTML, caption)}
    <div class="trick-box"><div class="tb-title">${boxLabel}</div>${tip}</div>
    `;
  });
});

/* ============================================================
   BUILD FULL PAGE LIST: cover, toc, then all chapter pages
   ============================================================ */

const TICKER_DATA = [
  {sym:'NIFTY 50', v:'24,812.35', chg:'+142.60 (0.58%)', up:true},
  {sym:'SENSEX', v:'81,559.20', chg:'+468.10 (0.58%)', up:true},
  {sym:'BANKNIFTY', v:'51,203.75', chg:'-85.40 (0.17%)', up:false},
  {sym:'RELIANCE', v:'2,945.10', chg:'+18.25 (0.62%)', up:true},
  {sym:'TCS', v:'4,102.55', chg:'-12.10 (0.29%)', up:false},
  {sym:'HDFCBANK', v:'1,684.90', chg:'+9.40 (0.56%)', up:true},
  {sym:'INFY', v:'1,833.20', chg:'+22.05 (1.22%)', up:true},
];

function buildPages(){
  const pages = [];

  pages.push({type:'cover'});
  pages.push({type:'toc'});

  CHAPTERS.forEach(ch=>{
    ch.pages.forEach((p,i)=>{
      pages.push({
        type:'chapter',
        chapterNum:ch.num,
        group:ch.group,
        chapterTitle:ch.title,
        pageInChapter:i+1,
        totalInChapter:ch.pages.length,
        heading:p.heading,
        body:p.body
      });
    });
  });

  return pages;
}

const PAGES = buildPages();

/* map chapter num -> first page index (for TOC jump) */
const CHAPTER_START_INDEX = {};
PAGES.forEach((p,i)=>{
  if(p.type==='chapter' && CHAPTER_START_INDEX[p.chapterNum]===undefined){
    CHAPTER_START_INDEX[p.chapterNum]=i;
  }
});

/* ============================================================
   RENDERING
   ============================================================ */

function renderCover(){
  return `
  <div class="cover">
    <div class="cover-frame"></div>
    <div class="top-meta">Trading &amp; Investing Guide · India</div>

    <div class="title-block">
      <div class="title-line1">SHARE MARKET</div>
      <div class="title-line2">MASTERY</div>
      <div class="subtitle">
        <div class="split">
          <span class="b">FOR BEGINNERS</span><span class="sep">→</span><span class="p">TO PROFESSIONALS</span>
        </div>
      </div>
      <div class="mid-badge">★ High Professional Trading Guide ★</div>
    </div>

    ${fig(candleSVG([{o:20,h:30,l:15,c:26},{o:26,h:34,l:22,c:22},{o:22,h:24,l:16,c:20},{o:20,h:40,l:19,c:38},{o:38,h:46,l:34,c:44},{o:44,h:45,l:30,c:32},{o:32,h:50,l:31,c:48},{o:48,h:60,l:46,c:58}]),'').replace('class="fig"','class="fig" style="border:none;background:transparent;position:relative;z-index:2;max-width:280px;margin:20px auto"')}

    <div class="bottom-info">
      <div class="author">
        <div class="lbl">Author / Ownership</div>
        <div class="name">Sayed Saruk Ahmed</div>
        <div class="trust">"Simple Hinglish mein, seedha kaam ki baat — beginners se pro tak."</div>
      </div>
      <div class="pro-tag">FOR<br>PROFESSIONAL<br>TRADERS</div>
    </div>
  </div>`;
}

function renderToc(){
  let beg='', pro='';
  CHAPTERS.forEach(ch=>{
    const row = `
    <div class="toc-row ${ch.group==='pro'?'pro':'beg'}" data-jump="${CHAPTER_START_INDEX[ch.num]}">
      <div class="num">${ch.num}</div>
      <div class="txt">
        <div class="t">${ch.title}</div>
        <div class="s">${ch.group==='pro'?'HIGH PROFESSIONAL':'FOR BEGINNERS'} · ${ch.pages.length} pages</div>
      </div>
      <div class="arrow">›</div>
    </div>`;
    if(ch.group==='pro') pro+=row; else beg+=row;
  });
  return `
  <div class="toc-page">
    <div class="tp-title"><span>CONTENTS</span> <span>INDEX</span></div>
    <div class="tp-sub">TAP ANY CHAPTER TO JUMP</div>
    <div class="grp-label">📗 Beginners — Step by Step</div>
    ${beg}
    <div class="grp-label pro">📕 High Professional — Deep Dive</div>
    ${pro}
  </div>`;
}

function renderChapterPage(p){
  const tagClass = p.group==='pro'?'tag pro':'tag';
  const tagText = p.group==='pro'?'HIGH PROFESSIONAL':'FOR BEGINNERS';
  return `
  <div class="pg">
    <div class="pg-eyebrow">
      <span>CHAPTER ${p.chapterNum} · ${p.pageInChapter}/${p.totalInChapter}</span>
      <span class="${tagClass}">${tagText}</span>
    </div>
    <h2 class="pg-title">${p.heading}</h2>
    <hr class="div">
    ${p.body}
  </div>`;
}

function renderPageHTML(idx){
  const p = PAGES[idx];
  if(p.type==='cover') return renderCover();
  if(p.type==='toc') return renderToc();
  return renderChapterPage(p);
}

/* ============================================================
   NAVIGATION ENGINE (flip transition)
   ============================================================ */

let currentIndex = 0;
let animating = false;

const pageCurrentEl = document.getElementById('pageCurrent');
const flipLayerEl = document.getElementById('flipLayer');
const pageIndicatorEl = document.getElementById('pageIndicator');

function attachTocHandlers(root){
  root.querySelectorAll('.toc-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      const idx = parseInt(row.dataset.jump,10);
      closeToc();
      goTo(idx);
    });
  });
}

function paintCurrent(){
  pageCurrentEl.innerHTML = renderPageHTML(currentIndex);
  attachTocHandlers(pageCurrentEl);
  updateIndicator();
}

function updateIndicator(){
  pageIndicatorEl.textContent = `${currentIndex+1} / ${PAGES.length}`;
}

function goTo(idx){
  if(idx<0 || idx>=PAGES.length || idx===currentIndex) return;
  const dir = idx>currentIndex ? 'next' : 'prev';
  doFlip(idx, dir);
}

function doFlip(newIndex, dir){
  if(animating) return;
  animating = true;

  const outgoing = document.createElement('div');
  outgoing.className = 'flip-page';
  outgoing.innerHTML = pageCurrentEl.innerHTML;

  flipLayerEl.innerHTML='';
  flipLayerEl.appendChild(outgoing);

  outgoing.classList.add(dir==='next' ? 'anim-out-next' : 'anim-out-prev');

  currentIndex = newIndex;
  pageCurrentEl.style.opacity='0';

  setTimeout(()=>{
    paintCurrent();
    pageCurrentEl.style.opacity='1';
    flipLayerEl.innerHTML='';
    animating=false;
  }, 230);
}

document.getElementById('btnNext').addEventListener('click', ()=> goTo(currentIndex+1));
document.getElementById('btnPrev').addEventListener('click', ()=> goTo(currentIndex-1));

/* swipe support */
let touchStartX = null;
const viewport = document.getElementById('pageViewport');
viewport.addEventListener('touchstart', e=>{ touchStartX = e.touches[0].clientX; }, {passive:true});
viewport.addEventListener('touchend', e=>{
  if(touchStartX===null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(Math.abs(dx) > 55){
    if(dx<0) goTo(currentIndex+1); else goTo(currentIndex-1);
  }
  touchStartX=null;
});

/* keyboard support (desktop preview) */
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowRight') goTo(currentIndex+1);
  if(e.key==='ArrowLeft') goTo(currentIndex-1);
});

/* ============================================================
   FONT SIZE CONTROLS
   ============================================================ */
let fontScale = parseFloat(localStorage.getItem('smm_font') || '1');
document.documentElement.style.setProperty('--font-scale', fontScale);

function applyFont(){
  document.documentElement.style.setProperty('--font-scale', fontScale.toFixed(2));
  localStorage.setItem('smm_font', fontScale.toFixed(2));
}
document.getElementById('btnFontUp').addEventListener('click', ()=>{
  fontScale = Math.min(1.5, fontScale+0.1);
  applyFont();
});
document.getElementById('btnFontDown').addEventListener('click', ()=>{
  fontScale = Math.max(0.8, fontScale-0.1);
  applyFont();
});

/* ============================================================
   TOC DRAWER
   ============================================================ */
const tocOverlay = document.getElementById('tocOverlay');
function openToc(){
  const list = document.getElementById('tocList');
  list.innerHTML='';
  const wrap = document.createElement('div');
  wrap.innerHTML = renderToc();
  list.appendChild(wrap.firstElementChild);
  attachTocHandlers(list);
  tocOverlay.classList.add('open');
}
function closeToc(){ tocOverlay.classList.remove('open'); }
document.getElementById('btnToc').addEventListener('click', openToc);
document.getElementById('tocClose').addEventListener('click', closeToc);
tocOverlay.addEventListener('click', e=>{ if(e.target===tocOverlay) closeToc(); });

/* ============================================================
   TICKER STRIP
   ============================================================ */
function buildTicker(){
  const track = document.createElement('div');
  track.className='track';
  const items = [...TICKER_DATA, ...TICKER_DATA];
  track.innerHTML = items.map(t=>`<span>${t.sym} <b class="${t.up?'up':'down'}">${t.v} ${t.chg}</b></span>`).join('<span style="color:#324158">|</span>');
  document.getElementById('tickerStrip').appendChild(track);
}
buildTicker();

/* ============================================================
   INIT
   ============================================================ */
(function init(){
  const saved = parseInt(localStorage.getItem('smm_page')||'0',10);
  currentIndex = (saved>=0 && saved<PAGES.length) ? saved : 0;
  paintCurrent();
})();

window.addEventListener('beforeunload', ()=>{
  localStorage.setItem('smm_page', String(currentIndex));
});
