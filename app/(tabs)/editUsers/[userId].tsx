import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const editUser = () => {
	const { userId } = useLocalSearchParams();
	return (
		<View>
			<Text>{userId}</Text>
		</View>
	);
};

export default editUser;
