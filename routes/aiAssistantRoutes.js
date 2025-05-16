import express from 'express'
import { generateAIResponse } from '../controllers/aiAssistantController.js'

const router = express.Router()

router.post('/respond', generateAIResponse)

export default router
