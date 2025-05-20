// services/openaiService.js
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getOpenAIResponse = async (userPrompt, userInput) => {
  try {
    const fullPrompt = `
You are a smart, polite and helpful AI calling agent.

[USER INSTRUCTION]: ${userPrompt}

[CALLER SAID]: ${userInput}

Based on the above, generate a natural and conversational voice reply.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    return "I'm sorry, I couldn't understand that. Please try again later.";
  }
};
