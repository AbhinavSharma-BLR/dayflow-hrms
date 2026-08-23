const fetch = require('node-fetch');

async function testVercel() {
  console.log('Testing Vercel Deployment...');
  
  // Try to login with demo credentials
  const url = 'https://dayflow-hrms-phi.vercel.app/api/auth/callback/credentials';
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: 'admin.hr@dayflow.com',
      password: 'Admin123!',
      redirect: 'false'
    })
  });
  
  console.log('Status:', res.status, res.statusText);
  try {
    const json = await res.json();
    console.log('Response JSON:', json);
  } catch(e) {
    const text = await res.text();
    console.log('Response Text (first 500 chars):', text.substring(0, 500));
  }
}

testVercel();
