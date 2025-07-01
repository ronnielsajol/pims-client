"use client";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, LoaderCircle, MoreHorizontal, X } from "lucide-react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Property, User } from "@/types";
import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";

interface PropertyTableActionsCellProps {
	property: Property;
	users: User[];
	userRole: string | undefined;

	editMode: { [propertyId: number]: boolean }; // Changed from boolean
	setEditMode: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>;
	editValues: Partial<Property> | undefined;
	setEditValues: (newValues: Partial<Property>) => void; // Added missing prop
	assignMode: { [propertyId: number]: boolean }; // Changed from boolean
	setAssignMode: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>; // Changed from simple function
	selectedUser: { [propertyId: number]: string }; // Added missing prop
	setSelectedUser: Dispatch<SetStateAction<{ [propertyId: number]: string }>>; // Added missing prop

	handleSaveEdit: () => void;
	handleDelete: () => void;
	handleAssign: () => void;
	handleCreatePrintJob: () => void;
	handleDisplayData: () => void;

	// Loading states from parent's mutations
	isUpdating: boolean;
	deleteLoading: boolean; // Added missing prop (was isDeleting in parent)
	isAssigning: boolean;
	isCreatingPrintJob: boolean;
	isSendingToDisplay: boolean; // <-- 2. ADDED A NEW LOADING STATE PROP
}
export default function PropertyTableActionsCell({
	property,
	users,
	userRole,
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
	handleCreatePrintJob,
	handleDisplayData,
	isUpdating,
	deleteLoading,
	isAssigning,
	isCreatingPrintJob,
}: PropertyTableActionsCellProps) {
	const p = property;
	const router = useRouter();

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Don't render actions cell for staff users
	if (userRole === "staff") {
		return null;
	}

	const renderEditModeActions = () => (
		<>
			<Button
				variant='outline'
				className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
				onClick={() => handleSaveEdit()}
				disabled={isUpdating}>
				{isUpdating ? <LoaderCircle className='animate-spin h-4 w-4' /> : "Save"}
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
				variant={"outline"}
				className='border-green-200 text-green-500 hover:text-green-700 hover:bg-green-100 cursor-pointer transition-colors duration-200 ease-out'
				onClick={() => handleAssign()}
				disabled={isAssigning}>
				{isAssigning ? <LoaderCircle className='animate-spin h-4 w-4' /> : <Check strokeWidth={3} />}
			</Button>
			<Button
				variant={"outline"}
				className='border-red-200 text-red-500 hover:text-red-700 hover:bg-red-100 cursor-pointer transition-colors duration-200 ease-out'
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
					setEditValues({
						propertyNo: p.propertyNo,
						description: p.description,
						quantity: p.quantity,
						value: p.value,
						serialNo: p.serialNo,
					});
					setEditMode((prev) => ({ ...prev, [p.id]: true }));
				}}
				className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
				Edit
			</Button>
			<Button
				variant='outline'
				className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
				onClick={() => {
					router.push(`/properties/${p.id}/details`);
				}}>
				Details
			</Button>

			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' size='icon' className='h-8 w-8'>
						<MoreHorizontal className='h-4 w-4' />
						<span className='sr-only'>More</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setIsDeleteDialogOpen(true)}
						onSelect={(e) => e.preventDefault()}
						className='text-red-500 hover:text-red-500! hover:bg-red-50 '>
						Delete
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleCreatePrintJob()} disabled={isCreatingPrintJob}>
						{isCreatingPrintJob ? "Printing..." : "Print QR code"}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
						<Button
							variant='destructive'
							className='cursor-pointer'
							onClick={() => {
								handleDelete();
								setIsDeleteDialogOpen(false);
							}}
							disabled={deleteLoading}>
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

	const renderDeveloperActions = () => {
		return (
			<>
				<Button
					onClick={() => handleDisplayData()}
					variant='outline'
					className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
					Display
				</Button>
			</>
		);
	};
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
		if (userRole === "developer") {
			return renderDeveloperActions();
		}

		return null;
	};

	return (
		<TableCell className='pr-4 max-desktop:pr-2'>
			<div className='h-full flex gap-2 items-center justify-end '>{renderActions()}</div>
		</TableCell>
	);
}
