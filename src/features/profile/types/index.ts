export interface Profile {
	bio: string | null;
	resumeUrl: string | null;
	resumePublicId: string | null;
	linkedinUrl: string | null;
	githubUrl: string | null;
	skills: string[];
	location: string | null;
}

export interface ProfileResponse {
	profile: Profile & { id: string; userId: string; updatedAt: string };
}

export interface UpdateProfilePayload {
	bio?: string;
	skills?: string[];
	location?: string;
	linkedinUrl?: string;
	githubUrl?: string;
	resumePublicId?: string;
}

export interface ResumeUploadResponse {
	resumeUrl: string;
}

export interface CurrentUserWithProfile {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string | null;
	role: "CANDIDATE" | "RECRUITER" | "ADMIN" | "SUPERADMIN";
	isVerified: boolean;
	companyId: string | null;
	createdAt: string;
	profile: {
		bio: string | null;
		resumeUrl: string | null;
		linkedinUrl: string | null;
		githubUrl: string | null;
		skills: string[];
		location: string | null;
	} | null;
}
