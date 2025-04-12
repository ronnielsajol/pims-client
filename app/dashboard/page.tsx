"use client";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePathname } from "next/navigation";

export default function DashboardPage() {
	const { user } = useAuth();
	const pathName = usePathname();

	console.log(pathName);

	return (
		<ProtectedRoute>
			<div className='p-8'>
				<p className='mt-2'>Role: {user?.role}</p>
			</div>
		</ProtectedRoute>
	);
}
