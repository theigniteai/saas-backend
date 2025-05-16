import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import dotenv from 'dotenv'

dotenv.config()

export const cloneVoice = async (req, res) => {
  try {
    const file = req.file
    const formData = new FormData()
    formData.append('name', req.body.name || 'AccentShift Voice')
    formData.append('description', 'Uploaded from AccentShift')
    formData.append('files', fs.createReadStream(file.path))

    const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', formData, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        ...formData.getHeaders()
      }
    })

    res.json({ voice_id: response.data.voice_id, name: response.data.name })
  } catch (err) {
    console.error('Voice clone error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Voice cloning failed' })
  }
}
