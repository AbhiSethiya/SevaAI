import { createContext, useContext, useState } from "react";

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const [shouldOpen, setShouldOpen] = useState(false);

  const openChatbot = () => {
    setShouldOpen(true);
  };

  const closeChatbot = () => {
    setShouldOpen(false);
  };

  return (
    <ChatbotContext.Provider value={{ shouldOpen, openChatbot, closeChatbot }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
};
