const express = require("express");
const router = express.Router();
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { analyze } = require("../services/geminiService");

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (
      file.mimetype.startsWith("audio/") ||
      file.mimetype === "application/octet-stream"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Chat endpoint for text-based conversation
router.post("/message", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Use Gemini to generate intelligent responses
    const response = await generateChatResponse(message, conversationHistory);

    res.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

const axios = require('axios');
const FormData = require('form-data');

// Speech-to-text endpoint
router.post("/speech-to-text", upload.single("audio"), async (req, res) => {
  try {
    console.log("Speech-to-text request received");
    
    if (!req.file) {
      console.log("No audio file provided");
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.log("Groq API not configured");
      return res.status(500).json({
        error: "Speech recognition service not available - GROQ_API_KEY missing",
      });
    }

    console.log("Processing audio with Groq Whisper API...");
    
    const cleanMimeType = req.file.mimetype.split(';')[0].trim();
    // Use the original filename to preserve the correct extension (e.g., .webm or .wav)
    // If the frontend sends recording.webm, we MUST pass it as .webm to Groq so it parses the container correctly.
    const originalExt = req.file.originalname.split('.').pop() || 'webm';
    const extension = ['webm', 'wav', 'mp3', 'm4a', 'ogg', 'flac'].includes(originalExt.toLowerCase()) 
        ? originalExt.toLowerCase() 
        : (cleanMimeType.includes('webm') ? 'webm' : 'wav');
    
    // Use form-data package for guaranteed Node compatibility
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: `audio.${extension}`,
      contentType: cleanMimeType === 'application/octet-stream' ? 'audio/webm' : cleanMimeType,
    });
    formData.append('model', 'whisper-large-v3-turbo'); 
    formData.append('language', 'en');

    const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      timeout: 15000 // 15 seconds timeout
    });

    console.log("Transcription successful:", response.data.text);
    res.json({ text: response.data.text });

  } catch (error) {
    console.error("Speech-to-text error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to transcribe audio",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// Function to generate intelligent chat responses
async function generateChatResponse(message, conversationHistory = []) {
  const lowerMessage = message.toLowerCase();

  // Check if this might be a complaint-related query
  if (
    lowerMessage.includes("complaint") ||
    lowerMessage.includes("problem") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("report")
  ) {
    try {
      // Use the existing geminiService to analyze the message
      const analysis = await analyze(message);

      if (analysis.type === "newComplaint") {
        return `I understand you want to report: "${analysis.refinedText}". This appears to be a ${analysis.department} department issue with ${analysis.priority} priority. Would you like me to help you register this complaint? Please provide your location details if you'd like to proceed.`;
      } else if (analysis.type === "statusQuery") {
        return `I can help you check your complaint status. Please provide your complaint ID, or I can look up your most recent complaint if you're logged in.`;
      }
    } catch (error) {
      console.error("Analysis error:", error);
    }
  }

  // Use Gemini for general conversation if available
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const context =
        conversationHistory.length > 0
          ? `Previous conversation:\n${conversationHistory
              .map((msg) => `${msg.sender}: ${msg.text}`)
              .join("\n")}\n\n`
          : "";

      const prompt = `${context}You are a helpful municipal assistant chatbot. The user is interacting with a municipal complaints system. 
      
      Respond helpfully to their query: "${message}"
      
      Keep responses concise, friendly, and relevant to municipal services. If they ask about complaints, guide them to register or check status.
      
      Available services:
      - Complaint registration
      - Complaint status tracking  
      - Information about municipal services
      - Office hours and contact information
      
      Respond in a conversational tone.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini chat error:", error);
    }
  }

  // Fallback responses
  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey")
  ) {
    return "Hello! I'm your municipal assistant. I can help you register complaints, check complaint status, or provide information about our services. How can I assist you today?";
  }

  if (lowerMessage.includes("help")) {
    return "I can assist you with:\n• Registering new complaints\n• Checking complaint status\n• Information about municipal services\n• Office hours and contact details\n• Service procedures\n\nWhat would you like to know more about?";
  }

  if (
    lowerMessage.includes("office hours") ||
    lowerMessage.includes("timing")
  ) {
    return "Our office hours are:\nMonday-Friday: 9:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nClosed on Sundays and public holidays.";
  }

  if (lowerMessage.includes("contact") || lowerMessage.includes("phone")) {
    return "You can reach us at:\n📞 1800-123-4567\n✉️ complaints@municipality.gov\n📍 Municipal Corporation Office, 123 Civic Center";
  }

  return "I understand you need assistance. I can help you register complaints, check status, or provide information about municipal services. Could you please be more specific about what you need help with?";
}

module.exports = router;
