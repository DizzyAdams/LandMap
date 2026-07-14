#!/usr/bin/env node
// Extract keyframes and custom classes from lovable_styles.css
const fs = require('fs');
const content = fs.readFileSync('lovable_styles.css', 'utf-8');

// Extract @keyframes names
const keyframeMatches = content.match(/@keyframes\s+(\w+)/g);
console.log('=== KEYFRAMES ===');
if (keyframeMatches) {
  const unique = [...new Set(keyframeMatches.map(k => k.replace('@keyframes ', '')))];
  unique.forEach(k => console.log(`@keyframes ${k}`));
}

// Extract keyframe blocks with their content (approximate)
const keyframeBlocks = content.match(/@keyframes\s+\w+\s*\{[^}]*\}/g);
console.log(`\n=== KEYFRAME BLOCK COUNT: ${keyframeBlocks ? keyframeBlocks.length : 0} ===`);

// Extract all custom animation names used
const animUses = content.match(/animation:\s*([^;]+)/g);
console.log('\n=== ANIMATION REFERENCES ===');
if (animUses) {
  animUses.forEach(a => console.log(a.trim().substring(0, 120)));
}

// Look for specific class names
const classesToFind = ['\\be\\.?yebrow', 'link-underline', 'marquee', 'hairline', 'cadastre', 'ledger-num', 'cta-glow', 'pulse', '\\.chip', '\\.glass', '\\.surface', '\\.btn', 'shimmer', 'skeleton'];
console.log('\n=== CLASS SEARCH ===');
classesToFind.forEach(cls => {
  const re = new RegExp('\\b' + cls.replace(/^\\./, '') + '\\b', 'g');
  const match = content.match(re);
  if (match) console.log(`Found "${cls.replace(/^\\/, '')}" (${match.length} times)`);
});

// Extract all unique CSS class selectors  
const classes = content.match(/\.([\w-]+)\s*\{/g);
if (classes) {
  const uniqueClasses = [...new Set(classes.map(c => c.replace(/\s*\{/, '')))];
  const nonTailwind = uniqueClasses.filter(c => {
    const name = c.replace('.', '');
    return name.length > 2 && !name.startsWith('group') && !name.startsWith('peer') && 
           !name.startsWith('has-') && !name.startsWith('data-') && !name.startsWith('aria-') &&
           !name.match(/^(m|p|gap|space|scroll|inset|top|right|bottom|left|z|w|h|min|max|text|font|leading|tracking|rounded|border|bg|opacity|shadow|ring|transition|duration|ease|delay|scale|rotate|translate|skew|origin|cursor|select|resize|appearance|outline|pointer|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop|grid|col|row|auto|place|content|justify|items|self|float|clear|object|overflow|overscroll|box|block|inline|table|list|divide|filter|will-change|touch|snap|scroll-behavior|hyphens|decoration|underline|font-variant|normal-nums|ordinal|slashed|lining|oldstyle|proportional|tabular|diagonal|stacked|accent|caret|fill|stroke|mix-blend|bg-blend|columns|break-before|break-after|break-inside|box-decoration|bg-fixed|bg-local|bg-scroll|bg-clip|bg-origin|bg-bottom|bg-center|bg-left|bg-right|bg-top|bg-repeat|bg-auto|bg-cover|bg-contain|bg-none|bg-gradient|via|to|from|isolate|isolation|static|fixed|absolute|relative|sticky|visible|invisible|collapse|sr-only|not-sr-only|container|prose|flex|inline-flex|inline-block|inline|block|hidden|table-cell|table-row|table-header-group|table-row-group|flow-root|contents|list-item)s?[-]?/) && 
           !name.startsWith('aspect-') && !name.startsWith('animate-');
  });
  console.log(`\n=== NON-TAILWIND CLASSES (${nonTailwind.length}) ===`);
  nonTailwind.sort().forEach(c => console.log(c));
}
