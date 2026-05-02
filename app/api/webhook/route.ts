import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const url = session.metadata?.url || "";
      const description = session.metadata?.description || "";

      await supabase.from("roasts").insert({
        session_id: session.id,
        url,
        description,
        paid: true,
        completed: false,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
