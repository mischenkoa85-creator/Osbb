# Chinese price-reporting agencies for the PV and battery/ESS supply chain (state as of 22 Oct 2026)

**Method note (read first):** The research sandbox's egress proxy refused direct connections to infolink-group.com, energytrend.com and other agency sites (HTTP 403 on CONNECT). Everything below comes from web-search result snippets and summaries of the agencies' own pages and articles, plus media that cite them. I could not open the full tables. Numbers are as the search snippets reported them. Where a figure comes from an aggregator or blog rather than the agency, it is marked as such. Anyone building a collector should first confirm the field lists by hand in a browser.

---

## 1. InfoLink Consulting (集邦新能源 / InfoLink, Taipei): public price page fields, schedule, free vs paid

### Takeaway
InfoLink publishes a free weekly PV spot-price table and a separate ESS (lithium/cell/system) spot-price table. Both update **every Wednesday** and give high/low/average plus week-on-week change. Some rows are member-only ("Advanced Coverage", USD 210/yr individual, USD 500/yr team). Under the ToS a subscription covers only the current week (no history), and screenshots and redistribution are prohibited. The free history is the weekly dated articles (`/energy-article/pv-spot-price-YYYYMMDD`, `/energy-article/ess-spot-price-YYYYMMDD`), which can be scraped by date-pattern URL.

### Cited Findings
- **Pages:** PV spot price at https://www.infolink-group.com/spot-price/ (also /en/solar/spot-price); ESS spot price at https://www.infolink-group.com/spot-price-energy-storage/; weekly commentary list at https://www.infolink-group.com/energy/price-article — [InfoLink PV spot price](https://www.infolink-group.com/spot-price/); [ESS spot price](https://www.infolink-group.com/spot-price-energy-storage/); [PV spot price articles](https://www.infolink-group.com/energy/price-article)
- **Schedule:** The ToS says spot-price quotes "are updated on our website every Wednesday". InfoLink's X posts say "InfoLink's ESS price will be updated every Wednesday." — [Term of use](https://www.infolink-group.com/term-of-use/); [InfoLink on X](https://x.com/InfoLinkConsult/status/2102745044398842306)
- **Dated weekly article URLs (Wednesdays, 2026):** pv-spot-price-20260107, -20260128, -20260401, -20260422, -20260603, -20260610, -20260617, -20260701, -20260715, -20260805, -20260819; ess-spot-price-20260513, -20260617, -20260819, -20260916, -20260930, -20261014. The pattern is predictable: `https://www.infolink-group.com/energy-article/{pv|ess}-spot-price-YYYYMMDD`. One mirror host is `market-report.infolink-group.com` — [pv-spot-price-20260805](https://www.infolink-group.com/energy-article/pv-spot-price-20260805); [ess-spot-price-20261014](https://www.infolink-group.com/energy-article/ess-spot-price-20261014); [ess-spot-price-20260930 (market-report host)](https://market-report.infolink-group.com/energy-article/ess-spot-price-20260930)
- **Statistics:** Each row gives High / Low / Average (the snippets show three columns, e.g. "TOPCon Module – US assembled (USD, DDP) | 0.330 | 0.290 | 0.310") plus a week-on-week % change. The polysilicon non-China row reads "high 26.0, low 12.0, average 18.5 (USD/kg)" — [InfoLink spot price](https://www.infolink-group.com/spot-price); [search summary of 1 Jul 2026 table](https://www.infolink-group.com/spot-price/)
- **PV product rows seen in snippets:**
  - Polysilicon: mono-grade China (RMB/kg); n-type recycled/re-feed (复投料), mixed-lot, granular (RMB/kg); polysilicon non-China (USD/kg). The "US-made" polysilicon series is paywalled — [InfoLink pv-spot-price-20260610](https://www.infolink-group.com/energy-article/pv-spot-price-20260610)
  - Wafers: n-type by size, e.g. "210N" in RMB/piece. The EnergyTrend mirror lists 183N, 210RN and 210N — [InfoLink spot price](https://www.infolink-group.com/spot-price/)
  - Cells: TOPCon by size (M10L/183N, 210RN, 210N) in RMB/W; India-made cell rows locked — [InfoLink spot price](https://www.infolink-group.com/spot-price)
  - Modules: China TOPCon split into ground-mounted vs distributed (RMB/W); TOPCon India-assembled (USD/W, FOB); TOPCon US-assembled (USD/W, DDP); TOPCon "US projects – SEA made" (USD/W, FOB); TOPCon "Europe projects – China made" (USD/W, FOB). Europe utility, Middle East and India-made rows are paywalled — [InfoLink spot price](https://www.infolink-group.com/spot-price)
  - Footnote: "Module prices in dollar terms are price quotes in non-China markets (before tax), not translated from RMB prices." — [InfoLink spot price](https://www.infolink-group.com/spot-price)
- **ESS rows:** lithium salts (spodumene concentrate, battery-grade lithium carbonate), LFP ESS cells (100Ah, 280Ah, 314Ah, and 500+Ah formats discussed) in RMB/Wh, and ESS system prices (RMB/Wh). 314Ah on 14 Oct 2026 was RMB 0.330–0.390/Wh, avg 0.360, −0.7% WoW — [InfoLink ESS 20261014](https://www.infolink-group.com/energy-article/ess-spot-price-20261014). A third-party tracker cites InfoLink at RMB 0.428/Wh (100Ah) and 0.363/Wh (280/314Ah) for early October — [ljyenergy (aggregator)](https://ljyenergy.com/china-lifepo4-battery-cell-price-trends-2026/)
- **Paid tier "Spot Price Advanced Coverage":** USD 210/year individual; USD 500/year team (up to 3 accounts); valid one year from payment; no cancellation or refund — [Member join](https://www.infolink-group.com/member_join/); [Term of use](https://www.infolink-group.com/term-of-use/)
- **ToS restrictions:** The subscription "does not include data outside of the current week". Individual accounts are for personal use and corporate accounts for internal use. The ToS bars unauthorized screenshots, forwarding, sharing with third parties and commercial redistribution, and violations can lead to termination and legal action. The site is operated by InfoLink Taipei — [Term of use](https://www.infolink-group.com/term-of-use/)
- **Distribution channels:** X (@InfoLinkConsult) posts each Wednesday with links; YouTube channel; weekly articles are syndicated into pv magazine, solarbytes etc. — [InfoLink on X](https://x.com/InfoLinkConsult/status/2110416441241747468); [YouTube](https://www.youtube.com/channel/UCm1yQ-ApEpjGeB6ug5T_8Mg/videos); [solarbytes](https://solarbytes.info/china-bytes/infolink-october-2026-china-topcon-module-prices-fall-amid-weak-solar-demand-12691953)

### Inferences
- The most practical free collector would fetch the dated weekly articles on Wednesday or Thursday (URL by date), parse the H/L/Avg table, and store a time series. This builds the history that the paid tier does not provide. Whether ToS-compliant automated collection is allowed is unclear: the ToS targets redistribution, so internal monitoring with attribution is lower-risk, but publishing a republished table is not allowed without a licence.
- InfoLink is the best single free source for non-China module markets (India, US, Europe, SEA-made for US) in USD/W.

### Gaps
- I could not see the full current row list, including whether glass (2.0/3.2 mm, RMB/m²), EVA or silver paste rows exist on the free page. Unconfirmed because direct access was blocked.
- No public API, RSS feed or official data-licensing price was found. Enterprise and data-feed licensing is presumably by quote.
- The 21 Oct 2026 edition was not yet indexed at the time of research.

---

## 2. SMM (Shanghai Metals Market, 上海有色网, smm.cn / metal.com): free vs paid, coverage, frequency

### Takeaway
SMM publishes **daily** assessments for lithium salts and many battery materials, plus daily or weekly PV-chain items (polysilicon, wafers, cells, modules, and materials such as glass and silver paste). Free news articles on news.metal.com carry the price moves and often the levels. Price databases and history require a paid plan: Standard USD 800/yr (chosen categories), Professional USD 1,599/yr (all ferrous, non-ferrous and new-energy metals, 3-year history), Enterprise by quote. Database Pro is available via the SMM API.

### Cited Findings
- **Free account:** "Once you complete account registration, you become SMM Free user, which gives you access to a few pieces of news." Latest and historical data require an upgrade — [SMM Subscribe](https://user.metal.com/subscribe)
- **Plans:** Standard USD 800/yr for selected categories; Professional USD 1,599/yr covering historical prices for all ferrous, non-ferrous and new-energy metals; both include historical data "within 3 years"; Enterprise custom — [SMM Subscribe](https://user.metal.com/subscribe)
- **API:** "You can access all data in Database Pro, as well as options, futures, historical prices, and news — all via the API." No public price listed. The mobile app says API and data download are website-only — [SMM Database API](https://www.metal.com/smm-api); [SMM app, Google Play](https://play.google.com/store/apps/details?id=cn.smm.en)
- **Lithium daily commentary (free articles):** "battery-grade lithium carbonate spot price fell by 2,600 yuan/mt on 9 Oct 2026"; "spot lithium carbonate fell by 3,400 yuan/mt on 14 Oct 2026"; daily reviews such as "SMM Daily Review: Spot Lithium Carbonate Edged Down on July 31" — [SMM daily review 31 Jul](https://news.metal.com/en/newscontent/104036728-smm-daily-review-spot-lithium-carbonate-edged-down-on-july-31); [SMM analysis (lithium flat)](https://news.metal.com/en/newscontent/104034165-smm-analysis-spot-lithium-carbonate-prices-remain-flat-while-downstream-continues-to-buy-the-dip-as-needed)
- **Price-item pages** live at metal.com/lithium/... (e.g. /lithium/lc2701); SMM announced a revision of Chinese–English indicator units — [SMM lithium page](https://www.metal.com/lithium/lc2701)
- **Lithium carbonate history (SMM):** battery-grade average went from 73,550 yuan/mt (Oct 2025) to 181,500 yuan/mt (26 Jan 2026) — [ESS News citing SMM](https://www.ess-news.com/2026/04/22/chinas-314-ah-storage-cell-prices-climb-more-than-20-in-six-months/)
- **314Ah ESS cell index (SMM):** 0.2995 → 0.3339 yuan/Wh between about Oct 2025 and Jan 2026 — [SMM analysis 314Ah](https://news.metal.com/newscontent/103741566-smm-analysis-cost-driven-price-game-market-trend-analysis-of-314ah-ess-battery-cells); [ESS News](https://www.ess-news.com/2026/04/22/chinas-314-ah-storage-cell-prices-climb-more-than-20-in-six-months/)
- **PV weekly review (free):** "[SMM Weekly Review] PV Upstream Multi-Segment Stalemate Holds Steady, Module Prices Continue to Decline". In October 2026 wafers were broadly stable and cell quotes for all sizes were unchanged WoW — [SMM weekly review](https://news.metal.com/newscontent/104173676-pv-upstream-multi-segment-stalemate-holds-steady-module-prices-continue-to-decline-smm-weekly-review)

### Inferences
- SMM is the strongest daily source for lithium carbonate, hydroxide, LFP cathode, electrolyte and LiPF6, and ESS cells. For daily ESS-material monitoring, a Professional plan or API licence is the clean route. Free news articles give daily deltas and sometimes levels and could be text-mined, though the published levels are often in the paid table.

### Gaps
- No ToS text on redistribution was found. Assume standard proprietary restrictions.
- I could not verify the exact SMM item list for PV glass, EVA/POE and silver paste, LFP cathode, or 280/314/500+Ah cells and ESS systems, or whether each is daily or weekly. These items appear in SMM news, but the database item list was not accessible.
- No API price list was found.

---

## 3. EnergyTrend (TrendForce): weekly PV spot table and battery price pages

### Takeaway
EnergyTrend (TrendForce's green-energy arm) hosts a free solar price page (energytrend.com/solar-price.html) with polysilicon, wafer, cell and module rows (High / Low / Average + % change), updated weekly, plus a weekly "Weekly PV Market Review" article on Wednesday or Thursday. A separate battery price page (m.energytrend.com/battery-price.html; trendforce.com/price/battery-price/…) carries LFP and ternary cell and pack prices in RMB/Wh. That page is updated less often (monthly-style snapshots seen in June and August 2026).

### Cited Findings
- **Solar price page:** https://www.energytrend.com/solar-price.html. As of 14 Oct 2026 it lists N-type recharge polysilicon (RMB/kg), N-type wafers 183 mm / 210R / 210 (G12) (RMB/piece), M10L TOPCon cells (RMB/W) and modules split by ground-mounted vs distributed (RMB/W). Snippet values (14 Oct): wafer 183N ≈ RMB 1.00/pc, 210R ≈ 1.02, 210 ≈ 1.13; M10L TOPCon cell ≈ RMB 0.30/W; module TOPCon ground ≈ RMB 0.70/W, distributed ≈ 0.72/W, "some actual transactions have already fallen to RMB 0.65–0.69/W" — [EnergyTrend solar price](https://www.energytrend.com/solar-price.html)
- **Polysilicon conflict:** The same search summary gives EnergyTrend's N-type recharge polysilicon as "average ≈ RMB 33.5/kg (High 45, Low 33)". This conflicts with InfoLink (RMB 40–43/kg) and the Silicon Branch (RMB 43/kg) for the same week. The average may be misread or the row may be a different grade — [EnergyTrend solar price](https://www.energytrend.com/solar-price.html); contradicted by [Silicon Branch via JRJ](https://m.jrj.com.cn/madapter/24h/2026/10/14170358717690.shtml)
- **Several snippets describe the EnergyTrend table as "a mirror of InfoLink's October 14 data"**, i.e. EnergyTrend's PV table may repost InfoLink/TrendForce-family data. Treat this as an unverified relationship — [search summary referencing energytrend.com/solar-price.html](https://www.energytrend.com/solar-price.html)
- **Weekly reviews (dated):** 29 Jan 2026 (silver surge, export rush keep cell and module firm); 23 Apr; 30 Apr; 17 Jul (wafer and cell decline; cells RMB 0.26–0.265/W); 15 Oct 2026 ("Polysilicon producers coordinate to establish a price floor…"; some orders above RMB 40/kg; polysilicon inventory > 560,000 t) — [20260129](https://www.energytrend.com/pricequotes/20260129-50869.html); [20260717](https://www.energytrend.com/pricequotes/20260717-51764.html); [20261015](https://www.energytrend.com/pricequotes/20261015-52295.html); [list](https://www.energytrend.com/pricequotes/list-11.html)
- **Battery page:** "Battery Cell – Square LFP Battery Cell: Energy Storage (RMB/Wh)" was 0.37 (+2.78%) on 5 Jun 2026 and 0.38 (+2.70%) on 7 Aug 2026. The same table has EV square LFP cell 0.39, square LFP pack 0.51 and EV ternary 0.58 RMB/Wh — [EnergyTrend battery price](https://m.energytrend.com/battery-price.html); [TrendForce battery cell & pack](https://www.trendforce.com/price/battery-price/battery_cell_and_pack)
- **TrendForce PV price pages** also exist, e.g. https://www.trendforce.com/price/pv/cell — [TrendForce PV cell](https://www.trendforce.com/price/pv/cell)

### Inferences
- The EnergyTrend PV table is free and scrapable as plain HTML. Article URLs follow `/pricequotes/YYYYMMDD-NNNNN.html` (ID not predictable, so crawl list-11.html). Battery data is too infrequent for weekly ESS monitoring.

### Gaps
- No ToS or API details were found for EnergyTrend/TrendForce price data. TrendForce sells paid reports and databases, but terms were not retrieved.
- The exact publication weekday is unconfirmed (reviews seen dated Wednesday or Thursday).

---

## 4. PVInsights: what's public, frequency, reliability

### Takeaway
PVInsights (pvinsights.com) still shows a weekly spot table, with the latest update seen dated 14 Oct 2026. It has polysilicon, wafers (156 mm multi, 182 mm mono, 210 mm mono in USD and CNY), cells and modules. Much of the detail has been paywalled since 2017, and the product list looks dated (e.g. multi wafers). Its methodology and how widely it is cited are weak compared with InfoLink, OPIS and the Silicon Branch. Use it only as a secondary cross-check.

### Cited Findings
- The homepage weekly table had its latest update dated 2026-10-14. Wafer rows: 156 mm multi, 182 mm mono, 210 mm mono, in USD and CNY — [PVinsights](http://pvinsights.com/); [all prices (wap)](http://wap.pvinsights.com/index2.php)
- Since June 2017, global polysilicon spot averages and monthly contract data have shifted to a paid service. Only a p-type polysilicon average remains free behind registration (Bernreuter's description, older page) — [Bernreuter polysilicon price trend](https://www.bernreuter.com/polysilicon/price-trend/)
- A procurement blog claims Tuesday updates; this is unverified and conflicts with other descriptions — [summary of search results](http://pvinsights.com/)

### Inferences
- The inclusion of 156 mm multi wafers in 2026 suggests stale product coverage. Its accuracy in the n-type/TOPCon era is doubtful, so it should be low-weight in any aggregate.

### Gaps
- No 2026 media citations of PVInsights were found (pv magazine, PV Tech and ESS News cite InfoLink, OPIS, SMM and the Silicon Branch). No ToS was retrieved.

---

## 5. Futures exchanges (GFEX 广州期货交易所): polysilicon and lithium carbonate data availability

### Takeaway
GFEX lists **polysilicon (PS, 3 t/lot)**, **lithium carbonate (LC, 1 t/lot)** and industrial silicon (SI), all quoted in RMB/tonne with ±4% daily limits. Free on gfex.com.cn: delayed quotes, daily market statistics (OHLC, settlement, volume, open interest), position rankings, warehouse-receipt daily reports and history downloads. Real-time data needs a licensed vendor (exchange data licence via brokers or terminals such as Wind, iFinD or Eastmoney). On 21 Oct 2026 both contracts fell sharply (LC > −4%, PS > −3%).

### Cited Findings
- **Contract specs:** polysilicon 3 t/lot, daily limit ±4% of prior settlement; lithium carbonate 1 t/lot, ±4% — [GFEX polysilicon](https://www.gfex.com.cn/gfex/djg/sspz.shtml); [GFEX lithium carbonate](http://www.gfex.com.cn/gfex/tsl/sspz.shtml)
- **Free data sections:** delayed quotes, historical quotes, trading calendar and statistics (daily quotes, daily volume/OI rankings, warehouse-receipt daily). The download page has basic, depth and delayed market-data downloads and a price list (价目表) for licensed data — [GFEX home](http://www.gfex.com.cn/)
- **21 Oct 2026:** "碳酸锂跌超4%，多晶硅跌超3%" at close — [Sina 收评 2026-10-21](https://finance.sina.com.cn/money/future/fmnews/2026-10-21/doc-inivynsm5406825.shtml); [Sina 10月21日收盘](https://k.sina.cn/article_5953190046_162d6789e06703uzxg.html)
- **Levels (undated snapshot, consistent with 21 Oct moves):** 碳酸锂主连 95,040 RMB/t (−4,700, −4.71%); 多晶硅主连 33,725 RMB/t (−1,100, −3.16%) — [Eastmoney LC](https://futures.eastmoney.com/qihuo/lc.html); [Eastmoney PS](https://futures.eastmoney.com/qihuo/ps.html)
- **Warehouse receipts 22 Oct 2026:** LC 20,952 lots (−743); PS 21,520 lots (flat); SI 32,562 lots (−596) — [21财经](https://m.21jingji.com/article/20261022/herald/0ed2c51f1124f40c38d514188a8178a3.html)
- **Earlier LC futures:** nearby contract closed at 141,100 yuan/t on 30 Jul 2026; 2609 contract at 137,800 (−4.84%) on 31 Jul — [SMM daily review 31 Jul](https://news.metal.com/en/newscontent/104036728-smm-daily-review-spot-lithium-carbonate-edged-down-on-july-31)

### Inferences
- GFEX daily settlement is the cleanest free, licence-light benchmark for polysilicon and lithium carbonate. Exchange end-of-day data is typically freely downloadable, but redistributing real-time data needs a licence.
- The polysilicon futures price (≈ RMB 33.7/kg) sits well below Silicon Branch spot (RMB 43/kg). The Silicon Branch itself cites the "期现价差" (futures-spot gap) as a reason buyers are waiting.

### Gaps
- Exact 21 Oct settlement prices are not confirmed from GFEX itself, and the Eastmoney snapshot is undated.
- The GFEX data-licence price list was not retrieved. I did not verify whether GFEX offers CSV/Excel history without registration.
- SHFE has no polysilicon or lithium contract (not researched further).

---

## 6. Other Chinese agencies (Silicon Branch, OPIS China, ICC/鑫椤, GGII, Mysteel, Baiinfo, SunSirs, CPIA)

### Takeaway
The **CNMIA Silicon Branch (中国有色金属工业协会硅业分会, data by 安泰科 Antaike)** is the de facto official weekly polysilicon transaction price, published Wednesday afternoon with free reposting by Chinese financial media. **OPIS** publishes a weekly "China Mono Premium" polysilicon marker (paid, but weekly summaries appear free in pv magazine). For batteries and ESS, **ICC/鑫椤资讯**, **GGII/高工锂电**, Mysteel, Baiinfo and SunSirs are mainly paid. Media coverage also uses CATL's online-mall list prices (宁德时代线上商城) as a public datapoint.

### Cited Findings
- **Silicon Branch weekly (Wednesday):** 21 Oct 2026: n-type re-feed rod (复投料/棒状硅) 43,000 RMB/t (=43 RMB/kg), flat; n-type granular range 40,000–41,000, avg 40,300 RMB/t, flat; only 2–3 companies effectively transacting — [东方财富 多晶硅周评 2026-10-21](https://finance.eastmoney.com/a/202610213902853892.html); [investing.com/智通](https://cn.investing.com/news/stock-market-news/article-3619475)
- 14 Oct 2026: same levels; the Silicon Branch expects October output to drop to about 105,000 t — [金融界 2026-10-14](https://m.jrj.com.cn/madapter/24h/2026/10/14170358717690.shtml); [金融界 output](https://finance.jrj.com.cn/2026/10/14173458718358.shtml)
- History: the 23 Sep 2026 week was first above 40k (rod 43,000, granular 40,300) versus 29 Jul (rod 32,000, granular 31,000) — [财联社](https://www.cls.cn/detail/2493594); [东方财富 2026-09-28](https://finance.eastmoney.com/a/202609283884543140.html)
- **OPIS China Mono Premium:** CNY 52.200/kg (Dec 2025) → CNY 46.083 (early Mar 2026) → 44.583 (Mar) → 31.886 (7 Aug) → 32.100/kg ($4.76) (14 Aug 2026) — [pv magazine 2026-08-07](https://pv-magazine-usa.com/2026/08/07/global-polysilicon-prices-hold-steady-as-u-s-unveils-section-232-import-floors/); [pv magazine 2026-08-14](https://pv-magazine-usa.com/2026/08/14/china-wafer-prices-hold-steady-as-market-weighs-early-signs-of-upstream-stabilization/); [pv magazine 2026-03-13](https://www.pv-magazine.com/2026/03/13/china-polysilicon-prices-fall-over-13-year-to-date-as-below-cost-selling-persists/); [OPIS Q1 article](https://www.opis.com/resources/energy-market-news-from-opis/chinas-polysilicon-prices-slide-in-q1-on-inventory-stockpiles-and-policy-ambiguity/)
- OPIS also publishes a weekly OPIS Solar Weekly report (sample PDF) — [OPIS Solar Weekly sample](https://www.opis.com/wp-content/uploads/2024/07/OPIS-Solar-Weekly-Report.pdf); pv magazine (9 Oct 2026) carries OPIS China wafer weekly — [pv magazine 2026-10-09](https://www.pv-magazine.com/2026/10/09/china-wafer-prices-hold-steady-amid-divergent-output-plans-and-looming-polysilicon-cuts/)
- **CATL online mall (public list prices, 21 Sep 2026):** 280Ah (1P) from 0.470 RMB/Wh; 314Ah from 0.403 RMB/Wh (+2.0% vs early Sep); 587Ah from 0.415 RMB/Wh — [新浪财经 2026-09-21](https://finance.sina.com.cn/stock/estate/integration/2026-09-21/doc-inisqriw8884494.shtml)
- Industry tracking (source agency not named): August 2026 mainstream 314Ah LFP ESS cell avg ≈ 0.365 RMB/Wh versus ≈ 0.31 at end-2025 — [财联社](https://www.cls.cn/detail/2455347); [雪球](https://www.xueqiu.com/3070030957/411092661)
- **SunSirs (生意社, sunsirs.com):** publishes daily average prices (e.g. industrial and battery-grade lithium carbonate) with registration. The articles found were 2023 — [SunSirs](https://www.sunsirs.com/commodity-news/list-14-345.html)
- **TaiyangNews PV Price Index** (weekly, CW-numbered, free; not Chinese, but covers China prices) — [TaiyangNews CW13 2026](https://taiyangnews.info/price-index/taiyangnews-pv-price-index-cw13-2026)
- **Mysteel** has lithium carbonate spot pages (e.g. 9 Oct 2026 spot) — [Mysteel 碳酸锂](https://m.mysteel.com/hot/1590781.html)

### Inferences
- For polysilicon, the Silicon Branch (weekly, free via media) and GFEX (daily, free EOD) together give a no-cost backbone. InfoLink and OPIS add international and USD views.
- For ESS cells, free options are InfoLink's weekly ESS table, the CATL mall list prices and SMM news deltas. ICC/鑫椤 and GGII are paid-only in practice.

### Gaps
- No pricing, ToS or item lists were found for ICC/鑫椤资讯 (icc-cn / 鑫椤锂电), GGII/高工锂电, Baiinfo/百川盈孚 or Mysteel memberships, beyond their existence as paid terminals. Search returned nothing specific.
- CPIA (中国光伏行业协会) publishes annual roadmap and cost data, not a weekly price assessment. Not researched in depth.
- Silicon Branch also publishes weekly wafer prices in some releases; not verified for 2026.
- PV glass, EVA/POE and silver-paste weekly prices: likely carried by SMM, InfoLink (glass), 卓创资讯 and 百川, but no 2026 source was found.

---

## 7. Recent price levels (2026) — examples with dates

### Takeaway
As of mid-October 2026, Chinese polysilicon spot is held near RMB 40–43/kg by a producer-coordinated floor while futures trade around RMB 33–34/kg. Wafers are about RMB 1.0–1.15/piece. TOPCon cells are about RMB 0.30/W. China TOPCon modules are about RMB 0.70–0.72/W, with deals at 0.65–0.69. Overseas TOPCon is about USD 0.114/W. 314Ah ESS cells are about RMB 0.36/Wh and easing as lithium carbonate falls (futures about RMB 95k/t versus a peak above 200k in May).

### Cited Findings
| Item | Value | Date | Source |
|---|---|---|---|
| Polysilicon n-type re-feed (Silicon Branch) | 43.0 RMB/kg (43,000 RMB/t) | 21 Oct 2026 | [东方财富](https://finance.eastmoney.com/a/202610213902853892.html) |
| Polysilicon n-type granular (Silicon Branch) | 40.0–41.0, avg 40.3 RMB/kg | 21 Oct 2026 | [东方财富](https://finance.eastmoney.com/a/202610213902853892.html) |
| Polysilicon n-type recycled / granular (InfoLink) | 40–43 / 40–41 RMB/kg; mono-grade avg 40 RMB/kg; non-China avg USD 18.5/kg | 14 Oct 2026 | [InfoLink spot](https://www.infolink-group.com/spot-price/) |
| Polysilicon (InfoLink, earlier) | recycled 34–35, mixed 32–33, granular 33–35 RMB/kg | 10 Jun 2026 | [InfoLink 20260610](https://www.infolink-group.com/energy-article/pv-spot-price-20260610) |
| OPIS China Mono Premium | CNY 32.100/kg ($4.76) | 14 Aug 2026 | [pv magazine](https://pv-magazine-usa.com/2026/08/14/china-wafer-prices-hold-steady-as-market-weighs-early-signs-of-upstream-stabilization/) |
| GFEX polysilicon main | ~33,725 RMB/t (−3.16%) | ~21 Oct 2026 (undated snapshot) | [Eastmoney](https://futures.eastmoney.com/qihuo/ps.html) |
| Wafer 210N (InfoLink) | 1.10–1.15 RMB/pc | 14 Oct 2026 | [InfoLink spot](https://www.infolink-group.com/spot-price/) |
| Wafer 183N / 210R / 210 (EnergyTrend) | ~1.00 / 1.02 / 1.13 RMB/pc | 14 Oct 2026 | [EnergyTrend](https://www.energytrend.com/solar-price.html) |
| Cell M10L TOPCon (EnergyTrend) | ~0.30 RMB/W | 14 Oct 2026 | [EnergyTrend](https://www.energytrend.com/solar-price.html) |
| Cells (EnergyTrend weekly) | 0.26–0.265 RMB/W | 17 Jul 2026 | [EnergyTrend 20260717](https://www.energytrend.com/pricequotes/20260717-51764.html) |
| China TOPCon module (InfoLink) | 0.719 RMB/W; overseas ~0.114 USD/W | 8–14 Oct 2026 | [solarbytes citing InfoLink](https://solarbytes.info/china-bytes/infolink-october-2026-china-topcon-module-prices-fall-amid-weak-solar-demand-12691953) |
| China TOPCon module ground / distributed | 0.70 / 0.72 RMB/W; deals 0.65–0.69 | 14 Oct 2026 | [EnergyTrend](https://www.energytrend.com/solar-price.html) |
| US-assembled TOPCon (InfoLink) | 0.30–0.33 USD/W DDP | early Aug 2026 | [InfoLink 20260805](https://www.infolink-group.com/energy-article/pv-spot-price-20260805) |
| 314Ah LFP ESS cell (InfoLink) | 0.330–0.390, avg 0.360 RMB/Wh (−0.7% WoW) | 14 Oct 2026 | [InfoLink ESS 20261014](https://www.infolink-group.com/energy-article/ess-spot-price-20261014) |
| 314Ah ESS cell (CATL mall list) | from 0.403 RMB/Wh | 21 Sep 2026 | [新浪财经](https://finance.sina.com.cn/stock/estate/integration/2026-09-21/doc-inisqriw8884494.shtml) |
| LFP ESS cell (EnergyTrend) | 0.38 RMB/Wh | 7 Aug 2026 | [EnergyTrend battery](https://m.energytrend.com/battery-price.html) |
| ESS system (InfoLink) | ~0.55 RMB/Wh (leading suppliers); "holding steady" by Oct | Jun 2026 | [InfoLink ESS 20260617](https://www.infolink-group.com/energy-article/ess-spot-price-20260617); [20261014](https://www.infolink-group.com/energy-article/ess-spot-price-20261014) |
| Lithium carbonate (InfoLink headline) | "Lithium prices hit RMB 200,000/MT" | 13 May 2026 | [InfoLink ESS 20260513](https://www.infolink-group.com/energy-article/ess-spot-price-20260513) |
| Lithium carbonate China spot | 122,800 RMB/t | 30 Sep 2026 | [lithiumchart (aggregator)](https://lithiumchart.com/lithium-carbonate-price) |
| GFEX lithium carbonate main | ~95,040 RMB/t (−4.71%) | ~21 Oct 2026 (undated snapshot) | [Eastmoney](https://futures.eastmoney.com/qihuo/lc.html) |

- Polysilicon inventory: > 570,000 t early 2026 (InfoLink); > 560,000 t in Oct 2026 (EnergyTrend) — [InfoLink 20260610](https://www.infolink-group.com/energy-article/pv-spot-price-20260610); [EnergyTrend 20261015](https://www.energytrend.com/pricequotes/20261015-52295.html)

### Inferences
- The sharp drop in lithium carbonate (≈ 200k in May → ≈ 123k at end of Sep → ≈ 95k futures on 21 Oct) has not yet passed through to 280/314Ah cells, which are down only about 1% WoW. Expect lagged cell softening.
- Units for aggregation: polysilicon RMB/kg (Silicon Branch and GFEX are RMB/t, so divide by 1,000); wafers RMB/piece; cells and modules RMB/W (China, VAT-inclusive) vs USD/W (non-China, pre-tax, FOB/DDP); ESS cells and systems RMB/Wh; lithium RMB/t. Note the tax basis (China quotes typically include 13% VAT; InfoLink USD quotes are pre-tax).

### Gaps
- The EnergyTrend polysilicon figure (avg 33.5 RMB/kg) conflicts with InfoLink and the Silicon Branch (40–43) for the same week. Unresolved.
- No verified October 2026 figures for PV glass, EVA, silver paste, LFP cathode, 500+Ah cells or ESS system RMB/Wh.
- GFEX settlement prices come from an undated third-party snapshot, and the lithiumchart figure is from an aggregator. Both should be verified at source.
