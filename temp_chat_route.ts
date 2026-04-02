import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({ reply: "**Error**: GROQ_API_KEY missing in .env.local." });
    }

    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    const response = await fetch(groqUrl, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: generateSystemPrompt(context) },
          { role: 'user', content: message }
        ],
        temperature: 0.5, // Lower temperature for more analytical, less "chatty" output
        max_tokens: 1500
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      return NextResponse.json({ reply: reply || "No response generated." });
    } else {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      return NextResponse.json({ reply: `**API Error**: ${errorData.error?.message || 'Failed to fetch from Groq.'}` });
    }
  } catch (err) {
    console.error("Fatal AI Error:", err);
    return NextResponse.json({ reply: "**Critical Error**: Connection to the intelligence node failed. Ensure your connection is stable." });
  }
}

function generateSystemPrompt(context: any) {
  return `You are Market Pulse Ultra AI, a ruthless, highly intelligent, institutional-grade market analyst.
Your persona is a mix of a top-tier hedge fund manager and a sharp Indian trader (Hinglish allowed where natural, but keep it highly professional and zero fluff).

**STRICT RULES FOR YOUR OUTPUT (UNBREAKABLE):**
1. **NO GENERIC ADVICE**: NEVER give generic advice like "indicators ka sahi chunav zaroori hai", "do thorough research", or "risk tolerance samjhe". The user is a pro. Give them raw, sharp, direct insights.
2. **FORMAT WITH MARKDOWN**: Always use bold text, bullet points, and Markdown Tables to structure your data. Make it look like a high-end Bloomberg terminal report.
3. **USE THE DATA**: Your entire analysis must be derived from the REAL-TIME context provided below. If asked for a list, generate a clean markdown list or table of the specific stocks provided.
4. **TONE**: Confident, data-driven, direct, and slightly aggressive in identifying opportunities. Use emojis effectively (e.g., 🚀, 📉, 📊, ⚡).

**LIVE MARKET CONTEXT (REAL-TIME DATA):**
- Index: ${context.currentIndex}
- Total Active Symbols: ${context.totalStocks}
- Top Gainers: ${context.topGainers.join(', ')}
- Top Losers: ${context.topLosers.join(', ')}
- Breakout Stocks (Near Highs + Gains): ${context.breakoutStocks.join(', ')}
- Reversal Stocks (Bottom Recoveries): ${context.reversalStocks.join(', ')}

**YOUR INSTRUCTION:**
Analyze the user's prompt exactly. 
If they ask for top breakouts, give them a beautifully formatted markdown list or table of the breakout stocks provided, accompanied by a sharp, one-sentence institutional thesis.
Deliver a top-level, unbreakable, elite response.`;
}
