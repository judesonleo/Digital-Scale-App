import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TabBar } from "@/components/TabBar";
import { lightMode, darkMode } from "../../styles/homeconstant";
export default function TabLayout() {
	const colorScheme = useColorScheme();
	return (
		<Tabs tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: "Explore",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="paperplane.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => (
						<IconSymbol
							size={28}
							name="chevron.left.forwardslash.chevron.right"
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="adduser"
				options={{
					tabBarItemStyle: { display: "none" },
				}}
			/>
			<Tabs.Screen
				name="weightcharts/[userId]"
				options={{
					tabBarItemStyle: { display: "none" },
				}}
			/>
		</Tabs>
	);
}
