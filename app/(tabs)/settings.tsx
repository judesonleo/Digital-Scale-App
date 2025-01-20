// app/tabs/settings.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { removeAuthToken } from "../../utils/authStorage";
import { router } from "expo-router";

const Settings = () => {
	const handleLogout = async () => {
		await removeAuthToken(); // Clear token from AsyncStorage
		console.log("User logged out and token removed");
		router.replace("../(auth)/login"); // Redirect to login screen
	};

	return (
		<View>
			<Button title="Logout" onPress={handleLogout} />
		</View>
	);
};

export default Settings;
