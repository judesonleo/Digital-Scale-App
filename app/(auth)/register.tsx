import React, { useState, useEffect, useRef } from "react";
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
	Keyboard,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import api from "../../api";
import { COLORS, FONT_SIZES } from "../../styles/constants";
import { Eye, EyeOff } from "lucide-react-native";

interface ValidationError {
	field: string;
	message: string;
}

interface PasswordStrength {
	score: number;
	label: string;
	color: string;
}

const RegisterScreen = () => {
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [gender, setGender] = useState<string>("male");
	const [dob, setDob] = useState<Date>(new Date());
	const [height, setHeight] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [date, setDate] = useState(new Date());
	const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
		[]
	);
	const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
		score: 0,
		label: "Very Weak",
		color: COLORS.error,
	});

	const emailRef = useRef<TextInput>(null);
	const usernameRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);
	const heightRef = useRef<TextInput>(null);

	const genderOptions = [
		{ label: "Male", value: "Male" },
		{ label: "Female", value: "Female" },
		{ label: "Other", value: "Other" },
	];

	// Password strength calculation
	const calculatePasswordStrength = (password: string): PasswordStrength => {
		let score = 0;
		if (password.length >= 8) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[!@#$%^&*]/.test(password)) score++;

		switch (score) {
			case 0:
			case 1:
				return { score, label: "Very Weak", color: COLORS.error };
			case 2:
				return { score, label: "Weak", color: "#FFA726" };
			case 3:
				return { score, label: "Medium", color: "#FFB74D" };
			case 4:
				return { score, label: "Strong", color: "#66BB6A" };
			case 5:
				return { score, label: "Very Strong", color: "#43A047" };
			default:
				return { score: 0, label: "Very Weak", color: COLORS.error };
		}
	};

	// Password requirements checklist
	const passwordRequirements = [
		{ label: "At least 8 characters", check: (p: string) => p.length >= 8 },
		{ label: "One uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
		{ label: "One lowercase letter", check: (p: string) => /[a-z]/.test(p) },
		{ label: "One number", check: (p: string) => /[0-9]/.test(p) },
		{
			label: "One special character",
			check: (p: string) => /[!@#$%^&*]/.test(p),
		},
	];

	// Update password strength when password changes
	useEffect(() => {
		if (password) {
			setPasswordStrength(calculatePasswordStrength(password));
		}
	}, [password]);

	// Validation functions
	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password: string): string[] => {
		const errors: string[] = [];
		if (password.length < 8)
			errors.push("Password must be at least 8 characters");
		if (!/[A-Z]/.test(password))
			errors.push("Password must contain at least one uppercase letter");
		if (!/[a-z]/.test(password))
			errors.push("Password must contain at least one lowercase letter");
		if (!/[0-9]/.test(password))
			errors.push("Password must contain at least one number");
		if (!/[!@#$%^&*]/.test(password))
			errors.push("Password must contain at least one special character");
		return errors;
	};

	const validateUsername = (username: string): string[] => {
		const errors: string[] = [];
		if (username.length < 3)
			errors.push("Username must be at least 3 characters");
		if (!/^[a-zA-Z0-9_]+$/.test(username))
			errors.push(
				"Username can only contain letters, numbers, and underscores"
			);
		return errors;
	};

	const validateHeight = (height: string): string[] => {
		const errors: string[] = [];
		const heightNum = parseFloat(height);
		if (isNaN(heightNum)) errors.push("Height must be a valid number");
		else if (heightNum < 50 || heightNum > 250)
			errors.push("Height must be between 50 and 250 cm");
		return errors;
	};

	const validateName = (name: string): string[] => {
		const errors: string[] = [];
		if (name.length < 2) errors.push("Name must be at least 2 characters");
		if (!/^[a-zA-Z\s]+$/.test(name))
			errors.push("Name can only contain letters and spaces");
		return errors;
	};

	// Real-time validation
	useEffect(() => {
		const errors: ValidationError[] = [];

		if (name) {
			const nameErrors = validateName(name);
			if (nameErrors.length > 0) {
				errors.push({ field: "name", message: nameErrors[0] });
			}
		}

		if (email) {
			if (!validateEmail(email)) {
				errors.push({
					field: "email",
					message: "Please enter a valid email address",
				});
			}
		}

		if (username) {
			const usernameErrors = validateUsername(username);
			if (usernameErrors.length > 0) {
				errors.push({ field: "username", message: usernameErrors[0] });
			}
		}

		if (password) {
			const passwordErrors = validatePassword(password);
			if (passwordErrors.length > 0) {
				errors.push({ field: "password", message: passwordErrors[0] });
			}
		}

		if (height) {
			const heightErrors = validateHeight(height);
			if (heightErrors.length > 0) {
				errors.push({ field: "height", message: heightErrors[0] });
			}
		}

		setValidationErrors(errors);
	}, [name, email, username, password, height]);

	const handleDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDate(selectedDate);
			setDob(selectedDate);
		}
	};

	const showDatePickerModal = () => {
		setShowDatePicker(true);
	};

	const handleRegister = async () => {
		Keyboard.dismiss();

		if (!name || !email || !username || !password || !height) {
			setError("Please fill in all fields.");
			return;
		}

		if (validationErrors.length > 0) {
			setError("Please fix the validation errors before submitting.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const { data } = await api.post("/api/auth/register", {
				name,
				email,
				username,
				password,
				gender,
				dob,
				height: parseFloat(height),
			});

			if (data.message === "User registered successfully") {
				router.replace("/login");
			} else {
				setError("Registration failed. Please try again.");
			}
		} catch (err: any) {
			setError(
				err?.response?.data?.message || "An error occurred. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const formItems = [
		{
			label: "Name",
			value: name,
			setter: setName,
			keyboardType: "default",
			error: validationErrors.find((e) => e.field === "name")?.message,
			ref: null,
			returnKeyType: "next",
			onSubmitEditing: () => emailRef.current?.focus(),
		},
		{
			label: "Email",
			value: email,
			setter: setEmail,
			keyboardType: "email-address",
			error: validationErrors.find((e) => e.field === "email")?.message,
			ref: emailRef,
			returnKeyType: "next",
			onSubmitEditing: () => usernameRef.current?.focus(),
		},
		{
			label: "Username",
			value: username,
			setter: setUsername,
			keyboardType: "default",
			error: validationErrors.find((e) => e.field === "username")?.message,
			ref: usernameRef,
			returnKeyType: "next",
			onSubmitEditing: () => passwordRef.current?.focus(),
		},
		{
			label: "Password",
			value: password,
			setter: setPassword,
			keyboardType: "default",
			secureTextEntry: !showPassword,
			error: validationErrors.find((e) => e.field === "password")?.message,
			ref: passwordRef,
			returnKeyType: "next",
			onSubmitEditing: () => heightRef.current?.focus(),
			rightIcon: (
				<TouchableOpacity
					onPress={() => setShowPassword(!showPassword)}
					style={styles.iconButton}
				>
					{showPassword ? (
						<EyeOff size={20} color={COLORS.white} />
					) : (
						<Eye size={20} color={COLORS.white} />
					)}
				</TouchableOpacity>
			),
		},
		{
			label: "Height (cm)",
			value: height,
			setter: setHeight,
			keyboardType: "numeric",
			error: validationErrors.find((e) => e.field === "height")?.message,
			ref: heightRef,
			returnKeyType: "done",
			onSubmitEditing: () => Keyboard.dismiss(),
		},
	];

	const renderItem = ({ item }: { item: any }) => {
		return (
			<View style={styles.formItem}>
				<Text style={styles.text}>{item.label}</Text>
				<View style={styles.inputContainer}>
					<TextInput
						ref={item.ref}
						style={[styles.input, item.error && styles.inputError]}
						placeholder={`Enter your ${item.label.toLowerCase()}`}
						placeholderTextColor="rgba(255,255,255,0.7)"
						value={item.value}
						onChangeText={item.setter}
						keyboardType={item.keyboardType}
						secureTextEntry={item.secureTextEntry}
						returnKeyType={item.returnKeyType}
						onSubmitEditing={item.onSubmitEditing}
					/>
					{item.rightIcon}
				</View>
				{item.error && <Text style={styles.errorText}>{item.error}</Text>}
				{item.label === "Password" && (
					<View style={styles.passwordStrengthContainer}>
						<View style={styles.strengthBar}>
							<View
								style={[
									styles.strengthFill,
									{
										width: `${(passwordStrength.score / 5) * 100}%`,
										backgroundColor: passwordStrength.color,
									},
								]}
							/>
						</View>
						<Text
							style={[styles.strengthText, { color: passwordStrength.color }]}
						>
							{passwordStrength.label}
						</Text>
						<View style={styles.requirementsList}>
							{passwordRequirements.map((req, index) => (
								<View key={index} style={styles.requirementItem}>
									<View
										style={[
											styles.requirementDot,
											{
												backgroundColor: req.check(password)
													? COLORS.primary
													: COLORS.error,
											},
										]}
									/>
									<Text style={styles.requirementText}>{req.label}</Text>
								</View>
							))}
						</View>
					</View>
				)}
			</View>
		);
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

					{error && <Text style={styles.errorText}>{error}</Text>}

					<FlatList
						data={formItems}
						renderItem={renderItem}
						keyExtractor={(item) => item.label}
						contentContainerStyle={styles.scrollContainer}
						showsVerticalScrollIndicator={false}
						ListFooterComponent={
							<>
								<Text style={styles.text}>Gender</Text>
								<FlatList
									data={genderOptions}
									renderItem={({ item }) => (
										<TouchableOpacity
											style={[
												styles.dropdown,
												gender === item.value && {
													borderColor: COLORS.primary,
												},
											]}
											onPress={() => setGender(item.value)}
										>
											<Text
												style={[
													styles.selectedText,
													gender === item.value && {
														color: COLORS.secondary,
													},
												]}
											>
												{item.label}
											</Text>
										</TouchableOpacity>
									)}
									keyExtractor={(item) => item.value}
								/>

								<Text style={styles.text}>Date of Birth</Text>
								<TouchableOpacity
									onPress={showDatePickerModal}
									style={styles.dateButton}
								>
									<Text style={styles.dateText}>{date.toDateString()}</Text>
								</TouchableOpacity>

								{showDatePicker && (
									<DateTimePicker
										value={date}
										mode="date"
										display="default"
										onChange={handleDateChange}
										maximumDate={new Date()}
										minimumDate={new Date(1900, 0, 1)}
									/>
								)}
							</>
						}
					/>

					<View style={styles.buttonsContainer}>
						{loading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={COLORS.primary} />
								<Text style={styles.loadingText}>Creating your account...</Text>
							</View>
						) : (
							<TouchableOpacity
								onPress={handleRegister}
								style={[
									styles.button,
									validationErrors.length > 0 && styles.buttonDisabled,
								]}
								disabled={validationErrors.length > 0}
							>
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
		marginBottom: 15,
	},
	text: {
		fontSize: FONT_SIZES.small,
		color: COLORS.white,
		marginBottom: 5,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	input: {
		flex: 1,
		height: 50,
		backgroundColor: COLORS.inputBackground,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 5,
		color: COLORS.white,
	},
	inputError: {
		borderColor: COLORS.error,
		borderWidth: 1,
	},
	iconButton: {
		padding: 10,
		position: "absolute",
		right: 10,
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
	selectedText: {
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
	buttonDisabled: {
		opacity: 0.5,
	},
	gradient: {
		borderRadius: 10,
		paddingVertical: 15,
		alignItems: "center",
	},
	buttonText: {
		fontSize: FONT_SIZES.middle,
		fontWeight: "bold",
	},
	buttonTextLink: {
		fontSize: FONT_SIZES.small,
		textDecorationLine: "underline",
	},
	errorText: {
		color: COLORS.error,
		fontSize: FONT_SIZES.small,
		marginTop: 5,
	},
	dateButton: {
		height: 50,
		justifyContent: "center",
		borderRadius: 10,
		backgroundColor: COLORS.inputBackground,
		paddingHorizontal: 15,
		marginBottom: 15,
		alignItems: "center",
	},
	dateText: {
		fontSize: FONT_SIZES.middle,
		color: COLORS.white,
	},
	passwordStrengthContainer: {
		marginTop: 10,
	},
	strengthBar: {
		height: 4,
		backgroundColor: "rgba(255,255,255,0.2)",
		borderRadius: 2,
		marginBottom: 5,
	},
	strengthFill: {
		height: "100%",
		borderRadius: 2,
	},
	strengthText: {
		fontSize: FONT_SIZES.small,
		marginBottom: 5,
	},
	requirementsList: {
		marginTop: 5,
	},
	requirementItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 3,
	},
	requirementDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		marginRight: 8,
	},
	requirementText: {
		fontSize: FONT_SIZES.small,
		color: COLORS.white,
	},
	loadingContainer: {
		alignItems: "center",
	},
	loadingText: {
		color: COLORS.white,
		marginTop: 10,
		fontSize: FONT_SIZES.small,
	},
});

export default RegisterScreen;
