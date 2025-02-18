import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api", //if development then that url , else whatever the url /api .
  withCredentials: true, //cookies
  
});