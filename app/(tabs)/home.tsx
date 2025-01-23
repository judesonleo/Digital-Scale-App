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
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer"; // Import Buffer
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api";
import { getAuthToken } from "@/utils/authStorage";

const manager = new BleManager();
const ESP32_NAME = "ESP32_TEST";

// UUIDs for your ESP32
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
interface FamilyMember {
	userId: {
		_id: string;
		name: string;
	};
	_id: string;
}
interface MainUser {
	_id: string;
	name: string;
}

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
				notes: "", // Optional: add notes if needed
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
	useEffect(() => {
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
				// Fetch family members
				const response = await api.get(`/api/family/${authInfo.userId}`);
				setFamilyMembers(response.data);
			} catch (error) {
				console.error("Error fetching family members:", error);
				Alert.alert("Could not fetch family members");
			}
		};

		fetchFamilyAndUser();
	}, []);

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: scheme === "dark" ? "#121212" : "#f0f4f8" },
			]}
		>
			{/* Header */}
			<Text
				style={[
					styles.headerText,
					{ color: scheme === "dark" ? "#fff" : "#333" },
				]}
			>
				Digital Scale
			</Text>

			{/* Status Card */}
			<View
				style={[
					styles.statusCard,
					{ backgroundColor: scheme === "dark" ? "#333" : "#fff" },
				]}
			>
				<Text
					style={[
						styles.statusText,
						{ color: scheme === "dark" ? "#fff" : "#333" },
					]}
				>
					Status: {isConnected ? "Connected" : "Disconnected"}
				</Text>
				<Text
					style={[
						styles.valueText,
						{ color: scheme === "dark" ? "#ddd" : "#555" },
					]}
				>
					Value: {value}
				</Text>
			</View>

			{/* User Picker */}
			<View
				style={[
					styles.card,
					{ backgroundColor: scheme === "dark" ? "#333" : "#fff" },
				]}
			>
				<Text
					style={[
						styles.cardTitle,
						{ color: scheme === "dark" ? "#fff" : "#333" },
					]}
				>
					Select User
				</Text>
				<Picker
					selectedValue={userId}
					onValueChange={(itemValue: number | null) => setUserId(itemValue)}
					style={[
						styles.picker,
						{ backgroundColor: scheme === "dark" ? "#555" : "#f9f9f9" },
					]}
				>
					<Picker.Item label="Select User" value={null} />
					{mainUser && (
						<Picker.Item label={`${mainUser.name}`} value={mainUser._id} />
					)}
					{familyMembers.map((member) => (
						<Picker.Item
							key={member.userId._id}
							label={member.userId.name}
							value={member.userId._id}
						/>
					))}
				</Picker>
			</View>

			{/* Connect/Disconnect Button */}
			<TouchableOpacity
				style={[
					styles.button,
					{
						backgroundColor: isConnected
							? scheme === "dark"
								? "#e63946"
								: "#ff4c4c"
							: scheme === "dark"
							? "#0077b6"
							: "#0077b6",
					},
				]}
				onPress={isConnected ? disconnect : scanAndConnect}
				disabled={isLoading}
			>
				<Text style={styles.buttonText}>
					{isConnected ? "Disconnect" : "Connect"}
				</Text>
			</TouchableOpacity>
			{/* Capture Button */}
			<Button title="Capture" onPress={handleCapture} disabled={isCapturing} />
			<Toast />
			{/* Loading Indicator */}
			{isLoading && (
				<ActivityIndicator
					size="large"
					color={scheme === "dark" ? "#0077b6" : "#0077b6"}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	statusCard: {
		padding: 20,
		borderRadius: 10,
		marginBottom: 20,
		width: "90%",
		elevation: 5,
		alignItems: "center",
	},
	statusText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	valueText: {
		fontSize: 16,
	},
	card: {
		padding: 20,
		borderRadius: 10,
		marginBottom: 20,
		width: "90%",
		elevation: 5,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	picker: {
		width: "100%",
		borderRadius: 5,
	},
	button: {
		padding: 15,
		margin: 10,
		borderRadius: 10,
		width: "90%",
		alignItems: "center",
	},
	buttonText: {
		fontSize: 18,
		color: "#fff",
		fontWeight: "bold",
	},
});
export default App;
