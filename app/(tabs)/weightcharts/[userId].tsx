import React, { useState, useEffect, useMemo } from "react";
import {
	View,
	Text,
	Dimensions,
	StyleSheet,
	ActivityIndicator,
	Animated,
	Platform,
	ScrollView,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../../../api";

interface WeightLog {
	_id: string;
	userId: string;
	weight: number;
	notes: string;
	timestamp: string;
	__v: number;
}

interface UserDetails {
	name: string;
	height: number;
	gender: string;
	age: number;
	relationship: string;
}

interface WeightResponse {
	status: string;
	latestWeight: number;
	bmi: string;
	recommendedWeightRange: {
		minWeight: string;
		maxWeight: string;
	};
	weightChangeRequired: string;
	averageWeight10Days: string;
	trend: "up" | "down" | "stable";
	weightColor: string;
	weightLogs: WeightLog[];
}

const screenWidth = Dimensions.get("window").width;

const WeightChartScreen: React.FC = () => {
	const [weightData, setWeightData] = useState<WeightResponse | null>(null);
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { userId } = useLocalSearchParams();

	// Theme colors
	const backgroundColor = useThemeColor({}, "background");
	const textColor = useThemeColor({}, "text");
	const cardColor = useThemeColor({}, "card");
	const primaryColor = useThemeColor({}, "primary");
	const secondaryColor = useThemeColor({}, "secondary");
	const borderColor = useThemeColor({}, "border");
	const dangerColor = useThemeColor({}, "danger");
	const successColor = useThemeColor({}, "success");
	const warningColor = useThemeColor({}, "warning");

	// Animation values
	const fadeAnim = useState(new Animated.Value(0))[0];
	const scaleAnim = useState(new Animated.Value(0))[0];

	useEffect(() => {
		if (!userId) {
			setError("Invalid User ID");
			return;
		}

		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [weightResponse, userResponse] = await Promise.all([
					api.get<WeightResponse>(`/api/weights/${userId}`),
					api.get<UserDetails>(`/api/users/${userId}`),
				]);

				setWeightData(weightResponse.data);
				setUserDetails(userResponse.data);

				Animated.parallel([
					Animated.timing(fadeAnim, {
						toValue: 1,
						duration: 1000,
						useNativeDriver: true,
					}),
					Animated.spring(scaleAnim, {
						toValue: 1,
						tension: 50,
						friction: 7,
						useNativeDriver: true,
					}),
				]).start();
			} catch (error) {
				console.error("Error fetching data:", error);
				setError("Failed to load data");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [userId]);

	const getHealthStatus = (bmi: number) => {
		if (bmi < 18.5) return { text: "Underweight", color: warningColor };
		if (bmi < 24.9) return { text: "Healthy", color: successColor };
		if (bmi < 29.9) return { text: "Overweight", color: warningColor };
		return { text: "Obese", color: dangerColor };
	};

	const formatWithEmoji = (
		type: "weight" | "target" | "trend" | "bmi",
		value: string
	) => {
		const emojis = {
			weight: "⚖️",
			target: "🎯",
			trend: "📈",
			bmi: "📊",
		};
		return `${emojis[type] || ""} ${value}`;
	};

	const chartData = useMemo(() => {
		if (!weightData) return [];

		return weightData.weightLogs
			.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
			)
			.map((log) => ({
				value: log.weight,
				label: format(new Date(log.timestamp), "MMM dd"),
				dataPointText: log.weight.toString(),
				note: log.notes,
			}));
	}, [weightData]);

	if (isLoading) {
		return (
			<View style={[styles.centerContainer, { backgroundColor }]}>
				<ActivityIndicator size="large" color={primaryColor} />
			</View>
		);
	}

	if (error || !weightData) {
		return (
			<View style={[styles.centerContainer, { backgroundColor }]}>
				<Text style={[styles.errorText, { color: textColor }]}>
					{error || "No data available"}
				</Text>
			</View>
		);
	}

	const healthStatus = getHealthStatus(parseFloat(weightData.bmi));

	return (
		<ScrollView
			style={[styles.container, { backgroundColor }]}
			showsVerticalScrollIndicator={false}
		>
			<Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
				<View>
					<Text style={[styles.title, { color: textColor }]}>
						{userDetails?.name || "Weight"} Progress
					</Text>
					<Text style={[styles.subtitle, { color: textColor }]}>
						{formatWithEmoji(
							"weight",
							`Current: ${weightData.latestWeight} kg`
						)}
					</Text>
				</View>
				<MaterialCommunityIcons
					name={
						weightData.trend === "up"
							? "trending-up"
							: weightData.trend === "down"
							? "trending-down"
							: "trending-neutral"
					}
					size={24}
					color={
						weightData.trend === "up"
							? dangerColor
							: weightData.trend === "down"
							? successColor
							: primaryColor
					}
				/>
			</Animated.View>

			<Animated.View
				style={[
					styles.chartContainer,
					{
						backgroundColor: cardColor,
						transform: [{ scale: scaleAnim }],
					},
				]}
			>
				<View style={styles.chartWrapper}>
					<LineChart
						data={chartData}
						width={screenWidth - 60}
						height={250}
						spacing={50}
						color={primaryColor}
						thickness={2}
						startFillColor={`${primaryColor}40`}
						endFillColor={`${primaryColor}00`}
						initialSpacing={20}
						noOfSections={6}
						yAxisColor={borderColor}
						xAxisColor={borderColor}
						yAxisTextStyle={{ color: textColor }}
						xAxisLabelTextStyle={{ color: textColor }}
						rulesColor={`${borderColor}40`}
						rulesType="dashed"
						yAxisTextNumberOfLines={1}
						animateOnDataChange
						animationDuration={1000}
						textFontSize={12}
						hideDataPoints={false}
						dataPointsColor={primaryColor}
						// showTooltipOnDataPoint={true}
						focusEnabled
						showStripOnFocus
						curved
						isAnimated
						showDataPointLabelOnFocus
					/>
				</View>
			</Animated.View>

			<View style={styles.statsSection}>
				<Text style={[styles.sectionTitle, { color: textColor }]}>
					Health Insights
				</Text>

				<View style={styles.statsGrid}>
					<Animated.View
						style={[
							styles.statCard,
							{ backgroundColor: cardColor, opacity: fadeAnim },
						]}
					>
						<Text style={[styles.statLabel, { color: textColor }]}>
							{formatWithEmoji("bmi", "BMI Status")}
						</Text>
						<Text style={[styles.statValue, { color: healthStatus.color }]}>
							{weightData.bmi}
						</Text>
						<Text style={[styles.statSubtext, { color: healthStatus.color }]}>
							{healthStatus.text}
						</Text>
					</Animated.View>

					<Animated.View
						style={[
							styles.statCard,
							{ backgroundColor: cardColor, opacity: fadeAnim },
						]}
					>
						<Text style={[styles.statLabel, { color: textColor }]}>
							{formatWithEmoji("target", "Target Range")}
						</Text>
						<Text style={[styles.statValue, { color: successColor }]}>
							{weightData.recommendedWeightRange.minWeight} -{" "}
							{weightData.recommendedWeightRange.maxWeight}
						</Text>
						<Text style={[styles.statSubtext, { color: textColor }]}>kg</Text>
					</Animated.View>

					<Animated.View
						style={[
							styles.statCard,
							{ backgroundColor: cardColor, opacity: fadeAnim },
						]}
					>
						<Text style={[styles.statLabel, { color: textColor }]}>
							{formatWithEmoji("trend", "10-Day Trend")}
						</Text>
						<Text style={[styles.statValue, { color: primaryColor }]}>
							{weightData.averageWeight10Days}
						</Text>
						<Text style={[styles.statSubtext, { color: textColor }]}>
							kg avg
						</Text>
					</Animated.View>
				</View>

				<Animated.View
					style={[
						styles.goalCard,
						{
							backgroundColor: cardColor,
							opacity: fadeAnim,
							borderLeftWidth: 4,
							marginBottom: 120,
							borderLeftColor:
								weightData.weightColor === "red" ? dangerColor : successColor,
						},
					]}
				>
					<Text style={[styles.goalLabel, { color: textColor }]}>
						Weight Goal Status
					</Text>
					<Text
						style={[
							styles.goalValue,
							{
								color:
									weightData.weightColor === "red" ? dangerColor : successColor,
							},
						]}
					>
						{weightData.weightChangeRequired}
					</Text>
					<Text style={[styles.goalSubtext, { color: textColor }]}>
						{weightData.trend === "down"
							? "Keep going! You're on track!"
							: "Stay motivated! You can do it!"}
					</Text>
				</Animated.View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 20,
		marginTop: Platform.OS === "ios" ? 40 : 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		opacity: 0.8,
	},
	chartContainer: {
		padding: 15,
		borderRadius: 16,
		marginBottom: 20,
		overflow: "hidden",
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
	chartWrapper: {
		marginHorizontal: -10,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 15,
	},
	statsSection: {
		marginTop: 20,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 10,
		marginBottom: 15,
	},
	statCard: {
		width: "31%",
		padding: 15,
		borderRadius: 12,
		alignItems: "center",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	goalCard: {
		padding: 20,
		borderRadius: 12,
		marginTop: 10,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	statLabel: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 8,
		textAlign: "center",
	},
	statValue: {
		fontSize: 18,
		fontWeight: "700",
		textAlign: "center",
	},
	statSubtext: {
		fontSize: 12,
		marginTop: 4,
		opacity: 0.8,
		textAlign: "center",
	},
	goalLabel: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	goalValue: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 8,
	},
	goalSubtext: {
		fontSize: 14,
		opacity: 0.8,
	},
	errorText: {
		fontSize: 16,
		textAlign: "center",
		marginHorizontal: 20,
	},
});

export default WeightChartScreen;
