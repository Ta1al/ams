/*
Probe backend connectivity.

PowerShell:
$env:BASE_URL='http://localhost:5000'
node .\scripts\probe-health.js
*/

const { request } = require('./httpClient');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

(async () => {
  try {
    const data = await request({ baseUrl: BASE_URL, path: '/', method: 'GET' });
    console.log('OK:', data);
  } catch (err) {
    console.error('Probe failed:', err.message);
    if (err.cause) console.error('Cause:', err.cause);
    if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
    process.exitCode = 1;
  }
})();
