import fs from 'fs';
import path from 'path';

// Read API key manually to avoid dotenv issues in simple script
const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY="(.+)"/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : '';

async function listModels() {
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
        console.log("Available Models:");
        data.models.forEach(m => {
            console.log("- " + m.name + " (" + m.displayName + ")");
        });
    } else {
        console.log("Error response:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

listModels();
