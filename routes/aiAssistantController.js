import fs from 'fs'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

export const generateAIResponse = async (req, res) => {
  const { prompt, voice_id } = req.body
  if (!prompt || !voice_id) {
    return res.status(400).json({ error: 'Missing prompt or voice_id' })
  }

  try {
    // Step 1: Get GPT response from OpenAI
    const chatRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    })

    const aiText = chatRes.data.choices[0].message.content

    // Step 2: Convert GPT text to speech using ElevenLabs
    const audioRes = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        text: aiText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    const fileName = `response-${uuidv4()}.mp3`
    const filePath = `./output/${fileName}`
    fs.writeFileSync(filePath, audioRes.data)

    res.json({ audio_url: `/output/${fileName}` })
  } catch (err) {
    console.error('AI Assistant error:', err.message)
    res.status(500).json({ error: 'AI response generation failed' })
  }
}
