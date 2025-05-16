import express from 'express'
import multer from 'multer'
import { cloneVoice } from '../controllers/voiceCloneController.js'

const upload = multer({ dest: 'uploads/' })
const router = express.Router()

router.post('/clone-voice', upload.single('audio'), cloneVoice)

export default router
