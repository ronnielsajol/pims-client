"use client";

import React from "react";
import { Property, User } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog"; //
import { Check, ChevronsUpDown } from "lucide-react";

interface UserSelectionCellProps {
	property: Property;
	isAssignMode: boolean;
	users: User[];

	isUserSelectPopoverOpen: boolean;
	onUserSelectPopoverOpenChange: (isOpen: boolean) => void;

	selectedUserIdInPopover?: string;
	onSelectUserInPopover: (userId: string) => void;

	onSetAssignMode: () => void;
	userRole?: string;
	isReassignDialogOpen: boolean; // True if openDialog === property.id
	onReassignDialogClose: () => void; // Calls setOpenDialog(null)
	pendingReassignForDialog: { propertyId: number; newUserId: string } | null;
	onReassignDialogConfirm: () => void; // Logic from DialogFooter Confirm button
	onReassignDialogCancel: () => void; // Logic from DialogFooter Cancel button
}

export default function UserSelectionCell({
	property,
	isAssignMode,
	users,
	isUserSelectPopoverOpen,
	onUserSelectPopoverOpenChange,
	selectedUserIdInPopover,
	onSelectUserInPopover,
	onSetAssignMode,
	isReassignDialogOpen,
	onReassignDialogClose,
	pendingReassignForDialog,
	onReassignDialogConfirm,
	onReassignDialogCancel,
	userRole,
}: UserSelectionCellProps) {
	const p = property;

	return (
		<div className='max-w-[300px]'>
			{isAssignMode ? (
				<div className='flex gap-2 items-center'>
					<Popover open={isUserSelectPopoverOpen} onOpenChange={onUserSelectPopoverOpenChange}>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								role='combobox'
								className={cn("w-[180px] justify-between", !selectedUserIdInPopover && "text-gray-500")}>
								{selectedUserIdInPopover ? users.find((u) => u.id === Number(selectedUserIdInPopover))?.name : "Select Staff"}
								<ChevronsUpDown className='opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-[180px] p-0'>
							<Command>
								<CommandInput placeholder='Search for staff...' />
								<CommandEmpty>No staff found.</CommandEmpty>
								<CommandGroup>
									{users.map((u) => (
										<CommandItem
											key={u.id}
											value={u.name}
											onSelect={() => {
												onSelectUserInPopover(String(u.id));
												onUserSelectPopoverOpenChange(false); // Close popover on select
											}}
											className='cursor-pointer'>
											{u.name}
											<Check
												className={cn("ml-auto text-[#800000]", selectedUserIdInPopover === String(u.id) ? "opacity-100" : "opacity-0")}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>
					{/* Reassignment Confirmation Dialog - shown when assignMode is true and openDialog matches property.id */}
					<Dialog
						open={isReassignDialogOpen}
						onOpenChange={(isOpen) => {
							if (!isOpen) onReassignDialogClose();
						}}>
						<DialogContent className='xl:max-w-md'>
							<DialogHeader>
								<DialogTitle>Reassign Property</DialogTitle>
								<DialogDescription>
									This property is currently assigned to <strong>{p.assignedTo}</strong>. Do you want to reassign it to{" "}
									<strong>{users.find((u) => u.id === Number(pendingReassignForDialog?.newUserId))?.name || "the selected user"}</strong>?
								</DialogDescription>
							</DialogHeader>
							<DialogFooter className='mt-4'>
								<Button onClick={onReassignDialogConfirm} className='bg-green-600 hover:bg-green-700 text-white'>
									Confirm
								</Button>
								<Button variant='outline' onClick={onReassignDialogCancel}>
									Cancel
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			) : p.assignedTo ? (
				<>
					<Badge variant='outline' className='font-normal text-muted-foreground py-1 px-4 rounded-3xl'>
						{p.assignedTo}{" "}
					</Badge>
					{p.reassignmentStatus === "pending" && userRole === "property_custodian" && (
						<Badge variant='outline' className='ml-2 border-yellow-500 text-yellow-600'>
							Pending
						</Badge>
					)}
				</>
			) : (
				<Button
					className='cursor-pointer px-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
					variant='outline'
					size='sm'
					onClick={onSetAssignMode}>
					Assign
				</Button>
			)}
		</div>
	);
}
