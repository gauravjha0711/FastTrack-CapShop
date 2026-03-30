import axiosInstance from "./axiosInstance";

export const signupUser = async (signupData) => {
  const response = await axiosInstance.post("/gateway/auth/signup", signupData);
  return response.data;
};

export const verifySignupOtp = async (email, otp) => {
  const response = await axiosInstance.post("/gateway/auth/signup/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

export const loginInitiate = async (email, password) => {
  const response = await axiosInstance.post("/gateway/auth/login-initiate", {
    email,
    password,
  });
  return response.data;
};

export const sendLoginEmailOtp = async (tempLoginToken) => {
  const response = await axiosInstance.post(
    "/gateway/auth/login/send-email-otp",
    {
      tempLoginToken,
    }
  );
  return response.data;
};

export const verifyLoginEmailOtp = async (tempLoginToken, otp) => {
  const response = await axiosInstance.post(
    "/gateway/auth/login/verify-email-otp",
    {
      tempLoginToken,
      otp,
    }
  );
  return response.data;
};

export const sendLoginMobileOtp = async (tempLoginToken) => {
  const response = await axiosInstance.post(
    "/gateway/auth/login/send-mobile-otp",
    {
      tempLoginToken,
    }
  );
  return response.data;
};

export const verifyLoginAuthenticator = async (tempLoginToken, otp) => {
  const response = await axiosInstance.post(
    "/gateway/auth/login/verify-authenticator",
    {
      tempLoginToken,
      otp,
    }
  );
  return response.data;
};

export const requestForgotPassword = async (email, method) => {
  const response = await axiosInstance.post("/gateway/auth/forgot-password/request", {
    email,
    method,
  });
  return response.data;
};

export const verifyForgotPasswordEmailOtp = async (email, challengeToken, otp) => {
  const response = await axiosInstance.post(
    "/gateway/auth/forgot-password/verify-email-otp",
    {
      email,
      challengeToken,
      otp,
    }
  );
  return response.data;
};

export const verifyForgotPasswordAuthenticator = async (
  email,
  challengeToken,
  otp
) => {
  const response = await axiosInstance.post(
    "/gateway/auth/forgot-password/verify-authenticator",
    {
      email,
      challengeToken,
      otp,
    }
  );
  return response.data;
};

export const resetForgotPassword = async (
  resetToken,
  newPassword,
  confirmPassword
) => {
  const response = await axiosInstance.post("/gateway/auth/forgot-password/reset", {
    resetToken,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await axiosInstance.get("/gateway/auth/me");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await axiosInstance.put("/gateway/auth/profile", profileData);
  return response.data;
};

export const changeMyPassword = async (passwordData) => {
  const response = await axiosInstance.put(
    "/gateway/auth/change-password",
    passwordData
  );
  return response.data;
};

export const getAuthenticatorSetup = async () => {
  const response = await axiosInstance.get("/gateway/auth/authenticator/setup");
  return response.data;
};

export const enableAuthenticator = async (otp) => {
  const response = await axiosInstance.post(
    "/gateway/auth/authenticator/enable",
    {
      otp,
    }
  );
  return response.data;
};

export const disableAuthenticator = async () => {
  const response = await axiosInstance.post("/gateway/auth/authenticator/disable");
  return response.data;
};