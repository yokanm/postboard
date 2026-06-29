import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { redirectIfAuthenticated } from "@/guards";

export const Route = createFileRoute("/login")({
	beforeLoad: redirectIfAuthenticated,
	validateSearch: (search: Record<string, string>) => ({
		verified: search.verified === "true" ? true : undefined,
	}),
	head: () => ({
		meta: [
			{ title: "Sign In - Postboard" },
			{
				name: "description",
				content:
					"Sign in to your Postboard account to manage jobs, applications, and more.",
			},
			{ property: "og:title", content: "Sign In - Postboard" },
			{
				property: "og:description",
				content: "Sign in to your Postboard account.",
			},
		],
	}),
	component: LoginPage,
});
