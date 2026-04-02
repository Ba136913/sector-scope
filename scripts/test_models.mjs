import fs from 'fs';

// Read API key
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY="(.+)"/)[1];

const modelsToTest = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-flash-latest",
  "gemini-1.5-pro",
  "gemini-pro-latest"
];

async function testModel(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: "hi" }] }]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    
    if (res.ok) {
      console.log(`✅ ${modelName}: WORKING`);
      return true;
    } else {
      console.log(`❌ ${modelName}: FAILED (${res.status}) - ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${modelName}: ERROR - ${e.message}`);
    return false;
  }
}

async function runTests() {
  console.log("Testing models to find a working one...");
  for (const model of modelsToTest) {
    const success = await testModel(model);
    if (success) {
      console.log(`\nSuggestion: Use "${model}" in your route.ts`);
      // We found one, but let's see if others work too for variety
    }
  }
}

runTests();
