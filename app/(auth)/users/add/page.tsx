"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AddPropertyPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { token, user } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await apiFetch("/auth/sign-up", "POST", { name, email, password }, token ?? "");
			alert("Account created!");
			setName("");
			setEmail("");
			setPassword("");
			router.push("/users");
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("API Error:", error.message || error.error);
			alert(error.message || "Something went wrong");
		}
	};

	if (user?.role === "staff") {
		return <div className='p-8'>You are not authorized to add properties.</div>;
	}

	return (
		<ProtectedRoute>
			<div className='p-8 w-10/12 mx-auto flex flex-col justify-start items-center'>
				<div className='flex gap-2 items-center mb-4'>
					<Button variant={"ghost"} onClick={() => router.push("/users")} className='h-min w-min cursor-pointer p-0'>
						<ArrowLeft strokeWidth={3} className='text-gray-500' />
					</Button>
					<h2 className='text-2xl font-bold'>Create new user account</h2>
				</div>
				<form onSubmit={handleSubmit} className='space-y-4 max-w-[75%] w-full'>
					<Input
						type='text'
						placeholder='Name'
						className='w-full p-2 border rounded'
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
					<Input
						type='email'
						placeholder='Email'
						className='w-full p-2 border rounded'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<Input
						type='password'
						placeholder='Password'
						className='w-full p-2 border rounded text-[#800000]'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<Button className='bg-green-600 hover:bg-green-500  text-white px-4 py-2 text-lg rounded w-full cursor-pointer max-w-min'>
						Create User
					</Button>
				</form>
			</div>
		</ProtectedRoute>
	);
}
