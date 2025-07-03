import { Router } from "express";
import { signUp } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/signup", asyncHandler(signUp));

export default router;
