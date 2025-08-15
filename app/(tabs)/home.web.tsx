import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Platform,
	ActivityIndicator,
	TouchableOpacity,
	useColorScheme,
	RefreshControl,
	ScrollView,
	SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import api from "@/api";
import { getAuthToken } from "@/utils/authStorage";
import { darkMode, lightMode } from "@/styles/homeconstant";
import { OfflineStorage } from "@/utils/offlineStorage";
import NetInfo from "@react-native-community/netinfo";

interface FamilyMember {
	userId: unknown;
	_id: string;
	name: string;
}

interface MainUser {
	_id: string;
	name: string;
}

const DESIGN = {
	colors: {
		primary: {
			light: "#406F62",
			dark: "#4A9182",
		},
		background: {
			light: "#F5F7FA",
			dark: "#121416",
		},
		surface: {
			light: "#FFFFFF",
			dark: "#1E2124",
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
		border: {
			light: "#E2E8F0",
			dark: "#2D3748",
		},
		status: {
			success: "#4CAF50",
			error: "#FF5252",
		},
		button: {
			primary: "#406F62",
			secondary: "#304C37",
			disabled: "#718096",
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
		xl: 22,
	},
	typography: {
		heading1: {
			size: 28,
			weight: "700",
		},
		heading2: {
			size: 18,
			weight: "600",
		},
		body1: {
			size: 16,
			weight: "400",
		},
		body2: {
			size: 14,
			weight: "400",
		},
		weight: {
			size: 36,
			weight: "700",
		},
	},
	shadow: {
		light: {
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 8,
			elevation: 3,
		},
		dark: {
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.2,
			shadowRadius: 8,
			elevation: 4,
		},
	},
};

const HomeScreen = () => {
	const [userId, setUserId] = useState<number | null>(null);
	const [value, setValue] = useState("No value");
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const scheme = useColorScheme();
	const [isCapturing, setIsCapturing] = useState(false);
	const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
	const [mainUser, setMainUser] = useState<MainUser | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [isOnline, setIsOnline] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [storageSize, setStorageSize] = useState<number>(0);
	const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

	// Fetch family members when component mounts
	const fetchFamilyAndUser = async () => {
		try {
			const authInfo = await getAuthToken();
			if (!authInfo || !authInfo.userId || !authInfo.name) {
				alert("Please log in first");
				return;
			}

			setMainUser({
				_id: authInfo.userId.toString(),
				name: authInfo.name,
			});

			const response = await api.get(`/api/family/${authInfo.userId}`);
			if (response.data?.error === "No valid family members found") {
				console.log("No family members found");
				return;
			}
			setFamilyMembers(
				response.data.map((member: any) => ({
					_id: member.userId.toString(),
					name: member.name,
				}))
			);
		} catch (error) {
			console.error("Error fetching family members:", error);
			alert("Could not fetch family members");
		}
	};

	useEffect(() => {
		fetchFamilyAndUser();
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchFamilyAndUser();
		setRefreshing(false);
	};

	const isDark = scheme === "dark";

	const colors = {
		background: isDark
			? DESIGN.colors.background.dark
			: DESIGN.colors.background.light,
		surface: isDark ? DESIGN.colors.surface.dark : DESIGN.colors.surface.light,
		text: isDark ? DESIGN.colors.text.dark : DESIGN.colors.text.light,
		border: isDark ? DESIGN.colors.border.dark : DESIGN.colors.border.light,
		primary: isDark ? DESIGN.colors.primary.dark : DESIGN.colors.primary.light,
	};

	const renderPicker = () => {
		return (
			<View
				style={[
					styles.pickerWrapper,
					{
						backgroundColor:
							scheme === "dark" ? lightMode.black : lightMode.darkGreen,
					},
				]}
			>
				<View
					style={[
						styles.pickerContainer,
						styles.iosPicker,
						{ borderColor: scheme === "dark" ? "#444" : "#e0e0e0" },
					]}
				>
					<Picker
						selectedValue={userId}
						onValueChange={(itemValue: number | null) => setUserId(itemValue)}
						itemStyle={[
							styles.iosPickerItem,
							{ color: scheme === "dark" ? "#fff" : lightMode.white },
						]}
					>
						<Picker.Item label="Select User" value={null} />
						{mainUser && (
							<Picker.Item
								label={mainUser.name}
								value={mainUser._id}
								key={mainUser._id}
							/>
						)}
						{familyMembers.map((member) => (
							<Picker.Item
								key={member._id}
								label={member.name}
								value={member._id}
							/>
						))}
					</Picker>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView
			style={[
				styles.safeArea,
				{
					backgroundColor:
						scheme === "dark" ? darkMode.background : lightMode.background,
				},
			]}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text
						style={[
							styles.headerText,
							{ color: scheme === "dark" ? "#fff" : "#333" },
						]}
					>
						Digital Scale
					</Text>
					<Text
						style={[
							styles.subHeaderText,
							{ color: scheme === "dark" ? "#aaa" : "#666" },
						]}
					>
						Web Demo Mode
					</Text>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				>
					<View
						style={[
							styles.statusCard,
							isDark ? styles.shadowDark : styles.shadowLight,
							{
								backgroundColor:
									scheme === "dark" ? lightMode.black : lightMode.white,
								borderColor:
									scheme === "dark" ? lightMode.white : lightMode.black,
							},
						]}
					>
						<View
							style={[styles.statusIndicator, { backgroundColor: "#FF5252" }]}
						/>
						<View style={styles.statusContent}>
							<Text
								style={[
									styles.statusLabel,
									{ color: scheme === "dark" ? "#fff" : "#333" },
								]}
							>
								Connection Status
							</Text>
							<Text
								style={[
									styles.statusText,
									{ color: scheme === "dark" ? "#aaa" : "#666" },
								]}
							>
								Web Demo Mode - BLE Not Available
							</Text>
						</View>
					</View>

					<View
						style={[
							styles.weightCard,
							isDark ? styles.shadowDark : styles.shadowLight,
							{
								backgroundColor:
									scheme === "dark" ? lightMode.black : lightMode.darkGreen,
								borderColor:
									scheme === "dark" ? lightMode.white : lightMode.black,
							},
						]}
					>
						<Text
							style={[
								styles.weightLabel,
								{
									color:
										scheme === "dark"
											? lightMode.white
											: lightMode.text.primary,
								},
							]}
						>
							Current Weight
						</Text>
						<Text
							style={[
								styles.weightValue,
								{
									color:
										scheme === "dark"
											? lightMode.text.primary
											: lightMode.text.primary,
								},
							]}
						>
							-- kg
						</Text>
					</View>

					<View
						style={[
							styles.userCard,
							isDark ? styles.shadowDark : styles.shadowLight,
							{
								backgroundColor:
									scheme === "dark" ? lightMode.black : lightMode.darkGreen,
								borderColor:
									scheme === "dark" ? lightMode.white : lightMode.black,
							},
						]}
					>
						<Text
							style={[
								styles.cardTitle,
								{
									color: scheme === "dark" ? lightMode.white : lightMode.white,
								},
							]}
						>
							Select User
						</Text>

						{renderPicker()}

						<View style={styles.cardButtons}>
							<TouchableOpacity
								style={[
									styles.button,
									styles.connectButton,
									{
										backgroundColor: lightMode.lightGreen,
										opacity: 0.7,
									},
								]}
								disabled={true}
							>
								<Text style={styles.buttonText}>Connect to Scale</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.button,
									styles.captureButton,
									{
										backgroundColor:
											scheme === "dark" ? lightMode.black : lightMode.darkGreen,
										opacity: 0.7,
										borderColor: lightMode.white,
										borderWidth: 2,
									},
								]}
								disabled={true}
							>
								<Text style={styles.buttonText}>Capture Weight</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</View>
			<Toast />
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		paddingVertical: 16,
		alignItems: "center",
	},
	headerText: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subHeaderText: {
		fontSize: 16,
	},
	scrollContent: {
		paddingBottom: 16,
	},
	statusCard: {
		flexDirection: "row",
		padding: 20,
		borderWidth: 1,
		marginBottom: 16,
		borderRadius: 12,
		width: "100%",
		marginVertical: 10,
	},
	statusIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 12,
		marginTop: 4,
	},
	statusContent: {
		flex: 1,
	},
	statusLabel: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	statusText: {
		fontSize: 14,
	},
	weightCard: {
		padding: 20,
		borderRadius: 12,
		borderStyle: "solid",
		marginBottom: 16,
		alignItems: "center",
		borderWidth: 1,
	},
	shadowLight: {
		...Platform.select({
			ios: {
				shadowColor: lightMode.black,
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
			web: {
				boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
			},
		}),
	},
	shadowDark: {
		...Platform.select({
			ios: {
				shadowColor: lightMode.white,
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
			web: {
				boxShadow: "0 2px 8px rgba(255, 255, 255, 0.1)",
			},
		}),
	},
	weightLabel: {
		fontSize: 16,
		marginBottom: 8,
	},
	weightValue: {
		fontSize: 36,
		fontWeight: "bold",
	},
	userCard: {
		padding: 20,
		borderRadius: 22,
		backgroundColor: lightMode.darkGreen,
		borderWidth: 1,
		shadowOpacity: 0.5,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 12,
	},
	pickerWrapper: {
		borderRadius: 12,
		overflow: "hidden",
		marginBottom: 16,
	},
	pickerContainer: {
		borderWidth: 0,
		borderRadius: 12,
		overflow: "hidden",
	},
	picker: {
		height: 50,
		width: "100%",
	},
	cardButtons: {
		marginTop: 8,
	},
	button: {
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	connectButton: {
		marginBottom: 12,
	},
	captureButton: {
		backgroundColor: "#2196F3",
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
		color: lightMode.white,
	},
	iosPicker: {
		paddingHorizontal: 10,
	},
	iosPickerItem: {
		fontSize: 16,
		height: 120,
		textAlign: "left",
	},
});

export default HomeScreen;
