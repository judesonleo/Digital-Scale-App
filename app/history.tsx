import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	useColorScheme,
	Platform,
} from "react-native";
import api from "@/api";
import { getAuthToken } from "@/utils/authStorage";
import { OfflineStorage } from "@/utils/offlineStorage";
import Toast from "react-native-toast-message";
import { COLORS, FONT_SIZES } from "@/styles/constants";
import WeightChart from "@/components/WeightChart";
import { format } from "date-fns";

interface WeightLog {
	weight: number;
	timestamp: string;
	userId: string;
	notes: string;
}

const HistoryScreen = () => {
	const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTimeRange, setSelectedTimeRange] = useState<
		"week" | "month" | "year"
	>("week");
	const scheme = useColorScheme();
	const isDark = scheme === "dark";

	useEffect(() => {
		loadWeightHistory();
	}, [selectedTimeRange]);

	const loadWeightHistory = async () => {
		try {
			// For web demo, use mock data
			const mockData: WeightLog[] = [
				{ weight: 70.5, timestamp: "2024-03-20", userId: "1", notes: "" },
				{ weight: 70.2, timestamp: "2024-03-21", userId: "1", notes: "" },
				{ weight: 70.0, timestamp: "2024-03-22", userId: "1", notes: "" },
				{ weight: 69.8, timestamp: "2024-03-23", userId: "1", notes: "" },
				{ weight: 69.5, timestamp: "2024-03-24", userId: "1", notes: "" },
				{ weight: 69.3, timestamp: "2024-03-25", userId: "1", notes: "" },
				{ weight: 69.0, timestamp: "2024-03-26", userId: "1", notes: "" },
			];
			setWeightLogs(mockData);
		} catch (error) {
			console.error("Error loading weight history:", error);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Error",
				text2: "Failed to load weight history",
				visibilityTime: 2000,
			});
		} finally {
			setLoading(false);
		}
	};

	const getChartData = () => {
		const sortedLogs = [...weightLogs].sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
		);

		return {
			labels: sortedLogs.map((log) => format(new Date(log.timestamp), "MMM d")),
			datasets: [
				{
					data: sortedLogs.map((log) => log.weight),
				},
			],
		};
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	if (weightLogs.length === 0) {
		return (
			<View style={[styles.container, styles.centered]}>
				<Text style={styles.noDataText}>No weight logs available</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Weight History</Text>
				<View style={styles.timeRangeSelector}>
					{(["week", "month", "year"] as const).map((range) => (
						<Text
							key={range}
							style={[
								styles.timeRangeButton,
								selectedTimeRange === range && styles.selectedTimeRange,
							]}
							onPress={() => setSelectedTimeRange(range)}
						>
							{range.charAt(0).toUpperCase() + range.slice(1)}
						</Text>
					))}
				</View>
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard },
				]}
			>
				<WeightChart data={getChartData()} isDark={isDark} />
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard },
				]}
			>
				<Text style={styles.cardTitle}>Recent Measurements</Text>
				{weightLogs.slice(-5).map((log, index) => (
					<View key={index} style={styles.logItem}>
						<Text style={styles.logWeight}>{log.weight} kg</Text>
						<Text style={styles.logDate}>
							{format(new Date(log.timestamp), "MMM d, yyyy")}
						</Text>
					</View>
				))}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		marginBottom: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	card: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
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
			web: {
				boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
			},
		}),
	},
	timeRangeSelector: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 16,
	},
	timeRangeButton: {
		padding: 8,
		borderRadius: 8,
		fontSize: FONT_SIZES.middle,
	},
	selectedTimeRange: {
		backgroundColor: COLORS.primary + "40",
		color: COLORS.primary,
	},
	noDataText: {
		fontSize: FONT_SIZES.middle,
		color: COLORS.gray,
	},
	cardTitle: {
		fontSize: FONT_SIZES.middle,
		fontWeight: "600",
		marginBottom: 16,
	},
	logItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border + "20",
	},
	logWeight: {
		fontSize: FONT_SIZES.middle,
		fontWeight: "500",
	},
	logDate: {
		fontSize: FONT_SIZES.small,
		color: COLORS.gray,
	},
});

export default HistoryScreen;
