import { useState, useEffect } from "react";
import { getAuthToken } from "../utils/authStorage";

export const useAuth = () => {
	const [user, setUser] = useState<null | object>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			const token = await getAuthToken();
			if (token) {
				// Token exists: simulate user data (or fetch from API)
				setUser({ token });
			}
			setLoading(false);
		};

		checkAuth();
	}, []);

	return { user, loading };
};
