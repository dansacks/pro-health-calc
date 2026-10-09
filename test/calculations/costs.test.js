import { describe, it } from 'vitest';
import { STAFF_ROLES } from '../../src/calculations';
import { OPERATIONS } from '../support/catalog';
import { check } from '../support/check';
import { run, staff, salaries, PCP } from '../support/scenarios';

const SIDES = [
  { side: 'Baseline', laborKey: 'laborCostBaseline', otherSide: 'Proactive' },
  { side: 'Proactive', laborKey: 'laborCostProactive', otherSide: 'Baseline' },
];

SIDES.forEach(({ side, laborKey, otherSide }) => {
  describe(OPERATIONS[laborKey].title, () => {
    const cases = [
      { name: 'no staff costs nothing', setup: {}, expected: 0 },
      {
        name: 'one physician at $100,000, no benefits',
        setup: staff(side, { [PCP]: 1 }),
        expected: 100000,
      },
      {
        name: 'two physicians at $100,000 and one medical assistant at $50,000, no benefits',
        setup: { ...staff(side, { [PCP]: 2, medicalAssistant: 1 }), ...salaries({ medicalAssistant: 50000 }) },
        expected: 250000,
      },
      {
        name: '1 physician ($100,000) and 0.5 NP/PA ($120,000) with 50% benefits',
        setup: { ...staff(side, { [PCP]: 1, npPa: 0.5 }), ...salaries({ npPa: 120000 }), benefitRates: 50 },
        expected: 240000,
      },
      {
        name: 'all ten roles at 1 FTE and $100,000 each with 25% benefits',
        setup: { ...staff(side, Object.fromEntries(STAFF_ROLES.map((r) => [r, 1]))), benefitRates: 25 },
        expected: 1250000,
      },
      {
        name: 'different pay per role: physician $200,000, 2 RNs at $80,000, 1 clerical at $40,000, 10% benefits',
        setup: {
          ...staff(side, { [PCP]: 1, rn: 2, clericalStaff: 1 }),
          ...salaries({ [PCP]: 200000, rn: 80000, clericalStaff: 40000 }),
          benefitRates: 10,
        },
        expected: 440000,
      },
      {
        name: 'a quarter-time physician costs a quarter of the salary',
        setup: staff(side, { [PCP]: 0.25 }),
        expected: 25000,
      },
      {
        name: '100% benefits doubles the cost of one physician',
        setup: { ...staff(side, { [PCP]: 1 }), benefitRates: 100 },
        expected: 200000,
      },
      {
        name: 'the other team\'s staffing does not change this team\'s labor cost',
        setup: { ...staff(side, { [PCP]: 1 }), ...staff(otherSide, { [PCP]: 5, rn: 3 }) },
        expected: 100000,
      },
      {
        name: 'EDGE: a negative FTE is not rejected and lowers the cost',
        setup: staff(side, { [PCP]: -1 }),
        expected: -100000,
      },
    ];

    it.for(cases)('$name', ({ setup, expected }, { task }) => {
      check(task, laborKey, run(setup)[laborKey], expected);
    });

    it.for(STAFF_ROLES)('role "%s" is included in the total (2 FTE at $50,000 = $100,000)', (role, { task }) => {
      const result = run({ ...staff(side, { [role]: 2 }), ...salaries({ [role]: 50000 }) });
      check(task, laborKey, result[laborKey], 100000);
    });
  });
});

[
  { side: 'Baseline', key: 'variableCostsBaseline', panelField: 'panelSizeBaseline', otherPanel: 'panelSizeProactive' },
  { side: 'Proactive', key: 'variableCostsProactive', panelField: 'panelSizeProactive', otherPanel: 'panelSizeBaseline' },
].forEach(({ key, panelField, otherPanel }) => {
  describe(OPERATIONS[key].title, () => {
    const cases = [
      { name: '$21 per patient x 2,700 patients', setup: { costPerPatient: 21, [panelField]: 2700 }, expected: 56700 },
      { name: '$20 per patient x 2,500 patients', setup: { costPerPatient: 20, [panelField]: 2500 }, expected: 50000 },
      { name: '$12.50 per patient x 1,000 patients', setup: { costPerPatient: 12.5, [panelField]: 1000 }, expected: 12500 },
      { name: '$0 per patient costs nothing', setup: { costPerPatient: 0, [panelField]: 3000 }, expected: 0 },
      { name: 'an empty panel costs nothing', setup: { costPerPatient: 50, [panelField]: 0 }, expected: 0 },
      {
        name: 'the other team\'s panel size does not change this result',
        setup: { costPerPatient: 10, [panelField]: 500, [otherPanel]: 9999 },
        expected: 5000,
      },
    ];

    it.for(cases)('$name', ({ setup, expected }, { task }) => {
      check(task, key, run(setup)[key], expected);
    });
  });
});

[
  { side: 'Baseline', key: 'totalCostBaseline', panelField: 'panelSizeBaseline' },
  { side: 'Proactive', key: 'totalCostProactive', panelField: 'panelSizeProactive' },
].forEach(({ side, key, panelField }) => {
  describe(OPERATIONS[key].title, () => {
    const cases = [
      {
        name: '1 physician ($100,000) + $10 per patient x 1,000 patients',
        setup: { ...staff(side, { [PCP]: 1 }), costPerPatient: 10, [panelField]: 1000 },
        expected: 110000,
      },
      {
        name: '2 physicians with 50% benefits + $20 per patient x 500 patients',
        setup: { ...staff(side, { [PCP]: 2 }), benefitRates: 50, costPerPatient: 20, [panelField]: 500 },
        expected: 310000,
      },
      {
        name: 'no staff, $5 per patient x 2,000 patients: only variable costs',
        setup: { costPerPatient: 5, [panelField]: 2000 },
        expected: 10000,
      },
      {
        name: 'staff but $0 per patient: only labor costs',
        setup: { ...staff(side, { [PCP]: 1, rn: 1 }), costPerPatient: 0 },
        expected: 200000,
      },
      { name: 'no staff and no variable costs is zero', setup: {}, expected: 0 },
    ];

    it.for(cases)('$name', ({ setup, expected }, { task }) => {
      check(task, key, run(setup)[key], expected);
    });
  });
});
