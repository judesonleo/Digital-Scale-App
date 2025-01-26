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

const screenWidth = Dimensions.get("window").width;

const customBackground = {
	color: "#00000", // Light gray background
	width: screenWidth, // Fill the entire width
	height: 250, // Set custom height for the background
	horizontalShift: 10, // Shift the background horizontally
	verticalShift: 20, // Shift the background vertically
};

enum CurveType {
	CUBIC,
	QUADRATIC,
}

const lineConfig = {
	initialSpacing: 10,
	curved: true,
	curvature: 0.5,
	curveType: CurveType.CUBIC,
	isAnimated: true,
	delay: 300,
	thickness: 2,
	color: "blue",
	hideDataPoints: false,
	dataPointsShape: "circular",
	dataPointsWidth: 6,
	dataPointsHeight: 6,
	dataPointsColor: "red",
	dataPointsRadius: 3,
	textColor: "black",
	textFontSize: 12,
	textShiftX: 5,
	textShiftY: -10,
	startIndex: 0,
	endIndex: 5,
	showArrow: true,
	arrowConfig: {
		length: 15,
		width: 8,
		strokeWidth: 2,
		strokeColor: "blue",
		fillColor: "transparent",
		showArrowBase: true,
	},
	isSecondary: false,
	focusEnabled: true,
	focusedDataPointColor: "orange",
	focusedDataPointRadius: 4,
};

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
				width={screenWidth} // Adjust the width here to fit the labels
				height={300}
				isAnimated
				spacing={50} // Increased spacing for better label visibility
				// showValuesAsTopLabel={false}
				parentWidth={screenWidth}
				maxValue={Math.max(...weightLogs.map((log) => log.weight))}
				noOfSections={5}
				// lineConfig={lineConfig}
				customBackground={customBackground}
				hideRules={true}
				// cappedBars
				onPress={(item: { value: number; label: string }, index: number) =>
					console.log("Line point pressed", item, index)
				}
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
		backgroundColor: "#f9f9f9",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f9f9f9",
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 24,
		textAlign: "center",
		color: "#333",
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 30,
	},
	statBox: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		elevation: 5,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 6,
		width: "28%",
		alignItems: "center",
	},
	statLabel: {
		color: "#555",
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 10,
		textAlign: "center",
	},
	statValue: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
	},
	errorText: {
		color: "#FF5733",
		textAlign: "center",
		fontSize: 18,
		marginHorizontal: 20,
	},
	noDataText: {
		color: "#888",
		textAlign: "center",
		fontSize: 18,
		marginHorizontal: 20,
	},
	tooltip: {
		position: "absolute",
		backgroundColor: "#000",
		padding: 10,
		borderRadius: 8,
	},
	tooltipText: {
		color: "#fff",
		fontSize: 14,
	},
});

export default WeightChartScreen;
