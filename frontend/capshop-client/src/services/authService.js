import axiosInstance from "./axiosInstance";

export const getMyProfile = async () => {
  const response = await axiosInstance.get("/gateway/auth/me");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await axiosInstance.put("/gateway/auth/profile", profileData);
  return response.data;
};

export const changeMyPassword = async (passwordData) => {
  const response = await axiosInstance.put("/gateway/auth/change-password", passwordData);
  return response.data;
};