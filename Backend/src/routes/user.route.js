import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, logoutUser, getCurrentUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyUser, logoutUser);

router.route("/current-user").get(verifyUser, getCurrentUser);

export default router