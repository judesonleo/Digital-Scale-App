import React, { useState } from "react";
import { Button, TextInput, View, Text, StyleSheet } from "react-native";
import api from "../../api";
import { saveAuthToken } from "../../utils/authStorage";
import { router } from "expo-router";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			const response = await api.post("/api/auth/login", { email, password });
			const token = response.data.token;

			if (token) {
				await saveAuthToken(token);
				console.log("Login successful and token saved!");
				console.log("Token:", token);
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
				value={email}
				onChangeText={setEmail}
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
});
