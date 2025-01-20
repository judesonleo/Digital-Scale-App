import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { user } = useAuth(); // `user` is null/undefined when logged out.

	const [fontsLoaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	// Return null while fonts are loading to prevent rendering until everything is ready.
	if (!fontsLoaded) {
		return null;
	}

	// Explicitly redirect to the correct stack based on `user`.
	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<StatusBar style="auto" />
			<Stack>
				{!user ? (
					// Route to authentication screens when logged out.
					<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				) : (
					// Route to main tabs when logged in.
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				)}
			</Stack>
		</ThemeProvider>
	);
}
