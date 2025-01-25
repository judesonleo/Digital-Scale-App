import React, { useState } from "react";
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
	FlatList,
	Animated, // Import Animated for dynamic layout changes
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import api from "../../api";
import { COLORS, FONT_SIZES } from "../../styles/constants";

const RegisterScreen = () => {
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [gender, setGender] = useState<string>("male");
	const [dob, setDob] = useState<Date>(new Date());
	const [height, setHeight] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [isDobPickerVisible, setDobPickerVisible] = useState<boolean>(false);
	const [isGenderDropdownOpen, setGenderDropdownOpen] =
		useState<boolean>(false);

	// Manage the height of the dropdown expansion dynamically
	const [dropdownHeight, setDropdownHeight] = useState(new Animated.Value(0)); // Animated height

	const genderOptions = [
		{ label: "Male", value: "male" },
		{ label: "Female", value: "female" },
		{ label: "Other", value: "other" },
	];

	const handleRegister = async () => {
		if (!name || !email || !username || !password || !height) {
			setError("Please fill in all fields.");
			return;
		}

		setLoading(true);
		setError(""); // Clear previous errors

		try {
			const { data } = await api.post("/api/auth/register", {
				name,
				email,
				username,
				password,
				gender,
				dob,
				height,
			});

			if (data.message === "User registered successfully") {
				router.replace("/login");
			} else {
				setError("Registration failed. Please try again.");
			}
		} catch (err: any) {
			if (err?.response?.data?.message) {
				setError(err?.response?.data?.message);
			} else {
				setError("An error occurred during registration. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	// List of form items
	const formItems = [
		{ label: "Name", value: name, setter: setName, keyboardType: "default" },
		{
			label: "Email",
			value: email,
			setter: setEmail,
			keyboardType: "email-address",
		},
		{
			label: "Username",
			value: username,
			setter: setUsername,
			keyboardType: "default",
		},
		{
			label: "Password",
			value: password,
			setter: setPassword,
			keyboardType: "default",
			secureTextEntry: true,
		},
		{
			label: "Height (cm)",
			value: height,
			setter: setHeight,
			keyboardType: "numeric",
		},
	];

	const renderItem = ({ item }: { item: any }) => {
		return (
			<View style={styles.formItem}>
				<Text style={styles.text}>{item.label}</Text>
				<TextInput
					style={styles.input}
					placeholder={`Enter your ${item.label.toLowerCase()}`}
					placeholderTextColor="rgba(255,255,255,0.7)"
					value={item.value}
					onChangeText={item.setter}
					keyboardType={item.keyboardType}
					secureTextEntry={item.secureTextEntry}
				/>
			</View>
		);
	};

	// Manage dropdown toggle and adjust height dynamically using Animated
	const handleDropdownToggle = () => {
		if (isGenderDropdownOpen) {
			// Collapse the dropdown
			Animated.timing(dropdownHeight, {
				toValue: 0,
				duration: 300,
				useNativeDriver: false,
			}).start();
		} else {
			// Expand the dropdown
			Animated.timing(dropdownHeight, {
				toValue: 150, // Adjust this value to the height of the expanded dropdown
				duration: 300,
				useNativeDriver: false,
			}).start();
		}
		setGenderDropdownOpen(!isGenderDropdownOpen);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<ImageBackground
				source={require("../../assets/images/login.jpg")}
				style={styles.background}
			>
				<BlurView intensity={40} tint="dark" style={styles.blurContainer}>
					<Text style={styles.headerText}>Create Account</Text>

					<FlatList
						data={formItems}
						renderItem={renderItem}
						keyExtractor={(item) => item.label}
						contentContainerStyle={styles.scrollContainer}
						showsVerticalScrollIndicator={false} // Hide scroll bar
						ListFooterComponent={
							<>
								{/* Gender dropdown */}
								<Text style={styles.text}>Gender</Text>
								<TouchableOpacity onPress={handleDropdownToggle}>
									<Dropdown
										style={styles.dropdown}
										data={genderOptions}
										labelField="label"
										valueField="value"
										placeholder="Select Gender"
										placeholderStyle={styles.placeholderText}
										selectedTextStyle={styles.selectedText}
										value={gender}
										onChange={(item) => setGender(item.value)}
									/>
								</TouchableOpacity>

								{/* Animated dropdown space */}
								<Animated.View style={{ height: dropdownHeight }}>
									{/* This will expand and collapse dynamically */}
								</Animated.View>

								{/* DOB */}
								<Text style={styles.text}>Date of Birth</Text>
								<TouchableOpacity
									onPress={() => setDobPickerVisible(true)}
									style={styles.dateButton}
								>
									<Text style={styles.dateText}>{dob.toDateString()}</Text>
								</TouchableOpacity>
							</>
						}
					/>

					{/* Fixed buttons outside FlatList */}
					<View style={styles.buttonsContainer}>
						{loading ? (
							<ActivityIndicator size="large" color={COLORS.primary} />
						) : (
							<TouchableOpacity onPress={handleRegister} style={styles.button}>
								<LinearGradient
									colors={[COLORS.white, COLORS.white]}
									style={styles.gradient}
								>
									<Text style={[styles.buttonText, { color: COLORS.primary }]}>
										Register
									</Text>
								</LinearGradient>
							</TouchableOpacity>
						)}

						<TouchableOpacity onPress={() => router.push("/login")}>
							<Text style={[styles.buttonTextLink, { color: COLORS.white }]}>
								Already have an account? Login
							</Text>
						</TouchableOpacity>
					</View>
				</BlurView>
			</ImageBackground>

			<DateTimePickerModal
				isVisible={isDobPickerVisible}
				mode="date"
				date={dob}
				onConfirm={(date) => {
					setDob(date);
					setDobPickerVisible(false);
				}}
				onCancel={() => setDobPickerVisible(false)}
				minimumDate={new Date(1900, 0, 1)}
				maximumDate={new Date()}
			/>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
		resizeMode: "cover",
	},
	container: {
		flex: 1,
		justifyContent: "center",
	},
	blurContainer: {
		flex: 1,
		justifyContent: "flex-start",
		width: "100%",
		paddingTop: 100,
		padding: 20,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		color: COLORS.white,
		marginBottom: 20,
		textAlign: "center",
	},
	scrollContainer: {
		flexGrow: 1,
		paddingBottom: 20,
	},
	formItem: {
		marginBottom: 5,
	},
	text: {
		fontSize: FONT_SIZES.small,
		color: COLORS.white,
		marginBottom: 5,
	},
	input: {
		height: 50,
		backgroundColor: COLORS.inputBackground,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 15,
		color: COLORS.white,
	},
	dropdown: {
		height: 50,
		backgroundColor: COLORS.inputBackground,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.5)",
		paddingHorizontal: 15,
		justifyContent: "center",
		marginBottom: 15,
	},
	placeholderText: {
		fontSize: FONT_SIZES.small,
		color: "rgba(255,255,255,0.7)",
	},
	selectedText: {
		fontSize: FONT_SIZES.small,
		color: COLORS.white,
	},
	dateButton: {
		height: 50,
		justifyContent: "center",
		borderRadius: 10,
		backgroundColor: COLORS.inputBackground,
		paddingHorizontal: 15,
		marginBottom: 15,
	},
	dateText: {
		fontSize: FONT_SIZES.small,
		color: COLORS.white,
	},
	buttonsContainer: {
		alignItems: "center",
		marginBottom: 20,
	},
	button: {
		width: "100%",
		marginBottom: 10,
	},
	gradient: {
		borderRadius: 10,
		paddingVertical: 15,
		alignItems: "center",
	},
	buttonText: {
		fontSize: FONT_SIZES.medium,
		fontWeight: "bold",
	},
	buttonTextLink: {
		fontSize: FONT_SIZES.small,
		textDecorationLine: "underline",
	},
	errorText: {
		color: COLORS.error,
		textAlign: "center",
		marginBottom: 10,
	},
});

export default RegisterScreen;
