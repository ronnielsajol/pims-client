import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { PendingApprovalsProvider } from "@/context/PendingApprovalsCount";

export const metadata: Metadata = {
	title: "PIMS",
	description: "Property Information Management System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`antialiased`}>
				<AuthProvider>
					<PendingApprovalsProvider>
						{children}
						<Toaster richColors />
					</PendingApprovalsProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
