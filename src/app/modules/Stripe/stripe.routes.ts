import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import { stripeController } from "./stripe.controller";
import express from 'express'

const router = Router();

router.post("/create-checkout-session",auth(),stripeController.createSession);
router.post("/create-intent",auth(), stripeController.createIntent); 
router.post("/create-account",auth(), stripeController.createStripeAccount);
router.post("/webhook", express.raw({ type: 'application/json' }),stripeController.stripeWebhook);

export const stripeRoutes = router;