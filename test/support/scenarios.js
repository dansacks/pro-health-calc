import { STAFF_ROLES, calculateOutputs } from '../../src/calculations';

// Round reference data chosen so expected values can be checked by hand.
export const TEST_FIXED = {
  hospitalCost0_18: 1200,
  hospitalCost19_44: 2400,
  hospitalCost45_64: 3600,
  hospitalCost65_plus: 4800,
  hospitalCostAll: 2400,
  mepsFactor: 0.25,
};

// A neutral starting point: no staff, no costs, no margin, every salary $100,000.
export const BASE = {
  panelSizeBaseline: 1000,
  panelSizeProactive: 1000,
  hospitalCostOffset: 0,
  hospitalizationCosts: 0,
  age0_18: 100,
  age19_44: 0,
  age45_64: 0,
  age65_plus: 0,
  benefitRates: 0,
  benefitRatesProactive: 0,
  margin: 0,
  costPerPatient: 0,
  ...Object.fromEntries(STAFF_ROLES.flatMap((role) => [
    [`${role}Baseline`, 0],
    [`${role}Proactive`, 0],
    [`${role}Salary`, 100000],
  ])),
};

export const scenario = (overrides = {}) => ({ ...BASE, ...overrides });

export const run = (overrides = {}, fixedOverrides = {}) =>
  calculateOutputs(scenario(overrides), { ...TEST_FIXED, ...fixedOverrides });

// Builds FTE overrides for one team, e.g. staff('Baseline', { rn: 2 }).
export const staff = (suffix, fteByRole) =>
  Object.fromEntries(Object.entries(fteByRole).map(([role, fte]) => [`${role}${suffix}`, fte]));

// Builds salary overrides, e.g. salaries({ rn: 80000 }).
export const salaries = (salaryByRole) =>
  Object.fromEntries(Object.entries(salaryByRole).map(([role, pay]) => [`${role}Salary`, pay]));

export const PCP = 'familyMedicineDoctor';
