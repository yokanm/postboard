interface AdminSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function AdminSearchInput({
	value,
	onChange,
	placeholder = "Search...",
}: AdminSearchInputProps) {
	return (
		<input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className="w-full border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
		/>
	);
}
