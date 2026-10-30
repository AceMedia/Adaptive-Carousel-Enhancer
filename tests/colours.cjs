const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(require('path').join(__dirname, '../src/frontend.js'), 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(source.match(/function safeColour[\s\S]*?\n}/)[0], context);
for (const value of ['red; background:url(https://evil.invalid)', '\" onmouseover=alert(1) x=\"', '#abcdefz', 'rgb(0,0,0)']) {
  if (context.safeColour(value, '#000000') !== '#000000') throw Error('Unsafe colour accepted');
}
for (const value of ['#fff', '#ffff', '#123456', '#12345678']) {
  if (context.safeColour(value, '#000000') !== value) throw Error('Valid hex colour rejected');
}
console.log('Colour validation: eight cases passed');
