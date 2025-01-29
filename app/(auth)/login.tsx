import React, { useEffect, useState } from "react";
import {
	TextInput,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ImageBackground,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import api from "../../api";
import { saveAuthToken, getAuthToken } from "../../utils/authStorage";

import { COLORS, FONT_SIZES } from "../../styles/constants";
import { useAuth } from "@/hooks/useAuth";

const LoginScreen = () => {
	const [emailOrUsername, setEmailOrUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			router.replace("../(tabs)/home"); // Redirect to the home tab if authenticated
		}
	}, [user, loading]);

	const handleLogin = async () => {
		setLoading(true);
		setError("");
		try {
			const { data } = await api.post("/api/auth/login", {
				emailOrUsername,
				password,
			});
			const { token, userId, username, name } = data;
			if (token) {
				await saveAuthToken(token, userId, username, name);
				router.replace("../(tabs)/home"); // Replace the login screen with the home screen
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Something went wrong.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ImageBackground
			source={require("../../assets/images/login.jpg")}
			style={styles.background}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<BlurView intensity={40} tint="dark" style={styles.blurContainer}>
					<View style={styles.form}>
						<Text style={styles.headerText}>Login to Scale</Text>
						<Text style={styles.text}>Email or Username</Text>
						<TextInput
							placeholder="hello@Scale.com"
							placeholderTextColor={COLORS.white}
							value={emailOrUsername}
							onChangeText={setEmailOrUsername}
							style={styles.input}
							autoCapitalize="none"
						/>

						<Text style={styles.text}>Password</Text>
						<TextInput
							placeholder="Your Password"
							placeholderTextColor={COLORS.white}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							style={styles.input}
							autoCapitalize="none"
						/>
						<Text style={styles.forgot}>Forgot Password?</Text>
						{error ? <Text style={styles.errorText}>{error}</Text> : null}
					</View>

					<View style={styles.buttonsContainer}>
						{loading ? (
							<ActivityIndicator size="large" color={COLORS.primary} />
						) : (
							<TouchableOpacity onPress={handleLogin} style={styles.button}>
								<LinearGradient
									colors={[COLORS.primary, COLORS.secondary]}
									style={styles.gradient}
								>
									<Text style={[styles.buttonText, styles.whiteColor]}>
										Login
									</Text>
								</LinearGradient>
							</TouchableOpacity>
						)}

						<TouchableOpacity onPress={() => router.push("/register")}>
							<Text style={[styles.buttonTextLink, styles.whiteColor]}>
								Don't have an Account? Sign Up
							</Text>
						</TouchableOpacity>
					</View>
				</BlurView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
		resizeMode: "cover",
	},
	container: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "flex-start",
	},
	blurContainer: {
		flex: 1,
		justifyContent: "flex-start",
		width: "100%",
		paddingTop: 170,
		padding: 20,
	},
	form: {
		borderRadius: 10,
		padding: 20,
		marginBottom: 20,
	},
	headerText: {
		fontSize: FONT_SIZES.large,
		fontWeight: "bold",
		color: COLORS.white,
		textAlign: "left",
		marginBottom: 20,
	},
	input: {
		height: 50,
		borderColor: "rgba(255, 255, 255, 0.5)",
		borderWidth: 1,
		marginBottom: 15,
		paddingHorizontal: 15,
		borderRadius: 10,
		color: COLORS.white,
		backgroundColor: COLORS.inputBackground,
	},
	buttonsContainer: {
		width: "100%",
		alignItems: "center",
	},
	button: {
		height: 55,
		borderRadius: 10,
		overflow: "hidden",
		width: "100%",
		margin: 10,
	},
	buttonTextLink: {
		fontSize: FONT_SIZES.small,
		fontWeight: "bold",
		textDecorationLine: "underline",
	},
	gradient: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
	},
	buttonText: {
		fontSize: FONT_SIZES.medium,
		fontWeight: "bold",
	},
	primaryColor: {
		color: COLORS.primary,
	},
	whiteColor: {
		color: COLORS.white,
	},
	errorText: {
		color: COLORS.error,
		marginBottom: 10,
		margin: 30,
		textAlign: "center",
		fontSize: FONT_SIZES.small,
	},
	forgot: {
		color: COLORS.error,
		fontSize: FONT_SIZES.small,
		marginBottom: 10,
		padding: 3,
		textAlign: "left",
	},
	text: {
		color: COLORS.white,
		fontSize: FONT_SIZES.small,
		marginBottom: 10,
		padding: 3,
		textAlign: "left",
	},
});

export default LoginScreen;
