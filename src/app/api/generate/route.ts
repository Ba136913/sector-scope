import { GoogleGenerativeAI } from '@google/generative-ai';

const systemInstructionText = `
  You are an elite world-class full-stack developer. 
  Build a stunning, fully functional web application in a single HTML file using Tailwind CSS. 
  Output ONLY the raw HTML code. NO markdown, NO chatter. 
  Include robust interactivity with Vanilla JS.
`;

async function handleGemini(prompt: string, history: any[], modelName: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: { role: "system", parts: [{ text: systemInstructionText }] }
  });

  const chat = model.startChat({
    history: history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessage(prompt);
  return result.response.text();
}

async function handlePollinationsFallback(prompt: string, model: string = "openai") {
  // Try POST first
  try {
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemInstructionText }, { role: "user", content: prompt }],
        model: model,
        seed: Math.floor(Math.random() * 1000000)
      })
    });
    if (response.ok) return await response.text();
  } catch (e) {}

  // Try GET fallback
  const encodedPrompt = encodeURIComponent(prompt);
  const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=${model}&system=${encodeURIComponent(systemInstructionText)}`);
  if (!response.ok) throw new Error(`${model} totally failed`);
  return await response.text();
}

export async function POST(req: Request) {
  try {
    const { prompt, history } = await req.json();

    // 1. Try Gemini Models (Aapki Key)
    const geminiModels = ["gemini-2.0-flash", "gemini-flash-latest"];
    for (const model of geminiModels) {
      try {
        console.log(`Trying ${model}...`);
        const code = await handleGemini(prompt, history, model);
        if (code) return new Response(code.replace(/```html/gi, '').replace(/```/g, '').trim());
      } catch (e) {
        console.warn(`${model} error, switching...`);
      }
    }

    // 2. Try Pollinations (Free Unlimited Backup)
    const backupModels = ["llama", "qwen", "mistral", "searchgpt"];
    for (const model of backupModels) {
      try {
        console.log(`Emergency: Trying Pollinations with ${model}...`);
        const code = await handlePollinationsFallback(prompt, model);
        if (code && code.length > 100) {
           return new Response(code.replace(/```html/gi, '').replace(/```/g, '').trim());
        }
      } catch (e: any) {
        console.error(`Pollinations ${model} failed:`, e.message);
      }
    }

    throw new Error("Critical Failure: All AI Engines (Gemini & Pollinations) are currently unreachable. Please check your internet connection or GEMINI_API_KEY.");

  } catch (error: any) {
    console.error("Master Failure:", error.message);
    return new Response(`Oops: ${error.message}`, { status: 500 });
  }
}
