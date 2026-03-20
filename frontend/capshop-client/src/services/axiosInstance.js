import axios from "axios";
import { clearAuthData, getToken } from "../utils/tokenHelper";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      window.location.href = "/access-denied";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;