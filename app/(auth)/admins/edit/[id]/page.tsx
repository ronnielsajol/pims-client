"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError, Role, User } from "@/types";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const availableRoles: Role[] = ["staff", "property_custodian", "admin", "master_admin"];

export default function EditAdminsPage() {
	const params = useParams();
	const userId = params?.id as string;

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [department, setDepartment] = useState("");
	const [role, setRole] = useState<User["role"]>("admin");
	const [newPassword, setNewPassword] = useState("");
	const [originalName, setOriginalName] = useState(""); // Store original name for title

	// State for loading and page management
	const [isLoading, setIsLoading] = useState(true); // For initial data fetch
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user: loggedInUser } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!userId) return;

		const fetchUser = async () => {
			setIsLoading(true);
			try {
				const res = await apiFetch<{ success: boolean; data: User[] }>(`/users/${userId}`);

				if (!res.data || res.data.length === 0) {
					throw new Error("User not found");
				}

				const userData = res.data[0];
				console.log("Fetched user data:", userData);

				// Pre-populate the form fields
				setOriginalName(userData.name);
				setName(userData.name);
				setEmail(userData.email);
				setDepartment(userData.department || "");
				setRole(userData.role);
			} catch (error) {
				console.error("Failed to fetch user data:", error);
				toast.error("Failed to load user data.");
				router.push("/admins"); // Redirect if user not found
			} finally {
				setIsLoading(false);
			}
		};

		fetchUser();
	}, [userId, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const toastId = toast.loading("Updating account...");
		setIsSubmitting(true);

		try {
			const updateData: Partial<User & { password?: string }> = {
				name,
				email,
				role,
				department: department,
			};

			// Only include the password if a new one has been typed.
			if (newPassword.trim() !== "") {
				updateData.password = newPassword;
			}

			await apiFetch(`/users/${userId}`, "PATCH", updateData);
			toast.success("Account updated successfully!", { id: toastId });
			router.push("/admins");
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("API Error:", error.message || error.error);
			toast.error(error.message || "Failed to update account.", { id: toastId });
		} finally {
			setIsSubmitting(false);
		}
	};

	// Show a loading state while fetching user data
	if (isLoading) {
		return <div className='p-8'>Loading user data...</div>;
	}

	return (
		<ProtectedRoute>
			<div className='relative p-2 laptop:p-8 laptop:w-10/12 mx-auto flex flex-col justify-start items-center'>
				<div className='container max-w-3xl py-4 laptop:py-10'>
					<Link
						href='/users'
						className='inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6'>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to Admins
					</Link>

					<form onSubmit={handleSubmit}>
						<Card>
							<CardHeader className='space-y-1'>
								<div className='flex items-center gap-2'>
									<UserIcon className='h-5 w-5 text-primary' />
									<CardTitle className='text-2xl'>Edit Admin: {originalName}</CardTitle>
								</div>
								<CardDescription>Update the details for this user account.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Full Name</Label>
									<Input value={name} required id='name' onChange={(e) => setName(e.target.value)} />
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email Address</Label>
									<Input value={email} required id='email' type='email' onChange={(e) => setEmail(e.target.value)} />
								</div>
								<div className='space-y-2'>
									<Label htmlFor='department'>Department</Label>
									<Input
										value={department}
										id='department'
										placeholder='e.g., ICTO or leave blank'
										onChange={(e) => setDepartment(e.target.value)}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='role'>Role</Label>
									<Select value={role} onValueChange={(value) => setRole(value as User["role"])}>
										<SelectTrigger>
											<SelectValue placeholder='Select a role' />
										</SelectTrigger>
										<SelectContent>
											{availableRoles.map((roleOption) => (
												<SelectItem
													key={roleOption}
													value={roleOption}
													disabled={loggedInUser?.role === "admin" && (roleOption === "admin" || roleOption === "master_admin")}>
													{roleOption.charAt(0).toUpperCase() + roleOption.slice(1).replace("_", " ")}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className='text-xs text-muted-foreground'>Only Master Admins can set Admin roles.</p>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='password'>New Password</Label>
									<Input
										value={newPassword}
										id='password'
										type='password'
										placeholder='Leave blank to keep current password'
										onChange={(e) => setNewPassword(e.target.value)}
									/>
								</div>
							</CardContent>
							<CardFooter className='flex justify-between border-t pt-6'>
								<Button variant='outline' type='button' onClick={() => router.push("/users")}>
									Cancel
								</Button>
								<Button type='submit' className='gap-2 cursor-pointer' disabled={isSubmitting}>
									<Save className='h-4 w-4' />
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</CardFooter>
						</Card>
					</form>
				</div>
			</div>
		</ProtectedRoute>
	);
}
