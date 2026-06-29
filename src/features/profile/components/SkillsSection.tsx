interface SkillsSectionProps {
	skills: string[];
	onAdd: (skill: string) => void;
	onRemove: (skill: string) => void;
}

export function SkillsSection({ skills, onAdd, onRemove }: SkillsSectionProps) {
	return (
		<div className="border border-(--rule)">
			<div className="border-b border-(--rule) px-4 py-2">
				<span className="mono-label text-(--primary-container)">// SKILLS</span>
			</div>
			<div className="flex flex-col gap-3 p-4">
				{skills.length === 0 ? (
					<p className="font-sans text-[13px] text-(--dim)">
						No skills added yet.
					</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{skills.map((skill) => (
							<div
								key={skill}
								className="flex items-center gap-1 border border-(--rule) bg-(--surface-container-low) px-2 py-1"
							>
								<span className="font-sans text-[13px] text-(--on-surface)">
									{skill}
								</span>
								<button
									type="button"
									onClick={() => onRemove(skill)}
									className="mono-label cursor-pointer bg-transparent px-1 text-[11px] text-(--dim) transition-colors duration-150 hover:text-(--destructive)"
									aria-label={`Remove ${skill}`}
								>
									X
								</button>
							</div>
						))}
					</div>
				)}

				<div className="flex gap-2">
					<input
						type="text"
						placeholder="Add skill..."
						className="w-full border border-(--rule) bg-(--surface-container-low) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none placeholder:text-(--dim) focus:border-(--primary)"
						id="skill-input"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const input = e.currentTarget;
								const value = input.value.trim();
								if (value && !skills.includes(value)) {
									onAdd(value);
									input.value = "";
								}
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}
