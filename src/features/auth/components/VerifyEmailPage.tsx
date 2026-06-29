import {
	Alert02Icon,
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Loading03Icon,
	Mail01Icon,
	Refresh01Icon,
	ValidationApprovalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useSearch } from "@tanstack/react-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { isApiRequestError } from "@/lib/api/client";
import { PressGrid } from "@/shared/components/PressGrid";
import { useResendVerificationEmail, useVerifyEmail } from "../hooks";

type PageState =
	| "sent"
	| "verifying"
	| "success"
	| "already-verified"
	| "error";

export function VerifyEmailPage() {
	const search = useSearch({ from: "/verify-email" });
	const token = search.token;
	const emailParam = search.email;
	const [email, setEmail] = useState(emailParam ?? "");
	const [emailSent, setEmailSent] = useState(false);

	const verifyMutation = useVerifyEmail();
	const resendMutation = useResendVerificationEmail();

	const isVerifying = verifyMutation.isPending;
	const isVerified = verifyMutation.isSuccess;
	const verifyError = verifyMutation.error
		? isApiRequestError(verifyMutation.error)
			? verifyMutation.error.message
			: "Verification failed."
		: null;

	const isAlreadyVerified = verifyError
		?.toLowerCase()
		.includes("already verified");
	const isExpired = verifyError?.toLowerCase().includes("expired");
	const isInvalid = verifyError?.toLowerCase().includes("invalid");

	const pageState: PageState = isVerifying
		? "verifying"
		: isVerified
			? "success"
			: isAlreadyVerified
				? "already-verified"
				: isExpired || isInvalid
					? "error"
					: "sent";

	useEffect(() => {
		if (token && !isVerified && !isVerifying && !verifyError) {
			verifyMutation.mutate(token);
		}
	}, [token, isVerified, isVerifying, verifyError, verifyMutation.mutate]);

	const handleResend = useCallback(() => {
		if (!email) return;
		resendMutation.mutate(email, {
			onSuccess: () => setEmailSent(true),
		});
	}, [email, resendMutation]);

	const handleOpenEmailApp = useCallback(() => {
		window.open(`mailto:${email}`, "_blank");
	}, [email]);

	const formattedTimestamp = `${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`;
	const reqId = "9X-224-A";

	// ─── Shared ─────────────────────────────────────────────────────────────────

	function renderMobileHeader() {
		return (
			<header className="flex w-full shrink-0 items-center justify-center border-b border-(--rule) px-6 py-4 lg:hidden">
				<h1 className="font-headline-2xl-mobile text-headline-2xl-mobile uppercase tracking-tighter text-(--primary)">
					POSTBOARD
				</h1>
			</header>
		);
	}

	function renderMobileFooter(text: string) {
		return (
			<footer className="mt-auto flex w-full shrink-0 items-center justify-center border-t border-(--rule) py-4 lg:hidden">
				<span className="font-mono-label text-mono-label uppercase text-(--dim)">
					{text}
				</span>
			</footer>
		);
	}

	// ─── Desktop Brand Panel ────────────────────────────────────────────────────

	function renderBrandPanelSent() {
		return (
			<div className="relative z-10 flex h-full flex-col justify-between px-8 py-8">
				<div>
					<h1 className="font-masthead-4xl text-masthead-4xl tracking-tighter uppercase text-(--on-surface)">
						POSTBOARD
					</h1>
					<p className="font-mono-label text-mono-label mt-4 uppercase text-(--dim)">
						// INDUSTRIAL_SYSTEMS
					</p>
				</div>
				<div className="font-mono-label text-mono-label uppercase text-(--dim)">
					<p>// STATUS: SECURE_ENVIRONMENT</p>
					<p>// VERIFICATION_PROTOCOL_INITIATED</p>
				</div>
			</div>
		);
	}

	function renderBrandPanelSuccess() {
		return (
			<div className="relative z-20 flex h-full flex-col justify-between px-8 py-8">
				<div>
					<h1 className="font-masthead-4xl text-masthead-4xl tracking-tighter uppercase text-(--on-surface)">
						POSTBOARD
					</h1>
					<p className="font-mono-label text-mono-label mt-4 uppercase text-(--dim)">
						// INDUSTRIAL_BROADSHEET_SYSTEM
					</p>
				</div>
				<div className="max-w-md">
					<p className="font-body-base text-body-base mb-4 text-(--body)">
						The preeminent platform for technical pipeline management.
						High-density data, low-latency execution.
					</p>
					<div className="flex w-fit items-center gap-2 border border-(--rule) bg-(--surface-container) px-3 py-1">
						<span className="block h-2 w-2 bg-(--live)" />
						<span className="font-mono-label text-mono-label text-(--on-surface)">
							SYSTEM_ONLINE_STABLE
						</span>
					</div>
				</div>
			</div>
		);
	}

	function renderBrandPanelError() {
		return (
			<div className="relative z-10 flex h-full flex-col justify-between px-8 py-8">
				<div>
					<h1 className="font-masthead-4xl text-masthead-4xl tracking-tighter uppercase text-(--on-surface)">
						POSTBOARD
					</h1>
					<p className="font-mono-label text-mono-label mt-2 text-(--dim)">
						// SYSTEM_AUTH_GATEWAY
					</p>
				</div>
				<div className="flex max-w-md flex-col gap-4">
					<div className="cursor-default border border-(--rule) bg-(--ink) p-4 transition-colors duration-300">
						<p className="font-mono-label text-mono-label mb-2 uppercase text-(--dim)">
							// SYSTEM_STATUS
						</p>
						<p className="font-body-base text-body-base text-(--body)">
							Authentication verification layer active. All external access
							attempts are logged and monitored in real-time according to
							protocol <span className="text-(--on-surface)">PB-AUTH-V4</span>.
						</p>
					</div>
					<div className="font-mono-label text-mono-label flex items-center gap-2 text-(--dim)">
						<span className="text-(--live)">●</span>
						<span>SECURE CONNECTION ESTABLISHED</span>
					</div>
				</div>
			</div>
		);
	}

	// ─── Content States ─────────────────────────────────────────────────────────

	function renderSentContent() {
		return (
			<>
				<div className="hidden font-mono-label text-mono-label mb-8 uppercase text-(--dim) lg:block">
					// SYSTEM_ACCESS
				</div>
				<div className="flex flex-col items-center border border-(--rule) bg-(--surface-container-lowest) p-8 text-center">
					<div className="mb-8 flex h-16 w-16 items-center justify-center border border-(--rule) bg-(--surface)">
						<HugeiconsIcon
							icon={Mail01Icon}
							strokeWidth={1.5}
							className="h-8 w-8 text-(--on-surface)"
							aria-hidden="true"
						/>
					</div>
					<h2 className="font-headline-2xl text-headline-2xl mb-4 text-(--on-surface)">
						Verify Your Email
					</h2>
					<p className="font-body-base text-body-base mb-8 text-(--body)">
						{emailSent
							? "A new verification email has been sent. Please check your inbox."
							: "We've sent a verification link to your email address. Please check your inbox and click the verification link to activate your account."}
					</p>
					<div className="flex w-full flex-col gap-4">
						<button
							type="button"
							onClick={handleOpenEmailApp}
							className="w-full border border-(--press-amber) bg-(--press-amber) px-6 py-3 font-ui-lg text-ui-lg font-semibold uppercase tracking-wide text-[#080808] transition-all duration-200 hover:bg-transparent hover:text-(--press-amber)"
						>
							Open Email App
						</button>
						<button
							type="button"
							onClick={handleResend}
							disabled={resendMutation.isPending || !email}
							className="flex w-full items-center justify-center gap-2 border border-(--rule) bg-transparent px-6 py-3 font-ui-lg text-ui-lg font-semibold uppercase tracking-wide text-(--body) transition-colors duration-200 hover:border-(--on-surface) hover:text-(--on-surface) disabled:opacity-50"
						>
							{resendMutation.isPending && (
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={2}
									className="h-4 w-4 animate-spin"
									aria-hidden="true"
								/>
							)}
							{resendMutation.isPending
								? "SENDING..."
								: "Resend Verification Email"}
						</button>
					</div>
				</div>
				<Link
					to="/login"
					className="mt-8 inline-flex items-center gap-2 font-mono-label text-mono-label uppercase text-(--dim) no-underline transition-colors hover:text-(--on-surface)"
				>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						strokeWidth={2}
						className="h-4 w-4"
						aria-hidden="true"
					/>
					Back to Login
				</Link>
			</>
		);
	}

	function renderSuccessContent() {
		return (
			<div className="w-full max-w-[480px] border border-(--rule) bg-(--surface-container-lowest)">
				<div className="flex h-1 w-full bg-(--live)" />
				<div className="p-8 lg:p-12">
					<div className="mb-12 flex items-center gap-2 font-mono-label text-mono-label uppercase tracking-widest text-(--dim)">
						<span>// AUTH_PROTOCOL</span>
						<span className="flex-1 overflow-hidden text-(--rule)">
							----------------------------------------
						</span>
					</div>
					<div className="mb-8">
						<div className="mb-6 flex h-16 w-16 items-center justify-center border border-(--live) bg-(--live-dim)">
							<HugeiconsIcon
								icon={ValidationApprovalIcon}
								strokeWidth={1.5}
								className="h-8 w-8 text-(--live)"
								aria-hidden="true"
							/>
						</div>
						<h2 className="font-headline-2xl text-headline-2xl text-(--on-surface)">
							Email Verified.
						</h2>
					</div>
					<div className="mb-10 border-l border-(--rule) pl-4">
						<p className="font-body-base text-body-base text-(--body)">
							Your identity has been confirmed and registered in the POSTBOARD
							registry. Full access to the industrial dashboard is now
							authorized.
						</p>
						<div className="mt-6 flex flex-col gap-0.5 border border-(--rule) bg-(--surface) p-3 font-mono-label text-mono-label text-(--dim)">
							<div>&gt; INIT_VERIFICATION_SEQ... [OK]</div>
							<div>&gt; VALIDATE_TOKEN... [OK]</div>
							<div className="text-(--live)">&gt; IDENTITY_CONFIRMED</div>
						</div>
					</div>
					<div className="mt-8 flex flex-col gap-4">
						<Link
							to="/login"
							className="flex h-12 w-full items-center justify-center bg-(--press-amber) font-ui-lg text-ui-lg uppercase tracking-wide text-[#080808] no-underline transition-all duration-200 hover:bg-transparent hover:text-(--press-amber)"
						>
							Continue to Login
						</Link>
						<Link
							to="/login"
							className="group flex h-12 w-full items-center justify-center gap-2 border border-(--rule) bg-transparent font-ui-lg text-ui-lg uppercase tracking-wide text-(--on-surface) no-underline transition-colors duration-200 hover:bg-(--surface-variant)"
						>
							<span>Go to Dashboard</span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</Link>
					</div>
				</div>
				<div className="border-t border-(--rule) bg-(--surface-container) p-4">
					<div className="flex w-full items-center justify-between">
						<span className="font-mono-label text-mono-label text-(--dim)">
							REQ_ID: {reqId}
						</span>
						<span className="font-mono-label text-mono-label text-(--dim)">
							ENCRYPTED_256
						</span>
					</div>
				</div>
			</div>
		);
	}

	function renderAlreadyVerifiedContent() {
		return (
			<div className="w-full max-w-[480px] border border-(--rule) bg-(--surface-container-lowest)">
				<div className="flex h-1 w-full bg-(--primary-container)" />
				<div className="p-8 lg:p-12">
					<div className="mb-12 flex items-center gap-2 font-mono-label text-mono-label uppercase tracking-widest text-(--dim)">
						<span>// AUTH_PROTOCOL</span>
						<span className="flex-1 overflow-hidden text-(--rule)">
							----------------------------------------
						</span>
					</div>
					<div className="mb-8">
						<div className="mb-6 flex h-16 w-16 items-center justify-center border border-(--primary-container) bg-(--primary-container)/10">
							<HugeiconsIcon
								icon={ValidationApprovalIcon}
								strokeWidth={1.5}
								className="h-8 w-8 text-(--primary-container)"
								aria-hidden="true"
							/>
						</div>
						<h2 className="font-headline-2xl text-headline-2xl text-(--on-surface)">
							Already Verified.
						</h2>
					</div>
					<div className="mb-10 border-l border-(--rule) pl-4">
						<p className="font-body-base text-body-base text-(--body)">
							Your email has already been verified. No further action is
							required. You may proceed to access the platform.
						</p>
					</div>
					<div className="mt-8 flex flex-col gap-4">
						<Link
							to="/login"
							className="flex h-12 w-full items-center justify-center bg-(--press-amber) font-ui-lg text-ui-lg uppercase tracking-wide text-[#080808] no-underline transition-all duration-200 hover:bg-transparent hover:text-(--press-amber)"
						>
							Continue to Login
						</Link>
					</div>
				</div>
			</div>
		);
	}

	function renderVerifyingContent() {
		return (
			<div className="flex flex-col items-center gap-4">
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className="h-8 w-8 animate-spin text-(--primary-container)"
					aria-hidden="true"
				/>
				<span className="font-mono-label text-mono-label text-(--dim)">
					VERIFYING_TOKEN...
				</span>
			</div>
		);
	}

	function renderErrorContent() {
		const showEmailInput = !email;

		return (
			<div className="flex w-full max-w-md flex-col gap-8">
				<div className="flex items-center justify-between border-b border-(--rule) pb-2 font-mono-label text-mono-label uppercase tracking-widest text-(--dim)">
					<span>// EXCEPTION_THROWN</span>
					<span className="font-bold text-(--destructive)">ERR_0x4A</span>
				</div>
				<div className="flex flex-col items-start gap-6">
					<div className="flex h-16 w-16 shrink-0 items-center justify-center border border-(--destructive) bg-(--destructive)/10">
						<HugeiconsIcon
							icon={Alert02Icon}
							strokeWidth={2}
							className="h-8 w-8 text-(--destructive)"
						/>
					</div>
					<div className="flex flex-col gap-3">
						<h2 className="font-headline-2xl text-headline-2xl uppercase tracking-tight text-(--on-surface)">
							Verification Link {isExpired ? "Expired" : "Invalid"}
						</h2>
						<p className="border-l-2 border-(--rule) pl-4 font-body-base text-body-base text-(--body)">
							{isExpired
								? "This verification link has expired. Security protocols dictate a strict TTL (Time-To-Live) for all authentication tokens."
								: "This verification link is invalid, expired, or has already been used. Security protocols dictate a strict TTL (Time-To-Live) for all authentication tokens."}
						</p>
					</div>
					<div className="mt-2 flex w-full flex-col gap-2 border border-(--rule) bg-(--ink) p-4 font-mono-label text-mono-label text-(--dim)">
						<div className="flex justify-between border-b border-(--rule) pb-1">
							<span>TIMESTAMP</span>
							<span className="text-(--body)">{formattedTimestamp}</span>
						</div>
						<div className="flex justify-between border-b border-(--rule) pb-1">
							<span>TOKEN_STATUS</span>
							<span className="text-(--destructive)">INVALIDATED</span>
						</div>
						<div className="flex justify-between">
							<span>ACTION_REQ</span>
							<span className="text-(--on-surface)">REGENERATE_TOKEN</span>
						</div>
					</div>
				</div>
				{showEmailInput && (
					<div className="flex flex-col gap-2">
						<label
							htmlFor="resend-email-error"
							className="font-mono-label text-mono-label uppercase text-(--dim)"
						>
							Email Address
						</label>
						<input
							id="resend-email-error"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="name@company.com"
							className="border border-(--rule) bg-(--surface-container-low) px-4 py-3 font-body-base text-body-base text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
						/>
					</div>
				)}
				<div className="flex flex-col gap-4 sm:flex-row">
					<button
						type="button"
						onClick={handleResend}
						disabled={resendMutation.isPending || !email}
						className="flex w-full items-center justify-center gap-2 border border-(--press-amber) bg-(--press-amber) px-6 py-3 font-ui-lg text-ui-lg uppercase tracking-wide text-[#080808] transition-colors duration-200 hover:bg-transparent hover:text-(--press-amber) disabled:opacity-50 sm:w-auto"
					>
						<span>Resend Verification Email</span>
						<HugeiconsIcon
							icon={Refresh01Icon}
							strokeWidth={2}
							className={`h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5 ${resendMutation.isPending ? "animate-spin" : ""}`}
							aria-hidden="true"
						/>
					</button>
					<Link
						to="/login"
						className="flex w-full items-center justify-center border border-(--rule) bg-transparent px-6 py-3 font-ui-lg text-ui-lg uppercase tracking-wide text-(--body) no-underline transition-colors duration-200 hover:border-(--on-surface) hover:text-(--on-surface) sm:w-auto"
					>
						Back to Login
					</Link>
				</div>
			</div>
		);
	}

	// ─── Mobile Content Variants ────────────────────────────────────────────────

	function renderMobileSentContent() {
		return (
			<div className="flex w-full max-w-sm flex-col items-center text-center">
				<div className="group relative mb-8 flex h-24 w-24 cursor-default items-center justify-center border border-(--rule) bg-(--surface)">
					<div className="absolute left-0 top-0 h-1 w-1 bg-(--primary-container)" />
					<div className="absolute bottom-0 right-0 h-1 w-1 bg-(--primary-container)" />
					<HugeiconsIcon
						icon={Mail01Icon}
						strokeWidth={1.5}
						className="h-12 w-12 text-(--primary-container)"
						aria-hidden="true"
					/>
				</div>
				<h2 className="font-headline-2xl-mobile text-headline-2xl-mobile mb-4 w-full text-(--on-background)">
					Verify Your Email
				</h2>
				<p className="font-body-base text-body-base mb-8 w-full max-w-[280px] text-(--body)">
					{emailSent
						? "A new verification email has been sent. Please check your inbox."
						: "Check your inbox for the activation link."}
				</p>
				<div className="flex w-full flex-col items-center">
					<button
						type="button"
						onClick={handleOpenEmailApp}
						className="flex w-full items-center justify-center gap-2 bg-(--primary-container) px-6 py-4 font-ui-lg text-ui-lg uppercase tracking-wider text-[#080808] transition-all duration-100 hover:bg-(--surface-tint) active:scale-[0.98]"
					>
						Open Email App
					</button>
					<button
						type="button"
						onClick={handleResend}
						disabled={resendMutation.isPending || !email}
						className="mb-8 mt-4 flex w-full items-center justify-center border border-(--rule) bg-transparent px-6 py-4 font-ui-lg text-ui-lg uppercase tracking-wider text-(--on-background) transition-colors hover:bg-(--surface-container-highest) active:scale-[0.98] disabled:opacity-50"
					>
						{resendMutation.isPending ? "SENDING..." : "Resend"}
					</button>
					<Link
						to="/login"
						className="relative inline-flex items-center gap-2 bg-transparent px-4 py-2 font-mono-label text-mono-label uppercase tracking-widest text-(--dim) no-underline transition-colors hover:text-(--on-background)"
					>
						<HugeiconsIcon
							icon={ArrowLeft01Icon}
							strokeWidth={2}
							className="h-4 w-4"
							aria-hidden="true"
						/>
						Back to Login
					</Link>
				</div>
			</div>
		);
	}

	function renderMobileSuccessContent() {
		return (
			<div className="flex w-full max-w-md flex-col items-center text-center">
				<div className="mb-8 inline-block border border-(--live-dim) bg-(--surface-container-low) px-3 py-1 font-mono-label text-mono-label uppercase tracking-widest text-(--dim)">
					// SYSTEM_STATUS: VERIFIED
				</div>
				<div className="relative mb-8 flex h-24 w-24 items-center justify-center border border-(--live-dim) bg-(--surface-container)">
					<HugeiconsIcon
						icon={ValidationApprovalIcon}
						strokeWidth={1.5}
						className="h-12 w-12 text-(--live)"
						aria-hidden="true"
					/>
					<div className="pointer-events-none absolute inset-[-8px] border border-(--live)/20" />
				</div>
				<h1 className="font-headline-2xl-mobile text-headline-2xl-mobile mb-4 text-(--on-surface)">
					Email Verified
				</h1>
				<p className="font-body-base text-body-base mb-12 max-w-[280px] text-(--body)">
					Your identity has been successfully authenticated. You may now proceed
					to access the network.
				</p>
				<div className="flex w-full flex-col items-center space-y-4">
					<Link
						to="/login"
						className="flex h-12 w-full max-w-[300px] items-center justify-center gap-2 bg-(--press-amber) font-ui-sm text-ui-sm uppercase tracking-wider text-[#080808] no-underline transition-all hover:bg-opacity-90 active:scale-[0.98]"
					>
						Continue to Login
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							strokeWidth={2}
							className="h-[18px] w-[18px]"
							aria-hidden="true"
						/>
					</Link>
					<Link
						to="/login"
						className="flex h-12 w-full max-w-[300px] items-center justify-center gap-2 border border-(--rule) bg-transparent font-ui-sm text-ui-sm uppercase tracking-wider text-(--on-background) no-underline transition-all hover:bg-(--surface-container) hover:border-(--dim) active:scale-[0.98]"
					>
						Go to Dashboard
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							strokeWidth={2}
							className="h-[18px] w-[18px]"
							aria-hidden="true"
						/>
					</Link>
				</div>
			</div>
		);
	}

	function renderMobileErrorContent() {
		const showEmailInput = !email;

		return (
			<div className="relative z-10 flex w-full max-w-sm flex-col gap-8 border border-(--rule) bg-(--surface) p-6">
				<div
					className="absolute inset-0 pointer-events-none z-0 opacity-20"
					style={{
						backgroundImage:
							"url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDgwODA4Ij48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxQTFBMUEiPjwvcmVjdD4KPC9zdmc+')",
					}}
				/>
				<div className="relative z-10 flex flex-col gap-6">
					<div className="flex items-center justify-between border-b border-(--rule) pb-2 font-mono-label text-mono-label uppercase tracking-widest text-(--dim)">
						<span>// AUTH_ERROR</span>
						<span className="opacity-80 text-(--destructive)">CODE_401</span>
					</div>
					<div className="flex flex-col items-start gap-4 pt-2">
						<div className="flex items-center justify-center border border-(--rule) bg-(--surface-container-low) p-4">
							<HugeiconsIcon
								icon={Alert02Icon}
								strokeWidth={2}
								className="h-8 w-8 text-(--destructive)"
								aria-hidden="true"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<h1 className="font-headline-2xl-mobile text-headline-2xl-mobile break-words uppercase tracking-tight text-(--on-background)">
								Link Invalid
							</h1>
							<p className="font-body-base text-body-base mt-2 text-(--body)">
								The verification token you provided has expired, been used
								previously, or is otherwise malformed. Security protocols
								require a fresh token to proceed.
							</p>
						</div>
					</div>
					<hr className="w-full border-(--rule)" />
					{showEmailInput && (
						<div className="flex flex-col gap-2">
							<label
								htmlFor="resend-email-mobile"
								className="font-mono-label text-mono-label uppercase text-(--dim)"
							>
								Email Address
							</label>
							<input
								id="resend-email-mobile"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@company.com"
								className="border border-(--rule) bg-(--surface-container-low) px-4 py-3 font-body-base text-body-base text-(--on-surface) placeholder:text-(--dim) focus:outline-2 focus:outline-(--primary-container)"
							/>
						</div>
					)}
					<div className="flex w-full flex-col gap-3">
						<button
							type="button"
							onClick={handleResend}
							disabled={resendMutation.isPending || !email}
							className="group flex w-full items-center justify-center gap-2 border border-(--primary-container) bg-(--primary-container) px-4 py-4 font-mono-label text-mono-label uppercase text-(--on-primary-container) transition-colors duration-100 hover:bg-(--primary) active:scale-95 disabled:opacity-50"
						>
							<HugeiconsIcon
								icon={Refresh01Icon}
								strokeWidth={2}
								className={`h-4 w-4 transition-transform group-hover:-translate-y-px ${resendMutation.isPending ? "animate-spin" : ""}`}
								aria-hidden="true"
							/>
							{resendMutation.isPending ? "SENDING..." : "Resend Email"}
						</button>
						<Link
							to="/login"
							className="group flex w-full items-center justify-center gap-2 border border-(--rule) bg-transparent px-4 py-4 font-mono-label text-mono-label uppercase text-(--on-background) no-underline transition-all duration-100 hover:bg-(--surface-container-highest) hover:border-(--dim) active:scale-95"
						>
							<HugeiconsIcon
								icon={ArrowLeft01Icon}
								strokeWidth={2}
								className="h-4 w-4 text-(--dim) transition-colors group-hover:text-(--on-background)"
								aria-hidden="true"
							/>
							Return to Login
						</Link>
					</div>
					<div className="mt-4 text-right font-mono-label text-[10px] text-(--dim) opacity-50">
						&gt; AWAITING_USER_INPUT_
					</div>
				</div>
			</div>
		);
	}

	// ─── Desktop Brand Panel ────────────────────────────────────────────────────

	function renderDesktopBrandPanel() {
		let brandContent: ReactNode;

		switch (pageState) {
			case "success":
				brandContent = renderBrandPanelSuccess();
				break;
			case "error":
				brandContent = renderBrandPanelError();
				break;
			default:
				brandContent = renderBrandPanelSent();
		}

		const showBgImage = pageState === "success";

		return (
			<aside className="relative hidden w-1/2 shrink-0 overflow-hidden border-r border-(--rule) bg-(--surface-container-lowest) lg:flex lg:flex-col">
				<PressGrid />
				{showBgImage && (
					<div
						className="pointer-events-none absolute inset-0 z-10 opacity-40 mix-blend-luminosity grayscale"
						style={{
							backgroundImage:
								"url('https://images.unsplash.com/photo-1596526131084-a35d8c5b4d1f?q=80&w=1740&auto=format&fit=crop')",
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					/>
				)}
				{pageState === "error" && (
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-(--surface-container-lowest)" />
				)}
				{brandContent}
			</aside>
		);
	}

	// ─── Main Content ───────────────────────────────────────────────────────────

	function renderDesktopContent() {
		switch (pageState) {
			case "sent":
				return renderSentContent();
			case "success":
				return renderSuccessContent();
			case "already-verified":
				return renderAlreadyVerifiedContent();
			case "verifying":
				return renderVerifyingContent();
			case "error":
				return renderErrorContent();
		}
	}

	function renderMobileContent() {
		switch (pageState) {
			case "sent":
				return renderMobileSentContent();
			case "success":
				return renderMobileSuccessContent();
			case "already-verified":
				return renderMobileSuccessContent();
			case "verifying":
				return renderVerifyingContent();
			case "error":
				return renderMobileErrorContent();
		}
	}

	const mobileFooterText =
		pageState === "sent"
			? "// SESSION_STATE: AWAITING_VERIFICATION"
			: pageState === "error"
				? "// AWAITING_USER_INPUT_"
				: "";

	return (
		<div className="flex min-h-dvh w-full overflow-hidden bg-(--surface)">
			{renderDesktopBrandPanel()}
			<main className="flex min-h-dvh flex-1 flex-col overflow-y-auto bg-(--ink)">
				{renderMobileHeader()}
				<div className="hidden flex-1 items-center justify-center px-8 py-12 lg:flex">
					{renderDesktopContent()}
				</div>
				<div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:hidden">
					{renderMobileContent()}
				</div>
				{mobileFooterText && renderMobileFooter(mobileFooterText)}
			</main>
		</div>
	);
}
