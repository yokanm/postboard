import { createFileRoute, Navigate } from "@tanstack/react-router";
import { requireRole } from "@/guards";

export const Route = createFileRoute("/_authenticated/recruiter/")({
	beforeLoad: requireRole(["RECRUITER"]),
	component: () => <Navigate to="/recruiter/dashboard" replace />,
});
