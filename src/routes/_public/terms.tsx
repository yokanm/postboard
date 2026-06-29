import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/features/public/pages/TermsPage";

export const Route = createFileRoute("/_public/terms")({
	head: () => ({
		meta: [
			{ title: "Terms of Service - Postboard" },
			{
				name: "description",
				content:
					"Postboard Terms of Service - Read the terms governing your use of the Postboard platform.",
			},
			{ name: "robots", content: "noindex" },
			{ property: "og:title", content: "Terms of Service - Postboard" },
			{
				property: "og:description",
				content:
					"Postboard Terms of Service - Read the terms governing your use of the Postboard platform.",
			},
			{ name: "twitter:title", content: "Terms of Service - Postboard" },
			{
				name: "twitter:description",
				content:
					"Postboard Terms of Service - Read the terms governing your use of the Postboard platform.",
			},
		],
	}),
	component: TermsPage,
});
