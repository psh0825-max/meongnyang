// Generate minimal 1x1 PNG placeholders (will be replaced with real icons later)
const fs = require('fs');

// Minimal valid PNG (1x1 orange pixel)
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync('public/icon-192.png', png);
fs.writeFileSync('public/icon-512.png', png);
fs.writeFileSync('public/favicon.ico', png);
console.log('Icons created');
