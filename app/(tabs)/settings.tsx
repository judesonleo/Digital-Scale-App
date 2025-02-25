import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Image,
	Switch,
	TouchableOpacity,
	StyleSheet,
	Platform,
	Alert,
	TextInput,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
// import * as Notifications from "expo-notifications";
import { getAuthToken, removeAuthToken } from "../../utils/authStorage";
import {
	Lock,
	Bell,
	Moon,
	User,
	Mail,
	Shield,
	ChevronRight,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define types
type ThemeColors = {
	background: string;
	card: string;
	text: string;
	textSecondary: string;
	border: string;
	primary: string;
	danger: string;
	success: string;
};

interface UserDetails {
	username: string;
	name: string;
	email: string;
	notificationsEnabled: boolean;
	darkMode: boolean;
	userId?: string;
	profilePicture?: string;
	phoneNumber?: string;
	lastLogin?: string;
	twoFactorEnabled: boolean;
}

interface SettingsOptionProps {
	icon: React.ReactNode;
	title: string;
	value?: string | boolean;
	onPress?: () => void;
	isSwitch?: boolean;
	onToggle?: (value: boolean) => void;
	colors: ThemeColors;
}

// Settings Option Component
const SettingsOption: React.FC<SettingsOptionProps> = ({
	icon,
	title,
	value,
	onPress,
	isSwitch,
	onToggle,
	colors,
}) => {
	const styles = makeOptionStyles(colors);

	return (
		<TouchableOpacity
			style={styles.settingsOption}
			onPress={onPress}
			disabled={isSwitch}
		>
			<View style={styles.optionLeft}>
				{icon}
				<Text style={styles.optionTitle}>{title}</Text>
			</View>
			{isSwitch ? (
				<Switch
					value={value as boolean}
					onValueChange={onToggle}
					trackColor={{ false: colors.border, true: colors.textSecondary }}
					thumbColor={colors.card}
				/>
			) : (
				<View style={styles.optionRight}>
					{value && <Text style={styles.optionValue}>{value}</Text>}
					<ChevronRight size={20} color={colors.textSecondary} />
				</View>
			)}
		</TouchableOpacity>
	);
};

const Settings = () => {
	const scheme = useColorScheme();
	const [userDetails, setUserDetails] = useState<UserDetails>({
		username: "",
		name: "",
		email: "",
		notificationsEnabled: true,
		darkMode: scheme === "dark",
		userId: "",
		phoneNumber: "",
		lastLogin: "",
		twoFactorEnabled: false,
	});
	const [isLoading, setIsLoading] = useState(false);

	// Theme Colors
	const colors: ThemeColors = {
		background: useThemeColor({}, "background"),
		card: useThemeColor({}, "card"),
		text: useThemeColor({}, "text"),
		textSecondary: useThemeColor({}, "textSecondary"),
		border: useThemeColor({}, "border"),
		primary: useThemeColor({}, "primary"),
		danger: useThemeColor({}, "danger"),
		success: useThemeColor({}, "success"),
	};

	useEffect(() => {
		fetchUserDetails();
	}, []);

	const fetchUserDetails = async () => {
		setIsLoading(true);
		try {
			const authData = await getAuthToken();
			if (authData) {
				setUserDetails({
					...userDetails,
					username: authData.username || "N/A",
					name: authData.name || "N/A",
					email: authData.email || "user@example.com",
					userId: authData.userId ?? "",
					// phoneNumber: authData.phoneNumber || "",
					lastLogin: new Date().toLocaleDateString(),
				});
			}
		} catch (error) {
			Alert.alert("Error", "Failed to fetch user details");
			console.error("Error fetching user details:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangePassword = () => {
		Alert.alert(
			"Change Password",
			"Are you sure you want to change your password?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Continue",
					// onPress: () => router.push("/change-password"),
					style: "default",
				},
			]
		);
	};
	const handleEmailChange = () => {
		Alert.alert("Change Email", "Do you want to change your email?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Change",
				onPress: () => {
					// router.push("/change-email");
				},
				style: "default",
			},
		]);
	};
	const handleNotificationToggle = async (value: boolean) => {
		if (value) {
			// const { status } = await Notifications.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission Denied",
					"You need to grant permission to receive notifications."
				);
				return;
			}
		}
		toggleSetting("notificationsEnabled");
	};
	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Logout",
				onPress: async () => {
					await removeAuthToken();
					router.replace("../(auth)");
				},
				style: "destructive",
			},
		]);
	};

	const toggleSetting = (setting: keyof UserDetails) => {
		setUserDetails((prev) => ({
			...prev,
			[setting]: !prev[setting as keyof typeof prev],
		}));
	};

	const styles = makeStyles(colors);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			<View style={styles.content}>
				{/* Profile Card */}
				<View style={styles.profileCard}>
					<View style={styles.profileHeader}>
						<Image
							source={{
								uri:
									userDetails.profilePicture ||
									`https://ui-avatars.com/api/?name=${userDetails.name}&background=0D301C&color=FBFCFA`,
							}}
							style={styles.avatar}
						/>
						<View style={styles.profileInfo}>
							<Text style={styles.name}>{userDetails.name}</Text>
							<Text style={styles.username}>@{userDetails.username}</Text>
							<Text style={styles.lastLogin}>
								Last login: {userDetails.lastLogin}
							</Text>
						</View>
					</View>
					<TouchableOpacity
						style={styles.editProfileButton}
						onPress={() => router.push(`/editUsers/${userDetails.userId}`)}
					>
						<Text style={styles.buttonText}>Edit Profile</Text>
					</TouchableOpacity>
				</View>

				{/* Account Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account</Text>
					<SettingsOption
						icon={<Mail size={24} color={colors.primary} />}
						title="Email"
						value={userDetails.email}
						colors={colors}
						onPress={handleEmailChange}
					/>
					<SettingsOption
						icon={<Lock size={24} color={colors.primary} />}
						title="Change Password"
						onPress={handleChangePassword}
						colors={colors}
					/>
					<SettingsOption
						icon={<Shield size={24} color={colors.primary} />}
						title="Two-Factor Authentication"
						isSwitch
						value={userDetails.twoFactorEnabled}
						onToggle={() => toggleSetting("twoFactorEnabled")}
						colors={colors}
					/>
				</View>

				{/* Preferences Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Preferences</Text>
					<SettingsOption
						icon={<Bell size={24} color={colors.primary} />}
						title="Notifications"
						isSwitch
						value={userDetails.notificationsEnabled}
						onToggle={(value) => toggleSetting("notificationsEnabled")}
						colors={colors}
					/>
					<SettingsOption
						icon={<Moon size={24} color={colors.primary} />}
						title="Dark Mode"
						isSwitch
						value={userDetails.darkMode}
						onToggle={() => toggleSetting("darkMode")}
						colors={colors}
					/>
				</View>

				{/* Admin Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Admin</Text>
					<SettingsOption
						icon={<User size={24} color={colors.primary} />}
						title="Add User"
						onPress={() => router.push("/adduser")}
						colors={colors}
					/>
				</View>

				{/* Logout Button */}
				<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
					<Text style={styles.buttonText}>Logout</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

const makeStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
			// margin: 16,
			marginTop: 50,
			// marginBottom: 110,
		},
		content: {
			padding: 16,
			paddingBottom: 100,
		},
		profileCard: {
			backgroundColor: colors.card,
			borderRadius: 16,
			padding: 20,
			marginBottom: 20,
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
		profileHeader: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 16,
		},
		profileInfo: {
			flex: 1,
			marginLeft: 16,
		},
		avatar: {
			width: 80,
			height: 80,
			borderRadius: 40,
			borderWidth: 3,
			borderColor: colors.primary,
		},
		name: {
			fontSize: 22,
			fontWeight: "700",
			color: colors.text,
			marginBottom: 4,
		},
		username: {
			fontSize: 16,
			color: colors.textSecondary,
			marginBottom: 4,
		},
		lastLogin: {
			fontSize: 12,
			color: colors.textSecondary,
		},
		section: {
			backgroundColor: colors.card,
			borderRadius: 16,
			padding: 16,
			marginBottom: 16,
		},
		sectionTitle: {
			fontSize: 18,
			fontWeight: "600",
			color: colors.text,
			marginBottom: 16,
			paddingHorizontal: 4,
		},
		editProfileButton: {
			backgroundColor: colors.primary,
			padding: 14,
			borderRadius: 10,
			alignItems: "center",
		},
		logoutButton: {
			backgroundColor: colors.danger,
			padding: 16,
			borderRadius: 10,
			alignItems: "center",
			marginTop: 8,
			marginBottom: 24,
		},
		buttonText: {
			color: "#FFFFFF",
			fontSize: 16,
			fontWeight: "600",
		},
	});

const makeOptionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		settingsOption: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: 12,
			paddingHorizontal: 4,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		optionLeft: {
			flexDirection: "row",
			alignItems: "center",
			flex: 1,
		},
		optionTitle: {
			fontSize: 16,
			color: colors.text,
			marginLeft: 12,
		},
		optionRight: {
			flexDirection: "row",
			alignItems: "center",
		},
		optionValue: {
			fontSize: 14,
			color: colors.textSecondary,
			marginRight: 8,
		},
	});

export default Settings;
