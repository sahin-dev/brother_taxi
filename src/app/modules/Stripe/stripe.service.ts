import { use } from "passport";
import config from "../../../config";
import { Stripe } from "stripe";
import { Request, Response } from "express";
import prisma from "../../../shared/prisma";
import httpstatus from "http-status";
import ApiError from "../../../errors/ApiError";
import admin from "../Notification/firebaseAdmin";


const stripe = require('stripe')(config.stripe_key as string,{apiVersion: '2024-12-18.acacia'});


const createSession = async (userId:string, priceId:string) => {

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${config.forontend_url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.forontend_url}/cancel`,
  });

  return { url: session.url };
}


const createIntent = async (userId:string,amount:number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },  
  });
  if (!user?.customerId) {
    const customer = await stripe.customers.create({
      email: user?.email,
      name: user?.firstName + ' ' + user?.lastName,
      phone: user?.phone,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { customerId: customer.id },
    });
    
  }else {
    const customer = await stripe.customers.retrieve(user.customerId);
    console.log(customer);
  }  

  const customerId = user?.customerId;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },

  });
  

  return paymentIntent
}

const createStripeAccount = async (userId:string,email:string) => {  
    const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
    const accountLink = await stripe.accountLinks.create({      
        account: account.id,
        refresh_url: `${config.forontend_url}/account-link/refresh`,
        return_url: `${config.forontend_url}/account-link/success`,
        type: 'account_onboarding',
    });
    return { url: accountLink.url };    
}

const createNewAccountIntoStripe = async (userId: string) => {
  // Fetch user data from the database
  const userData = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userData) {
    throw new ApiError(httpstatus.NOT_FOUND, 'User not found');
  }

  let stripeAccountId = userData.customerId;

  // If the user already has a Stripe account, delete it
  if (stripeAccountId) {
    await stripe.accounts.del(stripeAccountId); // Delete the old account
  }

  // Create a new Stripe account
  const newAccount = await stripe.accounts.create({
    type: 'express',
    email: userData.email, // Use the user's email from the database
    country: 'US', // Set the country dynamically if needed
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      userId: userData.id, // Add metadata for reference
    },
  });

  // Generate the onboarding link for the new Stripe account
  const accountLink = await stripe.accountLinks.create({
    account: newAccount.id,
    refresh_url: `${config.forontend_url}/reauthenticate`,
    return_url: `${config.forontend_url}/onboarding-success`,
    type: 'account_onboarding',
  });

  // Update the user's Stripe account ID and URL in the database
  await prisma.user.update({
    where: { id: userData.id },
    data: {
      customerId: newAccount.id,
      accountLink: accountLink.url,
    },
  });

  return accountLink;
};


const stripeWebhook = async (req:Request, res:Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const body = req.body; // Use the raw body for verification
    let event: Stripe.Event;
    console.log('Received Stripe webhook:', body, sig);
    // Verify and construct the Stripe event
    event = stripe.webhooks.constructEvent(
      body, // Raw body is required
      sig,
      config.webhook_secret as string // Your webhook secret
    );
    console.log(event.type)
 switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;

      const userId = metadata.userId;
      const productName = metadata.productName; // boost, super_message, etc.

      if (!userId || !productName) break;
      const user = await prisma.user.findUnique({where:{id:userId}})

      if (productName === 'boost') {

        let boostLeft = new Date(user?.boostedTill || Date.now()).getTime() - Date.now()
        if (boostLeft <= 0){
          boostLeft = 0
        }
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            boosted: true,
            boostedTill: new Date(boostLeft + 30 * 60 * 1000), // 30 min boost
          },
        });
        
        if (user?.fcmToken){
          
        const message = {
          notification: {
          title:"Payment Successfull",
            body:`Your paayment successfully paid`,
          },
          token: user?.fcmToken,
        };
            admin.messaging().send(message)
            }
      } else if (productName === 'super_message') {
        let super_message = 0
        if ((user?.superMessages ?? 0) >= 0) {
          super_message += user?.superMessages ?? 0;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            superMessages: super_message, // or increment as needed
          },
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
     
      const subscriptionId = invoice.parent?.subscription_details?.subscription;
      
     

      // Retrieve full subscription with metadata
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const userId = subscription.metadata?.userId;
      const planType = subscription.metadata?.planType;

      if (userId && planType === 'premium') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            planName: 'premium',
            subscriptionId: subscriptionId as string,
            isPayment: true,
          },
        });
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
    
    res.status(200).json({ received: true });

}

export const stripeService = {
    createSession,
    createIntent,
    createStripeAccount,
    createNewAccountIntoStripe,
    stripeWebhook
}
