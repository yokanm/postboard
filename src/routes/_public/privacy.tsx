import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/features/public/pages/PrivacyPage";

export const Route = createFileRoute("/_public/privacy")({
	head: () => ({
		meta: [
			{ title: "Privacy Policy - Postboard" },
			{
				name: "description",
				content:
					"Postboard Privacy Policy - Learn how we collect, use, and protect your personal information.",
			},
			{ name: "robots", content: "noindex" },
			{ property: "og:title", content: "Privacy Policy - Postboard" },
			{
				property: "og:description",
				content:
					"Postboard Privacy Policy - Learn how we collect, use, and protect your personal information.",
			},
			{ name: "twitter:title", content: "Privacy Policy - Postboard" },
			{
				name: "twitter:description",
				content:
					"Postboard Privacy Policy - Learn how we collect, use, and protect your personal information.",
			},
		],
	}),
	component: PrivacyPage,
});
