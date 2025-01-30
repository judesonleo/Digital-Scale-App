import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Image,
	useColorScheme,
	Alert,
	RefreshControl,
} from "react-native";
import { Link } from "expo-router";
import api from "../../api";
import { getAuthToken } from "../../utils/authStorage";
import { lightMode } from "@/styles/homeconstant";
import UserCard from "@/components/UserCard";
import axios from "axios";

interface User {
	id: string;
	name: string;
	username: string;
	relationship?: string;
	gender?: string;
	height?: number;
	latestweight?: number;
	dob?: string;
	age?: number;
}
const theme = {
	colors: {
		primary: "#6854D9",
		backgroundLight: "#F5F7FA",
		backgroundDark: "#0A0A0A",
		cardLight: "#FFFFFF",
		cardDark: "#1E2732",
		textPrimaryLight: "#1A1A1A",
		textPrimaryDark: "#FFFFFF",
		textSecondary: "#666666",
		buttonText: "#FFFFFF",
	},

	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		xxl: 48,
	},

	borderRadius: {
		sm: 8,
		md: 16,
		circle: 9999,
	},

	typography: {
		title: {
			fontSize: 28,
			fontWeight: "700",
		},
		cardTitle: {
			fontSize: 17,
			fontWeight: "600",
		},
		body: {
			fontSize: 14,
			fontWeight: "normal",
		},
		button: {
			fontSize: 14,
			fontWeight: "600",
		},
	},

	shadows: {
		card: {
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 8,
			elevation: 3,
		},
	},
};

const UsersListScreen = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [mainUser, setMainUser] = useState<User | null>(null);
	const scheme = useColorScheme();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleDeleteUser = async (userId: string) => {
		try {
			await api.delete(`/api/users/${userId}`);

			setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

			Alert.alert("Success", "User deleted successfully");
		} catch (error) {
			console.error("Error deleting user:", error);
			Alert.alert("Error", "Failed to delete user");
		}
	};
	const fetchUsers = async () => {
		try {
			const authInfo = await getAuthToken();
			console.log("Auth info:", authInfo);

			if (!authInfo?.userId) {
				console.log("No userId in auth info.");
				return;
			}

			const mainUserResponse = await api.get(`/api/users/${authInfo.userId}`);
			console.log("Main user response:", mainUserResponse.data);

			setMainUser({
				id: mainUserResponse.data._id,
				name: mainUserResponse.data.name,
				username: mainUserResponse.data.username,
				height: mainUserResponse.data.height,
				gender: mainUserResponse.data.gender,
				latestweight: parseFloat(mainUserResponse.data.latestWeight),
				dob: mainUserResponse.data.dob,
				age: mainUserResponse.data.age,
			});

			// Fetch family members
			const familyResponse = await api.get(`/api/family/${authInfo.userId}`);

			console.log("Family response:", familyResponse.data);

			const familyUsers = familyResponse.data.map((family: any) => ({
				id: family.userId,
				name: family.name,
				username: family.username,
				relationship: family.relationship,
				height: family.height,
				age: family.age,
				dob: family.dob,
				latestweight: parseFloat(family.latestWeight),
				gender: family.gender,
			}));

			console.log("Processed family users:", familyUsers);
			setUsers(familyUsers);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				console.log("404 - No family members or user found, skipping error");
				return;
			}
			console.error("Error fetching users:", error);
		}
	};
	useEffect(() => {
		fetchUsers();
	}, []);
	const handleRefresh = async () => {
		setIsRefreshing(true);
		await fetchUsers();
		setIsRefreshing(false);
	};

	const renderUserCard = ({ item, index }: { item: User; index: number }) => (
		<UserCard user={item} index={index} onDelete={handleDeleteUser} />
	);

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: scheme === "dark" ? "#000" : "#fff" },
			]}
		>
			<Text
				style={[styles.title, { color: scheme === "dark" ? "#fff" : "#000" }]}
			>
				Family Members
			</Text>
			<FlatList
				data={mainUser ? [mainUser, ...users] : users}
				renderItem={renderUserCard}
				keyExtractor={(item) => item.username}
				refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 50,
		paddingHorizontal: 26,
		marginBottom: 110,
		backgroundColor: "#f4f4f4",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	card: {
		flexDirection: "row",
		backgroundColor: "white",
		opacity: 90,

		height: 250,
		width: "100%",
		padding: 20,
		marginBottom: 12,
		borderRadius: 30,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		boxShadow: "0px 2px 4px rgba(45, 147, 120, 0.1)",
		// elevation: 3,
	},
	avatar: {
		width: 50,
		height: 50,
		// textAlign: "center",
		justifyContent: "flex-start",
		alignItems: "flex-start",
		borderRadius: 25,
		marginRight: 16,
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 18,
		fontWeight: "bold",
	},
	username: {
		color: "gray",
		marginTop: 4,
	},
	linkText: {
		color: "#6854D9", // Style for the link
		fontWeight: "bold",
		// marginTop: 90,
		// marginLeft: 910,
	},
});

export default UsersListScreen;
