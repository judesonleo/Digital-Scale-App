import { StyleSheet } from "react-native";
import { Theme } from "./theme";
import { text } from "stream/consumers";
import { title } from "process";

export const useStyles = (theme: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			padding: 20,
			backgroundColor: theme.colors.background,
		},
		headerText: {
			fontSize: 24,
			fontWeight: "bold",
			marginBottom: 20,
			color: theme.colors.text.primary,
		},
		button: {
			backgroundColor: theme.colors.primary.light,
			padding: 10,
			borderRadius: 5,
			marginTop: 20,
		},
		buttonText: {
			color: theme.colors.text.primary,
			fontSize: 16,
			textAlign: "center",
		},
		text: {
			fontSize: 16,
			color: theme.colors.text.primary,
		},
		picker: {
			width: 200,
			height: 50,
			color: theme.colors.text.primary,
		},
		disabledButton: {
			backgroundColor: theme.colors.text.secondary,
		},
		buttonContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginTop: 20,
		},
		title: {
			fontSize: 24,
			fontWeight: "bold",
			color: theme.colors.text.primary,
		},
	});
