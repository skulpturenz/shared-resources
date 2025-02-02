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
	className?: string;
	isOpen?: boolean;
	initialValue?: ComboboxOption;
	selectPlaceholder: string;
	searchPlaceholder: string;
	noResultsText: string;
	options: ComboboxOption[];
	onChange?: (option: ComboboxOption | null) => void;
}

export interface ComboboxOption {
	value: string | number;
	label: string;
	href?: string;
}

export const Combobox = ({
	className,
	isOpen,
	initialValue,
	selectPlaceholder,
	searchPlaceholder,
	noResultsText,
	options,
	onChange,
}: ComboboxProps) => {
	const [open, setOpen] = React.useState(Boolean(isOpen));
	const [value, setValue] = React.useState(initialValue?.value ?? "");
	const buttonRef = React.useRef<HTMLButtonElement>(null);

	const [buttonWidth, setButtonWidth] = React.useState(0);

	const selectedOption = options.find(option => option.value === value);

	React.useLayoutEffect(() => {
		if (!buttonRef.current) {
			return;
		}

		const onResize = () => {
			setButtonWidth(buttonRef.current?.offsetWidth as number);
		};
		window.addEventListener("resize", onResize);

		setButtonWidth(buttonRef.current?.offsetWidth);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<div className={className}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						ref={buttonRef}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between">
						{selectedOption && selectedOption.label}
						{!selectedOption && selectPlaceholder}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent style={{ width: buttonWidth }} className="p-0">
					<Command>
						<CommandInput placeholder={searchPlaceholder} />
						<CommandEmpty>{noResultsText}</CommandEmpty>
						<CommandList>
							<CommandGroup>
								{options.map(option => {
									const onSelect = (next: string) => {
										setValue(previous => {
											if (next === previous) {
												onChange?.(null);

												return "";
											}

											const nextOption = options.find(
												option => option.value === next,
											) as ComboboxOption;
											onChange?.(nextOption);

											return next;
										});

										setOpen(false);
									};

									return (
										<a
											key={option.value}
											href={option.href}>
											<CommandItem
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
										</a>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};
