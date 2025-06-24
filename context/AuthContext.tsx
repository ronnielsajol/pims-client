"use client";

import { apiFetch } from "@/lib/api";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type AuthContextType = {
	user: User | null;
	login: (user: User) => void;
	logout: () => void;
	loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	const checkUserStatus = async () => {
		try {
			const res = await apiFetch<{ user: User }>("/auth/me");
			if (res.user) {
				setUser(res.user);
			}
		} catch (error) {
			console.log("Error: ", error);
			console.log("No active session found.");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkUserStatus();
	}, []);

	const login = (user: User) => {
		setUser(user);
	};

	const logout = async () => {
		try {
			await apiFetch("/auth/sign-out", "GET");
		} catch (error) {
			console.error("Failed to sign out on server", error);
		} finally {
			setUser(null);
			window.location.href = "/";
		}
	};

	return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};
