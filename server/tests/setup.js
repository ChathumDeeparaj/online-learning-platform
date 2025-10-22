// server/tests/setup.js
const path = require('path');

// Load environment variables from the .env file for all test suites
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });