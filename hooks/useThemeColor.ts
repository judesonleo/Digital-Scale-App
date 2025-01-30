import { useColorScheme } from "@/hooks/useColorScheme";

export function useThemeColor(
	props: { light?: string; dark?: string },
	colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
	const theme = useColorScheme() ?? "light";
	const colorFromProps = props[theme];

	if (colorFromProps) {
		return colorFromProps;
	} else {
		return Colors[theme][colorName];
	}
}

export const Colors = {
	light: {
		primary: "#007AFF", // yellow-green
		secondary: "#0D301C", // dark-green
		background: "#FFFFFF", // white
		text: "#11100E", // night
		placeholderText: "#959793", // battleship-gray
		success: "#0D301C", // dark-green
		warning: "#AFDE38", // yellow-green
		error: "#484C47", // outer-space
		tint: "#BFC3B3", // ash-gray
		icon: "#11100E", // night
		tabIconDefault: "#CDCDCD", // silver
		tabIconSelected: "#AFDE38", // yellow-green
		tabBarBackground: "#FFFFFF", // white
		shadowColor: "#11100E", // night
		indicatorColor: "#AFDE38", // yellow-green
		card: "#FFFFFF", // timberwolf
		border: "#959793", // battleship-gray
		danger: "#484C47", // outer-space
		textSecondary: "#959793", // battleship-gray
	},

	dark: {
		primary: "#AFDE38", // yellow-green
		secondary: "#0D301C", // dark-green
		background: "#11100E", // night
		text: "#FFFFFF", // white
		placeholderText: "#959793", // battleship-gray
		success: "#0D301C", // dark-green
		warning: "#AFDE38", // yellow-green
		error: "#484C47", // outer-space
		tint: "#BFC3B3", // ash-gray
		icon: "#FFFFFF", // white
		tabIconDefault: "#484C47", // outer-space
		tabIconSelected: "#AFDE38", // yellow-green
		tabBarBackground: "#11100E", // night
		shadow: "rgba(0, 0, 0, 0.3)",
		indicatorColor: "#AFDE38", // yellow-green
		card: "#1E2124", // outer-space
		border: "#2D3748", // battleship-gray
		danger: "#484C47", // outer-space
		textSecondary: "#BFC3B3", // ash-gray
	},
};
/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

// // import { Colors } from '@/constants/Colors';
// import { useColorScheme } from "@/hooks/useColorScheme";

// export function useThemeColor(
// 	props: { light?: string; dark?: string },
// 	colorName: keyof typeof Colors.light & keyof typeof Colors.dark
// ) {
// 	const theme = useColorScheme() ?? "light";
// 	const colorFromProps = props[theme];

// 	if (colorFromProps) {
// 		return colorFromProps;
// 	} else {
// 		return Colors[theme][colorName];
// 	}
// }
// export const Colors = {
// 	light: {
// 		primary: "#007AFF",

// 		secondary: "#5856D6",

// 		background: "#FFFFFF",

// 		text: "#000000",

// 		placeholderText: "#A9A9A9",

// 		success: "#34C759",

// 		warning: "#FF9500",

// 		error: "#FF3B30",

// 		tint: "#2f95dc",

// 		icon: "#000000",

// 		tabIconDefault: "#ccc",

// 		tabIconSelected: "#2f95dc",

// 		tabBarBackground: "#fefefe",

// 		shadowColor: "#000",

// 		indicatorColor: "#2f95dc",

// 		card: "#FFFFFF", // Added card color

// 		border: "#E0E0E0",

// 		danger: "#FF3B30",

// 		textSecondary: "#8E8E93",
// 	},

// 	dark: {
// 		primary: "#0A84FF",

// 		secondary: "#5E5CE6",

// 		background: "#000000",

// 		text: "#FFFFFF",

// 		placeholderText: "#A9A9A9",

// 		success: "#30D158",

// 		warning: "#FF9F0A",

// 		error: "#FF453A",

// 		tint: "#fff",

// 		icon: "#FFFFFF",

// 		tabIconDefault: "#ccc",

// 		tabIconSelected: "#fff",

// 		tabBarBackground: "#000",

// 		shadowColor: "#fff",

// 		indicatorColor: "#fff",

// 		card: "#1C1C1E", // Added card color

// 		border: "#3A3A3C",

// 		danger: "#FF453A",

// 		textSecondary: "#8E8E93",
// 	},
// };
