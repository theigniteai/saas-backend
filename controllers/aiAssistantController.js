import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const client = new TextToSpeechClient({
  keyFilename: path.join(__dirname, '../gcp/accentshift-bb444e45fc45.json') // path to your uploaded key
})

export const generateAIResponse = async (req, res) => {
  const { prompt, voice_id = 'en-US-Standard-C' } = req.body

  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  try {
    // Step 1: Generate GPT reply
    const chatRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    })

    const aiText = chatRes.data.choices[0].message.content
    console.log('[AI TEXT]', aiText)

    // Step 2: Google Cloud TTS
    const request = {
      input: { text: aiText },
      voice: {
        languageCode: 'en-US',
        name: voice_id
      },
      audioConfig: { audioEncoding: 'MP3' }
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
