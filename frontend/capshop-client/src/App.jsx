import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
};

export default App;