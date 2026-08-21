import {
  Router,
} from "express";

import {
  requireAdmin,
} from "../middleware/adminAuthMiddleware";

import {
  listPendingReports,
  rejectHazardReport,
  verifyHazardReport,
} from "../controllers/adminReportController";

const router =
  Router();

router.use(
  requireAdmin
);

router.get(
  "/pending",
  listPendingReports
);

router.patch(
  "/:id/verify",
  verifyHazardReport
);

router.patch(
  "/:id/reject",
  rejectHazardReport
);

export default router;