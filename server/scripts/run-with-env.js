const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const scriptToRun = process.argv[2];

if (!scriptToRun) {
  console.error('Error: Please provide a script to run.');
  console.log('Usage: node server/scripts/run-with-env.js <path-to-script>');
  process.exit(1);
}

const child = spawn('node', [scriptToRun], { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code);
});