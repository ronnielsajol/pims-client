"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

export default function AddPropertyPage() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const { token, user } = useAuth();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const toastId = toast.loading("Adding property...");
		try {
			await apiFetch("/properties/add", "POST", { name, description }, token ?? "");
			toast.success("Property added!", { id: toastId });
			setName("");
			setDescription("");
			router.push("/properties");
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("API Error:", error.message || error.error);
			toast.error(error.message || "Something went wrong");
		} finally {
			setLoading(false);
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
						required
					/>
					<textarea
						placeholder='Description'
						className='w-full p-2 border rounded'
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
					/>
					<Button className='bg-green-600 hover:bg-green-700  text-white px-4 py-2 rounded w-full cursor-pointer'>
						{loading ? <LoaderCircle className='animate-spin h-5 w-5 mx-auto' /> : "Add Property"}
					</Button>
				</form>
			</div>
		</ProtectedRoute>
	);
}
