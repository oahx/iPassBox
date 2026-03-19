const iconGen = require('icon-gen');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'Logo.jpeg');
const outputDir = path.join(__dirname, '..', 'build');

iconGen(inputPath, outputDir, {
  report: true,
  ico: {
    name: 'icon',
    sizes: [16, 24, 32, 48, 64, 128, 256]
  }
}).then((results) => {
  console.log('ICO generated:', results);
}).catch((err) => {
  console.error('Error:', err);
});
