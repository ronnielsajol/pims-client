"use client";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, LoaderCircle, X } from "lucide-react";
import {
	Dialog,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Property, User } from "@/types";
import { Dispatch, SetStateAction } from "react";

interface PropertyTableActionsCellProps {
	property: Property;
	users: User[];
	userRole: string | undefined;
	deleteLoading: boolean;

	// Edit mode states
	editMode: { [propertyId: number]: boolean };
	setEditMode: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>;
	editValues: {
		[propertyId: number]: { propertyNo: string; description: string; quantity: string; value: string; serialNo: string };
	};
	setEditValues: Dispatch<
		SetStateAction<{
			[propertyId: number]: { propertyNo: string; description: string; quantity: string; value: string; serialNo: string };
		}>
	>;

	// Assign mode states
	assignMode: { [propertyId: number]: boolean };
	setAssignMode: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>;
	selectedUser: { [propertyId: number]: string };
	setSelectedUser: Dispatch<SetStateAction<{ [propertyId: number]: string }>>;

	// Action handlers
	handleSaveEdit: (propertyId: number) => Promise<void>;
	handleDelete: (propertyId: number, confirmed: boolean) => Promise<void>;
	handleAssign: (propertyId: number) => Promise<void>;
}

export default function PropertyTableActionsCell({
	property,
	users,
	userRole,
	deleteLoading,
	editMode,
	setEditMode,
	editValues, // eslint-disable-line @typescript-eslint/no-unused-vars
	setEditValues,
	assignMode,
	setAssignMode,
	selectedUser, // eslint-disable-line @typescript-eslint/no-unused-vars
	setSelectedUser,
	handleSaveEdit,
	handleDelete,
	handleAssign,
}: PropertyTableActionsCellProps) {
	const p = property;

	// Don't render actions cell for staff users
	if (userRole === "staff") {
		return null;
	}

	const renderEditModeActions = () => (
		<>
			<Button
				variant='outline'
				className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
				onClick={() => handleSaveEdit(p.id)}>
				Save
			</Button>
			<Button
				variant='outline'
				className='border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer'
				onClick={() => setEditMode((prev) => ({ ...prev, [p.id]: false }))}>
				Cancel
			</Button>
		</>
	);

	const renderAssignModeActions = () => (
		<>
			<Button
				className='border-green-200 bg-transparent text-green-500 hover:text-green-700 hover:bg-green-100 border-2 cursor-pointer transition-colors duration-200 ease-out'
				onClick={() => handleAssign(p.id)}>
				<Check strokeWidth={3} />
			</Button>
			<Button
				className='border-red-200 bg-transparent text-red-500 hover:text-red-700 hover:bg-red-100 border-2 cursor-pointer transition-colors duration-300 ease-out'
				onClick={() =>
					setAssignMode((prev) => ({
						...prev,
						[p.id]: false,
					}))
				}>
				<X strokeWidth={3} />
			</Button>
		</>
	);

	const renderAdminActions = () => (
		<>
			{p.assignedTo && (
				<Button
					variant='outline'
					onClick={() => {
						setSelectedUser((prev) => ({
							...prev,
							[p.id]: String(users.find((u) => u.name === p.assignedTo)?.id ?? ""),
						}));
						setAssignMode((prev) => ({ ...prev, [p.id]: true }));
					}}
					className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
					Reassign
				</Button>
			)}
			<Button
				variant='outline'
				onClick={() => {
					setEditValues((prev) => ({
						...prev,
						[p.id]: {
							propertyNo: p.propertyNo,
							description: p.description,
							quantity: p.quantity,
							value: p.value,
							serialNo: p.serialNo,
						},
					}));
					setEditMode((prev) => ({ ...prev, [p.id]: true }));
				}}
				className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
				Edit
			</Button>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant='outline' className='border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer'>
						Delete
					</Button>
				</DialogTrigger>
				<DialogContent className='xl:max-w-md'>
					<DialogHeader>
						<DialogTitle>Are you sure?</DialogTitle>
						<DialogDescription>
							{p?.assignedTo
								? "This property is currently assigned. Do you still want to delete it?"
								: "Do you want to delete this property?"}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline' className='cursor-pointer'>
								Cancel
							</Button>
						</DialogClose>
						<Button variant='destructive' className='cursor-pointer' onClick={() => handleDelete(p.id, true)}>
							{deleteLoading ? <LoaderCircle className='animate-spin h-5 w-5 mx-auto' /> : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);

	const renderPropertyCustodianActions = () => (
		<>
			{p.assignedTo && (
				<Button
					variant='outline'
					onClick={() => {
						setSelectedUser((prev) => ({
							...prev,
							[p.id]: String(users.find((u) => u.name === p.assignedTo)?.id ?? ""),
						}));
						setAssignMode((prev) => ({ ...prev, [p.id]: true }));
					}}
					className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
					disabled={p.reassignmentStatus === "pending"}>
					Reassign
				</Button>
			)}
		</>
	);

	const renderActions = () => {
		if (editMode[p.id]) {
			return renderEditModeActions();
		}

		if (assignMode[p.id]) {
			return renderAssignModeActions();
		}

		if (userRole === "admin" || userRole === "master_admin") {
			return renderAdminActions();
		}

		if (userRole === "property_custodian") {
			return renderPropertyCustodianActions();
		}

		return null;
	};

	return (
		<TableCell className='pr-4'>
			<div className='h-full flex gap-2 items-center justify-end'>{renderActions()}</div>
		</TableCell>
	);
}
