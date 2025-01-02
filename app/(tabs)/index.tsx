import React, { useState } from "react";
import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	PermissionsAndroid,
	Platform,
	ActivityIndicator,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer"; // Import Buffer

const manager = new BleManager();
const ESP32_NAME = "ESP32_TEST";

// UUIDs for your ESP32
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export default function App() {
	const [value, setValue] = useState("No value");
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [device, setDevice] = useState<Device | null>(null);

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

			// Start scanning
			manager.startDeviceScan(null, null, async (error, device) => {
				if (error) {
					console.log("Scanning error:", error);
					setIsLoading(false);
					Alert.alert("Error scanning for devices");
					return;
				}

				if (device?.name === ESP32_NAME) {
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

	return (
		<View style={styles.container}>
			<Text style={styles.valueText}>Value: {value}</Text>
			<Button
				title={isConnected ? "Disconnect" : "Connect"}
				onPress={isConnected ? disconnect : scanAndConnect}
				disabled={isLoading}
			/>
			{isLoading && <ActivityIndicator size="large" color="#0000ff" />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	valueText: {
		fontSize: 18,
		marginBottom: 20,
		textAlign: "center",
		color: "#333",
	},
});
