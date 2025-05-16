import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import voiceCloneRoutes from './routes/voiceCloneRoutes.js'
import aiRoutes from './routes/aiAssistantRoutes.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

connectDB()

app.use('/auth', authRoutes)
app.use('/voice', voiceCloneRoutes)
app.use('/ai', aiRoutes)

app.get('/', (req, res) => res.send('AccentShift API Running'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
