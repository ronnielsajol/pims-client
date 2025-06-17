"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; //
import { Separator } from "@/components/ui/separator"; //

interface EditableDetailSelectProps {
	label: string;
	value: string | null | undefined;
	isEditing: boolean;
	onChange: (value: string) => void;
	options: readonly string[];
	placeholder?: string;
	fallbackText?: string;
	isLast?: boolean;
}

const EditableDetailSelect: React.FC<EditableDetailSelectProps> = ({
	label,
	value,
	isEditing,
	onChange,
	options,
	placeholder = "Select an option",
	fallbackText = "Not Set",
	isLast = false,
}) => (
	<>
		<div className='grid grid-cols-3 items-center min-h-[44px]'>
			<span className='text-sm font-medium text-muted-foreground'>{label}</span>
			<div className='col-span-2 font-medium'>
				{isEditing ? (
					<Select value={value ?? ""} onValueChange={onChange}>
						<SelectTrigger>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
						<SelectContent>
							{options.map((option) => (
								<SelectItem key={option} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : (
					value ?? <span className='text-gray-400 font-normal'>{fallbackText}</span>
				)}
			</div>
		</div>
		{!isLast && <Separator />}
	</>
);

export default EditableDetailSelect;
