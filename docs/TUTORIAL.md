# BioValue — Tutorial

BioValue is a single-page web app for risk-adjusted NPV (rNPV) valuation of biotech and pharma drug assets. It is built for BD analysts, investors, and operators who need a fast, defensible standalone valuation of a single asset and a structured comparison to deal economics.

This tutorial walks through the seven tabs in order, the modeling framework behind them, and how to read the Deal Analysis output. The worked example throughout is **Sobi / Arthrosi (Pozdeutinurad)** — a Phase III oral URAT1 inhibitor for chronic refractory gout, acquired by Sobi in December 2025 for $950M upfront + $550M milestones.

---

## Quick start

1. Open the **Asset** tab.
2. Pick **Load a prior deal → Sobi / Arthrosi — Pozdeutinurad** from the dropdown at the top of the page. The active-preset banner appears above the tabs with the deal summary.
3. The preset populates every input across all seven tabs with values calibrated to analyst consensus peak sales. The rest of the tutorial explains what those inputs do.

To start from scratch, click **Reset** in the top bar. To detach from the preset (so your edits don't suggest you're modeling the original deal), click the small "detach" link in the banner.

---

## The framework in one paragraph

BioValue computes three values for any asset:

- **Asset rNPV** — the standalone risk-adjusted NPV at the acquirer's cost of capital, with full peak and full launch probability. Represents the asset's full economic value owned 100%.
- **Commercial-adjusted rNPV** — the same engine re-run at a fixed WACC of 14%, peak revenue × 0.60, and commercial PoS × 0.85. A conservative lower bound that captures BD-realistic execution risk, forecast bias, and integration friction.
- **Deal PV** — the present value of the actual deal structure: upfront cash + risk-adjusted milestone PV + (for licensing deals) royalty stream PV.

Deal PV typically sits inside the `[Comm-adj, Asset rNPV]` range. Where it sits communicates risk-sharing intensity: near the lower bound = heavy milestone weighting; near Asset rNPV = upfront-heavy.

---

## Tab 1 — Asset

The identity card for the asset and the differentiation flag catalog.

- **Asset name, indication, mechanism** — labels, no impact on math.
- **Therapeutic area** — controls which row of the MIT Project ALPHA PoS table is used as the baseline. ALPHA snapshot 2025-12-28; biomarker-stratified by TA. TAs outside ALPHA's 15-category taxonomy (Rare Disease, Cell & Gene Therapy, Vaccines) use Wong-Siah-Lo / industry-aligned estimates flagged with an `est.` badge.
- **Modality** — labels and notes only; modality-specific premia are captured via flags (see below), not via TA.
- **Current stage** — `Phase I` / `Phase II` / `Phase III` / `NDA/BLA`. Convention: "entering stage X" — the trial has not yet started and the X → X+1 transition is the next risk.

### Differentiation flags

The flag panel is the model's core differentiator from a generic rNPV calculator. Flags are grouped into Regulatory, Trial design, Mechanism, Administration, and Risk. Each flag is backed by a published effect (BTD, Fast Track, biomarker selection) or an analyst convention (FIC, BIC, oral-vs-injectable premium).

Active flags affect downstream values via two-pass stacking:

1. **Baseline replacement.** Turning on `Biomarker-selected population` swaps the TA's `unselected` PoS row for the `biomarker` row. In oncology this raises PoS; in some hematology indications it actually lowers Ph2→Ph3 PoS (the ALPHA data shows biomarker-stratified hema programs fail more at that transition).
2. **Marginal uplifts.** Other flags compound multiplicatively on the failure rate of the relevant transition. BTD adds a 23% relative reduction in Ph2→Ph3 failure; Fast Track adds 20% to NDA→Approval; etc.

Per-transition cap: 90% (only applied when flag-driven adjustments push the value above 90%; baseline ALPHA values that exceed 90%, like the 91% NDA→Approval rate, pass through unchanged).

### Active effects sub-tab

The right pane shows a live breakdown of every active flag and its effect on PoS, price, life, ramp, and cost. This is the audit trail — every number in the headline rNPV can be traced back through this panel.

---

## Tab 2 — Disease & Market

The patient-funnel and pricing inputs that feed peak revenue.

The cascade is multiplicative:

```
Population × Prevalence × % Chronic × % Diagnosed & Treated × % Addressable
  = treated patient pool
Treated pool × Net price (WAC × (1 − GTN%)) × WW multiplier
  = addressable revenue pool at 100% share (WW net)
```

Each field has a typical-range hint and a sourced default in the indication library (39 entries, US-centric). Use the **Indication** search at the top to autofill the cascade for common conditions — type "MASH" or "RA" or "AFib" and pick from the list. The source citation appears next to the asset name once a library entry is selected.

Field-level guidance:

- **Prevalence vs incidence.** Use prevalence for chronic diseases (gout, RA, IBD, MASH). Use incidence for acute or short-duration disease (most cancers, some infectious disease).
- **% Chronic / refractory.** The share of prevalent patients in the addressable disease state. For chronic refractory gout: 13% of all gout patients.
- **% Diagnosed & treated.** Many diseases (obesity, MASH, mild depression) are massively under-diagnosed. This is often the bottleneck.
- **% Addressable.** The share of treated patients the drug can reach given label, mechanism, and competition. An oral URAT1 in chronic refractory gout might reach ~25% of treated; a best-in-class GLP-1 in obesity might reach ~70%.
- **WAC price.** US list price per patient per year, before any discounts.
- **GTN.** Gross-to-net discount: rebates, 340B, Medicaid, patient assistance. Net price = WAC × (1 − GTN%). Typical ranges: specialty oncology 20–30%, immunology biologics 40–55%, primary care 50–70%, orphan with concentrated payers 10–20%.
- **WW / US multiplier.** Total WW net revenue as a multiple of US net. Industry standard 1.5× for specialty; 1.6–2.0× for orphan; 1.3–1.5× for primary care.

Right pane: the **Cascade & pricing** sub-tab shows the full funnel and the price walk, with flag-driven price premia applied. The **Where peak sits** sub-tab compares your modelled rNPV to published TA peak-rNPV ranges. **TA rNPV ranges** shows all 19 TAs side-by-side.

---

## Tab 3 — Development

Phase-by-phase durations, costs, and manual PoS overrides.

- **Phase durations** (years) default to industry medians from Sertkaya et al. (JAMA Netw Open 2024). Edit individual phases for asset-specific timelines.
- **Phase costs** (out-of-pocket $M) default to Chandra & Mazumdar (JOIM 2024). Costs are probability-weighted by cumulative likelihood of reaching each stage and discounted at WACC.
- **PoS overrides.** Manual override of any individual transition. Use when you have specific intelligence on the asset (a positive Phase 1 readout already in hand, a regulatory interaction that materially changes Ph3 odds, etc.) that the flag catalog doesn't capture.

The breakdown sub-tab on the right shows the effective PoS for each transition, the trail of how it was computed (baseline → flag adjustments → cap or override), and a side-by-side of TA unselected vs biomarker PoS rates.

---

## Tab 4 — Commercial

The post-launch revenue shape.

- **Competition** — picks the competitive tier (Underserved / Lightly contested / Contested / Saturated). Each tier has a baseline peak market share displayed inline in the dropdown options. Changing the tier snaps the slider to the new baseline.
- **Peak market share** — your asset's share of treated patients at peak. Override the competition baseline as needed; flag-driven multiplicative share boosts (e.g. BIC adds +25% relative) are applied downstream.
- **Ramp to peak** — years from launch to peak revenue. The model uses a linear ramp: year `y` revenue fraction is `(y+1) / (ramp+1)` until peak, then 1.0. Specialty / orphan: 3 years. Primary care: 6–8 years.
- **Commercial life** — total years of branded revenue from launch. Default 12. The effective life incorporates flag adjustments (orphan adds +2y; IRA exposure subtracts −1y).
- **Patent cliff (LoE erosion)** — single percentage applied to revenue in the final two years to proxy the post-LoE decline. At 45%, the last two years run at 55% of peak. Typical: small molecule 45–60%; biologic 25–35%; orphan/specialty 15–25%; cell/gene therapy 0%.

Right pane shows ramp archetypes overlaid on your curve and the LoE benchmark table.

---

## Tab 5 — Capital

Cost of capital and royalty.

- **WACC** — the acquirer's WACC, used to discount the asset's expected cash flows. Large pharma 8–10%, mid-cap specialty 10–12%, small-cap or focused biotech 12–14%. The BD-realistic 14% hurdle is applied separately on the Deal Analysis tab as part of the Commercial-adjusted lower bound.
- **Royalty** — for licensing deals only, this is the rate the acquirer pays the licensor (acquiree / developer) on net sales. Set to **0% for acquisitions** (acquirer owns 100% of revenue). For licensing deals, enter the agreed rate. Royalty does **not** reduce Asset rNPV — it appears as a separate royalty stream PV component inside Deal PV on the Deal Analysis tab.

Right pane: WACC benchmark bands and a royalty matrix (TA × stage), with your current configuration highlighted.

---

## Tab 6 — Summary

The standalone-asset output dashboard.

- **Headline.** Base Asset rNPV at the current stage, plus cumulative launch probability (LoA), expected years to launch, and PV of remaining R&D cost.
- **rNPV by milestone.** Bear / Base / Bull rNPV at each upcoming stage gate (Phase I through Approval). The current stage is highlighted. Peak multipliers: Bear 0.7×, Base 1.0×, Bull 1.3× of the addressable revenue pool.
- **Sensitivity table.** rNPV at WACC × scenario.
- **rNPV across milestones chart.** Same data, charted.
- **Methodology card.** Engine equations, PoS sources, ALPHA snapshot reference, cap rules.

---

## Tab 7 — Deal Analysis

The deal-vs-asset comparison and the three-value framework.

Sub-tabs:

- **Range** — visual bar showing Comm-adj rNPV on the left, Asset rNPV on the right, and Deal PV pinned somewhere in between (or beyond, if the deal is unusually structured). A summary sentence tells you where the deal sits.
- **Waterfall** — two stacked breakdowns. First, the haircuts from Asset rNPV down to Comm-adj rNPV. Second, the Deal PV waterfall: Upfront → +Reg PV → +Sales PV → +Royalty PV = Deal PV.
- **Calibration data** — the seven validated single-asset deals (Pozdeutinurad, Abelacimab, Restoret, Efimosfermin, Farabursen, ISB 2001, VG-3927) with their Asset rNPV, Comm-adj, Deal PV, and Deal/rNPV ratio. Median Deal PV is 55% of Asset rNPV.

### Reading the three values

For Pozdeutinurad with the preset loaded:

| Value | Engine produces | Interpretation |
|---|---:|---|
| Asset rNPV | $1.39B | Full standalone value at Sobi's WACC (9.5%) with 1.0× peak |
| Commercial-adjusted | $323M | Same engine at 14% WACC, peak × 0.60, commPoS × 0.85 |
| Deal PV | $1.17B | $950M upfront + $169M reg milestone PV + $55M sales milestone PV |
| Deal PV as % of Asset rNPV | 84% | Light risk-sharing, upfront-heavy structure |

Pozdeutinurad's Deal PV sits near the top of the range, reflecting Sobi's confidence (Ph2 success, oral specialty, gout franchise fit) and the lightest milestone weighting in the validation set.

By contrast, ISB 2001's Deal PV sits at 55% of Asset rNPV — heavier milestone tail, Phase II asset, and a licensing structure where royalty stream PV of $329M (at 14% royalty rate) makes up a meaningful share of total deal value.

### Five drivers of the BD lower bound

The Commercial-adjusted parameters are fixed (not user-editable) because they represent a consistent BD-realistic haircut framework, not a scenario. They capture:

1. **Forecast bias** — analyst consensus peaks tend to overstate realized peaks.
2. **Commercial execution risk** — 15% of approved drugs fail commercially despite reaching market.
3. **WACC differential** — the BD function uses a higher hurdle than the corporate WACC.
4. **Information asymmetry** — the acquirer knows less about the asset than the licensor.
5. **Integration costs** — not all of an asset's standalone value transfers into the acquirer's P&L.

---

## FAQ

**What WACC should I use?**
Use the acquirer's corporate WACC for Asset rNPV. Large pharma 8–10%; mid-cap specialty 10–12%; small-cap biotech 12–14%. The Commercial-adjusted lower bound applies a fixed 14% on top of the haircut so you don't need to model BD WACC manually.

**My drug has two indications — how do I model that?**
Run the model twice with separate cascades (one per indication), then sum the Asset rNPVs. Apply a modest correlation discount (10–15%) for shared execution risk.

**How do I handle a licensing deal vs an acquisition?**
For an acquisition, royalty = 0%. The acquirer owns all revenue and Asset rNPV represents the full economic claim.
For a licensing deal, set royalty to the agreed rate. Asset rNPV is unchanged (still represents full value); the royalty stream PV is added separately into Deal PV. Example: AbbVie/IGI ISB 2001 at 14% royalty contributes $329M of royalty PV into the deal.

**What's the difference between rNPV and NPV?**
Standard NPV discounts cash flows by WACC only. rNPV multiplies each cash flow by the probability of reaching that stage before discounting. Early-stage assets are heavily discounted twice — once for time, once for risk. The two methods converge at approval.

**Why does Deal PV sometimes exceed Asset rNPV?**
Common reasons: (1) competitive auction, (2) acquirer-specific peak sales conviction higher than your base, (3) strategic / portfolio synergies (e.g., complementary commercial footprint), (4) platform / pipeline optionality not captured in single-asset rNPV. If Deal PV exceeds Asset rNPV by more than 20–30%, the deal likely includes platform value or strategic premium beyond the lead asset.

**Why does Deal PV sometimes sit below the Commercial-adjusted lower bound?**
This is unusual and worth investigating. Most often it means either (1) the deal is heavily back-loaded into contingent milestones the acquirer doesn't actually expect to pay, or (2) the model's peak forecast is materially too high for the asset.

**The Asset rNPV jumped when I changed competition — why?**
Changing competition resets the peak market share slider to the new baseline. The slider is an override; you can re-adjust after picking a different competition tier.

**My TA shows a small `est.` badge in the PoS panel — why?**
The MIT Project ALPHA database covers 15 indication groups. For TAs outside that taxonomy (Rare Disease, Cell & Gene Therapy, Vaccines, and a few others with low ALPHA sample size) the model falls back to Wong-Siah-Lo or industry-aligned estimates. The `est.` badge is a flag that the PoS for that TA has lower statistical confidence than ALPHA-native TAs.

---

## Data sources

- **PoS** — MIT Project ALPHA, snapshot 2025-12-28 (`data/mit_alpha/Main_20251228.txt`, `Biomarker_20251228.txt`). Industry-sponsored, biomarker-stratified.
- **Phase durations and R&D costs** — Sertkaya et al. (JAMA Netw Open 2024); Chandra & Mazumdar (JOIM 2024).
- **TA peak-rNPV ranges** — `MARKET_REPORT.md` in this repo.
- **Deal comps and validation** — `DEAL_VALIDATION_ANALYSIS.md`. Seven single-asset deals (Pozdeutinurad, Abelacimab, Restoret, Efimosfermin, Farabursen, ISB 2001, VG-3927) calibrated to analyst consensus peak sales within ±5%.
- **Indication library** — 39 conditions, each with a sourced citation (CDC, SEER, NCCN, ADA, AHA, etc.). See the source line below the asset name once a library entry is selected.
- **Royalty matrix** — BioPharma Dealmakers 2024; Evaluate Pharma 2024.

---

## License

MIT. Outputs are model estimates, not investment advice.
