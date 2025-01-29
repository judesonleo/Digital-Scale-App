import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	PermissionsAndroid,
	Platform,
	ActivityIndicator,
	TouchableOpacity,
	useColorScheme,
	RefreshControl,
	ScrollView,
	SafeAreaView,
	Dimensions,
	TextStyle,
	ViewStyle,
} from "react-native";

import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer"; // Import Buffer
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api";
import { getAuthToken } from "@/utils/authStorage";
import { darkMode, lightMode } from "@/styles/homeconstant";
import { FontWeight } from "react-native-svg";

const manager = new BleManager();
const ESP32_NAME = "ESP32_TEST";

// UUIDs for your ESP32
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
interface FamilyMember {
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
			light: "#406F62", // Main green
			dark: "#4A9182", // Lighter green for dark mode
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

const App = () => {
	const [userId, setUserId] = useState<number | null>(null);
	const [value, setValue] = useState("No value");
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [device, setDevice] = useState<Device | null>(null);
	const scheme = useColorScheme();
	const [isCapturing, setIsCapturing] = useState(false);
	const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
	const [mainUser, setMainUser] = useState<MainUser | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	// Request permissions for Android 12+ (API 31+)
	const requestPermissions = async () => {
		if (Platform.OS === "android" && Platform.Version >= 31) {
			try {
				const granted = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
				]);

				if (
					granted["android.permission.BLUETOOTH_SCAN"] !==
						PermissionsAndroid.RESULTS.GRANTED ||
					granted["android.permission.BLUETOOTH_CONNECT"] !==
						PermissionsAndroid.RESULTS.GRANTED ||
					granted["android.permission.ACCESS_FINE_LOCATION"] !==
						PermissionsAndroid.RESULTS.GRANTED
				) {
					Alert.alert("Bluetooth permissions are required");
					return false;
				}
				return true;
			} catch (error) {
				console.log("Permission error:", error);
				Alert.alert("Failed to get Bluetooth permissions");
				return false;
			}
		}
		return true;
	};

	// Request permissions for Android 6.0 to 11 (API 23 to 30)
	const requestLegacyPermissions = async () => {
		if (
			Platform.OS === "android" &&
			Platform.Version >= 23 &&
			Platform.Version < 31
		) {
			try {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					Alert.alert("Location permission is required for BLE scanning");
					return false;
				}
				return true;
			} catch (error) {
				console.log("Permission error:", error);
				return false;
			}
		}
		return true;
	};

	// Check if BLE is supported
	const checkBleSupport = async () => {
		if (!manager) {
			Alert.alert("BLE Manager is not initialized");
			return false;
		}
		try {
			const isSupported = await manager.state();
			if (isSupported !== "PoweredOn") {
				Alert.alert("Please enable Bluetooth to use this feature.");
				return false;
			}
			return true;
		} catch (error) {
			console.log("BLE support check error:", error);
			return false;
		}
	};

	// Scan and connect to the ESP32
	const scanAndConnect = async () => {
		setIsLoading(true);

		try {
			// Request permissions dynamically
			let hasPermissions = false;
			if (Number(Platform.Version) >= 31) {
				hasPermissions = await requestPermissions();
			} else {
				hasPermissions = await requestLegacyPermissions();
			}

			if (!hasPermissions) {
				setIsLoading(false);
				return;
			}

			// Check BLE support
			const isBleSupported = await checkBleSupport();
			if (!isBleSupported) {
				setIsLoading(false);
				return;
			}

			const scanTimeout = setTimeout(() => {
				manager.stopDeviceScan();
				setIsLoading(false);
				Alert.alert("Scan timed out, try again.");
			}, 10000); // Stop scanning after 10 seconds

			// Start scanning
			manager.startDeviceScan(null, null, async (error, device) => {
				if (error) {
					console.log("Scanning error:", error);
					clearTimeout(scanTimeout);
					setIsLoading(false);
					Alert.alert("Error scanning for devices");
					return;
				}

				if (device?.name === ESP32_NAME) {
					clearTimeout(scanTimeout);
					manager.stopDeviceScan();
					console.log("Found device:", device.name);

					try {
						const connectedDevice = await device.connect();
						setDevice(connectedDevice);
						setIsConnected(true);
						console.log("Connected to device:", connectedDevice.name);
						await connectedDevice.discoverAllServicesAndCharacteristics();

						// Monitor the characteristic
						connectedDevice.monitorCharacteristicForService(
							SERVICE_UUID,
							CHARACTERISTIC_UUID,
							(error, characteristic) => {
								if (error) {
									console.log("Monitoring error:", error);
									return;
								}

								if (characteristic?.value) {
									const decodedValue = Buffer.from(
										characteristic.value,
										"base64"
									).toString();
									console.log("Received value:", decodedValue);
									setValue(decodedValue);
								}
							}
						);

						// Handle disconnection
						connectedDevice.onDisconnected(() => {
							console.log("Device disconnected");
							setIsConnected(false);
							setDevice(null);
						});
					} catch (connectionError) {
						console.log("Connection error:", connectionError);
						Alert.alert("Error connecting to device");
						setIsConnected(false);
					}
					setIsLoading(false);
				}
			});
		} catch (error) {
			console.log("General error:", error);
			setIsLoading(false);
			Alert.alert("An error occurred");
		}
	};

	// Disconnect from the ESP32
	const disconnect = async () => {
		if (device) {
			try {
				await device.cancelConnection();
				setIsConnected(false);
				console.log("Disconnected from device");
			} catch (error) {
				console.log("Disconnection error:", error);
			}
		} else {
			console.log("No device to disconnect from.");
		}
	};

	const handleCapture = async () => {
		// Validate user selection and value
		if (!userId) {
			Toast.show({
				type: "error",
				position: "top",
				text1: "Error",
				text2: "Please select a user",
				visibilityTime: 2000,
			});
			return;
		}

		// Validate weight value
		const weightValue = parseFloat(value);
		if (isNaN(weightValue)) {
			Toast.show({
				type: "error",
				position: "top",
				text1: "Error",
				text2: "Invalid weight value",
				visibilityTime: 2000,
			});
			return;
		}

		setIsCapturing(true);

		try {
			// Send weight log to API
			const response = await api.post("/api/weights", {
				userId,
				weight: weightValue,
				notes: "",
			});
			console.log("Weight log response:", response.data);
			// Success toast
			Toast.show({
				type: "success",
				position: "top",
				text1: "Weight Logged",
				text2: `${weightValue} logged for user`,
				visibilityTime: 2000,
			});

			// Reset capturing state
			setIsCapturing(false);
		} catch (error) {
			console.error("Error logging weight:", error);

			// Error toast
			Toast.show({
				type: "error",
				position: "top",
				text1: "Logging Failed",
				text2: "Could not log weight",
				visibilityTime: 2000,
			});

			setIsCapturing(false);
		}
	};
	// Fetch family members when component mounts
	const fetchFamilyAndUser = async () => {
		try {
			// Get user details using getAuthToken
			const authInfo = await getAuthToken();
			if (!authInfo || !authInfo.userId || !authInfo.name) {
				Alert.alert("Please log in first");
				return;
			}

			// Set main user
			setMainUser({
				_id: authInfo.userId.toString(),
				name: authInfo.name,
			});
			console.log("Main user:", authInfo.userId, authInfo.name);
			// console.log("Main user:", authInfo.userId, authInfo.name);
			// Fetch family members
			const response = await api.get(`/api/family/${authInfo.userId}`);
			setFamilyMembers(response.data);
			console.log("Family members:", response);
		} catch (error) {
			console.error("Error fetching family members:", error);
			Alert.alert("Could not fetch family members");
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
		const pickerProps = {
			selectedValue: userId,
			onValueChange: (itemValue: number | null) => setUserId(itemValue),
		};
		if (Platform.OS === "ios") {
			return (
				<View
					style={[styles.pickerWrapper, { backgroundColor: colors.surface }]}
				>
					<View
						style={[
							styles.pickerContainer,
							styles.iosPicker,
							{ borderColor: colors.border },
						]}
					>
						<Picker
							{...pickerProps}
							itemStyle={[styles.iosPickerItem, { color: colors.text.primary }]}
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
		}
		return (
			<View style={[styles.pickerWrapper, { backgroundColor: colors.surface }]}>
				<View style={[styles.pickerContainer, { borderColor: colors.border }]}>
					<Picker
						{...pickerProps}
						style={[
							styles.picker,
							styles.androidPicker,
							{ color: colors.text.primary, backgroundColor: colors.surface },
						]}
						dropdownIconColor={colors.primary}
					>
						<Picker.Item
							label="Select User"
							value={null}
							style={styles.androidPickerItem}
							color={colors.text.primary}
						/>
						{mainUser && (
							<Picker.Item
								label={mainUser.name}
								value={mainUser._id}
								key={mainUser._id}
								style={styles.androidPickerItem}
								color={colors.text.primary}
							/>
						)}
						{familyMembers.map((member) => (
							<Picker.Item
								key={member._id}
								label={member.name}
								value={member._id}
								style={styles.androidPickerItem}
								color={colors.text.primary}
							/>
						))}
					</Picker>
				</View>
			</View>
		);
	};
	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: colors.background }]}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={[styles.headerText, { color: colors.text.primary }]}>
						Digital Scale
					</Text>
					<Text
						style={[styles.subHeaderText, { color: colors.text.secondary }]}
					>
						Connect and measure weight
					</Text>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				>
					{/* Status Card */}
					<View
						style={[
							styles.card,
							styles.statusCard,
							{ backgroundColor: colors.surface },
						]}
					>
						<View
							style={[
								styles.statusIndicator,
								{
									backgroundColor: isConnected
										? DESIGN.colors.status.success
										: DESIGN.colors.status.error,
								},
							]}
						/>
						<View style={styles.statusContent}>
							<Text
								style={[styles.statusLabel, { color: colors.text.primary }]}
							>
								Connection Status
							</Text>
							<Text
								style={[styles.statusText, { color: colors.text.secondary }]}
							>
								{isConnected ? "Connected to ESP32" : "Disconnected"}
							</Text>
						</View>
					</View>

					{/* Weight Card */}
					<View
						style={[
							styles.card,
							styles.weightCard,
							{ backgroundColor: colors.surface },
						]}
					>
						<Text style={[styles.weightLabel, { color: colors.text.primary }]}>
							Current Weight
						</Text>
						<Text style={[styles.weightValue, { color: colors.primary }]}>
							{value !== "No value" ? `${value} kg` : "-- kg"}
						</Text>
					</View>

					{/* User Selection Card */}
					<View
						style={[
							styles.card,
							styles.userCard,
							{ backgroundColor: colors.surface },
						]}
					>
						<Text style={[styles.cardTitle, { color: colors.text.primary }]}>
							Select User
						</Text>

						{renderPicker()}

						<View style={styles.cardButtons}>
							<TouchableOpacity
								style={[
									styles.button,
									{
										backgroundColor: isConnected
											? DESIGN.colors.button.secondary
											: DESIGN.colors.button.primary,
										opacity: isLoading ? 0.7 : 1,
									},
								]}
								onPress={isConnected ? disconnect : scanAndConnect}
								disabled={isLoading}
							>
								{isLoading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.buttonText}>
										{isConnected ? "Disconnect" : "Connect to Scale"}
									</Text>
								)}
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.button as ViewStyle,
									styles.secondaryButton as ViewStyle,
									{
										backgroundColor: "transparent",
										borderColor: colors.primary,
										opacity: isCapturing || !isConnected ? 0.7 : 1,
									},
								]}
								onPress={handleCapture}
								disabled={isCapturing || !isConnected}
							>
								{isCapturing ? (
									<ActivityIndicator color={colors.primary} />
								) : (
									<Text
										style={[
											styles.buttonText as TextStyle,
											{ color: colors.primary },
										]}
									>
										Capture Weight
									</Text>
								)}
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
		padding: DESIGN.spacing.md,
	},
	header: {
		paddingVertical: DESIGN.spacing.md,
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
		marginBottom: DESIGN.spacing.md,
	},
	headerText: {
		fontSize: DESIGN.typography.heading1.size,
		fontWeight: parseInt(DESIGN.typography.heading1.weight, 10) as 700,
		marginBottom: DESIGN.spacing.sm,
		textAlign: "center",
	},
	subHeaderText: {
		fontSize: DESIGN.typography.body1.size,
		textAlign: "center",
		opacity: 0.8,
	} as TextStyle,
	scrollContent: {
		paddingBottom: DESIGN.spacing.md,
	},
	// Base card styles
	card: {
		borderRadius: DESIGN.borderRadius.lg,
		marginBottom: DESIGN.spacing.md,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.1)",
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
	// Status card specific styles
	statusCard: {
		flexDirection: "row",
		padding: DESIGN.spacing.md,
		borderWidth: 1,
		borderRadius: DESIGN.borderRadius.lg,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.15,
				shadowRadius: 6,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	statusIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: DESIGN.spacing.md,
		marginTop: 4,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.1)",
	},
	statusContent: {
		flex: 1,
	},
	statusLabel: {
		fontSize: DESIGN.typography.body1.size,
		fontWeight: parseInt(DESIGN.typography.heading2.weight, 10) as 600,
		marginBottom: DESIGN.spacing.xs,
	},
	statusText: {
		fontSize: DESIGN.typography.body2.size,
	},
	// Weight card specific styles
	weightCard: {
		padding: DESIGN.spacing.lg,
		alignItems: "center",
		borderWidth: 2,
		borderRadius: DESIGN.borderRadius.lg,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 3 },
				shadowOpacity: 0.2,
				shadowRadius: 10,
			},
			android: {
				elevation: 5,
			},
		}),
	},
	weightLabel: {
		fontSize: DESIGN.typography.body1.size,
		marginBottom: DESIGN.spacing.sm,
		fontWeight: "500",
	},
	weightValue: {
		fontSize: DESIGN.typography.weight.size,
		fontWeight: parseInt(
			DESIGN.typography.weight.weight,
			10
		) as unknown as TextStyle["fontWeight"],
		letterSpacing: 0.5,
	},
	// User card specific styles
	userCard: {
		padding: DESIGN.spacing.lg,
		borderRadius: DESIGN.borderRadius.xl,
		borderWidth: 1,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.15,
				shadowRadius: 12,
			},
			android: {
				elevation: 6,
			},
		}),
	},
	cardTitle: {
		fontSize: DESIGN.typography.heading2.size,
		fontWeight: parseInt(DESIGN.typography.heading2.weight, 10) as 600,
		marginBottom: DESIGN.spacing.md,
		textAlign: "center",
	},
	// Picker styles
	pickerWrapper: {
		borderRadius: DESIGN.borderRadius.md,
		overflow: "hidden",
		marginBottom: DESIGN.spacing.md,
		borderWidth: 1,
	} as ViewStyle,
	pickerContainer: {
		borderWidth: 1,
		borderRadius: DESIGN.borderRadius.md,
		overflow: "hidden",
	},
	picker: {
		height: 50,
		width: "100%",
	},
	iosPicker: {
		paddingHorizontal: DESIGN.spacing.sm,
	},
	iosPickerItem: {
		fontSize: DESIGN.typography.body1.size,
		height: 120,
	},
	androidPicker: {
		height: 50,
		paddingHorizontal: DESIGN.spacing.sm,
	},
	androidPickerItem: {
		fontSize: DESIGN.typography.body1.size,
		fontFamily: Platform.select({
			android: "Roboto",
			default: undefined,
		}),
	},
	// Button styles
	cardButtons: {
		marginTop: DESIGN.spacing.lg,
		gap: DESIGN.spacing.md,
	},
	button: {
		padding: DESIGN.spacing.md,
		borderRadius: DESIGN.borderRadius.md,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "transparent",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.15,
				shadowRadius: 8,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	secondaryButton: {
		borderWidth: 2,
		backgroundColor: "transparent",
	} as ViewStyle,
	buttonText: {
		fontSize: DESIGN.typography.body1.size,
		fontWeight: "600" as "600",
		textAlign: "center" as "center",
		letterSpacing: 0.5,
	} as TextStyle,
	// Input field styles (if needed)
	input: {
		borderWidth: 1,
		borderRadius: DESIGN.borderRadius.sm,
		padding: DESIGN.spacing.sm,
		fontSize: DESIGN.typography.body1.size,
		marginBottom: DESIGN.spacing.md,
	},
	// Loading state styles
	loadingContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.3)",
	},
	// Error state styles
	errorContainer: {
		padding: DESIGN.spacing.md,
		borderRadius: DESIGN.borderRadius.md,
		borderWidth: 1,
		borderColor: DESIGN.colors.status.error,
		marginBottom: DESIGN.spacing.md,
	},
	errorText: {
		color: DESIGN.colors.status.error,
		fontSize: DESIGN.typography.body2.size,
		textAlign: "center",
	},
	// Divider style
	divider: {
		height: 1,
		width: "100%",
		backgroundColor: "rgba(0,0,0,0.1)",
		marginVertical: DESIGN.spacing.md,
	},
	// Badge style
	badge: {
		paddingHorizontal: DESIGN.spacing.sm,
		paddingVertical: DESIGN.spacing.xs,
		borderRadius: DESIGN.borderRadius.sm,
		borderWidth: 1,
		alignSelf: "flex-start",
	},
	badgeText: {
		fontSize: DESIGN.typography.body2.size,
		fontWeight: "500",
	},
	// Card header style
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: DESIGN.spacing.sm,
		borderBottomWidth: 1,
		marginBottom: DESIGN.spacing.md,
	},
	// Responsive padding for different screen sizes
	contentPadding: {
		padding: Platform.select({
			ios: DESIGN.spacing.md,
			android: DESIGN.spacing.sm,
		}),
	},
	// Helper styles for spacing
	mt1: { marginTop: DESIGN.spacing.xs },
	mt2: { marginTop: DESIGN.spacing.sm },
	mt3: { marginTop: DESIGN.spacing.md },
	mt4: { marginTop: DESIGN.spacing.lg },
	mb1: { marginBottom: DESIGN.spacing.xs },
	mb2: { marginBottom: DESIGN.spacing.sm },
	mb3: { marginBottom: DESIGN.spacing.md },
	mb4: { marginBottom: DESIGN.spacing.lg },
});

export default App;
