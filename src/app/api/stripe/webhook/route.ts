import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) {
    console.log("Database not configured, skipping subscription tracking");
    return NextResponse.json({ received: true });
  }
  
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.metadata?.userId;
      
      if (clerkId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as any;
        
        const user = await prisma.user.upsert({
          where: { clerkId },
          create: {
            clerkId,
            email: session.customer_email,
            stripeCustomerId: session.customer as string,
          },
          update: {
            email: session.customer_email,
            stripeCustomerId: session.customer as string,
          },
        });

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: subscription.id },
          create: {
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            status: subscription.status,
          },
          update: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            status: subscription.status,
          },
        });

        console.log(`User ${clerkId} subscribed successfully`);
      }
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status,
        },
      });
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "canceled" },
      });
      break;
    }
    
    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      
      if (invoice.subscription) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "past_due" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
