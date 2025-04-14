import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<AuthProvider>
			<ProtectedRoute>
				<Navbar />
				<main className='mx-auto max-w-9/12 w-full flex justify-between '>{children}</main>
			</ProtectedRoute>
		</AuthProvider>
	);
}
