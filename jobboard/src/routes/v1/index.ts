import type { Request, Response } from "express";
import { Router } from "express";
import adminRoutes from "@/routes/v1/admin.route";
import authRoutes from "@/routes/v1/auth.route";
import companyRoutes from "@/routes/v1/company.route";
import jobRoutes from "@/routes/v1/job.route";
import notificationRoutes from "@/routes/v1/notification.route";
import superAdminRoutes from "@/routes/v1/superadmin.route";
import tagsRoutes from "@/routes/v1/tags.route";
import userRoutes from "@/routes/v1/user.route";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.status(200).json({
		message: "Api is Live and Healthy",
		status: "Ok",
		version: "1.0.0",
		timeStamp: new Date().toISOString(),
	});
});

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/company", companyRoutes);
router.use("/job", jobRoutes);
router.use("/tags", tagsRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/superadmin", superAdminRoutes);

export default router;
