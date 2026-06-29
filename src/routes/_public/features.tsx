import { createFileRoute } from "@tanstack/react-router";
import { FeaturesPage } from "@/features/public/pages/FeaturesPage";

export const Route = createFileRoute("/_public/features")({
	head: () => ({
		meta: [
			{ title: "Features - Postboard" },
			{
				name: "description",
				content:
					"Explore Postboard features: job marketplace, smart applications, recruiter dashboard, company profiles, and analytics.",
			},
			{ property: "og:title", content: "Features - Postboard" },
			{
				property: "og:description",
				content:
					"Explore Postboard features: job marketplace, smart applications, recruiter dashboard, company profiles, and analytics.",
			},
			{ name: "twitter:title", content: "Features - Postboard" },
			{
				name: "twitter:description",
				content:
					"Explore Postboard features: job marketplace, smart applications, recruiter dashboard, company profiles, and analytics.",
			},
		],
	}),
	component: FeaturesPage,
});
