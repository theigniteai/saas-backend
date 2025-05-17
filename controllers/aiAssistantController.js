import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config()

// Load from ENV directly
import { GoogleAuth } from 'google-auth-library'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let client

try {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!credentialsJson) {
    throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON in ENV.")
  }

  const credentials = JSON.parse(credentialsJson)

  client = new TextToSpeechClient({
    credentials,
  })
} catch (err) {
  console.error("❌ GCP TTS Client Init Error:", err.message)
}

export const generateAIResponse = async (req, res) => {
  const { prompt, voice_id = 'en-US-Standard-C' } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  if (!client) {
    return res.status(500).json({ error: 'Google TTS client not initialized' })
  }

  try {
    // Step 1: Generate GPT response
    const chatRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    )

    const aiText = chatRes.data.choices[0].message.content
    console.log('[AI TEXT]', aiText)

    // Step 2: Text-to-Speech
    const request = {
      input: { text: aiText },
      voice: {
        languageCode: 'en-US',
        name: voice_id,
      },
      audioConfig: { audioEncoding: 'MP3' },
    }

    const [response] = await client.synthesizeSpeech(request)

    const fileName = `gcp-${uuidv4()}.mp3`
    const filePath = path.join(__dirname, '../output/', fileName)
    fs.writeFileSync(filePath, response.audioContent, 'binary')

    res.json({ audio_url: `/output/${fileName}` })
  } catch (err) {
    console.error('[GCP AI ERROR]', err.message)
    res.status(500).json({ error: 'Google TTS AI assistant failed', details: err.message })
  }
}
