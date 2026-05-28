// services/aiService.js (replaces geminiService)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Analyze raw text and return structured complaint or FAQ info
async function analyze(rawText) {
  if (!genAI && !groq) return { error: "No AI API configured (Need Gemini or Groq)" };

  const prompt = `
You are an intelligent municipal assistant. Analyze the following user input and respond ONLY in valid JSON.

User Input: """${rawText}"""

Instructions:
1. Determine type:
   - "newComplaint" => user is reporting an issue
   - "statusQuery" => user wants complaint status
   - "faq" => general question
2. For new complaints, extract:
   - "department": road, water, drainage, electricity, waste, other
   - "refinedText": a concise, clear version of the complaint
   - "priority": 
       • Default to "Medium".
       • Set to "High" only if the complaint mentions urgent situations, danger, accidents, safety hazards, major leaks, or ongoing incidents.
       • Set to "Low" for minor issues or low-impact complaints.
   - "locationName": extract location if mentioned; otherwise null
3. For status queries:
   - "complaintId": the ticket ID if mentioned; else "last"
4. For FAQs:
   - "answer": a helpful answer
5. Return JSON only. No explanations.
6. Respond in the same language as the user is using. If it is a FAQ, provide the answer in the same language as the user.

Note: Certain locations may have higher importance during festivals or events.
If the complaint location is near such areas during those times, set "priority": "High".
Examples:
- Rajwada on Holi => High priority
- MG Road on Diwali => High priority
- Normal day in same locations => follow default keyword logic


Examples:

Input: "There is a water pipe leakage near Central Park. It's urgent!"
Output:
{
  "type": "newComplaint",
  "department": "water",
  "refinedText": "Water pipe leakage near Central Park",
  "priority": "High",
  "locationName": "Central Park"
}

Input: "Streetlight not working in my area"
Output:
{
  "type": "newComplaint",
  "department": "electricity",
  "refinedText": "Streetlight not working in my area",
  "priority": "Medium",
  "locationName": null
}

Input: "Check status of my complaint 12345"
Output:
{
  "type": "statusQuery",
  "complaintId": "12345"
}

Input: "When will the garbage be collected today?"
Output:
{
  "type": "faq",
  "answer": "Garbage is collected twice a week. Please check your local schedule or contact the waste management department."
}

Now analyze the user input and return JSON only.
`;

  // Prefer Groq since user explicitly requested it and it supports JSON mode natively
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-70b-8192",
        response_format: { type: "json_object" }
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.error("Groq analyze error, falling back to Gemini:", err);
      // Fall through to Gemini if Groq fails
    }
  }

  // Fallback to Gemini
  if (genAI) {
    try {
      let response;
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        response = await model.generateContent(prompt);
      } catch(err) {
        if (err.message && err.message.includes("404")) {
           console.warn("gemini-3.5-flash not found, falling back to gemini-pro");
           const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
           response = await fallbackModel.generateContent(prompt);
        } else {
           throw err;
        }
      }
      
      let text = response.response.text().trim();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(text);
    } catch (err) {
      console.error("Gemini analyze error:", err);
      return { error: true, message: err.message };
    }
  }

  return { error: true, message: "No valid API keys could process the request" };
}

module.exports = { analyze };
