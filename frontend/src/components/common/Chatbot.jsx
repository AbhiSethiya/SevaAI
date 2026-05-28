import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  User,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  MapPin,
} from "lucide-react";
import {
  startRecording,
  stopRecording,
  textToSpeech,
} from "../../lib/speechAPI";
import { useAuth } from "../../contexts/AuthContext";
import { useChatbot } from "../../contexts/ChatbotContext";

const Chatbot = () => {
  const { user, openAuthModal } = useAuth();
  const { shouldOpen, closeChatbot } = useChatbot();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your municipal assistant. I can help you register complaints, check status, or answer questions. You can type or speak to me!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (shouldOpen) {
      handleOpenChat();
      closeChatbot(); // Reset the trigger
    }
  }, [shouldOpen, closeChatbot]);

  const handleOpenChat = () => {
    setShouldRender(true);
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      setIsOpen(true);
    }, 10);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    // Auto-fetch location when chatbot opens
    if (isOpen && !userLocation && !isLoadingLocation) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setUserLocation(location);
        setIsLoadingLocation(false);
        console.log("Location obtained:", location);

        // Add a message to show location was detected
        const locationMessage = {
          id: Date.now(),
          text: `📍 Location detected: ${location.latitude.toFixed(
            6
          )}, ${location.longitude.toFixed(6)}`,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, locationMessage]);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoadingLocation(false);
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions for better assistance.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage =
              "An unknown error occurred while retrieving location.";
            break;
        }

        const errorLocationMessage = {
          id: Date.now(),
          text: errorMessage,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorLocationMessage]);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if user is authenticated
    if (!user) {
      openAuthModal();
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      location: userLocation, // Include location if available
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      // Send message to backend with the correct format
      const requestBody = {
        rawText: currentInput, // Changed from 'message' to 'rawText'
      };

      // Include coordinates if available
      if (userLocation) {
        requestBody.lat = userLocation.latitude;
        requestBody.lng = userLocation.longitude;
      }

      console.log("Sending to backend:", requestBody);

      const response = await fetch("/api/complaints/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials for session
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Response error:", errorData);
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      console.log("Backend response:", data);

      let botResponseText = "";

      // Handle different response types
      if (data.type === "faq") {
        botResponseText = data.answer || "Here's some information...";
      } else if (data.type === "statusQuery") {
        botResponseText = `Your complaint ${data.complaintId} is currently ${
          data.status
        } in the ${data.department} department. Location: ${
          data.locationName || "Unknown"
        }`;
      } else if (data.type === "newComplaint") {
        if (data.ticketId) {
          // Complaint was successfully created
          botResponseText = `✅ ${data.message} Your ticket ID is: ${data.ticketId}. Status: ${data.status}. Department: ${data.department}.`;
        } else {
          // Complaint detected but needs coordinates
          botResponseText = `${data.message} I'll get your location to complete the complaint registration.`;

          // Automatically request location when coordinates are needed
          if (!userLocation) {
            setTimeout(() => {
              setIsLoadingLocation(true);
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                  };
                  setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString(),
                  });
                  setIsLoadingLocation(false);

                  // Location obtained, now send the same complaint with coordinates
                  try {
                    const confirmResponse = await fetch(
                      "/api/complaints/process",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                          rawText: currentInput,
                          lat: location.lat,
                          lng: location.lng,
                        }),
                      }
                    );

                    if (confirmResponse.ok) {
                      const confirmData = await confirmResponse.json();
                      let confirmMessage = "";

                      if (confirmData.ticketId) {
                        confirmMessage = `✅ Complaint registered successfully! Your ticket ID is: ${confirmData.ticketId}. Department: ${confirmData.department}. Status: ${confirmData.status}.`;
                      } else {
                        confirmMessage =
                          confirmData.message || "Complaint processed.";
                      }

                      const locationBotMessage = {
                        id: Date.now() + 2,
                        text: confirmMessage,
                        sender: "bot",
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, locationBotMessage]);
                    }
                  } catch (error) {
                    console.error("Error confirming complaint:", error);
                    const errorMessage = {
                      id: Date.now() + 2,
                      text: "Sorry, there was an error processing your complaint. Please try again.",
                      sender: "bot",
                      timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                  }
                },
                (error) => {
                  setIsLoadingLocation(false);
                  console.error("Error getting location:", error);
                  const errorMessage = {
                    id: Date.now() + 2,
                    text: "Unable to get your location. Please enable location access and try again.",
                    sender: "bot",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, errorMessage]);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 300000,
                }
              );
            }, 1000); // Small delay for better UX
          } else {
            // We already have location, send immediately
            setTimeout(async () => {
              try {
                const confirmResponse = await fetch("/api/complaints/process", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    rawText: currentInput,
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                  }),
                });

                if (confirmResponse.ok) {
                  const confirmData = await confirmResponse.json();
                  let confirmMessage = "";

                  if (confirmData.ticketId) {
                    confirmMessage = `✅ Complaint registered successfully! Your ticket ID is: ${confirmData.ticketId}. Department: ${confirmData.department}. Status: ${confirmData.status}.`;
                  } else {
                    confirmMessage =
                      confirmData.message || "Complaint processed.";
                  }

                  const locationBotMessage = {
                    id: Date.now() + 2,
                    text: confirmMessage,
                    sender: "bot",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, locationBotMessage]);
                }
              } catch (error) {
                console.error("Error confirming complaint:", error);
                const errorMessage = {
                  id: Date.now() + 2,
                  text: "Sorry, there was an error processing your complaint. Please try again.",
                  sender: "bot",
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
              }
            }, 1000);
          }
        }
      } else {
        botResponseText =
          data.message || data.response || "Thank you for your message.";
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeechToText = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        const audioBlob = await stopRecording();

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        const response = await fetch("/api/chat/speech-to-text", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to transcribe audio");
        }

        const data = await response.json();
        setInputMessage(data.text);
        inputRef.current?.focus();
      } catch (error) {
        console.error("Speech to text error:", error);
        setIsTyping(false);
        alert("Failed to convert speech to text. Please try again.");
      }
    } else {
      try {
        setIsRecording(true);
        await startRecording();
      } catch (error) {
        console.error("Recording error:", error);
        setIsRecording(false);
        alert("Failed to access microphone. Please check permissions.");
      }
    }
  };

  const handleTextToSpeech = async (text, messageId) => {
    if (speakingMessageId === messageId) {
      // Stop current speech
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    } else {
      try {
        // Stop any other speech first
        window.speechSynthesis.cancel();
        setSpeakingMessageId(messageId);
        await textToSpeech(text);
      } catch (error) {
        console.error("Text to speech error:", error);
        // Only show alert for actual errors, not user interruptions
        if (!error.message.includes("interrupted")) {
          alert("Text-to-speech is not supported in your browser.");
        }
      } finally {
        setSpeakingMessageId(null);
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      setSelectedImage(file);

      // Automatically send the image as a message
      const reader = new FileReader();
      reader.onload = () => {
        const userMessage = {
          id: Date.now(),
          text: "📷 Image uploaded",
          sender: "user",
          timestamp: new Date(),
          image: reader.result,
          imageName: file.name,
          location: userLocation, // Include location if available
        };

        setMessages((prev) => [...prev, userMessage]);

        // Bot response for image
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: `I can see you've uploaded an image (${file.name}). This will help me better understand your complaint. Please describe what the image shows so I can assist you properly.`,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    event.target.value = "";
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* Chat Widget */}
      {!shouldRender && (
        <button
          onClick={() => {
            if (!user) {
              openAuthModal();
            } else {
              handleOpenChat();
            }
          }}
          className="bg-primary hover:bg-primary-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 animate-bounce"
          aria-label="Open chat"
        >
          <MessageCircle className="h-8 w-8" />
        </button>
      )}

      {/* Chat Window */}
      {shouldRender && (
        <div
          className={`bg-white rounded-lg shadow-2xl border border-gray-200 w-[90vw] max-w-[480px] h-[70vh] max-h-[600px] flex flex-col transition-all duration-300 ease-out transform origin-bottom-right ${
            isOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95"
          }`}
        >
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <h1 className="text-xl font-bold text-blue-600">सेवा</h1>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Seva AI</h3>
                <div className="flex items-center space-x-1">
                  <p className="text-xs text-primary-100">Online now</p>
                  {userLocation && (
                    <MapPin
                      className="h-3 w-3 text-green-300"
                      title={`Location: ${userLocation.latitude.toFixed(
                        4
                      )}, ${userLocation.longitude.toFixed(4)}`}
                    />
                  )}
                  {isLoadingLocation && (
                    <div
                      className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"
                      title="Getting location..."
                    />
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseChat}
              className="text-white hover:text-primary-100 transition-all duration-200 hover:scale-110 hover:rotate-90"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex space-x-2 max-w-sm ${
                    message.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "user" ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {/* Display image if present */}
                      {message.image && (
                        <div className="mb-2">
                          <img
                            src={message.image}
                            alt={message.imageName || "Uploaded image"}
                            className="max-w-full h-auto rounded-lg max-h-32 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">
                            {message.text}
                          </p>
                          {/* Show location indicator if present */}
                          {message.location && (
                            <div className="flex items-center mt-1 text-xs opacity-70">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>
                                {message.location.latitude.toFixed(4)},{" "}
                                {message.location.longitude.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                        {message.sender === "bot" && (
                          <button
                            onClick={() =>
                              handleTextToSpeech(message.text, message.id)
                            }
                            className={`ml-2 p-1 rounded transition-colors ${
                              speakingMessageId === message.id
                                ? "bg-primary text-white"
                                : "hover:bg-gray-200 text-gray-500"
                            }`}
                            aria-label="Read message aloud"
                          >
                            {speakingMessageId === message.id ? (
                              <VolumeX className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-2 max-w-sm">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <button
                onClick={handleSpeechToText}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
                disabled={isTyping}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={handleAttachClick}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                disabled={isTyping}
                aria-label="Attach image"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isRecording ? "Listening..." : "Type your message..."
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isTyping || isRecording}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || isRecording}
                className="bg-primary hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
