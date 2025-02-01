import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	Animated,
	useColorScheme,
	Alert,
	Modal,
	Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { BlurView } from "expo-blur";

// Enhanced design tokens
const DESIGN = {
	colors: {
		primary: "#406F62",
		secondary: "#304C37",
		background: {
			light: "#F5F7FA",
			dark: "#151719",
		},
		text: {
			light: {
				primary: "#1A1D1F",
				secondary: "#4A5568",
				tertiary: "#718096",
			},
			dark: {
				primary: "#F7FAFC",
				secondary: "#E2E8F0",
				tertiary: "#A0AEC0",
			},
		},
		card: {
			light: {
				background: "#FFFFFF",
				border: "#E2E8F0",
				shadow: "rgba(0, 0, 0, 0.1)",
			},
			dark: {
				background: "#1E2124",
				border: "#2D3748",
				shadow: "rgba(0, 0, 0, 0.3)",
			},
		},
		accent: {
			light: "#406F62",
			dark: "#4A9182",
		},
		stats: {
			light: {
				background: "rgba(64, 111, 98, 0.08)",
				border: "rgba(64, 111, 98, 0.12)",
			},
			dark: {
				background: "rgba(74, 145, 130, 0.12)",
				border: "rgba(74, 145, 130, 0.16)",
			},
		},
	},
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
	},
	borderRadius: {
		sm: 8,
		md: 12,
		lg: 16,
		xl: 24,
	},
	typography: {
		title: 24,
		subtitle: 18,
		body: 14,
		caption: 12,
	},
	animation: {
		duration: 300,
		scale: 0.98,
	},
};

// Types remain the same
interface User {
	id: string;
	_id?: string;
	name: string;
	username: string;
	relationship?: string;
	gender?: string;
	height?: number;
	latestweight?: number;
	dob?: string;
	age?: number;
}

interface UserCardProps {
	user: User;
	index: number;
	onDelete: (userId: string) => Promise<void>;
}

const UserCard: React.FC<UserCardProps> = ({ user, index, onDelete }) => {
	const [showMenu, setShowMenu] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const scheme = useColorScheme();
	const isDark = scheme === "dark";
	const colors = isDark ? DESIGN.colors.text.dark : DESIGN.colors.text.light;
	const cardColors = isDark
		? DESIGN.colors.card.dark
		: DESIGN.colors.card.light;
	const statsColors = isDark
		? DESIGN.colors.stats.dark
		: DESIGN.colors.stats.light;
	const userId = user.id || user._id;
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const translateYAnim = useRef(new Animated.Value(50)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const handleDeleteConfirm = () => {
		if (!userId) {
			Alert.alert("Error", "Invalid user ID");
			return;
		}
		setShowDeleteConfirm(true);
		setShowMenu(false);
	};
	const handleEditUser = () => {
		if (!userId) {
			Alert.alert("Error", "Invalid user ID");
			return;
		}
		setShowMenu(false);
		router.navigate(`/editUsers/${userId}`);
	};

	useEffect(() => {
		Animated.parallel([
			Animated.timing(translateYAnim, {
				toValue: 0,
				duration: DESIGN.animation.duration,
				delay: index * 100,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 1,
				duration: DESIGN.animation.duration,
				delay: index * 100,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const handlePressIn = () => {
		Animated.spring(scaleAnim, {
			toValue: 0.98,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	};
	const handleDeleteUser = async () => {
		try {
			if (!userId) {
				throw new Error("Invalid user ID");
			}
			if (onDelete) {
				await onDelete(user.id);
				setShowDeleteConfirm(false);
				setShowMenu(false);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to delete user");
		}
	};
	const renderMetric = (value: number | undefined, unit: string) => {
		if (!value) return null;
		return (
			<View style={styles.metricContainer}>
				<Text style={[styles.detailText, { color: colors.primary }]}>
					<Text style={styles.labelText}>{value}</Text>
					<Text style={[styles.unitText, { color: colors.tertiary }]}>
						{" "}
						{unit}
					</Text>
				</Text>
			</View>
		);
	};

	return (
		<Animated.View
			style={[
				styles.cardContainer,
				{
					transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
					opacity: opacityAnim,
					backgroundColor: cardColors.background,
					borderColor: cardColors.border,
				},
			]}
		>
			<TouchableOpacity
				style={styles.cardContent}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				activeOpacity={1}
			>
				<View style={styles.header}>
					<Image
						source={{
							uri: `https://ui-avatars.com/api/?name=${user.name}&background=406F62&color=FBFCFA`,
						}}
						style={styles.avatar}
					/>
					<View style={styles.headerText}>
						<Text style={[styles.name, { color: colors.primary }]}>
							{user.name}
						</Text>
						<Text style={[styles.username, { color: colors.secondary }]}>
							@{user.username}
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => setShowMenu(!showMenu)}
						style={styles.menuButton}
					>
						<Entypo
							name="dots-three-vertical"
							size={20}
							color={colors.primary}
						/>
					</TouchableOpacity>
					<View>
						{showMenu && (
							<View style={[styles.menu, { backgroundColor: colors.tertiary }]}>
								<TouchableOpacity
									style={styles.menuItem}
									onPress={handleEditUser}
								>
									{/* <Link
										href={{
											pathname: `/editUsers/[userId]`,
											params: { userId: user.id },
										}}
									> */}
									<Text style={[styles.menuText, { color: colors.primary }]}>
										Edit User
									</Text>
									{/* </Link> */}
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.menuItem}
									onPress={handleDeleteConfirm}
								>
									<Text style={[styles.menuText, { color: "#FF4444" }]}>
										Delete User
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>

				<View
					style={[
						styles.detailsGrid,
						{
							backgroundColor: statsColors.background,
							borderColor: statsColors.border,
						},
					]}
				>
					<View style={styles.detailColumn}>
						{user.relationship && (
							<Text style={[styles.detailText, { color: colors.primary }]}>
								{user.relationship}
							</Text>
						)}
						{renderMetric(user.age, "years")}
					</View>
					<View
						style={[styles.separator, { backgroundColor: statsColors.border }]}
					/>
					<View style={styles.detailColumn}>
						{renderMetric(user.height, "cm")}
						{user.latestweight &&
							renderMetric(parseFloat(user.latestweight.toString()), "kg")}
					</View>
					<View
						style={[styles.separator, { backgroundColor: statsColors.border }]}
					/>
					<View style={styles.detailColumn}>
						{user.gender && (
							<Text style={[styles.detailText, { color: colors.primary }]}>
								{user.gender}
							</Text>
						)}
					</View>
				</View>

				<Link
					href={{
						pathname: `/weightcharts/[userId]`,
						params: { userId: userId ?? "" },
					}}
					style={[
						styles.link,
						{
							backgroundColor: isDark
								? DESIGN.colors.accent.dark
								: DESIGN.colors.accent.light,
						},
					]}
				>
					<View style={styles.linkContainer}>
						<Text style={styles.linkText}>View Chart →</Text>
					</View>
				</Link>
			</TouchableOpacity>
			<Modal visible={showDeleteConfirm} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View
						style={[
							styles.modalContent,
							{ backgroundColor: cardColors.background },
						]}
					>
						<Text style={[styles.modalTitle, { color: colors.primary }]}>
							Delete User
						</Text>
						<Text style={[styles.modalText, { color: colors.secondary }]}>
							Are you sure you want to delete {user.name}?
						</Text>
						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => setShowDeleteConfirm(false)}
							>
								<Text
									style={[styles.modalButtonText, { color: colors.primary }]}
								>
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalButton, styles.deleteButton]}
								onPress={handleDeleteUser}
							>
								<Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
									Delete
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		height: Platform.OS === "ios" ? 200 : 250,
		marginBottom: DESIGN.spacing.lg,
		borderRadius: DESIGN.borderRadius.xl,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	metricContainer: {
		alignItems: "center",
		// marginBottom: DESIGN.spacing.sm,
	},
	cardContent: {
		flex: 1,
		padding: DESIGN.spacing.lg,
		justifyContent: "space-between",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: DESIGN.spacing.md,
	},
	headerText: {
		flex: 1,
		marginLeft: DESIGN.spacing.md,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: DESIGN.borderRadius.lg,
	},
	name: {
		fontSize: DESIGN.typography.subtitle,
		fontWeight: "700",
		marginBottom: 4,
	},
	username: {
		fontSize: DESIGN.typography.body,
		fontWeight: "500",
	},
	detailsGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: DESIGN.spacing.md,
		paddingHorizontal: DESIGN.spacing.md,
		borderRadius: DESIGN.borderRadius.md,
		borderWidth: 1,
		marginVertical: DESIGN.spacing.sm,
	},
	fullScreenBlur: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	detailColumn: {
		flex: 1,
		alignItems: "center",
	},
	separator: {
		width: 1,
		height: "100%",
	},
	detailText: {
		fontSize: DESIGN.typography.body,
		marginBottom: 4,
	},
	labelText: {
		fontWeight: "600",
	},
	unitText: {
		fontSize: DESIGN.typography.caption,
	},
	link: {
		alignSelf: "flex-start",
		paddingVertical: DESIGN.spacing.sm,
		paddingHorizontal: DESIGN.spacing.md,
		borderRadius: DESIGN.borderRadius.md,
	},
	linkContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	linkText: {
		fontSize: DESIGN.typography.body,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	menuButton: {
		padding: DESIGN.spacing.sm,
	},
	menu: {
		position: "absolute",
		top: -10,
		right: 25,
		borderRadius: DESIGN.borderRadius.sm,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.1)",
	},
	menuItem: {
		padding: DESIGN.spacing.sm,
		// backgroundColor: "rgba(15, 9, 9,)", // Adjust opacity for better visibility

		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
		// backgroundColor: "black",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	menuText: {
		fontSize: DESIGN.typography.body,
		fontWeight: "500",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "80%",
		padding: DESIGN.spacing.xl,
		borderRadius: DESIGN.borderRadius.lg,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: DESIGN.typography.subtitle,
		fontWeight: "600",
		marginBottom: DESIGN.spacing.md,
	},
	modalText: {
		fontSize: DESIGN.typography.body,
		textAlign: "center",
		marginBottom: DESIGN.spacing.lg,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	modalButton: {
		paddingVertical: DESIGN.spacing.sm,
		paddingHorizontal: DESIGN.spacing.lg,
		borderRadius: DESIGN.borderRadius.sm,
		minWidth: 100,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.1)",
	},
	deleteButton: {
		backgroundColor: "#FF4444",
	},
	modalButtonText: {
		fontSize: DESIGN.typography.body,
		fontWeight: "600",
	},
});

export default UserCard;
