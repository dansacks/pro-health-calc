import { describe, it } from 'vitest';
import { OPERATIONS } from '../support/catalog';
import { check } from '../support/check';
import { run, staff, salaries, PCP } from '../support/scenarios';

const PCP_AT_120K = salaries({ [PCP]: 120000 });

[
  { side: 'Baseline', key: 'capRateBaseline', panelField: 'panelSizeBaseline', otherPanel: 'panelSizeProactive' },
  { side: 'Proactive', key: 'capRateProactive', panelField: 'panelSizeProactive', otherPanel: 'panelSizeBaseline' },
].forEach(({ side, key, panelField, otherPanel }) => {
  describe(OPERATIONS[key].title, () => {
    const cases = [
      {
        name: '$120,000 of labor over 1,000 patients, no margin: $120,000 / 1,000 / 12 = $10',
        setup: { ...staff(side, { [PCP]: 1 }), ...PCP_AT_120K },
        expected: 10,
      },
      {
        name: 'same practice with a 20% margin: $120,000 / (0.8 x 1,000) / 12 = $12.50',
        setup: { ...staff(side, { [PCP]: 1 }), ...PCP_AT_120K, margin: 20 },
        expected: 12.5,
      },
      {
        name: '2 physicians at $110,000 + $10 per patient x 2,000 patients, 50% margin: $240,000 / 1,000 / 12 = $20',
        setup: {
          ...staff(side, { [PCP]: 2 }),
          ...salaries({ [PCP]: 110000 }),
          costPerPatient: 10,
          [panelField]: 2000,
          margin: 50,
        },
        expected: 20,
      },
      {
        name: 'doubling the panel size halves the rate: $120,000 / 2,000 / 12 = $5',
        setup: { ...staff(side, { [PCP]: 1 }), ...PCP_AT_120K, [panelField]: 2000 },
        expected: 5,
      },
      {
        name: '50% benefits raise the cost to $180,000: $180,000 / 1,000 / 12 = $15',
        setup: { ...staff(side, { [PCP]: 1 }), ...PCP_AT_120K, benefitRates: 50 },
        expected: 15,
      },
      {
        name: 'the other team\'s panel size does not change this rate',
        setup: { ...staff(side, { [PCP]: 1 }), ...PCP_AT_120K, [otherPanel]: 5000 },
        expected: 10,
      },
      { name: 'no costs gives a rate of $0', setup: {}, expected: 0 },
      {
        name: 'EDGE: a 100% margin divides by zero and gives Infinity',
        setup: { ...staff(side, { [PCP]: 1 }), margin: 100 },
        expected: Infinity,
      },
      {
        name: 'EDGE: a panel size of 0 with costs divides by zero and gives Infinity',
        setup: { ...staff(side, { [PCP]: 1 }), [panelField]: 0 },
        expected: Infinity,
      },
      {
        name: 'EDGE: no costs and a panel size of 0 is 0 / 0, which is not a number (NaN)',
        setup: { [panelField]: 0 },
        expected: NaN,
      },
    ];

    it.for(cases)('$name', ({ setup, expected }, { task }) => {
      check(task, key, run(setup)[key], expected);
    });
  });
});

describe(OPERATIONS.capRateDifference.title, () => {
  const cases = [
    {
      name: 'identical teams and panels: no difference',
      setup: { ...staff('Baseline', { [PCP]: 1 }), ...staff('Proactive', { [PCP]: 1 }), ...PCP_AT_120K },
      expected: 0,
    },
    {
      name: 'a second physician doubles the rate: $20 - $10 = $10',
      setup: { ...staff('Baseline', { [PCP]: 1 }), ...staff('Proactive', { [PCP]: 2 }), ...PCP_AT_120K },
      expected: 10,
    },
    {
      name: 'same team but double the panel: $5 - $10 = -$5',
      setup: {
        ...staff('Baseline', { [PCP]: 1 }),
        ...staff('Proactive', { [PCP]: 1 }),
        ...PCP_AT_120K,
        panelSizeProactive: 2000,
      },
      expected: -5,
    },
    {
      name: 'with a 50% margin the gap doubles: $40 - $20 = $20',
      setup: {
        ...staff('Baseline', { [PCP]: 1 }),
        ...staff('Proactive', { [PCP]: 2 }),
        ...PCP_AT_120K,
        margin: 50,
      },
      expected: 20,
    },
    {
      name: 'no staff on either team: $0',
      setup: {},
      expected: 0,
    },
    {
      name: 'EDGE: a 100% margin makes both rates Infinity, and Infinity - Infinity is not a number (NaN)',
      setup: { ...staff('Baseline', { [PCP]: 1 }), ...staff('Proactive', { [PCP]: 2 }), margin: 100 },
      expected: NaN,
    },
  ];

  it.for(cases)('$name', ({ setup, expected }, { task }) => {
    check(task, 'capRateDifference', run(setup).capRateDifference, expected);
  });
});
