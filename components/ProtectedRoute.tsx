"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) {
			return;
		}
		if (!user) {
			router.push("/");
		}
	}, [user, loading, router]);

	if (loading || !user) {
		return (
			<div className='p-8 w-screen h-screen flex items-center justify-center'>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
					className='w-16 h-16 rounded-[50%] border-8 border-gray-300 border-t-[#800000] will-change-transform'
				/>
			</div>
		);
	}

	return <>{children}</>;
}
