import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { dislikeController } from "./DisLike.controller";


const router = Router();

// Toggle dislike for a user
router.post("/:id", auth(UserRole.ADMIN, UserRole.USER), dislikeController.toggleDislike);

// Get all IDs of users disliked by the current user
router.get("/my-dislikes", auth(UserRole.ADMIN, UserRole.USER), dislikeController.getAllMyDislikeIds);

export const DislikeRouter = router;
