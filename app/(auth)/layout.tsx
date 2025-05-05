import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<AuthProvider>
			<ProtectedRoute>
				<Navbar />
				<main className='mx-auto max-w-10/12 w-full flex justify-between min-h-screen'>{children}</main>
				<Footer />
			</ProtectedRoute>
		</AuthProvider>
	);
}
