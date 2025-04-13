import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<AuthProvider>
			<ProtectedRoute>
				<Navbar />
				{children}
			</ProtectedRoute>
		</AuthProvider>
	);
}
