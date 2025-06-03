"use client";

import React from "react";
import { Input } from "@/components/ui/input"; //
import { cn } from "@/lib/utils";

interface EditableTextCellProps {
	isEditing: boolean;
	value: string | number; // The current value to display or edit (from editValues or property)
	originalValue: string | number; // The original value from the property (p.fieldName)
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	inputClassName?: string;
	// You can add textClassName if you need to style the non-editing text differently
}

export default function EditableTextCell({
	isEditing,
	value,
	originalValue,
	onChange,
	placeholder,
	inputClassName = "p-2 border rounded w-full", // Default class from your existing code
}: EditableTextCellProps) {
	if (isEditing) {
		return (
			<Input
				type='text'
				value={value || ""} // Ensure value is not undefined for controlled input
				onChange={onChange}
				placeholder={placeholder}
				className={cn("font-normal rounded p-2", inputClassName)}
				autoFocus
			/>
		);
	}
	return <>{originalValue}</>; // Display original value when not editing
}
