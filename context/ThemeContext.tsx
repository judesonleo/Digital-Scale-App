import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	isDark: boolean;
	scheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const systemColorScheme = useColorScheme();
	const [theme, setTheme] = useState<Theme>("system");

	useEffect(() => {
		// Load saved theme preference
		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem("theme");
				if (savedTheme) {
					setTheme(savedTheme as Theme);
				}
			} catch (error) {
				console.error("Error loading theme:", error);
			}
		};
		loadTheme();
	}, []);

	// Save theme preference when it changes
	useEffect(() => {
		const saveTheme = async () => {
			try {
				await AsyncStorage.setItem("theme", theme);
			} catch (error) {
				console.error("Error saving theme:", error);
			}
		};
		saveTheme();
	}, [theme]);

	const isDark =
		theme === "system" ? systemColorScheme === "dark" : theme === "dark";

	const scheme = isDark ? "dark" : "light";

	return (
		<ThemeContext.Provider value={{ theme, setTheme, isDark, scheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
