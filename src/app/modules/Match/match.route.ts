import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import { matchController } from "./match.controller";

const router = Router();


router.get("/match-user",auth(), matchController.getMatchingUsers);

export const matchRoutes = router;