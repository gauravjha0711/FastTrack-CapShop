import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  clearAuthData,
  getToken,
  getUserId,
  getUserName,
  getUserRole,
  saveAuthData,
  updateStoredName,
} from "../utils/tokenHelper";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(getUserRole());
  const [userId, setUserId] = useState(getUserId());
  const [name, setName] = useState(getUserName());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  useEffect(() => {
    setToken(getToken());
    setRole(getUserRole());
    setUserId(getUserId());
    setName(getUserName());
    setIsAuthenticated(!!getToken());
  }, []);

  const login = (authResponse) => {
    saveAuthData(authResponse);
    setToken(authResponse.token);
    setRole(authResponse.role);
    setUserId(authResponse.userId);
    setName(authResponse.name);
    setIsAuthenticated(true);
  };

  const logout = () => {
    const hadSession = !!token;
    clearAuthData();
    setToken(null);
    setRole(null);
    setUserId(null);
    setName(null);
    setIsAuthenticated(false);

    if (hadSession) {
      toast.success("Logged out successfully.");
    }
  };

  const updateName = (newName) => {
    updateStoredName(newName);
    setName(newName);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        userId,
        name,
        isAuthenticated,
        login,
        logout,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);