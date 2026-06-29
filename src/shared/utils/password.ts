export interface PasswordRequirement {
	label: string;
	met: boolean;
}

export interface PasswordStrength {
	score: number;
	label: string;
	percent: number;
}

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function countVariety(password: string): number {
	let variety = 0;
	if (/[a-z]/.test(password)) variety++;
	if (/[A-Z]/.test(password)) variety++;
	if (/[0-9]/.test(password)) variety++;
	if (SPECIAL_CHAR_REGEX.test(password)) variety++;
	if (password.length >= 12) variety++;
	return variety;
}

export function getPasswordStrength(password: string): PasswordStrength {
	if (!password) return { score: 0, label: "", percent: 0 };

	const lengthScore = Math.min(password.length / 16, 1) * 25;
	const varietyScore = Math.min(countVariety(password) / 5, 1) * 40;
	const repeatPenalty = Math.max(
		0,
		30 - new Set(password.toLowerCase()).size * 2,
	);
	const complexityScore = Math.max(
		0,
		(/[a-z]/.test(password) ? 10 : 0) +
			(/[A-Z]/.test(password) ? 10 : 0) +
			(/[0-9]/.test(password) ? 10 : 0) +
			(SPECIAL_CHAR_REGEX.test(password) ? 15 : 0) -
			repeatPenalty,
	);

	const rawScore = lengthScore + varietyScore + complexityScore;
	const score = Math.min(Math.round(rawScore), 100);

	let label: string;
	if (score < 20) label = "Very Weak";
	else if (score < 40) label = "Weak";
	else if (score < 55) label = "Fair";
	else if (score < 70) label = "Good";
	else if (score < 90) label = "Strong";
	else label = "Very Strong";

	return { score, label, percent: score };
}

export function getPasswordRequirements(
	password: string,
): PasswordRequirement[] {
	return [
		{ label: "At least 8 characters", met: password.length >= 8 },
		{ label: "Uppercase letter", met: /[A-Z]/.test(password) },
		{ label: "Lowercase letter", met: /[a-z]/.test(password) },
		{ label: "Number", met: /[0-9]/.test(password) },
		{ label: "Special character", met: SPECIAL_CHAR_REGEX.test(password) },
	];
}
