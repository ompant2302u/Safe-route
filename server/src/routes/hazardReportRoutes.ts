import {
  Router,
} from "express";

import {
  submitHazardReport,
} from "../controllers/hazardReportController";

const router =
  Router();

router.post(
  "/",
  submitHazardReport
);

export default router;