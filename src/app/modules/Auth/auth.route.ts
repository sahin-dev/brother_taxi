import { Router } from "express";
import { userLogin } from "./auth.controller";
import { loginValidationSchema } from "./auth.validation";
import validateRequest from "../../middlewares/validation.middleware";


const router = Router()

router.post("/login",validateRequest(loginValidationSchema), userLogin)

export const authRoutes = router