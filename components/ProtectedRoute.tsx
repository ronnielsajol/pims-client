"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { token, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !token) {
			router.push("/login");
		}
	}, [token, loading]);

	if (loading) {
		return <div className='p-8'>Loading...</div>;
	}

	return <>{token && children}</>;
}
