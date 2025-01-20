import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface AuthToken {
	token: string;
}

export const saveAuthToken = async (
	token: AuthToken["token"]
): Promise<void> => {
	try {
		await AsyncStorage.setItem("authToken", token);
	} catch (error) {
		console.error("Error saving token", error);
	}
};

export const getAuthToken = async () => {
	try {
		return await AsyncStorage.getItem("authToken");
	} catch (error) {
		console.error("Error retrieving token", error);
		return null;
	}
};

export const removeAuthToken = async () => {
	try {
		await AsyncStorage.removeItem("authToken");
	} catch (error) {
		console.error("Error removing token", error);
	}
};
