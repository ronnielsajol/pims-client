import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./provider";

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
					<Providers>
						{children}
						<Toaster richColors />
					</Providers>
				</AuthProvider>
			</body>
		</html>
	);
}
