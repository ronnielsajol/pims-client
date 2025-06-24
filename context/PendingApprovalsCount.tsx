"use client";
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { apiFetch } from "@/lib/api"; // Your API fetch
import { useAuth } from "./AuthContext"; // Assuming you have an AuthContext for user
import { Property, User } from "@/types";

interface PendingApprovalsContextType {
	pendingCount: number;
	fetchPendingCount: () => Promise<void>;
}

interface ReassignmentRequest {
	requestId: number;
	property: Property;
	fromStaff: User;
	toStaff: User;
	requestedBy: User;
	status: "pending" | "approved" | "denied";
	createdAt: string;
}

const PendingApprovalsContext = createContext<PendingApprovalsContextType | undefined>(undefined);

export const PendingApprovalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [pendingCount, setPendingCount] = useState(0);
	const { user } = useAuth(); // Get user from your auth context

	const fetchPendingCount = useCallback(async () => {
		if (user?.role === "master_admin" && user) {
			try {
				const response = await apiFetch<{ data?: ReassignmentRequest[] }>(
					"/properties/reassignments/pending",
					"GET",
					undefined
				); // Use a more general type for 'data'
				if (response && response.data && Array.isArray(response.data)) {
					setPendingCount(response.data.length);
				} else {
					setPendingCount(0);
				}
			} catch (error) {
				console.error("Failed to fetch pending reassignments count:", error);
				setPendingCount(0);
			}
		} else {
			setPendingCount(0); // Reset if not master admin
		}
	}, [user]);

	useEffect(() => {
		fetchPendingCount(); // Initial fetch
		const interval = setInterval(fetchPendingCount, 120000); // Polling
		window.addEventListener("focus", fetchPendingCount); // Refetch on focus

		return () => {
			clearInterval(interval);
			window.removeEventListener("focus", fetchPendingCount);
		};
	}, [fetchPendingCount]); // fetchPendingCount depends on user

	return (
		<PendingApprovalsContext.Provider value={{ pendingCount, fetchPendingCount }}>
			{children}
		</PendingApprovalsContext.Provider>
	);
};

export const usePendingApprovals = () => {
	const context = useContext(PendingApprovalsContext);
	if (context === undefined) {
		throw new Error("usePendingApprovals must be used within a PendingApprovalsProvider");
	}
	return context;
};
