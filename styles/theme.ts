export const lightTheme = {
	colors: {
		primary: {
			dark: "#0D301C",
			light: "#8BC34A",
			accent: "#FFA726",
		},
		background: "#f0f4f8",
		text: {
			primary: "#333",
			secondary: "#555",
		},
	},
};

export const darkTheme = {
	colors: {
		primary: {
			dark: "#103C1F",
			light: "#AACF80",
			accent: "#FFC266",
		},
		background: "#121212",
		text: {
			primary: "#fff",
			secondary: "#ddd",
		},
	},
};

export type Theme = typeof lightTheme;
