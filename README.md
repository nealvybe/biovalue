# BioValue — Drug Asset rNPV Valuation Model

A risk-adjusted NPV (rNPV) framework for valuing pharmaceutical drug assets from IND-ready through commercial launch. Built for biotech/pharma analysts, BD teams, and investors.

## What This Is

BioValue places a market value on a drug asset at every development milestone using:
- **Phase-specific probability of success (PoS)** benchmarks by therapeutic area (19 TAs)
- **Epidemiology cascade** to derive TAM and peak sales from disease prevalence/incidence
- **rNPV engine** with Bear / Base / Bull scenarios
- **Deal benchmarks** from 11 recent transactions (2022–2026)
- **Sensitivity tables** across WACC, LoA, and peak sales

## Repository Structure

```
biovalue/
├── README.md
├── docs/
│   ├── TUTORIAL.md          ← How to use the model step-by-step
│   └── MARKET_REPORT.md     ← Pharma deal landscape 2024–2026
└── examples/
    └── Arthrosi_Pozdeutinurad_rNPV_WorkedExample.xlsx
```

## Quick Start

1. Open `examples/Arthrosi_Pozdeutinurad_rNPV_WorkedExample.xlsx`
2. Go to the **Assumptions** tab — all blue cells are inputs
3. Enter your asset's therapeutic area, current stage, peak sales estimate, and WACC
4. Read rNPV at each stage from the **rNPV Model** tab, Section D

## Color Convention (Industry Standard)

| Color | Meaning |
|-------|---------|
| 🔵 Blue text | Hardcoded inputs — change these for your asset |
| ⚫ Black text | Formulas — do not edit |
| 🟢 Green text | Cross-sheet references |
| 🟡 Yellow background | Key assumption requiring attention |

## The rNPV Formula

rNPV = Σ [ CFₜ × P(Successₜ) / (1 + r)ᵗ ]

Where:
- CFₜ = cash flow at time t (negative during R&D, positive post-launch)
- P(Successₜ) = cumulative probability of reaching that milestone
- r = WACC (risk-adjusted discount rate)

## Key Data Sources

| Data | Source | Year |
|------|--------|------|
| Phase transition PoS | BIO/Informa/QLS Advisors Clinical Development Success Rates | 2011–2020 (pub. 2021) |
| Phase transition PoS | IQVIA R&D Trends | 2024 |
| R&D costs by phase | Sertkaya et al., JAMA Netw Open | 2024 |
| R&D costs by phase | Chandra & Mazumdar, Analysis Group/JOIM | 2024 |
| Gout epidemiology | DelveInsight Chronic Refractory Gout Market Report | 2025 |
| Deal benchmarks | BioPharma Dealmakers, Evaluate Pharma, press releases | 2022–2026 |

## Worked Example: Sobi / Arthrosi (Pozdeutinurad, AR882)

- **Indication:** Chronic refractory gout (oral URAT1 inhibitor)
- **Stage at deal:** Phase III (fully enrolled)
- **Actual deal:** $950M upfront + up to $550M milestones = $1.5B total (announced Jan 2025)
- **Model rNPV at Ph III entry:** Bear $250M | Base $620M | Bull $1,050M
- **Finding:** $950M upfront sits between Base and Bull — ~35% premium attributable to competitive urgency, franchise synergies (Krystexxa), and best-in-class oral positioning

## License

MIT
