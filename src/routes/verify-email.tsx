import { createFileRoute } from "@tanstack/react-router";
import { VerifyEmailPage } from "@/features/auth/components/VerifyEmailPage";

export const Route = createFileRoute("/verify-email")({
	validateSearch: (search: Record<string, string>) => ({
		token: search.token ?? "",
		email: search.email ?? "",
	}),
	head: () => ({
		meta: [
			{ title: "Verify Email - Postboard" },
			{
				name: "description",
				content:
					"Verify your email address to activate your Postboard account.",
			},
		],
	}),
	component: VerifyEmailPage,
});
