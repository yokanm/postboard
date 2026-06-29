import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/features/public/pages/AboutPage";

export const Route = createFileRoute("/_public/about")({
	head: () => ({
		meta: [
			{ title: "About - Postboard" },
			{
				name: "description",
				content:
					"Learn about Postboard, the high-density recruitment platform connecting job seekers with employers.",
			},
			{ property: "og:title", content: "About - Postboard" },
			{
				property: "og:description",
				content:
					"Learn about Postboard, the high-density recruitment platform connecting job seekers with employers.",
			},
			{ name: "twitter:title", content: "About - Postboard" },
			{
				name: "twitter:description",
				content:
					"Learn about Postboard, the high-density recruitment platform connecting job seekers with employers.",
			},
		],
	}),
	component: AboutPage,
});
