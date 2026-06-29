import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/features/auth/components/ForgotPasswordPage";
import { redirectIfAuthenticated } from "@/guards";

export const Route = createFileRoute("/forgot-password")({
	beforeLoad: redirectIfAuthenticated,
	head: () => ({
		meta: [
			{ title: "Forgot Password - Postboard" },
			{
				name: "description",
				content: "Reset your Postboard account password.",
			},
		],
	}),
	component: ForgotPasswordPage,
});
