export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN" | "SUPERADMIN";

// ─── Request shapes ──────────────────────────────────────────────────────────

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: UserRole;
	phone?: string;
	companyId?: string;
}

export interface ForgotPasswordCredentials {
	email: string;
}

export interface ResetPasswordCredentials {
	token: string;
	password: string;
}

export interface SendVerificationEmailCredentials {
	email: string;
}

// ─── Response shapes ─────────────────────────────────────────────────────────

export interface LoginResponseUser {
	userName: string;
	email: string;
	role: UserRole;
}

export interface RegisterResponseUser {
	id: string;
	userName: string;
	email: string;
	role: UserRole;
	isVerified: boolean;
	message: string;
}

export interface AuthTokens {
	accessToken: string;
}

export interface LoginResponse {
	user: LoginResponseUser;
	accessToken: string;
}

export interface RegisterResponse {
	user: RegisterResponseUser;
	message: string;
}

export interface RefreshResponse {
	accessToken: string;
}

export interface UserProfile {
	bio: string | null;
	resumeUrl: string | null;
	linkedinUrl: string | null;
	githubUrl: string | null;
	skills: string[];
	location: string | null;
}

// Backend Current User endpoint is the source of truth
export interface CurrentUserResponse {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string | null;
	role: UserRole;
	isVerified: boolean;
	companyId: string | null;
	createdAt: string;
	profile: UserProfile | null;
}

export type CurrentUser = CurrentUserResponse;

export interface ApiError {
	message: string;
}
