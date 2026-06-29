// src/__tests__/services/auth/login.service.test.ts
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as password from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";
import {
	loginCompanyService,
	loginUserService,
} from "@/services/v1/auth/login.service";

const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockCompany = prisma.company as jest.Mocked<typeof prisma.company>;
const mockRefresh = prisma.refreshToken as jest.Mocked<
	typeof prisma.refreshToken
>;

// Spy on password verification
const verifyPasswordSpy = jest.spyOn(password, "verifyPassword");

const fakeUser = {
	id: "user-123",
	userName: "testuser",
	email: "test@example.com",
	password: "hashed-pass",
	role: "CANDIDATE" as const,
	firstName: "Test",
	lastName: "User",
	phone: null,
	companyId: null,
	isVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	emailVerifyToken: null,
	emailVerifyExpiresAt: null,
	passwordResetToken: null,
	passwordResetExpiresAt: null,
};

const fakeCompany = {
	id: "company-1",
	name: "Acme Corp",
	slug: "acme-corp",
	email: "corp@acme.com",
	password: "hashed-pass",
	logoUrl: null,
	website: null,
	industry: null,
	size: null,
	isVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	emailVerifyToken: null,
	emailVerifyExpiresAt: null,
	passwordResetToken: null,
	passwordResetExpiresAt: null,
};

// ─── loginUserService ──────────────────────────────────────────────────────────

describe("loginUserService", () => {
	beforeEach(() => {
		mockUser.findUnique.mockResolvedValue(fakeUser);
		verifyPasswordSpy.mockResolvedValue(true);
		mockRefresh.create.mockResolvedValue({
			id: "rt-1",
			token: "refresh-token",
			userId: "user-123",
			companyId: null,
			isRevoked: false,
			expiresAt: new Date(),
			createdAt: new Date(),
		});
	});

	it("returns user summary, accessToken, refreshToken on valid credentials", async () => {
		const result = await loginUserService({
			email: "test@example.com",
			password: "Password1",
		});

		expect(result.user).toEqual({
			userName: "testuser",
			email: "test@example.com",
			role: "CANDIDATE",
		});
		expect(result.accessToken).toBeDefined();
		expect(result.refreshToken).toBeDefined();
	});

	it("creates a refresh token DB record", async () => {
		await loginUserService({
			email: "test@example.com",
			password: "Password1",
		});
		expect(mockRefresh.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ userId: "user-123" }),
			}),
		);
	});

	it("throws 401 when user not found", async () => {
		mockUser.findUnique.mockResolvedValue(null);
		await expect(
			loginUserService({ email: "nobody@example.com", password: "x" }),
		).rejects.toThrow(new AppError("Email or password is invalid", 401));
	});

	it("throws 401 when user is soft-deleted", async () => {
		mockUser.findUnique.mockResolvedValue({
			...fakeUser,
			deletedAt: new Date(),
		});
		await expect(
			loginUserService({ email: "test@example.com", password: "x" }),
		).rejects.toThrow(new AppError("Email or password is invalid", 401));
	});

	it("throws 401 when password does not match", async () => {
		verifyPasswordSpy.mockResolvedValue(false);
		await expect(
			loginUserService({ email: "test@example.com", password: "wrong" }),
		).rejects.toThrow(new AppError("Email or password is invalid", 401));
	});

	it("normalises email before lookup", async () => {
		await loginUserService({
			email: "TEST@EXAMPLE.COM",
			password: "Password1",
		});
		expect(mockUser.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({ where: { email: "test@example.com" } }),
		);
	});
});

// ─── loginCompanyService ───────────────────────────────────────────────────────

describe("loginCompanyService", () => {
	beforeEach(() => {
		mockCompany.findUnique.mockResolvedValue(fakeCompany);
		verifyPasswordSpy.mockResolvedValue(true);
		mockRefresh.create.mockResolvedValue({
			id: "rt-2",
			token: "refresh-token",
			userId: null,
			companyId: "company-1",
			isRevoked: false,
			expiresAt: new Date(),
			createdAt: new Date(),
		});
	});

	it("returns company summary, accessToken, refreshToken on valid credentials", async () => {
		const result = await loginCompanyService({
			email: "corp@acme.com",
			password: "CorpPass1",
		});
		expect(result.company).toEqual({
			id: "company-1",
			name: "Acme Corp",
			email: "corp@acme.com",
		});
		expect(result.accessToken).toBeDefined();
		expect(result.refreshToken).toBeDefined();
	});

	it("stores companyId in the refresh token record", async () => {
		await loginCompanyService({
			email: "corp@acme.com",
			password: "CorpPass1",
		});
		expect(mockRefresh.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ companyId: "company-1" }),
			}),
		);
	});

	it("throws 401 when company not found", async () => {
		mockCompany.findUnique.mockResolvedValue(null);
		await expect(
			loginCompanyService({ email: "none@x.com", password: "x" }),
		).rejects.toThrow(new AppError("Email or password is invalid", 401));
	});

	it("throws 401 on wrong password", async () => {
		verifyPasswordSpy.mockResolvedValue(false);
		await expect(
			loginCompanyService({ email: "corp@acme.com", password: "wrong" }),
		).rejects.toThrow(new AppError("Email or password is invalid", 401));
	});
});
