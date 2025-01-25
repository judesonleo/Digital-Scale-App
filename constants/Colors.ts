/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
	light: {
		primary: "#007BFF",
		secondary: "#6C757D",
		background: "#F8F9FA",
		text: "#212529",
		placeholderText: "#6C757D",
		success: "#28A745",
		warning: "#FFC107",
		error: "#DC3545",
		tint: tintColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
	},
	dark: {
		primary: "#007BFF",
		secondary: "#6C757D",
		background: "#121212",
		text: "#E1E1E1",
		placeholderText: "#6C757D",
		success: "#28A745",
		warning: "#FFC107",
		error: "#DC3545",
		tint: tintColorDark,
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,
	},
};
