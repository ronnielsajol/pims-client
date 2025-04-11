"use client";

import { User } from "@/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type AuthContextType = {
	user: User | null;
	token: string | null;
	login: (token: string, user: User) => void;
	logout: () => void;
	loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}

		setLoading(false);
	}, []);

	const login = (token: string, user: User) => {
		setToken(token);
		setUser(user);
		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(user));
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		localStorage.clear();
	};

	return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};
