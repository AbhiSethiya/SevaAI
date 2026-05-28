# SevaAI 🚀

SevaAI is an intelligent, AI-powered municipal complaint management system. It modernizes the way citizens interact with their local government by allowing them to report civic issues (like potholes, water leaks, and power outages) simply by speaking into their microphones!

## ✨ Features

- **🎙️ AI Voice Complaints**: Speak your complaint naturally. SevaAI uses Groq (Whisper) for lightning-fast speech-to-text transcription.
- **🧠 Intelligent Parsing**: Gemini 3.5 Flash automatically analyzes the complaint, categorizes it by department (Water, Electricity, Roads, etc.), determines the urgency (Low/Medium/High), and extracts location data.
- **🗺️ Live Heatmap Dashboard**: A beautiful, real-time admin dashboard using React and Leaflet to map out all complaints across the city. 
- **📱 Responsive UI**: A fully responsive frontend built with Vite and Tailwind CSS.
- **☁️ Cloud Database**: MongoDB backend to track complaint statuses (Pending, In-Progress, Resolved).

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Leaflet (Maps)
- Groq SDK (Speech-to-Text)

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Google Generative AI (Gemini 3.5 Flash)
- Groq API

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed. You will also need API keys for Groq and Gemini.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/AbhiSethiya/SevaAI.git
cd SevaAI
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a \`.env\` file in the \`backend\` folder with the following variables:
\`\`\`env
PORT=10000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
\`\`\`
Run the backend server:
\`\`\`bash
npm run dev
\`\`\`

*(Optional)* Run the seed script to instantly populate your local database with 10 realistic dummy complaints:
\`\`\`bash
node seedComplaints.js
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd ../frontend
npm install
\`\`\`
Run the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

## 🌍 Deployment
This project is configured to be easily deployable on **Render**. 
- Deploy the \`backend\` folder as a Web Service.
- Deploy the \`frontend\` folder as a Static Site.

Ensure all Environment Variables from the backend \`.env\` are added to your Render dashboard!
