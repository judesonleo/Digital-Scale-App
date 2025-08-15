import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	useColorScheme,
} from "react-native";
import { router } from "expo-router";
import api from "@/api";
import { getAuthToken, clearAuthToken } from "@/utils/authStorage";
import { OfflineStorage } from "@/utils/offlineStorage";
import Toast from "react-native-toast-message";
import { COLORS, FONT_SIZES } from "@/styles/constants";

const ProfileScreen = () => {
	const [userData, setUserData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [storageSize, setStorageSize] = useState<number>(0);
	const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
	const scheme = useColorScheme();
	const isDark = scheme === "dark";

	useEffect(() => {
		loadUserData();
		loadStorageInfo();
	}, []);

	const loadUserData = async () => {
		try {
			const authInfo = await getAuthToken();
			if (!authInfo?.userId) {
				router.replace("/login");
				return;
			}

			const response = await api.get(`/api/users/${authInfo.userId}`);
			setUserData(response.data);
		} catch (error) {
			console.error("Error loading user data:", error);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Error",
				text2: "Failed to load user data",
				visibilityTime: 2000,
			});
		} finally {
			setLoading(false);
		}
	};

	const loadStorageInfo = async () => {
		const size = await OfflineStorage.getStorageSize();
		setStorageSize(size);
		const lastSync = await OfflineStorage.getLastSyncTime();
		setLastSyncTime(lastSync);
	};

	const handleLogout = async () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Logout",
				style: "destructive",
				onPress: async () => {
					try {
						await clearAuthToken();
						await OfflineStorage.clearAllData();
						router.replace("/login");
					} catch (error) {
						console.error("Error during logout:", error);
						Toast.show({
							type: "error",
							position: "top",
							text1: "Error",
							text2: "Failed to logout",
							visibilityTime: 2000,
						});
					}
				},
			},
		]);
	};

	const handleClearData = async () => {
		Alert.alert(
			"Clear Data",
			"Are you sure you want to clear all offline data? This action cannot be undone.",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Clear",
					style: "destructive",
					onPress: async () => {
						try {
							await OfflineStorage.clearAllData();
							await loadStorageInfo();
							Toast.show({
								type: "success",
								position: "top",
								text1: "Success",
								text2: "All offline data cleared",
								visibilityTime: 2000,
							});
						} catch (error) {
							console.error("Error clearing data:", error);
							Toast.show({
								type: "error",
								position: "top",
								text1: "Error",
								text2: "Failed to clear data",
								visibilityTime: 2000,
							});
						}
					},
				},
			]
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	return (
		<ScrollView
			style={[
				styles.container,
				{
					backgroundColor: isDark
						? COLORS.darkBackground
						: COLORS.lightBackground,
				},
			]}
		>
			<View style={styles.header}>
				<Text
					style={[
						styles.headerText,
						{ color: isDark ? COLORS.white : COLORS.black },
					]}
				>
					Profile
				</Text>
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard },
				]}
			>
				<Text
					style={[
						styles.cardTitle,
						{ color: isDark ? COLORS.white : COLORS.black },
					]}
				>
					User Information
				</Text>
				{userData && (
					<>
						<View style={styles.infoRow}>
							<Text
								style={[
									styles.label,
									{ color: isDark ? COLORS.gray : COLORS.darkGray },
								]}
							>
								Name
							</Text>
							<Text
								style={[
									styles.value,
									{ color: isDark ? COLORS.white : COLORS.black },
								]}
							>
								{userData.name}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text
								style={[
									styles.label,
									{ color: isDark ? COLORS.gray : COLORS.darkGray },
								]}
							>
								Email
							</Text>
							<Text
								style={[
									styles.value,
									{ color: isDark ? COLORS.white : COLORS.black },
								]}
							>
								{userData.email}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text
								style={[
									styles.label,
									{ color: isDark ? COLORS.gray : COLORS.darkGray },
								]}
							>
								Height
							</Text>
							<Text
								style={[
									styles.value,
									{ color: isDark ? COLORS.white : COLORS.black },
								]}
							>
								{userData.height} cm
							</Text>
						</View>
					</>
				)}
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard },
				]}
			>
				<Text
					style={[
						styles.cardTitle,
						{ color: isDark ? COLORS.white : COLORS.black },
					]}
				>
					Storage Information
				</Text>
				<View style={styles.infoRow}>
					<Text
						style={[
							styles.label,
							{ color: isDark ? COLORS.gray : COLORS.darkGray },
						]}
					>
						Storage Used
					</Text>
					<Text
						style={[
							styles.value,
							{ color: isDark ? COLORS.white : COLORS.black },
						]}
					>
						{(storageSize / 1024).toFixed(2)} KB
					</Text>
				</View>
				{lastSyncTime && (
					<View style={styles.infoRow}>
						<Text
							style={[
								styles.label,
								{ color: isDark ? COLORS.gray : COLORS.darkGray },
							]}
						>
							Last Sync
						</Text>
						<Text
							style={[
								styles.value,
								{ color: isDark ? COLORS.white : COLORS.black },
							]}
						>
							{new Date(lastSyncTime).toLocaleString()}
						</Text>
					</View>
				)}
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard },
				]}
			>
				<Text
					style={[
						styles.cardTitle,
						{ color: isDark ? COLORS.white : COLORS.black },
					]}
				>
					Actions
				</Text>
				<TouchableOpacity
					style={[styles.button, { backgroundColor: COLORS.error }]}
					onPress={handleClearData}
				>
					<Text style={styles.buttonText}>Clear Offline Data</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.button, { backgroundColor: COLORS.error }]}
					onPress={handleLogout}
				>
					<Text style={styles.buttonText}>Logout</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	headerText: {
		fontSize: FONT_SIZES.large,
		fontWeight: "bold",
	},
	card: {
		margin: 16,
		padding: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardTitle: {
		fontSize: FONT_SIZES.medium,
		fontWeight: "600",
		marginBottom: 16,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	label: {
		fontSize: FONT_SIZES.small,
	},
	value: {
		fontSize: FONT_SIZES.small,
		fontWeight: "500",
	},
	button: {
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginVertical: 8,
	},
	buttonText: {
		color: COLORS.white,
		fontSize: FONT_SIZES.medium,
		fontWeight: "600",
	},
});

export default ProfileScreen;
