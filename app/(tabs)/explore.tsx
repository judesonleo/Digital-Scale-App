import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Image,
	useColorScheme,
} from "react-native";
import { Link } from "expo-router"; // Import Link from expo-router
import api from "../../api";
import { getAuthToken } from "../../utils/authStorage";
import { lightMode } from "@/styles/homeconstant";

interface User {
	id: string; // Unique identifier for the user
	name: string;
	username: string;
	relationship?: string; // Optional field for the user's relationship
	gender?: string;
	height?: number;
	latestweight?: string;
	dob?: string;
	age?: string;
}
const theme = {
	colors: {
		// Brand colors
		primary: "#6854D9",

		// Background colors
		backgroundLight: "#F5F7FA",
		backgroundDark: "#0A0A0A",
		cardLight: "#FFFFFF",
		cardDark: "#1E2732",

		// Text colors
		textPrimaryLight: "#1A1A1A",
		textPrimaryDark: "#FFFFFF",
		textSecondary: "#666666",

		// Button colors
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
					height: mainUserResponse.data.height,
					gender: mainUserResponse.data.gender,
					latestweight: mainUserResponse.data.latestWeight,
					dob: mainUserResponse.data.dob,
					age: mainUserResponse.data.age,
				});

				// Fetch family members
				const familyResponse = await api.get(`/api/family/${authInfo.userId}`);
				console.log("Family response:", familyResponse.data);

				const familyUsers = familyResponse.data.map((family: any) => ({
					id: family.userId, // Using `id` from `userId`
					name: family.name,
					username: family.username,
					relationship: family.relationship,
					height: family.height,
					age: family.age,
					dob: family.dob,
					latestweight: family.latestWeight,
					gender: family.gender,
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
		const isDark = scheme === "dark";

		return (
			<TouchableOpacity
				style={[
					styles.card,
					{
						backgroundColor:
							scheme === "dark" ? lightMode.darkGreen : lightMode.darkGreen,
					},
				]}
			>
				<Image
					source={{ uri: `https://ui-avatars.com/api/?name=${item.name}` }}
					style={styles.avatar}
				/>
				<View style={styles.userInfo}>
					<Text style={styles.userName}>@{item.username}</Text>
					<Text style={styles.userName}>{item.name}</Text>
					<Text style={styles.username}>{item.relationship}</Text>
					<Text style={styles.username}>{item.age}</Text>
					{/* <Text style={styles.username}>{item.dob}</Text> */}
					<Text style={styles.username}>{item.gender}</Text>
					<Text style={styles.username}>{item.height}</Text>
					<Text style={styles.username}>{item.latestweight}</Text>
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
				keyExtractor={(item) => item.username} // Ensure `id` is unique for each user
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
