const fs = require('fs');
const s = fs.readFileSync('postman_collection.json', 'utf8');
let inStr = false;
let esc = false;
let brace = 0;
let bracket = 0;
for (let i = 0; i < s.length; i++) {
  const c = s[i];
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
console.log('brace', brace, 'bracket', bracket, 'inStr', inStr, 'esc', esc);
