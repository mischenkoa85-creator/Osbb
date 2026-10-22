# European B2B marketplaces for PV and ESS equipment as price/availability data sources (state as of Oct 2026)

> **Method note (read first):** In this research session, direct HTTP access to the platforms (sun.store, pvxchange.com, secondsol.com, solartraders.com, enfsolar.com, memodo, segen, krannich, solarflexes, photovoltaik4all) and to pv-magazine/pveurope was **blocked by the session's egress proxy** (403 on CONNECT; WebFetch DNS failure). Therefore **robots.txt files and full ToS texts could NOT be read directly**. All findings below come from web-search result snippets and summaries of the platforms' own pages, press releases, and trade press. Treat field lists as "observed in snippets/third-party scraper schemas", to be verified with a live crawl before building collectors.

## sun.store (Warsaw, Poland): listing fields, price visibility, pv.index / Battery Index / PMI, coverage

### Takeaway
sun.store is the richest public source of *aggregated* European wholesale prices: a monthly, transaction-based **pv.index** (modules €/Wp by technology, inverters €/kW by type/size), a monthly **Battery Index** (€/kWh, residential and commercial size classes), and a buyer-survey **PV PMI**. All three are published free on its blog and syndicated by PV Europe, PV Tech, IndexBox and others. Listing-level prices are **behind registration** (needs an EU VAT ID), so for a monitoring system the practical routes are (a) parse the monthly index posts (public HTML) and (b) a data partnership. Logged-in scraping is likely a ToS problem; the ToS text could not be checked.

### Cited Findings
**Company and coverage**
- Warsaw-based B2B digital marketplace for solar components and storage; raised a €6M seed round (Sept 2025) — [Tech.eu](https://tech.eu/2025/09/24/sunstore-closes-eur6m-round-to-grow-europes-b2b-solar-marketplace/); [sun.store blog](https://sun.store/blog/sun-store-secures-e6-million-seed-round-to-transform-solar-and-storage-procurement-across-europe/)
- Self-reported (late 2025): ~1.4 GW of PV components traded, 35,000+ registered users in 25+ countries, 500+ active sellers offering >€1.5bn of components, 200+ brands, 1,000+ European warehouses, 1,000+ transactions/month, average order >€8,000, 90% of transactions cross-border within the EU — [sun.store blog (seed round)](https://sun.store/blog/sun-store-secures-e6-million-seed-round-to-transform-solar-and-storage-procurement-across-europe/); [Vestbee](https://www.vestbee.com/insights/articles/sun-store-raises-6-m); [Silicon Canals](https://siliconcanals.com/sun-store-raises-6m/)
- Conflicting earlier figures: a mid-2025 profile cited 28,000+ users, >1 GW traded, €100M GMV, 40+ countries, "8.9 GW+ available components"; Trustpilot description and older blog posts say ">3 GW of solar products from 100+ brands". These are different dates and counting bases — [PV Europe](https://www.pveurope.eu/specialized-trade/e-commerce-sunstore-dynamic-growth); [Trustpilot](https://www.trustpilot.com/review/sun.store)
- Launched as an online marketplace in October 2023 (press) — [Renewable Energy Magazine](https://www.renewableenergymagazine.com/pv_solar/sun-store-online-marketplace-launched-in-october-20231107)
- The catalogue aggregates offers from "hundreds of European sellers". Public catalog snippets show "From €0.094/Wp" on a GCL 590 W module, so a teaser "from" price per Wp is visible on catalog pages — [sun.store catalog](https://sun.store/en/catalog); [sun.store home](https://sun.store/en)
- Categories: modules, inverters, batteries/energy storage, including pre-configured battery sets ranked by €/kWh in blog content — [sun.store blog: cheapest battery sets by €/kWh](https://sun.store/blog/the-cheapest-battery-storage-sets-on-sun-store-6-pre-configured-systems-ranked-by-e-kwh/); [sun.store blog: niche ESS brands 2026](https://sun.store/blog/beyond-the-big-names-5-niche-energy-storage-brands-on-sun-store-worth-considering-in-2026/)

**Price visibility and access**
- Help/FAQ says the product price is shown only after registration. The buyer must create an account with a VAT number. Registration is free. An active EU VAT ID is required to buy or sell, and non-EU users must contact the team — [sun.store blog: Registration & Onboarding](https://sun.store/blog/registration-onboarding/); [Getting Started](https://sun.store/blog/getting-started-with-sun-store/)
- Sellers pass verification and a background check. Payments go via Stripe (secured payments need the seller to have a Stripe account), escrow is mentioned, and PayPal buyer protection is referenced — [Payments and Security](https://sun.store/blog/payments-and-security/); [Terms and Conditions PDF](https://storage.sun.store/files/040123_sun.store_termsandconditions.pdf)
- 2025 blog post "New features on sun.store: build trust, gain transparency, trade smarter" (feature updates; content not retrieved) — [sun.store blog p.2](https://sun.store/blog/page/2)

**pv.index (modules and inverters)**
- Monthly. Compiled from **transactions settled on the sun.store marketplace** in the month and **weighted by the power of the components** in those transactions — [sun.store PV Index Aug 2026](https://sun.store/blog/pv-index-august-2026/); [pv magazine press release](https://www.pv-magazine.com/press-releases/sun-store-releases-may-pv-index/)
- URL pattern of the archive: `sun.store/blog/pv-index-<month>-<year>/`, e.g. [June 2024](https://sun.store/blog/pv-index-june-2024/), [Sept 2024](https://sun.store/blog/pv-index-september-2024/), [Nov 2024](https://sun.store/blog/pv-index-november-2024/), [Oct 2025](https://sun.store/blog/pv-index-october-2025/), [June 2026](https://sun.store/blog/pv-index-june-2026/), [Aug 2026](https://sun.store/blog/pv-index-august-2026/). The archive runs from at least mid-2024, so backfilling a history is feasible.
- Module segments (2026): TOPCon bifacial, TOPCon monofacial, Full Black, Back Contact. **September 2026:** TOPCon bifacial €0.114/Wp (−1.3% m/m), TOPCon monofacial €0.120/Wp (−2.3%), Full Black €0.129/Wp (−1.1%, now the priciest), Back Contact €0.128/Wp (−3.6% per IndexBox, "−4%" per PV Europe) — [PV Europe Sept 2026](https://www.pveurope.eu/solar-modules/september-pv-index-module-prices-ease-demand-edges); [IndexBox](https://www.indexbox.io/blog/european-solar-module-prices-fall-across-all-technologies-in-september-2026/); [now.solar mirror](https://now.solar/2026/10/12/september-pv-index-module-prices-ease-as-demand-edges-up-pv-europe/)
- Inverter segments in €/kW. **September 2026:** Hybrid 1–20 kW €94.66/kW (+5.8%), Hybrid >20 kW €59.93/kW (−6.9%), String/on-grid >20 kW €22.03/kW (−10.5%). The string drop is attributed to a change in the mix of models traded. The string <20 kW value was not found in snippets — [PV Europe Sept 2026](https://www.pveurope.eu/solar-modules/september-pv-index-module-prices-ease-demand-edges)
- March 2026: most module technologies rose 4–6% m/m and back contact rose 10%. A sun.store VP said prices may stay ~20% above end-2025 levels short-term — [PV Tech](https://www.pv-tech.org/european-solar-pv-module-price-increase-in-march-2026-may-prove-temporary-says-sun-store/)
- July 2026: "premium modules pull further ahead as demand softens"; PV Tech: "premium prices keep rising, bifacial TOPCon cools off" — [PV Europe July 2026](https://www.pveurope.eu/solar-modules/july-2026-pv-index-premium-modules-pull-further-ahead-demand-softens); [PV Tech](https://www.pv-tech.org/european-premium-pv-module-prices-keep-rising-bifacial-topcon-cools-off/)
- Also "Top Brand Trends" (brand-level trend report) and a "new cyclical report" announced via pv magazine press releases — [fineeng.eu](https://fineeng.eu/sun-store-sets-the-pace-introducing-top-brand-trends/); [pv magazine press release](https://www.pv-magazine.com/press-releases/sun-store-launches-new-cyclical-report/)

**PV PMI (sentiment)**
- Buyer survey, not transactions. PMI = P1×1 + P2×0.5 + P3×0 (P1 = share expecting improvement, P2 = no change, P3 = decline); >50 means a positive outlook. Sample reported as 500+ buyers (other reports say 300+) — [sun.store PV Index Aug 2026](https://sun.store/blog/pv-index-august-2026/)
- PMI: 66 (Oct 2025), 65 (Aug 2026), 67 (Sept 2026). The historical average is cited as 68 — [sun.store Oct 2025](https://sun.store/blog/pv-index-october-2025/); [now.solar](https://now.solar/2026/10/12/september-pv-index-module-prices-ease-as-demand-edges-up-pv-europe/)

**Battery Index (ESS €/kWh)**
- Monthly blog series, e.g. [Battery Index Jan 2026](https://sun.store/blog/battery-index-january-2026/), [May 2026](https://sun.store/blog/battery-index-may-2026/), with an Aug 2026 edition noting both residential and commercial €/kWh eased — [sun.store blog](https://sun.store/blog/)
- Residential (≤20 kWh) segments: HV premium brands, HV performance brands, LV brands. **June 2026:** HV premium €280.8/kWh (+3%), HV performance €150.5/kWh (−6%), LV €108.6/kWh (−1%). A July 2026 figure of €316.0/kWh (−3.1%) for HV premium is internally inconsistent with June (likely a data or dating error) — [PV Europe: July Battery Index](https://www.pveurope.eu/solar-storage/july-battery-index-residential-and-commercial-diverge); [PV Europe: Battery Index](https://www.pveurope.eu/solar-storage/battery-index-commercial-demand-picks-prices-ease)
- Commercial segments: 20–30 kWh and 60–120 kWh. **Jan 2026:** €236.62/kWh (−1%) and €222.45/kWh (0%). **July 2026:** 60–120 kWh €193.2/kWh (−1%) — [Battery Index Jan 2026](https://sun.store/blog/battery-index-january-2026/); [PV Europe](https://www.pveurope.eu/solar-storage/july-battery-index-residential-and-commercial-diverge)
- Single-unit list price ranges (June 2026 guide): tier-one brands (Huawei, BYD, SolarEdge, Sungrow, Fronius, SMA) €290–420/kWh; value/challenger brands (ZBPOWER, Felicity, HinaESS, SRNE, FoxESS) €80–160/kWh for comparable LFP — [sun.store blog](https://sun.store/blog/)

### Inferences
- **Collection method:** the monthly pv.index and Battery Index pages are public blog HTML with stable URL slugs. Parse them monthly into time series (technology/size class → €/Wp, €/kW, €/kWh, % m/m, PMI). This is low-volume and low-risk. Listing-level data (seller, warehouse country, MOQ, stock, delivery) needs a logged-in VAT-verified account, so use a partnership or data licensing rather than logged-in scraping.
- The index is transaction-weighted, so its values differ from asking-price aggregates (SecondSol, ENF). Mix shifts can move a segment without any single product changing price, as sun.store itself notes for string inverters. Store segment definitions with every data point.
- sun.store has no visible public API. No Apify actor turned up (unlike SecondSol and SolarTraders), which is consistent with prices being login-gated.

### Gaps
- robots.txt and the ToS anti-scraping clauses could not be read (host blocked). The ToS PDF URL is known (storage.sun.store/files/040123_sun.store_termsandconditions.pdf), so check it manually.
- The exact public listing fields (Incoterms, MOQ, warehouse country, delivery time, condition) could not be confirmed from snippets.
- The September 2026 Battery Index figures and the string/on-grid <20 kW inverter value were not found.
- No information on an official API or data-licensing product.

## pvXchange (Germany): monthly module price index, publication channels, platform listing visibility, battery data

### Takeaway
pvXchange (since 2004, >10,000 registered business customers) publishes a free monthly **module price index** (EUR/Wp, average *offer* prices on the European spot market, customs-cleared) for four classes: **High Efficiency (≥23%), Full Black, Mainstream, Low Cost**. A market commentary by Martin Schachinger is syndicated monthly in pv magazine, photovoltaik, Solarserver and EUWID. Platform listings show **"Price/Availability visible after login"**, and pvXchange publishes **no battery price index**.

### Cited Findings
- Price index page: monthly index "on the development of wholesale prices of solar modules", differentiated by main technology. The page shows a 13-month chart (e.g. Sept 2025–Sept 2026), with prices = **average offer prices in retail and on the European spot market (customs cleared)** — [pvXchange Price Index](https://www.pvxchange.com/Price-Index)
- Classes: High-efficiency, Full black, Mainstream, Low cost. The high-efficiency threshold was raised from 22.5% to 23%, and Full Black was reintroduced as a 4th category in 2025. "Low cost" = stock remnants, factory seconds, insolvency goods, used or low-output modules — [pvXchange Price Index](https://www.pvxchange.com/Price-Index); [Rinnovabili](https://www.rinnovabili.net/business/energy/photovoltaic-module-prices-2025-updated-data/)
- Monthly commentary archive: [pvXchange Market Analysis](https://www.pvxchange.com/Market-Analysis_1); individual pages e.g. [Jan 2025](https://www.pvxchange.com/Market-Analysis-January-2025-PV-module-prices-at-crossroads), [Mar 2025](https://www.pvxchange.com/Market-Analysis-March-2025-Solar-module-prices-continue-to-rise-moderately). Schachinger's commentary appears monthly in pv magazine, photovoltaik, Solarserver and EUWID Energie — [pvXchange Market Analysis](https://www.pvxchange.com/Market-Analysis_1)
- pv magazine column examples: "Rise in solar module prices comes to a halt" (16 Jul 2026) — [pv magazine](https://www.pv-magazine.com/2026/07/16/rise-in-solar-module-prices-comes-to-a-halt/); "Solar module downward price trend has been reversed" (Feb 2025) — [pv magazine](https://www.pv-magazine.com/2025/02/24/solar-module-downward-price-trend-has-been-reversed/); "Solar module prices on a clear downward trend" (Jul 2025) — [pv magazine USA](https://pv-magazine-usa.com/2025/07/25/solar-module-prices-on-a-clear-downward-trend/)
- Values 2026 (EUR/Wp): Feb 2026 — HE 0.130, Mainstream 0.115, Low cost 0.060 — [Rinnovabili](https://www.rinnovabili.net/business/energy/photovoltaic-module-prices-2025-updated-data/). May 2026 — HE 0.150 (~+30% vs Jan 0.115), Mainstream 0.130, Low cost 0.070, with the rise attributed to China ending its VAT export rebate from April 2026 (secondary source) — [ema-energiewelt](https://ema-energiewelt.de/wissen/solarmodule-preise-anstieg-2026-trendwende). July 2026 — HE €0.145/Wp (−3.3% m/m; +26.1% YTD), Mainstream €0.135/Wp (+3.8% m/m; +28.6% YTD), Low cost unchanged — [TaiyangNews](https://taiyangnews.info/business/solar-module-prices-stabilize-as-back-contact-demand-grows)
- Cross-check: the Jan 2026 HE baseline of 0.115 (ema-energiewelt) matches TaiyangNews' +26.1% to 0.145 (0.145/1.261 ≈ 0.115). Feb 0.130 (Rinnovabili) vs Jan 0.115 implies a +13% jump in one month. That is plausible given the export-rebate news, but I did not verify it against pvxchange.com.
- The Market Analysis page shows an "August 2026" commentary dated 20.07.2026, so pvXchange labels commentary by the *following* month. Account for this when time-stamping — [pvXchange Market Analysis](https://www.pvxchange.com/Market-Analysis_1)
- Company: one of the largest European trading platforms for modules, inverters, ESS, and other components; active since 2004; >10,000 registered business clients — [pvXchange About](https://www.pvxchange.com/About-Us); [What We Do](https://www.pvxchange.com/What-We-Do); [LinkedIn](https://www.linkedin.com/company/pvxchange)
- Battery category exists (e.g. BYD Battery-Box Premium HVB/LVS) but each item shows "**Price/Availability visible after login**" — [pvXchange Solar Batteries](https://www.pvxchange.com/Solar-Batteries)
- TaiyangNews regularly rewrites each monthly index, a secondary source useful for cross-checking — [TaiyangNews 1](https://taiyangnews.info/business/solar-module-prices-pvxchange); [2](https://taiyangnews.info/business/germany-impact-on-solar-technology-prices-shrinking); [3](https://taiyangnews.info/business/solar-prices-march-2025-pvxchange)

### Inferences
- **Collection method:** monthly parse of pvxchange.com/Price-Index (chart and table HTML; may be an image or JS chart, to be verified) plus the commentary page, or the pv magazine article. 4 data points per month. Index *values* are facts, but reproducing charts or texts may hit copyright, so store the numbers with attribution.
- pvXchange (offer prices) and sun.store (transaction prices) are complementary. A ~€0.02–0.03/Wp gap between the pvXchange HE price and sun.store TOPCon is normal given the different methods and classes.
- Listing-level data is login-gated, so it can only come through a partnership.

### Gaps
- Whether the Price-Index page exposes numbers in HTML or only as an image, and whether there is a CSV or download, is unverified.
- robots.txt and the ToS were not read (host blocked).
- No inverter or battery index from pvXchange was found. The Aug–Oct 2026 index values were not found.

## SecondSol (Germany): new, used and B-stock listings, fields, price visibility, categories, statistics

### Takeaway
SecondSol is the best **publicly visible listing-level** source: prices per piece and per Wp (excl. VAT) are shown on open listing pages for new, used and B-goods modules, inverters and storage. A commercial Apify scraper exposes ~16 categories with normalized €/Wp, condition, quantity, city/ZIP and seller. SecondSol publishes **no price index or statistics**.

### Cited Findings
- Self-description: Europe's leading marketplace for new and used PV components for 15+ years, a B2B marketplace "for trade, dealers & project business". Trades modules, inverters, storage — [SecondSol home](https://www.secondsol.com/en/index.htm); [SecondSol blog](https://blog.secondsol.com/en/pv-systems/general/selling-used-photovoltaic-components-the-leading-marketplace-for-solar-modules-inverters-and-spare-parts/)
- Public homepage snippets show prices without login, e.g. JA Solar module "80,00 EUR/pcs. 0,216 EUR/Wp", KACO blueplanet 5.0 "290,00 EUR/pcs. 58,000 EUR/kWp", BYD Battery-Box Premium HVS 7.7 "3.590,00 EUR/pcs." — [SecondSol home](https://www.secondsol.com/en/index.htm)
- Listing page URL pattern `secondsol.com/en/anzeige/<id>/<category path>/<brand>/<model>`. Titles contain brand, model, Wp and cell type (Mono/Poly). B-goods examples: Yingli YL170P B-Ware "178,50 EUR/pcs. 1,050 EUR/Wp excl. VAT"; CentroSolar B-Ware S 210P54 with tiered prices (420 EUR/pcs for a full packaging unit vs 435 EUR single piece). B-goods are defined as modules with unintended optical defects — [listing 153](https://www.secondsol.com/en/anzeige/153/modules/crystalline/poly/yingli/yl-170-p-23b-b-ware); [listing 4431](https://www.secondsol.com/en/anzeige/4431//centrosolar/b-ware-s-210p54-excellent); [used Canadian Solar lot](https://www.secondsol.com/en/anzeige/17443/photovoltaic-modules/polycrystalline-modules/canadian-solar/2500-pcs-used-and-defective-candian-solar-235wp-poly-modules-for-sale-cheap-price)
- Business model: registration free, small commission only after a sale, and payment settled between buyer and seller outside the platform — [SecondSol selling](https://www.secondsol.com/en/servicepages/selling.htm); [Getting started](https://www.secondsol.com/en/servicepages/getting-started.htm); [Buying](https://www.secondsol.com/en/buying/)
- 2024 interview: the CEO said SecondSol deals only in **new** batteries (not used). The policy may have changed since — [pv magazine 2024](https://www.pv-magazine.com/2024/04/23/low-solar-module-prices-affecting-secondhand-market/)
- Apify actor "SecondSol Scraper: Solar Panel, Inverter & Battery Prices" (rastriq): 16 catalogue categories (panels, inverters, storage, kits, heat pumps, e-mobility, solar thermal, repowering, auctions, accessories…). Fields: price, tax %, normalized €/Wp (`wpPriceEur`), manufacturer, condition, quantity (`amountAvailable`), city and ZIP, description, images, technical `specs`, `sellerId`, `sellerProfileUrl`, `vendorIsPrivate`, `priceOnRequest`, `scrapedAt`. Sample: 640 W module, 67 EUR, wpPriceEur 0.104687, condition "new", 6,250 pcs, Macierzysz (PL) 05-850. Pricing from $1.50 / 1,000 results — [Apify SecondSol scraper](https://apify.com/rastriq/secondsol-scraper); [API/OpenAPI](https://apify.com/rastriq/secondsol-scraper/api/openapi)
- No SecondSol price statistics or B-goods index was found. The closest is the US-focused EnergyBin/Buckstop secondary-market index (used modules $0.058/W in Q4 2025, −30% vs Jan 2024), which is not European — [EnergyBin](https://resources.energybin.com/solar-resources/2025-pv-module-price-index-secondary-solar-market); context: [pv magazine USA, Mar 2026](https://pv-magazine-usa.com/2026/03/19/cheap-new-modules-are-stalling-the-used-solar-market/)

### Inferences
- **Collection method:** HTML scraping of public listing pages (server-rendered, judging by the indexed listing pages and the existence of a cheap Apify actor), or buying the Apify actor output. This gives listing-level asking prices with condition (new/used/B-goods), private vs commercial seller, location (city/ZIP, which gives the country) and quantity. It is the only source here that cleanly separates new, used and B-stock.
- Asking prices include stale or old listings (2013-era Poly modules are still indexed), so filter by listing date, technology and power class, and compute medians rather than means.
- ESS coverage is mostly per-unit (EUR/pcs). €/kWh must be computed from capacity in `specs`.

### Gaps
- robots.txt and ToS/AGB anti-scraping terms were not readable (host blocked; a search found nothing). Verify before scraping.
- Total listing and seller counts and listing freshness were not found.
- Whether Incoterms, delivery time or warehouse country are explicit fields is unconfirmed (only city/ZIP is).

## SolarTraders (Frankfurt, Germany, not NL/PL): what it is, fields, coverage

### Takeaway
SolarTraders.com is a **Frankfurt-based** B2B marketplace (founded ~2010/2011) where installers compare offers for modules, inverters, storage and accessories from 100+ distributors. Offers are updated daily with **volume price tiers, MOQ, stock and warehouse locations across Europe**. Prices are net (excl. VAT and shipping). A third-party Apify scraper exists. Whether prices are visible without login is unconfirmed.

### Cited Findings
- B2B platform comparing modules, inverters and storage from 100+ distributors. Categories: modules, inverters, storage, accessories. Brands include Jinko, Trina, Aiko, Sungrow, GoodWe, Deye (hybrid inverter with volume tiers) — [SolarTraders](https://www.solartraders.com/); [modules](https://www.solartraders.com/en/products/modules); [inverters](https://www.solartraders.com/en/products/inverters); [efficiency ≥21% filter](https://www.solartraders.com/en/products/modules/efficiency-21); [GoodWe](https://www.solartraders.com/en/producers/goodwe)
- Claims to be "Europe's No.1 marketplace for solar products" with 20,000+ registered solar companies. Founding year is 2011 per Crunchbase and 2010 per LinkedIn. Escrow service is listed — [LinkedIn](https://www.linkedin.com/company/solartraders-com/); [Crunchbase](https://www.crunchbase.com/organization/solartraders)
- Help center: prices are net plus VAT where applicable and shipping; prices are usually fixed and adjusted regularly by sellers; discounts possible for larger orders; goods usually ship ex-warehouse in 1–3 working days (DE 1–3 days, intra-EU 2–5 days); serves manufacturers, distributors and installers, not private end customers — [What costs can I expect](https://help.solartraders.com/en/articles/5499583-what-costs-can-i-expect); [Shipping and Delivery](https://help.solartraders.com/en/articles/5499607-shipping-and-delivery); [About](https://help.solartraders.com/en/articles/5576837-about-solartraders); [Payment options](https://help.solartraders.com/en/articles/5499585-what-payment-options-are-available-on-solartraders)
- Apify actor "SolarTraders Scraper" (crawloop): live EUR offers with volume tiers, MOQ, stock levels, warehouse locations, `minUnitPrice` and price tiers; no €/Wp field (compute it from wattage). Pricing from $1.00 / 1,000 offers — [Apify SolarTraders scraper](https://apify.com/crawloop/solartraders-scraper)
- Trustpilot TrustScore is 4.3 vs a self-reported 4.93/5 — [Trustpilot](https://www.trustpilot.com/review/solartraders.com)

### Inferences
- In data terms SolarTraders is a **price comparison aggregator of distributor offers**, which makes it useful for "best available price by SKU and country" with stock and lead time. An Apify actor exists, so offers are machine-retrievable (public pages or a structured endpoint). Volume tiers make it good for MOQ-aware price curves.
- Field set likely available: brand, model, power, price tiers, MOQ, stock qty, warehouse country, delivery time, seller (distributor). Technology (TOPCon/HJT/BC) probably has to be derived from model specs.

### Gaps
- Login gating of prices was not confirmed. robots.txt and ToS were not read. No offer or listing counts were found. The NL/PL connection the brief suggested was not supported by any source (the company is Frankfurt-based).

## Other European platforms and sources (verified only)

### Takeaway
Only a few other sources could be verified. **ENF Solar** shows public "from €/Wp" asking prices on manufacturer product pages (global, not EU-specific). **Large distributors** (Segen, Memodo, Krannich, BayWa r.e.) keep trade prices behind customer portals. **EnergyBin** is US-only. Solarflexes, pvpartners, Photovoltaik4all, PV-Marktplatz, Alibaba EU and EUPD price products could **not** be verified in this session.

### Cited Findings
- **ENF Solar:** product directory pages show "From €0.0904/Wp" (JS Solar), "From €0.0716/Wp" (PolyCrown), TOPCon module €0.0905/Wp, and TOPCon cell €0.0399/Wp in the materials directory. Its historical cell/panel price chart page is stale (Sept 2013 panel average €0.47/Wp) — [ENF panel DB](https://www.enfsolar.com/pv/panel); [ENF panel directory](https://www.enfsolar.com/directory/panel); [ENF materials](https://www.enfsolar.com/pv/materials); [ENF price charts (2013)](https://www.enfsolar.com/cell-panel-prices)
- **Segen (UK):** "live pricing 24/7 on the Segen customer portal" (login), product pages show stock location and future availability, a Clearance section exists, and quotes carry a 30-day price lock — [Segen](https://www.segen.co.uk/?p=3051); [Segen](https://www.segen.co.uk/?p=13420)
- **Memodo, Krannich, BayWa r.e.:** listed as authorized SMA and KOSTAL distributors. Memodo runs a Shopware B2B shop with quick-order (2018 case study). A competitor's (3Buy Solar) table claims Memodo and Krannich require MOQ and show no price before a quote (unverified marketing claim). BayWa r.e. has country webshops (e.g. a PL installer webshop) — [SMA distributors](https://www.sma.de/en/contact/distribution-partners); [KOSTAL sellers](https://www.kostal-solar-electric.com/en/installer-portal/sellers/); [datamints case study](https://www.datamints.com/index.php?id=137&L=1); [buy-solar.online comparison](https://buy-solar.online/wholesale-solar-pv-system-components-for-resellers/)
- **b2b.ecoabm.com:** EU wholesale shop to installers, partly login-gated; one visible example: Jinko 455 W at €299.75 — [ecoabm](https://b2b.ecoabm.com/solar-panels)
- **IndexBox / now.solar** republish the sun.store index monthly (secondary; useful as an alerting feed) — [IndexBox Aug 2026](https://www.indexbox.io/blog/european-solar-module-prices-fall-in-august-2026-as-demand-dips/); [IndexBox Sept 2026](https://www.indexbox.io/blog/european-solar-module-prices-fall-across-all-technologies-in-september-2026/)
- **Apify** also hosts a "Tienda Solar" (Spain) catalog scraper for panels, inverters and batteries, a sign of another scrapeable Iberian webshop — [Apify Tienda Solar](https://apify.com/rastriq/tienda-solar-catalog-scraper)

### Inferences
- Distributor webshops add little for open monitoring (login-gated). They become useful only with installer accounts per country, and that use is governed by the account terms.
- ENF "from" prices are supplier-entered asking prices with unknown freshness and Incoterms (often FOB Asia). Use them only as a weak global floor indicator.

### Gaps
- Solarflexes, pvpartners, Photovoltaik4all, PV-Marktplatz, Wattkraft, Libra (only 2015 news found), Alibaba EU, SolarPower Europe pricing, Sunsave and EUPD Research price products all returned no verifiable results in the searches run. Do not include them without further checks.

## ESS (battery) €/kWh data availability across these platforms

### Takeaway
The only regular, public, marketplace-derived European **€/kWh** series found is **sun.store's monthly Battery Index** (residential HV premium, HV performance and LV; commercial 20–30 kWh and 60–120 kWh). pvXchange gates battery prices behind login and has no battery index. SecondSol shows public per-unit battery prices (EUR/pcs, compute €/kWh yourself). ESS News publishes **revenue** indices (€/MW/yr) and BNEF pack prices, not marketplace €/kWh.

### Cited Findings
- sun.store Battery Index values (June, July and January 2026) and segment definitions — see the sun.store section; [PV Europe July](https://www.pveurope.eu/solar-storage/july-battery-index-residential-and-commercial-diverge); [Battery Index Jan 2026](https://sun.store/blog/battery-index-january-2026/); [Battery Index May 2026](https://sun.store/blog/battery-index-may-2026/)
- pvXchange batteries: "Price/Availability visible after login" — [pvXchange](https://www.pvxchange.com/Solar-Batteries)
- SecondSol: BYD HVS 7.7 at 3,590 EUR/pcs publicly visible (≈€466/kWh nominal if 7.68 kWh, my computation) — [SecondSol](https://www.secondsol.com/en/index.htm)
- ESS News: monthly battery *revenue* rankings (e.g. Aug 2026, France 2h ≈ €294k/MW/yr, Italy 2h ≈ €331k/MW/yr) and the Enervis German BESS revenue index; BNEF 2025 pack price $108/kWh global, with Europe ~48% above China's $94/kWh — [ESS News Sept 2026](https://www.ess-news.com/2026/09/24/battery-revenues-rise-everywhere-in-europe-other-than-baltics-in-august-2026/); [ESS News Enervis](https://www.ess-news.com/2026/05/29/enervis-battery-storage-index-german-bess-revenues-rose-further-in-april-amid-higher-pv-output-and-middle-east-tensions/); [ESS News BNEF](https://www.ess-news.com/2025/12/09/bnef-lithium-ion-battery-pack-prices-fall-to-108-kwh-stationary-storage-becomes-lowest-price-segment/)
- Third-party modelled €/kWh pages exist (SolarPlan "storage price index" €170–400/kWh turnkey by size for UA/ES/DE; IndexBox utility-scale €250–350/kWh installed). These are modelled, not marketplace data — [SolarPlan](https://solarplan.app/storage-price-index); [IndexBox](https://www.indexbox.io/store/europe-battery-market-analysis-forecast-size-trends-and-insights/)

### Inferences
- For C&I and utility ESS cabinets (100 kWh–MWh), no European marketplace exposes a public €/kWh series. sun.store's largest class is 60–120 kWh. Utility BESS prices need other sources (BNEF, consultancies, tenders).
- To build your own ESS €/kWh series, scrape SecondSol (and SolarTraders) storage listings and normalize by usable capacity from specs, separately for HV and LV and by brand tier, mirroring sun.store segments for cross-validation.

### Gaps
- The Aug and Sept 2026 sun.store Battery Index values were not retrieved. The July 2026 HV-premium figure conflicts with June. No verifiable European C&I cabinet price index was found.
