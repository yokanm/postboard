import { createFileRoute } from "@tanstack/react-router";
import { CookiesPage } from "@/features/public/pages/CookiesPage";

export const Route = createFileRoute("/_public/cookies")({
	head: () => ({
		meta: [
			{ title: "Cookie Policy - Postboard" },
			{
				name: "description",
				content:
					"Postboard Cookie Policy - Learn about how we use cookies on our platform.",
			},
			{ name: "robots", content: "noindex" },
			{ property: "og:title", content: "Cookie Policy - Postboard" },
			{
				property: "og:description",
				content:
					"Postboard Cookie Policy - Learn about how we use cookies on our platform.",
			},
			{ name: "twitter:title", content: "Cookie Policy - Postboard" },
			{
				name: "twitter:description",
				content:
					"Postboard Cookie Policy - Learn about how we use cookies on our platform.",
			},
		],
	}),
	component: CookiesPage,
});
