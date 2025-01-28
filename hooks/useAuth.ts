import { useState, useEffect } from "react";
import { getAuthToken } from "../utils/authStorage";

export const useAuth = () => {
	const [user, setUser] = useState<null | object>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			const authData = await getAuthToken(); // This returns { token, userId, username, name }
			if (authData?.token) {
				setUser(authData); // Store the whole object, not just the token
			}
			setLoading(false);
		};

		checkAuth();
	}, []);

	return { user, loading };
};
