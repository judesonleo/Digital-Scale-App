import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface AuthToken {
	token: string;
	userId: number;
	username: string;
	name: string;
}

export const saveAuthToken = async (
	token: AuthToken["token"],
	userId: AuthToken["userId"],
	username: AuthToken["username"],
	name: AuthToken["name"]
): Promise<void> => {
	try {
		await AsyncStorage.setItem("authToken", token);
		await AsyncStorage.setItem("userId", userId.toString());
		await AsyncStorage.setItem("username", username);
		await AsyncStorage.setItem("name", name);
	} catch (error) {
		console.error("Error saving details", error);
	}
};

export const getAuthToken = async () => {
	try {
		const token = await AsyncStorage.getItem("authToken");
		const userId = await AsyncStorage.getItem("userId");
		const username = await AsyncStorage.getItem("username");
		const name = await AsyncStorage.getItem("name");
		return { token, userId, username, name };
	} catch (error) {
		console.error("Error retrieving token ,userId ,usernsme , name ", error);
		return null;
	}
};

export const removeAuthToken = async () => {
	try {
		await AsyncStorage.removeItem("authToken");
		await AsyncStorage.removeItem("userId");
		await AsyncStorage.removeItem("username");
		await AsyncStorage.removeItem("name");
	} catch (error) {
		console.error("Error removing token ,userId,username , name ", error);
	}
};
