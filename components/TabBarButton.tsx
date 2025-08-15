import { View, StyleSheet, Pressable } from "react-native";
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
	label:
		| string
		| ((props: {
				focused: boolean;
				color: string;
				position: any;
				children: string;
		  }) => React.ReactNode);
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

	// Text should always be visible, just change color based on focus
	const animatedTextStyle = useAnimatedStyle(() => {
		return {
			opacity: 1, // Always visible
		};
	});
	const IconComponent = React.useMemo(() => {
		const normalizedRouteName = routeName.toLowerCase() as RouteName;
		return icon[normalizedRouteName]?.({ color }) || null;
	}, [routeName, color]);
	return (
		<Pressable
			onPress={onPress}
			style={styles.tabBarItem}
			android_ripple={{
				color: "transparent",
				borderless: true,
			}}
		>
			<Animated.View style={[animatedIconStyle]}>
				{/* {icon[routeName.toLowerCase() as RouteName]?.({ color })} */}
				{IconComponent}
			</Animated.View>

			<Animated.Text
				style={[
					{
						color: isFocused ? lightMode.darkGreen : lightMode.lightGreen,
						fontSize: 11,
						fontWeight: isFocused ? "600" : "400",
					},
					animatedTextStyle,
				]}
			>
				{label}
			</Animated.Text>
		</Pressable>
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
