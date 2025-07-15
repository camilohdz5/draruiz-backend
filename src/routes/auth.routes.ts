import { Router } from "express";
import { register, login, verifyEmail, resendVerification, getProfile } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validationMiddleware";
import { registerSchema, loginSchema, verifyEmailSchema, resendVerificationSchema } from "../schemas/auth.schemas";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", validateRequest(resendVerificationSchema), resendVerification);
router.get("/profile", getProfile);

export default router;
