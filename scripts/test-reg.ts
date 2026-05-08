async function test() {
  const res = await fetch('http://127.0.0.1:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinicName: 'Test', name: 'QA', email: 'qa2@test.com', password: 'pass' })
  });
  console.log(res.status, await res.text());
}
test();
