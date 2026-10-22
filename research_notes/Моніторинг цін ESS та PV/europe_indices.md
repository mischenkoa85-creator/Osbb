# European price indices, benchmarks and analyst sources for PV modules, inverters and ESS (as of 22 Oct 2026)

Research method note: done with web search only. Direct page fetches (WebFetch/curl) to pvxchange.com, sun.store and pveurope.eu were blocked by the sandbox network (DNS/403), so the figures below come from search-result extracts of the cited pages, not from full-page reads. Exact numbers should be spot-checked on the primary page before they go into production configs. Where secondary outlets disagree, both are noted.

---

## 1. Module price indices for Europe (pvXchange, sun.store, OPIS, InfoLink, ENF, PVinsights, BNEF/WoodMac/S&P/Rystad/Exawatt)

### Takeaway
Two free monthly European spot indices in €/Wp cover the market. The **pvXchange Modulpreisindex** is published monthly by pvxchange.com and reprinted with commentary by pv magazine, Solarserver and gramwzielone. It is split by efficiency class and is shown as a chart only. The **sun.store PV Index** is a monthly blog post with numeric tables by technology, plus inverters, and a separate monthly Battery Index. Both are free to read and both are easy to scrape from the articles. OPIS (weekly, Europe DDP/EXW TOPCon in €/W) and InfoLink (weekly, USD/W FOB) are the paid professional benchmarks. Their headline numbers leak into free pv magazine columns. As of Sept 2026, European module prices are about €0.11–0.16/Wp depending on segment. H1 2026 saw a roughly 25% rise, driven partly by China removing its PV export VAT rebate on 1 Apr 2026. Prices have eased slightly since July.

### Cited Findings
**pvXchange (Berlin trading platform, monthly; free chart + monthly analysis by Martin Schachinger)**
- Index page: https://www.pvxchange.com/Price-Index. Monthly market-analysis archive: https://www.pvxchange.com/Market-Analysis_1. pv magazine DE keeps a tag archive of the index columns: https://www.pv-magazine.de/tag/pvxchange-modulpreisindex/ and a page at https://www.pv-magazine.de/modulpreisindex/ — [pvXchange](https://www.pvxchange.com/Price-Index), [pv magazine DE](https://www.pv-magazine.de/tag/pvxchange-modulpreisindex/)
- Prices are "average offer prices for duty paid goods on the European spot market". The index is published only as a graph, and one analysis notes it "cannot be cited as a reliable set of figures" from the chart alone. Numeric values appear in the monthly text/press commentary — [Logic Energy summary](https://en.logicenergy.de/neuigkeiten/pv-preisentwicklung-2026), [pvXchange](https://www.pvxchange.com/Price-Index)
- Categories:
  - **High Efficiency**: the threshold was lowered to 22.5% in early 2025. It was later >23%, and from the **August 2026 index the Mainstream/High-Efficiency line was raised to 23.5%** because the 23% cutoff left almost no Mainstream price points.
  - **Mainstream**: PERC and lower-efficiency TOPCon.
  - **Full Black**: reintroduced Jan 2025.
  - **Low Cost**: clearance stock, B-grade, used modules and stock from insolvency estates.
  - The definitions conflict slightly between secondary sources. —
  [pv magazine "PV module prices at crossroads" (Jan 2025)](https://www.pv-magazine-australia.com/2025/01/23/pv-module-prices-at-crossroads), [pv magazine 18 Aug 2026](https://www.pv-magazine.com/2026/08/18/as-europe-overheats-solar-module-prices-cool-down/), [gramwzielone.pl Sep 2026](https://www.gramwzielone.pl/?p=20380976), [ema-energiewelt.de May 2026](https://ema-energiewelt.de/wissen/solarmodule-preise-anstieg-2026-trendwende)
- Feb 2026: High Efficiency €0.130/Wp, Mainstream €0.115/Wp, Full Black €0.145/Wp — [TaiyangNews / pvXchange](https://taiyangnews.info/business/pvxchange-flags-potential-price-surge-in-solar-modules); [rinnovabili.net](https://www.rinnovabili.net/business/energy/photovoltaic-module-prices-2025-updated-data/)
- April 2026: "PV module prices continue to rise unabated" — [pv magazine 16 Apr 2026](https://www.pv-magazine.com/2026/04/16/pv-module-prices-continue-to-rise-unabated/)
- July 2026: High Efficiency (>23%) about €0.145/Wp (+26.1% since January), Mainstream about €0.135/Wp, Full Black about €0.160/Wp. Movements were described as negligible for Full Black and Low Cost. Headline: "Rise in solar module prices comes to a halt". — [pv magazine 16 Jul 2026](https://www.pv-magazine.com/2026/07/16/rise-in-solar-module-prices-comes-to-a-halt/), [Logic Energy](https://en.logicenergy.de/neuigkeiten/pv-preisentwicklung-2026)
- August 2026: prices were roughly flat, with oversupply pressure mainly in Mainstream. Weak sales were attributed to pull-forward effects. — [pv magazine 18 Aug 2026](https://www.pv-magazine.com/2026/08/18/as-europe-overheats-solar-module-prices-cool-down/)
- September 2026: prices "eased moderately" ("kilkuprocentowe spadki", i.e. drops of a few percent). Full Black was the most expensive category at about €0.155/Wp. I did not find the other Sept category values. — [Solarserver 21 Sep 2026](https://www.solarserver.de/2026/09/21/preise-fuer-photovoltaik-module-im-september-2026-gesunken), [gramwzielone.pl](https://www.gramwzielone.pl/?p=20380976)
- Historical depth: the index has run since at least 2009. pvXchange formerly split prices by origin (Germany/Japan/China/SE Asia) before switching to the technology/efficiency classes. Solarserver articles show it in 2020. — [Solarserver 2020](https://www.solarserver.de/2020/09/24/preise-fuer-photovoltaik-module-sinken-weiter/) (the exact start year was not confirmed; see Gaps)

**sun.store PV Index (B2B marketplace, Kraków/Berlin; monthly free blog; also reprinted on pv Europe and PV Tech)**
- Monthly posts with numeric tables, e.g. https://sun.store/blog/pv-index-may-2026/, https://sun.store/blog/pv-index-june-2026/, https://sun.store/blog/pv-index-august-2026/. pv Europe reprint for Sept 2026: https://www.pveurope.eu/solar-modules/september-pv-index-module-prices-ease-demand-edges — [sun.store](https://sun.store/blog/pv-index-august-2026/), [pv Europe](https://www.pveurope.eu/solar-modules/september-pv-index-module-prices-ease-demand-edges)
- Module segments: TOPCon bifacial, TOPCon monofacial, Full Black and Back Contact, in €/Wp, with month-on-month % changes. The data comes from offers/transactions on the sun.store marketplace. It also publishes a "demand" or sentiment signal. — [pv Europe Sep 2026](https://www.pveurope.eu/solar-modules/september-pv-index-module-prices-ease-demand-edges), [PV Tech](https://www.pv-tech.org/european-pv-module-prices-ease-out-in-september/)
- Sept 2026: TOPCon bifacial €0.114/Wp (−1.3% m/m, cheapest), TOPCon monofacial about €0.12/Wp. Full Black dipped about 1% and overtook Back Contact as the most expensive segment. Declines ranged from 1.1% to 3.6% across all technologies. — [PV Tech](https://www.pv-tech.org/european-pv-module-prices-ease-out-in-september/), [IndexBox recap](https://www.indexbox.io/blog/european-solar-module-prices-fall-across-all-technologies-in-september-2026/)
- March 2026: sun.store said the price increase "may prove temporary". — [PV Tech](https://www.pv-tech.org/european-solar-pv-module-price-increase-in-march-2026-may-prove-temporary-says-sun-store/)
- June 2026: prices rose, but bifacial TOPCon bucked the trend. August 2026: prices and demand fell. — [IndexBox June](https://www.indexbox.io/blog/european-pv-module-prices-rise-in-june-2026-bifacial-topcon-bucks-trend/), [PV Tech Aug](https://www.pv-tech.org/european-pv-module-prices-and-demand-fall-in-august/)

**OPIS (Dow Jones; paid "Solar Weekly"; headline numbers republished in pv magazine columns)**
- The weekly report covers China FOB (the Chinese Module Marker, CMM, TOPCon) and Europe DDP for imported TOPCon, plus EXW Europe warehouse prices, in €/W and USD/W. Sample report: https://www.opis.com/wp-content/uploads/2024/07/OPIS-Solar-Weekly-Report.pdf — [OPIS sample PDF](https://www.opis.com/wp-content/uploads/2024/07/OPIS-Solar-Weekly-Report.pdf)
- 7 Jul 2026: DDP Europe imported TOPCon >600 Wp averaged €0.109/Wp ($0.124). Smaller-format TOPCon already in European warehouses was about €0.111/Wp EXW Europe. CMM TOPCon FOB China was $0.113/W. European inventories had "normalized" after two years of oversupply. — [pv magazine 3 Jul 2026](https://www.pv-magazine.com/2026/07/03/china-solar-module-forward-prices-ease-amid-softer-europe-demand/)
- Older Rotterdam data point: EXW Rotterdam TOPCon 450 W at €0.103/W (2025). Europe DDP TOPCon at €0.104/W (Oct 2024). — [pv magazine Mar 2025](https://www.pv-magazine.com/2025/03/14/global-module-prices-trend-upward-in-q2/), [pv magazine Oct 2024](https://www.pv-magazine.com/2024/10/11/european-topcon-solar-module-prices-inched-lower-on-weaker-demand/)
- OPIS blog on the European market: https://www.opis.com/blog/european-solar-market-pv-shifts-beyond-price/ — [OPIS](https://www.opis.com/blog/european-solar-market-pv-shifts-beyond-price/)

**InfoLink Consulting (Taiwan; weekly spot prices; free summary articles, full tables paid)**
- Weekly "pv-spot-price" articles. In Jun 2026, TOPCon outside China held at USD 0.116/W. In Apr 2026, European distribution and ground-mount quotes were USD 0.12–0.125/W. — [InfoLink 17 Jun 2026](https://www.infolink-group.com/energy-article/pv-spot-price-20260617), [InfoLink 22 Apr 2026](https://www.infolink-group.com/energy-article/pv-spot-price-20260422)

**China's export VAT rebate change (the main 2026 price driver)**
- The PV-product export VAT rebate was removed on 1 Apr 2026. The battery rebate was cut from 9% to 6% for Apr–Dec 2026 and will be eliminated on 1 Jan 2027. — [TaiyangNews](https://taiyangnews.info/markets/china-to-remove-solar-export-tax-rebates-from-april-1-2026), [vicoexport](https://www.vicoexport.com/en/64671/china-eliminates-export-vat-rebates-on-photovoltaic-products-and-batteries-from-2026/), [pv Europe](https://www.pveurope.eu/markets/europe-races-secure-supply-china-ends-export-incentives)
- Chinese solar exports fell 21.4% y/y in July 2026, the third straight monthly decline after the rebate removal. — [OilPrice](https://oilprice.com/Latest-Energy-News/World-News/Chinas-Solar-Exports-Fell-214-in-July.amp.html)

### Inferences
- **For an aggregation system, the practical free core is:** (a) the sun.store monthly PV Index (numeric, by technology); (b) the pvXchange monthly values taken from the pv magazine, Solarserver or gramwzielone text, since the pvXchange chart itself is not machine-readable; and (c) OPIS and InfoLink headline numbers from free pv magazine and InfoLink articles. All are monthly or weekly HTML articles, so collect them with RSS or a sitemap watch plus an LLM/regex extraction of €/Wp values per category. Store the category definition version, because the pvXchange thresholds changed in 2025 and again in Aug 2026.
- pvXchange and sun.store measure different things. pvXchange is offer prices, duty paid, spot. sun.store is marketplace prices by technology. OPIS DDP and EXW are assessed prices. Do not merge them into one series. Keep separate series tagged by source, Incoterm and category.
- Wood Mackenzie, BNEF, S&P Global Commodity Insights, Rystad, Exawatt and Sinovoltaics are paid analyst products (subscription or report purchase). I found no free European module price series from them in this search. Their numbers appear only sporadically in press (e.g. BNEF battery surveys, below). ENF and PVinsights publish free weekly headline tables, mostly global/China in USD. I found no current Europe-specific €/W figures from them.

### Gaps
- Exact Sept 2026 pvXchange values for High Efficiency, Mainstream and Low Cost were not found. They need a check of pvxchange.com or the pv magazine Sept/Oct 2026 column. The October 2026 index (normally published mid-month) was not surfaced.
- The start year of the pvXchange index history, and whether pvXchange sells CSV or API data, were not verified.
- OPIS, InfoLink, BNEF, WoodMac, S&P, Rystad and Exawatt subscription prices and API/data-license terms were not found. These need contact with vendors.
- ENF and PVinsights Europe-specific series were not found.

---

## 2. ESS / battery price benchmarks for Europe (residential, C&I, utility-scale; tender results as price signal)

### Takeaway
**Residential:**
- sun.store's free monthly Battery Index gives €/kWh by brand tier. In June 2026: HV premium about €281/kWh, HV performance about €150/kWh, LV about €109/kWh (distributor/B2B level).
- EUPD Research's paid Price & Inventory Tracker gives end-customer system ASPs. Its latest public figure is about €711/kWh for German systems up to 20 kWh (H1 2025).

**Utility-scale:** BNEF's annual surveys are the reference.
- Pack price survey (Dec 2025): stationary storage packs $70/kWh.
- Turnkey system survey: Europe about $177/kWh vs China $73/kWh.
- Modo's Germany capex is about €700k/MW (2h) and €935k/MW (4h).

**Tender clearing prices are public and free:**
- Italy MACSE 2025: weighted average €12,959/MWh-year.
- Poland capacity market: 325–465 PLN/kW-year.
- German Innovationsausschreibung (PV+storage): 5.14 ct/kWh in Sept 2026.

### Cited Findings
**sun.store Battery Index (monthly, free; segments by voltage and brand tier, €/kWh)**
- Blog posts: https://sun.store/blog/battery-index-january-2026/, https://sun.store/blog/battery-index-may-2026/, https://sun.store/blog/battery-index-november-2025/. pv Europe reprints: https://www.pveurope.eu/solar-storage/february-battery-index-residential-prices-rise-commercial-segment-holds-steady — [sun.store](https://sun.store/blog/battery-index-may-2026/), [pv Europe](https://www.pveurope.eu/solar-storage/battery-index-commercial-demand-picks-prices-ease)
- Segments: residential high-voltage "premium brands", HV "performance brands", low-voltage brands, plus commercial (C&I) commentary. Premium costs about 2.5× LV per kWh. — [sun.store May 2026](https://sun.store/blog/battery-index-may-2026/)

  | Month | HV premium | HV performance | LV |
  |---|---|---|---|
  | Jan 2026 | €273.4/kWh | €148.2/kWh | €102.89/kWh |
  | Feb 2026 | €284.9/kWh (peak) | €155.4/kWh | n/a |
  | May 2026 | €271.6/kWh (−1% m/m) | €159.4/kWh (−4%) | €109.3/kWh (−5%) |
  | Jun 2026 (pv Europe) | €280.8/kWh (+3%) | €150.5/kWh (−6%) | €108.6/kWh (−1%) |

  In May 2026, commercial battery prices were "stable" but marketplace availability was contracting. — [sun.store Jan 2026](https://sun.store/blog/battery-index-january-2026/), [pv Europe Feb](https://www.pveurope.eu/solar-storage/february-battery-index-residential-prices-rise-commercial-segment-holds-steady), [sun.store May 2026](https://sun.store/blog/battery-index-may-2026/), [pv Europe](https://www.pveurope.eu/solar-storage/battery-index-commercial-demand-picks-prices-ease)
- Example SKU-level B2B prices (Oct 2026): Sungrow SBR096 9.6 kWh battery from €2,935 (about €306/kWh). SH6.0RS 6 kW hybrid inverter from €699. — [sun.store Sungrow review](https://sun.store/blog/sungrow-inverter-review/)

**EUPD Research (Bonn; paid Price & Inventory Tracker and residential storage report subscriptions; headline numbers in pv magazine and ESS News)**
- The German home-storage price index for systems up to 20 kWh fell from €1,332/kWh (H1 2023) to €711/kWh (H1 2025), a drop of more than 50%. Some sources label this H2 2025, which is inconsistent. — [ESS News 23 Jul 2025](https://www.ess-news.com/2025/07/23/eupd-research-home-storage-grows-across-europe-in-first-half-of-2025/), [pv magazine](https://www.pv-magazine.com/2025/07/23/home-storage-grows-across-europe-in-first-half-of-2025/)
- Subscription proposal PDF (residential storage reports): https://www.eupd-research.com/wp-content/uploads/EuPD_Research_Proposal_Subscription_Residential_Storage_Reports_Juli_2023.pdf — [EUPD](https://www.eupd-research.com/wp-content/uploads/EuPD_Research_Proposal_Subscription_Residential_Storage_Reports_Juli_2023.pdf)
- 9 Oct 2026, EUPD's Ali Arfa:
  - Rising European storage inventories should pressure residential and C&I prices down, mainly toward the end of 2026. Utility-scale prices should stay broadly stable because those systems are built to order.
  - Shipment indications from some leading manufacturers exceed short-term absorption.
  - China holds 80–90% of cell production and 70–75% of pack production.
  - European residential installs are expected at 15–17 GWh in 2026.

  — [pv magazine 9 Oct 2026](https://www.pv-magazine.com/2026/10/09/european-storage-inventories-on-the-rise/), [ESS News](https://www.ess-news.com/2026/10/09/european-storage-inventories-on-the-rise/)
- EUPD expects the European storage market to reach 57 GWh in 2026, +78% vs 32 GWh in 2025. — [ESS News 7 Sep 2026](https://www.ess-news.com/2026/09/07/europes-storage-market-to-hit-57-gwh-in-2026-says-eupd-research/)

**BNEF (paid; annual battery price survey in Dec, plus Energy Storage System Cost Survey; free press releases)**
- Dec 2025 survey: global average pack $108/kWh (−8%). Stationary storage packs $70/kWh (−45%), now the cheapest segment. European pack prices fell 8%. North American and European packs are 44% and 56% above China. — [ESS News 9 Dec 2025](https://www.ess-news.com/2025/12/09/bnef-lithium-ion-battery-pack-prices-fall-to-108-kwh-stationary-storage-becomes-lowest-price-segment/), [Energy-Storage.news](https://www.energy-storage.news/li-ion-battery-pack-prices-fell-8-since-last-year-despite-metals-prices-rising-bloombergnef-says/)
- BNEF Energy Storage System Cost Survey 2025: global turnkey BESS $117/kWh, China $73/kWh, **Europe $177/kWh**, US $219/kWh. This comes from secondary write-ups. I did not see the primary BNEF release. — [NEIAAP summary](https://www.neiaap.com/article/battery-storage-system-prices-continue-to-fall-sharply-bnef-and-ember-reports-find), [PowerLutions](https://powerlutions.com/marlboro/why-home-batteries-cost-more-than-grid-batteries)
- BNEF press insight pages: https://about.bnef.com/insights/clean-energy/lithium-ion-battery-pack-prices-hit-record-low-of-139-kwh/ (2023 survey) — [BNEF](https://about.bnef.com/insights/clean-energy/lithium-ion-battery-pack-prices-hit-record-low-of-139-kwh/)

**Utility-scale / C&I capex benchmarks (analyst, mostly paid)**
- Modo Energy, Germany BESS investment outlook Q2 2026: capex about €700k/MW for 2h and €935k/MW for 4h. That is about €350/kWh and €234/kWh (my arithmetic). Modo research is paywalled beyond the executive summaries. — [Modo Energy](https://modoenergy.com/research/en/germany-battery-investment-outlook-q2-2026-executive-summary)
- bess-market.com Germany 2026 turnkey: 2h about €350–550/kWh, 4h about €280–450/kWh. It warns that battery-only offers are not comparable with turnkey offers. This is a vendor/consultancy site. — [bess-market.com](https://bess-market.com/en/knowledge/bess-capex-benchmark-2026/)
- UK: turnkey 2h capex can fall below £300/kWh (secondary blog). — [CM Energy Insight](https://www.cmenergyinsight.com/post/the-uk-bess-boom-costs-revenue-and-scale)
- JRC "Overview of Energy Storage Deployment in Europe" (free PDF): installation and development costs remain region-dependent. — [JRC141463](https://publications.jrc.ec.europa.eu/repository/bitstream/JRC141463/JRC141463_01.pdf)
- C&I Europe total-installed-cost guide (updated Jun 2026; vendor blog): https://www.pvb.com/blog/how-much-does-a-ci-bess-really-cost-in-2026-europe-total-installed-cost-guide-for-cfos-updated-june-2026/ — [pvb.com](https://www.pvb.com/blog/how-much-does-a-ci-bess-really-cost-in-2026-europe-total-installed-cost-guide-for-cfos-updated-june-2026/)
- Vendor blogs give widely divergent Europe figures, from $85–115/kWh up to $275/kWh. These are low quality and should not be used as benchmarks. — [howtostoreelectricity](https://howtostoreelectricity.com/bess-cost-per-mwh-utility-scale-2026/), [solartodo](https://solartodo.com/knowledge/battery-energy-storage-system-pricing-trends-2026-utility-scale-ci-benchmarks)

**SolarPower Europe (free reports; volumes rather than prices)**
- European Battery Market Outlook 2026–2030: 36 GWh installed in Europe in 2025 (utility-scale more than half). More than 50 GWh is expected in 2026 and 138 GWh by 2030 (medium scenario). Residential was 12.3 GWh in 2025 (+3%) but fell in the EU (−7%, or −6% to 9.8 GWh per the EU review). Residential is forecast at +7% to 13.2 GWh in 2026. I did not find system price data in the coverage. — [SPE outlook page](https://www.solarpowereurope.org/insights/outlooks/european-battery-market-outlook-2026-2030-1), [SPE press release](https://www.solarpowereurope.org/press-releases/new-report-european-battery-storage-surges-in-2025-as-utility-scale-drives-next-growth-phase), [ees Europe](https://www.ees-europe.com/news/european-bess-market-2026-2030)

**Tender / auction results as free price signals**
- **Italy MACSE (Terna; storage capacity, 15-year contracts, pay-as-bid)**
  - 1st auction (30 Sep 2025, results 1 Oct 2025): 10 GWh procured, bids 4× oversubscribed.
  - Weighted average €12,959/MWh-year vs a reserve of €37,000.
  - Zonal results: Centre-South €14,566, South+Calabria €12,146, Sicily €15,846, Sardinia €15,029 (€/MWh-year).
  - About €129.6m/yr in total payments, for delivery in 2028.
  - 2nd auction: rules published 28 May 2026, 16 GWh, **auction on 24 Nov 2026**.

  — [ESS News 1 Oct 2025](https://www.ess-news.com/2025/10/01/italys-first-macse-battery-auction-smashes-expectations-10-gwh-awarded-at-record-low-prices/), [Energy-Storage.news](https://www.energy-storage.news/terna-is-the-big-winner-taking-stock-of-italys-macse-auction/), [Modo Energy on 2026 rules](https://modoenergy.com/research/de/italy-macse-2026-auction-bess-rules-terna), [GME/eMarket Storage PDF](https://www.emarketstorage.it/sites/default/files/comunicati/2026-03/20260326_180098.pdf)
- **Poland capacity market (PSE)**
  - Main T-5 auction (delivery 2030): 465.02 PLN/kW-year (vs 223.77 in 2024). About 685 MW of obligations went to BESS. The BESS derating factor was cut to 13.39%.
  - Supplementary auction for delivery 2027 (3 Sep 2026): 325.55 PLN/kW-year. Battery capacity cleared was 80 MW (Modo) or 94 MW (other Modo version), which conflict. R.Power holds 76 MW.
  - Supplementary auction for 2026: preliminary 346.37 PLN/kW-year.

  — [Modo Energy](https://modoenergy.com/research/en/poland-capacity-market-supplementary-auction-bess-2027), [PSE announcement](https://www.pse.pl/documents/31287/20965895/Announcement_supplementary+auction_2026/b66d1fb9-68de-4dd7-9564-3076fb7b7bdc), [PGE current report](https://www.gkpge.pl/en/for-investors/current-reports/publication-of-preliminary-results-of-the-supplementary-capacity-market-auction-for-2026), [ESS News](https://www.ess-news.com/?p=7742)
- **Germany Innovationsausschreibung (BNetzA; PV+storage combinations)**
  - 1 Sep 2026: 475 MW awarded. Weighted average 5.14 ct/kWh, range 4.50–5.40. All 32 awards went to PV+storage. Oversubscribed (678 MW bid).
  - 1 May 2026: average 5.34 ct/kWh, range 4.75–5.61.
  - Rooftop PV tender 1 Jun 2026: 8.40–10 ct/kWh (undersubscribed).

  — [BNetzA Sep 2026](https://www.bundesnetzagentur.de/1112074), [BNetzA May 2026](https://bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/Innovation/BeendeteAusschreibungen/GT1052026/start.html), [pv magazine DE 29 Sep 2026](https://www.pv-magazine.de/2026/09/29/juengste-innovationsausschreibung-wieder-ueberzeichnet/), [BNetzA press 16 Jul 2026](https://bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260716_Solar2.html)
- **IRENA (free, annual):** the global installed cost of 4h utility-scale BESS was about $140/kWh in 2025 (−30% y/y, −95% vs 2010). Europe added 32 GWh (11% of global). Global utility PV installed cost was $667/kW. — [GreentechLead on IRENA](https://greentechlead.com/renewable-energy/battery-energy-storage-system-costs-plunge-95-since-2010-as-global-installations-reach-307-gwh-in-2025-irena-54064), [IRENA RPGC 2025 exec summary PDF](https://elettricomagazine.it/wp-content/uploads/2025/08/IRENA_TEC_RPGC_2025_Executive_summary_2026.pdf)

### Inferences
- **Tiered price ladder for ESS (2025–2026), to keep separate in the database:**

  | Level | Price |
  |---|---|
  | Stationary pack (BNEF) | about $70/kWh |
  | Turnkey utility system, Europe (BNEF) | about $177/kWh |
  | Utility capex DE (Modo) | about €234–350/kWh |
  | B2B residential LV / HV-performance / HV-premium (sun.store) | €109 / €150 / €281 per kWh |
  | End-customer residential system DE (EUPD) | about €711/kWh (H1 2025) |

  Each level has a different scope (Incoterm, inclusion of PCS/EPC/VAT). The schema should carry a "scope" field.
- Tender results are free, authoritative, and parseable from official PDFs and press releases (Terna/GME, PSE, BNetzA). They are irregular (event-driven) and should be stored as events with units €/MWh-year, PLN/kW-year and ct/kWh, not as €/kWh capex.
- Watch for a likely residential and C&I price decline in Q4 2026 (EUPD inventory warning) and a battery cost step-up on 1 Jan 2027, when China removes the battery export rebate entirely.

### Gaps
- No primary BNEF 2025 Energy Storage System Cost Survey release was seen. The Europe $177/kWh figure is secondary.
- No 2026 EUPD €/kWh figure was published openly. sun.store Battery Index editions for Jul–Oct 2026 were not surfaced.
- No Clean Horizon, Aurora or Rystad European BESS capex figures were found. They are presumed paywalled.
- UK capacity market T-4/T-1 2026 results and Germany/UK utility BESS tender prices were not researched in depth, because of the tool-call budget.
- Fraunhofer ISE / HTW / battery-charts.de (RWTH ISEA) publish volumes and a "Revenue Index" (https://battery-charts.de/revenue-index/) but no home-storage €/kWh price series was found. — [Battery Charts](https://battery-charts.de/)

---

## 3. Inverter price data in Europe

### Takeaway
The only free, regular, numeric European inverter price series found is the **sun.store PV Index** (monthly, €/kW, by hybrid or string and by power band). pvXchange covers modules only. Inverter prices in analyst reports (WoodMac, S&P) are paid and global. Values are heavily driven by product mix, so month-on-month changes are noisy.

### Cited Findings
- Sept 2026 (sun.store):
  - Hybrid 1–20 kW €94.66/kW (+5.8% m/m).
  - Hybrid >20 kW €59.93/kW (−6.9%).
  - String/on-grid >20 kW €22.03/kW (−10.5%). The drop is mostly a mix shift to cheaper large commercial GoodWe and Sofar models rather than price cuts.

  — [pv Europe Sep 2026](https://www.pveurope.eu/solar-modules/september-pv-index-module-prices-ease-demand-edges)
- Aug 2026: string inverters fell more than 20%. String 1–20 kW €41.40/kW, >20 kW €24.26/kW. Hybrid 1–20 kW −1% m/m, hybrid >20 kW +11.1%. — [sun.store PV Index Aug 2026](https://sun.store/blog/pv-index-august-2026/), [PV Tech Aug](https://www.pv-tech.org/european-pv-module-prices-and-demand-fall-in-august/)
- June 2026 (old size bands 1–15 kW / >15 kW): hybrid 1–15 kW €93.14/kW, string 1–15 kW €43.23/kW. The **band definitions changed to 1–20 kW / >20 kW from August 2026**. — [sun.store June 2026](https://sun.store/blog/pv-index-june-2026/), [sun.store May 2026](https://sun.store/blog/pv-index-may-2026/)
- Example SKU price: Sungrow SH6.0RS 6 kW single-phase hybrid from €699 (about €117/kW) on sun.store, Oct 2026. — [sun.store](https://sun.store/blog/sungrow-inverter-review/)
- IndexBox "Europe utility-scale / on-grid three-phase inverter market" pages are paid market-research sales pages, not price indices. — [IndexBox](https://www.indexbox.io/store/europe-utility-scale-pv-inverter-market-analysis-forecast-size-trends-and-insights/)

### Inferences
- For inverter monitoring, a free index alone is not enough. Combine the sun.store index (segment trend) with SKU-level price tracking of reference models (e.g. Huawei SUN2000-10KTL, Sungrow SH10RT, SMA STP, GoodWe ET/ GW) from marketplaces, which are covered by a separate research stream. Normalise everything to €/kW AC.
- Treat the sun.store size-band change in Aug 2026 as a series break.

### Gaps
- No free WoodMac, S&P or EUPD European inverter price series was found. EUPD's "Price & Inventory Tracker" may include inverters (it reportedly tracks PV components), but this was not confirmed.
- No pvXchange inverter index was found.

---

## 4. Customs / trade data as price signal (Eurostat Comext, China Customs)

### Takeaway
Eurostat Comext is free, monthly, CN8-level EU import data with values (€) and quantities. It has an SDMX 2.1 API at `https://ec.europa.eu/eurostat/api/comext/dissemination` (queries must be filtered) plus monthly bulk CSV. It can produce implied unit values for CN 85414300 (PV cells/modules) and CN 85076000 (Li-ion accumulators) by origin, e.g. China. Unit values are a rough signal: there is a mix problem (cells vs modules, kg vs units), they lag by about 2 months, and they are not €/Wp. China GACC export data (monthly) gives value but often lacks quantities usable for €/W.

### Cited Findings
- Comext API documentation: base URI `https://ec.europa.eu/eurostat/api/comext/dissemination`. It is separate from the main Eurostat API and serves DS-prefixed Comext and PRODCOM datasets. List them at `https://ec.europa.eu/eurostat/api/comext/dissemination/sdmx/2.1/dataflow/ESTAT/all`. Full datasets cannot be downloaded and must be filtered. Bulk CSV files are updated monthly. — [Eurostat API: Comext database](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/comext-database)
- Datasets: "EU trade since 2002 by HS2-4-6 and CN8" (ds-059322) is used by the comRex R package, which wraps the Comext SDMX API. DS-045409 is the classic monthly CN8 dataset. — [comRex on GitHub](https://github.com/datapumpernickel/comRex)
- An older GitHub discussion stated that Comext is not available via the standard SDMX web API and advised bulk download. This is superseded by the dedicated Comext API path above, but the two conflict. — [eurostat/restatapi discussion #7](https://github.com/eurostat/restatapi/discussions/7)
- Codelists (partner, CN) are available via Eurostat SDMX 3.0 (ESTAT/PARTNER, ESTAT/CXT_NC). The Cefic ETL is an example of a production pipeline. — [Cefic Comext ETL status](https://comext.status.cefic.org/)
- Eurostat uses CN 85414300 for solar panels. EU imports of solar panels were €11.1bn in 2024, with China at 98%. EU green-energy imports totalled €14.6bn. — [Eurostat news 9 Oct 2025](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251009-2), [Statistics Explained PDF](https://ec.europa.eu/eurostat/statistics-explained/SEPDF/cache/101732.pdf)
- In 2025, EU solar-panel import value fell 27.7% to about €8.0bn while volume fell only 4.0%, implying markedly lower average prices. This is IndexBox's reading of Eurostat data. — [IndexBox](https://www.indexbox.io/blog/eu-green-energy-trade-2025-imports-hit-eur114-billion-as-solar-slumps-wind-turbines-surge/)
- China (GACC) module exports in Jan–Aug 2026 were $16.20bn (+2.0% y/y), with August −53.5%. The aggregator notes that export weight and units are unavailable, so it computes no unit value. — [chinadata.live](https://chinadata.live/insights/china-solar-exports/)
- The ECB also publishes trade data (TRD dataset) as an alternative access route. — [ECB Data Portal TRD](https://data.ecb.europa.eu/data/datasets/TRD/data-information)

### Inferences
- **Practical pipeline:** query the Comext API monthly. Filter by reporter (EU27 and/or individual states, e.g. DE, NL, PL), partner (CN; also VN, IN, KH for diversion), product (85414300, 85076000; optionally 85044084/85044086 for static converters/inverters), flow (import) and indicators (VALUE_IN_EUROS, QUANTITY_IN_KG, SUP_QUANTITY). Compute €/kg and, where a supplementary unit exists, €/unit. Apply rough conversions (e.g. kg per Wp) to get a €/Wp proxy. Validate against pvXchange and sun.store levels.
- Comext lag is roughly 6–8 weeks after month-end. This is an inference based on usual Eurostat release practice, not verified here. It is a confirmation signal, not a real-time one.
- The NL (Rotterdam) reporter values are skewed because of the "Rotterdam effect" (goods declared in NL and then moved on). EU27 extra-EU totals are the safest basis.

### Gaps
- The supplementary units for CN 85414300 and 85076000 (number of items vs none) and the exact Comext release calendar were not verified.
- China GACC online query (stats.customs.gov.cn) access and its HS 8-digit quantity fields were not verified.
- The CN code split for PV inverters in 2026 (85044084 etc.) was not verified.

---

## 5. Other free public datasets (Fraunhofer ISE, IEA PVPS, IRENA, JRC, national installer surveys)

### Takeaway
The free public sources are annual or semi-annual and good for long-term context and sanity checks, not for monitoring:
- **Fraunhofer ISE Photovoltaics Report**: updated irregularly, about 1–2 times a year. The latest is 14 Jul 2026, which gives German rooftop €/kWp.
- **IRENA Renewable Power Generation Costs**: annual, by country, with installed cost and BESS $/kWh.
- **JRC storage overview**.
- **IEA PVPS National Survey Reports and Trends**: annual, include module/system prices per country.
- **Germany**: BNetzA tender results and EUPD headlines.

### Cited Findings
- Fraunhofer ISE Photovoltaics Report page (version dated 14 Jul 2026; covers cost structures and price trends): https://www.ise.fraunhofer.de/en/publications/studies/photovoltaics-report. The May 2025 PDF gives German rooftop 3–10 kWp at €900–1,300/kWp (2024 data). — [Fraunhofer ISE](https://www.ise.fraunhofer.de/en/publications/studies/photovoltaics-report), [PDF](https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Photovoltaics-Report.pdf)
- Secondary sources attribute about €1,015/kWp average turnkey rooftop (Mar 2026; €970–1,200/kWp for 10–100 kWp) to Fraunhofer ISE. This was not verified in the primary report. — [reduco.ai](https://reduco.ai/blog/solar/solaranlage-kosten-nach-groesse-kwp), [homeandsmart.de](https://www.homeandsmart.de/preisentwicklung-photovoltaik-2026-2037-990892)
- Fraunhofer ISE Energy-Charts launched a price simulator (2026). It covers electricity prices, not hardware. — [Fraunhofer ISE press](https://www.ise.fraunhofer.de/en/press-media/press-releases/2026/energy-charts-data-platform-launches-price-simulator.html)
- IRENA RPGC 2025 (published mid-2026): utility PV installed cost $667/kW (5th–95th percentile $383–1,211/kW). 4h BESS about $140/kWh. — [SolarQuarter 2 Jul 2026](https://solarquarter.com/2026/07/02/renewables-remain-worlds-cheapest-new-power-source-as-global-capacity-tops-690-gw-in-2025-irena-report/), [GreentechLead](https://greentechlead.com/?p=54058)
- JRC, "Overview of Energy Storage Deployment in Europe" (JRC141463, free PDF). — [JRC](https://publications.jrc.ec.europa.eu/repository/bitstream/JRC141463/JRC141463_01.pdf)
- Battery Charts (RWTH ISEA): free German storage deployment data. 6.57 GWh was added in 2025, 24 GWh in total. Home storage 4.19 GWh (−6.4%), average 10.3 kWh/system. It also has the ISEA Battery Revenue Index. — [ESS News 9 Jan 2026](https://www.ess-news.com/2026/01/09/germany-adds-6-57-gwh-of-battery-storage-capacity-in-2025-total-capacity-hits-24-gwh/), [battery-charts.de](https://battery-charts.de/)
- Unsourced or low-quality consumer price indices exist (e.g. SolarPlan "storage price index", €400–600/kWh for German home storage, no source or date). These should not be used as benchmarks. — [solarplan.app](https://solarplan.app/storage-price-index)

### Inferences
- Use Fraunhofer ISE, IRENA and IEA PVPS as annual anchors, with long history back to the 2010s, for back-filling and validation. Do not use them as monitoring feeds. They are PDFs, so parse them once per release.

### Gaps
- IEA PVPS National Survey Reports (iea-pvps.org), including module and inverter prices by country, were not searched successfully. The 2025/2026 editions' content was not confirmed.
- Netherlands (e.g. Solar Magazine NL / Polder PV price surveys) and Poland (e.g. gramwzielone, IEO installer price surveys) national installer price surveys were not researched within budget. gramwzielone.pl does republish pvXchange monthly in Polish ([example](https://www.gramwzielone.pl/?p=20373571)).

---

## 6. Legal considerations (copyright / ToS when republishing indices)

### Takeaway
Raw price facts are generally not copyrightable, but the expression (charts, tables, text) is. In the EU, a systematically collected database can also be protected by the sui generis database right (Directive 96/9/EC). Paid feeds (OPIS, BNEF, InfoLink, EUPD, Modo) are licensed under subscription terms that typically forbid redistribution. A monitoring system should store data for internal analytics with attribution, link back, and avoid bulk republication of free indices without permission. Eurostat data is free to reuse with attribution.

### Cited Findings
- pvXchange publishes its index as a graphic only, which limits exact citation of figures. Numeric values in third-party articles come from pvXchange's own monthly commentary. — [Logic Energy](https://en.logicenergy.de/neuigkeiten/pv-preisentwicklung-2026)
- OPIS headline numbers reach the public through licensed pv magazine columns written by OPIS staff, while the full weekly report is a subscription product. — [pv magazine Jul 2026](https://www.pv-magazine.com/2026/07/03/china-solar-module-forward-prices-ease-amid-softer-europe-demand/), [OPIS sample](https://www.opis.com/wp-content/uploads/2024/07/OPIS-Solar-Weekly-Report.pdf)
- EUPD sells residential storage reports and trackers on a subscription basis. — [EUPD proposal PDF](https://www.eupd-research.com/wp-content/uploads/EuPD_Research_Proposal_Subscription_Residential_Storage_Reports_Juli_2023.pdf)
- EU database right: Directive 96/9/EC on the legal protection of databases (sui generis right against extraction or re-utilisation of a substantial part). — [EUR-Lex Directive 96/9/EC](https://eur-lex.europa.eu/eli/dir/1996/9/oj)

### Inferences
- Practical policy:
  - (1) Store free-index values (pvXchange, sun.store) with source, URL and date. Show them internally or to limited users with attribution and a link. Do not mirror full tables or charts publicly. Ask pvXchange and sun.store for a data partnership or licence if republishing is planned. sun.store, as a marketplace, has a commercial interest in being cited and may agree.
  - (2) Never redistribute paid-feed numbers (OPIS, BNEF, InfoLink tables, EUPD, Modo) beyond what the publisher made public in press releases.
  - (3) Eurostat and official tender results (Terna, PSE, BNetzA) are safe to reuse with attribution.
  - (4) Respect robots.txt and ToS for scraping.
- This is not legal advice. Have a lawyer check it for the target jurisdiction (Ukraine/EU).

### Gaps
- The specific ToS texts of pvxchange.com, sun.store, pv magazine and InfoLink were not retrieved (fetch was blocked). The Eurostat reuse policy page (Commission Decision 2011/833/EU, attribution required) was not fetched in this session.
