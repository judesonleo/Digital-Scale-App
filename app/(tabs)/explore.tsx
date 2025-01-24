import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Image,
} from "react-native";
import { Link } from "expo-router"; // Import Link from expo-router
import api from "../../api";
import { getAuthToken } from "../../utils/authStorage";

interface User {
	id: string; // Unique identifier for the user
	name: string;
	username: string;
}

const UsersListScreen = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [mainUser, setMainUser] = useState<User | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const authInfo = await getAuthToken();
				console.log("Auth info:", authInfo);

				if (!authInfo?.userId) {
					console.log("No userId in auth info.");
					return;
				}

				// Fetch main user details
				const mainUserResponse = await api.get(`/api/users/${authInfo.userId}`);
				console.log("Main user response:", mainUserResponse.data);

				setMainUser({
					id: mainUserResponse.data._id, // Using `_id` as the main user's `id`
					name: mainUserResponse.data.name,
					username: mainUserResponse.data.username,
				});

				// Fetch family members
				const familyResponse = await api.get(`/api/family/${authInfo.userId}`);
				console.log("Family response:", familyResponse.data);

				const familyUsers = familyResponse.data.map((family: any) => ({
					id: family.userId._id, // Using `id` from `userId`
					name: family.userId.name,
					username: family.username,
				}));

				console.log("Processed family users:", familyUsers);
				setUsers(familyUsers);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchUsers();
	}, []);

	const renderUserCard = ({ item }: { item: User }) => {
		console.log("Rendering user card for:", item);

		return (
			<TouchableOpacity style={styles.card}>
				<Image
					source={{ uri: `https://ui-avatars.com/api/?name=${item.name}` }}
					style={styles.avatar}
				/>
				<View style={styles.userInfo}>
					<Text style={styles.userName}>{item.name}</Text>
					<Text style={styles.username}>@{item.username}</Text>
				</View>
				{/* Use Link to navigate to the dynamic route */}
				<Link
					href={{
						pathname: `/weightcharts/[userId]`,
						params: { userId: item.id }, // Pass the dynamic user ID
					}}
				>
					<Text style={styles.linkText}>View Weight Chart</Text>
				</Link>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Family Members</Text>
			<FlatList
				data={mainUser ? [mainUser, ...users] : users}
				renderItem={renderUserCard}
				keyExtractor={(item) => item.id} // Ensure `id` is unique for each user
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 40,
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
		padding: 16,
		marginBottom: 12,
		borderRadius: 8,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	avatar: {
		width: 50,
		height: 50,
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
		marginTop: 10,
	},
});

export default UsersListScreen;
