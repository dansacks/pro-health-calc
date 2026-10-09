import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_INPUTS, calculateOutputs } from '../../src/calculations';
import App from '../../src/App';

afterEach(cleanup);

const input = (field) => document.querySelector(`input[name="${field}"]`);
const shown = (testId) => screen.getByTestId(testId).textContent;

// The whole page, as a user sees it. Expected values were calculated independently of the app code.
describe('Calculator page with default inputs', () => {
  const defaults = [
    ['panelSizeBaseline', '2700'], ['panelSizeProactive', '2700'], ['panelSizeDifference', '0'],
    ['capRateBaseline', '28.70'], ['capRateProactive', '73.05'], ['capRateDifference', '44.35'],
    ['hospitalSpendBaseline', '224.94'], ['hospitalSpendProactive', '168.70'], ['hospitalSpendDifference', '-56.23'],
    ['combinedSpendBaseline', '253.64'], ['combinedSpendProactive', '241.76'], ['combinedSpendDifference', '-11.88'],
    ['laborCostBaseline', '845355.15'], ['laborCostProactive', '2239252.83'],
    ['totalCostBaseline', '902055.15'], ['totalCostProactive', '2295952.83'],
    ['variableCostsBaseline', '56700.00'], ['variableCostsProactive', '56700.00'],
    ['breakEvenOffset', '19.72'], ['breakEvenPanelSize', '7152'],
  ];

  it('has the title and footer', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Financial Summary' })).toBeInTheDocument();
    expect(screen.getByText(/Copyright/)).toBeInTheDocument();
  });

  it('hides developer debugging details by default', () => {
    render(<App />);

    expect(screen.queryByTestId('laborCostBaseline')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Current Panel Size/ })).toBeInTheDocument();
  });

  it.for(defaults)('displays %s as %s', ([testId, expected]) => {
    render(<App debug />);

    expect(shown(testId)).toBe(expected);
  });
});

describe('Changing inputs updates the results', () => {
  it('a larger proactive panel (3,000 vs 2,700) shows a panel size difference of 300', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Proactive Team' }));

    fireEvent.change(input('panelSizeProactive'), { target: { value: '3000' } });

    expect(shown('panelSizeProactive')).toBe('3000');
    expect(shown('panelSizeDifference')).toBe('300');
  });

  it('a typed-in hospital cost of $200 with the default 25% offset shows $200 / $150 / -$50', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Patient Severity' }));

    fireEvent.change(input('hospitalizationCosts'), { target: { value: '200' } });

    expect(shown('hospitalSpendBaseline')).toBe('200.00');
    expect(shown('hospitalSpendProactive')).toBe('150.00');
    expect(shown('hospitalSpendDifference')).toBe('-50.00');
  });

  it('a 0% offset on a typed-in $200 hospital cost shows no hospital saving', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Patient Severity' }));
    fireEvent.change(input('hospitalizationCosts'), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Proactive Team' }));

    fireEvent.change(input('hospitalCostOffset'), { target: { value: '0' } });

    expect(shown('hospitalSpendProactive')).toBe('200.00');
    expect(shown('hospitalSpendDifference')).toBe('0.00');
  });

  it('typing with a real keyboard works: cost per patient $21 -> $0 removes variable costs', async () => {
    const user = userEvent.setup();
    render(<App debug />);
    await user.click(screen.getByRole('button', { name: 'Financial Information' }));

    await user.clear(input('costPerPatient'));

    expect(shown('variableCostsBaseline')).toBe('0.00');
    expect(shown('variableCostsProactive')).toBe('0.00');
  });

  it('adding one physician FTE to the proactive team raises the proactive labor cost by one salary with benefits', () => {
    render(<App debug />);
    fireEvent.click(screen.getByRole('button', { name: 'Proactive Team' }));

    fireEvent.change(input('familyMedicineDoctorProactive'), { target: { value: '2' } });

    const expected = calculateOutputs(DEFAULT_INPUTS).laborCostProactive + 267373.01 * 1.5;
    expect(shown('laborCostProactive')).toBe(expected.toFixed(2));
  });

  it('values stay in place when switching between tabs', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Proactive Team' }));
    fireEvent.change(input('panelSizeProactive'), { target: { value: '3000' } });

    fireEvent.click(screen.getByRole('button', { name: 'Current Team' }));
    fireEvent.click(screen.getByRole('button', { name: 'Proactive Team' }));

    expect(input('panelSizeProactive')).toHaveValue(3000);
  });
});

describe('Navigation', () => {
  it('starts on the Current Team tab with the Previous arrow disabled', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Current Panel Size/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '‹' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '›' })).toBeEnabled();
  });

  it('the Next arrow steps through all four tabs and is disabled on the last one', () => {
    render(<App />);
    const next = screen.getByRole('button', { name: '›' });

    fireEvent.click(next);
    expect(screen.getByRole('heading', { name: /Proactive Panel Size/ })).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByRole('heading', { name: /Patient Age Mix/ })).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByRole('heading', { name: /Required Net Margin/ })).toBeInTheDocument();
    expect(next).toBeDisabled();
  });

  it('the Previous arrow goes back one tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Financial Information' }));

    fireEvent.click(screen.getByRole('button', { name: '‹' }));

    expect(screen.getByRole('heading', { name: /Patient Age Mix/ })).toBeInTheDocument();
  });

  it('the Graph section starts collapsed and opens when clicked', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.section-content')).toBeNull();

    fireEvent.click(screen.getByText(/Graph/));

    expect(container.querySelector('.section-content')).toBeInTheDocument();
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
