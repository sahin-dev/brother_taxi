import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/ApiResponse";
import { notificationServices } from "./Notification.service";


const sendNotification = catchAsync(async (req: any, res: any) => {
  const notification = await notificationServices.sendSingleNotification(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "notification sent successfully",
    data: notification,
  });
});

const sendNotifications = catchAsync(async (req: any, res: any) => {
  const notifications = await notificationServices.sendNotifications(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "notifications sent successfully",
    data: notifications,
  });
});

const getNotifications = catchAsync(async (req: any, res: any) => {
  const notifications = await notificationServices.getNotificationsFromDB(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    data: notifications,
  });
});

const getSingleNotificationById = catchAsync(async (req: any, res: any) => {
  const notificationId = req.params.notificationId;
  const notification = await notificationServices.getSingleNotificationFromDB(
    req,
    notificationId
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notification retrieved successfully",
    data: notification,
  });
});


const readNotification = catchAsync(async (req:Request, res:Response)=>{
  const notificationId = req.params.notificationId
  const userId = req.user.id
  const result = await notificationServices.readNotification(userId,notificationId)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notification read successfully",
    data: result,
  });
})

export const notificationController = {
  sendNotification,
  sendNotifications,
  getNotifications,
  getSingleNotificationById,
  readNotification
};
