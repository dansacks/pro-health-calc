import { describe, it, expect } from 'vitest';
import { DEFAULT_INPUTS, calculateOutputs, calculateBreakEvenOffsetAt } from '../../src/calculations';
import { SUPPORTING_OPERATIONS } from '../support/catalog';
import { check } from '../support/check';
import { run, scenario, staff, salaries, PCP } from '../support/scenarios';

// x = proactive panel size as a multiple of the baseline panel size.
const curveAt = (x, setup) => calculateBreakEvenOffsetAt(x, scenario(setup), run(setup));

const ONE_TO_TWO = {
  ...staff('Baseline', { [PCP]: 1 }),
  ...staff('Proactive', { [PCP]: 2 }),
  ...salaries({ [PCP]: 120000 }),
  hospitalizationCosts: 200,
};

describe(SUPPORTING_OPERATIONS.breakEvenCurve.title, () => {
  const cases = [
    { name: 'same panel size (x = 1): cap rate $20 vs $10 on $200 hospital spend = 5%', x: 1, setup: ONE_TO_TWO, expected: 5 },
    { name: 'twice the panel (x = 2): the proactive team costs the same per patient = 0%', x: 2, setup: ONE_TO_TWO, expected: 0 },
    { name: 'half the panel (x = 0.5): $40 vs $10 = 15%', x: 0.5, setup: ONE_TO_TWO, expected: 15 },
    { name: 'a quarter of the panel (x = 0.25): $80 vs $10 = 35%', x: 0.25, setup: ONE_TO_TWO, expected: 35 },
    { name: 'four times the panel (x = 4): $5 vs $10 = -2.5%', x: 4, setup: ONE_TO_TWO, expected: -2.5 },
    { name: 'rounds to 2 decimals: x = 3 gives -1.6667, shown as -1.67%', x: 3, setup: ONE_TO_TWO, expected: -1.67, digits: 10 },
    { name: 'with $12 per patient of non-labor cost (x = 1): $21 vs $11 = 5%', x: 1, setup: { ...ONE_TO_TWO, costPerPatient: 12 }, expected: 5 },
    { name: 'with $12 per patient of non-labor cost (x = 2): $11 vs $11 = 0%', x: 2, setup: { ...ONE_TO_TWO, costPerPatient: 12 }, expected: 0 },
    { name: 'with a 50% margin (x = 1): $40 vs $20 = 10%', x: 1, setup: { ...ONE_TO_TWO, margin: 50 }, expected: 10 },
    { name: 'with a 50% margin (x = 2): $20 vs $20 = 0%', x: 2, setup: { ...ONE_TO_TWO, margin: 50 }, expected: 0 },
    { name: 'a larger baseline panel of 2,500 (x = 1): $240,000 / 2,500 / 12 = $8 vs $4 = 2%', x: 1, setup: { ...ONE_TO_TWO, panelSizeBaseline: 2500, panelSizeProactive: 2500 }, expected: 2 },
    { name: 'EDGE: x = 0 (an empty proactive panel) divides by zero and gives Infinity', x: 0, setup: ONE_TO_TWO, expected: Infinity },
    { name: 'EDGE: a 100% margin gives Infinity - Infinity, which is not a number (NaN)', x: 1, setup: { ...ONE_TO_TWO, margin: 100 }, expected: NaN },
  ];

  it.for(cases)('$name', ({ x, setup, expected, digits }, { task }) => {
    check(task, 'breakEvenCurve', curveAt(x, setup), expected, digits);
  });

  // The curve evaluated at the proactive panel size must equal the break-even offset shown in the results.
  const matchCases = [
    { name: 'default inputs, equal panels', inputs: { ...DEFAULT_INPUTS } },
    { name: 'default inputs, proactive panel of 3,000', inputs: { ...DEFAULT_INPUTS, panelSizeProactive: 3000 } },
    { name: 'default inputs, proactive panel of 2,000 and 10% margin', inputs: { ...DEFAULT_INPUTS, panelSizeProactive: 2000, margin: 10 } },
    { name: 'direct hospitalization cost of $300', inputs: { ...DEFAULT_INPUTS, panelSizeProactive: 3300, hospitalizationCosts: 300 } },
  ];

  it.for(matchCases)('matches the break-even offset shown in the results: $name', ({ inputs }, { task }) => {
    const outputs = calculateOutputs(inputs);
    const x = inputs.panelSizeProactive / inputs.panelSizeBaseline;
    check(task, 'breakEvenCurve', calculateBreakEvenOffsetAt(x, inputs, outputs), Number(outputs.breakEvenOffset.toFixed(2)), 10);
  });

  it('falls as the proactive panel gets larger (default inputs)', ({ task }) => {
    const outputs = calculateOutputs(DEFAULT_INPUTS);
    const values = [0.25, 0.5, 1, 2, 4].map((x) => calculateBreakEvenOffsetAt(x, DEFAULT_INPUTS, outputs));
    task.meta.operation = 'breakEvenCurve';
    task.meta.expected = 'each value lower than the one before';
    task.meta.actual = values.join(', ');
    values.slice(1).forEach((value, i) => expect(value).toBeLessThan(values[i]));
  });
});
