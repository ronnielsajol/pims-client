"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ApiError, Property } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const Page = () => {
	const { token } = useAuth();
	const router = useRouter();
	const params = useParams();
	const propertyId = params.propertyId as string;

	const [loading, setLoading] = useState(true);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		const fetchProperty = async () => {
			try {
				const res = await apiFetch<{ success: boolean; data: Property }>(
					"/properties/" + propertyId,
					"GET",
					undefined,
					token ?? ""
				);
				setName(res.data.name ?? "");
				setDescription(res.data.description ?? "");
			} catch (error) {
				console.error("Error fetching property:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProperty();
	}, [propertyId, token]);

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const toastId = toast.loading("Updating property...");

		try {
			await apiFetch(`/properties/update/${propertyId}`, "PATCH", { name, description }, token ?? "");
			toast.success("Property updated!", { id: toastId });
			router.push("/properties");
		} catch (err) {
			const error = err as ApiError;
			toast.error(error.message || "Failed to update property");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-8 max-w-md mx-auto'>
			<h1 className='text-2xl font-bold mb-6'>Edit Property</h1>
			<form onSubmit={handleUpdate} className='space-y-4'>
				<input
					type='text'
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder='Property Name'
					className='w-full p-2 border rounded'
					required
				/>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder='Property Description'
					className='w-full p-2 border rounded'
					required
				/>
				<Button type='submit' className='bg-blue-500 text-white w-full hover:bg-blue-600 cursor-pointer'>
					{loading ? <LoaderCircle className='animate-spin h-5 w-5' /> : "Update Property"}
				</Button>
			</form>
		</div>
	);
};

export default Page;
