import axios from "axios";
import { getAuthToken } from "./utils/authStorage";

const api = axios.create({
	baseURL: "http://localhost:3000",
});

api.interceptors.request.use(async (config) => {
	const token = await getAuthToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
