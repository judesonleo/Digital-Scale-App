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
	SafeAreaView,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getAuthToken } from "@/utils/authStorage";
import api from "@/api";
import { router } from "expo-router";
import { Picker, PickerIOS } from "@react-native-picker/picker";
import { lightMode, darkMode } from "@/styles/homeconstant";
import { useTheme } from "@/context/ThemeContext";

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
	isDark: boolean;
}

// Using app's consistent theme colors

// Memoized Input Field Component
const InputField = memo<InputFieldProps>(
	({
		placeholder,
		value,
		onChangeText,
		error,
		secureTextEntry,
		keyboardType,
		isDark,
	}) => {
		const colors = isDark ? darkMode : lightMode;

		return (
			<View style={styles.inputContainer}>
				<TextInput
					style={[
						styles.input,
						{
							backgroundColor: colors.surface,
							borderColor: error ? colors.danger : colors.border,
							color: colors.text.primary,
						},
					]}
					placeholder={placeholder}
					placeholderTextColor={colors.text.secondary}
					value={value}
					onChangeText={onChangeText}
					secureTextEntry={secureTextEntry}
					keyboardType={keyboardType}
					autoCapitalize="none"
					autoCorrect={false}
				/>
				{error && (
					<Text style={[styles.errorText, { color: colors.danger }]}>
						{error}
					</Text>
				)}
			</View>
		);
	}
);

const AddUser: React.FC = () => {
	const colorScheme = useColorScheme();
	const { isDark } = useTheme();
	const colors = isDark ? darkMode : lightMode;

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
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<KeyboardAvoidingView
				style={[styles.container, { backgroundColor: colors.background }]}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContainer}
					keyboardShouldPersistTaps="handled"
				>
					<Animated.View
						style={[
							styles.formContainer,
							{
								backgroundColor: colors.surface,
								opacity: fadeAnim,
								transform: [{ translateY: slideAnim }],
							},
						]}
					>
						<Text style={[styles.title, { color: colors.text.primary }]}>
							Add Family Member
						</Text>

						<InputField
							placeholder="Family Member Name"
							value={newFamilyMember.name}
							onChangeText={handleInputChange("name")}
							error={errors.name}
							isDark={isDark}
						/>

						<InputField
							placeholder="Username"
							value={newFamilyMember.username}
							onChangeText={handleInputChange("username")}
							error={errors.username}
							isDark={isDark}
						/>

						<InputField
							placeholder="Relationship"
							value={newFamilyMember.relationship}
							onChangeText={handleInputChange("relationship")}
							error={errors.relationship}
							isDark={isDark}
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
								styles.input,
								{
									backgroundColor: colors.surface,
									height: Platform.OS === "ios" ? 220 : 55,
									marginBottom: Platform.OS === "ios" ? 15 : 15,
									borderRadius: 8,
									borderWidth: 1,
									borderColor: colors.border,
									color: colors.text.primary,
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
							isDark={isDark}
						/>

						<TouchableOpacity
							style={[
								styles.dateButton,
								{
									backgroundColor: colors.surface,
									borderColor: colors.border,
								},
							]}
							onPress={() => setShowDatePicker(true)}
						>
							<Text
								style={[styles.dateButtonText, { color: colors.text.primary }]}
							>
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
							style={[styles.submitButton, { backgroundColor: colors.primary }]}
							onPress={handleAddUser}
							activeOpacity={0.8}
						>
							<Text style={[styles.submitButtonText, { color: colors.white }]}>
								Add Family Member
							</Text>
						</TouchableOpacity>
					</Animated.View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 10,
	},
	scrollContainer: {
		flexGrow: 1,
		padding: 20,
		paddingBottom: 100,
	},

	formContainer: {
		borderRadius: 16,
		padding: 20,
		marginHorizontal: 4,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
		}),
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		marginBottom: 24,
		textAlign: "center",
	},
	inputContainer: {
		marginBottom: 16,
	},
	input: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		fontWeight: "500",
	},
	errorText: {
		fontSize: 12,
		marginTop: 5,
		marginLeft: 5,
		fontWeight: "500",
	},
	dateButton: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	dateButtonText: {
		fontSize: 16,
		fontWeight: "500",
	},
	submitButton: {
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		marginTop: 16,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.2,
				shadowRadius: 4,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: "700",
	},
});

export default memo(AddUser);
