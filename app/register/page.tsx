"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ApiError, User } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [department, setDepartment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { login } = useAuth();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		const toastId = toast.loading("Creating account...");

		setIsSubmitting(true);

		try {
			const res = await apiFetch<{ success: boolean; message: string; data: { user: User } }>("/auth/sign-up", "POST", {
				name,
				email,
				password,
				department,
			});
			toast.success("Account creation successful!", { id: toastId });

			login(res.data.user);
			router.push("/dashboard");
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("Registration API Error:", error);
			if (error.status === 409) {
				toast.error("An account with this email already exists.", { id: toastId });
			} else {
				toast.error(error.message || "An unknown error occurred.", { id: toastId });
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='max-xl:relative  laptop:grid laptop:grid-cols-3  gap-y-0 gap-x-0 min-h-screen '>
			<div className='laptop:col-span-2 bg-[#c3c3c3] bg-[url("/images/pup-bg.jpg")] bg-cover h-screen w-full'></div>
			<div className='bg-[#c3c3c3] flex justify-start items-center flex-col pt-20 px-4 max-xl:absolute max-xl:left-0 max-xl:top-0 max-xl:backdrop-blur-[200px] max-xl:h-full'>
				<Image src='/images/pup-logo.png' alt='PUP Logo' height={88} width={88} />
				<h2 className='max-xl:text-center text-[2rem] font-source-bold'>PUP-PSMO PIMS Module</h2>
				<p>Create an Account</p>
				<form onSubmit={handleRegister} className='space-y-4 my-5 w-full'>
					<div className='space-y-2 text-black/70'>
						<Label htmlFor='name' className='pl-0.5'>
							Full Name
						</Label>
						<Input
							type='text'
							placeholder='Name'
							className='w-full p-2 bg-[#e8f0fe] rounded'
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className='space-y-2 text-black/70'>
						<Label htmlFor='department' className='pl-0.5'>
							Department
						</Label>
						<Input
							type='text'
							placeholder='Department'
							className='w-full p-2 bg-[#e8f0fe] rounded'
							value={department}
							onChange={(e) => setDepartment(e.target.value)}
							required
						/>
					</div>
					<div className='space-y-2 text-black/70'>
						<Label htmlFor='email' className='pl-0.5'>
							Email Address
						</Label>
						<Input
							type='email'
							placeholder='Email'
							className='w-full p-2 bg-[#e8f0fe] rounded'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className='space-y-2 text-black/70'>
						<Label htmlFor='password' className='pl-0.5'>
							Password
						</Label>
						<Input
							type='password'
							placeholder='Password'
							className='w-full p-2 bg-[#e8f0fe] rounded'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<Button
						className='bg-blue-600 text-white px-4 py-2 rounded w-full cursor-pointer hover:bg-blue-500 max-w-full '
						disabled={isSubmitting}>
						{isSubmitting ? <LoaderCircle className='animate-spin' /> : "Register"}
					</Button>
				</form>
				<p className='text-center text-sm text-gray-600 mb-2'>
					Already have an account?{" "}
					<Link href='/' className='font-medium text-blue-600 hover:text-blue-500 cursor-pointer'>
						Sign In
					</Link>
				</p>
				<p className='text-center'>
					By using this service, you understood and agree to the PUP Online Services{" "}
					<Link
						href='https://www.pup.edu.ph/terms/'
						target='_blank'
						className='text-[#007bff] hover:text-[#0056b3] cursor-pointer'>
						Terms of Use
					</Link>{" "}
					and{" "}
					<Link
						href='https://www.pup.edu.ph/privacy/'
						target='_blank'
						className='text-[#007bff] hover:text-[#0056b3] cursor-pointer'>
						Privacy Statement
					</Link>
				</p>
			</div>
		</div>
	);
}
