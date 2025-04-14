"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError } from "@/types";

export default function AddPropertyPage() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const { token, user } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await apiFetch("/properties/add", "POST", { name, description }, token ?? "");
			alert("Property added!");
			setName("");
			setDescription("");
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
			<div className='p-8 max-w-md mx-auto'>
				<h2 className='text-2xl font-bold mb-4'>Add Property</h2>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<input
						type='text'
						placeholder='Name'
						className='w-full p-2 border rounded'
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<textarea
						placeholder='Description'
						className='w-full p-2 border rounded'
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<button className='bg-green-600  text-white px-4 py-2 rounded w-full'>Add Property</button>
				</form>
			</div>
		</ProtectedRoute>
	);
}
