"use client";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePathname } from "next/navigation";
import AdminDashboard from "@/components/dashboards/admin-dashboard";
import CustodianDashboard from "@/components/dashboards/custodian-dashboard";
import StaffDashboard from "@/components/dashboards/staff-dashboard";

export default function DashboardPage() {
	const { user } = useAuth();
	const pathName = usePathname();

	console.log(pathName);

	return (
		<ProtectedRoute>
			<div className='max-xl:p-0.5 laptop:p-5 desktop:p-8 w-full'>
				{(user?.role === "admin" || user?.role === "master_admin") && <AdminDashboard />}
				{user?.role === "property_custodian" && <CustodianDashboard />}
				{user?.role === "staff" && <StaffDashboard />}
			</div>
		</ProtectedRoute>
	);
}
