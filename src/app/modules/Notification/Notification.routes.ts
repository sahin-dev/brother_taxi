import express from "express";
import auth from "../../middlewares/auth.middleware";
import { notificationController } from "./Notification.controller";

const router = express.Router();

router.post(
  "/send-notification/:userId",
  auth(),
  notificationController.sendNotification
);

router.put('/read/:notificationId', auth(), notificationController.readNotification)
router.post(
  "/send-notification",
  auth(),
  notificationController.sendNotifications
);

router.get("/", auth(), notificationController.getNotifications);
router.get(
  "/:notificationId",
  auth(),
  notificationController.getSingleNotificationById
);

export const notificationsRoute = router;
