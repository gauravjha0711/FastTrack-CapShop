import React, { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuthData,
  getToken,
  getUserId,
  getUserName,
  getUserRole,
  saveAuthData,
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
    clearAuthData();
    setToken(null);
    setRole(null);
    setUserId(null);
    setName(null);
    setIsAuthenticated(false);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);