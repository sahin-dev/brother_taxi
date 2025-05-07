import { use } from "passport";
import config from "../../../config";
import { Stripe } from "stripe";

const stripe = require('stripe')(config.stripe_key as string);


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

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {secret: paymentIntent.client_secret};
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


const stripeWebhook = async (body:any, sig:string) => {

    let event: Stripe.Event;
    console.log('Received Stripe webhook:', body, sig);
    // Verify and construct the Stripe event
    event = stripe.webhooks.constructEvent(
      body, // Raw body is required
      sig,
      config.webhook_secret as string // Your webhook secret
    );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('PaymentIntent was successful!', paymentIntent);
    // update database, mark order as paid, etc.
  }
  else if (event.type === 'payment_method.attached') {
    const paymentMethod = event.data.object;

    // Handle the event
  } else if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Handle the event
  } else if (event.type === 'account.updated') {
    const account = event.data.object;
    // Handle the event
  } else if (event.type === 'account.application.authorized') {
    const account = event.data.object;
    // Handle the event
  } else if (event.type === 'account.application.deauthorized') {
    const account = event.data.object;
    // Handle the event
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    // Handle the event
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    // Handle the event
  } else {
    console.log(`Unhandled event type ${event.type}`);
}
    
    // Handle the event

}
export const stripeService = {
    createSession,
    createIntent,
    createStripeAccount,
    stripeWebhook
}
