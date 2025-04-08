"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { token } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!token) {
			router.push("/login");
		}
	}, [token]);

	return <>{token && children}</>;
}
