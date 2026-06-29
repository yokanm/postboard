import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/features/auth/components/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
	validateSearch: (search: Record<string, string>) => ({
		token: search.token ?? "",
	}),
	head: () => ({
		meta: [
			{ title: "Reset Password - Postboard" },
			{
				name: "description",
				content: "Set a new password for your Postboard account.",
			},
		],
	}),
	component: ResetPasswordPage,
});
