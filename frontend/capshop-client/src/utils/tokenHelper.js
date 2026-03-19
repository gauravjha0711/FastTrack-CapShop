export const saveAuthData = (token, role) => {
  localStorage.setItem("capshop_token", token);
  localStorage.setItem("capshop_role", role);
};

export const getToken = () => {
  return localStorage.getItem("capshop_token");
};

export const getUserRole = () => {
  return localStorage.getItem("capshop_role");
};

export const clearAuthData = () => {
  localStorage.removeItem("capshop_token");
  localStorage.removeItem("capshop_role");
};