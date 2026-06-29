// Application status utilities
// Backend verified values: PENDING, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED
// State machine: PENDING → REVIEWED → SHORTLISTED → ACCEPTED
//                Any state → REJECTED
//                ACCEPTED/REJECTED are terminal

import type { ApplicationStatus } from "../types";

export interface ApplicationStatusConfig {
	label: string;
	color: string;
	bg: string;
	border?: string;
}

const APPLICATION_STATUS_CONFIG: Record<
	ApplicationStatus,
	ApplicationStatusConfig
> = {
	PENDING: {
		label: "Pending",
		color: "text-(--dim)",
		bg: "bg-(--surface-container-high)",
	},
	REVIEWED: {
		label: "Reviewed",
		color: "text-(--primary-container)",
		bg: "bg-(--primary-container) bg-opacity-10",
	},
	SHORTLISTED: {
		label: "Shortlisted",
		color: "text-(--gradient-b)",
		bg: "bg-(--gradient-b) bg-opacity-10",
	},
	REJECTED: {
		label: "Rejected",
		color: "text-(--error)",
		bg: "bg-(--error-container) bg-opacity-10",
	},
	ACCEPTED: {
		label: "Accepted",
		color: "text-(--live)",
		bg: "bg-(--live-dim) bg-opacity-30",
	},
};

export function getApplicationStatusConfig(
	status: string,
): ApplicationStatusConfig {
	if (status in APPLICATION_STATUS_CONFIG) {
		return APPLICATION_STATUS_CONFIG[status as ApplicationStatus];
	}
	return {
		label: status,
		color: "text-(--dim)",
		bg: "bg-(--surface-container-high)",
	};
}

export function isTerminalStatus(status: string): boolean {
	return status === "REJECTED" || status === "ACCEPTED";
}

export function isActiveStatus(status: string): boolean {
	return (
		status === "PENDING" || status === "REVIEWED" || status === "SHORTLISTED"
	);
}

export function canCandidateWithdraw(status: string): boolean {
	return status === "PENDING";
}

// All valid statuses from backend
export const ALL_STATUSES: ApplicationStatus[] = [
	"PENDING",
	"REVIEWED",
	"SHORTLISTED",
	"REJECTED",
	"ACCEPTED",
];

// Statuses a recruiter can set via the API
export const UPDATABLE_STATUSES: ApplicationStatus[] = [
	"REVIEWED",
	"SHORTLISTED",
	"REJECTED",
	"ACCEPTED",
];

// Valid status transitions from backend state machine
export function getValidTransitions(
	current: ApplicationStatus,
): ApplicationStatus[] {
	switch (current) {
		case "PENDING":
			return ["REVIEWED", "REJECTED"];
		case "REVIEWED":
			return ["SHORTLISTED", "REJECTED"];
		case "SHORTLISTED":
			return ["ACCEPTED", "REJECTED"];
		case "REJECTED":
		case "ACCEPTED":
			return [];
	}
}
