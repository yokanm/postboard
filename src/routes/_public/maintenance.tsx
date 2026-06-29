import { createFileRoute } from "@tanstack/react-router";
import { MaintenancePage } from "@/features/public/pages/MaintenancePage";

export const Route = createFileRoute("/_public/maintenance")({
	head: () => ({
		meta: [
			{ title: "System Maintenance - Postboard" },
			{
				name: "description",
				content:
					"PostBoard is currently undergoing scheduled infrastructure updates. Please check back later.",
			},
			{ property: "og:title", content: "System Maintenance - Postboard" },
			{
				property: "og:description",
				content:
					"PostBoard is currently undergoing scheduled infrastructure updates.",
			},
			{ name: "twitter:title", content: "System Maintenance - Postboard" },
			{
				name: "twitter:description",
				content:
					"PostBoard is currently undergoing scheduled infrastructure updates.",
			},
		],
	}),
	component: MaintenancePage,
});
