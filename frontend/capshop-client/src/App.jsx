import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
import ChatbotWidget from "./components/ChatbotWidget";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
      <ChatbotWidget />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
};

export default App;