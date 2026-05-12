# BioValue

A risk-adjusted NPV (rNPV) framework for valuing pharmaceutical drug assets from preclinical through commercial launch. Built for biotech and pharma BD analysts, investors, and operators who need a fast, defensible standalone valuation of a single asset and a structured comparison to deal economics.

**Live tool:** [nealvybe.github.io/biovalue](https://nealvybe.github.io/biovalue/)
**Analytical writing:** [biovalue.substack.com](https://biovalue.substack.com)
**Engineering / build notes:** [nfosignal.substack.com](https://nfosignal.substack.com)

## What it is

BioValue is a single-page web app that computes three values for any drug asset:

- **Asset rNPV** — standalone risk-adjusted NPV at the acquirer's WACC, full peak, full launch probability. Represents the asset's full economic value owned 100%.
- **Commercial-adjusted rNPV** — same engine re-run at fixed 14% WACC, peak × 0.60, commercial PoS × 0.85. A conservative BD-realistic lower bound.
- **Deal PV** — upfront + risk-adjusted milestone PV + (for licensing deals) royalty stream PV.

Deal PV typically sits inside the `[Comm-adj, Asset rNPV]` range. Where it sits communicates risk-sharing intensity.

## Features

- **MIT Project ALPHA PoS** — phase-transition probability of success benchmarks by therapeutic area (19 TAs), biomarker-stratified, snapshot 2025-12-28
- **Differentiation flag catalog** — BTD, Fast Track, biomarker selection, FIC, BIC, oral-vs-injectable, orphan, and more, applied via two-pass stacking on top of the baseline PoS
- **Indication library** — 39 conditions with sourced epi cascades (CDC, SEER, NCCN, ADA, AHA, etc.)
- **Bear / Base / Bull scenarios** — peak revenue × 0.7 / 1.0 / 1.3
- **Sensitivity table** — rNPV at WACC × scenario
- **Deal Analysis tab** — Range / Waterfall / Calibration data sub-tabs, with 7 validated single-asset deal presets
- **localStorage persistence** — your inputs survive page reloads

## Repository structure

```
biovalue/
├── README.md                  ← This file
├── LICENSE                    ← MIT
├── .gitignore
├── .github/workflows/         ← GitHub Pages deploy
├── web/                       ← The published site (nealvybe.github.io/biovalue)
│   ├── index.html             ← The rNPV calculator
│   ├── about.html
│   ├── tutorial.html
│   ├── market_report.html
│   ├── license.html
│   └── favicon.svg
├── docs/                      ← Markdown sources (not published)
│   ├── TUTORIAL.md
│   ├── MARKET_REPORT.md
│   ├── DEAL_VALIDATION_ANALYSIS.md
│   └── substack/              ← Substack post drafts + chart PNGs
├── data/
│   ├── mit_alpha/             ← MIT Project ALPHA snapshot
│   └── biovalue_multi_deal_reports/  ← Reference deal docs
└── scripts/
    ├── validate_presets.js    ← Engine validation runner (Node)
    ├── biomarker_case_studies.js
    └── generate_post_charts.py
```

## Quick start

1. Open the tool at [nealvybe.github.io/biovalue](https://nealvybe.github.io/biovalue/) (or `web/index.html` locally)
2. On the **Asset** tab, pick a validated preset from "Load a prior deal" — Pozdeutinurad, Abelacimab, Restoret, Efimosfermin, Farabursen, ISB 2001, or VG-3927
3. Each preset populates every input across all seven tabs with values calibrated to analyst consensus peak sales within ±5%
4. Read the headline rNPV on the **Summary** tab; full Asset rNPV / Comm-adj / Deal PV breakdown on the **Deal Analysis** tab

To model your own asset, click **Reset** in the top bar and fill in the inputs.

## The rNPV formula

rNPV = Σ [ CFₜ × P(reach t) / (1 + r)ᵗ ] − Σ R&D-cost PV

R&D costs are probability-weighted by cumulative likelihood of reaching each stage, then discounted at WACC. Commercial revenue is addressable WW peak pool × peak market share × ramp × year-by-year discount × cumulative LoA, with a patent-cliff haircut on terminal years.

## Data sources

| Data | Source | Year |
|---|---|---|
| Phase transition PoS | MIT Project ALPHA database (industry-sponsored, biomarker-stratified) | Snapshot 2025-12-28 |
| Fallback PoS for non-ALPHA TAs | Wong, Siah & Lo, *Biostatistics* | 2019 |
| Phase durations | Sertkaya et al., *JAMA Network Open* | 2024 |
| R&D costs by phase | Chandra & Mazumdar, Analysis Group / *Journal of Investment Management* | 2024 |
| Indication library | CDC, SEER, NCCN, ADA, AHA, DelveInsight, NIH, primary literature | 2023–2025 |
| Deal benchmarks & royalties | BioPharma Dealmakers, Evaluate Pharma, company press releases | 2022–2026 |

## Validation

The model is calibrated against seven single-asset deals signed 2024–2026. See `docs/DEAL_VALIDATION_ANALYSIS.md` for methodology, sources, and per-deal narratives. Median Deal PV / Asset rNPV ratio across the validation set: **55%**.

| Deal | Stage | Year |
|---|---|---|
| Sobi / Arthrosi (Pozdeutinurad) | Phase III | 2025 |
| Novartis / Anthos (Abelacimab) | Phase III | 2025 |
| Merck / EyeBio (Restoret) | Phase II | 2024 |
| GSK / Boston (Efimosfermin) | Phase III | 2025 |
| Novartis / Regulus (Farabursen) | Phase III | 2025 |
| AbbVie / IGI (ISB 2001) | Phase II | 2025 |
| Sanofi / Vigil (VG-3927) | Phase II | 2025 |

## License

MIT. See [LICENSE](LICENSE). Outputs are model estimates, not investment advice.
