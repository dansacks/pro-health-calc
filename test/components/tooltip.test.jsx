import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import Tooltip from '../../src/components/inputs/Tooltip';

afterEach(cleanup);

const tip = (container) => container.querySelector('.tooltip-text');

describe('Tooltip', () => {
  it('shows the info icon and starts hidden', () => {
    const { container } = render(<Tooltip tooltipText="Help" />);

    expect(screen.getByText('ℹ️')).toBeInTheDocument();
    expect(tip(container)).not.toHaveClass('visible');
  });

  it('toggles visibility when clicked', () => {
    const { container } = render(<Tooltip tooltipText="Help" />);

    fireEvent.click(screen.getByText('ℹ️'));
    expect(tip(container)).toHaveClass('visible');
    fireEvent.click(screen.getByText('ℹ️'));
    expect(tip(container)).not.toHaveClass('visible');
  });

  it('shows <b>...</b> as bold text', () => {
    const { container } = render(<Tooltip tooltipText="<b>Registered Nurse</b> - Provides phone triage." />);

    expect(container.querySelector('b')).toHaveTextContent('Registered Nurse');
    expect(tip(container)).toHaveTextContent('Registered Nurse - Provides phone triage.');
  });

  it('turns each newline into a line break', () => {
    const { container } = render(<Tooltip tooltipText={'First line\nSecond line\nThird line'} />);

    expect(container.querySelectorAll('br')).toHaveLength(2);
    expect(tip(container)).toHaveTextContent('First lineSecond lineThird line');
  });

  it('shows several bold phrases in one tooltip', () => {
    const { container } = render(<Tooltip tooltipText="<b>One</b> and <b>Two</b>" />);

    expect([...container.querySelectorAll('b')].map((b) => b.textContent)).toEqual(['One', 'Two']);
  });

  it('shows any other HTML as plain text and never creates elements from it', () => {
    const attack = '<img src=x onerror="window.hacked=true"><script>window.hacked=true</script>';
    const { container } = render(<Tooltip tooltipText={attack} />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(tip(container).textContent).toBe(attack);
    expect(window.hacked).toBeUndefined();
  });

  it('does not run HTML placed inside a bold phrase', () => {
    const { container } = render(<Tooltip tooltipText={'<b><img src=x onerror="window.hacked=true"></b>'} />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b').textContent).toBe('<img src=x onerror="window.hacked=true">');
  });
});
