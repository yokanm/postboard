interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder = "Search...",
	label = "Search",
}: SearchInputProps) {
	return (
		<div className="relative">
			<label className="sr-only" htmlFor="search-input">
				{label}
			</label>
			<input
				id="search-input"
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				aria-label={label}
				className="w-full border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
			/>
		</div>
	);
}
