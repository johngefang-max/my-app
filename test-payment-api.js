// Test script for the payment API
const testPaymentAPI = async () => {
  const url = 'http://localhost:3000/api/payments/creem/create';

  // Test 1: Missing body
  console.log('Test 1: Missing body');
  const response1 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log('Response:', response1.status, await response1.json());

  // Test 2: Empty JSON body
  console.log('\nTest 2: Empty JSON body');
  const response2 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{}'
  });
  console.log('Response:', response2.status, await response2.json());

  // Test 3: Valid body without authentication
  console.log('\nTest 3: Valid body without authentication');
  const response3 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId: 'pro_monthly' })
  });
  console.log('Response:', response3.status, await response3.json());

  // Test 4: Test the debug endpoint
  console.log('\nTest 4: Debug endpoint');
  const debugResponse = await fetch('http://localhost:3000/api/payments/creem/debug-create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId: 'pro_monthly' })
  });
  console.log('Debug Response:', debugResponse.status, await debugResponse.json());
};

// Run tests
testPaymentAPI().catch(console.error);