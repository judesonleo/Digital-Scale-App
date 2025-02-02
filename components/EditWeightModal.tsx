import React, { useState, useEffect } from "react";
import {
	Modal,
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Platform,
	KeyboardAvoidingView,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface EditWeightModalProps {
	isVisible: boolean;
	onClose: () => void;
	onSave: (weight: number, notes: string) => Promise<void>;
	initialWeight?: number;
	initialNotes?: string;
}

const EditWeightModal: React.FC<EditWeightModalProps> = ({
	isVisible,
	onClose,
	onSave,
	initialWeight = 0,
	initialNotes = "",
}) => {
	const [weight, setWeight] = useState(initialWeight.toString());
	const [notes, setNotes] = useState(initialNotes);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const backgroundColor = useThemeColor({}, "background");
	const textColor = useThemeColor({}, "text");
	const primaryColor = useThemeColor({}, "primary");
	const borderColor = useThemeColor({}, "border");

	useEffect(() => {
		setWeight(initialWeight.toString());
		setNotes(initialNotes);
	}, [initialWeight, initialNotes]);

	const handleSave = async () => {
		const weightNum = parseFloat(weight);
		if (isNaN(weightNum) || weightNum <= 0) {
			alert("Please enter a valid weight");
			return;
		}

		setIsSubmitting(true);
		try {
			await onSave(weightNum, notes);
			onClose();
		} catch (error) {
			console.error("Error saving weight:", error);
			alert("Failed to save weight");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			visible={isVisible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.modalContainer}
			>
				<View style={[styles.modalContent, { backgroundColor }]}>
					<Text style={[styles.modalTitle, { color: textColor }]}>
						Edit Weight Log
					</Text>

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: textColor }]}>
							Weight (kg)
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									color: textColor,
									borderColor,
									backgroundColor: "transparent",
								},
							]}
							value={weight}
							onChangeText={setWeight}
							keyboardType="decimal-pad"
							placeholder="Enter weight"
							placeholderTextColor={textColor + "80"}
						/>
					</View>

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: textColor }]}>Notes</Text>
						<TextInput
							style={[
								styles.input,
								styles.notesInput,
								{
									color: textColor,
									borderColor,
									backgroundColor: "transparent",
								},
							]}
							value={notes}
							onChangeText={setNotes}
							placeholder="Add notes (optional)"
							placeholderTextColor={textColor + "80"}
							multiline
						/>
					</View>

					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[styles.button, styles.cancelButton]}
							onPress={onClose}
							disabled={isSubmitting}
						>
							<Text style={[styles.buttonText, { color: textColor }]}>
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.button,
								styles.saveButton,
								{ backgroundColor: primaryColor },
							]}
							onPress={handleSave}
							disabled={isSubmitting}
						>
							<Text style={[styles.buttonText, { color: "#fff" }]}>
								{isSubmitting ? "Saving..." : "Save"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
		}),
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 20,
		textAlign: "center",
	},
	inputContainer: {
		marginBottom: 15,
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	notesInput: {
		height: 100,
		textAlignVertical: "top",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
		gap: 10,
	},
	button: {
		flex: 1,
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: "transparent",
	},
	saveButton: {
		backgroundColor: "#007AFF",
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});

export default EditWeightModal;
