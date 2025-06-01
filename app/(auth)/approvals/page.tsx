"use client"; // This component needs to be a client component to use hooks

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api"; // Your API fetch utilities
import { ApiError, User, Property } from "@/types"; // Your custom types
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Define the shape of the data we expect from the API
interface ReassignmentRequest {
	requestId: number;
	property: Property;
	fromStaff: User;
	toStaff: User;
	requestedBy: User;
	status: "pending" | "approved" | "denied";
	createdAt: string;
}

export default function ApprovalsPage() {
	const { token } = useAuth();
	// State to hold the list of pending requests
	const [requests, setRequests] = useState<ReassignmentRequest[]>([]);
	// State for loading and error handling
	const [error, setError] = useState<string | null>(null);

	// Function to fetch pending requests from the backend
	const fetchPendingRequests = async () => {
		try {
			// We don't need the status here, so the original apiFetch is fine
			const pendingRequests = await apiFetch<{ data: ReassignmentRequest[] }>(
				"/properties/reassignments/pending",
				"GET",
				undefined,
				token ?? "" // Replace with how you get your token
			);
			setRequests(pendingRequests.data);
		} catch (err) {
			setError("Failed to fetch pending requests. Please try again later.");
			console.error(err);
		}
	};

	// Fetch data when the component mounts
	useEffect(() => {
		fetchPendingRequests();
	}, []);

	// Function to handle the approve/deny action
	const handleReviewRequest = async (requestId: number, newStatus: "approved" | "denied") => {
		const toastId = toast.loading(`Submitting ${newStatus} decision...`);

		try {
			await apiFetch("/properties/reassignments/review", "POST", { requestId, newStatus }, token ?? "");

			toast.success("Decision submitted successfully!", { id: toastId });

			// Remove the processed request from the UI for instant feedback
			setRequests((prevRequests) => prevRequests.filter((req) => req.requestId !== requestId));
		} catch (err) {
			const errorMessage = (err as ApiError).message || "An unknown error occurred.";
			toast.error(errorMessage, { id: toastId });
		}
	};

	// Render an error state
	if (error) {
		return (
			<Alert variant='destructive' className='m-4'>
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<ProtectedRoute>
			<div className='p-8 w-full'>
				<div className='flex w-full justify-start'>
					<h2 className='text-2xl font-bold mb-4'>All Pending Reassignments</h2>
				</div>
				<div className='rounded border shadow-md'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Property</TableHead>
								<TableHead>From (Current User)</TableHead>
								<TableHead>To (New User)</TableHead>
								<TableHead>Requested By</TableHead>
								<TableHead className='text-right'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requests.map((request) => (
								<TableRow key={request.requestId}>
									<TableCell>
										<div className='font-medium'>{request.property.description}</div>
										<div className='text-sm text-muted-foreground'>{request.property.propertyNo}</div>
									</TableCell>
									<TableCell>{request.fromStaff.name}</TableCell>
									<TableCell>{request.toStaff.name}</TableCell>
									<TableCell>{request.requestedBy.name}</TableCell>
									<TableCell className='text-right space-x-2'>
										<Button
											variant={"outline"}
											className='border-red-200 text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50'
											onClick={() => handleReviewRequest(request.requestId, "denied")}>
											Deny
										</Button>
										<Button
											variant={"outline"}
											className='border-green-200 text-green-500 cursor-pointer
                    hover:text-green-700 hover:bg-green-50'
											onClick={() => handleReviewRequest(request.requestId, "approved")}>
											Approve
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</ProtectedRoute>
	);
}
