const http = require('http');

http.get('http://localhost:3000/api/ojt/refresh-cache', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('⚡ Server refresh ok:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});
