import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle subscription events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      
      if (userId) {
        // TODO: Update user subscription status in your database
        console.log(`User ${userId} subscribed successfully`);
      }
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO: Handle subscription updates (plan changes, etc.)
      console.log(`Subscription ${subscription.id} updated:`, subscription.status);
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO: Handle subscription cancellation
      console.log(`Subscription ${subscription.id} canceled`);
      break;
    }
    
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // TODO: Handle failed payment (notify user, etc.)
      console.log(`Payment failed for invoice ${invoice.id}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
