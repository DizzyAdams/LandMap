#!/usr/bin/env python3
"""Analyze lovable_styles.css for custom classes, keyframes, and component patterns."""
import re
import os

# Read the file
with open('lovable_styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"=== FILE SIZE: {len(content)} bytes ===")

# 1. Find ALL @keyframes blocks
keyframe_pattern = r'@keyframes\s+(\w+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}'
keyframes = re.findall(keyframe_pattern, content)
print(f"\n=== @keyframes FOUND: {len(keyframes)} ===")
for name, body in keyframes:
    print(f"  @keyframes {name} {{ ... }}")

# 2. Find ALL custom class names (non-Tailwind, specific patterns)
# Look for .className { patterns
class_pattern = r'\.([a-zA-Z][\w-]*)\s*\{'
all_classes = set(re.findall(class_pattern, content))

# Filter out common Tailwind pseudo/variants
tailwind_prefixes = [
    'hover', 'focus', 'active', 'disabled', 'visited', 'first', 'last', 'odd', 'even',
    'group', 'peer', 'placeholder', 'selection', 'marker', 'before', 'after',
    'sm:', 'md:', 'lg:', 'xl:', '2xl:', 'dark:', 'motion-safe:', 'motion-reduce:',
    'max-sm:', 'max-md:', 'max-lg:', 'max-xl:', 'max-2xl:',
    'data-', 'aria-',
    'not-', 'only-', 'focus-visible', 'focus-within', 'target',
    'open', 'closed', 'indeterminate', 'default', 'checked', 'enabled',
    'required', 'valid', 'invalid', 'in-range', 'out-of-range',
    'read-only', 'read-write',
    'has-', 'where', 'is',
    'ltr', 'rtl',
    '@', '\\', '&',
]

# Known Tailwind utility classes to exclude
tailwind_utilities = {
    'container', 'prose', 'sr-only', 'not-sr-only', 'sr\:only',
    'grid', 'flex', 'inline-flex', 'inline-block', 'inline', 'block', 'hidden',
    'table', 'table-cell', 'table-row', 'table-header-group', 'table-row-group',
    'flow-root', 'contents', 'list-item',
    'static', 'fixed', 'absolute', 'relative', 'sticky',
    'visible', 'invisible', 'collapse',
    'inset-0', 'inset-x-0', 'inset-y-0',
    'top-0', 'right-0', 'bottom-0', 'left-0',
    'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    'flex-1', 'flex-auto', 'flex-initial', 'flex-none',
    'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
    'flex-grow', 'flex-shrink', 'grow', 'shrink',
    'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
    'justify-start', 'justify-end', 'justify-center', 'justify-between',
    'justify-around', 'justify-evenly',
    'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
    'self-start', 'self-end', 'self-center', 'self-baseline', 'self-stretch',
    'order-1', 'order-2', 'order-3', 'order-4', 'order-5', 'order-6',
    'order-first', 'order-last', 'order-none',
    'gap-0', 'gap-x-0', 'gap-y-0',
    'space-x-0', 'space-y-0',
    'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
    'overflow-x-auto', 'overflow-y-auto',
    'truncate', 'overflow-ellipsis', 'overflow-clip',
    'whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap',
    'break-normal', 'break-words', 'break-all', 'break-keep',
    'rounded', 'rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
    'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l',
    'border', 'border-0', 'border-2', 'border-4', 'border-8',
    'border-t', 'border-r', 'border-b', 'border-l',
    'border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-hidden', 'border-none',
    'bg-transparent', 'bg-current', 'bg-black', 'bg-white', 'bg-inherit',
    'text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end',
    'text-xs', 'text-sm', 'text-base', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
    'text-xxs',
    'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
    'uppercase', 'lowercase', 'capitalize', 'normal-case',
    'italic', 'not-italic',
    'underline', 'overline', 'line-through', 'no-underline',
    'antialiased', 'subpixel-antialiased',
    'list-inside', 'list-outside',
    'list-disc', 'list-decimal', 'list-none',
    'opacity-0', 'opacity-5', 'opacity-10', 'opacity-20', 'opacity-25', 'opacity-30', 'opacity-40', 'opacity-50', 'opacity-60', 'opacity-70', 'opacity-75', 'opacity-80', 'opacity-90', 'opacity-95', 'opacity-100',
    'shadow', 'shadow-none', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner',
    'shadow-xs',
    'ring', 'ring-0', 'ring-1', 'ring-2', 'ring-4', 'ring-8',
    'ring-inset',
    'ring-offset-0', 'ring-offset-1', 'ring-offset-2', 'ring-offset-4', 'ring-offset-8',
    'transition', 'transition-none', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform',
    'duration-0', 'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
    'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
    'delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-500', 'delay-700', 'delay-1000',
    'scale-0', 'scale-25', 'scale-50', 'scale-75', 'scale-90', 'scale-95', 'scale-100', 'scale-105', 'scale-110', 'scale-125', 'scale-150',
    'rotate-0', 'rotate-1', 'rotate-2', 'rotate-3', 'rotate-6', 'rotate-12', 'rotate-45', 'rotate-90', 'rotate-180',
    '-rotate-1', '-rotate-2', '-rotate-3', '-rotate-6', '-rotate-12', '-rotate-45', '-rotate-90', '-rotate-180',
    'translate-x-0', '-translate-x-0', 'translate-y-0', '-translate-y-0',
    'skew-x-0', '-skew-x-0', 'skew-y-0', '-skew-y-0',
    'origin-center', 'origin-top', 'origin-top-right', 'origin-right', 'origin-bottom-right', 'origin-bottom', 'origin-bottom-left', 'origin-left', 'origin-top-left',
    'cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move', 'cursor-help', 'cursor-not-allowed',
    'select-none', 'select-text', 'select-all', 'select-auto',
    'resize', 'resize-none', 'resize-y', 'resize-x',
    'appearance-none',
    'outline-none', 'outline-0', 'outline-1', 'outline-2', 'outline-4', 'outline-8',
    'outline', 'outline-dashed', 'outline-dotted', 'outline-double', 'outline-hidden',
    'outline-offset-0', 'outline-offset-1', 'outline-offset-2', 'outline-offset-4', 'outline-offset-8',
    'pointer-events-none', 'pointer-events-auto',
    'select-all', 'select-auto', 'select-none', 'select-text',
    'blur', 'blur-none', 'blur-sm', 'blur-md', 'blur-lg', 'blur-xl', 'blur-2xl', 'blur-3xl',
    'brightness-0', 'brightness-50', 'brightness-75', 'brightness-90', 'brightness-95', 'brightness-100', 'brightness-105', 'brightness-110', 'brightness-125', 'brightness-150', 'brightness-200',
    'contrast-0', 'contrast-50', 'contrast-75', 'contrast-100', 'contrast-125', 'contrast-150', 'contrast-200',
    'drop-shadow', 'drop-shadow-none', 'drop-shadow-sm', 'drop-shadow-md', 'drop-shadow-lg', 'drop-shadow-xl', 'drop-shadow-2xl',
    'grayscale', 'grayscale-0',
    'hue-rotate-0', 'hue-rotate-15', 'hue-rotate-30', 'hue-rotate-60', 'hue-rotate-90', 'hue-rotate-180',
    'invert', 'invert-0',
    'saturate-0', 'saturate-50', 'saturate-100', 'saturate-150', 'saturate-200',
    'sepia', 'sepia-0',
    'backdrop-filter', 'backdrop-blur', 'backdrop-brightness', 'backdrop-contrast', 'backdrop-grayscale', 'backdrop-hue-rotate', 'backdrop-invert', 'backdrop-opacity', 'backdrop-saturate', 'backdrop-sepia',
    'm-0', 'mx-0', 'my-0', 'mt-0', 'mr-0', 'mb-0', 'ml-0',
    'p-0', 'px-0', 'py-0', 'pt-0', 'pr-0', 'pb-0', 'pl-0',
    'gap-0', 'gap-x-0', 'gap-y-0',
    'leading-3', 'leading-4', 'leading-5', 'leading-6', 'leading-7', 'leading-8', 'leading-9', 'leading-10',
    'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
    'tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',
    'w-0', 'h-0',
    'w-auto', 'h-auto',
    'w-px', 'h-px',
    'w-full', 'h-full',
    'w-screen', 'h-screen',
    'min-w-0', 'min-h-0',
    'min-w-full', 'min-h-full',
    'min-w-screen', 'min-h-screen',
    'max-w-none', 'max-w-full', 'max-w-screen',
    'max-h-none', 'max-h-full', 'max-h-screen',
    'aspect-auto', 'aspect-square', 'aspect-video',
    'object-contain', 'object-cover', 'object-fill', 'object-none', 'object-scale-down',
    'object-bottom', 'object-center', 'object-left', 'object-left-bottom', 'object-left-top', 'object-right', 'object-right-bottom', 'object-right-top', 'object-top',
    'row-auto', 'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4', 'row-span-5', 'row-span-6', 'row-span-full',
    'row-start-1', 'row-end-1',
    'col-auto', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8', 'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12', 'col-span-full',
    'col-start-1', 'col-end-1',
    'auto-cols-auto', 'auto-cols-fr', 'auto-cols-max', 'auto-cols-min',
    'auto-rows-auto', 'auto-rows-fr', 'auto-rows-max', 'auto-rows-min',
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11', 'grid-cols-12', 'grid-cols-none',
    'grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5', 'grid-rows-6', 'grid-rows-none',
    'place-content-center', 'place-items-center', 'place-self-center',
    'content-center', 'content-start', 'content-end', 'content-between', 'content-around', 'content-evenly', 'content-baseline', 'content-stretch',
    'justify-items-start', 'justify-items-end', 'justify-items-center', 'justify-items-stretch',
    'justify-self-auto', 'justify-self-start', 'justify-self-end', 'justify-self-center', 'justify-self-stretch',
    'items-baseline', 'items-stretch',
    'self-baseline', 'self-stretch',
    'float-right', 'float-left', 'float-none',
    'clear-left', 'clear-right', 'clear-both', 'clear-none',
    'object-scale-down',
    'overflow-clip',
    'overscroll-auto', 'overscroll-contain', 'overscroll-none', 'overscroll-y-auto', 'overscroll-y-contain', 'overscroll-y-none',
    'box-border', 'box-content',
    'block', 'inline-block', 'inline',
    'min-w-max', 'min-w-min', 'min-w-fit',
    'max-w-max', 'max-w-min', 'max-w-fit', 'max-w-prose',
    'max-h-max', 'max-h-min', 'max-h-fit',
    'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',
    'animate-fade-in', 'animate-fade-out', 'animate-slide-in', 'animate-slide-out',
    'animate-fadeIn', 'animate-fadeOut', 'animate-slideIn', 'animate-slideOut',
    'animate-scaleIn', 'animate-scaleOut',
    'cursor-col-resize', 'cursor-row-resize', 'cursor-n-resize', 'cursor-e-resize', 'cursor-s-resize', 'cursor-w-resize', 'cursor-ne-resize', 'cursor-nw-resize', 'cursor-se-resize', 'cursor-sw-resize', 'cursor-ew-resize', 'cursor-ns-resize', 'cursor-nesw-resize', 'cursor-nwse-resize', 'cursor-crosshair', 'cursor-grab', 'cursor-grabbing', 'cursor-zoom-in', 'cursor-zoom-out',
    'tab', 'tab-',
    'isolate', 'isolation-auto',
    'will-change-auto', 'will-change-scroll', 'will-change-contents', 'will-change-transform',
    'touch-auto', 'touch-none', 'touch-pan-x', 'touch-pan-y', 'touch-pan-left', 'touch-pan-right', 'touch-pan-up', 'touch-pan-down', 'touch-pinch-zoom', 'touch-manipulation',
    'snap-none', 'snap-x', 'snap-y', 'snap-both', 'snap-mandatory', 'snap-proximity',
    'snap-start', 'snap-end', 'snap-center', 'snap-align-none',
    'snap-normal', 'snap-always',
    'scroll-m-0', 'scroll-mx-0', 'scroll-my-0', 'scroll-mt-0', 'scroll-mr-0', 'scroll-mb-0', 'scroll-ml-0',
    'scroll-p-0', 'scroll-px-0', 'scroll-py-0', 'scroll-pt-0', 'scroll-pr-0', 'scroll-pb-0', 'scroll-pl-0',
    'list-\\[',
    'accent-auto', 'accent-red', 'accent-blue', 'accent-green', 'accent-yellow', 'accent-purple', 'accent-pink', 'accent-rose', 'accent-orange', 'accent-amber', 'accent-lime', 'accent-emerald', 'accent-teal', 'accent-cyan', 'accent-sky', 'accent-indigo', 'accent-violet', 'accent-fuchsia', 'accent-gray', 'accent-slate', 'accent-zinc', 'accent-neutral', 'accent-stone', 'accent-current', 'accent-transparent', 'accent-black', 'accent-white', 'accent-inherit',
    'accent-color-transparent', 'accent-color-current',
    'caret-red', 'caret-blue', 'caret-green',
    'columns-1', 'columns-2', 'columns-3', 'columns-4', 'columns-5', 'columns-6', 'columns-7', 'columns-8', 'columns-9', 'columns-10', 'columns-11', 'columns-12', 'columns-auto', 'columns-3xs', 'columns-2xs', 'columns-xs', 'columns-sm', 'columns-md', 'columns-lg', 'columns-xl', 'columns-2xl', 'columns-3xl', 'columns-4xl', 'columns-5xl', 'columns-6xl', 'columns-7xl',
    'break-before-auto', 'break-before-avoid', 'break-before-all', 'break-before-avoid-page', 'break-before-page', 'break-before-left', 'break-before-right', 'break-before-column',
    'break-after-auto', 'break-after-avoid', 'break-after-all', 'break-after-avoid-page', 'break-after-page', 'break-after-left', 'break-after-right', 'break-after-column',
    'break-inside-auto', 'break-inside-avoid', 'break-inside-avoid-page', 'break-inside-avoid-column',
    'box-decoration-clone', 'box-decoration-slice',
    'bg-fixed', 'bg-local', 'bg-scroll',
    'bg-clip-border', 'bg-clip-padding', 'bg-clip-content', 'bg-clip-text',
    'bg-origin-border', 'bg-origin-padding', 'bg-origin-content',
    'bg-bottom', 'bg-center', 'bg-left', 'bg-left-bottom', 'bg-left-top', 'bg-right', 'bg-right-bottom', 'bg-right-top', 'bg-top',
    'bg-repeat', 'bg-no-repeat', 'bg-repeat-x', 'bg-repeat-y', 'bg-repeat-round', 'bg-repeat-space',
    'bg-auto', 'bg-cover', 'bg-contain',
    'bg-none', 'bg-gradient-to-t', 'bg-gradient-to-tr', 'bg-gradient-to-r', 'bg-gradient-to-br', 'bg-gradient-to-b', 'bg-gradient-to-bl', 'bg-gradient-to-l', 'bg-gradient-to-tl',
    'decoration-slice', 'decoration-clone',
    'mix-blend-normal', 'mix-blend-multiply', 'mix-blend-screen', 'mix-blend-overlay', 'mix-blend-darken', 'mix-blend-lighten', 'mix-blend-color-dodge', 'mix-blend-color-burn', 'mix-blend-hard-light', 'mix-blend-soft-light', 'mix-blend-difference', 'mix-blend-exclusion', 'mix-blend-hue', 'mix-blend-saturation', 'mix-blend-color', 'mix-blend-luminosity', 'mix-blend-plus-lighter',
    'bg-blend-normal', 'bg-blend-multiply', 'bg-blend-screen', 'bg-blend-overlay', 'bg-blend-darken', 'bg-blend-lighten', 'bg-blend-color-dodge', 'bg-blend-color-burn', 'bg-blend-hard-light', 'bg-blend-soft-light', 'bg-blend-difference', 'bg-blend-exclusion', 'bg-blend-hue', 'bg-blend-saturation', 'bg-blend-color', 'bg-blend-luminosity',
    'stroke-0', 'stroke-1', 'stroke-2',
    'fill-current', 'stroke-current',
    'filter', 'filter-none',
    'transition-discrete', 'transition-normal',
    'animate-fadeIn', 'animate-slideUp', 'animate-slideDown', 'animate-slideLeft', 'animate-slideRight',
    'animate-scaleUp', 'animate-scaleDown',
    'Motion', 'motion',
    'size-',
    'max-w-0', 'max-h-0',
    'decoration-auto', 'decoration-from-font', 'decoration-0', 'decoration-1', 'decoration-2', 'decoration-4', 'decoration-8',
    'underline-offset-auto', 'underline-offset-0', 'underline-offset-1', 'underline-offset-2', 'underline-offset-4', 'underline-offset-8',
    'text-underline-offset-auto', 'text-underline-offset-0',
    'font-variant-numeric-normal', 'font-variant-numeric-ordinal', 'font-variant-numeric-slashed-zero', 'font-variant-numeric-lining-nums', 'font-variant-numeric-oldstyle-nums', 'font-variant-numeric-proportional-nums', 'font-variant-numeric-tabular-nums', 'font-variant-numeric-diagonal-fractions', 'font-variant-numeric-stacked-fractions',
    'normal-nums', 'ordinal', 'slashed-zero', 'lining-nums', 'oldstyle-nums', 'proportional-nums', 'tabular-nums', 'diagonal-fractions', 'stacked-fractions',
    'ring-offset-blue', 'ring-offset-gray',
    'ring-blue', 'ring-gray',
    'outline-blue', 'outline-gray',
    'decoration-blue', 'decoration-gray', 'decoration-white', 'decoration-black', 'decoration-transparent', 'decoration-current', 'decoration-inherit',
    'accent-blue', 'accent-gray', 'accent-white', 'accent-black', 'accent-transparent', 'accent-current', 'accent-inherit',
    'caret-blue', 'caret-gray', 'caret-white', 'caret-black', 'caret-transparent', 'caret-current', 'caret-inherit',
    'fill-blue', 'fill-gray', 'fill-white', 'fill-black', 'fill-transparent', 'fill-current', 'fill-inherit',
    'stroke-blue', 'stroke-gray', 'stroke-white', 'stroke-black', 'stroke-transparent', 'stroke-current', 'stroke-inherit',
    'divide-blue', 'divide-gray', 'divide-white', 'divide-black', 'divide-transparent', 'divide-current', 'divide-inherit',
    'placeholder-blue', 'placeholder-gray', 'placeholder-white', 'placeholder-black', 'placeholder-transparent', 'placeholder-current', 'placeholder-inherit',
    'ring-offset-transparent', 'ring-offset-current', 'ring-offset-black', 'ring-offset-white',
    'ring-transparent', 'ring-current', 'ring-black', 'ring-white',
    'outline-transparent', 'outline-current', 'outline-black', 'outline-white',
    'scroll-behavior-auto', 'scroll-behavior-smooth',
    'hyphens-none', 'hyphens-manual', 'hyphens-auto',
    'text-wrap', 'text-nowrap', 'text-balance', 'text-pretty',
    'inline-grid', 'inline-table', 'table-caption', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row', 'table-row-group', 'table-cell',
    'content-none',
    'via-transparent', 'via-current', 'via-black', 'via-white',
    'to-transparent', 'to-current', 'to-black', 'to-white',
    'from-transparent', 'from-current', 'from-black', 'from-white',
    'border-x', 'border-y',
    'border-s', 'border-e',
    'rounded-s', 'rounded-e', 'rounded-ss', 'rounded-se', 'rounded-es', 'rounded-ee',
    'scroll-m-0', 'scroll-mx', 'scroll-my',
    'overscroll-contain', 'overscroll-none',
    'box-decoration-slice', 'box-decoration-clone',
    'appearance-auto', 'appearance-none',
    'forced-color-adjust-auto', 'forced-color-adjust-none',
    'print:', 'landscape:', 'portrait:',
    'contrast-more:', 'contrast-less:',
    'motion-reduce:', 'motion-safe:',
    'prefers-reduced-motion:',
    'supports-',
    '@media',
    'aria-busy', 'aria-checked', 'aria-disabled', 'aria-expanded', 'aria-hidden', 'aria-pressed', 'aria-readonly', 'aria-required', 'aria-selected',
    'data-\\[',
    'group\\/',
    'peer\\/',
    '\\/',
    '::before', '::after', '::first-line', '::first-letter', '::placeholder', '::selection', '::backdrop', '::file-selector-button', '::marker',
    '::-webkit-scrollbar', '::-webkit-scrollbar-track', '::-webkit-scrollbar-thumb',
}

def is_custom_class(name):
    """Check if a class name is NOT a standard Tailwind utility."""
    # Skip anything with pseudo-element or variant separators
    if ':' in name or '\\' in name or '@' in name or '[' in name:
        return False
    
    # Skip numeric-only suffixes for Tailwind-like patterns
    if name.startswith('animate-'):
        return True
    
    for prefix in tailwind_prefixes:
        if name.startswith(prefix):
            return False
    
    if name in tailwind_utilities:
        return False
    
    # Common Tailwind number-suffixed patterns
    import re as re2
    if re2.match(r'^(m|mt|mr|mb|ml|mx|my|p|pt|pr|pb|pl|px|py|w|h|min-w|min-h|max-w|max-h|gap|gap-x|gap-y|space-x|space-y|scroll-m|scroll-mx|scroll-my|scroll-ms|scroll-me|scroll-p|scroll-px|scroll-py|scroll-ps|scroll-pe|inset|inset-x|inset-y|top|right|bottom|left)-(\d+|auto|full|screen|fit|max|min|px|1/2|1/3|2/3|1/4|3/4|1/5|2/5|3/5|4/5|1/6|5/6|1/12|2/12|3/12|4/12|5/12|6/12|7/12|8/12|9/12|10/12|11/12|1/6|5/6)$', name):
        return False
    
    return True

custom_classes = sorted([c for c in all_classes if is_custom_class(c)])
print(f"\n=== CUSTOM/COMPONENT CLASSES FOUND: {len(custom_classes)} ===")
for cls in custom_classes:
    print(f"  .{cls}")

# 3. Find specific patterns like .btn, .card, .badge etc.
print("\n=== COMPONENT PATTERN MATCHES ===")
component_patterns = {
    'card': r'\.(card[-\w]*|card\b)',
    'btn': r'\.(btn[-\w]*|btn\b)',
    'badge': r'\.(badge[-\w]*|badge\b)',
    'input': r'\.(input[-\w]*|input\b)',
    'glass': r'\.(glass[-\w]*|glass\b)',
    'gradient': r'\.(gradient[-\w]*|gradient\b)',
    'animate': r'\.(animate[-\w]*|animate\b)',
    'shadow': r'\.(shadow-[a-z][-\w]*|shadow-elegant|shadow-glow|shadow-card)',
    'icon': r'\.(icon[-\w]*|icon\b)',
    'logo': r'\.(logo[-\w]*|logo\b)',
    'nav': r'\.(nav[-\w]*|nav\b)',
    'tab': r'\.(tab[-\w]*|tab\b)',
    'dialog': r'\.(dialog[-\w]*|dialog\b)',
    'tooltip': r'\.(tooltip[-\w]*|tooltip\b)',
    'popover': r'\.(popover-[a-z][-\w]*)',
    'sidebar': r'\.(sidebar[-\w]*|sidebar\b)',
    'select': r'\.(select[-\w]*|select\b)',
}

for pattern_name, pattern in component_patterns.items():
    matches = set(re.findall(pattern, content))
    if matches:
        custom_matches = [m for m in sorted(matches) if m not in tailwind_utilities and ':' not in m]
        if custom_matches:
            print(f"  {pattern_name}: {', '.join(custom_matches)}")

# 4. Find custom gradient/background patterns
print("\n=== CUSTOM GRADIENT / SPECIAL STYLES ===")
for term in ['text-gradient', 'bg-gradient', '\\-gradient', 'linear-gradient', 'conic-gradient', 'radial-gradient']:
    matches = re.findall(r'\.([\w-]+)\s*\{[^}]*' + term, content)
    if matches:
        print(f"  Classes with {term}: {matches[:10]}")

# 5. Find all custom variables used in the file
custom_vars = set(re.findall(r'--([\w-]+)\s*:', content))
print(f"\n=== CUSTOM CSS VARIABLES: {len(custom_vars)} ===")
for v in sorted(custom_vars):
    print(f"  --{v}")

print("\n=== DONE ===")
