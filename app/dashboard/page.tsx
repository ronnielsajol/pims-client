"use client";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
	const { user } = useAuth();

	return (
		<ProtectedRoute>
			<div className='p-8'>
				<h1 className='text-3xl font-bold'>Welcome, {user?.name}</h1>
				<p className='mt-2'>Role: {user?.role}</p>
			</div>
		</ProtectedRoute>
	);
}
