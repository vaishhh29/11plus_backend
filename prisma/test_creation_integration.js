const http = require('http');

// Step 1: Login to get token
const loginData = JSON.stringify({
  username: 'adminofelevenplus@gmail.com',
  password: 'elevenplusbydt'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const reqLogin = http.request(loginOptions, resLogin => {
  let body = '';
  resLogin.on('data', chunk => body += chunk);
  resLogin.on('end', () => {
    if (resLogin.statusCode !== 200) {
      console.error('Login failed:', body);
      process.exit(1);
    }
    const responseData = JSON.parse(body);
    const token = responseData.token;
    console.log('Login successful relationships! Recieved token.');

    // Step 2: Create a new teacher
    const userData = JSON.stringify({
      username: `tutor_connor_${Math.floor(Math.random() * 1000)}`,
      email: `tutor_connor_${Math.floor(Math.random() * 1000)}@tution.com`,
      name: 'Teacher Connor',
      password: 'TemporaryPassword123!',
      role: 'TEACHER',
      subjects: ['Maths', 'English'],
      contactInfo: '+44 7700 900088'
    });

    const createOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(userData),
        'Authorization': `Bearer ${token}`
      }
    };

    const reqCreate = http.request(createOptions, resCreate => {
      let createBody = '';
      resCreate.on('data', chunk => createBody += chunk);
      resCreate.on('end', () => {
        console.log(`CREATE USER STATUS: ${resCreate.statusCode}`);
        console.log('CREATE USER RESPONSE:', createBody);
      });
    });

    reqCreate.on('error', err => console.error('Create User request error:', err));
    reqCreate.write(userData);
    reqCreate.end();
  });
});

reqLogin.on('error', err => console.error('Login request error:', err));
reqLogin.write(loginData);
reqLogin.end();
