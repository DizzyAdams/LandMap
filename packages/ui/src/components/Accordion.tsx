import React, { forwardRef, useId, useRef, useState } from 'react';
import { cn } from '../lib/index';

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** `single` keeps at most one open; `multiple` allows several. */
  type?: 'single' | 'multiple';
  /** Controlled open ids. Omit for uncontrolled usage. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
}

/**
 * Keyboard-accessible collapsible sections. Headers are real buttons with
 * aria-expanded/aria-controls; arrow/Home/End move focus between headers.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, type = 'single', value, defaultValue, onValueChange, className }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
    const open = isControlled ? (value as string[]) : internal;
    const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const baseId = useId();

    const toggle = (id: string) => {
      const isOpen = open.includes(id);
      const next = type === 'single' ? (isOpen ? [] : [id]) : isOpen ? open.filter((x) => x !== id) : [...open, id];
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const onHeaderKeyDown = (e: React.KeyboardEvent, index: number) => {
      const headers = items
        .filter((it) => !it.disabled)
        .map((it) => headerRefs.current[it.id])
        .filter(Boolean) as HTMLButtonElement[];
      const pos = headers.indexOf(headerRefs.current[items[index].id] as HTMLButtonElement);
      const focusAt = (i: number) => headers[(i + headers.length) % headers.length]?.focus();
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        focusAt(pos + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        focusAt(pos - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        headers[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        headers[headers.length - 1]?.focus();
      }
    };

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)}>
        {items.map((item, index) => {
          const isOpen = open.includes(item.id);
          const headingId = `${baseId}-h-${item.id}`;
          const panelId = `${baseId}-p-${item.id}`;
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
            >
              <h3 className="m-0">
                <button
                  ref={(el) => {
                    headerRefs.current[item.id] = el;
                  }}
                  type="button"
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  disabled={item.disabled}
                  onClick={() => toggle(item.id)}
                  onKeyDown={(e) => onHeaderKeyDown(e, index)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-neutral-100 outline-none transition',
                    'focus-visible:ring-2 focus-visible:ring-emerald-400/60',
                    'motion-reduce:transition-none',
                    item.disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span>{item.title}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'text-neutral-500 transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  >
                    ▾
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className={cn(
                  'grid transition-all duration-300 ease-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 text-sm leading-relaxed text-neutral-400">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = 'Accordion';
