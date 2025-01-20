import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false, // Hides the screen header
			}}
		>
			<Stack.Screen name="login" />
		</Stack>
	);
}
