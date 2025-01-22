import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { getAuthToken, removeAuthToken } from "../../utils/authStorage";
import { router } from "expo-router";

const Settings = () => {
	const [userDetails, setUserDetails] = useState({
		username: "",
		name: "",
	});

	useEffect(() => {
		const fetchAuthDetails = async () => {
			const authData = await getAuthToken();
			if (authData) {
				setUserDetails({
					username: authData.username || "N/A",
					name: authData.name || "N/A",
				});
			}
		};

		fetchAuthDetails(); // Trigger fetching auth data on component mount
	}, []);

	const handleLogout = async () => {
		await removeAuthToken(); // Clear token from AsyncStorage
		console.log("User logged out and details removed");
		router.replace("../(auth)"); // Redirect to login screen
	};

	return (
		<View style={styles.container}>
			<Text style={[styles.title, styles.pinkText]}>User Settings</Text>
			<View style={styles.details}>
				<Text style={styles.pinkText}>Username: {userDetails.username}</Text>
				<Text style={styles.pinkText}>Name: {userDetails.name}</Text>
			</View>
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
	title: {
		fontSize: 24,
		marginBottom: 20,
	},
	details: {
		marginBottom: 20,
	},
	pinkText: {
		color: "pink",
	},
});

export default Settings;
