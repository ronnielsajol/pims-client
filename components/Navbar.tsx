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
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

const allNavItems = [
	{ name: "Home", href: "/dashboard" },
	{ name: "Properties", href: "/properties" },
	{ name: "Users", href: "/users", roles: ["admin", "master_admin"] },
	{ name: "Admins", href: "/admins", roles: ["master_admin"] },
];

const Navbar = () => {
	const { user, logout } = useAuth();
	const pathName = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	const isActive = (href: string) => {
		console.log(href, pathName, pathName === href);
		return pathName === href;
	};

	// Filter based on role
	const navItems = allNavItems.filter((item) => {
		if (!item.roles) return true;
		return item.roles.includes(user?.role || "");
	});

	return (
		<nav className='border-b-2 border py-2 px-2 flex max-xl:justify-between'>
			<Link className='flex laptop:hidden gap-1.5 text-[20px] items-center' href='/dashboard'>
				<Image src='/images/pup-logo.png' alt='PUP Logo' height={50} width={50} />
				<h3 className='text-[#800000] text-3xl font-medium'>PIMS</h3>
			</Link>

			{/* Desktop Nav */}
			<div className='max-xl:hidden mx-auto max-w-9/12 w-full flex items-center'>
				<Link className='flex gap-1.5 text-[20px] items-center' href='/dashboard'>
					<Image src='/images/pup-logo.png' alt='PUP Logo' height={33} width={33} />
					<h3 className='text-[#800000]'>PIMS</h3>
				</Link>
				<div className='flex gap-1.5 items-center justify-start ml-3'>
					{navItems.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className={cn(
								"p-2 border-b-2 hover:border-b-[#800000]",
								isActive(item.href) ? "border-b-[#800000] text-[#800000] font-semibold" : "border-b-transparent"
							)}>
							{item.name}
						</Link>
					))}
				</div>

				<div className='font-medium text-[#800000] flex items-center gap-4 ml-auto'>
					<DropdownMenu onOpenChange={setIsOpen}>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' className='flex items-center justify-center hover:text-[#630000]'>
								{user?.name}
								<ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", isOpen && "rotate-180")} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-56'>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<User />
									<Link href='/dashboard' className='ml-2'>
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={logout}>
									<LogOut />
									<Button variant='ghost' className='pl-2 text-[#800000]'>
										Logout
									</Button>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Mobile Nav */}
			<div className='laptop:hidden'>
				<Sheet open={menuOpen} onOpenChange={setMenuOpen}>
					<SheetTrigger asChild>
						<button className='relative flex items-center justify-center px-2'>
							<Menu size={36} color='#737373' strokeWidth={3} />
							<span className='sr-only'>Open</span>
						</button>
					</SheetTrigger>
					<SheetTitle className='sr-only'>Menu</SheetTitle>
					<SheetContent side='right' className='w-[250px] pt-10'>
						<div className='flex flex-col space-y-6 mt-6'>
							{navItems.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									onClick={() => setMenuOpen(false)}
									className={cn(
										"p-2 border-b-2 hover:border-b-[#800000] mx-10 font-medium w-fit text-xl",
										isActive(item.href) ? "border-b-[#800000] text-[#800000] font-semibold" : "border-b-transparent"
									)}>
									{item.name}
								</Link>
							))}
						</div>
						<div className='mt-auto mb-5 border-t border-gray-300 pt-4 mx-10'>
							<Button variant='ghost' className='justify-start text-xl' onClick={() => setMenuOpen(false)}>
								<User strokeWidth={3} className='mr-2' /> Profile
							</Button>
							<Button
								variant='ghost'
								className='justify-start text-xl'
								onClick={() => {
									setMenuOpen(false);
									logout();
								}}>
								<LogOut strokeWidth={3} className='mr-2' /> Logout
							</Button>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</nav>
	);
};

export default Navbar;
