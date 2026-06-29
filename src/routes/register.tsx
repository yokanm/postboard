import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features/auth/components/RegisterPage";
import { redirectIfAuthenticated } from "@/guards";

export const Route = createFileRoute("/register")({
	beforeLoad: redirectIfAuthenticated,
	head: () => ({
		meta: [
			{ title: "Create Account - Postboard" },
			{
				name: "description",
				content:
					"Create a Postboard account to apply for jobs, manage your profile, and connect with recruiters.",
			},
			{ property: "og:title", content: "Create Account - Postboard" },
			{
				property: "og:description",
				content: "Create a Postboard account to apply for jobs.",
			},
		],
	}),
	component: RegisterPage,
});
