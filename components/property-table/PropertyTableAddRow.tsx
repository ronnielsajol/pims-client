"use client";
import { motion } from "framer-motion";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, RefObject } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { ApiError } from "@/types";

interface PropertyTableAddRowProps {
	addMode: boolean;
	newProperty: { propertyNo: string; description: string; quantity: string; value: string; serialNo: string };
	setNewProperty: Dispatch<
		SetStateAction<{ propertyNo: string; description: string; quantity: string; value: string; serialNo: string }>
	>;
	addLoading: boolean;
	setAddLoading: Dispatch<SetStateAction<boolean>>;
	setAddMode: Dispatch<SetStateAction<boolean>>;
	fetchProperties: () => Promise<void>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
}

export default function PropertyTableAddRow({
	addMode,
	newProperty,
	setNewProperty,
	addLoading,
	setAddLoading,
	setAddMode,
	fetchProperties,
	addRowRef,
}: PropertyTableAddRowProps) {
	const handleSaveNewProperty = async () => {
		setAddLoading(true);
		const toastId = toast.loading("Adding property...");
		try {
			await apiFetch("/properties/add", "POST", { property: newProperty });
			toast.success("Property added successfully!", { id: toastId });
			setNewProperty({ propertyNo: "", description: "", quantity: "", value: "", serialNo: "" });
			setAddMode(false);
			fetchProperties();
		} catch (err) {
			const error = err as ApiError;

			if (error.status === 409) {
				toast.error(error.message || "This property number already exists.", { id: toastId });
			} else {
				toast.error(error.message || "Failed to add property.", { id: toastId });
			}
			console.error("Add error:", err);
		} finally {
			setAddLoading(false);
		}
	};

	const handleCancel = () => {
		setAddMode(false);
	};

	if (!addMode) {
		return null;
	}

	return (
		<motion.tr
			ref={addRowRef}
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 10 }}
			transition={{ duration: 0.3 }}>
			<TableCell>-</TableCell>
			<TableCell>
				<input
					type='text'
					value={newProperty.propertyNo}
					onChange={(e) => setNewProperty((prev) => ({ ...prev, propertyNo: e.target.value }))}
					className='p-2 h-8 border rounded w-full'
					placeholder='Property number'
				/>
			</TableCell>
			<TableCell>
				<input
					type='text'
					value={newProperty.description}
					onChange={(e) => setNewProperty((prev) => ({ ...prev, description: e.target.value }))}
					className='p-2 h-8 border rounded w-full'
					placeholder='Description'
				/>
			</TableCell>
			<TableCell>
				<input
					type='text'
					value={newProperty.quantity}
					onChange={(e) => setNewProperty((prev) => ({ ...prev, quantity: e.target.value }))}
					className='p-2 h-8 border rounded w-full'
					placeholder='Quantity'
				/>
			</TableCell>
			<TableCell>
				<input
					type='text'
					value={newProperty.value}
					onChange={(e) => setNewProperty((prev) => ({ ...prev, value: e.target.value }))}
					className='p-2 h-8 border rounded w-full'
					placeholder='Value'
				/>
			</TableCell>
			<TableCell>
				<input
					type='text'
					value={newProperty.serialNo}
					onChange={(e) => setNewProperty((prev) => ({ ...prev, serialNo: e.target.value }))}
					className='p-2 h-8 border rounded w-full'
					placeholder='Serial Number'
				/>
			</TableCell>
			<TableCell colSpan={3}>
				<div className='flex gap-2'>
					<Button className='bg-green-600 text-white hover:bg-green-700' disabled={addLoading} onClick={handleSaveNewProperty}>
						{addLoading ? "Adding..." : "Save"}
					</Button>
					<Button variant='outline' onClick={handleCancel}>
						Cancel
					</Button>
				</div>
			</TableCell>
		</motion.tr>
	);
}
