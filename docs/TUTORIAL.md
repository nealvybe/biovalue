# BioValue Tutorial — Step-by-Step Guide

## Overview

This tutorial walks you through building a complete rNPV valuation for any drug asset using the BioValue model. The worked example uses **pozdeutinurad (AR882)**, Arthrosi's oral URAT1 inhibitor acquired by Sobi in January 2025 for $950M upfront.

---

## Tab 1: Navigator (Overview)

The Navigator is your starting point. It contains:
- A color-coded index linking to every other tab
- The color convention legend (blue = inputs, black = formulas, green = cross-sheet, yellow = flag)
- A one-page summary of rNPV results that auto-updates when you change inputs

**You don't edit anything here.** It's a read-only dashboard.

---

## Tab 2: Deal Summary (Worked Example Only)

In the worked example workbook, this tab contains the actual Sobi/Arthrosi deal terms:
- Upfront: $950M
- Milestones: up to $550M (regulatory + commercial)
- Total biobucks: $1.5B
- Deal date: January 2025
- Asset stage at signing: Phase III (fully enrolled, topline data expected mid-2025)

This tab is pre-filled for the example. For a blank model, replace with your target deal or leave empty.

---

## Tab 3: Epi Cascade — Building TAM from Epidemiology

This is the bottom-up patient funnel. Work top-down through the blue cells:

### Step-by-Step Inputs

| Row | Input | Pozdeutinurad Example | Source |
|-----|-------|----------------------|--------|
| Total US Population | 335M | 335,000,000 | US Census 2024 |
| Gout Prevalence Rate | 3.9% | Entered as 0.039 | NHANES / CDC |
| Total Gout Patients | Formula | ~13.1M | Calculated |
| Chronic/Refractory % | 13% | Entered as 0.13 | Literature |
| Chronic Refractory Gout Pool | Formula | ~1.7M | Calculated |
| Diagnosed & Treated % | 12% | Entered as 0.12 | DelveInsight 2025 |
| Target Patient Pool (US) | Formula | ~201K | Calculated |
| Addressable (URAT1 eligible, ex-pegloticase) | 25% | Entered as 0.25 | Market analysis |
| Net US TAM (patients) | Formula | ~50K | Calculated |
| Net Annual Price (USD) | $18,000 | Entered | Lesinurad comp, inflation-adj |
| WW/US Revenue Multiplier | 1.5x | Entered | Standard specialty |
| Peak WW Revenue (Base) | Formula | ~$1.35B | Calculated |

### Chronic vs. Acute Disease Logic

- **Chronic/prevalent diseases** (gout, RA, IBD, NASH): use **prevalence** rate — patients accumulate year over year
- **Acute/curable diseases** (infections, certain cancers): use **incidence** rate — new patients each year
- The model defaults to prevalence. Change the toggle cell if your indication is incident-based.

### Scenarios

The Epi tab feeds three columns:
- **Bear:** Apply a 0.7x haircut to peak patients and/or price
- **Base:** Your central estimate
- **Bull:** Apply a 1.3x multiplier

---

## Tab 4: rNPV Model

This is the core engine. It is divided into four sections.

### Section A — Asset Identity (Blue Inputs)

| Cell | Input | Example |
|------|-------|---------|
| Asset Name | Text | Pozdeutinurad (AR882) |
| Therapeutic Area | Dropdown or text | Rheumatology / Gout |
| Modality | Text | Small molecule oral |
| Current Stage | Dropdown | Phase III |
| Launch Year | Year | 2026 |
| WACC | % | 10.0% |
| Commercial Life (years) | Number | 12 |
| Ramp to Peak (years) | Number | 5 |
| GTN Discount | % | 25% |
| Royalty (if licensed) | % | 0% (acquisition) |

### Section B — Phase PoS and R&D Cost PV

This section pulls PoS benchmarks from the Phase Risk tab and calculates:
- **Stage-specific PoS** (e.g., Ph III→NDA: 60% for Rheumatology)
- **Cumulative LoA** from current stage to approval
- **Expected PV of R&D costs** (probability-weighted, discounted)

For pozdeutinurad at Phase III entry:
- Ph III → NDA PoS: 60%
- NDA → Approval PoS: 91%
- Cumulative remaining LoA: 54.6%
- Remaining R&D cost PV: ~$85M (Ph III already partially spent)

### Section C — Commercial Cash Flow PV

Projects post-launch revenue using the Epi Cascade peak sales, ramp curve, commercial life, GTN, and WACC. Discounts back to today.

### Section D — rNPV at Each Milestone ← Key Output

| Stage | Bear rNPV | Base rNPV | Bull rNPV |
|-------|-----------|-----------|-----------|
| Phase I entry | $45M | $115M | $195M |
| Phase II entry | $90M | $225M | $385M |
| Phase III entry | $250M | $620M | $1,050M |
| NDA/BLA filing | $415M | $1,035M | $1,750M |
| Approval / Launch | $680M | $1,700M | $2,875M |

**Actual deal: $950M upfront** — sits between Base and Bull at Phase III entry.

---

## Tab 5: Phase Risk Reference

Pre-populated PoS benchmarks for 18 therapeutic areas. Color-scaled heatmap (red = low PoS / high risk, green = high PoS / low risk).

| Therapeutic Area | Ph I→II | Ph II→III | Ph III→NDA | NDA→Approval | Overall LoA |
|-----------------|---------|-----------|------------|--------------|-------------|
| Oncology (all) | 59% | 37% | 55% | 90% | 5.3% |
| Oncology (IO) | 62% | 40% | 58% | 91% | 13.1% |
| Hematology | 75% | 58% | 64% | 85% | 23.9% |
| Rare Disease | 68% | 55% | 60% | 76% | 17.0% |
| Immunology/Inflammation | 64% | 47% | 57% | 87% | 15.0% |
| CNS | 55% | 32% | 52% | 87% | 7.9% |
| Cardiovascular | 63% | 49% | 55% | 89% | 15.1% |
| Infectious Disease | 72% | 53% | 68% | 93% | 24.3% |
| Cell & Gene Therapy | 58% | 41% | 48% | 82% | 9.3% |

*Source: BIO/Informa/QLS Advisors 2021 (9,704 transitions, 2011–2020); IQVIA R&D Trends 2024*

### Overriding PoS

You can override any benchmark in Tab 2 (Assumptions) blue cells. Reasons to override:
- **Breakthrough Therapy Designation:** +10–15pp Phase II→III PoS
- **Biomarker-selected population:** +~2x Phase II success rate
- **Precedented mechanism:** +5–10pp across all phases
- **First-in-class, no POC:** −5–10pp Phase II→III

---

## Tab 6: Deal Comps

11 recent comparable transactions (2022–2026) with:
- Upfront payment ($M)
- Total biobucks ($M)
- Upfront as % of total
- Stage at deal
- Indication
- rNPV implied by upfront
- Strategic premium commentary

---

## FAQ

**Q: What WACC should I use?**
Standard range is 8–15%. Use 10% for a Phase III asset in a validated indication. Use 12–15% for early-stage or CNS/CGT. Use 8–9% for de-risked assets near approval.

**Q: My drug has two indications — how do I model that?**
Run the model twice with separate Epi Cascades, then sum the rNPVs. Apply a modest correlation discount (10–15%) to the combined value since the same team is running both programs.

**Q: How do I handle a licensing deal vs. an acquisition?**
For a license: enter the royalty rate (typically 8–15% net sales) in Section A. The model will convert peak sales to royalty stream PV. For an acquisition: set royalty to 0% and use 100% of revenue.

**Q: What's the difference between rNPV and NPV?**
Standard NPV discounts cash flows by WACC only. rNPV multiplies each cash flow by the probability of reaching that stage before discounting. This means early-stage assets are heavily discounted twice — once for time, once for risk. The two methods converge at approval (PoS = ~91%).

**Q: Why does the deal premium exceed my Base rNPV?**
Common reasons: (1) competitive auction drove up price, (2) acquirer has higher peak sales conviction than your base case, (3) strategic/portfolio synergies (e.g., complementary commercial footprint), (4) pipeline optionality not captured in single-asset model.

**Q: The model shows my asset is worth less than the deal price — is the deal wrong?**
Not necessarily. Deals routinely close at 1.3–1.8x Base rNPV for late-stage assets because acquirers price in commercial synergies and their own (higher) sales forecasts. If the gap exceeds 2x Base rNPV, investigate whether the acquirer has non-public information or if your peak sales assumption is too conservative.
