import React, { useState } from "react";
import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	PermissionsAndroid,
	Platform,
} from "react-native";
import { BleManager } from "react-native-ble-plx";

const manager = new BleManager();
const ESP32_NAME = "ESP32_TEST";

// Same UUIDs as in your ESP32 code
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export default function App() {
	const [value, setValue] = useState("No value");
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const scanAndConnect = async () => {
		setIsLoading(true);

		try {
			// Request permission first
			if (Platform.OS === "android") {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
					{
						title: "Bluetooth Permission",
						message: "This app needs access to Bluetooth",
						buttonNeutral: "Ask Me Later",
						buttonNegative: "Cancel",
						buttonPositive: "OK",
					}
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					Alert.alert("Bluetooth permission is required");
					setIsLoading(false);
					return;
				}
			}

			// Start scanning
			manager.startDeviceScan(null, null, async (error, device) => {
				if (error) {
					console.log("Scanning error:", error);
					setIsLoading(false);
					Alert.alert("Error scanning for devices");
					return;
				}

				// Check if this is our ESP32 device
				if (device?.name === ESP32_NAME) {
					manager.stopDeviceScan();

					try {
						// Connect to device
						const connectedDevice = await device.connect();
						setIsConnected(true);

						// Discover services and characteristics
						const discoveredDevice =
							await connectedDevice.discoverAllServicesAndCharacteristics();

						// Set up notification/indication handling
						discoveredDevice.monitorCharacteristicForService(
							SERVICE_UUID,
							CHARACTERISTIC_UUID,
							(error, characteristic) => {
								if (error) {
									console.log("Monitoring error:", error);
									return;
								}

								if (characteristic?.value) {
									// Decode base64 value if needed
									const decodedValue = Buffer.from(
										characteristic.value,
										"base64"
									).toString();
									setValue(decodedValue);
								}
							}
						);
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

	const disconnect = async () => {
		try {
			await manager.cancelDeviceConnection(ESP32_NAME);
			setIsConnected(false);
		} catch (error) {
			console.log("Disconnection error:", error);
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
			{isLoading && <Text>Scanning...</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	valueText: {
		fontSize: 18,
		marginBottom: 20,
	},
});
