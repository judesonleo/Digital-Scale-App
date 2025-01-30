import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const theme = {
	colors: {
		primary: "#6854D9",
		backgroundLight: "#F5F7FA",
		backgroundDark: "#0A0A0A",
		cardLight: "#FFFFFF",
		cardDark: "#1E2732",
		textPrimaryLight: "#1A1A1A",
		textPrimaryDark: "#FFFFFF",
		textSecondary: "#666666",
		buttonText: "#FFFFFF",
		error: "#FF4444",
		success: "#4CAF50",
		border: "#E1E1E1",
		inputBackground: "#F8F9FA",
	},

	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		xxl: 48,
	},

	borderRadius: {
		sm: 8,
		md: 16,
		lg: 24,
		circle: 9999,
	},

	typography: {
		title: {
			fontSize: 28,
			fontWeight: "700",
			letterSpacing: 0.34,
			lineHeight: 34,
		},
		cardTitle: {
			fontSize: 17,
			fontWeight: "600",
			letterSpacing: 0.15,
			lineHeight: 22,
		},
		body: {
			fontSize: 14,
			fontWeight: "400",
			letterSpacing: 0.25,
			lineHeight: 20,
		},
		button: {
			fontSize: 14,
			fontWeight: "600",
			letterSpacing: 1.25,
			lineHeight: 16,
		},
		caption: {
			fontSize: 12,
			fontWeight: "normal" as "normal",
			letterSpacing: 0.4,
			lineHeight: 16,
		},
	},

	shadows: {
		ios: {
			card: {
				shadowColor: "#000",
				shadowOffset: {
					width: 0,
					height: 2,
				},
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
		},
		android: {
			card: {
				shadowColor: "#000",
				shadowOffset: {
					width: 0,
					height: 2,
				},
				shadowOpacity: 0.1,
				shadowRadius: 8,
				elevation: 3,
			},
		},
	},
};

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.backgroundLight,
	},
	scrollContent: {
		padding: theme.spacing.md,
	},
	profileSection: {
		alignItems: "center",
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.cardLight,
		borderRadius: theme.borderRadius.md,
		marginBottom: theme.spacing.md,
		width: "100%",
		...Platform.select({
			ios: theme.shadows.ios.card,
			android: theme.shadows.android.card,
		}),
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: theme.borderRadius.circle,
		marginBottom: theme.spacing.md,
	},
	editProfileButton: {
		position: "absolute",
		right: theme.spacing.md,
		top: theme.spacing.md,
		padding: theme.spacing.sm,
		zIndex: 1,
	},
	userName: {
		...theme.typography.title,
		color: theme.colors.textPrimaryLight,
		marginBottom: theme.spacing.xs,
		textAlign: "center",
	},
	userHandle: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.md,
	},
	section: {
		backgroundColor: theme.colors.cardLight,
		borderRadius: theme.borderRadius.md,
		marginBottom: theme.spacing.md,
		padding: theme.spacing.lg,
		width: "100%",
		...Platform.select({
			ios: theme.shadows.ios.card,
			android: theme.shadows.android.card,
		}),
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	// sectionTitle: {
	// 	...theme.typography.cardTitle,
	// 	color: theme.colors.textPrimaryLight,
	// },
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: theme.spacing.sm,
	},
	rowLabel: {
		...theme.typography.body,
		color: theme.colors.textPrimaryLight,
		flex: 1,
	},
	rowValue: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
		marginLeft: theme.spacing.sm,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: theme.colors.border,
		marginVertical: theme.spacing.sm,
		width: "100%",
	},
	button: {
		backgroundColor: theme.colors.primary,
		padding: theme.spacing.md,
		borderRadius: theme.borderRadius.sm,
		width: "100%",
		alignItems: "center",
		marginVertical: theme.spacing.sm,
	},
	// buttonText: {
	// 	...theme.typography.button,
	// 	color: theme.colors.buttonText,
	// },
	dangerButton: {
		backgroundColor: theme.colors.error,
	},
	input: {
		backgroundColor: theme.colors.inputBackground,
		borderRadius: theme.borderRadius.sm,
		padding: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		width: "100%",
		marginBottom: theme.spacing.md,
		...theme.typography.body,
	},
	switchContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: theme.spacing.sm,
	},
	icon: {
		marginRight: theme.spacing.sm,
	},
	badge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.borderRadius.sm,
		backgroundColor: theme.colors.primary,
	},
	badgeText: {
		...theme.typography.caption,
		color: theme.colors.buttonText,
	},
	errorText: {
		...theme.typography.caption,
		color: theme.colors.error,
		marginTop: theme.spacing.xs,
	},
	successText: {
		...theme.typography.caption,
		color: theme.colors.success,
		marginTop: theme.spacing.xs,
	},
});

// Dark mode styles
export const darkStyles = StyleSheet.create({
	container: {
		backgroundColor: theme.colors.backgroundDark,
	},
	profileSection: {
		backgroundColor: theme.colors.cardDark,
	},
	section: {
		backgroundColor: theme.colors.cardDark,
	},
	userName: {
		color: theme.colors.textPrimaryDark,
	},
	sectionTitle: {
		color: theme.colors.textPrimaryDark,
	},
	rowLabel: {
		color: theme.colors.textPrimaryDark,
	},
	input: {
		backgroundColor: theme.colors.cardDark,
		borderColor: theme.colors.textSecondary,
		color: theme.colors.textPrimaryDark,
	},
});
