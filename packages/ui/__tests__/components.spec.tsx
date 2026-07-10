import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '../src/components/Tooltip';
import { ToastProvider, useToast } from '../src/components/Toast';

function ToastHarness() {
  const { toast } = useToast();
  return (
    <button onClick={() => toast({ title: 'Saved', description: 'Property added.' })}>
      Trigger toast
    </button>
  );
}

describe('Tooltip', () => {
  it('renders tooltip content on hover (role=tooltip, aria)', () => {
    render(
      <Tooltip content="Helpful hint">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    const tip = screen.getByRole('tooltip');
    expect(tip).not.toBeNull();
    expect(tip.textContent).toContain('Helpful hint');
  });
});

describe('ToastProvider', () => {
  it('shows a toast when triggered', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Trigger toast'));
    const title = await screen.findByText('Saved');
    expect(title).not.toBeNull();
    expect(screen.getByText('Property added.')).not.toBeNull();
  });
});
