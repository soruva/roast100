import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // Verify the webhook is from Stripe
  // In production: use stripe.webhooks.constructEvent()
  // For now: accept and log
  try {
    const event = JSON.parse(body);
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Payment completed:", session.id);
      // Here you would trigger the Groq analysis
      // and store results in a database
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
