"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddAdminPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const toastId = toast.loading("Creating account...");
		setLoading(true);

		try {
			await apiFetch("/auth/sign-up", "POST", { name, email, password, department: "PSMO", role: "admin" });
			toast.success("Account creation successful!", { id: toastId });

			setName("");
			setEmail("");
			setPassword("");
			router.push("/admins");
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("API Error:", error.message || error.error);
			toast.error(error.message || "Failed to create account", { id: toastId });
		} finally {
			setLoading(false);
		}
	};

	if (user?.role === "staff") {
		return <div className='p-8'>You are not authorized to add admins.</div>;
	}

	return (
		<ProtectedRoute>
			<div className='relative p-2 laptop:p-8 laptop:w-10/12 mx-auto flex flex-col justify-start items-center'>
				<div className='container max-w-3xl py-4 laptop:py-10'>
					<Link
						href='/admins'
						className='inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6'>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to Admins
					</Link>

					<form onSubmit={handleSubmit}>
						<Card>
							<CardHeader className='space-y-1'>
								<div className='flex items-center gap-2'>
									<Building2 className='h-5 w-5 text-primary' />
									<CardTitle className='text-2xl'>Create New Admin</CardTitle>
								</div>
								<CardDescription>Enter the details below to create a new admin account</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Full Name</Label>
									<Input
										value={name}
										required
										id='name'
										placeholder="Enter admin's full name"
										autoComplete='name'
										onChange={(e) => {
											setName(e.target.value);
										}}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email Address</Label>
									<Input
										value={email}
										required
										id='email'
										type='email'
										placeholder='email@example.com'
										autoComplete='email'
										onChange={(e) => {
											setEmail(e.target.value);
										}}
									/>
								</div>
								<div className='space-y-2'>
									<div className='flex items-center justify-between'>
										<Label htmlFor='password'>Password</Label>
									</div>
									<Input
										value={password}
										required
										id='password'
										type='password'
										placeholder='Create a secure password'
										autoComplete='new-password'
										onChange={(e) => {
											setPassword(e.target.value);
										}}
									/>
									<p className='text-xs text-muted-foreground'>
										Password must be at least 8 characters long with a mix of letters, numbers, and symbols
									</p>
								</div>
							</CardContent>
							<CardFooter className='flex justify-between border-t pt-6'>
								<Button variant='outline' type='button' onClick={() => router.push("/admins")}>
									Cancel
								</Button>
								<Button type='submit' className='gap-2 cursor-pointer bg-green-500 hover:bg-green-600' disabled={loading}>
									<User className='h-4 w-4' />
									Create Account
								</Button>
							</CardFooter>
						</Card>
					</form>
				</div>{" "}
			</div>
		</ProtectedRoute>
	);
}
