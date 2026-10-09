// Plain-English description of every calculation the app performs.
// The test reporter uses this to build the human-readable report, and a test
// fails if a calculation is added to the app without an entry here.

export const OPERATIONS = {
  laborCostBaseline: {
    title: 'Labor cost, current (baseline) team',
    formula: 'Sum of (FTE x salary) for the 10 staff roles, times (1 + benefit rate)',
    unit: 'dollars per year',
  },
  laborCostProactive: {
    title: 'Labor cost, proactive team',
    formula: 'Sum of (FTE x salary) for the 10 staff roles, times (1 + benefit rate)',
    unit: 'dollars per year',
  },
  variableCostsBaseline: {
    title: 'Non-labor (variable) costs, baseline',
    formula: 'Cost per patient x baseline panel size',
    unit: 'dollars per year',
  },
  variableCostsProactive: {
    title: 'Non-labor (variable) costs, proactive',
    formula: 'Cost per patient x proactive panel size',
    unit: 'dollars per year',
  },
  totalCostBaseline: {
    title: 'Total cost, baseline',
    formula: 'Labor cost + variable costs',
    unit: 'dollars per year',
  },
  totalCostProactive: {
    title: 'Total cost, proactive',
    formula: 'Labor cost + variable costs',
    unit: 'dollars per year',
  },
  capRateBaseline: {
    title: 'Primary care capitation rate, baseline',
    formula: 'Total cost / ((1 - margin%) x panel size) / 12',
    unit: 'dollars per member per month',
  },
  capRateProactive: {
    title: 'Primary care capitation rate, proactive',
    formula: 'Total cost / ((1 - margin%) x panel size) / 12',
    unit: 'dollars per member per month',
  },
  capRateDifference: {
    title: 'Capitation rate difference',
    formula: 'Proactive cap rate - baseline cap rate',
    unit: 'dollars per member per month',
  },
  hospitalSpendBaseline: {
    title: 'Hospital + ED spending, baseline',
    formula: 'If hospitalization cost entered: that value. Otherwise: age-mix weighted cost / 1200 x (1 + MEPS factor)',
    unit: 'dollars per member per month',
  },
  hospitalSpendProactive: {
    title: 'Hospital + ED spending, proactive',
    formula: 'Baseline hospital spending x (1 - offset%)',
    unit: 'dollars per member per month',
  },
  hospitalSpendDifference: {
    title: 'Hospital + ED spending difference',
    formula: 'Proactive hospital spending - baseline hospital spending',
    unit: 'dollars per member per month',
  },
  combinedSpendBaseline: {
    title: 'Combined spending, baseline',
    formula: 'Baseline cap rate + baseline hospital spending',
    unit: 'dollars per member per month',
  },
  combinedSpendProactive: {
    title: 'Combined spending, proactive',
    formula: 'Proactive cap rate + proactive hospital spending',
    unit: 'dollars per member per month',
  },
  combinedSpendDifference: {
    title: 'Combined spending difference',
    formula: 'Proactive combined spending - baseline combined spending',
    unit: 'dollars per member per month',
  },
  panelSizeDifference: {
    title: 'Panel size difference',
    formula: 'Proactive panel size - baseline panel size',
    unit: 'patients',
  },
  breakEvenOffset: {
    title: 'Break-even hospital spending offset',
    formula: 'Cap rate difference / baseline hospital spending x 100',
    unit: 'percent',
  },
  breakEvenPanelSize: {
    title: 'Break-even panel size',
    formula: 'Baseline panel size x proactive labor cost / baseline labor cost',
    unit: 'patients',
  },
};

// Calculations that live outside calculateOutputs().
export const SUPPORTING_OPERATIONS = {
  breakEvenCurve: {
    title: 'Chart: break-even offset at a different panel size',
    formula: '((proactive labor + cost per patient x baseline panel x x) / ((1 - margin%) x baseline panel x x) / 12 - baseline cap rate) / baseline hospital spending x 100, rounded to 2 decimals',
    unit: 'percent',
  },
  sumOfFields: {
    title: 'Input form: total of a group of fields',
    formula: 'Add the values of the fields, show 2 decimals (used for the patient age mix total)',
    unit: 'number',
  },
  parseNumberInput: {
    title: 'Input form: convert typed text to a number',
    formula: 'Read the text as a number; blank or non-numeric text becomes 0',
    unit: 'number',
  },
};

export const ALL_OPERATIONS = { ...OPERATIONS, ...SUPPORTING_OPERATIONS };
