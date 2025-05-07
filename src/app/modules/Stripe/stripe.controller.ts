
import { Request, Response } from 'express';
import { stripeService } from './stripe.service';
import sendResponse from '../../../shared/ApiResponse';
import { send } from 'process';


const createSession = async (req: Request, res: Response) => {
    const {priceId} = req.body
    const user = req.user;

    const result = await stripeService.createSession(user.id, priceId);
    res.status(200).json({
        success: true,
        statusCode:200,
        message: 'Session created successfully!',
        data: result,
    })

}

const createIntent= async (req: Request, res: Response) => {
    const user = req.user;  
    const {amount} = req.body   as {amount:number}

    const result = await stripeService.createIntent(user.id, amount);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Intent created successfully!',
        data: result,
    });
    
}

const createStripeAccount = async (req: Request, res: Response) => {
    const user = req.user;  
    

    const result = await stripeService.createStripeAccount(user.id, user.email!);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Intent created successfully!',
        data: result,
    });
}

const stripeWebhook = async (req: Request, res: Response) => {
    console.log('Webhook received!');
    const body = req.body;
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      console.error('Missing Stripe signature header');
    }
    const result = await stripeService.stripeWebhook(body, sig);

    res.status(200).send("webhook received")
}


export const stripeController = {
    createSession,
    createIntent,
    createStripeAccount,
    stripeWebhook
}
