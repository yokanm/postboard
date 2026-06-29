import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuperAdminAuthStore } from "@/stores";
import { superAdminLogin } from "../api";

export function SuperAdminLoginPage() {
	const navigate = useNavigate();
	const isAuthenticated = useSuperAdminAuthStore((s) => s.isAuthenticated);
	const isInitialized = useSuperAdminAuthStore((s) => s.isInitialized);
	const setAdmin = useSuperAdminAuthStore((s) => s.setAdmin);
	const setAccessToken = useSuperAdminAuthStore((s) => s.setAccessToken);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isInitialized && isAuthenticated) {
			navigate({ to: "/superadmin/dashboard" });
		}
	}, [isInitialized, isAuthenticated, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await superAdminLogin(email, password);
			setAccessToken(result.accessToken);
			setAdmin(result.admin);
			navigate({ to: "/superadmin/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-dvh items-center justify-center bg-(--background) p-6">
			<div className="w-full max-w-sm border border-(--rule) p-8">
				<div className="mono-label mb-6 text-[11px] uppercase tracking-[0.1em] text-(--primary-container)">
					// SUPERADMIN ACCESS
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mono-label mb-1 block text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none focus:border-(--primary)"
						/>
					</div>

					<div>
						<label className="mono-label mb-1 block text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none focus:border-(--primary)"
						/>
					</div>

					{error && (
						<p className="font-sans text-[13px] text-(--error)">{error}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full border border-(--primary) bg-(--primary) px-4 py-2 font-sans text-[13px] text-(--on-primary) transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{loading ? "Authenticating..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
}
