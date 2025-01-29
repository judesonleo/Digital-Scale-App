import React, { useEffect, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	Animated,
	useColorScheme,
} from "react-native";
import { Link } from "expo-router";

// Enhanced design tokens
const DESIGN = {
	colors: {
		primary: "#406F62",
		secondary: "#304C37",
		background: {
			light: "#F5F7FA",
			dark: "#151719",
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
		card: {
			light: {
				background: "#FFFFFF",
				border: "#E2E8F0",
				shadow: "rgba(0, 0, 0, 0.1)",
			},
			dark: {
				background: "#1E2124",
				border: "#2D3748",
				shadow: "rgba(0, 0, 0, 0.3)",
			},
		},
		accent: {
			light: "#406F62",
			dark: "#4A9182",
		},
		stats: {
			light: {
				background: "rgba(64, 111, 98, 0.08)",
				border: "rgba(64, 111, 98, 0.12)",
			},
			dark: {
				background: "rgba(74, 145, 130, 0.12)",
				border: "rgba(74, 145, 130, 0.16)",
			},
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
		xl: 24,
	},
	typography: {
		title: 24,
		subtitle: 18,
		body: 14,
		caption: 12,
	},
	animation: {
		duration: 300,
		scale: 0.98,
	},
};

// Types remain the same
interface User {
	id: string;
	name: string;
	username: string;
	relationship?: string;
	gender?: string;
	height?: number;
	latestweight?: number;
	dob?: string;
	age?: number;
}

interface UserCardProps {
	user: User;
	index: number;
}

const UserCard: React.FC<UserCardProps> = ({ user, index }) => {
	const scheme = useColorScheme();
	const isDark = scheme === "dark";
	const colors = isDark ? DESIGN.colors.text.dark : DESIGN.colors.text.light;
	const cardColors = isDark
		? DESIGN.colors.card.dark
		: DESIGN.colors.card.light;
	const statsColors = isDark
		? DESIGN.colors.stats.dark
		: DESIGN.colors.stats.light;

	const scaleAnim = useRef(new Animated.Value(1)).current;
	const translateYAnim = useRef(new Animated.Value(50)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(translateYAnim, {
				toValue: 0,
				duration: DESIGN.animation.duration,
				delay: index * 100,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 1,
				duration: DESIGN.animation.duration,
				delay: index * 100,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const handlePressIn = () => {
		Animated.spring(scaleAnim, {
			toValue: 0.98,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	};

	const renderMetric = (value: number | undefined, unit: string) => {
		if (!value) return null;
		return (
			<Text style={[styles.detailText, { color: colors.primary }]}>
				<Text style={styles.labelText}>{value}</Text>
				<Text style={[styles.unitText, { color: colors.tertiary }]}>
					{" "}
					{unit}
				</Text>
			</Text>
		);
	};

	return (
		<Animated.View
			style={[
				styles.cardContainer,
				{
					transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
					opacity: opacityAnim,
					backgroundColor: cardColors.background,
					borderColor: cardColors.border,
				},
			]}
		>
			<TouchableOpacity
				style={styles.cardContent}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				activeOpacity={1}
			>
				<View style={styles.header}>
					<Image
						source={{
							uri: `https://ui-avatars.com/api/?name=${user.name}&background=406F62&color=FBFCFA`,
						}}
						style={styles.avatar}
					/>
					<View style={styles.headerText}>
						<Text style={[styles.name, { color: colors.primary }]}>
							{user.name}
						</Text>
						<Text style={[styles.username, { color: colors.secondary }]}>
							@{user.username}
						</Text>
					</View>
				</View>

				<View
					style={[
						styles.detailsGrid,
						{
							backgroundColor: statsColors.background,
							borderColor: statsColors.border,
						},
					]}
				>
					<View style={styles.detailColumn}>
						{user.relationship && (
							<Text style={[styles.detailText, { color: colors.primary }]}>
								{user.relationship}
							</Text>
						)}
						{renderMetric(user.age, "years")}
					</View>
					<View
						style={[styles.separator, { backgroundColor: statsColors.border }]}
					/>
					<View style={styles.detailColumn}>
						{renderMetric(user.height, "cm")}
						{user.latestweight &&
							renderMetric(parseFloat(user.latestweight.toString()), "kg")}
					</View>
					<View
						style={[styles.separator, { backgroundColor: statsColors.border }]}
					/>
					<View style={styles.detailColumn}>
						{user.gender && (
							<Text style={[styles.detailText, { color: colors.primary }]}>
								{user.gender}
							</Text>
						)}
					</View>
				</View>

				<Link
					href={{
						pathname: `/weightcharts/[userId]`,
						params: { userId: user.id },
					}}
					style={[
						styles.link,
						{
							backgroundColor: isDark
								? DESIGN.colors.accent.dark
								: DESIGN.colors.accent.light,
						},
					]}
				>
					<View style={styles.linkContainer}>
						<Text style={styles.linkText}>View Chart →</Text>
					</View>
				</Link>
			</TouchableOpacity>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		height: 200,
		marginBottom: DESIGN.spacing.lg,
		borderRadius: DESIGN.borderRadius.xl,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	cardContent: {
		flex: 1,
		padding: DESIGN.spacing.lg,
		justifyContent: "space-between",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: DESIGN.spacing.md,
	},
	headerText: {
		flex: 1,
		marginLeft: DESIGN.spacing.md,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: DESIGN.borderRadius.lg,
	},
	name: {
		fontSize: DESIGN.typography.subtitle,
		fontWeight: "700",
		marginBottom: 4,
	},
	username: {
		fontSize: DESIGN.typography.body,
		fontWeight: "500",
	},
	detailsGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: DESIGN.spacing.md,
		paddingHorizontal: DESIGN.spacing.md,
		borderRadius: DESIGN.borderRadius.md,
		borderWidth: 1,
		marginVertical: DESIGN.spacing.sm,
	},
	detailColumn: {
		flex: 1,
		alignItems: "center",
	},
	separator: {
		width: 1,
		height: "100%",
	},
	detailText: {
		fontSize: DESIGN.typography.body,
		marginBottom: 4,
	},
	labelText: {
		fontWeight: "600",
	},
	unitText: {
		fontSize: DESIGN.typography.caption,
	},
	link: {
		alignSelf: "flex-start",
		paddingVertical: DESIGN.spacing.sm,
		paddingHorizontal: DESIGN.spacing.md,
		borderRadius: DESIGN.borderRadius.md,
	},
	linkContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	linkText: {
		fontSize: DESIGN.typography.body,
		fontWeight: "600",
		color: "#FFFFFF",
	},
});

export default UserCard;
