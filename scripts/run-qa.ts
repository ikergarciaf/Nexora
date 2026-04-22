async function runTests() {
  const baseUrl = 'http://127.0.0.1:3000';
  let jwtToken = '';
  
  console.log("=== STARTING QA END-TO-END TESTS ===");

  // 1. Health check
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    console.log("Health check:", res.status === 200 ? "PASS" : "FAIL");
  } catch (e) {
    console.error("Health check failed. Is the server running on port 3000?");
    return;
  }

  // 2. Register
  const userPayload = {
    email: `test_${Date.now()}@clinic.com`,
    password: "TestPassword123!",
    name: "Dr. QA Tester",
    clinicName: "QA Dental Care"
  };
  
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    });
    const data = await res.json();
    if (res.status === 201 && data.token) {
      console.log("Registration:", "PASS");
      jwtToken = data.token;
    } else {
      console.log("Registration:", "FAIL", data);
      return;
    }
  } catch (e) {
    console.error("Registration failed", e);
    return;
  }

  // 3. Create Patient
  let patientId = "";
  try {
    const res = await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ fullName: "Michael QA", phone: "555-0101", tags: "Anxious, Needs Whitening" })
    });
    const data = await res.json();
    if (res.status === 201) {
      console.log("Patient Creation:", "PASS");
      patientId = data.id;
    } else {
      console.log("Patient Creation:", "FAIL", data);
    }
  } catch (e) {
    console.error("Patient Create failed", e);
  }

  // 4. Test Dashboard Stats
  try {
    const res = await fetch(`${baseUrl}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    if (res.status === 200) {
      console.log("Dashboard Stats:", "PASS");
    } else {
      console.log("Dashboard Stats:", "FAIL", await res.text());
    }
  } catch (e) {
    console.error("Stats failed", e);
  }

  // 5. Test AI 
  try {
    const res = await fetch(`${baseUrl}/api/ai/inactive-campaign`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    if (res.status === 200) {
      console.log("AI Reactivation Generation:", "PASS");
    } else {
      console.log("AI Reactivation Generation:", "FAIL", await res.text());
    }
  } catch(e) {
    console.error("AI Reactivation failed", e);
  }

  console.log("=== TESTS COMPLETE ===");
}

runTests();
