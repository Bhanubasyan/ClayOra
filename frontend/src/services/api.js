import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
 // baseURL: "http://localhost:5000/api", 
// baseURL: "https://full-stack-ecommerce-marketplace.onrender.com/api",
});

// Add token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
