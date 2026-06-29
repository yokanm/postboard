import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { NotFoundPage } from "../components/NotFoundPage";
import { AppProvider } from "../providers";
import { ErrorState } from "../shared/components/ux/ErrorState";
import { LoadingState } from "../shared/components/ux/LoadingState";
import appCss from "../styles.css?url";

const Devtools = import.meta.env.DEV
	? lazy(() => import("../components/devtools/Devtools"))
	: null;

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Postboard - Find Jobs, Hire Talent, Build Careers",
			},
			{
				name: "description",
				content:
					"Postboard connects job seekers with employers through a modern recruitment platform. Discover opportunities, hire top talent, manage applications, and build meaningful careers.",
			},
			{
				property: "og:title",
				content: "Postboard - Find Jobs, Hire Talent, Build Careers",
			},
			{
				property: "og:description",
				content:
					"Modern recruitment platform connecting job seekers with employers.",
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:url",
				content: import.meta.env.VITE_APP_URL || "http://localhost:3000",
			},
			{ property: "og:image", content: "/og-image.png" },
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:title",
				content: "Postboard - Find Jobs, Hire Talent, Build Careers",
			},
			{
				name: "twitter:description",
				content:
					"Modern recruitment platform connecting job seekers with employers.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
		scripts: [
			{
				children: `(function(){var t;try{t=JSON.parse(localStorage.getItem('postboard-theme'))}catch(e){}var m=t&&t.state&&t.state.theme;if(m==='light'||m==='dark')document.documentElement.className=m;else if(m==='system'||!m){var d=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';document.documentElement.className=d}})()`,
			},
		],
	}),
	errorComponent: () => (
		<ErrorState message="An unexpected error occurred. Please try refreshing the page." />
	),
	notFoundComponent: () => <NotFoundPage />,
	pendingComponent: () => <LoadingState variant="page" message="Loading..." />,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased wrap-anywhere">
				<AppProvider>
					<main>{children}</main>
				</AppProvider>

				{Devtools && (
					<Suspense fallback={null}>
						<Devtools />
					</Suspense>
				)}

				<Scripts />
			</body>
		</html>
	);
}
