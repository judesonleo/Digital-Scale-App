import {
	Text,
	View,
	Alert,
	TextInput,
	Button,
	TouchableOpacity,
} from "react-native";
import styles from "@/styles/styles";
import React, { useEffect, useState } from "react";
import { getAuthToken } from "@/utils/authStorage";
import api from "@/api";
import { routeToScreen } from "expo-router/build/useScreens";
import { router } from "expo-router";

const adduser = () => {
	const [userDetails, setUserDetails] = useState({
		userId: "",
	});
	const [newFamilyMember, setNewFamilyMember] = useState({
		name: "",
		username: "",
		relationship: "",
	});
	useEffect(() => {
		const fetchAuthDetails = async () => {
			const authData = await getAuthToken();
			if (authData) {
				setUserDetails({
					userId: authData.userId || "",
				});
			}
		};

		fetchAuthDetails();
	}, []);
	const handleAddUser = async () => {
		const { userId } = userDetails;
		const { name, username, relationship } = newFamilyMember;

		if (!name || !username || !relationship) {
			Alert.alert("Error", "Please fill all the fields.");
			return;
		}

		try {
			const response = await api.post(`/api/family/${userId}/add`, {
				name,
				username,
				relationship,
			});

			Alert.alert("Success", response.data.message);
			setNewFamilyMember({ name: "", username: "", relationship: "" });
		} catch (error) {
			Alert.alert("Error", "There was an issue adding the family member.");
			console.error(error);
		}
	};
	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() => router.navigate("/(tabs)/settings")}
				style={styles.backButton}
			>
				<Text style={styles.backButtonText}>← Back</Text>
			</TouchableOpacity>
			<View style={styles.form}>
				<TextInput
					style={styles.input}
					placeholder="Family Member Name"
					value={newFamilyMember.name}
					onChangeText={(text) =>
						setNewFamilyMember({ ...newFamilyMember, name: text })
					}
				/>
				<TextInput
					style={styles.input}
					placeholder="Username"
					value={newFamilyMember.username}
					onChangeText={(text) =>
						setNewFamilyMember({ ...newFamilyMember, username: text })
					}
				/>
				<TextInput
					style={styles.input}
					placeholder="Relationship"
					value={newFamilyMember.relationship}
					onChangeText={(text) =>
						setNewFamilyMember({ ...newFamilyMember, relationship: text })
					}
				/>
				<Button title="Save User" onPress={handleAddUser} />
			</View>
		</View>
	);
};

export default adduser;
