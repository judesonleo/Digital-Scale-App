import React, { createContext, useContext, useState } from "react";

// Define the types for the AuthContext
type AuthContextType = {
	isLoggedIn: boolean;
	login: () => void;
	logout: () => void;
};

// Default values for the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const login = () => setIsLoggedIn(true);
	const logout = () => setIsLoggedIn(false);

	return (
		<AuthContext.Provider value={{ isLoggedIn, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook for accessing the AuthContext
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
