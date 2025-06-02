"use client";

import React, { useState } from "react";
import { Property } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";

interface LocationSelectionCellProps {
	propertyId: number;
	currentLocation?: string;
	allAvailableLocations: string[];
	onUpdateLocation: (propertyId: number, newLocation: string) => Promise<void>;
}

export default function LocationSelectionCell({
	propertyId,
	currentLocation,
	allAvailableLocations,
	onUpdateLocation,
}: LocationSelectionCellProps) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [newLocationInput, setNewLocationInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	const handleSelectLocation = async (location: string) => {
		if (location && location.trim() !== "") {
			await onUpdateLocation(propertyId, location.trim());
		}
		setIsPopoverOpen(false); // Close popover after action
		setNewLocationInput("");
		setSearchTerm("");
	};

	const filteredLocations = searchTerm
		? allAvailableLocations.filter((loc) => loc.toLowerCase().includes(searchTerm.toLowerCase()))
		: allAvailableLocations;

	return (
		<div className='max-w-[250px]'>
			<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
				{currentLocation ? (
					<div className='flex items-center gap-2'>
						<Badge
							variant='outline'
							className='font-normal text-muted-foreground py-1 px-3 rounded-full text-xs sm:text-sm truncate'
							title={currentLocation}>
							{currentLocation}
						</Badge>
						<PopoverTrigger asChild>
							<Button variant='outline' size='sm' className='h-7 px-2 text-xs'>
								Change
							</Button>
						</PopoverTrigger>
					</div>
				) : (
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							size='sm'
							className='cursor-pointer px-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'>
							Add location <ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 opacity-50' />
						</Button>
					</PopoverTrigger>
				)}

				{/* PopoverContent is now a direct child of the Popover root */}
				{/* It will be rendered by Radix based on the 'open' state of the Popover */}
				<PopoverContent className='w-[250px] p-0' align='start' sideOffset={5}>
					<div className='p-2 border-b'>
						<p className='text-xs font-medium mb-1 text-muted-foreground'>Add New Location</p>
						<div className='flex items-center gap-2'>
							<Input
								type='text'
								placeholder='Enter new location...'
								value={newLocationInput}
								onChange={(e) => setNewLocationInput(e.target.value)}
								className='h-8 text-sm'
							/>
							<Button
								size='sm'
								className='h-8 px-2 bg-green-600 hover:bg-green-700 text-xs'
								onClick={() => handleSelectLocation(newLocationInput)}
								disabled={!newLocationInput.trim()}>
								Add
							</Button>
						</div>
					</div>
					<Command>
						<CommandInput
							placeholder='Search existing...'
							value={searchTerm}
							onValueChange={setSearchTerm}
							className='text-sm h-9'
						/>
						<CommandList>
							<CommandEmpty className='py-4 text-center text-sm'>
								{searchTerm
									? "No locations found."
									: allAvailableLocations.length === 0
									? "No existing locations."
									: "Type to search or add new."}
							</CommandEmpty>
							{filteredLocations.length > 0 && (
								<CommandGroup heading='Existing Locations' className='text-xs'>
									{filteredLocations.map((loc, index) => (
										<CommandItem
											key={`${loc}-${index}`} // Ensure key is unique, especially if loc names can repeat
											value={loc}
											onSelect={() => handleSelectLocation(loc)}
											className='cursor-pointer text-sm py-1.5'>
											{loc}
											<Check className={cn("ml-auto h-4 w-4", currentLocation === loc ? "opacity-100" : "opacity-0")} />
										</CommandItem>
									))}
								</CommandGroup>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
