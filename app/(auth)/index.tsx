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
import { saveAuthToken } from "../../utils/authStorage";
import { COLORS, FONT_SIZES } from "../../styles/constants"; // Adjust the path based on your file structure
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		router.push("/login");
	};
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			router.replace("../(tabs)/home"); // Redirect to the home tab if authenticated
		}
	}, [user, loading]);

	return (
		<ImageBackground
			source={require("../../assets/images/login.jpg")}
			style={styles.background}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<BlurView intensity={0} tint="dark" style={styles.blurContainer}>
					<View style={styles.buttonsContainer}>
						{loading ? (
							<ActivityIndicator size="large" color="#fff" />
						) : (
							<TouchableOpacity onPress={handleLogin} style={styles.button}>
								<LinearGradient
									colors={[COLORS.white, COLORS.white]}
									style={styles.gradient}
								>
									<Text style={[styles.buttonText, styles.primaryColor]}>
										Login
									</Text>
								</LinearGradient>
							</TouchableOpacity>
						)}

						<TouchableOpacity
							onPress={() => router.push("/register")}
							style={[styles.button]}
						>
							<LinearGradient
								colors={[COLORS.primary, COLORS.primary]}
								style={styles.gradient}
							>
								<Text style={[styles.buttonText, styles.whiteColor]}>
									Sign Up
								</Text>
							</LinearGradient>
						</TouchableOpacity>
					</View>
				</BlurView>
			</KeyboardAvoidingView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		resizeMode: "cover",
	},
	container: {
		flex: 1,
		justifyContent: "center", // Center the content vertically
		alignItems: "center",
	},
	blurContainer: {
		flex: 1,
		justifyContent: "flex-end", // Place form and buttons at the bottom
		width: "100%",
		padding: 20,
		marginBottom: 50,
	},

	buttonsContainer: {
		width: "100%",
		alignItems: "center", // Center buttons horizontally
	},
	button: {
		height: 55,
		borderRadius: 70,
		overflow: "hidden",
		width: "100%",
		margin: 5,
	},
	gradient: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		// color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	errorText: {
		color: "red",
		marginBottom: 10,
		textAlign: "center",
		fontSize: 14,
	},
	signUpText: {
		color: "#ff7f50",
		fontSize: 18,
		textAlign: "center",
		marginTop: 15,
	},
	primaryColor: {
		color: COLORS.primary,
	},
	whiteColor: {
		color: COLORS.white,
	},
});
