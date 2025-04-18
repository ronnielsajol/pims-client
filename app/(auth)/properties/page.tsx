"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PropertiesPage() {
	const { token, user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const router = useRouter();

	useEffect(() => {
		console.log(token);
		if (user?.role === "staff") return; // staff shouldn’t see all properties
		apiFetch<{ success: boolean; data: Property[] }>("/properties/all", "GET", undefined, token ?? "")
			.then((res) => {
				setProperties(res.data);
			})
			.catch((err) => console.log(err.message));
	}, [token]);

	if (user?.role === "staff") {
		return <div className='p-8'>You are not allowed to view all properties.</div>;
	}

	return (
		<ProtectedRoute>
			<div className='p-8 w-full'>
				<div className='flex justify-between w-full'>
					<h2 className='text-2xl font-bold mb-4'>All Properties</h2>
					<Button
						className='bg-green-600 cursor-pointer hover:bg-green-500'
						onClick={() => {
							router.push("/properties/add");
						}}>
						Add Property
					</Button>
				</div>
				<ul className='space-y-2'>
					{properties.map((p) => (
						<li key={p.id} className='p-4 border rounded'>
							<p className='font-semibold'>{p.name}</p>
							<p>{p.description}</p>
							{p.qrCode && <img src={p.qrCode} alt='QR' className='w-24 h-24 mt-2' />}
						</li>
					))}
				</ul>
			</div>
		</ProtectedRoute>
	);
}
