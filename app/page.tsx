"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ApiError, User } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function Home() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setLoading] = useState(false);
	const [isSuccess, setSuccess] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const { login } = useAuth();
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setSuccess(true);
		setErrorMessage("");

		try {
			const res = await apiFetch<{ success: boolean; message: string; data: { token: string; user: User } }>(
				"/auth/sign-in",
				"POST",
				{
					email,
					password,
				}
			);
			console.log("Login response:", res);

			if (res.success) {
				const { token, user } = res.data;
				login(token, user);
				router.push("/dashboard");
			} else {
				setSuccess(false);
				setErrorMessage(res.message || "Something went wrong");
			}
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("API Error:", error.message || error.error);
			setSuccess(false);
			setErrorMessage(error.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className='max-xl:relative  laptop:grid laptop:grid-cols-3  gap-y-0 gap-x-0 min-h-screen '>
			<div className='laptop:col-span-2 bg-[#c3c3c3] bg-[url("/images/pup-bg.jpg")] bg-cover h-screen w-full'></div>
			<div className='bg-[#c3c3c3] flex justify-start items-center flex-col pt-20 px-4 max-xl:absolute max-xl:left-0 max-xl:top-0 max-xl:backdrop-blur-[200px] max-xl:h-full'>
				<Image src='/images/pup-logo.png' alt='PUP Logo' height={88} width={88} />
				<h2 className='max-xl:text-center text-[2rem] font-source-bold'>PUP-PSMO PIMS Module</h2>
				<p>Sign in to start your session</p>
				<form onSubmit={handleLogin} className='space-y-4 my-5 w-full'>
					<input
						type='email'
						placeholder='Email'
						className='w-full p-2 bg-[#e8f0fe] rounded'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						type='password'
						placeholder='Password'
						className='w-full p-2 bg-[#e8f0fe] rounded'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<Button
						className='bg-blue-600 text-white px-4 py-2 rounded w-full cursor-pointer hover:bg-blue-500 max-w-full '
						disabled={isLoading}>
						{isLoading ? <LoaderCircle className='animate-spin' /> : "Login"}
					</Button>
				</form>
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
				{!isSuccess && errorMessage && (
					<Alert variant={"destructive"} className='bg-transparent border-red-500'>
						<AlertCircle className='h-4 w-4' />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}
			</div>
		</div>
	);
}
