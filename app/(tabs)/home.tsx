import React, { useEffect, useState, useRef } from "react";
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
import { OfflineStorage } from "@/utils/offlineStorage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

const manager = new BleManager();
const ESP32_NAME = "ESP32_TEST";
const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 3;

// UUIDs for your ESP32
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

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
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const [lastConnectedDevice, setLastConnectedDevice] = useState<Device | null>(
		null
	);
	const [isReconnecting, setIsReconnecting] = useState(false);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isOnline, setIsOnline] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [storageSize, setStorageSize] = useState<number>(0);
	const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

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

	// Add reconnection logic
	const attemptReconnect = async () => {
		if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
			Toast.show({
				type: "error",
				position: "top",
				text1: "Connection Failed",
				text2: "Maximum reconnection attempts reached. Please try again.",
				visibilityTime: 3000,
			});
			return;
		}

		setIsReconnecting(true);
		try {
			if (lastConnectedDevice) {
				await connectToDevice(lastConnectedDevice);
				setReconnectAttempts(0);
			}
		} catch (error) {
			console.log("Reconnection attempt failed:", error);
			setReconnectAttempts((prev) => prev + 1);
			reconnectTimeoutRef.current = setTimeout(
				attemptReconnect,
				RECONNECT_DELAY
			);
		} finally {
			setIsReconnecting(false);
		}
	};

	// Add data validation on mount
	useEffect(() => {
		const validateData = async () => {
			setIsValidating(true);
			try {
				await OfflineStorage.validateAndCleanupData();
			} catch (error) {
				console.error("Error validating data:", error);
				Toast.show({
					type: "error",
					position: "top",
					text1: "Data Validation Error",
					text2: "There was an error validating stored data",
					visibilityTime: 2000,
				});
			} finally {
				setIsValidating(false);
			}
		};
		validateData();
	}, []);

	// Add storage size monitoring
	useEffect(() => {
		const updateStorageInfo = async () => {
			const size = await OfflineStorage.getStorageSize();
			setStorageSize(size);
			const lastSync = await OfflineStorage.getLastSyncTime();
			setLastSyncTime(lastSync);
		};
		updateStorageInfo();
	}, []);

	// Sync pending data when online
	const syncPendingData = async () => {
		if (!isOnline || isSyncing) return;

		setIsSyncing(true);
		try {
			const pendingLogs = await OfflineStorage.getPendingSyncItems();
			let successCount = 0;
			let failureCount = 0;

			for (const log of pendingLogs) {
				try {
					const response = await api.post("/api/weights", {
						userId: log.userId,
						weight: log.weight,
						notes: log.notes,
						timestamp: log.timestamp,
					});

					await OfflineStorage.markLogAsSynced(log.timestamp);
					await OfflineStorage.updateLastSyncTime();
					successCount++;
				} catch (error) {
					console.error("Error syncing weight log:", error);
					failureCount++;
				}
			}

			if (successCount > 0) {
				Toast.show({
					type: "success",
					position: "top",
					text1: "Sync Complete",
					text2: `Successfully synced ${successCount} weight logs${
						failureCount > 0 ? `, ${failureCount} failed` : ""
					}`,
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Error during sync:", error);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Sync Failed",
				text2: "Failed to sync weight data",
				visibilityTime: 2000,
			});
		} finally {
			setIsSyncing(false);
		}
	};

	// Add network status monitoring
	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
			setIsOnline(!!state.isConnected);
			if (state.isConnected) {
				syncPendingData();
			}
		});

		return () => unsubscribe();
	}, []);

	// Enhanced device connection function
	const connectToDevice = async (device: Device) => {
		try {
			const connectedDevice = await device.connect();
			setDevice(connectedDevice);
			setIsConnected(true);
			setLastConnectedDevice(device);
			await updateDeviceInfo(connectedDevice);

			await connectedDevice.discoverAllServicesAndCharacteristics();

			// Monitor the characteristic
			connectedDevice.monitorCharacteristicForService(
				SERVICE_UUID,
				CHARACTERISTIC_UUID,
				(error, characteristic) => {
					if (error) {
						console.log("Monitoring error:", error);
						Toast.show({
							type: "error",
							position: "top",
							text1: "Connection Error",
							text2: "Failed to monitor device data",
							visibilityTime: 2000,
						});
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

			// Enhanced disconnection handling
			connectedDevice.onDisconnected(handleDisconnectedDevice);

			Toast.show({
				type: "success",
				position: "top",
				text1: "Connected",
				text2: "Successfully connected to scale",
				visibilityTime: 2000,
			});
		} catch (error) {
			console.log("Connection error:", error);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Connection Failed",
				text2: "Failed to connect to device",
				visibilityTime: 2000,
			});
			throw error;
		}
	};

	// Enhanced scan and connect function
	const scanAndConnect = async () => {
		setIsLoading(true);
		setReconnectAttempts(0);

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
				Toast.show({
					type: "error",
					position: "top",
					text1: "Scan Timeout",
					text2: "No device found. Please try again.",
					visibilityTime: 2000,
				});
			}, 10000);

			// Start scanning
			manager.startDeviceScan(null, null, handleDiscoverDevice);
		} catch (error) {
			console.log("General error:", error);
			setIsLoading(false);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Error",
				text2: "An unexpected error occurred",
				visibilityTime: 2000,
			});
		}
	};

	// Enhanced disconnect function
	const disconnect = async () => {
		if (device) {
			try {
				await device.cancelConnection();
				setIsConnected(false);
				setDevice(null);
				setLastConnectedDevice(null);
				await updateDeviceInfo(null);
				if (reconnectTimeoutRef.current) {
					clearTimeout(reconnectTimeoutRef.current);
				}
				Toast.show({
					type: "success",
					position: "top",
					text1: "Disconnected",
					text2: "Successfully disconnected from device",
					visibilityTime: 2000,
				});
			} catch (error) {
				console.log("Disconnection error:", error);
				Toast.show({
					type: "error",
					position: "top",
					text1: "Disconnect Error",
					text2: "Failed to disconnect from device",
					visibilityTime: 2000,
				});
			}
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (device) {
				disconnect();
			}
		};
	}, []);

	// Update device info when connecting/disconnecting
	const updateDeviceInfo = async (device: Device | null) => {
		try {
			const deviceInfo = {
				lastConnectedDevice: device?.id || null,
				lastConnectionTime: device ? new Date().toISOString() : null,
				batteryLevel: null as number | null, // You can add battery level monitoring here
			};
			await OfflineStorage.saveDeviceInfo(deviceInfo);
		} catch (error) {
			console.error("Error updating device info:", error);
		}
	};

	// Update handleCapture to use offline storage
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
			// Save to offline storage first
			const timestamp = new Date().toISOString();
			await OfflineStorage.saveWeightLog({
				userId: String(userId),
				weight: weightValue,
				notes: "",
				timestamp,
				syncStatus: "pending",
			});

			// If online, try to sync immediately
			if (isOnline) {
				const response = await api.post("/api/weights", {
					userId: String(userId),
					weight: weightValue,
					notes: "",
					timestamp,
				});

				await OfflineStorage.markLogAsSynced(timestamp);
				await OfflineStorage.updateLastSyncTime();

				Toast.show({
					type: "success",
					position: "top",
					text1: "Weight Logged",
					text2: `${weightValue} logged for ${response.data.userName}`,
					visibilityTime: 2000,
				});
			} else {
				Toast.show({
					type: "success",
					position: "top",
					text1: "Weight Saved",
					text2: `${weightValue} saved offline. Will sync when online.`,
					visibilityTime: 2000,
				});
			}
		} catch (error) {
			console.error("Error logging weight:", error);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Logging Failed",
				text2: "Could not save weight data",
				visibilityTime: 2000,
			});
		} finally {
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
			if (response.data?.error === "No valid family members found") {
				console.log("No family members found");
				return; // Do nothing if no valid family members are found
			}
			setFamilyMembers(
				response.data.map((member: any) => ({
					_id: member.userId.toString(),
					name: member.name,
				}))
			);
			// setFamilyMembers(response.data);
			console.log("Family members:", response);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				console.log("404 - No family members or user found, skipping error");
				return; // Just return without doing anything
			}
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
		if (Platform.OS === "ios") {
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
							// key={"98u98h989y8h78"}
							itemStyle={[
								styles.iosPickerItem,
								{ color: scheme === "dark" ? "#fff" : lightMode.white },
							]}
						>
							<Picker.Item
								label="Select User"
								value={null}
								// key={"89y8y9y98y8"}
							/>
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
		} else {
			return (
				<View
					style={[
						styles.pickerWrapper,
						{
							backgroundColor:
								scheme === "dark" ? darkMode.background : lightMode.background,
						},
					]}
				>
					<View
						style={[
							styles.pickerContainer,
							{ borderColor: scheme === "dark" ? "#444" : "#e0e0e0" },
						]}
					>
						<Picker
							selectedValue={userId}
							onValueChange={(itemValue: number | null) => setUserId(itemValue)}
							style={[
								styles.picker,
								styles.androidPicker,
								{
									color: scheme === "dark" ? "#fff" : "black",
									backgroundColor:
										scheme === "dark"
											? darkMode.background
											: lightMode.background,
								},
							]}
							dropdownIconColor={
								scheme === "dark" ? lightMode.darkGreen : lightMode.darkGreen
							}
						>
							<Picker.Item
								label="Select User"
								value={null}
								style={styles.androidPickerItem}
								// color={scheme === "dark" ? "#fff" : "#333"}
							/>
							{mainUser && (
								<Picker.Item
									label={mainUser.name}
									value={mainUser._id}
									style={styles.androidPickerItem}
									// color={scheme === "dark" ? "#fff" : "#333"}
									key={mainUser._id}
								/>
							)}
							{familyMembers.map((member) => (
								<Picker.Item
									key={member._id}
									label={member.name}
									value={member._id}
									style={styles.androidPickerItem}
									// color={scheme === "dark" ? "#fff" : "#333"}
								/>
							))}
						</Picker>
					</View>
				</View>
			);
		}
	};

	const handleDisconnectedDevice = (error: any, disconnectedDevice: Device) => {
		console.log("Device disconnected:", error);
		setIsConnected(false);
		setDevice(null);

		// Attempt to reconnect if it wasn't a manual disconnect
		if (!error?.message?.includes("cancelled")) {
			attemptReconnect();
		}
	};

	const handleDiscoverDevice = (error: any, device: Device | null) => {
		if (error) {
			console.log("Scanning error:", error);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Scan Error",
				text2: "Failed to scan for devices",
				visibilityTime: 2000,
			});
			return;
		}

		if (device?.name?.startsWith(ESP32_NAME)) {
			manager.stopDeviceScan();
			console.log("Found device:", device.name);

			try {
				connectToDevice(device);
			} catch (error) {
				console.log("Connection error:", error);
			}
			setIsLoading(false);
		}
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
				{/* Header */}
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
						Connect and measure weight
					</Text>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				>
					{/* Connection Status */}
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
							style={[
								styles.statusIndicator,
								{ backgroundColor: isConnected ? "#4CAF50" : "#FF5252" },
							]}
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
								{isConnected ? "Connected to ESP32" : "Disconnected"}
							</Text>
						</View>
					</View>

					{/* Weight Display */}
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
									color: lightMode.white,
								},
							]}
						>
							{value !== "No value" ? `${value} kg` : "-- kg"}
						</Text>
					</View>

					{/* User Selection Card with Integrated Buttons */}
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

						{/* Integrated Action Buttons */}
						<View style={styles.cardButtons}>
							<TouchableOpacity
								style={[
									styles.button,
									styles.connectButton,
									{
										backgroundColor: isConnected
											? lightMode.lightGreen
											: lightMode.lightGreen,
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
									styles.button,
									styles.captureButton,
									{
										backgroundColor:
											scheme === "dark" ? lightMode.black : lightMode.darkGreen,
										opacity: isCapturing || !isConnected ? 0.7 : 1,
										borderColor: lightMode.white,
										borderWidth: 2,
									},
								]}
								onPress={handleCapture}
								disabled={isCapturing || !isConnected}
							>
								{isCapturing ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.buttonText}>Capture Weight</Text>
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
		backgroundColor: "#FF5252",
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

	// iOS specific styles
	iosPicker: {
		paddingHorizontal: 10,
	},
	iosPickerItem: {
		fontSize: 16,
		height: 120, // Taller height for iOS
		textAlign: "left",
	},
	// Android specific styles
	androidPickerItem: {
		fontSize: 16,
		fontFamily: Platform.select({
			android: "Roboto",
			default: undefined,
		}),
	},
	androidPicker: {
		height: 70,
		paddingHorizontal: 10,
	},
});

export default App;
