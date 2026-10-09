import { describe, it, expect } from 'vitest';
import { OPERATIONS } from '../support/catalog';
import { check } from '../support/check';
import { run, staff, salaries, PCP } from '../support/scenarios';

// Baseline team: 1 physician. Proactive team: 2 physicians. Physician salary $120,000.
// With 1,000 patients and no margin the cap rates are $10 (baseline) and $20 (proactive).
const ONE_TO_TWO = {
  ...staff('Baseline', { [PCP]: 1 }),
  ...staff('Proactive', { [PCP]: 2 }),
  ...salaries({ [PCP]: 120000 }),
};
const SAME_TEAM = {
  ...staff('Baseline', { [PCP]: 1 }),
  ...staff('Proactive', { [PCP]: 1 }),
  ...salaries({ [PCP]: 120000 }),
};
const MIX_25_EACH = { age0_18: 25, age19_44: 25, age45_64: 25, age65_plus: 25 };

describe(OPERATIONS.combinedSpendBaseline.title, () => {
  const cases = [
    { name: 'cap rate $10 + hospital $200 = $210', setup: { ...ONE_TO_TWO, hospitalizationCosts: 200 }, expected: 210 },
    { name: 'no staff ($0 cap rate) + age-mix hospital $125 = $125', setup: { age0_18: 100 }, expected: 125 },
    {
      name: '50% margin (cap rate $20) + age-mix hospital $312.50 = $332.50',
      setup: { ...ONE_TO_TWO, margin: 50, ...MIX_25_EACH },
      expected: 332.5,
    },
    {
      name: 'the offset does not change the baseline: still $210 with a 40% offset',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200, hospitalCostOffset: 40 },
      expected: 210,
    },
    {
      name: 'EDGE: a 100% margin makes the cap rate Infinity, so the total is Infinity',
      setup: { ...ONE_TO_TWO, margin: 100, hospitalizationCosts: 200 },
      expected: Infinity,
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'combinedSpendBaseline', run(setup).combinedSpendBaseline, expected);
  });
});

describe(OPERATIONS.combinedSpendProactive.title, () => {
  const cases = [
    {
      name: 'cap rate $20 + hospital $200 x 0.75 = $170',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200, hospitalCostOffset: 25 },
      expected: 170,
    },
    {
      name: 'a 0% offset: $20 + $200 = $220',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200, hospitalCostOffset: 0 },
      expected: 220,
    },
    {
      name: 'a 100% offset: $20 + $0 = $20',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200, hospitalCostOffset: 100 },
      expected: 20,
    },
    {
      name: 'no staff and a 50% offset on age-mix hospital $125: $0 + $62.50',
      setup: { age0_18: 100, hospitalCostOffset: 50 },
      expected: 62.5,
    },
    {
      name: 'EDGE: a panel size of 0 makes the proactive cap rate Infinity',
      setup: { ...ONE_TO_TWO, panelSizeProactive: 0, hospitalizationCosts: 200 },
      expected: Infinity,
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'combinedSpendProactive', run(setup).combinedSpendProactive, expected);
  });
});

describe(OPERATIONS.combinedSpendDifference.title, () => {
  const cases = [
    {
      name: '1 to 2 physicians with a 25% offset on $200: ($20 + $150) - ($10 + $200) = -$40',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200, hospitalCostOffset: 25 },
      expected: -40,
    },
    {
      name: 'same team and no offset: no difference ($0)',
      setup: { ...SAME_TEAM, hospitalizationCosts: 200, hospitalCostOffset: 0 },
      expected: 0,
    },
    {
      name: 'same team with a 25% offset: the $50 hospital saving is the whole difference (-$50)',
      setup: { ...SAME_TEAM, hospitalizationCosts: 200, hospitalCostOffset: 25 },
      expected: -50,
    },
    {
      name: '1 to 2 physicians and no offset: the extra $10 cap rate is the whole difference (+$10)',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200, hospitalCostOffset: 0 },
      expected: 10,
    },
    {
      name: 'no staff and a 50% offset on $200: -$100',
      setup: { hospitalizationCosts: 200, hospitalCostOffset: 50 },
      expected: -100,
    },
    {
      name: 'always equals (cap rate difference) + (hospital spending difference)',
      setup: { ...ONE_TO_TWO, margin: 3, costPerPatient: 21, benefitRates: 50, ...MIX_25_EACH, hospitalCostOffset: 25 },
      expected: 'sum',
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    const result = run(setup);
    const want = expected === 'sum' ? result.capRateDifference + result.hospitalSpendDifference : expected;
    check(task, 'combinedSpendDifference', result.combinedSpendDifference, want);
  });
});

describe(OPERATIONS.panelSizeDifference.title, () => {
  const cases = [
    { name: '2,700 proactive - 2,500 baseline = 200', setup: { panelSizeBaseline: 2500, panelSizeProactive: 2700 }, expected: 200 },
    { name: 'equal panel sizes: 0', setup: { panelSizeBaseline: 2700, panelSizeProactive: 2700 }, expected: 0 },
    { name: 'smaller proactive panel: 2,500 - 2,700 = -200', setup: { panelSizeBaseline: 2700, panelSizeProactive: 2500 }, expected: -200 },
    { name: '3,000 - 2,000 = 1,000', setup: { panelSizeBaseline: 2000, panelSizeProactive: 3000 }, expected: 1000 },
    { name: 'an empty proactive panel: 0 - 1,000 = -1,000', setup: { panelSizeBaseline: 1000, panelSizeProactive: 0 }, expected: -1000 },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'panelSizeDifference', run(setup).panelSizeDifference, expected);
  });
});

describe(OPERATIONS.breakEvenOffset.title, () => {
  const cases = [
    {
      name: 'cap rate gap $10 / hospital $200 x 100 = 5%',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200 },
      expected: 5,
    },
    {
      name: '50% margin doubles the gap to $20: $20 / $200 x 100 = 10%',
      setup: { ...ONE_TO_TWO, hospitalizationCosts: 200, margin: 50 },
      expected: 10,
    },
    {
      name: 'a larger proactive panel gives a negative gap of -$5: -$5 / $250 x 100 = -2%',
      setup: { ...SAME_TEAM, panelSizeProactive: 2000, hospitalizationCosts: 250 },
      expected: -2,
    },
    {
      name: 'no cap rate gap: 0%',
      setup: { ...SAME_TEAM, hospitalizationCosts: 200 },
      expected: 0,
    },
    {
      name: 'hospital spending from the age mix ($125): $10 / $125 x 100 = 8%',
      setup: { ...ONE_TO_TWO, age0_18: 100 },
      expected: 8,
    },
    {
      name: 'EDGE: baseline hospital spending of $0 with a cap rate gap divides by zero (Infinity)',
      setup: { ...ONE_TO_TWO, age0_18: 0 },
      expected: Infinity,
    },
    {
      name: 'EDGE: baseline hospital spending of $0 and no cap rate gap is 0 / 0 (NaN)',
      setup: { ...SAME_TEAM, age0_18: 0 },
      expected: NaN,
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'breakEvenOffset', run(setup).breakEvenOffset, expected);
  });

  // Meaning check: entering the break-even offset as the real offset makes the two teams cost the same.
  const realistic = [
    { name: 'default-like practice', setup: { ...ONE_TO_TWO, margin: 3, costPerPatient: 21, benefitRates: 50, panelSizeProactive: 1200, ...MIX_25_EACH } },
    { name: 'larger proactive team and smaller panel', setup: { ...ONE_TO_TWO, ...staff('Proactive', { [PCP]: 3, rn: 2 }), margin: 5, costPerPatient: 30, panelSizeProactive: 800, hospitalizationCosts: 300 } },
    { name: 'proactive team that is cheaper per patient', setup: { ...SAME_TEAM, panelSizeProactive: 1500, margin: 2, costPerPatient: 15, hospitalizationCosts: 180 } },
  ];

  it.for(realistic)('using the break-even offset makes combined spending equal: $name', ({ setup }, { task }) => {
    const offset = run(setup).breakEvenOffset;
    const atBreakEven = run({ ...setup, hospitalCostOffset: offset });
    check(task, 'breakEvenOffset', atBreakEven.combinedSpendDifference, 0, 6);
  });
});

describe(OPERATIONS.breakEvenPanelSize.title, () => {
  const cases = [
    { name: '1 physician to 2 physicians on 1,000 patients: 1,000 x 240,000 / 120,000 = 2,000', setup: ONE_TO_TWO, expected: 2000 },
    { name: 'identical teams: the panel size stays at 1,000', setup: SAME_TEAM, expected: 1000 },
    {
      name: '2 physicians to 3 physicians on 2,500 patients: 2,500 x 3 / 2 = 3,750',
      setup: { ...staff('Baseline', { [PCP]: 2 }), ...staff('Proactive', { [PCP]: 3 }), panelSizeBaseline: 2500 },
      expected: 3750,
    },
    {
      name: 'proactive team half the cost of baseline: 1,000 x 0.5 = 500',
      setup: { ...staff('Baseline', { [PCP]: 1 }), ...staff('Proactive', { [PCP]: 0.5 }) },
      expected: 500,
    },
    {
      name: 'benefits and per-patient costs do not change the answer (still 2,000)',
      setup: { ...ONE_TO_TWO, benefitRates: 50, costPerPatient: 30, margin: 10 },
      expected: 2000,
    },
    {
      name: 'EDGE: no baseline staff but a proactive team divides by zero (Infinity)',
      setup: staff('Proactive', { [PCP]: 1 }),
      expected: Infinity,
    },
    {
      name: 'EDGE: no staff on either team is 0 / 0 (NaN)',
      setup: {},
      expected: NaN,
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'breakEvenPanelSize', run(setup).breakEvenPanelSize, expected);
  });

  // Meaning check: at the break-even panel size both teams have the same cap rate.
  const realistic = [
    { name: 'default-like practice', setup: { ...ONE_TO_TWO, margin: 3, costPerPatient: 21, benefitRates: 50 } },
    { name: 'high margin and high per-patient cost', setup: { ...ONE_TO_TWO, ...staff('Proactive', { [PCP]: 4, rn: 2 }), margin: 20, costPerPatient: 80 } },
  ];

  it.for(realistic)('at the break-even panel size the cap rates match: $name', ({ setup }, { task }) => {
    const size = run(setup).breakEvenPanelSize;
    const atBreakEven = run({ ...setup, panelSizeProactive: size });
    check(task, 'breakEvenPanelSize', atBreakEven.capRateDifference, 0, 6);
  });

  it('is reported without a rounding step', ({ task }) => {
    const size = run({ ...staff('Baseline', { [PCP]: 3 }), ...staff('Proactive', { [PCP]: 4 }) }).breakEvenPanelSize;
    task.meta.operation = 'breakEvenPanelSize';
    task.meta.expected = String(4 / 3 * 1000);
    task.meta.actual = String(size);
    expect(size).toBeCloseTo(1333.3333333, 5);
  });
});
