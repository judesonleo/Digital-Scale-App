import {
	Text,
	View,
	Alert,
	TextInput,
	TouchableOpacity,
	Animated,
	Dimensions,
	StyleSheet,
	TextInputProps,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	useColorScheme,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getAuthToken } from "@/utils/authStorage";
import api from "@/api";
import { router } from "expo-router";
import { Picker, PickerIOS } from "@react-native-picker/picker";

// Interfaces remain the same
interface UserDetails {
	userId: string;
}

interface FamilyMember {
	name: string;
	username: string;
	relationship: string;
	gender: string;
	height: string;
	dob: Date;
}

interface FormErrors {
	name?: string;
	username?: string;
	relationship?: string;
	gender?: string;
	height?: string;
}

interface InputFieldProps extends Omit<TextInputProps, "style"> {
	error?: string;
	theme: typeof lightTheme | typeof darkTheme;
}

// Theme definitions

const palette = {
	outerSpace: "#484C47",
	brunswickGreen: "#304C37",
	babyPowder: "#FBFCFA",
	night: "#11100E",
	hookersGreen: "#406F62",
	darkGreen: "#203228",
	darkGreen2: "#092B1B",
	white: "#FFFFFF",
	timberwolf: "#CED3D1",
	darkGreen3: "#0D301C",
} as const;

// Theme definitions using the palette
const lightTheme = {
	primary: palette.brunswickGreen,
	secondary: palette.hookersGreen,
	background: palette.babyPowder,
	surface: palette.white,
	text: palette.night,
	textSecondary: palette.outerSpace,
	border: palette.timberwolf,
	error: "#dc3545", // keeping error red for better visibility
	success: palette.darkGreen2,
	inputBackground: palette.white,
	buttonBackground: palette.darkGreen2,
	buttonText: palette.white,
} as const;

const darkTheme = {
	primary: palette.hookersGreen,
	secondary: palette.brunswickGreen,
	background: palette.night,
	surface: palette.darkGreen,
	text: palette.babyPowder,
	textSecondary: palette.timberwolf,
	border: palette.darkGreen3,
	error: "#cf6679", // softer red for dark mode
	success: palette.brunswickGreen,
	inputBackground: palette.darkGreen3,
	buttonBackground: palette.hookersGreen,
	buttonText: palette.white,
} as const;

// Memoized Input Field Component
const InputField = memo<InputFieldProps>(
	({
		placeholder,
		value,
		onChangeText,
		error,
		secureTextEntry,
		keyboardType,
		theme,
	}) => (
		<View style={styles.inputContainer}>
			<TextInput
				style={[
					styles.input,
					{
						backgroundColor: theme.inputBackground,
						borderColor: error ? theme.error : theme.border,
						color: theme.text,
					},
				]}
				placeholder={placeholder}
				placeholderTextColor={theme.textSecondary}
				value={value}
				onChangeText={onChangeText}
				secureTextEntry={secureTextEntry}
				keyboardType={keyboardType}
				autoCapitalize="none"
				autoCorrect={false}
			/>
			{error && (
				<Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
			)}
		</View>
	)
);

const AddUser: React.FC = () => {
	const colorScheme = useColorScheme();
	const theme = colorScheme === "dark" ? darkTheme : lightTheme;

	const [userDetails, setUserDetails] = useState<UserDetails>({ userId: "" });
	const [newFamilyMember, setNewFamilyMember] = useState<FamilyMember>({
		name: "",
		username: "",
		relationship: "",
		gender: "",
		height: "",
		dob: new Date(),
	});
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [errors, setErrors] = useState<FormErrors>({});

	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(
		new Animated.Value(Dimensions.get("window").height)
	).current;

	useEffect(() => {
		const fetchAuthDetails = async (): Promise<void> => {
			const authData = await getAuthToken();
			if (authData) {
				setUserDetails({ userId: authData.userId || "" });
			}
		};

		fetchAuthDetails();

		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.spring(slideAnim, {
				toValue: 0,
				tension: 20,
				friction: 7,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const validateForm = useCallback((): boolean => {
		const newErrors: FormErrors = {};
		if (!newFamilyMember.name) newErrors.name = "Name is required";
		if (!newFamilyMember.username) newErrors.username = "Username is required";
		if (!newFamilyMember.relationship)
			newErrors.relationship = "Relationship is required";
		if (!newFamilyMember.gender) newErrors.gender = "Gender is required";
		if (!newFamilyMember.height) newErrors.height = "Height is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [newFamilyMember]);

	const handleInputChange = useCallback(
		(field: keyof FamilyMember) => (text: string) => {
			setNewFamilyMember((prev) => ({
				...prev,
				[field]: text,
			}));
		},
		[]
	);

	const handleDateChange = useCallback(
		(event: any, selectedDate?: Date): void => {
			setShowDatePicker(false);
			if (selectedDate) {
				setNewFamilyMember((prev) => ({ ...prev, dob: selectedDate }));
			}
		},
		[]
	);

	const handleAddUser = useCallback(async (): Promise<void> => {
		if (!validateForm()) return;

		try {
			const { userId } = userDetails;
			const formattedData = {
				...newFamilyMember,
				dob: newFamilyMember.dob.toISOString(),
				height: parseFloat(newFamilyMember.height),
			};

			await api.post(`/api/family/${userId}/add`, formattedData);
			Alert.alert("Success", "Family member added successfully!");
			setNewFamilyMember({
				name: "",
				username: "",
				relationship: "",
				gender: "",
				height: "",
				dob: new Date(),
			});
		} catch (error: any) {
			Alert.alert(
				"Error",
				error.response?.data?.error || "Failed to add family member"
			);
		}
	}, [newFamilyMember, userDetails, validateForm]);

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: theme.background }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<TouchableOpacity
					onPress={() => router.navigate("/(tabs)/settings")}
					style={styles.backButton}
				>
					<Text style={[styles.backButtonText, { color: theme.secondary }]}>
						← Back
					</Text>
				</TouchableOpacity>

				<Animated.View
					style={[
						styles.formContainer,
						{
							backgroundColor: theme.surface,
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim }],
						},
					]}
				>
					<Text style={[styles.title, { color: theme.primary }]}>
						Add Family Member
					</Text>

					<InputField
						placeholder="Family Member Name"
						value={newFamilyMember.name}
						onChangeText={handleInputChange("name")}
						error={errors.name}
						theme={theme}
					/>

					<InputField
						placeholder="Username"
						value={newFamilyMember.username}
						onChangeText={handleInputChange("username")}
						error={errors.username}
						theme={theme}
					/>

					<InputField
						placeholder="Relationship"
						value={newFamilyMember.relationship}
						onChangeText={handleInputChange("relationship")}
						error={errors.relationship}
						theme={theme}
					/>

					{/* <InputField
						placeholder="Gender"
						value={newFamilyMember.gender}
						onChangeText={handleInputChange("gender")}
						error={errors.gender}
						theme={theme}
					/> */}
					<Picker
						selectedValue={newFamilyMember.gender}
						onValueChange={handleInputChange("gender")}
						style={[
							// styles.input,
							{
								backgroundColor: theme.inputBackground,
								height: Platform.OS === "ios" ? 220 : 55,
								marginBottom: Platform.OS === "ios" ? 15 : 15,
								borderRadius: 8,
								borderWidth: 1,
								borderColor:
									colorScheme === "dark" ? darkTheme.border : lightTheme.border,
							},
						]}
					>
						<Picker.Item label="Select Gender" value="" />
						<Picker.Item label="Male" value="Male" />
						<Picker.Item label="Female" value="Female" />
						<Picker.Item label="Other" value="Other" />
					</Picker>

					<InputField
						placeholder="Height (in cm)"
						value={newFamilyMember.height}
						onChangeText={handleInputChange("height")}
						error={errors.height}
						keyboardType="numeric"
						theme={theme}
					/>

					<TouchableOpacity
						style={[
							styles.dateButton,
							{
								backgroundColor: theme.inputBackground,
								borderColor: theme.border,
							},
						]}
						onPress={() => setShowDatePicker(true)}
					>
						<Text style={[styles.dateButtonText, { color: theme.text }]}>
							Date of Birth: {newFamilyMember.dob.toLocaleDateString()}
						</Text>
					</TouchableOpacity>

					{showDatePicker && (
						<DateTimePicker
							value={newFamilyMember.dob}
							mode="date"
							display="inline"
							style={{
								alignSelf: "center",
							}}
							minimumDate={new Date(1900, 0, 1)}
							maximumDate={new Date()}
							onChange={handleDateChange}
							themeVariant={colorScheme as "light" | "dark" | undefined}
						/>
					)}

					<TouchableOpacity
						style={[
							styles.submitButton,
							{ backgroundColor: theme.buttonBackground },
						]}
						onPress={handleAddUser}
						activeOpacity={0.8}
					>
						<Text
							style={[styles.submitButtonText, { color: theme.buttonText }]}
						>
							Add Family Member
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContainer: {
		flexGrow: 1,
		padding: 20,
	},
	backButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	backButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	formContainer: {
		borderRadius: 15,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
		marginBottom: 120,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	inputContainer: {
		marginBottom: 15,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 15,
		fontSize: 16,
	},
	errorText: {
		fontSize: 12,
		marginTop: 5,
		marginLeft: 5,
	},
	dateButton: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 15,
		marginBottom: 15,
	},
	dateButtonText: {
		fontSize: 16,
	},
	submitButton: {
		borderRadius: 8,
		padding: 15,
		alignItems: "center",
		marginTop: 10,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});

export default memo(AddUser);
