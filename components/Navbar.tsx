"use client";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, LogOut, User } from "lucide-react";

const Navbar = () => {
	const { user, logout } = useAuth();
	const pathName = usePathname();
	const [isOpen, setIsOpen] = useState(false);

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
						className={cn(
							isActive("/dashboard") ? "border-b-[#800000] text-[#800000] font-semibold" : "border-b-transparent",
							"p-2 border-b-2  hover:border-b-[#800000] "
						)}>
						Home
					</Link>
					<Link
						href='/properties'
						className={cn(
							isActive("/properties") ? " border-b-[#800000] text-[#800000] font-semibold" : "",
							"p-2 border-b-2 border-b-transparent hover:border-b-[#800000] "
						)}>
						Properties
					</Link>

					{(user?.role === "master_admin" || user?.role === "admin") && (
						<Link
							href='/users'
							className={cn(
								isActive("/users") ? " border-b-[#800000] text-[#800000] font-semibold" : "",
								"p-2 border-b-2 border-b-transparent hover:border-b-[#800000] "
							)}>
							Users
						</Link>
					)}
					{user?.role === "master_admin" && (
						<Link
							href='/admins'
							className={cn(
								isActive("/admins") ? " border-b-[#800000] text-[#800000] font-semibold" : "",
								"p-2 border-b-2 border-b-transparent hover:border-b-[#800000] "
							)}>
							Admins
						</Link>
					)}
				</div>
				<div className='font-medium text-[#800000] flex items-center gap-4'>
					<DropdownMenu onOpenChange={setIsOpen}>
						<DropdownMenuTrigger asChild className='cursor-pointer'>
							<Button variant={"outline"} className='flex flex-row items-center justify-center hover:text-[#630000]'>
								{user?.name}{" "}
								<ChevronDown
									className={cn("h-4 w-4 transition-transform duration-200 ease-out pt-0.5", isOpen && "transform rotate-180")}
								/>{" "}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-56'>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<User />
									<Link href='/dashboard'>Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={logout}>
									<LogOut />
									<Button variant='ghost' className='cursor-pointer pl-0 text-[#800000]'>
										Logout
									</Button>{" "}
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
