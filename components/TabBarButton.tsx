import { View, StyleSheet } from "react-native";
import { PlatformPressable } from "@react-navigation/elements";
import React, { useEffect } from "react";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { lightMode } from "../styles/homeconstant";
import { icon } from "../constants/icon";

interface TabBarButtonProps {
	onPress: () => void;
	onLongPress?: () => void;
	isFocused: boolean;
	routeName: string;
	label: string;
	color: string;
}

type RouteName = "home" | "explore" | "settings";

const TabBarButton: React.FC<TabBarButtonProps> = ({
	onPress,
	isFocused,
	label,
	routeName,
	color,
}) => {
	const scale = useSharedValue(isFocused ? 1 : 0);

	// Update the scale value when isFocused changes
	useEffect(() => {
		scale.value = withSpring(isFocused ? 1 : 0, {
			damping: 10,
			stiffness: 100,
		});
	}, [isFocused, scale]);

	const animatedIconStyle = useAnimatedStyle(() => {
		const scaleValue = interpolate(scale.value, [0, 1], [1, 1.4]);
		const top = interpolate(scale.value, [0, 1], [0, 9]);

		return {
			transform: [{ scale: scaleValue }],
			top: top,
		};
	});

	const animatedTextStyle = useAnimatedStyle(() => {
		const opacity = interpolate(scale.value, [0, 1], [1, 0]);

		return {
			opacity,
		};
	});

	return (
		<PlatformPressable onPress={onPress} style={styles.tabBarItem}>
			<Animated.View style={[animatedIconStyle]}>
				{icon[routeName.toLowerCase() as RouteName]?.({ color })}
			</Animated.View>

			<Animated.Text
				style={[
					{
						color,
						fontSize: 11,
					},
					animatedTextStyle,
				]}
			>
				{label}
			</Animated.Text>
		</PlatformPressable>
	);
};

const styles = StyleSheet.create({
	tabBarItem: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 4,
	},
});

export default TabBarButton;
