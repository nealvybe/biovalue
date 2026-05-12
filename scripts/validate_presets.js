#!/usr/bin/env node
// Validates all 7 preset deals against the BioValue engine.
// Extracts the engine logic from /web/index.html and runs each preset through it.
// Outputs a markdown-ready table for the calibration data sub-tab.

const PoSTable = {
  'Oncology (all)':            { unselected: { p1_2: 0.584, p2_3: 0.270, p3_nda: 0.658, nda_app: 0.910 }, biomarker: { p1_2: 0.707, p2_3: 0.313, p3_nda: 0.601, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Anticancer' },
  'Oncology (IO / targeted)':  { unselected: { p1_2: 0.584, p2_3: 0.270, p3_nda: 0.658, nda_app: 0.910 }, biomarker: { p1_2: 0.707, p2_3: 0.313, p3_nda: 0.601, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Anticancer' },
  'Hematology':                { unselected: { p1_2: 0.743, p2_3: 0.661, p3_nda: 0.873, nda_app: 0.910 }, biomarker: { p1_2: 0.800, p2_3: 0.489, p3_nda: 0.806, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Blood and Clotting' },
  'Rare Disease':              { unselected: { p1_2: 0.680, p2_3: 0.550, p3_nda: 0.659, nda_app: 0.910 }, biomarker: { p1_2: 0.820, p2_3: 0.730, p3_nda: 0.791, nda_app: 0.910 }, biomarkerEst: true,  alphaTa: null },
  'Immunology / Inflammation': { unselected: { p1_2: 0.658, p2_3: 0.560, p3_nda: 0.827, nda_app: 0.910 }, biomarker: { p1_2: 0.674, p2_3: 0.349, p3_nda: 0.687, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Immunological' },
  'CNS / Neurology':           { unselected: { p1_2: 0.672, p2_3: 0.454, p3_nda: 0.685, nda_app: 0.910 }, biomarker: { p1_2: 0.660, p2_3: 0.343, p3_nda: 0.511, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Neurological' },
  'Cardiovascular':            { unselected: { p1_2: 0.730, p2_3: 0.570, p3_nda: 0.678, nda_app: 0.910 }, biomarker: { p1_2: 0.793, p2_3: 0.503, p3_nda: 0.748, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Cardiovascular' },
  'Infectious Disease':        { unselected: { p1_2: 0.711, p2_3: 0.601, p3_nda: 0.809, nda_app: 0.910 }, biomarker: { p1_2: 0.770, p2_3: 0.496, p3_nda: 0.851, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Anti-infective' },
  'Cell & Gene Therapy':       { unselected: { p1_2: 0.580, p2_3: 0.410, p3_nda: 0.433, nda_app: 0.910 }, biomarker: { p1_2: 0.740, p2_3: 0.590, p3_nda: 0.579, nda_app: 0.910 }, biomarkerEst: true,  alphaTa: null },
  'Rheumatology':              { unselected: { p1_2: 0.683, p2_3: 0.580, p3_nda: 0.771, nda_app: 0.910 }, biomarker: { p1_2: 0.778, p2_3: 0.480, p3_nda: 0.746, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Musculoskeletal' },
  'Endocrine / Metabolic':     { unselected: { p1_2: 0.754, p2_3: 0.605, p3_nda: 0.950, nda_app: 0.910 }, biomarker: { p1_2: 1.000, p2_3: 0.833, p3_nda: 0.549, nda_app: 0.910 }, biomarkerEst: true,  alphaTa: 'Hormonal (excluding sex hormones)' },
  'Respiratory':               { unselected: { p1_2: 0.714, p2_3: 0.414, p3_nda: 0.681, nda_app: 0.910 }, biomarker: { p1_2: 0.729, p2_3: 0.286, p3_nda: 0.675, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Respiratory' },
  'Dermatology':               { unselected: { p1_2: 0.774, p2_3: 0.445, p3_nda: 0.779, nda_app: 0.910 }, biomarker: { p1_2: 0.704, p2_3: 0.409, p3_nda: 0.930, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Dermatological' },
  'GI / Hepatology':           { unselected: { p1_2: 0.665, p2_3: 0.477, p3_nda: 0.743, nda_app: 0.910 }, biomarker: { p1_2: 0.699, p2_3: 0.368, p3_nda: 0.733, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Alimentary/Metabolic' },
  'Nephrology':                { unselected: { p1_2: 0.752, p2_3: 0.545, p3_nda: 0.770, nda_app: 0.910 }, biomarker: { p1_2: 0.818, p2_3: 0.433, p3_nda: 0.676, nda_app: 0.910 }, biomarkerEst: true,  alphaTa: 'Genitourinary (including sex hormones)' },
  'Ophthalmology':             { unselected: { p1_2: 0.823, p2_3: 0.525, p3_nda: 0.766, nda_app: 0.910 }, biomarker: { p1_2: 0.925, p2_3: 0.365, p3_nda: 0.733, nda_app: 0.910 }, biomarkerEst: true,  alphaTa: 'Sensory' },
  "Women's Health":            { unselected: { p1_2: 0.752, p2_3: 0.545, p3_nda: 0.770, nda_app: 0.910 }, biomarker: { p1_2: 0.818, p2_3: 0.433, p3_nda: 0.676, nda_app: 0.910 }, biomarkerEst: true,  alphaTa: 'Genitourinary (including sex hormones)' },
  'Vaccines':                  { unselected: { p1_2: 0.750, p2_3: 0.600, p3_nda: 0.778, nda_app: 0.910 }, biomarker: { p1_2: 0.830, p2_3: 0.740, p3_nda: 0.857, nda_app: 0.910 }, biomarkerEst: true,  alphaTa: null },
  'Psychiatry':                { unselected: { p1_2: 0.672, p2_3: 0.454, p3_nda: 0.685, nda_app: 0.910 }, biomarker: { p1_2: 0.660, p2_3: 0.343, p3_nda: 0.511, nda_app: 0.910 }, biomarkerEst: false, alphaTa: 'Neurological' },
};

const STAGES = ['Preclinical', 'Phase I', 'Phase II', 'Phase III', 'NDA/BLA', 'Approved'];
const PRECLIN_P1 = 0.60;
const DEFAULT_PHASE_DURATION = { 'Preclinical': 4.0, 'Phase I': 1.5, 'Phase II': 2.5, 'Phase III': 2.5, 'NDA/BLA': 1.0 };
const DEFAULT_PHASE_COST     = { 'Preclinical': 5,   'Phase I': 25,  'Phase II': 60,  'Phase III': 300, 'NDA/BLA': 15 };

const FLAGS = [
  { id: 'btd',         category: 'Regulatory', name: 'BTD',
    effects: { posFailReduction: { p2_3: 0.23, p3_nda: 0.10 }, rampYearsDelta: -0.5 } },
  { id: 'fastTrack',   category: 'Regulatory', name: 'Fast Track',
    effects: { posFailReduction: { nda_app: 0.20 } } },
  { id: 'accApproval', category: 'Regulatory', name: 'Accelerated',
    effects: { posFailReduction: { p2_3: 0.10 }, ph3DurationPctDelta: -0.20, ph3CostPctDelta: -0.25, posFailIncrease: { nda_app: 0.05 } } },
  { id: 'orphan',      category: 'Regulatory', name: 'Orphan',
    effects: { posFailReduction: { p2_3: 0.10 }, pricePremiumPct: 35, lifeYearsDelta: 2 } },
  { id: 'rpd',         category: 'Regulatory', name: 'RPD',
    effects: { posFailReduction: { p2_3: 0.10 }, lifeYearsDelta: 0.5 } },
  { id: 'prvHeld',     category: 'Regulatory', name: 'PRV held',
    effects: { ndaDurationPctDelta: -0.25 } },
  { id: 'biomarker',   category: 'Trial design', name: 'Biomarker',
    effects: { biomarkerReplace: true } },
  { id: 'singleArm',   category: 'Trial design', name: 'Single-arm',
    effects: { ph3DurationPctDelta: -0.60, ph3CostPctDelta: -0.50, posFailIncrease: { nda_app: 0.10 } } },
  { id: 'adaptive',    category: 'Trial design', name: 'Adaptive',
    effects: { ph2DurationPctDelta: -0.20, ph3DurationPctDelta: -0.20 } },
  { id: 'fic',         category: 'Mechanism', name: 'FIC', exclusiveGroup: 'mechanism',
    effects: { posFailIncrease: { p2_3: 0.05 }, pricePremiumPct: 15 } },
  { id: 'bic',         category: 'Mechanism', name: 'BIC', exclusiveGroup: 'mechanism',
    effects: { pricePremiumPct: 10, shareBoostPct: 25 } },
  { id: 'precedented', category: 'Mechanism', name: 'Precedented', exclusiveGroup: 'mechanism',
    effects: { posFailReduction: { p1_2: 0.10, p2_3: 0.10, p3_nda: 0.10 } } },
  { id: 'comboSoc',    category: 'Mechanism', name: 'Combo SoC',
    effects: { rampYearsDelta: -0.5 } },
  { id: 'oralVsInj',   category: 'Administration', name: 'Oral', exclusiveGroup: 'admin',
    effects: { pricePremiumPct: 40 } },
  { id: 'scVsIv',      category: 'Administration', name: 'SC', exclusiveGroup: 'admin',
    effects: { pricePremiumPct: 15 } },
  { id: 'longActing',  category: 'Administration', name: 'Long-acting', exclusiveGroup: 'admin',
    effects: { pricePremiumPct: 20 } },
  { id: 'onceDaily',   category: 'Administration', name: 'Once-daily',
    effects: { pricePremiumPct: 15 } },
  { id: 'cmcComplex',  category: 'Risk', name: 'CMC complex',
    effects: { rdCostPctDelta: 25, rampYearsDelta: 1 } },
  { id: 'iraExposure', category: 'Risk', name: 'IRA exposure',
    effects: { lifeYearsDelta: -1 } },
];

const COMPETITION = {
  'Underserved / no incumbent':       { peakShare: 0.45 },
  'Lightly contested (1–2 incumbents)': { peakShare: 0.25 },
  'Contested (3–4 approved)':         { peakShare: 0.12 },
  'Saturated (5+ approved)':          { peakShare: 0.06 },
};

const CAP_POS_PER_TRANSITION = 0.90;
const CAP_PRICE_PREMIUM_PCT  = 50;
const CAP_LIFE_YEARS_DELTA   = 5;
const CAP_RD_COST_PCT_DELTA  = 50;

const DEAL_PRESETS = {
  pozdeutinurad: {
    label: 'Sobi / Arthrosi — Pozdeutinurad',
    ta: 'Rheumatology', currentStage: 'Phase III', wacc: 9.5,
    epi: { population: 335000000, prevalence: 3.9, pctChronic: 13, pctTreated: 12, pctAddressable: 25, wacPrice: 24000 },
    gtn: 25, wwMult: 1.5, competition: 'Lightly contested (1–2 incumbents)', peakSharePct: 35,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 45,
    dealUpfront_M: 950, dealMilestones_M: 550, dealMilestoneRegPct: 60, dealSalesProb: 70, royalty: 0,
    flagsOn: ['oralVsInj'],
  },
  abelacimab: {
    label: 'Novartis / Anthos — Abelacimab',
    ta: 'Cardiovascular', currentStage: 'Phase III', wacc: 9.5,
    epi: { population: 335000000, prevalence: 2.0, pctChronic: 80, pctTreated: 75, pctAddressable: 20, wacPrice: 8000 },
    gtn: 40, wwMult: 1.5, competition: 'Contested (3–4 approved)', peakSharePct: 22,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 30,
    dealUpfront_M: 925, dealMilestones_M: 2150, dealMilestoneRegPct: 50, dealSalesProb: 70, royalty: 0,
    flagsOn: ['bic'],
  },
  restoret: {
    label: 'Merck / EyeBio — Restoret',
    ta: 'Ophthalmology', currentStage: 'Phase II', wacc: 10.0,
    epi: { population: 335000000, prevalence: 0.45, pctChronic: 100, pctTreated: 100, pctAddressable: 50, wacPrice: 15000 },
    gtn: 30, wwMult: 1.5, competition: 'Contested (3–4 approved)', peakSharePct: 22,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 30,
    dealUpfront_M: 1300, dealMilestones_M: 1700, dealMilestoneRegPct: 50, dealSalesProb: 70, royalty: 0,
    flagsOn: ['fic'],
  },
  efimosfermin: {
    label: 'GSK / Boston — Efimosfermin',
    ta: 'GI / Hepatology', currentStage: 'Phase III', wacc: 9.0,
    epi: { population: 335000000, prevalence: 1.5, pctChronic: 100, pctTreated: 30, pctAddressable: 45, wacPrice: 15000 },
    gtn: 30, wwMult: 1.5, competition: 'Lightly contested (1–2 incumbents)', peakSharePct: 14,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 35,
    dealUpfront_M: 1200, dealMilestones_M: 800, dealMilestoneRegPct: 50, dealSalesProb: 70, royalty: 0,
    flagsOn: ['bic'],
  },
  farabursen: {
    label: 'Novartis / Regulus — Farabursen',
    ta: 'Nephrology', currentStage: 'Phase III', wacc: 9.5,
    epi: { population: 335000000, prevalence: 0.042, pctChronic: 100, pctTreated: 100, pctAddressable: 60, wacPrice: 30000 },
    gtn: 20, wwMult: 1.5, competition: 'Underserved / no incumbent', peakSharePct: 33,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 25,
    dealUpfront_M: 800, dealMilestones_M: 900, dealMilestoneRegPct: 100, dealSalesProb: 70, royalty: 0,
    flagsOn: ['fic', 'orphan'],
  },
  isb2001: {
    label: 'AbbVie / IGI — ISB 2001',
    ta: 'Hematology', currentStage: 'Phase II', wacc: 10.5,
    epi: { population: 335000000, prevalence: 0.009, pctChronic: 100, pctTreated: 100, pctAddressable: 80, wacPrice: 250000 },
    gtn: 25, wwMult: 1.5, competition: 'Contested (3–4 approved)', peakSharePct: 32,
    rampYears: 4, commercialLifeBase: 12, loeHaircutPct: 35,
    dealUpfront_M: 700, dealMilestones_M: 1225, dealMilestoneRegPct: 55, dealSalesProb: 70, royalty: 14,
    flagsOn: ['fic', 'fastTrack', 'biomarker'],
  },
  vg3927: {
    label: 'Sanofi / Vigil — VG-3927',
    ta: 'CNS / Neurology', currentStage: 'Phase II', wacc: 12.0,
    epi: { population: 335000000, prevalence: 1.8, pctChronic: 100, pctTreated: 60, pctAddressable: 30, wacPrice: 25000 },
    gtn: 35, wwMult: 1.5, competition: 'Underserved / no incumbent', peakSharePct: 5,
    rampYears: 5, commercialLifeBase: 12, loeHaircutPct: 40,
    dealUpfront_M: 470, dealMilestones_M: 120, dealMilestoneRegPct: 0, dealSalesProb: 70, royalty: 0,
    flagsOn: ['fic'],
  },
};

function defaultFlags() { const o = {}; FLAGS.forEach(f => { o[f.id] = { on: false, mag: 1.0 }; }); return o; }
function defaultPhase() { const dur = {}, cost = {}; Object.keys(DEFAULT_PHASE_DURATION).forEach(s => { dur[s] = DEFAULT_PHASE_DURATION[s]; cost[s] = DEFAULT_PHASE_COST[s]; }); return { duration: dur, cost }; }

function applyPreset(key) {
  const p = DEAL_PRESETS[key];
  const s = {
    ta: p.ta, currentStage: p.currentStage, wacc: p.wacc,
    epi: Object.assign({}, p.epi),
    gtn: p.gtn, wwMult: p.wwMult,
    competition: p.competition, peakSharePct: p.peakSharePct,
    rampYears: p.rampYears, commercialLifeBase: p.commercialLifeBase, loeHaircutPct: p.loeHaircutPct,
    dealUpfront_M: p.dealUpfront_M, dealMilestones_M: p.dealMilestones_M,
    dealMilestoneRegPct: p.dealMilestoneRegPct, dealSalesProb: p.dealSalesProb,
    royalty: p.royalty || 0,
    posOverride: { p1_2: null, p2_3: null, p3_nda: null, nda_app: null },
    phase: defaultPhase(), flags: defaultFlags(),
  };
  (p.flagsOn || []).forEach(fid => { if (s.flags[fid]) s.flags[fid].on = true; });
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
  const capped = Math.min(premPct, CAP_PRICE_PREMIUM_PCT);
  return net * (1 + capped / 100);
}

function computeEffectiveLife(s) {
  let life = s.commercialLifeBase;
  let delta = 0;
  activeFlags(s).forEach(flag => {
    if (flag.effects.lifeYearsDelta) delta += flag.effects.lifeYearsDelta * s.flags[flag.id].mag;
  });
  const positiveDelta = Math.max(0, delta);
  const negativeDelta = Math.min(0, delta);
  return Math.max(1, life + Math.min(positiveDelta, CAP_LIFE_YEARS_DELTA) + negativeDelta);
}

function computeEffectiveRamp(s) {
  let r = s.rampYears;
  activeFlags(s).forEach(flag => {
    if (flag.effects.rampYearsDelta) r += flag.effects.rampYearsDelta * s.flags[flag.id].mag;
  });
  return Math.max(1, r);
}

function computeRdCostMultiplier(s) {
  let pct = 0;
  activeFlags(s).forEach(flag => { if (flag.effects.rdCostPctDelta) pct += flag.effects.rdCostPctDelta * s.flags[flag.id].mag; });
  return 1 + Math.min(pct, CAP_RD_COST_PCT_DELTA) / 100;
}

function computeEffectivePhaseDurations(s) {
  const dur = Object.assign({}, s.phase.duration);
  activeFlags(s).forEach(flag => {
    const mag = s.flags[flag.id].mag;
    if (flag.effects.ph2DurationPctDelta) dur['Phase II']  = Math.max(0.5, dur['Phase II']  * (1 + flag.effects.ph2DurationPctDelta * mag));
    if (flag.effects.ph3DurationPctDelta) dur['Phase III'] = Math.max(0.5, dur['Phase III'] * (1 + flag.effects.ph3DurationPctDelta * mag));
    if (flag.effects.ndaDurationPctDelta) dur['NDA/BLA']   = Math.max(0.25, dur['NDA/BLA'] * (1 + flag.effects.ndaDurationPctDelta * mag));
  });
  return dur;
}

function computeEffectivePhaseCosts(s) {
  const cost = Object.assign({}, s.phase.cost);
  const m = computeRdCostMultiplier(s);
  Object.keys(cost).forEach(k => { cost[k] = cost[k] * m; });
  activeFlags(s).forEach(flag => {
    const mag = s.flags[flag.id].mag;
    if (flag.effects.ph3CostPctDelta) cost['Phase III'] = Math.max(0, cost['Phase III'] * (1 + flag.effects.ph3CostPctDelta * mag));
  });
  return cost;
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
  const company = peak;

  const phaseDur = computeEffectivePhaseDurations(s);
  const phaseCost = computeEffectivePhaseCosts(s);

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
    commPV += (company * frac) / Math.pow(1 + r, t);
  }
  return { rNPV: launchProb * commPV - rdCostPV, rdCostPV, commPV: launchProb * commPV, launchProb, yearsToLaunch };
}

const COMM_ADJ_WACC = 14.0;
const COMM_ADJ_PEAK_RETAIN = 0.60;
const COMM_ADJ_COMM_POS = 0.85;
function commercialAdjustedRnpv(s) {
  const adjState = Object.assign({}, s, { wacc: COMM_ADJ_WACC });
  const res = rNPVatStage(s.currentStage, adjState, COMM_ADJ_PEAK_RETAIN);
  return res.commPV * COMM_ADJ_COMM_POS - res.rdCostPV;
}

function dealPV(s, rnpvRes) {
  const r = s.wacc / 100;
  const launchProb = rnpvRes.launchProb;
  const ytl = rnpvRes.yearsToLaunch;
  const totalMs = s.dealMilestones_M || 0;
  const regPct = (s.dealMilestoneRegPct || 0) / 100;
  const salesProb = (s.dealSalesProb || 70) / 100;
  const regPool = totalMs * regPct;
  const salesPool = totalMs * (1 - regPct);
  const upfront = s.dealUpfront_M || 0;
  const regPV = launchProb > 0 ? (regPool * launchProb / Math.pow(1 + r, ytl)) : 0;
  const salesPV = launchProb > 0 ? (salesPool * launchProb * salesProb / Math.pow(1 + r, ytl + 4)) : 0;
  const royaltyRate = (s.royalty || 0) / 100;
  const royaltyPV = royaltyRate > 0 ? rnpvRes.commPV * royaltyRate : 0;
  return { upfront, regPV, salesPV, royaltyPV, total: upfront + regPV + salesPV + royaltyPV };
}

function fmtM(v) { if (Math.abs(v) >= 1000) return '$' + (v/1000).toFixed(2) + 'B'; return '$' + Math.round(v) + 'M'; }

const keys = Object.keys(DEAL_PRESETS);
console.log('\nValidation: All 7 presets post-royalty-refactor');
console.log('='.repeat(115));
console.log(['Deal', 'Stage', 'Asset rNPV', 'Comm-adj', 'Upfront', 'Reg PV', 'Sales PV', 'Royalty PV', 'Deal PV', 'Deal/rNPV'].map(x => x.padEnd(11)).join(' | '));
console.log('-'.repeat(115));
const rows = [];
for (const k of keys) {
  const s = applyPreset(k);
  const baseR = rNPVatStage(s.currentStage, s, 1.0);
  const ca = commercialAdjustedRnpv(s);
  const dp = dealPV(s, baseR);
  const pct = baseR.rNPV > 0 ? (dp.total / baseR.rNPV * 100) : 0;
  rows.push({ k, label: DEAL_PRESETS[k].label, stage: s.currentStage, rnpv: baseR.rNPV, commAdj: ca, upfront: dp.upfront, regPV: dp.regPV, salesPV: dp.salesPV, royaltyPV: dp.royaltyPV, dealPV: dp.total, pct });
  console.log([
    k.padEnd(11), s.currentStage.padEnd(11),
    fmtM(baseR.rNPV).padEnd(11), fmtM(ca).padEnd(11),
    fmtM(dp.upfront).padEnd(11), fmtM(dp.regPV).padEnd(11),
    fmtM(dp.salesPV).padEnd(11), fmtM(dp.royaltyPV).padEnd(11),
    fmtM(dp.total).padEnd(11), (pct.toFixed(0)+'%').padEnd(11)
  ].join(' | '));
}

console.log('\nCalibration table rows (HTML-ready):');
rows.forEach(r => {
  console.log(`<tr><td>${DEAL_PRESETS[r.k].label}</td><td>${r.stage}</td><td class="right">${fmtM(r.rnpv)}</td><td class="right">${fmtM(r.commAdj)}</td><td class="right">${fmtM(r.dealPV)}</td><td class="right">${r.pct.toFixed(0)}%</td></tr>`);
});

const dpPcts = rows.map(r => r.pct).sort((a,b)=>a-b);
const median = dpPcts[Math.floor(dpPcts.length/2)];
console.log(`\nMedian Deal PV / Asset rNPV across ${rows.length} deals: ${median.toFixed(0)}%`);
