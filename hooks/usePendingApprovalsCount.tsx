import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface CountResponse {
	success: boolean;
	count: number;
}

export const usePendingApprovalsCount = () => {
	const { user } = useAuth();

	return useQuery({
		queryKey: ["pendingApprovalsCount"],

		queryFn: async () => {
			const res = await apiFetch<CountResponse>("/properties/reassignments/pending/count");
			return res.count;
		},

		enabled: !!user && user.role === "master_admin",

		refetchInterval: 60000,
	});
};
