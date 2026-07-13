const fs = require('fs');
const data = fs.readFileSync('postman_collection.json', 'utf8');
const p = 25530;
const slice = data.slice(Math.max(0, p - 40), p + 40);
console.log('---excerpt---');
console.log(slice);
console.log('---codepoints---');
console.log([...slice].map((c, i) => `${i}:${c.charCodeAt(0)}:${c}`).join(' '));
let line=1, col=1;
for (let i = 0; i < p; i++) {
  if (data[i] === '\n') { line++; col = 1; } else { col++; }
}
console.log('line', line, 'col', col);
