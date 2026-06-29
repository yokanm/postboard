import jwt from "jsonwebtoken";
import config from "@/config";

export type TokenType = "user" | "company" | "superadmin";

export type TokenPayload = {
	sub: string; // entity id (user.id or company.id)
	type: TokenType; // distinguishes user tokens from company tokens
};

export const generateAccessToken = (id: string, type: TokenType): string => {
	return jwt.sign({ sub: id, type }, config.JWT_ACCESS_SECRET, {
		expiresIn: config.ACCESS_TOKEN_EXPIRES,
	});
};

export const generateRefreshToken = (id: string, type: TokenType): string => {
	return jwt.sign({ sub: id, type }, config.JWT_REFRESH_SECRET, {
		expiresIn: config.REFRESH_TOKEN_EXPIRES,
	});
};
// Used in authMiddleware — verifies short-lived access tokens
export const verifyAccessToken = (token: string): TokenPayload => {
	return jwt.verify(token, config.JWT_ACCESS_SECRET, {
		clockTolerance: 30,
	}) as TokenPayload;
};
// Used in refreshToken route — verifies long-lived refresh tokens
export const verifyRefreshToken = (token: string): TokenPayload => {
	return jwt.verify(token, config.JWT_REFRESH_SECRET, {
		clockTolerance: 30,
	}) as TokenPayload;
};

// ─── SuperAdmin tokens — separate secrets for access and refresh ─────────────

export const generateSuperAdminAccessToken = (id: string): string =>
	jwt.sign({ sub: id, type: "superadmin" }, config.JWT_SUPERADMIN_SECRET, {
		expiresIn: "4h",
	});

export const generateSuperAdminRefreshToken = (id: string): string =>
	jwt.sign(
		{ sub: id, type: "superadmin" },
		config.JWT_SUPERADMIN_REFRESH_SECRET,
		{
			expiresIn: "7d",
		},
	);

export const verifySuperAdminToken = (token: string): TokenPayload =>
	jwt.verify(token, config.JWT_SUPERADMIN_SECRET, {
		clockTolerance: 30,
	}) as TokenPayload;

export const verifySuperAdminRefreshToken = (token: string): TokenPayload =>
	jwt.verify(token, config.JWT_SUPERADMIN_REFRESH_SECRET, {
		clockTolerance: 30,
	}) as TokenPayload;
