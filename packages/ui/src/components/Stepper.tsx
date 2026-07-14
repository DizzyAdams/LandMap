import { Fragment, type ReactNode } from 'react';
import { cn } from '../lib/index';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  /** Index of the active step (0-based). */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  /** Only fires for visited / completed steps (never jumps ahead). */
  onStepClick?: (i: number) => void;
  className?: string;
}

function CheckIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}

/**
 * Accessible, on-brand progress stepper. States: done (emerald check +
 * gradient connector), active (emerald→cyan gradient + glow), upcoming
 * (neutral). Connector between steps fills with the brand gradient once passed.
 */
export function Stepper({
  steps,
  current,
  orientation = 'horizontal',
  onStepClick,
  className,
}: StepperProps) {
  const vertical = orientation === 'vertical';

  return (
    <div
      role="list"
      className={cn('flex', vertical ? 'flex-col items-start' : 'flex-row items-center', className)}
    >
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming';
        const clickable = !!onStepClick && i <= current;
        const isLast = i === steps.length - 1;

        const circle = cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors motion-reduce:transition-none',
          state === 'done' && 'border-[color-mix(in_srgb,var(--primary)_10%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]',
          state === 'active' &&
            'border-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/70 text-[var(--primary-foreground)] shadow-sm',
          state === 'upcoming' && 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)]',
        );

        const labelEl = (
          <span className={cn('flex flex-col', vertical ? 'ml-3' : 'mt-2 text-center')}>
            <span className={cn('text-xs font-medium', state === 'active' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')}>
              {step.label}
            </span>
            {step.description && <span className="text-[11px] text-[var(--muted-foreground)]">{step.description}</span>}
          </span>
        );

        const circleEl = (
          <span className={circle} aria-hidden={!clickable}>
            {state === 'done' ? <CheckIcon /> : (step.icon ?? i + 1)}
          </span>
        );

        const inner = vertical ? (
          <>
            {circleEl}
            {labelEl}
          </>
        ) : (
          <div className="flex flex-col items-center">
            {circleEl}
            {labelEl}
          </div>
        );

        const node = clickable ? (
          <div
            role="button"
            tabIndex={0}
            aria-current={state === 'active' ? 'step' : undefined}
            onClick={() => onStepClick?.(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onStepClick?.(i);
              }
            }}
            className="flex cursor-pointer items-center rounded-md outline-none focus-visible:outline-none focus-visible:shadow-[var(--ring)]"
          >
            {inner}
          </div>
        ) : (
          <div role="listitem" aria-current={state === 'active' ? 'step' : undefined} className="flex items-center">
            {inner}
          </div>
        );

        const connector = !isLast && (
          <span
            aria-hidden
            className={cn(
              vertical ? 'ml-4 my-2 h-6 w-px' : 'mx-2 h-px flex-1',
              i < current ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/70' : 'bg-[var(--border)]',
            )}
          />
        );

        return (
          <Fragment key={step.id}>
            {node}
            {connector}
          </Fragment>
        );
      })}
    </div>
  );
}
