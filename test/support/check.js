import { expect } from 'vitest';

// Asserts a value and attaches plain-English details for the readable report.
export const check = (task, operation, actual, expected, digits = 6) => {
  task.meta.operation = operation;
  task.meta.expected = String(expected);
  task.meta.actual = String(actual);

  if (typeof expected === 'string') {
    expect(actual).toBe(expected);
  } else if (Number.isNaN(expected)) {
    expect(actual).toBeNaN();
  } else if (!Number.isFinite(expected)) {
    expect(actual).toBe(expected);
  } else {
    expect(actual).toBeCloseTo(expected, digits);
  }
};
