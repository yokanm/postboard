import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "@/features/public/pages/PricingPage";

export const Route = createFileRoute("/_public/pricing")({
	head: () => ({
		meta: [
			{ title: "Pricing - Postboard" },
			{
				name: "description",
				content:
					"Explore Postboard pricing plans: Candidate (Free), Recruiter (Pro), and Enterprise (Custom). Join the waitlist for early access.",
			},
			{ property: "og:title", content: "Pricing - Postboard" },
			{
				property: "og:description",
				content:
					"Explore Postboard pricing plans: Candidate (Free), Recruiter (Pro), and Enterprise (Custom). Join the waitlist for early access.",
			},
			{ name: "twitter:title", content: "Pricing - Postboard" },
			{
				name: "twitter:description",
				content:
					"Explore Postboard pricing plans: Candidate (Free), Recruiter (Pro), and Enterprise (Custom). Join the waitlist for early access.",
			},
		],
	}),
	component: PricingPage,
});
