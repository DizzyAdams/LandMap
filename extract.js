const fs = require('fs');
const code = fs.readFileSync('lovable_index.js', 'utf8');
const classNames = [...code.matchAll(/className:\"([^\"]+)\"/g)].map(m => m[1]);
const texts = [...code.matchAll(/children:\"([^\"]+)\"/g)].map(m => m[1]);
console.log('--- CLASSNAMES ---');
console.log(classNames.slice(0, 50));
console.log('--- TEXTS ---');
console.log(texts.slice(0, 50));
