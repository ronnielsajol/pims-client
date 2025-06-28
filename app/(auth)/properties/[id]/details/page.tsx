"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ApiError, Property, PropertyDetails, PropertyWithDetails } from "@/types";
import { Edit, MoreHorizontal, Save, Trash2, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import EditableDetailSelect from "@/components/EditableDetailSelect";
import { PageBreadcrumb } from "@/components/PageBreadCrumb";

interface EditableDetailItemProps {
	label: string;
	value: React.ReactNode | null | undefined;
	isEditing: boolean;
	onChange: (value: string) => void;
	inputType?: React.HTMLInputTypeAttribute; // e.g., 'text', 'date', 'number'
	fallbackText?: string;
	isLast?: boolean;
}

const EditableDetailItem: React.FC<EditableDetailItemProps> = ({
	label,
	value,
	isEditing,
	onChange,
	inputType = "text",
	fallbackText = "Not Set",
	isLast = false,
}) => (
	<>
		<div className='grid grid-cols-3 items-center min-h-[44px]'>
			<span className='text-sm font-medium text-muted-foreground'>{label}</span>
			<div className='col-span-2 font-medium'>
				{isEditing ? (
					<Input type={inputType} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
				) : (
					value ?? <span className='text-gray-400 font-normal'>{fallbackText}</span>
				)}
			</div>
		</div>
		{!isLast && <Separator />}
	</>
);

// Helper component for a clean loading state
const DetailsSkeleton = () => (
	<div className='py-12 px-24 w-full'>
		<div className='flex items-center justify-between mb-6'>
			<div className='flex items-center gap-4'>
				<Skeleton className='h-10 w-10' />
				<Skeleton className='h-8 w-48' />
				<Skeleton className='h-6 w-20' />
			</div>
			<div className='flex items-center gap-2'>
				<Skeleton className='h-9 w-24' />
				<Skeleton className='h-9 w-9' />
			</div>
		</div>
		<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-1/3' />
				</CardHeader>
				<CardContent className='space-y-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className='space-y-2'>
							<div className='grid grid-cols-3 items-center'>
								<Skeleton className='h-4 w-1/3' />
								<Skeleton className='h-5 col-span-2 w-2/3' />
							</div>
							<Separator />
						</div>
					))}
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-1/3' />
				</CardHeader>
				<CardContent className='space-y-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className='space-y-2'>
							<div className='grid grid-cols-3 items-center'>
								<Skeleton className='h-4 w-1/3' />
								<Skeleton className='h-5 col-span-2 w-2/3' />
							</div>
							<Separator />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	</div>
);

export default function Page() {
	const { user } = useAuth();
	const params = useParams();
	const id = params?.id as string;

	const [property, setProperty] = useState<PropertyWithDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [isEditing, setIsEditing] = useState(false);
	const [editValues, setEditValues] = useState<PropertyWithDetails | null>(null);

	const categoryOptions = ["Annex A", "Annex B", "Annex C"] as const;

	const fetchProperties = async () => {
		if (!user || !id) return;
		setIsLoading(true);
		setError(null);

		try {
			const response = await apiFetch<{ data: PropertyWithDetails }>(`/properties/${id}/details`, "GET", undefined);
			setProperty(response.data);
		} catch (error) {
			setError("Failed to fetch property details. Please try again.");
			console.error("Failed to fetch property details:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProperties();
	}, [user, id]);

	// const handleBack = () => {
	// 	router.back();
	// };

	const handleEditClick = () => {
		setIsEditing(true);
		setEditValues(JSON.parse(JSON.stringify(property)));
	};

	const handleCancelClick = () => {
		setIsEditing(false);
		setEditValues(null); // Clear the edit values
	};

	const handleInputChange = (field: keyof (Property & PropertyDetails), value: string, isDetailField: boolean) => {
		setEditValues((prev) => {
			if (!prev) return null;
			if (isDetailField) {
				return {
					...prev,
					details: { ...prev.details!, [field]: value },
				};
			}
			return { ...prev, [field]: value };
		});
	};

	const handleSaveClick = async () => {
		if (!editValues) return;
		const toastId = toast.loading("Saving changes...");
		try {
			const corePropertyPayload = {
				propertyNo: editValues.propertyNo,
				description: editValues.description,
				quantity: editValues.quantity,
				value: editValues.value,
				serialNo: editValues.serialNo,
				location_detail: editValues.location_detail,
				category: editValues.category,
			};

			const detailsPayload = {
				article: editValues.details?.article,
				oldPropertyNo: editValues.details?.oldPropertyNo,
				unitOfMeasure: editValues.details?.unitOfMeasure,
				acquisitionDate: editValues.details?.acquisitionDate,
				condition: editValues.details?.condition,
				remarks: editValues.details?.remarks,
				pupBranch: editValues.details?.pupBranch,
				assetType: editValues.details?.assetType,
				fundCluster: editValues.details?.fundCluster,
				poNo: editValues.details?.poNo,
				invoiceDate: editValues.details?.invoiceDate,
				invoiceNo: editValues.details?.invoiceNo,
			};

			await Promise.all([
				apiFetch(`/properties/update/${id}`, "PATCH", { property: corePropertyPayload }),
				apiFetch(`/properties/${id}/details`, "PATCH", { details: detailsPayload }),
			]);

			toast.success("Property details updated successfully!", { id: toastId });
			setIsEditing(false);
			await fetchProperties(); // Refetch the data to show the saved changes
		} catch (err) {
			toast.error((err as ApiError).message || "Failed to save changes.", { id: toastId });
			console.error(err);
		}
	};

	if (isLoading) {
		return <DetailsSkeleton />;
	}

	if (error || !property) {
		return <div className='p-8 text-center text-red-500'>{error || "Property not found."}</div>;
	}

	const displayData = isEditing ? editValues : property;

	return (
		<ProtectedRoute>
			<div className='py-12 px-2 desktop:px-8  w-full'>
				{/* Header */}
				<div className='flex items-center justify-between mb-6 max-xl:flex-col max-xl:items-start max-xl:gap-4 max-xl:mb-2'>
					<div className='flex items-center gap-4 max-xl:w-full'>
						{/* <Button variant='outline' size='icon' onClick={handleBack}>
							<ArrowLeft className='h-4 w-4' />
						</Button>
						<h1 className='text-2xl font-bold max-xl:text-3xl'>Property Details</h1>
						<Badge variant='outline' className='ml-2 max-xl:hidden'>
							ID: {id}
						</Badge> */}
						<PageBreadcrumb />
					</div>
					<div className='flex items-center gap-2'>
						{isEditing ? (
							<>
								<Button variant='outline' className='cursor-pointer' onClick={handleCancelClick}>
									<X className='h-4 w-4 mr-2' />
									Cancel
								</Button>
								<Button
									variant={"outline"}
									className='border-green-200 text-green-500 hover:text-green-700 hover:bg-green-100 cursor-pointer transition-colors duration-200 ease-out'
									onClick={handleSaveClick}>
									<Save className='h-4 w-4 mr-2' />
									Save
								</Button>
							</>
						) : (
							<>
								<Button variant='outline' className='max-xl:text-lg max-xl:py-5' onClick={handleEditClick}>
									<Edit className='h-4 w-4 mr-2' />
									Edit
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='outline' className='max-xl:text-lg max-xl:py-5'>
											<MoreHorizontal className='h-4 w-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<DropdownMenuItem className='text-red-600'>
											<Trash2 className='h-4 w-4 mr-2' />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>{" "}
							</>
						)}
					</div>
				</div>

				{/* Content Cards */}
				<div className='grid grid-cols-1 desktop:grid-cols-2 gap-6'>
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 gap-1'>
								<EditableDetailSelect
									label='Category'
									value={displayData?.category}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("category", val, false)}
									options={categoryOptions}
									placeholder='Select a Category'
								/>

								<EditableDetailItem
									label='Product Number'
									value={displayData?.propertyNo}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("propertyNo", val, false)}
								/>
								<EditableDetailItem
									label='Article/Item'
									value={displayData?.details?.article}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("article", val, true)}
								/>
								<EditableDetailItem
									label='Description'
									value={displayData?.description}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("description", val, false)}
								/>
								<EditableDetailItem
									label='Old Property Number'
									value={displayData?.details?.oldPropertyNo}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("oldPropertyNo", val, true)}
								/>
								<EditableDetailItem
									label='Serial Number'
									value={displayData?.serialNo}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("serialNo", val, false)}
								/>
								<EditableDetailItem
									label='Duration'
									value={displayData?.details?.duration}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("duration", val, false)}
								/>
								<EditableDetailItem
									label='Quantity'
									value={displayData?.quantity}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("quantity", val, false)}
									inputType='number'
								/>
								<EditableDetailItem
									label='Unit of Measurement'
									value={displayData?.details?.unitOfMeasure}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("unitOfMeasure", val, true)}
								/>
								<EditableDetailItem
									label='Value'
									value={isEditing ? displayData?.value : displayData?.value ? `₱ ${Number(displayData.value).toLocaleString()}` : null}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("value", val, false)}
									inputType='number'
								/>
								<EditableDetailItem
									label='Total'
									value={displayData?.totalValue ? `₱ ${displayData.totalValue.toLocaleString()}` : null}
									isEditing={false}
									onChange={(val) => handleInputChange("value", val, false)}
									inputType='number'
									isLast
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Assignment & Location</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 gap-1'>
								{/* Assignment info is generally not editable on this screen */}
								<EditableDetailItem label='Assigned To' value={displayData?.assignedTo} isEditing={false} onChange={() => {}} />
								<EditableDetailItem label='Department' value={displayData?.assignedDepartment} isEditing={false} onChange={() => {}} />
								<EditableDetailItem
									label='PUP Branch'
									value={displayData?.details?.pupBranch}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("pupBranch", val, true)}
								/>
								<EditableDetailItem
									label='Specific Location'
									value={displayData?.location_detail}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("location_detail", val, false)}
								/>
								<EditableDetailItem
									label='Condition'
									value={displayData?.details?.condition}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("condition", val, true)}
								/>
								<EditableDetailItem
									label='Remarks'
									value={displayData?.details?.remarks}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("remarks", val, true)}
									isLast
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Acquisition Details</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 gap-1'>
								<EditableDetailItem
									label='Acquisition Date'
									value={displayData?.details?.acquisitionDate?.split("T")[0]}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("acquisitionDate", val, true)}
									inputType='date'
								/>
								<EditableDetailItem
									label='Type of Asset'
									value={displayData?.details?.assetType}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("assetType", val, true)}
								/>
								<EditableDetailItem
									label='Fund Cluster'
									value={displayData?.details?.fundCluster}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("fundCluster", val, true)}
									isLast
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Purchase Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 gap-1'>
								<EditableDetailItem
									label='PO Number'
									value={displayData?.details?.poNo}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("poNo", val, true)}
								/>
								<EditableDetailItem
									label='Invoice Number'
									value={displayData?.details?.invoiceNo}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("invoiceNo", val, true)}
								/>
								<EditableDetailItem
									label='Invoice Date'
									value={displayData?.details?.invoiceDate?.split("T")[0]}
									isEditing={isEditing}
									onChange={(val) => handleInputChange("invoiceDate", val, true)}
									inputType='date'
									isLast
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</ProtectedRoute>
	);
}
