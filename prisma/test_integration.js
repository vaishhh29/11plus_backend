const http = require('http');

const data = JSON.stringify({
  username: 'adminofelevenplus@gmail.com',
  password: 'elevenplusbydt'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`STATUS CODE: ${res.statusCode}`);
    console.log('RAW RESPONSE:', body);
  });
});

req.on('error', error => console.error('ERROR OBJECT:', error));
req.write(data);
req.end();
