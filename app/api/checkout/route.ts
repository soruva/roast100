import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { url, description } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { 
  name: "Roast100 — 100 AI Critics",
  description: "Get roasted by 100 AI critics in seconds. Brutal, fast, and actionable feedback for your website.",
},
        unit_amount: 500,
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `https://roast100.vercel.app?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://roast100.vercel.app`,
    metadata: { url, description },
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
