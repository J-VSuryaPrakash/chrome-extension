import { Router } from "express";
import { getBlockedSitesList, addSiteToBlockList, removeSiteFromBlockList } from "../controllers/blockedSites.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/get-blocked-sites").get(verifyUser, getBlockedSitesList);

router.route("/add-site-to-block").post(verifyUser, addSiteToBlockList);

router.route("/remove-site-from-block").post(verifyUser, removeSiteFromBlockList);

export default router;