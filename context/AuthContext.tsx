"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type User = {
	id: number;
	name: string;
	email: string;
	role: "staff" | "admin" | "master_admin";
};

type AuthContextType = {
	user: User | null;
	token: string | null;
	login: (token: string, user: User) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);

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

	return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};
