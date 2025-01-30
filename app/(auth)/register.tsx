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
} from "react-native";
import DatePicker from "react-native-date-picker";
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
	const [open, setOpen] = useState(false);
	const [date, setDate] = useState(new Date());

	const genderOptions = [
		{ label: "Male", value: "Male" },
		{ label: "Female", value: "Female" },
		{ label: "Other", value: "Other" },
	];

	const handleDateConfirm = (selectedDate: Date) => {
		setOpen(false);
		setDate(selectedDate);
	};

	const handleRegister = async () => {
		if (!name || !email || !username || !password || !height) {
			setError("Please fill in all fields.");
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
				height,
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
									onPress={() => setOpen(true)}
									style={styles.dateButton}
								>
									<Text style={styles.dateText}>{date.toDateString()}</Text>
								</TouchableOpacity>

								<DatePicker
									modal
									mode="date"
									open={open}
									date={date}
									onConfirm={handleDateConfirm}
									onCancel={() => setOpen(false)}
									minimumDate={new Date(1900, 0, 1)}
									maximumDate={new Date()}
									style={styles.datePicker}
								/>
							</>
						}
					/>

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
		fontSize: FONT_SIZES.medium,
		color: COLORS.white,
	},
	datePicker: {
		backgroundColor: COLORS.inputBackground,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.5)",
		paddingHorizontal: 15,
	},
});

export default RegisterScreen;
