import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validationMiddleware";
import { registerSchema, loginSchema } from "../schemas/auth.schemas";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

export default router;
