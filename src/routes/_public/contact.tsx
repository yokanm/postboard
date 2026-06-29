import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/features/public/pages/ContactPage";

export const Route = createFileRoute("/_public/contact")({
	head: () => ({
		meta: [
			{ title: "Contact - Postboard" },
			{
				name: "description",
				content:
					"Get in touch with the Postboard team. Send us your questions or feedback.",
			},
			{ property: "og:title", content: "Contact - Postboard" },
			{
				property: "og:description",
				content:
					"Get in touch with the Postboard team. Send us your questions or feedback.",
			},
			{ name: "twitter:title", content: "Contact - Postboard" },
			{
				name: "twitter:description",
				content:
					"Get in touch with the Postboard team. Send us your questions or feedback.",
			},
		],
	}),
	component: ContactPage,
});
