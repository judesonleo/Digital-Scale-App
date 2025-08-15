import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface AuthToken {
	token: string;
	userId: number;
	username: string;
	name: string;
	email: string;
}

const AUTH_TOKEN_KEY = "auth_token";

export const saveAuthToken = async (
	token: AuthToken["token"],
	userId: AuthToken["userId"],
	username: AuthToken["username"],
	name: AuthToken["name"],
	email: AuthToken["email"]
): Promise<void> => {
	try {
		await AsyncStorage.setItem(
			AUTH_TOKEN_KEY,
			JSON.stringify({ token, userId, username, name, email })
		);
	} catch (error) {
		console.error("Error saving details", error);
	}
};

export const getAuthToken = async () => {
	try {
		const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
		return token ? JSON.parse(token) : null;
	} catch (error) {
		console.error("Error getting auth token:", error);
		return null;
	}
};

export const removeAuthToken = async () => {
	try {
		await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
	} catch (error) {
		console.error("Error removing auth token:", error);
	}
};

export const clearAuthToken = async () => {
	try {
		await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
	} catch (error) {
		console.error("Error clearing auth token:", error);
	}
};
