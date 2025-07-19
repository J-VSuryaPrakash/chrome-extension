import { Router } from "express";
import { logTimeForSite, getDailyReport } from "../controllers/reports.controller.js";
import {verifyUser} from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/log-time").post(verifyUser,logTimeForSite);

router.route("/get-daily-report").get(verifyUser,getDailyReport);

export default router;