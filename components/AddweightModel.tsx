import React, { useState } from "react";
import {
	View,
	Text,
	Modal,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Platform,
	ScrollView,
	ActivityIndicator,
	KeyboardAvoidingView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/api";

interface AddWeightModalProps {
	isVisible: boolean;
	onClose: () => void;
	userId: string;
	onSuccess: () => void;
}

const AddWeightModal: React.FC<AddWeightModalProps> = ({
	isVisible,
	onClose,
	userId,
	onSuccess,
}) => {
	const [weightValue, setWeightValue] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	// Get theme colors
	const textColor = useThemeColor({}, "text");
	const backgroundColor = useThemeColor({}, "background");
	const cardColor = useThemeColor({}, "card");
	const primaryColor = useThemeColor({}, "primary");
	const borderColor = useThemeColor({}, "border");

	const handleSubmit = async () => {
		if (!weightValue) return;

		setIsSubmitting(true);
		try {
			const response = await api.post("/api/weights", {
				userId,
				weight: parseFloat(weightValue),
				notes,
				timestamp: selectedDate.toISOString(),
			});

			console.log("Weight log response:", response.data);

			setWeightValue("");
			setNotes("");
			setSelectedDate(new Date());
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error logging weight:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderDatePicker = () => {
		const today = new Date();
		const dates = [];

		for (let i = -7; i <= 1; i++) {
			const date = new Date();
			date.setDate(today.getDate() + i);
			dates.push(date);
		}

		return (
			<View
				style={[
					styles.datePickerContainer,
					{ backgroundColor: cardColor, borderColor },
				]}
			>
				<ScrollView style={{ maxHeight: 250 }}>
					{dates.map((date, index) => {
						const isToday = date.toDateString() === today.toDateString();
						const isSelected =
							date.toDateString() === selectedDate.toDateString();

						return (
							<TouchableOpacity
								key={index}
								style={[
									styles.dateOption,
									{ borderBottomColor: borderColor },
									isSelected && { backgroundColor: `${primaryColor}20` },
								]}
								onPress={() => {
									setSelectedDate(date);
									setShowDatePicker(false);
								}}
							>
								<Text style={{ color: textColor }}>
									{isToday ? "Today" : format(date, "MMM dd, yyyy")}
									{isToday ? ` (${format(date, "MMM dd, yyyy")})` : ""}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>
		);
	};

	return (
		<Modal
			visible={isVisible}
			animationType="slide"
			transparent={true}
			onRequestClose={onClose}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.centeredView}
			>
				<View style={[styles.modalView, { backgroundColor: cardColor }]}>
					<View style={[styles.header, { borderBottomColor: borderColor }]}>
						<Text style={[styles.title, { color: textColor }]}>Add Weight</Text>
						<TouchableOpacity onPress={onClose} style={styles.closeButton}>
							<MaterialCommunityIcons
								name="close"
								size={24}
								color={textColor}
							/>
						</TouchableOpacity>
					</View>

					<View style={styles.form}>
						<View style={styles.formGroup}>
							<Text style={[styles.label, { color: textColor }]}>Weight</Text>
							<TextInput
								style={[styles.input, { color: textColor, borderColor }]}
								placeholder="Enter weight in cm"
								placeholderTextColor={textColor + "80"}
								value={weightValue}
								onChangeText={setWeightValue}
								keyboardType="numeric"
							/>
						</View>

						<View style={styles.formGroup}>
							<Text style={[styles.label, { color: textColor }]}>Date</Text>
							<TouchableOpacity
								style={[styles.dateSelector, { borderColor }]}
								onPress={() => setShowDatePicker(!showDatePicker)}
							>
								<Text style={{ color: textColor }}>
									{format(selectedDate, "MMM dd, yyyy")}
								</Text>
								<MaterialCommunityIcons
									name="calendar"
									size={20}
									color={primaryColor}
								/>
							</TouchableOpacity>
							{showDatePicker && renderDatePicker()}
						</View>

						{/* Notes */}
						<View style={styles.formGroup}>
							<Text style={[styles.label, { color: textColor }]}>
								Notes (optional)
							</Text>
							<TextInput
								style={[
									styles.input,
									styles.textArea,
									{ color: textColor, borderColor },
								]}
								placeholder="Add notes"
								placeholderTextColor={textColor + "80"}
								value={notes}
								onChangeText={setNotes}
								multiline
								numberOfLines={3}
							/>
						</View>
					</View>

					<View style={[styles.footer, { borderTopColor: borderColor }]}>
						<TouchableOpacity
							onPress={onClose}
							style={[styles.cancelButton, { borderColor }]}
						>
							<Text style={{ color: textColor }}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={handleSubmit}
							disabled={!weightValue || isSubmitting}
							style={[
								styles.saveButton,
								{
									backgroundColor: weightValue
										? primaryColor
										: `${primaryColor}50`,
								},
							]}
						>
							{isSubmitting ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<View style={styles.saveButtonContent}>
									<MaterialCommunityIcons
										name="content-save"
										size={16}
										color="#fff"
									/>
									<Text style={styles.saveButtonText}>Save</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		paddingHorizontal: 20,
	},
	modalView: {
		width: "100%",
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 15,
		borderBottomWidth: 1,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	closeButton: {
		padding: 5,
	},
	form: {
		padding: 15,
	},
	formGroup: {
		marginBottom: 15,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		marginBottom: 5,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 10,
		fontSize: 16,
	},
	textArea: {
		minHeight: 80,
		textAlignVertical: "top",
	},
	dateSelector: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	datePickerContainer: {
		borderWidth: 1,
		borderRadius: 8,
		marginTop: 5,
	},
	dateOption: {
		padding: 12,
		borderBottomWidth: 1,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		padding: 15,
		borderTopWidth: 1,
	},
	cancelButton: {
		padding: 10,
		borderRadius: 8,
		borderWidth: 1,
		marginRight: 10,
	},
	saveButton: {
		padding: 10,
		borderRadius: 8,
		minWidth: 100,
		justifyContent: "center",
		alignItems: "center",
	},
	saveButtonContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	saveButtonText: {
		color: "white",
		fontWeight: "500",
		marginLeft: 5,
	},
});

export default AddWeightModal;
