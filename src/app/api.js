import axios from "axios";
import { BASE_URL } from "~/constants";

// 1. Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    if (response && response.data) return response.data;
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
