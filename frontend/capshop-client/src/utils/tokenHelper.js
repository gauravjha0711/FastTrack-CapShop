export const saveAuthData = (authData) => {
  localStorage.setItem("capshop_token", authData.token);
  localStorage.setItem("capshop_role", authData.role);
  localStorage.setItem("capshop_userId", authData.userId);
  localStorage.setItem("capshop_name", authData.name);

  if (authData.avatarUrl) {
    localStorage.setItem("capshop_avatarUrl", authData.avatarUrl);
  }
};

export const getToken = () => localStorage.getItem("capshop_token");
export const getUserRole = () => localStorage.getItem("capshop_role");
export const getUserId = () => localStorage.getItem("capshop_userId");
export const getUserName = () => localStorage.getItem("capshop_name");
export const getUserAvatarUrl = () => localStorage.getItem("capshop_avatarUrl");

export const updateStoredName = (name) => {
  localStorage.setItem("capshop_name", name);
};

export const updateStoredAvatarUrl = (avatarUrl) => {
  if (avatarUrl && avatarUrl.trim()) {
    localStorage.setItem("capshop_avatarUrl", avatarUrl.trim());
  } else {
    localStorage.removeItem("capshop_avatarUrl");
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("capshop_token");
  localStorage.removeItem("capshop_role");
  localStorage.removeItem("capshop_userId");
  localStorage.removeItem("capshop_name");
  localStorage.removeItem("capshop_avatarUrl");
};