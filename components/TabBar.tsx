import { View, Platform, Touchable, LayoutChangeEvent } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { lightMode, darkMode } from "../styles/homeconstant";
import Feather from "react-native-vector-icons/Feather";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useState } from "react";
import TabBarButton from "./TabBarButton";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
export const TabBar = ({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) => {
	const { colors } = useTheme();
	const [dimensions, setDimensions] = useState({
		width: 100,
		height: 20,
	});
	const buttonWidth = dimensions.width / 3;
	const onTabberLayout = (event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		setDimensions({ width, height });
	};
	const tabPositionX = useSharedValue(0);
	const animatesStyles = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: tabPositionX.value }],
		};
	});
	return (
		<View onLayout={onTabberLayout} style={styles.tabBar}>
			<Animated.View
				style={[
					animatesStyles,
					{
						position: "absolute",
						backgroundColor: lightMode.lightGreen,
						borderRadius: 30,
						marginHorizontal: 12,
						// width: buttonWidth,
						height: dimensions.height - 15,
						width: buttonWidth - 24,
					},
				]}
			/>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label =
					typeof options.tabBarLabel === "string"
						? options.tabBarLabel
						: options.title ?? route.name;
				if (
					[
						"_sitemap",
						"+not-found",
						"adduser",
						"weightcharts/[userId]",
						"editUsers/[userId]",
					].includes(route.name)
				)
					return null;
				const isFocused = state.index === index;
				const routeName = route.name.toLowerCase();

				const onPress = () => {
					tabPositionX.value = withSpring(buttonWidth * index, {
						duration: 1500,
					});
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});
					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					});
				};

				return (
					<TabBarButton
						key={route.key}
						onPress={onPress}
						onLongPress={onLongPress}
						isFocused={isFocused}
						routeName={routeName}
						label={label}
						color={isFocused ? lightMode.darkGreen : lightMode.lightGreen}
					/>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: "row",
		position: "absolute",
		bottom: 25,
		justifyContent: "space-between",
		alignItems: "center",
		// width: "10%",
		backgroundColor: lightMode.darkGreen,
		marginHorizontal: 40,
		paddingVertical: 15,
		borderRadius: 30,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowRadius: 10,
		shadowOpacity: 0.8,
	},
	tabBarItem: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 5,
	},
	tabItemLabel: {
		fontSize: 12,
		marginTop: 3,
	},
	tabItemIcon: {
		width: 24,
		height: 24,
	},
});
