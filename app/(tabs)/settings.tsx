// app/tabs/settings.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { removeAuthToken } from "../../utils/authStorage";
import { router } from "expo-router";

const Settings = () => {
	const handleLogout = async () => {
		await removeAuthToken(); // Clear token from AsyncStorage
		console.log("User logged out and token removed");
		router.replace("../(auth)"); // Redirect to login screen
	};

	return (
		<View style={styles.container}>
			<Button title="Logout" onPress={handleLogout} />
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Settings;
