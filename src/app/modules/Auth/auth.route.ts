import { Router } from "express";
import { userLogin } from "./auth.controller";


const router = Router()

router.post("/login", userLogin)

export const authRoutes = router