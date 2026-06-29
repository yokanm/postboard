import { createFileRoute } from "@tanstack/react-router";
import { CompaniesPage } from "@/features/public/pages/CompaniesPage";

export const Route = createFileRoute("/_public/companies")({
	head: () => ({
		meta: [
			{ title: "Companies - Postboard" },
			{
				name: "description",
				content:
					"Browse companies hiring on Postboard. Discover verified employers and open positions.",
			},
			{ property: "og:title", content: "Companies - Postboard" },
			{
				property: "og:description",
				content:
					"Browse companies hiring on Postboard. Discover verified employers and open positions.",
			},
			{ name: "twitter:title", content: "Companies - Postboard" },
			{
				name: "twitter:description",
				content:
					"Browse companies hiring on Postboard. Discover verified employers and open positions.",
			},
		],
	}),
	component: CompaniesPage,
});
