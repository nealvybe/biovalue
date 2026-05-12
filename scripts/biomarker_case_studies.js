#!/usr/bin/env node
// Biomarker post: case study numbers from BioValue engine.
// Tezepelumab (Pattern 1: disrupting biomarker-restricted incumbent market)
// Lecanemab (Pattern 2: salvaging poor efficacy via biomarker enrichment)
// Tafamidis (Pattern 3: carving out a biomarker-defined subset)
// Restoret (Pattern 4: endpoint biomarker timeline acceleration)

// Reuse the engine from validate_presets.js by inlining the same logic.

const PoSTable = {
  'Oncology (all)':            { unselected: { p1_2: 0.584, p2_3: 0.270, p3_nda: 0.658, nda_app: 0.910 }, biomarker: { p1_2: 0.707, p2_3: 0.313, p3_nda: 0.601, nda_app: 0.910 } },
  'Hematology':                { unselected: { p1_2: 0.743, p2_3: 0.661, p3_nda: 0.873, nda_app: 0.910 }, biomarker: { p1_2: 0.800, p2_3: 0.489, p3_nda: 0.806, nda_app: 0.910 } },
  'Immunology / Inflammation': { unselected: { p1_2: 0.658, p2_3: 0.560, p3_nda: 0.827, nda_app: 0.910 }, biomarker: { p1_2: 0.674, p2_3: 0.349, p3_nda: 0.687, nda_app: 0.910 } },
  'CNS / Neurology':           { unselected: { p1_2: 0.672, p2_3: 0.454, p3_nda: 0.685, nda_app: 0.910 }, biomarker: { p1_2: 0.660, p2_3: 0.343, p3_nda: 0.511, nda_app: 0.910 } },
  'Cardiovascular':            { unselected: { p1_2: 0.730, p2_3: 0.570, p3_nda: 0.678, nda_app: 0.910 }, biomarker: { p1_2: 0.793, p2_3: 0.503, p3_nda: 0.748, nda_app: 0.910 } },
  'Respiratory':               { unselected: { p1_2: 0.714, p2_3: 0.414, p3_nda: 0.681, nda_app: 0.910 }, biomarker: { p1_2: 0.729, p2_3: 0.286, p3_nda: 0.675, nda_app: 0.910 } },
  'Ophthalmology':             { unselected: { p1_2: 0.823, p2_3: 0.525, p3_nda: 0.766, nda_app: 0.910 }, biomarker: { p1_2: 0.925, p2_3: 0.365, p3_nda: 0.733, nda_app: 0.910 } },
};

const STAGES = ['Preclinical', 'Phase I', 'Phase II', 'Phase III', 'NDA/BLA', 'Approved'];
const PRECLIN_P1 = 0.60;
const DEFAULT_PHASE_DURATION = { 'Preclinical': 4.0, 'Phase I': 1.5, 'Phase II': 2.5, 'Phase III': 2.5, 'NDA/BLA': 1.0 };
const DEFAULT_PHASE_COST     = { 'Preclinical': 5,   'Phase I': 25,  'Phase II': 60,  'Phase III': 300, 'NDA/BLA': 15 };

const FLAGS = [
  { id: 'btd', effects: { posFailReduction: { p2_3: 0.23, p3_nda: 0.10 }, rampYearsDelta: -0.5 } },
  { id: 'fastTrack', effects: { posFailReduction: { nda_app: 0.20 } } },
  { id: 'orphan', effects: { posFailReduction: { p2_3: 0.10 }, pricePremiumPct: 35, lifeYearsDelta: 2 } },
  { id: 'biomarker', effects: { biomarkerReplace: true } },
  { id: 'fic', exclusiveGroup: 'mechanism', effects: { posFailIncrease: { p2_3: 0.05 }, pricePremiumPct: 15 } },
  { id: 'bic', exclusiveGroup: 'mechanism', effects: { pricePremiumPct: 10, shareBoostPct: 25 } },
];

const COMPETITION = {
  'Underserved / no incumbent': { peakShare: 0.45 },
  'Lightly contested (1–2 incumbents)': { peakShare: 0.25 },
  'Contested (3–4 approved)': { peakShare: 0.12 },
  'Saturated (5+ approved)': { peakShare: 0.06 },
};

const CAP_POS_PER_TRANSITION = 0.90;
const CAP_PRICE_PREMIUM_PCT = 50;
const CAP_LIFE_YEARS_DELTA = 5;

function defaultFlags() { const o = {}; FLAGS.forEach(f => { o[f.id] = { on: false, mag: 1.0 }; }); return o; }
function defaultPhase() { const dur = {}, cost = {}; Object.keys(DEFAULT_PHASE_DURATION).forEach(s => { dur[s] = DEFAULT_PHASE_DURATION[s]; cost[s] = DEFAULT_PHASE_COST[s]; }); return { duration: dur, cost }; }

function makeState(p) {
  const s = {
    ta: p.ta, currentStage: p.currentStage, wacc: p.wacc,
    epi: Object.assign({}, p.epi),
    gtn: p.gtn, wwMult: p.wwMult,
    competition: p.competition, peakSharePct: p.peakSharePct,
    rampYears: p.rampYears, commercialLifeBase: p.commercialLifeBase, loeHaircutPct: p.loeHaircutPct,
    dealUpfront_M: p.dealUpfront_M || 0, dealMilestones_M: p.dealMilestones_M || 0,
    dealMilestoneRegPct: p.dealMilestoneRegPct || 50, dealSalesProb: p.dealSalesProb || 70,
    royalty: p.royalty || 0,
    posOverride: { p1_2: null, p2_3: null, p3_nda: null, nda_app: null },
    phase: defaultPhase(), flags: defaultFlags(),
  };
  (p.flagsOn || []).forEach(fid => { if (s.flags[fid]) s.flags[fid].on = true; });
  // Apply preset overrides if any (e.g., shorter Phase III for endpoint biomarker case)
  if (p.phaseDurationOverride) Object.assign(s.phase.duration, p.phaseDurationOverride);
  if (p.posOverride) Object.assign(s.posOverride, p.posOverride);
  return s;
}

function activeFlags(s) { return FLAGS.filter(f => s.flags[f.id] && s.flags[f.id].on); }

function computeEffectivePoS(s) {
  const taData = PoSTable[s.ta]; if (!taData) return null;
  const bOn = !!(s.flags.biomarker && s.flags.biomarker.on);
  const bMag = bOn ? s.flags.biomarker.mag : 0;
  const baseline = {};
  ['p1_2','p2_3','p3_nda','nda_app'].forEach(k => {
    baseline[k] = bOn ? (taData.unselected[k] + (taData.biomarker[k] - taData.unselected[k]) * bMag) : taData.unselected[k];
  });
  const effective = {};
  ['p1_2','p2_3','p3_nda','nda_app'].forEach(k => {
    const baseP = taData.unselected[k];
    let failProb = 1 - baseP;
    let any = false;
    if (bOn) { failProb = 1 - baseline[k]; any = true; }
    activeFlags(s).forEach(flag => {
      if (flag.id === 'biomarker') return;
      const mag = s.flags[flag.id].mag;
      const r = flag.effects.posFailReduction && flag.effects.posFailReduction[k];
      const i = flag.effects.posFailIncrease && flag.effects.posFailIncrease[k];
      if (r) { failProb *= (1 - r * mag); any = true; }
      if (i) { failProb = Math.min(1, 1 - (1 - failProb) * (1 - i * mag)); any = true; }
    });
    let v = 1 - failProb;
    if (s.posOverride[k] != null) { v = s.posOverride[k]; any = true; }
    if (any) {
      const cap = Math.max(baseP, CAP_POS_PER_TRANSITION);
      if (v > cap) v = cap;
    }
    effective[k] = v;
  });
  return { effective };
}

function computeEffectivePrice(s) {
  const wac = s.epi.wacPrice;
  let net = wac * (1 - s.gtn / 100);
  let premPct = 0;
  activeFlags(s).forEach(flag => {
    if (flag.effects.pricePremiumPct) premPct += flag.effects.pricePremiumPct * s.flags[flag.id].mag;
  });
  return net * (1 + Math.min(premPct, CAP_PRICE_PREMIUM_PCT) / 100);
}

function computeEffectiveLife(s) {
  let life = s.commercialLifeBase;
  let delta = 0;
  activeFlags(s).forEach(flag => {
    if (flag.effects.lifeYearsDelta) delta += flag.effects.lifeYearsDelta * s.flags[flag.id].mag;
  });
  return Math.max(1, life + Math.min(Math.max(0, delta), CAP_LIFE_YEARS_DELTA) + Math.min(0, delta));
}

function computeEffectiveRamp(s) {
  let r = s.rampYears;
  activeFlags(s).forEach(flag => {
    if (flag.effects.rampYearsDelta) r += flag.effects.rampYearsDelta * s.flags[flag.id].mag;
  });
  return Math.max(1, r);
}

function epiPatients(epi) { return epi.population * (epi.prevalence/100) * (epi.pctChronic/100) * (epi.pctTreated/100) * (epi.pctAddressable/100); }

function effectiveShare(s) {
  let share = s.peakSharePct / 100;
  activeFlags(s).forEach(flag => {
    if (flag.effects.shareBoostPct) share *= (1 + (flag.effects.shareBoostPct / 100) * s.flags[flag.id].mag);
  });
  return Math.max(0.005, Math.min(1, share));
}

function peakRevenueWWNet_M(s, peakMult) {
  const price = computeEffectivePrice(s);
  const patients = epiPatients(s.epi);
  const usNet_M = patients * price / 1e6;
  const wwNet_M = usNet_M * s.wwMult;
  return wwNet_M * effectiveShare(s) * (peakMult || 1);
}

function rNPVatStage(viewStage, s, peakMult) {
  const posInfo = computeEffectivePoS(s);
  if (!posInfo) return { rNPV: 0, commPV: 0, launchProb: 0, yearsToLaunch: 0, rdCostPV: 0 };
  const pos = posInfo.effective;
  const r = s.wacc / 100;
  const peak = peakRevenueWWNet_M(s, peakMult);

  const phaseDur = Object.assign({}, s.phase.duration);
  const phaseCost = Object.assign({}, s.phase.cost);

  function transitionFrom(stage) {
    if (stage === 'Preclinical') return PRECLIN_P1;
    if (stage === 'Phase I')     return pos.p1_2;
    if (stage === 'Phase II')    return pos.p2_3;
    if (stage === 'Phase III')   return pos.p3_nda;
    if (stage === 'NDA/BLA')     return pos.nda_app;
    return 1;
  }
  function probReach(from, target) {
    const fi = STAGES.indexOf(from); const ti = STAGES.indexOf(target);
    if (ti <= fi) return 1;
    let p = 1; for (let i = fi; i < ti; i++) p *= transitionFrom(STAGES[i]);
    return p;
  }

  const yearsToStart = {}; let cum = 0; const vi = STAGES.indexOf(viewStage);
  for (let i = vi; i < STAGES.length; i++) { yearsToStart[STAGES[i]] = cum; cum += (phaseDur[STAGES[i]] || 0); }
  const yearsToLaunch = yearsToStart['Approved'];

  let rdCostPV = 0;
  for (let i = vi; i < STAGES.indexOf('Approved'); i++) {
    const stage = STAGES[i]; const c = phaseCost[stage] || 0;
    if (c === 0) continue;
    const mid = yearsToStart[stage] + (phaseDur[stage] || 0) / 2;
    const p = probReach(viewStage, stage);
    rdCostPV += (c * p) / Math.pow(1 + r, mid);
  }

  const launchProb = probReach(viewStage, 'Approved');
  const life = computeEffectiveLife(s);
  const ramp = computeEffectiveRamp(s);
  const loeHair = 1 - s.loeHaircutPct / 100;
  let commPV = 0;
  for (let y = 0; y < life; y++) {
    let frac = y < ramp ? (y + 1) / (ramp + 1) : 1.0;
    if (y >= life - 2) frac *= loeHair;
    const t = yearsToLaunch + y + 0.5;
    commPV += (peak * frac) / Math.pow(1 + r, t);
  }
  return { rNPV: launchProb * commPV - rdCostPV, rdCostPV, commPV: launchProb * commPV, launchProb, yearsToLaunch, peak };
}

const COMM_ADJ_WACC = 14.0, COMM_ADJ_PEAK_RETAIN = 0.60, COMM_ADJ_COMM_POS = 0.85;
function commercialAdjustedRnpv(s) {
  const adjState = Object.assign({}, s, { wacc: COMM_ADJ_WACC });
  const res = rNPVatStage(s.currentStage, adjState, COMM_ADJ_PEAK_RETAIN);
  return res.commPV * COMM_ADJ_COMM_POS - res.rdCostPV;
}

function fmt(v) { if (Math.abs(v) >= 1000) return '$' + (v/1000).toFixed(2) + 'B'; return '$' + Math.round(v) + 'M'; }

// ──────────────────────────────────────────────────────────────
// CASE STUDY SCENARIOS
// ──────────────────────────────────────────────────────────────

const SCENARIOS = {
  // PATTERN 1: Tezepelumab — broad mechanism vs hypothetical biomarker-restricted
  tezepelumab_broad: {
    label: 'Tezepelumab — broad mechanism (actual)',
    ta: 'Respiratory', currentStage: 'Phase III', wacc: 9.5,
    epi: { population: 335000000, prevalence: 0.6, pctChronic: 100, pctTreated: 80, pctAddressable: 40, wacPrice: 40000 },
    gtn: 35, wwMult: 1.5,
    competition: 'Saturated (5+ approved)', peakSharePct: 12,
    rampYears: 5, commercialLifeBase: 13, loeHaircutPct: 30,
    flagsOn: ['bic'],
  },
  tezepelumab_biomarker: {
    label: 'Tezepelumab — hypothetical biomarker-restricted (eos ≥150 enrichment)',
    ta: 'Respiratory', currentStage: 'Phase III', wacc: 9.5,
    epi: { population: 335000000, prevalence: 0.6, pctChronic: 100, pctTreated: 80, pctAddressable: 20, wacPrice: 44000 },  // smaller addressable (eos-defined subset), higher price (niche)
    gtn: 35, wwMult: 1.5,
    competition: 'Contested (3–4 approved)', peakSharePct: 18,  // more share in biomarker niche
    rampYears: 5, commercialLifeBase: 13, loeHaircutPct: 30,
    flagsOn: ['bic', 'biomarker'],
  },

  // PATTERN 2: Lecanemab — biomarker-enriched (actual) vs broad clinical AD (counterfactual)
  lecanemab_biomarker: {
    label: 'Lecanemab — amyloid-positive enrichment (actual)',
    ta: 'CNS / Neurology', currentStage: 'Phase III', wacc: 10.0,
    epi: { population: 335000000, prevalence: 0.376, pctChronic: 100, pctTreated: 60, pctAddressable: 50, wacPrice: 26000 },
    gtn: 35, wwMult: 1.5,
    competition: 'Lightly contested (1–2 incumbents)', peakSharePct: 45,
    rampYears: 5, commercialLifeBase: 13, loeHaircutPct: 30,
    flagsOn: ['btd', 'biomarker'],
  },
  lecanemab_broad: {
    label: 'Lecanemab — broad clinical AD (counterfactual, bapineuzumab/solanezumab strategy)',
    ta: 'CNS / Neurology', currentStage: 'Phase III', wacc: 10.0,
    // Broader clinical AD pool, ~3x larger (1.8% pop vs 0.376%)
    epi: { population: 335000000, prevalence: 1.8, pctChronic: 100, pctTreated: 60, pctAddressable: 50, wacPrice: 26000 },
    gtn: 35, wwMult: 1.5,
    competition: 'Lightly contested (1–2 incumbents)', peakSharePct: 45,
    rampYears: 5, commercialLifeBase: 13, loeHaircutPct: 30,
    flagsOn: ['btd'],
    // Signal dilution from ~30% amyloid-negative patients → Phase III success probability crashes
    // Override Ph3->NDA PoS to reflect what actually happened to bapineuzumab/solanezumab Ph3 trials
    posOverride: { p3_nda: 0.10 },  // historical anti-amyloid trials in unenriched populations failed Ph3 routinely
  },

  // PATTERN 3: Tafamidis — ATTR-CM biomarker-defined (actual) vs broad HF (counterfactual)
  tafamidis_biomarker: {
    label: 'Tafamidis — ATTR-CM biomarker-defined (actual)',
    ta: 'Cardiovascular', currentStage: 'Phase III', wacc: 9.0,
    epi: { population: 335000000, prevalence: 0.045, pctChronic: 100, pctTreated: 30, pctAddressable: 60, wacPrice: 240000 },
    gtn: 20, wwMult: 1.5,
    competition: 'Underserved / no incumbent', peakSharePct: 70,
    rampYears: 4, commercialLifeBase: 13, loeHaircutPct: 30,
    flagsOn: ['fic', 'orphan', 'biomarker'],
  },
  tafamidis_broad: {
    label: 'Tafamidis — hypothetical broad HF DMT (counterfactual)',
    ta: 'Cardiovascular', currentStage: 'Phase III', wacc: 9.0,
    // Broad HF: 6M US patients, commodity pricing, generic-dominated competition
    epi: { population: 335000000, prevalence: 1.8, pctChronic: 100, pctTreated: 75, pctAddressable: 20, wacPrice: 5000 },
    gtn: 40, wwMult: 1.5,
    competition: 'Saturated (5+ approved)', peakSharePct: 5,
    rampYears: 5, commercialLifeBase: 13, loeHaircutPct: 35,
    flagsOn: [],
    // For honesty: tafamidis mechanism only works in ATTR-CM (TTR amyloid). In broad HF most patients don't have TTR pathology.
    // We model this by lowering PoS (the drug wouldn't show effect in unenriched HF trial).
    posOverride: { p3_nda: 0.15 },
  },

  // PATTERN 4: Endpoint biomarker — same asset, different Phase III duration
  endpoint_standard: {
    label: 'Endpoint biomarker — Restoret-like asset, standard Phase III (2.5y)',
    ta: 'Ophthalmology', currentStage: 'Phase III', wacc: 10.0,
    epi: { population: 335000000, prevalence: 0.45, pctChronic: 100, pctTreated: 100, pctAddressable: 50, wacPrice: 15000 },
    gtn: 30, wwMult: 1.5,
    competition: 'Contested (3–4 approved)', peakSharePct: 22,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 30,
    flagsOn: ['fic'],
  },
  endpoint_accelerated_moderate: {
    label: 'Endpoint biomarker, moderate acceleration (Ph3 1.5y, NDA 0.5y = 1.5y compression)',
    ta: 'Ophthalmology', currentStage: 'Phase III', wacc: 10.0,
    epi: { population: 335000000, prevalence: 0.45, pctChronic: 100, pctTreated: 100, pctAddressable: 50, wacPrice: 15000 },
    gtn: 30, wwMult: 1.5,
    competition: 'Contested (3–4 approved)', peakSharePct: 22,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 30,
    flagsOn: ['fic'],
    phaseDurationOverride: { 'Phase III': 1.5, 'NDA/BLA': 0.5 },
  },
  endpoint_accelerated_aggressive: {
    label: 'Endpoint biomarker, aggressive acceleration (Ph3 1.0y, NDA 0.5y = 2.0y compression, oncology AA-style)',
    ta: 'Ophthalmology', currentStage: 'Phase III', wacc: 10.0,
    epi: { population: 335000000, prevalence: 0.45, pctChronic: 100, pctTreated: 100, pctAddressable: 50, wacPrice: 15000 },
    gtn: 30, wwMult: 1.5,
    competition: 'Contested (3–4 approved)', peakSharePct: 22,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 30,
    flagsOn: ['fic'],
    phaseDurationOverride: { 'Phase III': 1.0, 'NDA/BLA': 0.5 },
  },
};

// ──────────────────────────────────────────────────────────────
// Run all scenarios and print comparisons
// ──────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(110));
console.log('BIOMARKER CASE STUDIES — BioValue engine outputs');
console.log('='.repeat(110));

function runOne(key) {
  const p = SCENARIOS[key];
  const s = makeState(p);
  const r = rNPVatStage(s.currentStage, s, 1.0);
  const ca = commercialAdjustedRnpv(s);
  return { key, label: p.label, peak: r.peak, launchProb: r.launchProb, rnpv: r.rNPV, commAdj: ca };
}

function printRow(r) {
  console.log(`  ${r.label}`);
  console.log(`    Peak (WW Base):    ${fmt(r.peak)}`);
  console.log(`    Launch prob:        ${(r.launchProb * 100).toFixed(1)}%`);
  console.log(`    Asset rNPV:         ${fmt(r.rnpv)}`);
  console.log(`    Comm-adj rNPV:      ${fmt(r.commAdj)}`);
}

function compare(keyA, keyB, header) {
  console.log('\n' + '─'.repeat(110));
  console.log(header);
  console.log('─'.repeat(110));
  const a = runOne(keyA);
  const b = runOne(keyB);
  printRow(a);
  console.log('');
  printRow(b);
  const peakRatio = b.peak > 0 ? (a.peak / b.peak) : 0;
  const rnpvRatio = b.rnpv > 0 ? (a.rnpv / b.rnpv) : (a.rnpv > 0 ? Infinity : 0);
  console.log(`\n  Comparison:`);
  console.log(`    Peak ratio (A/B):        ${peakRatio.toFixed(2)}x`);
  console.log(`    Asset rNPV ratio (A/B):  ${rnpvRatio.toFixed(2)}x`);
  if (rnpvRatio > 0 && isFinite(rnpvRatio)) {
    const pct = (rnpvRatio - 1) * 100;
    console.log(`    Asset rNPV premium:      ${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% (A vs B)`);
  }
}

compare('tezepelumab_broad', 'tezepelumab_biomarker',
  'PATTERN 1 — Tezepelumab: broad mechanism (A) vs hypothetical biomarker-restricted (B)');

compare('lecanemab_biomarker', 'lecanemab_broad',
  'PATTERN 2 — Lecanemab: amyloid-enriched (A) vs broad clinical AD with signal dilution (B)');

compare('tafamidis_biomarker', 'tafamidis_broad',
  'PATTERN 3 — Tafamidis: ATTR-CM biomarker-defined (A) vs broad HF DMT (B, hypothetical)');

compare('endpoint_accelerated_moderate', 'endpoint_standard',
  'PATTERN 4a — Endpoint biomarker: moderate acceleration (1.5y compression) vs standard, same drug');

compare('endpoint_accelerated_aggressive', 'endpoint_standard',
  'PATTERN 4b — Endpoint biomarker: aggressive acceleration (2.0y compression, oncology AA-style) vs standard');

console.log('\n' + '='.repeat(110));
console.log('Summary table (paste into post):');
console.log('='.repeat(110));
console.log('| Pattern | Asset | Scenario | Peak | LoA | Asset rNPV | Comm-adj |');
console.log('|---------|-------|----------|------|-----|------------|----------|');
const keys = ['tezepelumab_broad', 'tezepelumab_biomarker', 'lecanemab_biomarker', 'lecanemab_broad', 'tafamidis_biomarker', 'tafamidis_broad', 'endpoint_standard', 'endpoint_accelerated_moderate', 'endpoint_accelerated_aggressive'];
keys.forEach(k => {
  const r = runOne(k);
  console.log(`| | | ${r.label.substring(0, 60)} | ${fmt(r.peak)} | ${(r.launchProb*100).toFixed(0)}% | ${fmt(r.rnpv)} | ${fmt(r.commAdj)} |`);
});
console.log('');
