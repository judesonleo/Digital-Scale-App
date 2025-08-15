import { router, Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TabBar } from "@/components/TabBar";
import { lightMode, darkMode } from "../../styles/homeconstant";
import { getAuthToken } from "@/utils/authStorage";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	useEffect(() => {
		const checkAuthStatus = async () => {
			const user = await getAuthToken();
			if (user) {
				// Clear the navigation stack and set the home screen as the main route
				router.replace("../(tabs)/home"); // Direct to home if logged in
			} else {
				router.replace("/(auth)"); // Otherwise, show login screen
			}
		};

		checkAuthStatus();
	}, []);

	return (
		<Tabs tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen
				name="home"
				options={{
					headerShown: false,
					tabBarLabel: "Home",
					title: "Home",
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					headerShown: false,
					tabBarLabel: "Explore",
					title: "Explore",
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					headerShown: false,
					tabBarLabel: "Settings",
					title: "Settings",
				}}
			/>
		</Tabs>
	);
}
