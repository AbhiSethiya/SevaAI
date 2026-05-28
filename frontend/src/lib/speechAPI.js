// Speech API utilities
export class SpeechAPI {
  static instance = null;
  mediaRecorder = null;
  audioChunks = [];
  voicesLoaded = false;

  static getInstance() {
    if (!SpeechAPI.instance) {
      SpeechAPI.instance = new SpeechAPI();
      SpeechAPI.instance.initializeVoices();
    }
    return SpeechAPI.instance;
  }

  // Initialize and load available voices
  initializeVoices() {
    if ("speechSynthesis" in window) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.voicesLoaded = true;
          console.log("Available voices loaded:", voices.length);
          console.log(
            "Voice details:",
            voices.map((v) => ({
              name: v.name,
              lang: v.lang,
              localService: v.localService,
              default: v.default,
            }))
          );
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // Get available voices for debugging
  getAvailableVoices() {
    return window.speechSynthesis.getVoices().map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
    }));
  }

  // Start recording audio for speech-to-text
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return stream;
    } catch (error) {
      throw new Error("Failed to access microphone");
    }
  }

  // Stop recording and get audio blob
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    });
  }

  // Convert speech to text using backend API
  async speechToText(audioBlob) {
    try {
      console.log("Sending audio to backend...", audioBlob.size, "bytes");
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      const response = await fetch("/api/chat/speech-to-text", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Speech recognition failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("Server error:", errorData);
        } catch (e) {
          console.error("Failed to parse error response");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Transcription received:", data);
      return data.text || "";
    } catch (error) {
      console.error("Speech to text error:", error);
      throw new Error("Failed to convert speech to text: " + error.message);
    }
  }

  // Convert text to speech using browser's built-in API
  async textToSpeech(text, language = "auto") {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Text-to-speech not supported"));
        return;
      }

      // Check if speech synthesis is available and not paused
      if (window.speechSynthesis.paused) {
        console.log("Speech synthesis was paused, resuming...");
        window.speechSynthesis.resume();
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Small delay to ensure cancellation is complete
      setTimeout(() => {
        const speakText = () => {
          // Auto-detect language or use provided language
          let selectedLang = language;
          let fallbackToEnglish = false;
          let useTransliteration = false;

          if (language === "auto") {
            // Simple Hindi detection - check for Devanagari script characters
            const hindiRegex = /[\u0900-\u097F]/;
            const hasHindi = hindiRegex.test(text);

            if (hasHindi) {
              selectedLang = "hi-IN";
              // Check if Hindi voice is actually available
              const voices = window.speechSynthesis.getVoices();
              const hindiVoiceAvailable = voices.some(
                (voice) =>
                  voice.lang === "hi-IN" ||
                  voice.lang === "hi" ||
                  voice.lang.startsWith("hi-") ||
                  voice.name.toLowerCase().includes("hindi")
              );

              if (!hindiVoiceAvailable) {
                console.log(
                  "No Hindi voice available. Using English voice with phonetic approximation."
                );

                // Use English voice but keep the original language for browser handling
                selectedLang = "en-US";
                fallbackToEnglish = true;
              }
            } else {
              selectedLang = "en-US";
            }
          }

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = selectedLang;

          // Adjust rate based on language and fallback scenario
          if (fallbackToEnglish) {
            utterance.rate = 0.5; // Very slow for Hindi text with English voice
            // Try to make it work better by using the available voice
          } else if (selectedLang.startsWith("hi")) {
            utterance.rate = 0.8; // Slightly slower for Hindi
          } else {
            utterance.rate = 0.9; // Normal rate for English
          }

          utterance.pitch = 1;
          utterance.volume = 1;

          // Try to find a suitable voice for the detected language
          const voices = window.speechSynthesis.getVoices();
          console.log(
            `Using language: ${selectedLang}, Available voices:`,
            voices.length
          );
          console.log(
            "All voices:",
            voices.map(
              (v) =>
                `${v.name} (${v.lang}) - ${v.localService ? "local" : "remote"}`
            )
          );

          if (voices.length > 0) {
            let preferredVoice = null;

            if (selectedLang === "hi-IN" && !fallbackToEnglish) {
              // Look for Hindi voices with multiple criteria
              preferredVoice = voices.find(
                (voice) =>
                  voice.lang === "hi-IN" ||
                  voice.lang === "hi" ||
                  voice.lang.startsWith("hi-") ||
                  voice.name.toLowerCase().includes("hindi") ||
                  voice.name.toLowerCase().includes("devanagari")
              );

              console.log("Hindi voice found:", preferredVoice?.name || "None");
            } else {
              // Look for English voices (including fallback case)
              preferredVoice =
                voices.find(
                  (voice) =>
                    voice.lang === "en-US" ||
                    voice.lang === "en-GB" ||
                    voice.lang.startsWith("en-")
                ) || voices.find((voice) => voice.lang.includes("en"));

              if (fallbackToEnglish) {
                console.log(
                  "🔄 Using English voice for Hindi text:",
                  preferredVoice?.name || "Default"
                );
                console.log(
                  "ℹ️ Note: Pronunciation may be limited with English voice"
                );
              } else {
                console.log(
                  "English voice found:",
                  preferredVoice?.name || "Default"
                );
              }
            }

            if (preferredVoice) {
              utterance.voice = preferredVoice;
              console.log(
                "Selected voice:",
                preferredVoice.name,
                preferredVoice.lang
              );
            } else {
              console.log("No specific voice found, using system default");
            }
          }

          utterance.onend = () => {
            console.log("Speech synthesis completed successfully");
            resolve();
          };
          utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error, event);
            // Don't reject for "interrupted" errors as these are user-initiated
            if (event.error === "interrupted") {
              console.log("Speech was interrupted by user");
              resolve(); // Resolve normally for user interruptions
            } else {
              reject(new Error(`Speech synthesis failed: ${event.error}`));
            }
          };
          utterance.onstart = () => {
            console.log("Speech synthesis started");
          };

          console.log("Starting speech synthesis...");
          console.log(
            "Text to speak:",
            text.substring(0, 50) + (text.length > 50 ? "..." : "")
          );
          console.log("Final utterance config:", {
            lang: utterance.lang,
            rate: utterance.rate,
            pitch: utterance.pitch,
            volume: utterance.volume,
            voice: utterance.voice?.name,
          });

          window.speechSynthesis.speak(utterance);
        };

        // If voices are already loaded, speak immediately
        if (
          this.voicesLoaded ||
          window.speechSynthesis.getVoices().length > 0
        ) {
          speakText();
        } else {
          // Wait for voices to load
          const checkVoices = () => {
            if (window.speechSynthesis.getVoices().length > 0) {
              this.voicesLoaded = true;
              speakText();
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          checkVoices();
        }
      }, 100); // Close the setTimeout from earlier
    });
  }

  // Stop any ongoing speech
  stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Test audio functionality with a simple word
  async testAudio() {
    try {
      console.log("Testing audio with simple word...");
      await this.textToSpeech("Test", "en-US");
      console.log("Audio test completed");
      return true;
    } catch (error) {
      console.error("Audio test failed:", error);
      return false;
    }
  }

  // Check if Hindi voice is available
  isHindiVoiceAvailable() {
    const voices = window.speechSynthesis.getVoices();
    return voices.some(
      (voice) =>
        voice.lang === "hi-IN" ||
        voice.lang === "hi" ||
        voice.lang.startsWith("hi-") ||
        voice.name.toLowerCase().includes("hindi")
    );
  }

  // Get Hindi voice support info
  getHindiSupportInfo() {
    const isSupported = this.isHindiVoiceAvailable();
    const voices = window.speechSynthesis.getVoices();
    const hindiVoices = voices.filter(
      (voice) =>
        voice.lang === "hi-IN" ||
        voice.lang === "hi" ||
        voice.lang.startsWith("hi-") ||
        voice.name.toLowerCase().includes("hindi")
    );

    return {
      supported: isSupported,
      hindiVoices: hindiVoices.map((v) => ({ name: v.name, lang: v.lang })),
      totalVoices: voices.length,
      recommendation: isSupported
        ? "Hindi voice is available!"
        : "Hindi voice not available. Using English voice as fallback.",
    };
  }
}

// Export individual functions for easier use
const speechAPI = SpeechAPI.getInstance();

export const startRecording = () => speechAPI.startRecording();
export const stopRecording = () => speechAPI.stopRecording();
export const textToSpeech = (text, language) =>
  speechAPI.textToSpeech(text, language);
export const getAvailableVoices = () => speechAPI.getAvailableVoices();
export const testAudio = () => speechAPI.testAudio();
export const isHindiVoiceAvailable = () => speechAPI.isHindiVoiceAvailable();
export const getHindiSupportInfo = () => speechAPI.getHindiSupportInfo();
