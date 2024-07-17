import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxProps {
	isOpen?: boolean;
	initialValue?: ComboboxOption;
	selectPlaceholder: string;
	searchPlaceholder: string;
	noResultsText: string;
	options: ComboboxOption[];
}

export interface ComboboxOption {
	value: string | number;
	label: string;
}

export const Combobox = ({
	isOpen,
	initialValue,
	selectPlaceholder,
	searchPlaceholder,
	noResultsText,
	options,
}: ComboboxProps) => {
	const [open, setOpen] = React.useState(Boolean(isOpen));
	const [value, setValue] = React.useState(initialValue?.value ?? "");

	const selectedOption = options.find(option => option.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between">
					{selectedOption && selectedOption.label}
					{!selectedOption && selectPlaceholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandEmpty>{noResultsText}</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{options.map(option => {
								const onSelect = (next: string) => {
									setValue(previous => {
										if (next === previous) {
											return "";
										}

										return next;
									});

									setOpen(false);
								};

								return (
									<CommandItem
										key={option.value}
										value={option.value.toString()}
										onSelect={onSelect}>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === option.value
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										{option.label}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
