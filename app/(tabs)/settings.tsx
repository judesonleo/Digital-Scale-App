import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { getAuthToken, removeAuthToken } from "../../utils/authStorage";
import { Link, router } from "expo-router";
import api from "@/api";
import styles from "@/styles/styles";
import axios from "axios";
const Settings = () => {
	const [userDetails, setUserDetails] = useState({
		username: "",
		name: "",
		userId: "",
	});
	const [newFamilyMember, setNewFamilyMember] = useState({
		name: "",
		username: "",
		relationship: "",
	});
	useEffect(() => {
		const fetchAuthDetails = async () => {
			const authData = await getAuthToken();
			if (authData) {
				setUserDetails({
					username: authData.username || "N/A",
					name: authData.name || "N/A",
					userId: authData.userId || "",
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
	const handleAddUser = async () => {
		router.navigate("/adduser");
	};

	return (
		<View style={styles.container}>
			<Text style={[styles.title, styles.Text]}>User Settings</Text>
			<View style={styles.details}>
				<Text style={styles.Text}>Username: {userDetails.username}</Text>
				<Text style={styles.Text}>Name: {userDetails.name}</Text>
			</View>
			<View style={styles.form}>
				<Button title="Add User" onPress={handleAddUser} />
				<TouchableOpacity
					onPress={() => router.navigate("/adduser")}
					style={styles.button}
				>
					<Text style={styles.Text}>Add user</Text>
				</TouchableOpacity>
			</View>
			<Button title="Logout" onPress={handleLogout} />
		</View>
	);
};

export default Settings;
