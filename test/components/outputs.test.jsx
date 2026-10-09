import React from 'react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DEFAULT_INPUTS, calculateOutputs } from '../../src/calculations';
import BreakEven from '../../src/components/outputs/BreakEven';
import Chart from '../../src/components/outputs/Chart';
import Results from '../../src/components/outputs/Results';

afterEach(() => {
  cleanup();
  delete window.DEBUG;
});

const text = (testId) => screen.getByTestId(testId).textContent;

describe('Results table', () => {
  const outputs = calculateOutputs(DEFAULT_INPUTS);

  it('shows the Baseline, Proactive, and Difference columns', () => {
    render(<Results inputs={DEFAULT_INPUTS} outputs={outputs} />);

    ['Baseline', 'Proactive', 'Difference'].forEach((heading) =>
      expect(screen.getByRole('columnheader', { name: heading })).toBeInTheDocument());
  });

  it('shows one row each for panel size, cap rate, hospital spend, and combined spend', () => {
    render(<Results inputs={DEFAULT_INPUTS} outputs={outputs} />);

    expect(screen.getByText('Panel size')).toBeInTheDocument();
    expect(screen.getByText(/Primary care cap rate PMPM/)).toBeInTheDocument();
    expect(screen.getByText(/Hospital spend PMPM/)).toBeInTheDocument();
    expect(screen.getByText(/Combined \(PC \+ Hosp\) spend/)).toBeInTheDocument();
  });

  it.for([
    ['panelSizeBaseline', '2700'], ['panelSizeProactive', '2700'], ['panelSizeDifference', '0'],
    ['capRateBaseline', '28.70'], ['capRateProactive', '73.05'], ['capRateDifference', '44.35'],
    ['hospitalSpendBaseline', '224.94'], ['hospitalSpendProactive', '168.70'], ['hospitalSpendDifference', '-56.23'],
    ['combinedSpendBaseline', '253.64'], ['combinedSpendProactive', '241.76'], ['combinedSpendDifference', '-11.88'],
  ])('shows %s as %s for the default inputs', ([testId, expected]) => {
    render(<Results inputs={DEFAULT_INPUTS} outputs={outputs} />);

    expect(text(testId)).toBe(expected);
  });

  it('money rows are shown with a dollar sign and exactly 2 decimals', () => {
    render(<Results inputs={DEFAULT_INPUTS} outputs={{ ...outputs, capRateBaseline: 2.5, hospitalSpendBaseline: 1234.5678 }} />);

    expect(screen.getByTestId('capRateBaseline').parentElement).toHaveTextContent('$2.50');
    expect(screen.getByTestId('hospitalSpendBaseline').parentElement).toHaveTextContent('$1234.57');
  });

  it('hides the labor and total cost details unless debugging is on', () => {
    render(<Results inputs={DEFAULT_INPUTS} outputs={outputs} />);

    expect(screen.queryByTestId('laborCostBaseline')).not.toBeInTheDocument();
  });

  it.for([
    ['laborCostBaseline', '845355.15'], ['laborCostProactive', '2239252.83'],
    ['totalCostBaseline', '902055.15'], ['totalCostProactive', '2295952.83'],
    ['variableCostsBaseline', '56700.00'], ['variableCostsProactive', '56700.00'],
  ])('with debugging on, shows %s as %s', ([testId, expected]) => {
    window.DEBUG = true;
    render(<Results inputs={DEFAULT_INPUTS} outputs={outputs} />);

    expect(text(testId)).toBe(expected);
  });
});

describe('Break-even panel', () => {
  const outputs = calculateOutputs(DEFAULT_INPUTS);

  it('shows the break-even offset to 2 decimals with a percent sign', () => {
    render(<BreakEven outputs={outputs} />);

    expect(text('breakEvenOffset')).toBe('19.72');
    expect(screen.getByTestId('breakEvenOffset').parentElement).toHaveTextContent('19.72%');
  });

  it('shows the break-even panel size rounded to a whole number', () => {
    render(<BreakEven outputs={outputs} />);

    expect(text('breakEvenPanelSize')).toBe('7152');
  });

  it('rounds the offset to 2 decimals and the panel size to a whole number (12.3456 -> 12.35, 1999.6 -> 2000)', () => {
    render(<BreakEven outputs={{ ...outputs, breakEvenOffset: 12.3456, breakEvenPanelSize: 1999.6 }} />);

    expect(text('breakEvenOffset')).toBe('12.35');
    expect(text('breakEvenPanelSize')).toBe('2000');
  });
});

describe('Break-even chart', () => {
  it('renders without error for the default inputs', () => {
    const { container } = render(<Chart inputs={DEFAULT_INPUTS} outputs={calculateOutputs(DEFAULT_INPUTS)} />);

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders without error when the proactive panel is larger than the baseline panel', () => {
    const inputs = { ...DEFAULT_INPUTS, panelSizeProactive: 3500 };
    const { container } = render(<Chart inputs={inputs} outputs={calculateOutputs(inputs)} />);

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  describe('with a measurable container', () => {
    beforeEach(() => {
      // jsdom has no layout, so report a fixed size to let the chart draw itself.
      vi.stubGlobal('ResizeObserver', class {
        constructor(callback) { this.callback = callback; }
        observe(target) { this.callback([{ target, contentRect: { width: 800, height: 400 } }]); }
        unobserve() {}
        disconnect() {}
      });
    });
    afterEach(() => vi.unstubAllGlobals());

    it('draws the axes, the break-even line, and the entered-value marker', () => {
      const { container } = render(<Chart inputs={DEFAULT_INPUTS} outputs={calculateOutputs(DEFAULT_INPUTS)} />);

      expect(screen.getByText('Panel Size')).toBeInTheDocument();
      expect(screen.getByText('Offset%')).toBeInTheDocument();
      expect(screen.getByText('Breakeven Line')).toBeInTheDocument();
      expect(screen.getByText('Input Size and Offset')).toBeInTheDocument();
      expect(container.querySelector('.recharts-line')).toBeInTheDocument();
    });

    it('draws one dot for each of the 8 points on the break-even line', () => {
      const { container } = render(<Chart inputs={DEFAULT_INPUTS} outputs={calculateOutputs(DEFAULT_INPUTS)} />);

      expect(container.querySelectorAll('.recharts-line-dots circle')).toHaveLength(8);
    });
  });
});
