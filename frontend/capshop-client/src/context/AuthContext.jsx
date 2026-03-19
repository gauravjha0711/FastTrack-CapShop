import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUserRole, clearAuthData, saveAuthData } from "../utils/tokenHelper";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(getUserRole());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  useEffect(() => {
    const existingToken = getToken();
    const existingRole = getUserRole();

    setToken(existingToken);
    setRole(existingRole);
    setIsAuthenticated(!!existingToken);
  }, []);

  const login = (authResponse) => {
    saveAuthData(authResponse.token, authResponse.role);
    setToken(authResponse.token);
    setRole(authResponse.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
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