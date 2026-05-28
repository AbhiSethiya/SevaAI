const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// To run this test:
// 1. Put your Groq API key here:
const GROQ_API_KEY = process.env.GROQ_API_KEY || "put_your_key_here";

async function testGroqTranscription() {
    console.log("Starting Groq API test...");
    
    if (GROQ_API_KEY === "put_your_key_here" || !GROQ_API_KEY) {
        console.error("ERROR: Please edit this file and add your GROQ_API_KEY first.");
        return;
    }

    try {
        // Create a tiny empty audio buffer just to test the connection and auth
        // Note: Groq might complain about the audio being too short, but if it does, 
        // it means the connection, API key, and formData format are perfectly valid!
        const fakeAudioBuffer = Buffer.from('RIFF$   WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00', 'binary');

        const formData = new FormData();
        formData.append('file', fakeAudioBuffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav',
        });
        formData.append('model', 'whisper-large-v3-turbo'); 
        formData.append('language', 'en');

        console.log("Sending request to Groq Whisper...");
        const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            timeout: 15000
        });

        console.log("✅ SUCCESS! Groq API is working perfectly.");
        console.log("Response text:", response.data.text);
    } catch (error) {
        console.error("❌ FAILED!");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Error details:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testGroqTranscription();
