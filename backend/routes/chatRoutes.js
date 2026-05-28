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

// Speech-to-text endpoint
router.post("/speech-to-text", upload.single("audio"), async (req, res) => {
  try {
    console.log("Speech-to-text request received");
    console.log(
      "File:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "No file"
    );

    if (!req.file) {
      console.log("No audio file provided");
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!genAI) {
      console.log("Gemini API not configured");
      return res
        .status(500)
        .json({
          error:
            "Speech recognition service not available - Gemini API key missing",
        });
    }

    console.log("Processing audio with Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert audio buffer to base64
    const base64Audio = req.file.buffer.toString("base64");
    console.log("Audio converted to base64, length:", base64Audio.length);

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: req.file.mimetype,
        },
      },
      "Please transcribe this audio file to text. Only return the transcribed text, nothing else.",
    ]);

    const transcription = result.response.text();
    console.log("Transcription successful:", transcription);

    res.json({ text: transcription });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    res.status(500).json({
      error: "Failed to transcribe audio",
      details: error.message,
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
