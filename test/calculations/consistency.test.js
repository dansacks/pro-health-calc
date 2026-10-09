import { describe, it, expect } from 'vitest';
import { DEFAULT_INPUTS, FIXED_VALUES, STAFF_ROLES, calculateOutputs } from '../../src/calculations';
import { OPERATIONS } from '../support/catalog';
import { check } from '../support/check';
import { run } from '../support/scenarios';

describe('Every calculation is covered', () => {
  it('the app reports exactly the calculations described in the test catalog', ({ task }) => {
    const reported = Object.keys(calculateOutputs(DEFAULT_INPUTS)).sort();
    const described = Object.keys(OPERATIONS).sort();
    task.meta.operation = 'catalog';
    task.meta.expected = `${described.length} calculations`;
    task.meta.actual = `${reported.length} calculations`;
    expect(reported).toEqual(described);
  });

  it('the app has 10 staff roles', ({ task }) => {
    task.meta.operation = 'catalog';
    task.meta.expected = '10';
    task.meta.actual = String(STAFF_ROLES.length);
    expect(STAFF_ROLES).toHaveLength(10);
  });
});

// Expected values were calculated independently (outside this code base) from the default inputs
// and the published reference data. They guard against accidental changes to formulas or defaults.
describe('Results for the default inputs', () => {
  const golden = {
    laborCostBaseline: 845355.1545,
    laborCostProactive: 2239252.833,
    variableCostsBaseline: 56700,
    variableCostsProactive: 56700,
    totalCostBaseline: 902055.1545,
    totalCostProactive: 2295952.833,
    capRateBaseline: 28.702276775486826,
    capRateProactive: 73.05437294768997,
    capRateDifference: 44.35209617220315,
    hospitalSpendBaseline: 224.9377178860167,
    hospitalSpendProactive: 168.70328841451254,
    hospitalSpendDifference: -56.23442947150417,
    combinedSpendBaseline: 253.63999466150355,
    combinedSpendProactive: 241.7576613622025,
    combinedSpendDifference: -11.882333299301052,
    panelSizeDifference: 0,
    breakEvenOffset: 19.717500732659605,
    breakEvenPanelSize: 7152.003056840651,
  };

  it.for(Object.entries(golden))('%s = %s', ([key, expected], { task }) => {
    check(task, key, calculateOutputs(DEFAULT_INPUTS)[key], expected, 4);
  });
});

describe('Reference data and defaults', () => {
  it('hospital cost reference data by age band has not changed', ({ task }) => {
    task.meta.operation = 'hospitalSpendBaseline';
    task.meta.expected = '782.35 / 1510.87 / 2663.78 / 4349.76, MEPS factor 0.2716506';
    task.meta.actual = [
      FIXED_VALUES.hospitalCost0_18, FIXED_VALUES.hospitalCost19_44,
      FIXED_VALUES.hospitalCost45_64, FIXED_VALUES.hospitalCost65_plus,
    ].join(' / ') + `, MEPS factor ${FIXED_VALUES.mepsFactor}`;
    expect(FIXED_VALUES).toMatchObject({
      hospitalCost0_18: 782.35,
      hospitalCost19_44: 1510.87,
      hospitalCost45_64: 2663.78,
      hospitalCost65_plus: 4349.76,
      mepsFactor: 0.2716506,
    });
  });

  it('the default patient age mix adds up to 100%', ({ task }) => {
    const total = DEFAULT_INPUTS.age0_18 + DEFAULT_INPUTS.age19_44 + DEFAULT_INPUTS.age45_64 + DEFAULT_INPUTS.age65_plus;
    task.meta.operation = 'hospitalSpendBaseline';
    task.meta.expected = '100';
    task.meta.actual = String(total);
    expect(total).toBe(100);
  });

  it('every default input is a number', ({ task }) => {
    const bad = Object.entries(DEFAULT_INPUTS).filter(([, value]) => typeof value !== 'number' || Number.isNaN(value));
    task.meta.operation = 'catalog';
    task.meta.expected = 'no non-numeric defaults';
    task.meta.actual = bad.length ? bad.map(([key]) => key).join(', ') : 'no non-numeric defaults';
    expect(bad).toEqual([]);
  });
});

// Relationships that must hold for any inputs, checked over several different practices.
describe('Relationships between results', () => {
  const practices = [
    { name: 'default inputs', inputs: DEFAULT_INPUTS },
    { name: 'small rural practice', inputs: { ...DEFAULT_INPUTS, panelSizeBaseline: 800, panelSizeProactive: 1000, margin: 0, costPerPatient: 10, benefitRates: 30, hospitalCostOffset: 15 } },
    { name: 'large practice, high margin', inputs: { ...DEFAULT_INPUTS, panelSizeBaseline: 6000, panelSizeProactive: 5000, margin: 25, costPerPatient: 40, hospitalizationCosts: 350 } },
  ];

  it.for(practices)('total cost = labor + variable costs: $name', ({ inputs }, { task }) => {
    const o = calculateOutputs(inputs);
    check(task, 'totalCostBaseline', o.totalCostBaseline, o.laborCostBaseline + o.variableCostsBaseline);
    expect(o.totalCostProactive).toBeCloseTo(o.laborCostProactive + o.variableCostsProactive, 6);
  });

  it.for(practices)('combined difference = cap rate difference + hospital difference: $name', ({ inputs }, { task }) => {
    const o = calculateOutputs(inputs);
    check(task, 'combinedSpendDifference', o.combinedSpendDifference, o.capRateDifference + o.hospitalSpendDifference);
  });

  it.for(practices)('hospital difference = -(baseline hospital spend x offset%): $name', ({ inputs }, { task }) => {
    const o = calculateOutputs(inputs);
    check(task, 'hospitalSpendDifference', o.hospitalSpendDifference, -o.hospitalSpendBaseline * inputs.hospitalCostOffset / 100);
  });

  it.for(practices)('cap rate x 12 x patients x (1 - margin) = total cost: $name', ({ inputs }, { task }) => {
    const o = calculateOutputs(inputs);
    const yearlyBaseline = o.capRateBaseline * 12 * inputs.panelSizeBaseline * (1 - inputs.margin / 100);
    check(task, 'capRateBaseline', yearlyBaseline, o.totalCostBaseline, 4);
  });

  it('calculating twice with the same inputs gives the same answer', ({ task }) => {
    const first = calculateOutputs(DEFAULT_INPUTS);
    const second = calculateOutputs({ ...DEFAULT_INPUTS });
    task.meta.operation = 'catalog';
    task.meta.expected = 'identical results';
    task.meta.actual = JSON.stringify(first) === JSON.stringify(second) ? 'identical results' : 'different results';
    expect(second).toEqual(first);
  });

  it('does not modify the inputs it is given', ({ task }) => {
    const inputs = { ...DEFAULT_INPUTS };
    run(inputs);
    task.meta.operation = 'catalog';
    task.meta.expected = 'inputs unchanged';
    task.meta.actual = JSON.stringify(inputs) === JSON.stringify(DEFAULT_INPUTS) ? 'inputs unchanged' : 'inputs changed';
    expect(inputs).toEqual(DEFAULT_INPUTS);
  });
});
