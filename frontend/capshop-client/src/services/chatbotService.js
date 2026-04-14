import axiosInstance from "./axiosInstance";

// Staged integration:
// - Today: hits a simple placeholder endpoint via the Gateway.
// - Later: swap this implementation to call a real LLM provider/service.

export const sendChatbotMessage = async ({ message, conversationId }) => {
  const response = await axiosInstance.post("/gateway/chatbot/message", {
    message,
    conversationId,
  });

  return response.data;
};
