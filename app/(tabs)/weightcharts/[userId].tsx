import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Dimensions,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { format } from "date-fns";
import api from "../../../api";
import { useLocalSearchParams } from "expo-router";

interface WeightLog {
	timestamp: string;
	weight: number;
	formattedDate?: string;
}

interface UserData {
	name: string;
}

const WeightChartScreen: React.FC = () => {
	const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { userId } = useLocalSearchParams();

	useEffect(() => {
		if (!userId) {
			setError("Invalid User ID");
			return;
		}

		const fetchWeightData = async () => {
			try {
				setIsLoading(true);
				const logsResponse = await api.get<WeightLog[]>(
					`/api/weights/${userId}`
				);
				const sortedLogs = logsResponse.data
					.sort(
						(a, b) =>
							new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
					)
					.map((log) => ({
						...log,
						formattedDate: format(new Date(log.timestamp), "MMM dd"),
					}));

				setWeightLogs(sortedLogs);

				const userResponse = await api.get<UserData>(`/api/users/${userId}`);
				setUserData(userResponse.data);
			} catch (error) {
				console.error("Error fetching weight data:", error);
				setError("Failed to load weight data");
			} finally {
				setIsLoading(false);
			}
		};

		fetchWeightData();
	}, [userId]);

	const screenWidth = Dimensions.get("window").width;

	if (isLoading) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator size="large" color="#4A90E2" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centerContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	if (weightLogs.length === 0) {
		return (
			<View style={styles.centerContainer}>
				<Text style={styles.noDataText}>No weight logs available</Text>
			</View>
		);
	}

	const stats = {
		startWeight: weightLogs[0].weight,
		currentWeight: weightLogs[weightLogs.length - 1].weight,
		weightChange:
			weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight,
	};

	const chartData = weightLogs.map((log) => ({
		value: log.weight,
		label: log.formattedDate,
	}));

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{userData?.name}'s Weight Chart</Text>
			<LineChart
				data={chartData}
				width={screenWidth - 32}
				height={300}
				isAnimated
				color="#4A90E2"
				startFillColor="#D0E4FD"
				endFillColor="#F3F8FE"
				yAxisLabelTexts={[""]}
				xAxisLabelTextStyle={{ color: "#888", fontSize: 12 }}
				yAxisTextStyle={{ color: "#888", fontSize: 12 }}
				initialSpacing={30}
				showVerticalLines={false}
				noOfSections={4}
				rulesColor="#ddd"
				rulesType="dashed"
				areaChart
			/>
			<View style={styles.statsContainer}>
				<View style={styles.statBox}>
					<Text style={styles.statLabel}>Start Weight</Text>
					<Text style={styles.statValue}>
						{stats.startWeight.toFixed(1)} kg
					</Text>
				</View>
				<View style={styles.statBox}>
					<Text style={styles.statLabel}>Current Weight</Text>
					<Text style={styles.statValue}>
						{stats.currentWeight.toFixed(1)} kg
					</Text>
				</View>
				<View style={styles.statBox}>
					<Text style={styles.statLabel}>Change</Text>
					<Text
						style={[
							styles.statValue,
							{ color: stats.weightChange > 0 ? "red" : "green" },
						]}
					>
						{stats.weightChange.toFixed(1)} kg
					</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		paddingTop: 40,
		backgroundColor: "#f8f9fa",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f8f9fa",
	},
	title: {
		fontSize: 22,
		fontWeight: "600",
		marginBottom: 20,
		textAlign: "center",
		color: "#333",
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
	},
	statBox: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 16,
		elevation: 3,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 3 },
		shadowRadius: 5,
		width: "30%",
		alignItems: "center",
	},
	statLabel: {
		color: "#555",
		fontSize: 14,
		marginBottom: 8,
		textAlign: "center",
	},
	statValue: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
	},
	errorText: {
		color: "red",
		textAlign: "center",
		fontSize: 16,
		marginHorizontal: 16,
	},
	noDataText: {
		color: "#888",
		textAlign: "center",
		fontSize: 16,
		marginHorizontal: 16,
	},
});

export default WeightChartScreen;
