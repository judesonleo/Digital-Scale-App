import axios from "axios";
import { getAuthToken } from "./utils/authStorage";

const api = axios.create({
	baseURL: "http://192.168.0.109:3000",
});

api.interceptors.request.use(async (config) => {
	const token = await getAuthToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
