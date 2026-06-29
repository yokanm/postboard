// ─── PRESS GRID ──────────────────────────────────────────────
// Signature visual element. Sharp tiles, iridescent gradients, grain.
// Used in auth panels, hero sections, 404, maintenance, empty states.

export function PressGrid() {
	const tiles = Array.from({ length: 144 }, (_, i) => i);

	return (
		<div className="press-grid-container" aria-hidden="true">
			<div className="press-grid-tiles">
				{tiles.map((i) => (
					<div key={i} className="press-grid-tile" />
				))}
			</div>
			<div className="press-grid-fade" />
			<div className="press-grid-grain" />
		</div>
	);
}
