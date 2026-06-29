// src/__tests__/services/auth/register.service.test.ts
import { beforeEach, describe, expect, it, type jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";
import {
	registerCompanyService,
	registerUserService,
} from "@/services/v1/auth/register.service";

// Typed mock helpers
const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockCompany = prisma.company as jest.Mocked<typeof prisma.company>;
const mockRefresh = prisma.refreshToken as jest.Mocked<
	typeof prisma.refreshToken
>;

// ─── registerUserService ──────────────────────────────────────────────────────

describe("registerUserService", () => {
	const validInput = {
		userName: "testuser",
		firstName: "Test",
		lastName: "User",
		email: "test@example.com",
		password: "Password1",
	};

	const fakeUser = {
		id: "user-123",
		userName: "testuser",
		email: "test@example.com",
		role: "CANDIDATE" as const,
		isVerified: false,
		firstName: "Test",
		lastName: "User",
		password: "hashed",
		phone: null,
		companyId: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		emailVerifyToken: "token-abc",
		emailVerifyExpiresAt: new Date(),
		passwordResetToken: null,
		passwordResetExpiresAt: null,
	};

	beforeEach(() => {
		mockUser.findUnique.mockResolvedValue(null); // email not taken
		mockUser.create.mockResolvedValue(fakeUser);
		mockRefresh.create.mockResolvedValue({
			id: "rt-1",
			token: "refresh",
			userId: "user-123",
			companyId: null,
			isRevoked: false,
			expiresAt: new Date(),
			createdAt: new Date(),
		});
	});

	it("returns user, accessToken, and refreshToken on success", async () => {
		const result = await registerUserService(validInput);

		expect(result).toMatchObject({
			user: {
				id: "user-123",
				userName: "testuser",
				email: "test@example.com",
				role: "CANDIDATE",
				isVerified: false,
			},
			accessToken: expect.any(String),
			refreshToken: expect.any(String),
		});
	});

	it("normalises email to lowercase", async () => {
		await registerUserService({ ...validInput, email: "TEST@EXAMPLE.COM" });
		expect(mockUser.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ email: "test@example.com" }),
			}),
		);
	});

	it("throws 409 when email already exists", async () => {
		mockUser.findUnique.mockResolvedValue(fakeUser);

		await expect(registerUserService(validInput)).rejects.toThrow(
			new AppError("Email already exists", 409),
		);
	});

	it("defaults role to CANDIDATE when no role supplied", async () => {
		await registerUserService(validInput);
		expect(mockUser.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ role: "CANDIDATE" }),
			}),
		);
	});

	it("allows RECRUITER role", async () => {
		await registerUserService({ ...validInput, role: "RECRUITER" });
		expect(mockUser.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ role: "RECRUITER" }),
			}),
		);
	});

	it("coerces unknown role to CANDIDATE", async () => {
		// @ts-expect-error intentional bad input
		await registerUserService({ ...validInput, role: "SUPERADMIN" });
		expect(mockUser.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ role: "CANDIDATE" }),
			}),
		);
	});

	it("throws 404 when companyId provided but company not found", async () => {
		mockCompany.findUnique.mockResolvedValue(null);

		await expect(
			registerUserService({ ...validInput, companyId: "bad-uuid" }),
		).rejects.toThrow(new AppError("Company not found", 404));
	});
});

// ─── registerCompanyService ───────────────────────────────────────────────────

describe("registerCompanyService", () => {
	const validInput = {
		companyName: "Acme Corp",
		companyEmail: "corp@acme.com",
		companyPassword: "CorpPass1",
		userName: "adminuser",
		firstName: "Admin",
		lastName: "User",
		userEmail: "admin@acme.com",
		userPassword: "AdminPass1",
	};

	const fakeCompany = {
		id: "company-1",
		name: "Acme Corp",
		slug: "acme-corp-123",
		email: "corp@acme.com",
		password: "hashed",
		logoUrl: null,
		website: null,
		industry: null,
		size: null,
		isVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		emailVerifyToken: "c-token",
		emailVerifyExpiresAt: new Date(),
		passwordResetToken: null,
		passwordResetExpiresAt: null,
	};

	const fakeAdminUser = {
		id: "user-admin-1",
		userName: "adminuser",
		firstName: "Admin",
		lastName: "User",
		email: "admin@acme.com",
		password: "hashed",
		role: "ADMIN" as const,
		companyId: "company-1",
		phone: null,
		isVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		emailVerifyToken: "u-token",
		emailVerifyExpiresAt: new Date(),
		passwordResetToken: null,
		passwordResetExpiresAt: null,
	};

	beforeEach(() => {
		mockCompany.findUnique.mockResolvedValue(null);
		mockUser.findUnique.mockResolvedValue(null);
		// Cast $transaction to the explicit generic type so mockResolvedValue
		// accepts the concrete object instead of collapsing to `never`.
		(
			prisma.$transaction as jest.Mock<() => Promise<unknown>>
		).mockResolvedValue({ company: fakeCompany, user: fakeAdminUser });
	});

	it("returns companyId and userId on success", async () => {
		const result = await registerCompanyService(validInput);
		expect(result).toEqual({ companyId: "company-1", userId: "user-admin-1" });
	});

	it("throws 409 when company email already registered", async () => {
		mockCompany.findUnique.mockResolvedValue(fakeCompany);
		await expect(registerCompanyService(validInput)).rejects.toThrow(
			new AppError("Company email already registered", 409),
		);
	});

	it("throws 409 when user email already exists", async () => {
		mockUser.findUnique.mockResolvedValue(fakeAdminUser);
		await expect(registerCompanyService(validInput)).rejects.toThrow(
			new AppError("User email already exists", 409),
		);
	});
});
