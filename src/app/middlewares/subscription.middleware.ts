import { Request, Response, NextFunction } from "express";
import prisma from "../../shared/prisma";

const checkSubscription = (req:Request, res:Response, next:NextFunction) => {
  const user = req.user; // Assuming user is set in the request by a previous middleware

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user.planName === "FREE") {
    if (user.superMessagesSent >= 3) {
      return res.status(403).json({ message: "Super messages limit reached" });
    }

  }

  next();
}