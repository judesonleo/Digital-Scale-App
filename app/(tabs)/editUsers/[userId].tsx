import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "@/api";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

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
	const [isFamilymember, setIsFamilymember] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await api.get(`/api/users/${userId}`);
				setUser(response.data);
				setName(response.data.name);
				setGender(response.data.gender);
				setDob(new Date(response.data.dob).toISOString().split("T")[0]);
				setHeight(response.data.height?.toString());
				setUsername(response.data.username);
				setRelationship(response.data.relationship);
				setIsFamilymember(response.data.isFamilymember);
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
			// const response = await api.put(`/api/users/${userId}`, {
			// 	name,
			// 	gender,
			// 	dob,
			// 	height: Number(height),
			// });
			console.log(
				name,
				gender,
				dob,
				height,
				username,
				relationship
				// isFamilymember
			);
			Alert.alert("Success", "User updated successfully");
		} catch (error) {
			console.error("Error updating user:", error);
			Alert.alert("Error", "Failed to update user");
		}
	};

	if (loading) {
		return <ActivityIndicator size="large" color="#0000ff" />;
	}

	if (!user) {
		return <Text>User not found</Text>;
	}

	return (
		<View style={{ padding: 20 }}>
			{/* <Text>User ID: {userId}</Text> */}

			<Text>Name:</Text>
			<TextInput value={name} onChangeText={setName} style={styles.input} />

			<Picker
				selectedValue={gender}
				onValueChange={(itemValue: string, itemIndex: number) =>
					setGender(itemValue)
				}
				// style={[
				// 	// styles.input,
				// 	{
				// 		backgroundColor: theme.inputBackground,
				// 		height: Platform.OS === "ios" ? 220 : 55,
				// 		marginBottom: Platform.OS === "ios" ? 15 : 15,
				// 		borderRadius: 8,
				// 		borderWidth: 1,
				// 		borderColor:
				// 			colorScheme === "dark" ? darkTheme.border : lightTheme.border,
				// 	},
				// ]}
			>
				<Picker.Item label="Select Gender" value="" />
				<Picker.Item label="Male" value="Male" />
				<Picker.Item label="Female" value="Female" />
				<Picker.Item label="Other" value="Other" />
			</Picker>
			<TouchableOpacity onPress={() => setShowDatePicker(true)}>
				<Text>DOB (YYYY-MM-DD):</Text>
			</TouchableOpacity>
			{showDatePicker && (
				<DateTimePicker
					value={new Date(dob)}
					mode="date"
					display="inline"
					style={{
						alignSelf: "center",
					}}
					minimumDate={new Date(1900, 0, 1)}
					maximumDate={new Date()}
					onChange={(event: any, selectedDate: Date | undefined) => {
						const currentDate = selectedDate || new Date(dob);
						setShowDatePicker(false);
						setDob(currentDate.toISOString().split("T")[0]);
					}}
					// themeVariant={colorScheme as "light" | "dark" | undefined}
				/>
			)}
			<Text>Height (cm):</Text>
			<TextInput
				value={height}
				onChangeText={setHeight}
				keyboardType="numeric"
				style={styles.input}
			/>
			<Text>Relationship</Text>
			<TextInput
				value={relationship}
				onChangeText={setRelationship}
				keyboardType="default"
				style={styles.input}
			/>

			<Button title="Update User" onPress={handleUpdate} />
		</View>
	);
};

const styles = {
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
	},
};

export default EditUser;
