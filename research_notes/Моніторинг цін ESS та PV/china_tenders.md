# Chinese tender/procurement results as a source of ESS and PV price data (as of Oct 2026)

> Method note: WebFetch could not resolve any target host in this session (DNS errors for cnesa.org, energytrend.com, ess-news.com, energy-storage.news, bjx.com.cn). Every finding below comes from search-engine result summaries/snippets of the cited pages, not from full-page reads. The figures are specific and cross-checked where possible, but they should be spot-checked against the original pages before publication. Anti-bot/CAPTCHA behaviour of portals was NOT tested directly.

## 1. Which tender data sources exist (official portals of buyers + national public portals)

### Takeaway
All large Chinese power SOEs run their own e-procurement portals where tender notices, 开标 (bid opening) price lists, 中标候选人公示 (candidate publicity) and 中标结果公告 are published. By law, tenders that must be competed are also mirrored to the national 中国招标投标公共服务平台 (or a provincial public service platform), which is the broadest single public source. The national platform publishes about 2,400 candidate notices and 3,100 award notices per day, across all industries.

### Cited Findings
**National / legal framework**
- The NDRC 《招标公告和公示信息发布管理办法》 requires that tender notices and publicity info for 依法必须招标 projects be published on 中国招标投标公共服务平台 or the provincial e-bidding public service platform where the project is located. It also specifies that 中标候选人公示 must state the candidates' ranking, names, **bid prices (投标报价)**, quality, construction period and evaluation results. This is why candidate notices are a structured source of price data. — [NDRC PDF](https://www.ndrc.gov.cn/xxgk/zcfb/fzggwl/201712/W020190905495106208689.pdf)
- 中国招标投标公共服务平台 (bulletin.cebpubservice.com). Its homepage shows live counts, for example one day with 资格预审公告 352, 招标公告 4,568, 中标候选人公示 2,390, 中标结果公示 3,137 and 更正公告 1,023 (11,470 in total). The cumulative count of candidate notices is over 1.61 million. — [cebpubservice bulletin](https://bulletin.cebpubservice.com/)
- The platform says that parties not connected through the 10号令 《招标公告和公示数据接口规范》 should read notices in the 【交易公开】 section. So the official machine route is a **data-interface specification for connected trading platforms**, not a public open API for analysts. — [cebpubservice bulletin](https://bulletin.cebpubservice.com/); see also [connect.cebpubservice.com](https://connect.cebpubservice.com/), [details.cebpubservice.com](http://details.cebpubservice.com/)
- Provincial mirrors also exist, e.g. 河南省招标投标公共服务平台, 陕西 (bulletin.sntba.com) and 安徽 (gjpt.ahtba.org.cn). — [Henan](https://hnztbkhd.fgw.henan.gov.cn/), [Shaanxi](http://bulletin.sntba.com/), [Anhui](http://gjpt.ahtba.org.cn/)

**Buyer (SOE) portals.** URLs come mostly from aggregator lists; verify on each group's official site.
- State Grid: the 电子商务平台 ECP 2.0 is at https://ecp.sgcc.com.cn/ecp2.0/ (notice pages are SPA routes like `ecp2.0/portal/#/doc/...`). Listed companies' 2026 exchange filings (e.g. 宏盛华源 601096, 积成电子 002339) cite ECP 中标候选人公示 as the basis for their "预中标" announcements. — [宏盛华源 filing Jul 2026](https://stockmc.xueqiu.com/202607/601096_20260718_10WC.pdf), [积成电子 filing May 2026](http://file.finance.sina.com.cn/211.154.219.97:9494/MRGG/CNSESZ_STOCK/2026/2026-5/2026-05-06/12297590.PDF); the provincial page describing ECP's role (centralized batch tenders for projects and materials) is at [State Grid Chongqing](http://www.cq.sgcc.com.cn/html/main/col43/2012-05/29/20120529232450837227491_1.html)
- China Southern Grid: 南方电网供应链统一服务平台, http://www.bidding.csg.cn/ — [Baidu Aiqicha/Zhihu lists via search](https://zhuanlan.zhihu.com/p/708203632)
- China Huadian: 华电集团电子商务平台, https://www.chdtp.com/. Suppliers must register and obtain a **digital certificate (CA)** to log in for bidding. — [Aiqicha](https://aiqicha.baidu.com/details/ugknowledge?id=00785a8e00975243f368838e7050a609)
- China Three Gorges: 中国三峡电子采购平台, https://eps.ctg.com.cn/ — [Zhihu list](https://zhuanlan.zhihu.com/p/708203632)
- CGN: 中广核电子商务平台, https://ecp.cgnpc.com.cn/ — [Zhihu list](https://zhuanlan.zhihu.com/p/1944448987919783477)
- China Datang: 大唐电子商务平台, https://www.cdt-ec.com/home/ (third-party list, not verified) — [Zhihu: 52家央企招标平台](https://zhuanlan.zhihu.com/p/1944448987919783477)
- China Huaneng: 华能电子商务平台, ec.chng.com.cn — [search result list](https://zhuanlan.zhihu.com/p/1944448987919783477)
- China Energy Engineering (CEEC/中国能建): 电子采购平台, https://ec.ceec.net.cn/. Its homepage lists storage-related tenders (e.g. a 广西院 PV-carport storage system purchase). — [ec.ceec.net.cn](https://ec.ceec.net.cn/)
- PowerChina (中国电建): 设备物资集中采购平台, https://ec.powerchina.cn/. Its listings include ESS items such as the 永平 200MW/400MWh shared storage project. — [ec.powerchina.cn](https://ec.powerchina.cn/)
- CHN Energy (国家能源集团, "国能e购") and SPIC (国家电投电子商务平台): the search turned up only **third-party mirror domains** (neep.dlnyzb.com, gdmec.toobiao.com, espic.dlnyzb.com, ebid.dlnyzb.com), not the official URLs. — [neep.dlnyzb.com](https://neep.dlnyzb.com/), [espic.dlnyzb.com](https://espic.dlnyzb.com/)
- A 2022 aggregator note says 70 of 98 central SOEs had online e-procurement platforms by then. — [gcycloud](https://www.gcycloud.cn/freecms/site/gcy/qycg/info/2022/4180607.html)

### Inferences
- For ESS/PV price tracking, the most valuable documents are (a) **开标记录/开标一览** (all bidders' prices, so the number of bidders and the price spread), (b) **中标候选人公示** (ranked top 1–3 per lot, with prices, required by law), and (c) **中标结果公告** (final winner, sometimes without a price). SOE portals publish all three. cebpubservice mainly carries (b) and (c).
- Third-party "dlnyzb.com" mirror domains imitate SOE portal names. Use them only as discovery aids, never as the source of record.

### Gaps
- I could not confirm the official URLs for CHN Energy (国能e购) and SPIC from primary pages. From memory, they are likely chnenergybidding.com.cn and ebid.espic.com.cn, but these are unverified.
- 全国公共资源交易平台 (ggzy.gov.cn) and 中国政府采购网 (ccgp.gov.cn) did not surface in searches. They matter less for utility-scale ESS, which is mostly SOE enterprise procurement rather than government procurement, but this is an inference.
- I found no confirmation of whether State Grid ECP shows full candidate prices without login.

## 2. What fields can be extracted, and what typical tenders look like (2026 examples)

### Takeaway
SOE framework/centralized procurements (集采/框采) of ESS systems in 2026 typically run 5–12 GWh, split into lots by technology (centralized vs string PCS, 0.5C vs 0.25C). They attract dozens of bidders (59 for Huadian), and their published candidate notices give price per Wh per lot. Together this covers almost every requested field: owner, capacity, duration, scope, price, ranked candidates, number of bidders and dates. Province is often missing for frameworks because they cover a group's whole portfolio.

### Cited Findings
- **China Huadian 2026 ESS framework, 12 GWh** (6 GWh more than the year before; actual volume may deviate ±20%). It covers 0.5C and 0.25C LFP systems, with **≥314Ah cells** and a 5-year overall warranty required. The battery prefabricated-cabin price is **indexed to SMM lithium carbonate**. Result published 3 Mar 2026: 7 primary winning candidates and 3 backups from **59 bidders**. The primary winners were Shandong Electric Times, CRRC Zhuzhou Institute, TBEA Xinjiang, Dongfang Electric Automatic Control, Guodian Nanjing Automation, China Huadian Engineering and Sieyuan Qingneng, quoting **RMB 0.4999–0.5458/Wh**. Backups included Sungrow and HyperStrong. All bids ranged from **RMB 0.4923 to 0.6207/Wh, averaging about 0.54/Wh**, up from the previous year. — [ESS News, 11 Mar 2026](https://www.ess-news.com/2026/03/11/china-huadian-announces-winners-of-12-gwh-energy-storage-tender-as-bidding-prices-rise-from-last-year/); [SMM on lithium-index link](https://news.metal.com/newscontent/103760183-China-Huadian-Launches-12-GWh-Energy-Storage-Tender-Linked-to-SMM-Lithium-Prices)
- **CGN New Energy 2026 ESS framework, 7.2 GWh** (tenderer 中广核风电有限公司). It had 6 lots of 1.2 GWh each. Winning prices were **RMB 0.491–0.53/Wh**, from Envision, BYD, CRRC Zhuzhou, NR Electric (南瑞继保), Kelu (科陆) and 天诚同创. — [Sina, 26 Mar 2026](https://finance.sina.com.cn/wm/2026-03-26/doc-inhshxnu0267943.shtml); [ner.jgvogel.cn](https://ner.jgvogel.cn/c1586805.shtml)
- **SPIC (国家电投) first-batch ESS equipment, 5 GWh**, publicity 25 Mar 2026. It had two lots, centralized and string. In the centralized lot, first candidate 新源智储 bid **RMB 0.5205/Wh**. The first-ranked string-lot bid was **RMB 0.5488/Wh**. — [Sina, 26 Mar 2026](https://finance.sina.com.cn/wm/2026-03-26/doc-inhshxnu0267943.shtml)
- **CNNC (中核) 2026–2028 LFP ESS first-level centralized procurement**: the award announcement came out on 14 Oct 2026. Winners were Sungrow, CATL, 中天储能, CRRC Zhuzhou and 科华数能. The candidates' price range was **RMB 0.4995–0.5329/Wh**. (This came from a search summary and should be verified on the CNNC portal.) — [ner.jgvogel.cn / search summary](https://ner.jgvogel.cn/c1586805.shtml)
- An earlier comparison point, China Huadian's 2025 6 GWh BESS tender, had an **average bid of about US$65/kWh**. — [ESS News, 24 Mar 2025](https://www.ess-news.com/2025/03/24/chinas-huadian-announces-winners-in-6-gwh-bess-tender-with-average-bid-at-65-kwh/); [pv magazine](https://www.pv-magazine.com/2025/03/24/chinas-huadian-announces-winners-in-6-gwh-bess-tender-with-average-bid-at-65-kwh/)
- **CGN New Energy 10 GWh BESS tender**, winners announced Jan 2025. — [pv magazine, 16 Jan 2025](https://www.pv-magazine.com/2025/01/16/chinas-cgn-new-energy-announces-winning-bidders-in-10-gwh-bess-tender/)
- **CEEC 25 GWh ESS tender (June 2025)**, a record at the time. 4h bids ranged from **RMB 0.37 to 0.495/Wh (average 0.4249)**, 2h bids averaged **RMB 0.4646/Wh** and 1h bids averaged **0.7863/Wh**. The 0.37 bid was described as a record low and about 30% below 2024. — [ESS News, 26 Jun 2025](https://www.ess-news.com/2025/06/26/china-energy-engineering-launches-record-25-gwh-storage-tender-as-prices-hit-historic-low/); [Mercom](https://www.mercomindia.com/china-record-low-tariff-battery-storage-auction)
- Owner-level volume (H1 2026 openings): China Three Gorges 998 MWh and CHN Energy 542.944 MWh. CHN Energy also ran a separate purchase of 2.2 GWh of LFP batteries plus 150 MWh of LFP systems, which shows that **cell-only/battery-only lots** exist alongside system lots. — [国际储能网 1–6月中标榜](https://mchuneng.in-en.com/html/chunengy-56023.shtml)
- Scope categories that media trackers use separately: **储能系统 (system/equipment), EPC, 集采/框采 (frameworks), cells, PCS, DC-side.** For example, InfoLink tracks a "2h DC-side liquid-cooled ESS" price that rose from **RMB 0.41/Wh (Oct 2025) to 0.49/Wh (Apr 2026)**. — [ESS News, 22 Apr 2026](https://www.ess-news.com/2026/04/22/chinas-314-ah-storage-cell-prices-climb-more-than-20-in-six-months/)

### Inferences
- Field availability by document type (inferred from the examples above and the legal content requirement):
  - Candidate notice: project/lot name, owner, ranked bidders, bid price (total RMB, sometimes RMB/Wh) and date.
  - Bid-opening record: all bidders and prices, so the number of bidders.
  - Tender notice: capacity (MW/MWh), C-rate/duration, scope, delivery location, and qualification thresholds such as ≥314Ah.
- Unit prices often have to be **derived** (total price ÷ MWh). Media "折合单价" figures do this.
- Frameworks increasingly include **lithium-carbonate price indexation** (Huadian/SMM). The bid price is then a base price at a reference Li2CO3 level, so it is not directly comparable with fixed-price bids.
- Duration is often stated as a C-rate (0.5C = 2h, 0.25C = 4h) rather than "2h/4h".

### Gaps
- Final contracted volumes and prices for frameworks (call-offs) are generally not published.
- I could not verify whether the CNNC Oct 2026 prices are candidate bids or final awards.

## 3. Aggregators and media that compile ESS/PV tender prices

### Takeaway
CNESA (via CNESA DataLink), TrendForce/EnergyTrend, Chinese media trackers (储能头条/光伏头条 published via 国际储能网/in-en.com and Sina, 北极星, 索比/碳索新能 solarbe) and English outlets (ESS News, Energy-Storage.news, pv magazine) all publish monthly or weekly tender statistics. Their methodologies differ: arithmetic vs weighted averages, inclusion or exclusion of frameworks, and system vs EPC. Their numbers for the same month can differ by 10% or more.

### Cited Findings
- **CNESA**. The research platform (research.cnesa.org / esresearch.com.cn) has a 招中标库 (tender database) inside its global ESS database, plus a cost/price library with a 招标、中标信息跟踪 section split into scale, winning-price, company and region analyses. **Membership login is required.** The data source is CNESA DataLink, compiled from public info on the major procurement platforms. — [CNESA login](http://research.cnesa.org/login/), [Tender tracking page](https://www.esresearch.com.cn/cost/tender/), [CNESA news](https://www.cnesa.org/information/detail/?column_id=2&id=7180)
- CNESA publishes free monthly and half-year summaries in English (en.cnesa.org). For H1 2026, the average winning bid for 2h systems was **RMB 602.1/kWh (+8.8% YoY)** and for 4h systems **RMB 541.3/kWh (+21.1% YoY)**. Another report gives 2h at RMB 599.3/kWh (+8.3%). Prices for both systems and EPC rebounded. — [CNESA EN, 15 Jul 2026](https://en.cnesa.org/latest-news/2026/7/15/china-energy-storage-tenders-amp-awards-h1-2026-system-and-epc-prices-rebound-across-the-board-with-4-hour-ess-seeing-stronger-growth-than-2-hour-systems)
- Some CNESA monthly figures **exclude 集采/框采**, so check the scope before comparing. — [CNESA research platform search summary](https://research.cnesa.org/report/info/detail/?id=6694)
- **TrendForce / EnergyTrend** publishes monthly reports from its tender database (details in section 4). — [EnergyTrend Jul](https://www.energytrend.com/research/20260817-51955.html), [Aug](https://www.energytrend.com/research/20260910-52114.html), [Sep](https://www.energytrend.com/research/20261016-52306.html)
- **储能头条 / 国际储能网 (chuneng.in-en.com)** publishes monthly and cumulative winner rankings: "141.23GWh 1–3月", "165.71GWh 1–4月" and "288.9GWh 1–6月". It also publishes weekly analyses, e.g. "2h系统均价0.6764元/Wh、2hEPC均价0.9729元/Wh; 本周17.5GWh". Its monthly average is an **arithmetic mean of companies' winning unit prices**, not a weighted average. — [1–6月](https://mchuneng.in-en.com/html/chunengy-56023.shtml), [1–4月](https://chuneng.in-en.com/html/chunengy-54167.shtml), [1–3月](https://mchuneng.in-en.com/html/chunengy-53507.shtml), [weekly](https://mchuneng.in-en.com/html/chunengy-51557.shtml)
- **北极星储能网 (bjx.com.cn)** publishes monthly ESS system tender/award reviews. The Feb 2026 review was headlined 新源智储拿下榜首，集采整体涨价. — [BJX, 17 Mar 2026](https://m.bjx.com.cn/mnews/20260317/1487827.shtml)
- **碳索新能 / solarbe** runs a searchable "中国储能中标价格库" (bid price database) with dozens of pages. — [solarbepv.com/bid-price](https://solarbepv.com/bid-price?page=47); its PV news is at [news.solarbe.com](https://news.solarbe.com/202511/05/50011911.html)
- **光伏头条** (republished via Sina/Eastmoney/in-en solar) publishes monthly PV module and inverter award rankings with average prices per technology. — [Eastmoney 1–9月](https://caifuhao.eastmoney.com/news/20261014112802097432400), [solar.in-en.com weekly](https://solar.in-en.com/html/solar-2459992.shtml)
- English coverage: ESS News (tenders category), Energy-Storage.news and pv magazine cover the large SOE ESS tenders. — [ESS News tenders](https://www.ess-news.com/category/markets/tenders/page/5/), [Energy-Storage.news](https://www.energy-storage.news/price-jump-chinese-firms-battery-cell-quotes-approach-0-4-rmb-wh-system-prices-follow-suit/)
- Spot and cell price indices complement tender data:
  - InfoLink (via ESS News)
  - GGII/高工储能: 314Ah average about RMB 0.38/Wh in mid-2026, per Energy-Storage.news — [ESN on CATL/EVE price hikes](https://energy-storage.news/catl-eve-energy-lead-chinese-manufacturers-battery-storage-cell-price-hikes)
  - Mysteel daily cell survey — [Mysteel](https://www.mysteel.net/mysteel-surveys/5130709-survey-china-daily-lithium-ion-battery-cell-price-20260703)
  - Fastmarkets China PV module and BESS cell price assessments — [Fastmarkets](https://www.fastmarkets.com/insights/launch-of-china-pv-module-bess-battery-cell-prices/)
- **Commercial tender aggregators** (all industries):
  - 剑鱼标讯: member tiers of RMB 2,999, 7,999 and 19,999/yr on one page, and 5,999/yr on another. It claims 270 million records and over 210,000 daily updates (Aug 2025). — [jianyu360](https://www.jianyu360.cn/big/page/index), [CSDN review](https://blog.csdn.net/kdesoteric/article/details/150581966)
  - 千里马: VIP RMB 21,999, senior 12,999 and normal 7,999/yr. It offers a **standard API push service** for daily nationwide data. — [qianlima](https://www.qianlima.com/common/huiyuan.jsp)
  - A blog review measured information coverage at 72% for 剑鱼 vs 97% for 千里马. This is a single non-independent test. — [CSDN](https://blog.csdn.net/kdesoteric/article/details/150581966)

### Inferences
- The cheapest robust pipeline is probably to (1) ingest the free monthly summaries (CNESA EN, EnergyTrend, 储能头条, 光伏头条) for headline averages, and (2) build a curated table of the large SOE frameworks from candidate notices for lot-level detail. A paid aggregator API (千里马) is the alternative to scraping dozens of portals.

### Gaps
- No public pricing was found for CNESA membership or for the InfoLink/TrendForce tracker subscriptions.
- I could not check 储能与电力市场 or 高工储能 tender trackers directly.

## 4. Typical price levels 2025–2026 (ESS system, EPC, cells, PV modules, inverters)

### Takeaway
ESS system bid prices bottomed in mid-2025: CEEC's 4h low was RMB 0.37/Wh, and the 4h average fell to around 0.40–0.45. Since late 2025 prices have rebounded, driven by lithium carbonate and cell prices (314Ah cells rose from about 0.30 to about 0.37–0.42 RMB/Wh). In 2026, SOE framework system bids sit around **RMB 0.49–0.55/Wh**. Market-wide monthly averages are about **0.52–0.67/Wh for 2h** and **0.50–0.60/Wh for 4h**, and **2h EPC runs about RMB 0.97–1.05/Wh**. PV TOPCon module SOE procurement runs about **RMB 0.67–0.78/W** (Sep 2026 average 0.704). Inverters run about **RMB 0.08–0.19/W**.

### Cited Findings
**ESS system, market averages**
- H1 2025 (CNESA): 2h average RMB 0.558/Wh, 4h 0.448/Wh. — [Energy-Storage.news via search](https://www.energy-storage.news/chinas-energy-storage-market-doubles-in-size-for-second-consecutive-year-as-price-inflection-point-emerges/)
- 2025 overall: one report says the average storage system winning price fell 16.53% to **RMB 0.4791/Wh**, with the 4h low around 0.40/Wh, bottoming in Jul–Aug 2025. Prices rebounded from Sep 2025 on lithium carbonate, tight cell supply and overseas orders. — [Energy-Storage.news](https://www.energy-storage.news/chinas-energy-storage-market-doubles-in-size-for-second-consecutive-year-as-price-inflection-point-emerges/) (attribution from a search summary; verify)
- H1 2026 (CNESA): 2h **RMB 0.602/Wh** (+8.8% YoY), 4h **RMB 0.541/Wh** (+21.1% YoY). — [CNESA EN](https://en.cnesa.org/latest-news/2026/7/15/china-energy-storage-tenders-amp-awards-h1-2026-system-and-epc-prices-rebound-across-the-board-with-4-hour-ess-seeing-stronger-growth-than-2-hour-systems)
- Monthly 2026 figures from 储能头条 (arithmetic means of LFP system awards):

  | Month | 2h system (RMB/Wh) | 4h system (RMB/Wh) |
  |---|---|---|
  | Feb | 0.5709 | – |
  | Mar | ~0.6676 | – |
  | Apr | ~0.6137 | 0.5189 (range 0.496–0.5489) |
  | May | ~0.5249 | – |
  | Jun | 0.5696 (range 0.5417–0.6363) | 0.5228 |

  — [国际储能网 1–6月](https://mchuneng.in-en.com/html/chunengy-56023.shtml)
- **Conflict:** BJX gives the Feb 2026 2h average as **0.6136/Wh** (range 0.5573–0.67, +15% MoM), vs 0.5709 from 储能头条. BJX gives the Feb framework average award as 0.5177/Wh. — [BJX](https://m.bjx.com.cn/mnews/20260317/1487827.shtml)
- Frameworks Jan–Apr 2026: 28 valid quotes, with award prices of **RMB 0.491–0.5608/Wh**. — [国际储能网](https://chuneng.in-en.com/html/chunengy-54167.shtml)
- May 2026 monthly storage-system average: RMB 0.5937/Wh. — [Energy-Storage.news via search](https://www.energy-storage.news/chinas-energy-storage-market-doubles-in-size-for-second-consecutive-year-as-price-inflection-point-emerges/)
- TrendForce weighted averages:
  - **Jul 2026**: 2h RMB 0.56/Wh (−2% MoM); 4h 0.50 (only 1 valid quote). 2h EPC ranged **0.61–1.48, weighted average 1.05/Wh**. Bidding exceeded 50 GWh. — [EnergyTrend, 17 Aug 2026](https://www.energytrend.com/research/20260817-51955.html)
  - **Aug 2026**: about 76 GWh awarded (an annual record); 2h **0.75** (+34% MoM); 4h about **0.60**; EPC prices diverging. — [EnergyTrend, 10 Sep 2026](https://www.energytrend.com/research/20260910-52114.html)
  - **Sep 2026**: 24.36 GW / **72.84 GWh** of new tenders (+87%/+93% YoY), of which EPC tenders were 20.51 GW / 59.99 GWh. Awards exceeded 56 GWh, with the EPC award volume at a YTD high. 2h was **0.60** (−21% MoM) and 4h **0.53** (−12%). — [EnergyTrend, 16 Oct 2026](https://www.energytrend.com/research/20261016-52306.html)
- Volume: 141.23 GWh awarded Jan–Mar 2026, 165.71 GWh Jan–Apr and **288.9 GWh Jan–Jun** (储能头条 count). — [国际储能网](https://mchuneng.in-en.com/html/chunengy-56023.shtml)
- A weekly 2h EPC average of **0.9729/Wh** (system 0.6764/Wh) appears in a 储能头条 weekly analysis. The date was not captured in the snippet. — [国际储能网 weekly](https://mchuneng.in-en.com/html/chunengy-51557.shtml)
- An unsourced Sohu article claims a "Mar 2026 weighted average of 0.9163/Wh". This conflicts with all other trackers and is likely EPC or mixed scope. **Do not use.** — [Sohu](https://www.sohu.com/a/1013106711_122663411)

**Cells (input to system prices)**
- 314Ah cells were near **RMB 0.4/Wh in early Mar 2026**, +30% vs January and about 50% above the 2025 lows. — [Energy-Storage.news](https://www.energy-storage.news/price-jump-chinese-firms-battery-cell-quotes-approach-0-4-rmb-wh-system-prices-follow-suit/)
- CATL raised 314Ah prices from 0.414 to 0.423/Wh. GGII put the average at about 0.38/Wh in mid-2026. — [Energy-Storage.news](https://energy-storage.news/catl-eve-energy-lead-chinese-manufacturers-battery-storage-cell-price-hikes)
- InfoLink: 314Ah rose from 0.300/Wh (late Oct 2025) to **0.365/Wh (20 Apr 2026)**. — [ESS News](https://www.ess-news.com/2026/04/22/chinas-314-ah-storage-cell-prices-climb-more-than-20-in-six-months/)
- The Aug 2026 mainstream 314Ah average was about **0.365/Wh**, vs about 0.31 at end-2025. — [财联社](https://m.cls.cn/detail/2455347)
- Lithium carbonate was RMB 181,500/t on 26 Jan 2026 (SMM). — [ESS News](https://www.ess-news.com/2026/04/22/chinas-314-ah-storage-cell-prices-climb-more-than-20-in-six-months/)

**PV modules, SOE centralized procurement**
- PowerChina 2026 framework (31 GW modules + 31 GW inverters), candidates published Mar 2026: module bids of **RMB 0.735–0.78/W**, with the TOPCon lot at 0.735–0.748 (average 0.738). — [Sina, 23 Mar 2026](https://finance.sina.com.cn/wm/2026-03-23/doc-inhrxvtt5404173.shtml), [Sina, 19 Mar 2026](https://finance.sina.com.cn/roll/2026-03-19/doc-inhrpspv7406989.shtml)
- CEEC: TOPCon lot average **0.723/W**. — [search summary of Sohu/Sina coverage](https://www.sohu.com/a/1085693689_703050)
- PowerChina + Huadian 19 GW opening: **0.665–0.77/W**. Huadian 2026 second-batch 5 GW framework: **26 bidders**, 0.665–0.75/W, average **0.716/W**. — [Sohu](https://www.sohu.com/a/1085693689_703050)
- CNNC 2026–2027 module framework (TOPCon + BC lots): lowest opening bid **0.66/W**. — [Sohu](https://www.sohu.com/a/1052816501_121124363)
- Datang 11 GW module framework (Jul 2026): 15 winners including LONGi, Trina, Jinko, JA, Tongwei and Gokin. — [Sina, 17 Jul 2026](https://finance.sina.com.cn/wm/2026-07-17/doc-iniickay1392272.shtml)
- A 79.4 GW summary of SOE module frameworks gives averages of **BC 0.774/W and TOPCon 0.745/W**, with 33 winners. — [Eastmoney, 13 Jul 2026](https://caifuhao.eastmoney.com/news/20260713183557758413630)
- Sep 2026 monthly (光伏头条): TOPCon average **0.704/W** (−0.42% MoM, range 0.670–0.763), all N-type 0.717, HJT 0.758, BC 0.783. Jan–Sep 2026: about 349 lots and **120.3 GW** awarded, of which 12.68 GW in September. — [Eastmoney, 14 Oct 2026](https://caifuhao.eastmoney.com/news/20261014112802097432400); a different count gives 114 GW Jan–Sep — [SolarZoom](http://m.solarzoom.com/article-196603-1.html)
- Mysteel weekly award average: 0.738/W at end-Aug, falling to 0.70/W in mid-Sep 2026. — [Mysteel](https://m.mysteel.com/hot/1486327.html)
- Weekly (Sep 2026): module average 0.74/W; large EPC prices 2.77/W distributed and 2.61/W utility. — [Sina, 20 Sep 2026](https://finance.sina.com.cn/roll/2026-09-20/doc-inisnssw6551798.shtml)
- Late-2024 reference: 0.622/W low bids amid the price war. — [ECCN, Oct 2024](https://news.eccn.com/news_2024100909405875.htm)
- Late-2025 reference: Huadian 370 MW, TOPCon 0.724/W and BC 0.73/W (JA, LONGi). — [solarbe, 5 Nov 2025](https://news.solarbe.com/202511/05/50011911.html)

**Inverters (PCS-adjacent)**
- Jan–Feb 2026: 44 inverter lots, 15.9 GW awarded, about 97% from SOEs. The low was 0.083/W in Feb and 0.119 in Jan; the high was 0.134 in Feb and 0.188 in Jan. Distributed string inverters averaged 0.134 in Feb (0.188 in Jan); central inverters about 0.097. China Coal string framework bids: 0.083–0.102/W (中建材信云智联, 上能电气, Sungrow). — [Sohu 1–2月排行](https://www.sohu.com/a/996086768_257552)
- Datang 2026–27 inverter framework (9.5 GW string + 1.5 GW central): lowest candidate **0.085/W**. — [SolarZoom](http://m.solarzoom.com/article-194035-1.html)
- A weekly analysis cites an inverter high of 0.133/W. — [solar.in-en.com](https://solar.in-en.com/html/solar-2459992.shtml)

### Inferences
- Large SOE frameworks clear about 10–20% below the market-wide monthly 2h averages: 0.49–0.55 vs 0.56–0.67 in H1 2026. Use them as a "floor/benchmark" series and the monthly trackers as a "market" series.
- August's spike to 0.75 (2h) followed by September's 0.60 suggests monthly weighted averages are noisy, swayed by a few large non-framework awards. Smooth over 3 months or use medians.

### Gaps
- I found no reliable consolidated figures for **ESS PCS-only** tenders (RMB/W) in 2026.
- I have no Southern Grid- or State Grid-specific ESS prices for 2026.
- September EPC averages were cut off in the EnergyTrend snippet.

## 5. How often tenders appear and how to collect them in practice (access, anti-bot, login, language, legality)

### Takeaway
Volume is high. China tendered tens of GWh of ESS per month in 2026 (about 50 GWh in July, 72.84 GWh in September), and 300–400 PV module lots were awarded over 9 months. Large SOE frameworks cluster in Q1 (Jan–Mar) for the annual 集采, with additional batches mid-year. Public announcements are free to read but scattered across about 15 SOE portals plus national and provincial mirrors. Bidding (not reading) requires registration plus a CA certificate. The legal risk of collection lies in how data is obtained (circumventing technical protection, server load) and in personal data, not in the public nature of the notices.

### Cited Findings
- Frequency evidence:
  - EnergyTrend monthly reports: >50 GWh of bidding in Jul 2026 and 72.84 GWh of new tenders in Sep 2026. — [EnergyTrend Jul](https://www.energytrend.com/research/20260817-51955.html), [Sep](https://www.energytrend.com/research/20261016-52306.html)
  - Weekly ESS tracker reports, e.g. "本周17.5GWh储能招中标项目". — [国际储能网](https://mchuneng.in-en.com/html/chunengy-51557.shtml)
  - About 349 PV module lots awarded Jan–Sep 2026. — [Eastmoney](https://caifuhao.eastmoney.com/news/20261014112802097432400)
  - Major SOE ESS framework results land in Feb–Mar: Huadian on 3 Mar, CGN/SPIC by 25–26 Mar 2026. — [ESS News](https://www.ess-news.com/2026/03/11/china-huadian-announces-winners-of-12-gwh-energy-storage-tender-as-bidding-prices-rise-from-last-year/), [Sina](https://finance.sina.com.cn/wm/2026-03-26/doc-inhshxnu0267943.shtml)
- Login: Huadian's portal requires supplier registration plus a digital certificate to take part in bidding. — [Aiqicha](https://aiqicha.baidu.com/details/ugknowledge?id=00785a8e00975243f368838e7050a609)
  - A third-party State Grid mirror's registration form asks for a mobile number + SMS code, which suggests Chinese mobile numbers are typical for registration. This page is not official. — [sgcc.dlnyzb.com](https://sgcc.dlnyzb.com/3019)
- Official data access: cebpubservice offers a formal 数据接口规范 (10号令) for connected platforms. Others are told to browse 【交易公开】. — [cebpubservice](https://bulletin.cebpubservice.com/)
- Paid route: 千里马 offers an API push of nationwide daily tender data as part of its paid tiers (RMB 8k–22k/yr; API price not public). — [qianlima](https://www.qianlima.com/common/huiyuan.jsp)
- Exchange filings route: listed bidders file "预中标/中标" notices on SSE/SZSE, citing the portal and notice. These are clean PDFs with project, amount and owner. — [宏盛华源](https://stockmc.xueqiu.com/202607/601096_20260718_10WC.pdf), [积成电子](http://file.finance.sina.com.cn/211.154.219.97:9494/MRGG/CNSESZ_STOCK/2026/2026-5/2026-05-06/12297590.PDF)
- **Legality (PRC)**:
  - Criminal law Art. 285 (非法获取计算机信息系统数据罪) is the core offence for scraping. Courts focus on whether **technical protection measures were circumvented**, and the "other technical means" wording means public availability does not automatically exclude liability. — [Hanspub law journal 2025](https://pdf.hanspub.org/ojls_2923956.pdf)
  - Civil exposure arises under Art. 2 of the Anti-Unfair Competition Law. Examples: 谷米 v 元光, RMB 500k for scraping real-time bus data; Taobao/Tmall, RMB 5M against a long-term scraper. — [21经济网](https://www.21jingji.com/article/20230928/herald/5e6834d866d1b46043277b3c03193d24.html), [ipeconomy](https://www.ipeconomy.cn/dongtai/10170.html)
  - Commentators' three-part test is data source legality, acquisition method and downstream use. Commercial resale and bypassing CAPTCHAs or rate limits raise the risk. — [21经济网](https://www.21jingji.com/article/20230928/herald/5e6834d866d1b46043277b3c03193d24.html), [AllBright Law](https://www.allbrightlaw.com/CN/10475/898889c4d5f1b06c.aspx)
  - Notices that contain personal info (contact names, phone numbers) can engage personal-information offences. — [Hanspub](https://pdf.hanspub.org/ojls_2923956.pdf)
  - I found no case law specifically about scraping tender portals.

### Inferences
- Practical stack:
  1. Daily keyword monitoring (储能系统, 储能电站 EPC, 磷酸铁锂储能, 光伏组件 集采, 逆变器 框架, 中标候选人公示) on cebpubservice and the about 12 SOE portals, at polite rates without bypassing CAPTCHAs.
  2. Parse candidate notices and opening records. Many come as HTML tables, but attachments are often PDF or scanned images that need Chinese OCR. Prices may be given as totals (万元) and need conversion to RMB/Wh via MWh.
  3. Cross-check against media trackers (储能头条, 光伏头条, CNESA, EnergyTrend).
  4. Consider 千里马/剑鱼 for coverage instead of maintaining scrapers.
- Several SOE portals (State Grid ECP 2.0) are JavaScript SPAs with hash routes. Expect headless-browser rendering. Unverified, but this follows from the `#/doc/` URL pattern.
- Geo-blocking: mainland portals are often slow or unreachable from abroad. Every Chinese host failed DNS from this research environment, which is consistent with but does not prove geo/network restrictions. Plan for a mainland-based or CN-routed collector.
- Reading only public notices at low request rates, without circumventing access controls, and without republishing personal data appears to be the low-risk zone. Get legal review before any commercial redistribution.

### Gaps
- No direct test of CAPTCHA or rate limits on cebpubservice, ECP, chdtp and the other portals. This is the key remaining unknown.
- No portal ToS texts were retrieved.
- It is unconfirmed whether a Chinese phone number is mandatory for read-only access. My expectation is that it is not: notices are publicly readable, but the bidding and download functions need registration.
