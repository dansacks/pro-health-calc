import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { calculateSum, handleChangeFactory, renderTableRows } from '../../src/helpers/Forms';
import { SUPPORTING_OPERATIONS } from '../support/catalog';
import { check } from '../support/check';

afterEach(() => {
  cleanup();
  delete window.DEBUG;
});

describe(SUPPORTING_OPERATIONS.sumOfFields.title, () => {
  const cases = [
    { name: 'the default age mix 25 + 31 + 27 + 17 shows 100.00', fields: ['a', 'b', 'c', 'd'], inputs: { a: 25, b: 31, c: 27, d: 17 }, expected: '100.00' },
    { name: 'two fields: 10.5 + 4.25 = 14.75', fields: ['a', 'b'], inputs: { a: 10.5, b: 4.25 }, expected: '14.75' },
    { name: 'the exact survey mix 25.368 + 31.306 + 26.883 + 16.441 = 99.998 is shown as 100.00', fields: ['a', 'b', 'c', 'd'], inputs: { a: 25.368, b: 31.306, c: 26.883, d: 16.441 }, expected: '100.00' },
    { name: 'a single field is shown with 2 decimals: 7 becomes 7.00', fields: ['a'], inputs: { a: 7 }, expected: '7.00' },
    { name: 'no fields add up to 0.00', fields: [], inputs: { a: 5 }, expected: '0.00' },
    { name: 'only the listed fields are added (the other field is ignored)', fields: ['a', 'b'], inputs: { a: 1, b: 2, c: 1000 }, expected: '3.00' },
    { name: 'negative numbers are subtracted: 50 + -20 = 30.00', fields: ['a', 'b'], inputs: { a: 50, b: -20 }, expected: '30.00' },
    { name: 'all zeros: 0.00', fields: ['a', 'b'], inputs: { a: 0, b: 0 }, expected: '0.00' },
  ];

  it.for(cases)('$name', ({ fields, inputs, expected }, { task }) => {
    check(task, 'sumOfFields', calculateSum(fields, inputs), expected);
  });
});

describe(SUPPORTING_OPERATIONS.parseNumberInput.title, () => {
  const cases = [
    { name: 'the text "12.5" becomes 12.5', text: '12.5', expected: 12.5 },
    { name: 'the text "2700" becomes 2700', text: '2700', expected: 2700 },
    { name: 'a negative number "-3" is kept as -3', text: '-3', expected: -3 },
    { name: 'scientific notation "1e3" becomes 1000', text: '1e3', expected: 1000 },
    { name: 'blank text becomes 0', text: '', expected: 0 },
    { name: 'text that is not a number ("abc") becomes 0', text: 'abc', expected: 0 },
    { name: 'the text "0" stays 0', text: '0', expected: 0 },
    { name: 'text with trailing characters ("42abc") keeps the leading number, 42', text: '42abc', expected: 42 },
  ];

  it.for(cases)('$name', ({ text, expected }, { task }) => {
    let state = { other: 1, panelSizeBaseline: 100 };
    const setInputs = vi.fn((update) => { state = update(state); });

    handleChangeFactory(setInputs)({ target: { name: 'panelSizeBaseline', value: text } });

    check(task, 'parseNumberInput', state.panelSizeBaseline, expected);
  });

  it('changes only the field that was edited', ({ task }) => {
    let state = { a: 1, b: 2, c: 3 };
    const setInputs = (update) => { state = update(state); };

    handleChangeFactory(setInputs)({ target: { name: 'b', value: '20' } });

    task.meta.operation = 'parseNumberInput';
    task.meta.expected = '{"a":1,"b":20,"c":3}';
    task.meta.actual = JSON.stringify(state);
    expect(state).toEqual({ a: 1, b: 20, c: 3 });
  });
});

describe('Input form rows', () => {
  const fields = [['Panel Size', 'panelSizeBaseline'], ['Cost per patient', 'costPerPatient', 'Some help text']];
  const inputs = { panelSizeBaseline: 2700, costPerPatient: 21 };

  it('shows a labeled number box for each field, filled with the current value', () => {
    render(<table><tbody>{renderTableRows(fields, inputs, () => {})}</tbody></table>);

    expect(screen.getByText('Panel Size')).toBeInTheDocument();
    expect(screen.getByText('Cost per patient')).toBeInTheDocument();
    expect(document.querySelector('input[name="panelSizeBaseline"]')).toHaveValue(2700);
    expect(document.querySelector('input[name="costPerPatient"]')).toHaveValue(21);
  });

  it('shows the field names instead of labels when debugging is on', () => {
    window.DEBUG = true;
    render(<table><tbody>{renderTableRows(fields, inputs, () => {})}</tbody></table>);

    expect(screen.getByText('panelSizeBaseline')).toBeInTheDocument();
    expect(screen.queryByText('Panel Size')).not.toBeInTheDocument();
  });

  it('only fields with help text get an info icon', () => {
    render(<table><tbody>{renderTableRows(fields, inputs, () => {})}</tbody></table>);

    expect(screen.getAllByText('ℹ️')).toHaveLength(1);
  });
});
