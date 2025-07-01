"use client";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ApiError, Property, User } from "@/types";
import { useRef, useState, Dispatch, SetStateAction, useMemo } from "react";
import { toast } from "sonner";
import { apiFetch, apiFetchWithStatus } from "@/lib/api";
import PropertyTableHeader from "./PropertyTableHeader";
import PropertyTableBody from "./PropertyTableBody";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface PaginatedResponse {
	success: boolean;
	data: Property[];
	meta: {
		page: number;
		pageSize: number;
		pageCount: number;
		totalCount: number;
	};
}
interface PropertyTableProps {
	currentPage: number;
	addMode: boolean;
	setAddMode: (mode: boolean) => void;
}

interface ColumnDefinition {
	key: string;
	label: string;
	className?: string;
	isVisible: (userRole?: string) => boolean;
}

const columnDefinitions: ColumnDefinition[] = [
	{ key: "id", label: "ID", className: "w-[50px]", isVisible: () => true },
	{ key: "productNumber", label: "Product Number", className: "w-1/12", isVisible: () => true },
	{ key: "description", label: "Description", className: "w-1/12", isVisible: () => true },
	{ key: "quantity", label: "Quantity", className: "w-1/12", isVisible: () => true },
	{ key: "value", label: "Value", className: "w-1/12", isVisible: () => true },
	{ key: "serialNumber", label: "Serial Number", className: "w-1/8", isVisible: () => true },
	{
		key: "assignedTo",
		label: "Assigned To",
		isVisible: (role) => ["admin", "master_admin", "property_custodian"].includes(role ?? ""),
	},
	{ key: "department", label: "Department", isVisible: (role) => !["staff", "property_custodian"].includes(role ?? "") },
	{ key: "location", label: "Location", isVisible: (role) => role === "property_custodian" },
	{
		key: "actions",
		label: "Actions",
		className: "w-[120px]",
		isVisible: (role) => ["admin", "master_admin", "property_custodian"].includes(role ?? ""),
	},
];

export default function PropertyTable({ currentPage, addMode, setAddMode }: PropertyTableProps) {
	const { user } = useAuth();
	const userRole = user?.role;
	const queryClient = useQueryClient();

	const { data: propertiesResponse, isLoading } = useQuery({
		queryKey: ["properties", currentPage],
		queryFn: async () => {
			const res = await apiFetch<PaginatedResponse>(`/properties?page=${currentPage}&pageSize=10`);
			return res;
		},
		enabled: !!user,
	});

	const { data: users } = useQuery({
		queryKey: ["usersForTable", userRole],
		queryFn: async () => {
			if (userRole === "property_custodian") return (await apiFetch<{ data: User[] }>("/users?roles=staff")).data;
			if (userRole === "admin" || userRole === "master_admin")
				return (await apiFetch<{ data: User[] }>("/users?roles=property_custodian")).data;
			return [];
		},
		enabled: !!user && userRole !== "staff",
	});

	const properties = propertiesResponse?.data || [];

	const onMutationSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["properties"] });
	};

	const assignMutation = useMutation({
		onMutate: () => toast.loading("Assigning property..."),
		mutationFn: (variables: { propertyId: number; userId: string }) =>
			apiFetchWithStatus("/properties/assign", "POST", { ...variables }),
		onSuccess: (data, variables, context) => {
			if (data.status === 202) toast.success("Reassignment request submitted!", { id: context });
			else toast.success("Property assigned successfully!", { id: context });
			onMutationSuccess();
			setAssignMode((prev) => ({ ...prev, [variables.propertyId]: false }));
			setPendingReassign(null);
			setOpenDialog(null);
		},
		onError: (error: Error) => toast.error(`Assignment failed: ${error.message}`),
	});

	const updateMutation = useMutation({
		onMutate: () => toast.loading("Updating property..."),
		mutationFn: (variables: { propertyId: number; values: Partial<Property> }) =>
			apiFetch(`/properties/update/${variables.propertyId}`, "PATCH", { property: variables.values }),
		onSuccess: (data, variables, context) => {
			toast.success("Property updated!", { id: context });
			onMutationSuccess();
		},
		onError: (error: ApiError, variables, context) => toast.error(`Update failed: ${error.message}`, { id: context }),
	});

	const deleteMutation = useMutation({
		onMutate: () => toast.loading("Deleting property..."),
		mutationFn: (variables: { propertyId: number; confirmed: boolean }) =>
			apiFetch(`/properties/${variables.propertyId}`, "DELETE", { confirmed: variables.confirmed }),
		onSuccess: (data, variables, context) => {
			toast.success("Property deleted successfully!", { id: context });
			onMutationSuccess();
		},
		onError: (error: ApiError, variables, context) => toast.error(`Delete failed: ${error.message}`, { id: context }),
	});

	const addPropertyMutation = useMutation({
		onMutate: () => toast.loading("Adding property..."),
		mutationFn: (newPropertyData: Partial<Property>) => apiFetch("/properties/add", "POST", { property: newPropertyData }),
		onSuccess: (data, variables, context) => {
			toast.success("Property added successfully!", { id: context });
			onMutationSuccess();
			setNewProperty({ propertyNo: "", description: "", quantity: "", value: "", serialNo: "" });
			setAddMode(false);
		},
		onError: (error: ApiError, variables, context) => {
			if (error.status === 409) toast.error(error.message || "This property number already exists.", { id: context });
			else toast.error(error.message || "Failed to add property.", { id: context });
		},
	});

	const updateLocationMutation = useMutation({
		onMutate: () => toast.loading("Updating location..."),
		mutationFn: (variables: { propertyId: number; newLocation: string }) =>
			apiFetch(`/properties/${variables.propertyId}/location-detail`, "PATCH", {
				property: { location_detail: variables.newLocation },
			}),
		onSuccess: (data, variables, context) => {
			toast.success("Location updated!", { id: context });
			onMutationSuccess();
		},
		onError: (error: ApiError, variables, context) =>
			toast.error(`Location update failed: ${error.message}`, { id: context }),
	});

	const createPrintJobMutation = useMutation({
		onMutate: () => toast.loading("Adding to print queue..."),
		mutationFn: (propertyId: number) => apiFetch("/print-jobs/create", "POST", { propertyId }),
		onSuccess: (data, variables, context) => toast.success("Property successfully added to print queue!", { id: context }),
		onError: (error: ApiError, variables, context) => {
			if (error.status === 409) toast.error(error.message || "This property is already in the print queue.", { id: context });
			else toast.error(error.message || "Failed to add to queue.", { id: context });
		},
	});

	const createDisplayJobMutation = useMutation({
		onMutate: () => toast.loading("Adding to display queue..."),
		mutationFn: (propertyId: number) => apiFetch("/display-jobs/create", "POST", { propertyId }),
		onSuccess: (data, variables, context) =>
			toast.success("Property successfully added to display queue!", { id: context }),
		onError: (error: ApiError) => {
			if (error.status === 409) {
				toast.error(error.message || "This property is already in the display queue.");
			} else {
				toast.error(error.message || "Failed to add to queue.");
			}
		},
	});

	const [selectedUser, setSelectedUser] = useState<{ [propertyId: number]: string }>({});
	const [assignMode, setAssignMode] = useState<{ [propertyId: number]: boolean }>({});
	const [openDialog, setOpenDialog] = useState<number | null>(null);
	const [openUserSelect, setOpenUserSelect] = useState<{ [propertyId: number]: boolean }>({});
	const [pendingReassign, setPendingReassign] = useState<{ propertyId: number; newUserId: string } | null>(null);
	const [newProperty, setNewProperty] = useState({
		propertyNo: "",
		description: "",
		quantity: "",
		value: "",
		serialNo: "",
	});
	const [editMode, setEditMode] = useState<{ [propertyId: number]: boolean }>({});
	const [editValues, setEditValues] = useState<{
		[propertyId: number]: {
			propertyNo: string;
			description: string;
			quantity: string;
			value: string;
			serialNo: string;
		};
	}>({});
	const addRowRef = useRef<HTMLTableRowElement | null>(null);

	const handleAssign = async (propertyId: number, overrideConfirm = false) => {
		const userId = selectedUser[propertyId];
		if (!userId) return toast.warning("Please select a user");

		const property = properties.find((p) => p.id === propertyId);
		const isReassigning = !!property?.assignedTo;

		// Check for reassignment and show dialog if needed
		if (isReassigning && !overrideConfirm) {
			const currentlyAssignedUser = users?.find((u) => u.name === property.assignedTo);
			if (userId !== String(currentlyAssignedUser?.id)) {
				setPendingReassign({ propertyId, newUserId: userId });
				setOpenDialog(propertyId);
				return;
			} else {
				return toast.warning("This property is already assigned to this user.");
			}
		}
		assignMutation.mutate({ propertyId, userId });
	};

	const handleSaveEdit = async (propertyId: number, values: Partial<Property>) => {
		updateMutation.mutate({ propertyId, values });
		setEditMode((prev) => ({ ...prev, [propertyId]: false }));
	};

	const handleDelete = async (propertyId: number) => {
		deleteMutation.mutate({ propertyId, confirmed: true });
	};

	const handleSaveNewProperty = () => {
		addPropertyMutation.mutate(newProperty);
	};
	const handleLocationUpdate = async (propertyId: number, newLocation: string) => {
		updateLocationMutation.mutate({ propertyId, newLocation });
	};

	const allAvailableLocations = useMemo(() => {
		const locations = properties
			.map((p) => p.location_detail)
			.filter((loc): loc is string => typeof loc === "string" && loc.trim() !== ""); // Filter out empty or undefined
		return [...new Set(locations)].sort(); // Unique and sorted
	}, [properties]);

	const handleCreatePrintJob = async (propertyId: number) => {
		createPrintJobMutation.mutate(propertyId);
	};

	const handleDisplayData = (propertyId: number) => {
		createDisplayJobMutation.mutate(propertyId);
	};

	const visibleColumns = useMemo(() => columnDefinitions.filter((col) => col.isVisible(userRole)), [userRole]);

	const SkeletonRow = () => (
		<TableRow>
			{visibleColumns.map((col) => (
				<TableCell key={col.key}>
					<Skeleton className='h-5 w-full rounded-md' />
				</TableCell>
			))}
		</TableRow>
	);

	return (
		<Table className='w-full table-auto'>
			<PropertyTableHeader userRole={userRole} />
			{isLoading ? (
				<>
					<TableBody>
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
					</TableBody>
				</>
			) : (
				<PropertyTableBody
					isSendingToDisplay={createDisplayJobMutation.isPending}
					properties={properties}
					users={users || []}
					userRole={userRole}
					addMode={addMode}
					setAddMode={setAddMode as Dispatch<SetStateAction<boolean>>}
					selectedUser={selectedUser}
					setSelectedUser={setSelectedUser}
					assignMode={assignMode}
					setAssignMode={setAssignMode}
					openDialog={openDialog}
					setOpenDialog={setOpenDialog}
					openUserSelect={openUserSelect}
					setOpenUserSelect={setOpenUserSelect}
					pendingReassign={pendingReassign}
					setPendingReassign={setPendingReassign}
					newProperty={newProperty}
					setNewProperty={setNewProperty}
					editMode={editMode}
					setEditMode={setEditMode}
					editValues={editValues}
					setEditValues={setEditValues as Dispatch<SetStateAction<{ [propertyId: number]: Partial<Property> }>>}
					addRowRef={addRowRef}
					allAvailableLocations={allAvailableLocations}
					// Handlers
					handleAssign={handleAssign}
					handleSaveEdit={handleSaveEdit}
					handleDelete={handleDelete}
					handleLocationUpdate={handleLocationUpdate}
					handleCreatePrintJob={handleCreatePrintJob}
					handleDisplayData={handleDisplayData}
					handleSaveNewProperty={handleSaveNewProperty}
					isAssigning={assignMutation.isPending}
					isUpdating={updateMutation.isPending}
					isDeleting={deleteMutation.isPending}
					isAdding={addPropertyMutation.isPending}
					isUpdatingLocation={updateLocationMutation.isPending}
					isCreatingPrintJob={createPrintJobMutation.isPending}
				/>
			)}
		</Table>
	);
}
