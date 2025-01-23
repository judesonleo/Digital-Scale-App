// styles.ts
import { StyleSheet, Appearance } from "react-native";

const colorScheme = Appearance.getColorScheme();

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
	},
	text: {
		fontSize: 20,
		color: colorScheme === "dark" ? "#fff" : "#333",
	},
	button: {
		padding: 10,
		backgroundColor: colorScheme === "dark" ? "#555" : "#ddd",
		borderRadius: 5,
	},
	buttonText: {
		color: colorScheme === "dark" ? "#fff" : "#333",
		fontSize: 18,
		textAlign: "center",
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
	},
	details: {
		marginBottom: 20,
	},
	Text: {
		color: "pink",
	},
	form: {
		marginBottom: 20,
		width: "80%",
	},
	input: {
		borderWidth: 1,
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
		borderColor: "#ccc",
	},
	backButton: {
		position: "absolute",
		top: 70,
		left: 16,
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: "#007BFF",
		borderRadius: 5,
		zIndex: 10,
	},
	backButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default styles;
