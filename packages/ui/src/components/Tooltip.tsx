import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import { cn } from '../lib/index';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  /** Tooltip body content. */
  content: React.ReactNode;
  /** Preferred placement relative to the trigger. */
  side?: TooltipSide;
  /** Exactly one focusable/hoverable element (e.g. <Button>, <button>). */
  children: React.ReactElement;
  className?: string;
  /** Open delay in ms (hover only). */
  delay?: number;
}

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Accessible hover/focus tooltip. Links the trigger to the tooltip via
 * aria-describedby and exposes role="tooltip". Glass surface, emerald glow.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  ({ content, side = 'top', children, className, delay = 0 }, ref) => {
    const [open, setOpen] = useState(false);
    const id = useId();
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = useCallback(() => {
      if (timer.current) clearTimeout(timer.current);
      if (delay > 0) {
        timer.current = setTimeout(() => setOpen(true), delay);
      } else {
        setOpen(true);
      }
    }, [delay]);

    const hide = useCallback(() => {
      if (timer.current) clearTimeout(timer.current);
      setOpen(false);
    }, []);

    const trigger = React.cloneElement(children, {
      'aria-describedby': open ? id : undefined,
      onMouseEnter: (e: React.MouseEvent) => {
        children.props.onMouseEnter?.(e);
        show();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        children.props.onMouseLeave?.(e);
        hide();
      },
      onFocus: (e: React.FocusEvent) => {
        children.props.onFocus?.(e);
        setOpen(true);
      },
      onBlur: (e: React.FocusEvent) => {
        children.props.onBlur?.(e);
        hide();
      },
    });

    return (
      <span ref={ref} className={cn('relative inline-flex', className)}>
        {trigger}
        {open && (
          <span
            role="tooltip"
            id={id}
            className={cn(
              'pointer-events-none absolute z-50 max-w-xs rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs leading-snug text-[var(--accent-dim)] shadow-[var(--glow-emerald)] backdrop-blur-md',
              'motion-reduce:transition-none',
              sideClasses[side],
            )}
          >
            {content}
          </span>
        )}
      </span>
    );
  },
);

Tooltip.displayName = 'Tooltip';
