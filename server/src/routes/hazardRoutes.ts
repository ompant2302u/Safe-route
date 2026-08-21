import {
  Router,
} from "express";

import {
  getHazardDetails,
  listActiveHazards,
} from "../controllers/hazardController";

const router =
  Router();

router.get(
  "/",
  listActiveHazards
);

router.get(
  "/:id",
  getHazardDetails
);

export default router;