import fetch from 'node-fetch';

async function testAPI() {
  const prompt = 'A realistic portrait of a 25 year old woman, clear face, 8K, high detail';

  const res = await fetch('https://api.ohmygpt.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer sk-5zDZJRmFac849b002C27T3BlbKFJ80C7A7fbdA21459881DF`,
    },
    body: JSON.stringify({
      model: 'dall-e-2',
      prompt,
      size: '1024x1024',
      n: 1,
    }),
  });

  console.log('Status:', res.status);
  console.log('Status Text:', res.statusText);

  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testAPI().catch(console.error);