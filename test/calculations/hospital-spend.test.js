import { describe, it } from 'vitest';
import { OPERATIONS } from '../support/catalog';
import { check } from '../support/check';
import { run } from '../support/scenarios';

// Test reference data: 1200 / 2400 / 3600 / 4800 per age band, MEPS factor 0.25.

describe(OPERATIONS.hospitalSpendBaseline.title, () => {
  const cases = [
    { name: 'age mix 100% under 19: 100 x 1200 / 1200 x 1.25 = $125', setup: { age0_18: 100 }, expected: 125 },
    {
      name: 'age mix 25% in each band: (30,000 + 60,000 + 90,000 + 120,000) / 1200 x 1.25 = $312.50',
      setup: { age0_18: 25, age19_44: 25, age45_64: 25, age65_plus: 25 },
      expected: 312.5,
    },
    {
      name: 'age mix 100% age 65+: 100 x 4800 / 1200 x 1.25 = $500',
      setup: { age0_18: 0, age65_plus: 100 },
      expected: 500,
    },
    {
      name: 'a typed-in hospitalization cost of $180 is used instead of the age mix',
      setup: { hospitalizationCosts: 180 },
      expected: 180,
    },
    {
      name: 'a typed-in cost of $0.50 is still used (only exactly 0 means "use the age mix")',
      setup: { hospitalizationCosts: 0.5 },
      expected: 0.5,
    },
    {
      name: 'a typed-in cost ignores the age mix, even when the age mix is different',
      setup: { hospitalizationCosts: 200, age0_18: 0, age65_plus: 100 },
      expected: 200,
    },
    {
      name: 'a MEPS factor of 0 removes the adjustment: 100 x 1200 / 1200 = $100',
      setup: { age0_18: 100 },
      expected: 100,
      fixed: { mepsFactor: 0 },
    },
    {
      name: 'EDGE: an age mix that adds up to 50% (not 100%) is not rescaled: 50 x 1200 / 1200 x 1.25 = $62.50',
      setup: { age0_18: 50 },
      expected: 62.5,
    },
    {
      name: 'EDGE: an empty age mix and no typed-in cost gives $0',
      setup: { age0_18: 0 },
      expected: 0,
    },
  ];

  it.for(cases)('$name', ({ setup, expected, fixed }, { task }) => {
    check(task, 'hospitalSpendBaseline', run(setup, fixed).hospitalSpendBaseline, expected);
  });
});

describe(OPERATIONS.hospitalSpendProactive.title, () => {
  const cases = [
    { name: '$200 baseline with a 25% offset: $200 x 0.75 = $150', setup: { hospitalizationCosts: 200, hospitalCostOffset: 25 }, expected: 150 },
    { name: 'a 0% offset leaves spending unchanged at $200', setup: { hospitalizationCosts: 200, hospitalCostOffset: 0 }, expected: 200 },
    { name: 'a 100% offset eliminates hospital spending', setup: { hospitalizationCosts: 200, hospitalCostOffset: 100 }, expected: 0 },
    { name: 'a 50% offset on an age-mix baseline of $125: $62.50', setup: { age0_18: 100, hospitalCostOffset: 50 }, expected: 62.5 },
    { name: 'a 10% offset on $400: $360', setup: { hospitalizationCosts: 400, hospitalCostOffset: 10 }, expected: 360 },
    {
      name: 'EDGE: a negative offset (-10%) is not rejected and raises spending to $220',
      setup: { hospitalizationCosts: 200, hospitalCostOffset: -10 },
      expected: 220,
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'hospitalSpendProactive', run(setup).hospitalSpendProactive, expected);
  });
});

describe(OPERATIONS.hospitalSpendDifference.title, () => {
  const cases = [
    { name: '$200 baseline with a 25% offset saves $50: -$50', setup: { hospitalizationCosts: 200, hospitalCostOffset: 25 }, expected: -50 },
    { name: 'a 0% offset: no change ($0)', setup: { hospitalizationCosts: 200, hospitalCostOffset: 0 }, expected: 0 },
    { name: '$400 baseline with a 10% offset: -$40', setup: { hospitalizationCosts: 400, hospitalCostOffset: 10 }, expected: -40 },
    {
      name: 'age-mix baseline of $312.50 with a 20% offset: -$62.50',
      setup: { age0_18: 25, age19_44: 25, age45_64: 25, age65_plus: 25, hospitalCostOffset: 20 },
      expected: -62.5,
    },
    {
      name: 'EDGE: a negative offset (-10%) on $200 increases spending by $20',
      setup: { hospitalizationCosts: 200, hospitalCostOffset: -10 },
      expected: 20,
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'hospitalSpendDifference', run(setup).hospitalSpendDifference, expected);
  });
});
