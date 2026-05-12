#!/usr/bin/env python3
"""Generate one anchor chart per Substack post.

Run: python3 generate_post_charts.py
Output: PNGs in docs/substack/ alongside the markdown files.
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ───────────────────────────────────────────────────────────────────
# Style — match BioValue palette
# ───────────────────────────────────────────────────────────────────
BRAND_50  = '#eff6ff'
BRAND_100 = '#dbeafe'
BRAND_300 = '#93c5fd'
BRAND_600 = '#2563eb'
BRAND_700 = '#1d4ed8'
BRAND_800 = '#1e40af'
SLATE_50  = '#f8fafc'
SLATE_100 = '#f1f5f9'
SLATE_200 = '#e2e8f0'
SLATE_400 = '#94a3b8'
SLATE_600 = '#475569'
SLATE_700 = '#334155'
SLATE_900 = '#0f172a'
AMBER_500 = '#f59e0b'
RED_600   = '#dc2626'
GREEN_700 = '#15803d'

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Helvetica', 'Arial', 'DejaVu Sans'],
    'font.size': 11,
    'axes.labelcolor': SLATE_700,
    'axes.edgecolor': SLATE_200,
    'axes.linewidth': 0.8,
    'axes.grid': True,
    'axes.titlesize': 13,
    'axes.titleweight': 'bold',
    'axes.titlecolor': SLATE_900,
    'axes.labelsize': 11,
    'xtick.color': SLATE_600,
    'ytick.color': SLATE_600,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'grid.color': SLATE_100,
    'grid.linewidth': 0.6,
    'savefig.dpi': 200,
    'savefig.bbox': 'tight',
    'savefig.facecolor': 'white',
    'figure.facecolor': 'white',
})

OUT_DIR = '/sessions/inspiring-bold-davinci/mnt/model/biovalue/docs/substack'
os.makedirs(OUT_DIR, exist_ok=True)


# ───────────────────────────────────────────────────────────────────
# POST 1 — Deal PV / Asset rNPV ratios for 7 validated single-asset deals
# ───────────────────────────────────────────────────────────────────

def chart_post1():
    # Ordered descending by ratio
    deals = [
        ('Sobi / Arthrosi (Pozdeutinurad, Ph III)', 84),
        ('Sanofi / Vigil (VG-3927, Ph II)',         64),
        ('Merck / EyeBio (Restoret, Ph II)',        58),
        ('AbbVie / IGI (ISB 2001, Ph II)',          55),
        ('Novartis / Anthos (Abelacimab, Ph III)',  45),
        ('Novartis / Regulus (Farabursen, Ph III)', 31),
        ('GSK / Boston (Efimosfermin, Ph III)',     30),
    ]
    labels = [d[0] for d in deals]
    ratios = [d[1] for d in deals]
    median_ratio = sorted(ratios)[len(ratios) // 2]
    y_positions = np.arange(len(deals))

    fig, ax = plt.subplots(figsize=(10, 5.5))

    # Reference band 30–65% shaded
    ax.axvspan(30, 65, color=BRAND_50, alpha=0.7, zorder=0,
               label='Typical band (30–65%)')

    # Bars — outlier highlighted in amber
    bar_colors = [BRAND_600 if r != 84 else AMBER_500 for r in ratios]
    bars = ax.barh(y_positions, ratios, color=bar_colors, height=0.65,
                   edgecolor='white', linewidth=1.5, zorder=2)

    # Median line
    ax.axvline(median_ratio, color=BRAND_800, linestyle='--', linewidth=1.5,
               zorder=3, label=f'Median ({median_ratio}%)')

    # Value labels at end of bars
    for i, r in enumerate(ratios):
        ax.text(r + 1.5, y_positions[i], f'{r}%', va='center',
                fontsize=10, fontweight='bold', color=SLATE_900)

    ax.set_yticks(y_positions)
    ax.set_yticklabels(labels)
    ax.set_xlim(0, 100)
    ax.set_xlabel('Deal PV / Asset rNPV')
    ax.set_xticks([0, 25, 50, 75, 100])
    ax.set_xticklabels(['0%', '25%', '50%', '75%', '100%'])
    ax.invert_yaxis()
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.tick_params(axis='y', length=0)
    ax.grid(axis='y', visible=False)

    ax.legend(loc='lower right', frameon=False, fontsize=9.5)

    # Callout for the Sobi/Arthrosi outlier — positioned to the right within the band,
    # in empty space below the orange bar and above the next bar
    ax.annotate(
        'Two Ph III trials fully enrolled,\n'
        'topline data within 12 months.\n'
        '63% upfront, natural strategic\n'
        'acquirer (Sobi gout franchise).',
        xy=(84, 0.3), xytext=(72, 4.0),
        fontsize=8.5, color=SLATE_700, ha='left', va='center',
        bbox=dict(boxstyle='round,pad=0.45', facecolor='#fffbeb',
                  edgecolor=AMBER_500, linewidth=0.8, alpha=0.97),
        arrowprops=dict(arrowstyle='->', color=AMBER_500, lw=1.0,
                        connectionstyle='arc3,rad=0.25'))

    fig.suptitle('Single-asset drug deals cluster in a tight 30–65% band',
                 fontsize=14, fontweight='bold', color=SLATE_900, y=1.00, x=0.02, ha='left')
    fig.text(0.02, 0.91, 'Deal PV as a percentage of Asset rNPV, seven validated single-asset deals (2024–2025)',
             fontsize=10, color=SLATE_600, ha='left')

    fig.text(0.02, -0.02,
             'Source: BioValue rNPV engine. Median Deal PV / Asset rNPV = 55%. '
             'Outlier (Sobi/Arthrosi, 84%) reflects de-risked data state + upfront-heavy structure + strategic fit.',
             fontsize=8, color=SLATE_400, ha='left')

    plt.tight_layout(rect=[0, 0, 1, 0.88])
    out = os.path.join(OUT_DIR, 'post-1-deal-pv-band.png')
    plt.savefig(out)
    plt.close()
    print(f'wrote {out}')


# ───────────────────────────────────────────────────────────────────
# POST 2 — Four value props compared
# ───────────────────────────────────────────────────────────────────

def chart_post2():
    fig, axes = plt.subplots(2, 2, figsize=(13, 9.5))
    plt.subplots_adjust(hspace=0.55, wspace=0.28)

    def styled_panel(ax, title, asset_label, labels, values, colors,
                     ylabel='Asset rNPV ($B)', value_labels=None,
                     annotate=None, ymax=None):
        x = np.arange(len(values))
        bars = ax.bar(x, values, color=colors, width=0.55,
                      edgecolor='white', linewidth=1.2)
        ax.set_xticks(x)
        ax.set_xticklabels(labels, fontsize=9.5)
        ax.set_ylabel(ylabel, fontsize=10)

        # Single title with asset label folded in
        ax.set_title(f'{title}\n{asset_label}', loc='left', pad=12,
                     fontsize=11.5, color=SLATE_900)

        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color(SLATE_200)
        ax.grid(axis='x', visible=False)
        ax.tick_params(axis='x', length=0)

        plot_max = ymax if ymax is not None else max(values + [0]) * 1.35
        ax.set_ylim(min(0, min(values) * 1.2), plot_max)

        if value_labels:
            for i, lbl in enumerate(value_labels):
                v = values[i]
                if v >= 0:
                    ax.text(x[i], v + plot_max * 0.025, lbl, ha='center',
                            fontsize=10, fontweight='bold', color=SLATE_900)
                else:
                    ax.text(x[i], plot_max * 0.03, lbl, ha='center',
                            fontsize=10, fontweight='bold', color=RED_600)

        # Callout centered horizontally over the rightmost bar, vertically above the value label
        if annotate:
            rightmost_x = len(values) - 1
            ax.text(rightmost_x, plot_max * 0.92, annotate,
                    ha='center', va='top', fontsize=9.5, fontweight='bold',
                    color=BRAND_700, multialignment='center',
                    bbox=dict(boxstyle='round,pad=0.5', facecolor=BRAND_50,
                              edgecolor=BRAND_100, linewidth=0.8))

    # Value prop 1
    styled_panel(
        axes[0, 0],
        title='Value prop 1: Carving out a precision population',
        asset_label='Tafamidis (ATTR-CM)',
        labels=['Biomarker-defined\n(actual)', 'Broad HF DMT\n(counterfactual)'],
        values=[26.46, -0.16],
        colors=[BRAND_600, SLATE_400],
        value_labels=['$26.5B', 'negative'],
        annotate='Biomarker creates\nthe asset',
        ymax=33
    )

    # Value prop 2
    styled_panel(
        axes[0, 1],
        title='Value prop 2: Stratification of responders',
        asset_label='Lecanemab (early Alzheimer\'s)',
        labels=['Amyloid-enriched\n(actual)', 'Broad clinical AD\n(counterfactual, 9% LoA)'],
        values=[8.09, 6.88],
        colors=[BRAND_600, SLATE_400],
        value_labels=['$8.1B', '$6.9B'],
        annotate='Biomarker is the\nprecondition',
        ymax=11
    )

    # Value prop 3
    styled_panel(
        axes[1, 0],
        title='Value prop 3: Disrupting incumbent',
        asset_label='Tezepelumab (severe asthma)',
        labels=['Broad mechanism\n(actual)', 'Biomarker-restricted\n(hypothetical)'],
        values=[9.61, 7.81],
        colors=[BRAND_600, SLATE_400],
        value_labels=['$9.6B', '$7.8B'],
        annotate='+23% to\nbroader strategy',
        ymax=13
    )

    # Value prop 4
    styled_panel(
        axes[1, 1],
        title='Value prop 4: Endpoint biomarker (timeline compression)',
        asset_label='Same drug, different Phase III duration',
        labels=['Standard\n(3.5y)', 'Moderate\n(2.0y)', 'Aggressive\n(1.5y)'],
        values=[6.96, 8.05, 8.45],
        colors=[SLATE_400, BRAND_300, BRAND_600],
        value_labels=['$7.0B', '$8.1B  +16%', '$8.5B  +22%'],
        annotate='Pure timeline\neffect at 10% WACC',
        ymax=12
    )

    fig.suptitle('The four biomarker value props produce different rNPV signatures',
                 fontsize=14, fontweight='bold', color=SLATE_900, y=1.005, x=0.02, ha='left')
    fig.text(0.02, 0.955,
             'BioValue rNPV outputs: each panel compares the biomarker scenario to the alternative for one value prop',
             fontsize=10, color=SLATE_600, ha='left')

    fig.text(0.02, -0.005,
             'Source: BioValue rNPV engine, three case-study presets + endpoint-timing scenario. '
             'See scripts/biomarker_case_studies.js.',
             fontsize=8, color=SLATE_400, ha='left')

    plt.tight_layout(rect=[0, 0, 1, 0.91])
    out = os.path.join(OUT_DIR, 'post-2-value-props.png')
    plt.savefig(out)
    plt.close()
    print(f'wrote {out}')


# ───────────────────────────────────────────────────────────────────
# POST 3 — Zolgensma revenue trajectory (real public data)
# ───────────────────────────────────────────────────────────────────

def chart_post3():
    years = [2019, 2020, 2021, 2022, 2023, 2024]
    actual_revenue = [361, 920, 1351, 1370, 1214, 1058]

    # Hypothetical chronic-drug shape: 5-year ramp to observed 2021 peak, then plateau
    peak = 1351
    chronic_drug = [peak * (i + 1) / 5 if i < 4 else peak for i in range(len(years))]

    fig, ax = plt.subplots(figsize=(10, 5.8))

    ax.plot(years, actual_revenue, marker='o', markersize=9,
            linewidth=2.5, color=BRAND_600, label='Zolgensma actual WW revenue',
            zorder=3)
    for x, y in zip(years, actual_revenue):
        ax.annotate(f'${y:,}M', xy=(x, y), xytext=(0, 14),
                    textcoords='offset points', ha='center',
                    fontsize=9.5, fontweight='bold', color=SLATE_900,
                    zorder=4)

    ax.plot(years, chronic_drug, marker='s', markersize=6,
            linewidth=1.5, color=SLATE_400, linestyle='--',
            label='PV prediction (ramp + plateau)',
            zorder=2)

    ax.fill_between(years, actual_revenue, chronic_drug,
                    where=[a < c for a, c in zip(actual_revenue, chronic_drug)],
                    color=AMBER_500, alpha=0.15, zorder=1)

    # Phase annotations placed where they don't collide with data
    ax.annotate('Backlog clearance phase',
                xy=(2020.5, 450), fontsize=10.5, color=BRAND_700, ha='center',
                fontweight='bold')
    ax.annotate('(years 1–3)',
                xy=(2020.5, 350), fontsize=9.5, color=SLATE_600, ha='center')

    ax.annotate('Incident-only decline',
                xy=(2023.5, 950), fontsize=10.5, color=BRAND_700, ha='center',
                fontweight='bold')
    ax.annotate('(year 4+)',
                xy=(2023.5, 850), fontsize=9.5, color=SLATE_600, ha='center')

    ax.set_xlabel('Year')
    ax.set_ylabel('Worldwide revenue ($M)')
    ax.set_xticks(years)
    ax.set_ylim(0, 1700)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f'${v:,.0f}M'))
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.legend(loc='lower right', frameon=False, fontsize=9.5)

    fig.suptitle('Cell and gene therapy generates cash in a different shape',
                 fontsize=14, fontweight='bold', color=SLATE_900, y=0.99, x=0.02, ha='left')
    fig.text(0.02, 0.93,
             'Zolgensma (Novartis), AAV9 gene therapy for SMA, approved May 2019',
             fontsize=10, color=SLATE_600, ha='left')

    fig.text(0.02, -0.02,
             'Source: Novartis annual reports 2019–2024. '
             'Chronic-drug PV prediction is illustrative (5-year ramp to observed 2021 peak).',
             fontsize=8, color=SLATE_400, ha='left')

    plt.tight_layout(rect=[0, 0, 1, 0.91])
    out = os.path.join(OUT_DIR, 'post-3-cgt-shape.png')
    plt.savefig(out)
    plt.close()
    print(f'wrote {out}')


# ───────────────────────────────────────────────────────────────────
# POST 4 — Platform deal decomposition
# ───────────────────────────────────────────────────────────────────

def chart_post4():
    deals = [
        ('AbbVie /\nImmunoGen',  3.0,  1.75, 3.5,  1.85, 10.1),
        ('Merck /\nPrometheus',  3.5,  1.25, 3.5,  2.55, 10.8),
        ('BMS /\nTurning Point', 1.75, 1.25, 1.0,  0.10, 4.1),
        ('Pfizer /\nSeagen',     30.0, 6.5,  7.5, -1.0,  43.0),
    ]
    labels = [d[0] for d in deals]
    lead   = [d[1] for d in deals]
    pipeln = [d[2] for d in deals]
    platfm = [d[3] for d in deals]
    strat  = [d[4] for d in deals]
    total  = [d[5] for d in deals]

    x = np.arange(len(deals))
    width = 0.5

    fig, ax = plt.subplots(figsize=(11, 6.5))

    p1 = ax.bar(x, lead,   width, label='Lead asset rNPV',     color=BRAND_600, edgecolor='white', linewidth=1.2)
    p2 = ax.bar(x, pipeln, width, bottom=lead, label='Pipeline rNPV', color=BRAND_300, edgecolor='white', linewidth=1.2)
    p3 = ax.bar(x, platfm, width, bottom=[a+b for a,b in zip(lead, pipeln)],
                label='Platform / capability', color=SLATE_400, edgecolor='white', linewidth=1.2)
    p4 = ax.bar(x, strat,  width, bottom=[a+b+c for a,b,c in zip(lead, pipeln, platfm)],
                label='Strategic premium', color=SLATE_200, edgecolor='white', linewidth=1.2)

    # Deal total at top of bar; "deal value" label spaced below the dollar figure
    for i, t in enumerate(total):
        cumulative = lead[i] + pipeln[i] + platfm[i] + strat[i]
        ax.text(x[i], cumulative + 3.0, f'${t}B', ha='center',
                fontsize=12, fontweight='bold', color=SLATE_900)
        ax.text(x[i], cumulative + 1.4, 'deal value', ha='center',
                fontsize=8.5, color=SLATE_600)

    # Lead-asset-share % inside the lead bar
    for i in range(len(deals)):
        share = lead[i] / total[i] * 100
        if lead[i] >= 2:
            ax.text(x[i], lead[i] / 2, f'{share:.0f}%',
                    ha='center', va='center', fontsize=11,
                    fontweight='bold', color='white')

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=11)
    ax.set_ylabel('Deal value ($B)')
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f'${v:,.0f}B'))
    ax.set_ylim(0, 54)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(SLATE_200)
    ax.grid(axis='x', visible=False)
    ax.legend(loc='upper left', frameon=False, fontsize=9.5, ncol=2,
              bbox_to_anchor=(0, 0.94))

    # Portfolio note for Pfizer/Seagen — moved to empty middle area with background box
    ax.annotate('Portfolio acquisition\n(4 marketed ADCs dominate)',
                xy=(2.65, 22), xytext=(1.8, 32),
                fontsize=9, color=SLATE_700, ha='center', fontstyle='italic',
                bbox=dict(boxstyle='round,pad=0.45', facecolor='white',
                          edgecolor=SLATE_200, linewidth=0.8),
                arrowprops=dict(arrowstyle='->', color=SLATE_400, lw=0.9,
                                connectionstyle='arc3,rad=-0.15'))

    fig.suptitle('Platform deals: lead asset is 30–50% of price, not 100%',
                 fontsize=14, fontweight='bold', color=SLATE_900, y=1.00, x=0.02, ha='left')
    fig.text(0.02, 0.92,
             'Decomposition of four "platform" deals dropped from the BioValue single-asset validation set',
             fontsize=10, color=SLATE_600, ha='left')

    fig.text(0.02, -0.02,
             'Source: Public deal disclosures + BioValue estimated decomposition. '
             '% inside lead-asset bar = lead asset share of total deal value.',
             fontsize=8, color=SLATE_400, ha='left')

    plt.tight_layout(rect=[0, 0, 1, 0.89])
    out = os.path.join(OUT_DIR, 'post-4-platform-decomp.png')
    plt.savefig(out)
    plt.close()
    print(f'wrote {out}')


# ───────────────────────────────────────────────────────────────────
# POST 5 — Biobuck headline vs inferred Deal PV (Boehringer / Immunitas)
# ───────────────────────────────────────────────────────────────────

def chart_post5():
    # Headline biobuck total (€407.5M ~ $440M at 1.08)
    headline = 440.0

    # Inferred Deal PV components (central case)
    upfront    = 40.0   # estimated (5–15% range = $20–65M)
    dev_ms     = 40.0   # risk-adjusted dev milestones PV (range $30–50M)
    reg_comm   = 30.0   # risk-adjusted reg + commercial milestones PV (range $20–40M)
    royalty_pv = 60.0   # royalty stream PV at 8% blended on $1–2B risk-adj peak (range $40–80M)
    central    = upfront + dev_ms + reg_comm + royalty_pv  # 170

    deal_pv_low  = 120.0
    deal_pv_high = 220.0

    fig, ax = plt.subplots(figsize=(9.5, 6.0))

    bar_width = 0.45
    x_headline = 0
    x_dealpv   = 1

    # Headline biobuck bar (single, light gray)
    ax.bar(x_headline, headline, width=bar_width, color=SLATE_200,
           edgecolor='white', linewidth=1.2, zorder=2)

    # Inferred Deal PV bar — stacked components
    ax.bar(x_dealpv, upfront,    width=bar_width, color=BRAND_700,
           edgecolor='white', linewidth=1.2, zorder=2, label='Upfront (estimated $40M)')
    ax.bar(x_dealpv, dev_ms,     width=bar_width, bottom=upfront,
           color=BRAND_600, edgecolor='white', linewidth=1.2, zorder=2,
           label='Dev milestones PV (risk-adj.)')
    ax.bar(x_dealpv, reg_comm,   width=bar_width, bottom=upfront + dev_ms,
           color=BRAND_300, edgecolor='white', linewidth=1.2, zorder=2,
           label='Reg + commercial milestones PV')
    ax.bar(x_dealpv, royalty_pv, width=bar_width, bottom=upfront + dev_ms + reg_comm,
           color=AMBER_500, edgecolor='white', linewidth=1.2, zorder=2,
           label='Royalty stream PV (8% blended)')

    # Range whisker on Deal PV bar
    ax.errorbar(x_dealpv, central,
                yerr=[[central - deal_pv_low], [deal_pv_high - central]],
                fmt='none', ecolor=SLATE_700, capsize=10,
                elinewidth=1.5, capthick=1.5, zorder=4)

    # Component sub-labels inside the right bar
    cum = 0
    component_labels = [
        ('Upfront (est.)\n$40M',          upfront,    'white'),
        ('Dev milestones\n$40M',          dev_ms,     'white'),
        ('Reg + comm.\n$30M',             reg_comm,   SLATE_900),
        ('Royalty stream\n$60M',          royalty_pv, SLATE_900),
    ]
    for lbl, val, color in component_labels:
        ax.text(x_dealpv + 0.30, cum + val / 2, lbl,
                ha='left', va='center', fontsize=9, color=color,
                fontweight='bold' if color == 'white' else 'normal')
        cum += val

    # Top labels for each bar — value sits higher, subtitle below it,
    # with a clear gap to the bar/whisker top
    ax.text(x_headline, headline + 45, f'${headline:.0f}M', ha='center',
            fontsize=13, fontweight='bold', color=SLATE_900)
    ax.text(x_headline, headline + 25, 'headline biobuck', ha='center',
            fontsize=9, color=SLATE_600)

    ax.text(x_dealpv, deal_pv_high + 45, f'${central:.0f}M central',
            ha='center', fontsize=13, fontweight='bold', color=SLATE_900)
    ax.text(x_dealpv, deal_pv_high + 25, f'${deal_pv_low:.0f}–${deal_pv_high:.0f}M range',
            ha='center', fontsize=9, color=SLATE_600)

    # Ratio annotation between bars
    ax.annotate(
        f'Inferred Deal PV\n≈ {central/headline*100:.0f}% of headline',
        xy=(0.5, 280), fontsize=10.5, color=BRAND_700, ha='center',
        fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.5', facecolor=BRAND_50,
                  edgecolor=BRAND_100, linewidth=0.8))

    ax.set_xticks([x_headline, x_dealpv])
    ax.set_xticklabels(['Headline biobuck\n(€407.5M ≈ $440M)',
                        'Inferred Deal PV\n(BioValue decomposition)'],
                       fontsize=10.5)
    ax.set_ylabel('USD (millions)')
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f'${v:,.0f}M'))
    ax.set_ylim(0, 560)
    ax.set_xlim(-0.6, 1.95)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(SLATE_200)
    ax.grid(axis='x', visible=False)
    ax.tick_params(axis='x', length=0)
    ax.legend(loc='upper right', frameon=False, fontsize=9, ncol=1,
              bbox_to_anchor=(1.00, 0.78))

    fig.suptitle('A €407M biobuck headline is worth roughly $170M today',
                 fontsize=14, fontweight='bold', color=SLATE_900,
                 y=1.00, x=0.02, ha='left')
    fig.text(0.02, 0.93,
             'Boehringer / Immunitas (IMT-380, preclinical anti-CD161), decomposed using BioValue heuristics',
             fontsize=10, color=SLATE_600, ha='left')

    fig.text(0.02, -0.02,
             'Source: BioValue rNPV engine + biobuck structural heuristics. '
             'Upfront undisclosed; central estimate $40M (~10% of headline). '
             'Whiskers show $120–$220M range across plausible upfront and royalty assumptions.',
             fontsize=8, color=SLATE_400, ha='left')

    plt.tight_layout(rect=[0, 0, 1, 0.89])
    out = os.path.join(OUT_DIR, 'post-5-biobuck-decomp.png')
    plt.savefig(out)
    plt.close()
    print(f'wrote {out}')


if __name__ == '__main__':
    chart_post1()
    chart_post2()
    chart_post3()
    chart_post4()
    chart_post5()
    print('Done.')
