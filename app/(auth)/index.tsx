import React, { useState } from "react";
import {
	Button,
	TextInput,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import api from "../../api";
import { saveAuthToken, getAuthToken } from "../../utils/authStorage";
import { router } from "expo-router";

export default function LoginScreen() {
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			const response = await api.post("/api/auth/login", {
				emailOrUsername,
				password,
			});
			const token = response.data.token;
			const userId = response.data.userId;
			const username = response.data.username;
			const name = response.data.name;
			if (token) {
				await saveAuthToken(token, userId, username, name);
				console.log("Login successful and token saved!");
				// console.log("Token:", token);
				// console.log("UserId", response.data.userId);
				// console.log("UserName", response.data.username);
				const userDetails = await getAuthToken();
				// console.log("token", userDetails?.token);
				// console.log("userId", userDetails?.userId);
				// console.log("username", userDetails?.username);
				// console.log("name", userDetails?.name);
				router.replace("../(tabs)/home");
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Login failed");
		}
	};

	return (
		<View style={styles.container}>
			<Text>Login</Text>
			<TextInput
				placeholder="Email"
				value={emailOrUsername}
				onChangeText={setEmailOrUsername}
				style={styles.input}
				autoCapitalize="none"
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={styles.input}
			/>
			<Button title="Login" onPress={handleLogin} />
			{error ? <Text>{error}</Text> : null}
			<TouchableOpacity onPress={() => router.push("/register")}>
				<Text style={styles.Text}>Sign Up</Text>
			</TouchableOpacity>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	input: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginBottom: 20,
		paddingHorizontal: 10,
		color: "white",
	},
	Text: {
		color: "pink",
		fontSize: 20,
	},
});
