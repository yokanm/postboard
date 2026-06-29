// src/lib/email.ts
// Thin wrapper around Resend. In development, if RESEND_API_KEY is absent
// the email is logged to console instead of thrown so dev flow isn't blocked.

import { Resend } from "resend";
import config from "@/config";
import logger from "@/lib/winston";

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

type SendEmailOptions = {
	to: string;
	subject: string;
	html: string;
};

export const sendEmail = async (opts: SendEmailOptions): Promise<void> => {
	if (!resend) {
		logger.warn("[Email - DEV ONLY] Would have sent email", {
			to: opts.to,
			subject: opts.subject,
		});
		// Print the full HTML in dev so you can grab links from logs
		logger.info(`[Email body]\n${opts.html}`);
		return;
	}

	const { error } = await resend.emails.send({
		from: config.EMAIL_FROM,
		to: "ogunyebiayokanmi@gmail.com", // temp: Resend only allows your own email until domain is verified
		subject: opts.subject,
		html: opts.html,
	});
	if (error) {
		logger.error("Resend error", error);
		throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
	}

	logger.info("[Email] Sent successfully", {
		to: opts.to,
		subject: opts.subject,
	});
};

// ─── Templates ────────────────────────────────────────────────────────────────

export const verificationEmailHtml = (name: string, link: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:40px auto;color:#1a1a1a">
  <h2 style="margin-bottom:8px">Verify your email</h2>
  <p>Hi ${name}, thanks for signing up. Click the button below to verify your email address.</p>
  <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1D9E75;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
    Verify email
  </a>
  <p style="color:#666;font-size:13px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
  <p style="color:#999;font-size:12px">${link}</p>
</body>
</html>
`;

export const passwordResetEmailHtml = (name: string, link: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:40px auto;color:#1a1a1a">
  <h2 style="margin-bottom:8px">Reset your password</h2>
  <p>Hi ${name}, we received a request to reset your password.</p>
  <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1D9E75;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
    Reset password
  </a>
  <p style="color:#666;font-size:13px">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
  <p style="color:#999;font-size:12px">${link}</p>
</body>
</html>
`;

export const companyVerificationEmailHtml = (
	companyName: string,
	link: string,
) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:40px auto;color:#1a1a1a">
  <h2 style="margin-bottom:8px">Verify your company email</h2>
  <p>Thanks for registering <strong>${companyName}</strong>. Click below to verify this email address.</p>
  <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1D9E75;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
    Verify company email
  </a>
  <p style="color:#666;font-size:13px">This link expires in 24 hours.</p>
  <p style="color:#999;font-size:12px">${link}</p>
</body>
</html>
`;
