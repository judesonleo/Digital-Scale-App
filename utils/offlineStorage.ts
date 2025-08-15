import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
	WEIGHT_LOGS: "weight_logs",
	LAST_SYNC: "last_sync",
	PENDING_SYNC: "pending_sync",
	USER_DATA: "user_data",
	DEVICE_INFO: "device_info",
};

interface WeightLog {
	userId: string;
	weight: number;
	notes: string;
	timestamp: string;
	syncStatus: "pending" | "synced";
}

interface DeviceInfo {
	lastConnectedDevice: string | null;
	lastConnectionTime: string | null;
	batteryLevel: number | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryOperation = async <T>(
	operation: () => Promise<T>,
	retries = MAX_RETRIES
): Promise<T> => {
	try {
		return await operation();
	} catch (error) {
		if (retries > 0) {
			await sleep(RETRY_DELAY);
			return retryOperation(operation, retries - 1);
		}
		throw error;
	}
};

export const OfflineStorage = {
	// Weight Logs
	async saveWeightLog(log: WeightLog): Promise<void> {
		return retryOperation(async () => {
			try {
				const existingLogs = await this.getWeightLogs();
				existingLogs.push({ ...log, syncStatus: "pending" });
				await AsyncStorage.setItem(
					STORAGE_KEYS.WEIGHT_LOGS,
					JSON.stringify(existingLogs)
				);
			} catch (error) {
				console.error("Error saving weight log:", error);
				throw error;
			}
		});
	},

	async getWeightLogs(): Promise<WeightLog[]> {
		return retryOperation(async () => {
			try {
				const logs = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
				return logs ? JSON.parse(logs) : [];
			} catch (error) {
				console.error("Error getting weight logs:", error);
				return [];
			}
		});
	},

	async markLogAsSynced(timestamp: string): Promise<void> {
		return retryOperation(async () => {
			try {
				const logs = await this.getWeightLogs();
				const updatedLogs = logs.map((log) =>
					log.timestamp === timestamp ? { ...log, syncStatus: "synced" } : log
				);
				await AsyncStorage.setItem(
					STORAGE_KEYS.WEIGHT_LOGS,
					JSON.stringify(updatedLogs)
				);
			} catch (error) {
				console.error("Error marking log as synced:", error);
				throw error;
			}
		});
	},

	// Device Info
	async saveDeviceInfo(info: DeviceInfo): Promise<void> {
		try {
			await AsyncStorage.setItem(
				STORAGE_KEYS.DEVICE_INFO,
				JSON.stringify(info)
			);
		} catch (error) {
			console.error("Error saving device info:", error);
			throw error;
		}
	},

	async getDeviceInfo(): Promise<DeviceInfo | null> {
		try {
			const info = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_INFO);
			return info ? JSON.parse(info) : null;
		} catch (error) {
			console.error("Error getting device info:", error);
			return null;
		}
	},

	// Sync Status
	async getLastSyncTime(): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
		} catch (error) {
			console.error("Error getting last sync time:", error);
			return null;
		}
	},

	async updateLastSyncTime(): Promise<void> {
		try {
			await AsyncStorage.setItem(
				STORAGE_KEYS.LAST_SYNC,
				new Date().toISOString()
			);
		} catch (error) {
			console.error("Error updating last sync time:", error);
			throw error;
		}
	},

	// User Data
	async saveUserData(data: any): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
		} catch (error) {
			console.error("Error saving user data:", error);
			throw error;
		}
	},

	async getUserData(): Promise<any | null> {
		try {
			const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error("Error getting user data:", error);
			return null;
		}
	},

	// Clear all data
	async clearAllData(): Promise<void> {
		try {
			await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
		} catch (error) {
			console.error("Error clearing data:", error);
			throw error;
		}
	},

	// Get pending sync items
	async getPendingSyncItems(): Promise<WeightLog[]> {
		try {
			const logs = await this.getWeightLogs();
			return logs.filter((log) => log.syncStatus === "pending");
		} catch (error) {
			console.error("Error getting pending sync items:", error);
			return [];
		}
	},

	// Add new methods for data validation and cleanup
	async validateAndCleanupData(): Promise<void> {
		try {
			const logs = await this.getWeightLogs();
			const validLogs = logs.filter(
				(log) =>
					log.userId &&
					typeof log.weight === "number" &&
					log.timestamp &&
					["pending", "synced"].includes(log.syncStatus)
			);

			if (validLogs.length !== logs.length) {
				await AsyncStorage.setItem(
					STORAGE_KEYS.WEIGHT_LOGS,
					JSON.stringify(validLogs)
				);
				console.log("Cleaned up invalid weight logs");
			}
		} catch (error) {
			console.error("Error validating and cleaning up data:", error);
		}
	},

	async getStorageSize(): Promise<number> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			let totalSize = 0;
			for (const key of keys) {
				const value = await AsyncStorage.getItem(key);
				if (value) {
					totalSize += value.length;
				}
			}
			return totalSize;
		} catch (error) {
			console.error("Error getting storage size:", error);
			return 0;
		}
	},
};
