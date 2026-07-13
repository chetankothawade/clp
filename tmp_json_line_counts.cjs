const fs = require('fs');
const data = fs.readFileSync('postman_collection.json', 'utf8');
const lines = data.split(/\r?\n/);
let inStr = false;
let esc = false;
let brace = 0;
let bracket = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (!inStr) {
      if (c === '"') {
        inStr = true;
      } else if (c === '{') {
        brace++;
      } else if (c === '}') {
        brace--;
      } else if (c === '[') {
        bracket++;
      } else if (c === ']') {
        bracket--;
      }
    } else {
      if (esc) {
        esc = false;
      } else if (c === '\\') {
        esc = true;
      } else if (c === '"') {
        inStr = false;
      }
    }
  }
  if (i >= 440) {
    console.log(`${i+1} ${brace} ${bracket} ${line}`);
  }
}
console.log('FINAL', brace, bracket, 'inStr', inStr, 'esc', esc);
