// api/chat.js (Vercel serverless function)
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set this in Vercel dashboard
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for FreshBasket grocery store. Help customers with product questions, orders, and general grocery shopping inquiries. Keep responses concise and helpful."
        },
        {
          role: "user", 
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    res.json({ 
      reply: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.' 
    });
  }
}