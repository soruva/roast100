import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  await supabase
    .from("roasts")
    .update({ completed: true })
    .eq("session_id", sessionId);

  return NextResponse.json({ success: true });
}
