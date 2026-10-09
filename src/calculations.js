// Pure calculation logic for the Proactive Care calculator. No React or DOM dependencies.

// Reference data used to estimate hospital + ED spending when the user does not supply it.
export const FIXED_VALUES = {
  hospitalCost0_18:     782.35,
  hospitalCost19_44:    1510.87,
  hospitalCost45_64:    2663.78,
  hospitalCost65_plus:  4349.76,
  hospitalCostAll:      2102.75,
  mepsFactor:           0.2716506,
};

// Staff roles that contribute to labor cost; salaries are shared by both teams.
export const STAFF_ROLES = [
  'familyMedicineDoctor',
  'npPa',
  'medicalAssistant',
  'athleticTrainer',
  'rn',
  'pharmacist',
  'healthCareSocialWorker',
  'mentalHealthProfessional',
  'clericalStaff',
  'communityHealthWorker',
];

export const DEFAULT_INPUTS = {

  // Current Team (Baseline)
  panelSizeBaseline: 2700,
  familyMedicineDoctorBaseline: 1,
  npPaBaseline: 0.5,
  medicalAssistantBaseline: 2,
  athleticTrainerBaseline: 0,
  rnBaseline: 0.5,
  pharmacistBaseline: 0,
  healthCareSocialWorkerBaseline: 0.25,
  mentalHealthProfessionalBaseline: 0.25,
  clericalStaffBaseline: 1,
  communityHealthWorkerBaseline: 0,

  // Proactive Team
  panelSizeProactive: 2700,
  hospitalCostOffset: 25,
  familyMedicineDoctorProactive: 1,
  npPaProactive: 1,
  medicalAssistantProactive: 4,
  athleticTrainerProactive: 1,
  rnProactive: 2,
  pharmacistProactive: 1,
  healthCareSocialWorkerProactive: 2,
  mentalHealthProfessionalProactive: 1,
  clericalStaffProactive: 2,
  communityHealthWorkerProactive: 3,
  benefitRatesProactive: 0.5,

  // Patient Severity
  hospitalizationCosts: 0,
  age0_18: 25,                    // 25.368
  age19_44: 31,                   // 31.306
  age45_64: 27,                   // 26.883
  age65_plus: 17,                 // 16.441    <-- round to 17 so the sum is 100?

  // Financial Information
  benefitRates: 50,
  margin: 3.0,
  costPerPatient: 21,

  // Salaries
  familyMedicineDoctorSalary: 267373.01,
  npPaSalary: 137418.67,
  medicalAssistantSalary: 46555.78,
  athleticTrainerSalary: 66585.592,
  rnSalary: 102470.6,
  pharmacistSalary: 142842.54,
  healthCareSocialWorkerSalary: 74986.87,
  mentalHealthProfessionalSalary: 67772.39,
  clericalStaffSalary: 47451.083,
  communityHealthWorkerSalary: 58267.598,
};

const laborCost = (inputs, suffix) =>
  STAFF_ROLES.reduce((sum, role) => sum + inputs[`${role}${suffix}`] * inputs[`${role}Salary`], 0)
  * (1 + (inputs.benefitRates / 100));

export const calculateOutputs = (inputs, fixed = FIXED_VALUES) => {

  const laborCostBaseline       = laborCost(inputs, 'Baseline');
  const laborCostProactive      = laborCost(inputs, 'Proactive');

  const variableCostsBaseline   = inputs.costPerPatient * inputs.panelSizeBaseline;
  const variableCostsProactive  = inputs.costPerPatient * inputs.panelSizeProactive;

  const totalCostBaseline       = laborCostBaseline + variableCostsBaseline;
  const totalCostProactive      = laborCostProactive + variableCostsProactive;

  const capRateBaseline         = (totalCostBaseline / ((1 - inputs.margin / 100) * inputs.panelSizeBaseline) / 12);
  const capRateProactive        = (totalCostProactive / ((1 - inputs.margin / 100) * inputs.panelSizeProactive) / 12);
  const capRateDifference       = (capRateProactive - capRateBaseline);

  // Excel: =IF(hosp_cost_input=0,C18,hosp_cost_input)
  const hospitalSpendBaseline   = inputs.hospitalizationCosts === 0
    ? (inputs.age0_18 * fixed.hospitalCost0_18 + inputs.age19_44 * fixed.hospitalCost19_44 + inputs.age45_64 * fixed.hospitalCost45_64 + inputs.age65_plus * fixed.hospitalCost65_plus) / (1200) * (1 + fixed.mepsFactor)
    : inputs.hospitalizationCosts;
  const hospitalSpendProactive  = (hospitalSpendBaseline * (1 - inputs.hospitalCostOffset / 100));
  const hospitalSpendDifference = (hospitalSpendProactive - hospitalSpendBaseline);

  const combinedSpendBaseline   = (capRateBaseline + hospitalSpendBaseline);
  const combinedSpendProactive  = (capRateProactive + hospitalSpendProactive);
  const combinedSpendDifference = (combinedSpendProactive - combinedSpendBaseline);

  const panelSizeDifference     = inputs.panelSizeProactive - inputs.panelSizeBaseline;

  const breakEvenOffset         = capRateDifference / hospitalSpendBaseline * 100;
  const breakEvenPanelSize      = inputs.panelSizeBaseline * laborCostProactive / laborCostBaseline;

  return {
    laborCostBaseline,
    laborCostProactive,
    variableCostsBaseline,
    variableCostsProactive,
    totalCostBaseline,
    totalCostProactive,
    capRateBaseline,
    capRateProactive,
    capRateDifference,
    hospitalSpendBaseline,
    hospitalSpendProactive,
    hospitalSpendDifference,
    combinedSpendBaseline,
    combinedSpendProactive,
    combinedSpendDifference,
    panelSizeDifference,
    breakEvenOffset,
    breakEvenPanelSize,
  };
};

// Break-even offset (%) if the proactive panel were `x` times the baseline panel size; plotted by the chart.
export const calculateBreakEvenOffsetAt = (x, inputs, outputs) =>
  Number(((((outputs.laborCostProactive + (inputs.costPerPatient * inputs.panelSizeBaseline * x)) / ((1 - inputs.margin / 100) * inputs.panelSizeBaseline * x) / 12) - outputs.capRateBaseline) / outputs.hospitalSpendBaseline * 100).toFixed(2));
