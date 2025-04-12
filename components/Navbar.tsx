import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Navbar = () => {
	const { user, logout } = useAuth();
	const pathName = usePathname();

	const isActive = (href: string) => {
		return pathName === href;
	};

	return (
		<nav className='border-b-2 border py-2 px-2 flex'>
			<div className='mx-auto max-w-9/12 w-full flex justify-between items-center'>
				<div className='flex gap-1.5 items-center justify-start'>
					<Link className='flex gap-1.5 text-[20px] items-center' href='/dashboard'>
						<Image src='/images/pup-logo.png' alt='PUP Logo' height={33} width={33} />
						<h3 className='text-[#800000]'>PIMS</h3>
					</Link>
					<Link
						href='/dashboard'
						className={cn(isActive("/dashboard") ? "border-b-2 border-b-[#800000] text-[#800000] font-semibold" : "", "p-2")}>
						Home
					</Link>
					<Link
						href='/properties'
						className={cn(isActive("/properties") ? "border-b-2 border-b-[#800000] text-[#800000] font-semibold" : "", "p-2")}>
						Properties
					</Link>
				</div>
				<div className='font-medium text-[#800000] flex items-center gap-4'>
					<h1 className=''>{user?.name}</h1>
					<Button variant='outline' onClick={logout}>
						Logout
					</Button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
