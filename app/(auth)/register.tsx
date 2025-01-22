import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import axios from "axios";
import api from "../../api";

interface RegisterData {
	name: string;
	email: string;
	username: string;
	password: string;
}

const Register = () => {
	const [formData, setFormData] = useState<RegisterData>({
		name: "",
		email: "",
		username: "",
		password: "",
	});

	const handleInputChange = (field: keyof RegisterData, value: string) => {
		setFormData((prevData) => ({
			...prevData,
			[field]: value,
		}));
	};

	const handleRegister = async () => {
		try {
			const response = await api.post("/api/auth/register", formData);
			// If registration is successful, show a success message
			Alert.alert("Success", response.data.message);
		} catch (error: any) {
			// Handle errors (e.g., user already exists, validation errors)
			if (error.response && error.response.data) {
				Alert.alert(
					"Error",
					error.response.data.error || "Registration failed"
				);
			} else {
				Alert.alert("Error", "An error occurred during registration");
			}
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Register</Text>
			<TextInput
				style={styles.input}
				placeholder="Name"
				value={formData.name}
				onChangeText={(text) => handleInputChange("name", text)}
			/>
			<TextInput
				style={styles.input}
				placeholder="Email"
				value={formData.email}
				onChangeText={(text) => handleInputChange("email", text)}
				keyboardType="email-address"
			/>
			<TextInput
				style={styles.input}
				placeholder="Username"
				value={formData.username}
				onChangeText={(text) => handleInputChange("username", text)}
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				value={formData.password}
				onChangeText={(text) => handleInputChange("password", text)}
				secureTextEntry
			/>
			<Button title="Register" onPress={handleRegister} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
	},
	input: {
		width: "100%",
		padding: 10,
		marginVertical: 10,
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
		color: "red",
	},
});

export default Register;
