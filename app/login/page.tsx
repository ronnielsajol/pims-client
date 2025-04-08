"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ApiError, User } from "@/types";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useAuth();
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await apiFetch<{ success: boolean; message: string; data: { token: string; user: User } }>(
				"/auth/sign-in",
				"POST",
				{
					email,
					password,
				}
			);
			console.log("Login response:", res);
			if (res.success) {
				const { token, user } = res.data;
				login(token, user);
				router.push("/dashboard");
			} else {
				alert(res.message || "Something went wrong");
			}
			router.push("/dashboard");
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("API Error:", error.message || error.error);
			alert(error.message || "Something went wrong");
		}
	};

	return (
		<div className='p-8 max-w-md mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Sign In</h2>
			<form onSubmit={handleLogin} className='space-y-4'>
				<input
					type='email'
					placeholder='Email'
					className='w-full p-2 border rounded'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type='password'
					placeholder='Password'
					className='w-full p-2 border rounded'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button className='bg-blue-600 text-white px-4 py-2 rounded w-full'>Login</button>
			</form>
		</div>
	);
}
