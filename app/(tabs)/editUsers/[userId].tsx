import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Platform,
	StyleSheet,
	useColorScheme,
	ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/api";
import { getAuthToken } from "@/utils/authStorage";
import { useThemeColor } from "@/hooks/useThemeColor";
import { theme } from "@/styles/themes";
import { darkTheme, lightTheme } from "@/styles/theme";

const EditUser = () => {
	const { userId } = useLocalSearchParams();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [name, setName] = useState("");
	const [gender, setGender] = useState("");
	const [dob, setDob] = useState("");
	const [height, setHeight] = useState("");
	const [username, setUsername] = useState("");
	const [relationship, setRelationship] = useState("");
	const [isFamilyMember, setIsFamilyMember] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const colorScheme = useColorScheme();
	const backgroundColor = useThemeColor({}, "background");
	// const backgroundColor = useThemeColor({}, "background");
	const textColor = useThemeColor({}, "text");
	const borderColor = useThemeColor({}, "border");
	const primaryColor = useThemeColor({}, "primary");
	const cardColor = useThemeColor({}, "card");
	const placeholderColor = useThemeColor({}, "placeholderText");

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const authData = await getAuthToken();
				const parentUserId = authData?.userId;
				const response = await api.get(`/api/users/${userId}`, {
					params: { parentUserId },
				});
				setUser(response.data);
				setName(response.data.name);
				setGender(response.data.gender);
				setDob(new Date(response.data.dob).toISOString().split("T")[0]);
				setHeight(response.data.height?.toString());
				setUsername(response.data.username);
				setRelationship(response.data.relationship);
				setIsFamilyMember(response.data.isFamilyMember);
			} catch (error) {
				console.error("Error fetching user:", error);
				Alert.alert("Error", "Failed to load user data");
			} finally {
				setLoading(false);
			}
		};

		if (userId) fetchUser();
	}, [userId]);

	const handleUpdate = async () => {
		try {
			const authData = await getAuthToken();
			const parentUserId = authData?.userId;

			const userData = {
				name,
				gender,
				dob,
				height: Number(height),
				parentUserId,
				...(isFamilyMember && { relationship }),
			};

			await api.put(`/api/users/${userId}`, userData);
			Alert.alert("Success", "User updated successfully");
		} catch (error) {
			console.error("Error updating user:", error);
			Alert.alert("Error", "Failed to update user");
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, { backgroundColor }]}>
				<ActivityIndicator size="large" color={primaryColor} />
			</View>
		);
	}

	if (!user) {
		return (
			<View style={[styles.container, { backgroundColor }]}>
				<Text style={[styles.errorText, { color: textColor }]}>
					User not found
				</Text>
			</View>
		);
	}

	return (
		<ScrollView style={[styles.container, { backgroundColor }]}>
			<Text
				style={[
					styles.label,
					{
						color: textColor,
						fontSize: 24,
						fontWeight: "bold",
						marginBottom: 16,
					},
				]}
			>
				Edit {name}
			</Text>
			<View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
				<View style={styles.inputGroup}>
					<Text style={[styles.label, { color: textColor }]}>Name</Text>
					<TextInput
						value={name}
						onChangeText={setName}
						style={[styles.input, { color: textColor, borderColor }]}
						placeholderTextColor={placeholderColor}
					/>
				</View>
				<View style={styles.inputGroup}>
					<Text style={[styles.label, { color: textColor }]}>User Name</Text>
					<TextInput
						value={username}
						onChangeText={setUsername}
						style={[styles.input, { color: textColor, borderColor }]}
						placeholderTextColor={placeholderColor}
					/>
				</View>

				<View style={styles.inputGroup}>
					<Text style={[styles.label, { color: textColor }]}>Gender</Text>
					<View style={[styles.pickerContainer, { borderColor }]}>
						<Picker
							selectedValue={gender}
							onValueChange={setGender}
							style={[
								styles.picker,
								{
									backgroundColor:
										Platform.OS === "ios" ? "transparent" : cardColor,
									height: Platform.OS === "ios" ? 220 : 55,
									marginBottom: Platform.OS === "ios" ? 15 : 15,
									borderRadius: 8,
									// borderWidth: 1,
									borderColor:
										colorScheme === "dark"
											? darkTheme.colors.text.primary
											: lightTheme.colors.text.primary,
								},
							]}
							itemStyle={{ color: textColor }}
						>
							<Picker.Item label="Select Gender" value="" />
							<Picker.Item label="Male" value="Male" />
							<Picker.Item label="Female" value="Female" />
							<Picker.Item label="Other" value="Other" />
						</Picker>
					</View>
				</View>

				<View style={styles.inputGroup}>
					<Text style={[styles.label, { color: textColor }]}>
						Date of Birth
					</Text>
					<TouchableOpacity
						style={[styles.dateButton, { borderColor }]}
						onPress={() => setShowDatePicker(!showDatePicker)}
					>
						<Text style={[styles.dateButtonText, { color: textColor }]}>
							{dob || "Select Date"}
						</Text>
					</TouchableOpacity>
					{showDatePicker && (
						<DateTimePicker
							value={new Date(dob)}
							mode="date"
							display="inline"
							minimumDate={new Date(1900, 0, 1)}
							maximumDate={new Date()}
							onChange={(event, selectedDate) => {
								const currentDate = selectedDate || new Date(dob);
								setShowDatePicker(false);
								setDob(currentDate.toISOString().split("T")[0]);
							}}
						/>
					)}
				</View>

				<View style={styles.inputGroup}>
					<Text style={[styles.label, { color: textColor }]}>Height (cm)</Text>
					<TextInput
						value={height}
						onChangeText={setHeight}
						keyboardType="numeric"
						style={[styles.input, { color: textColor, borderColor }]}
						placeholderTextColor={placeholderColor}
					/>
				</View>

				{isFamilyMember && (
					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: textColor }]}>
							Relationship
						</Text>
						<TextInput
							value={relationship}
							onChangeText={setRelationship}
							style={[styles.input, { color: textColor, borderColor }]}
							placeholderTextColor={placeholderColor}
						/>
					</View>
				)}

				<TouchableOpacity
					style={[
						styles.updateButton,
						{
							backgroundColor:
								colorScheme === "dark"
									? lightTheme.colors.primary.light
									: lightTheme.colors.primary.dark,
						},
					]}
					onPress={handleUpdate}
				>
					<Text style={styles.updateButtonText}>Update User</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		paddingTop: 72,
		paddingBottom: 500,
	},
	card: {
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		marginBottom: 120,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	input: {
		height: 48,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 16,
	},
	pickerContainer: {
		borderWidth: 1,
		borderRadius: 8,
		overflow: "hidden",
	},
	picker: {
		height: 48,
		width: "100%",
	},
	dateButton: {
		height: 48,
		borderWidth: 1,
		borderRadius: 8,
		justifyContent: "center",
		paddingHorizontal: 12,
	},
	dateButtonText: {
		fontSize: 16,
	},
	updateButton: {
		height: 48,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 24,
	},
	updateButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	errorText: {
		fontSize: 16,
		textAlign: "center",
	},
});

export default EditUser;
