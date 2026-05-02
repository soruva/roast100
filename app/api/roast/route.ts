import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_ANON_KEY!;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { systemPrompt, userContent, sessionId } = await req.json();

  if (sessionId) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("roasts")
      .select("paid, completed")
      .eq("session_id", sessionId)
      .single();

    if (!data?.paid) {
      return NextResponse.json({ error: "Payment not verified" }, { status: 403 });
    }

    if (data?.completed) {
      return NextResponse.json({ error: "Already used" }, { status: 403 });
    }
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 200,
      temperature: 0.95,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  const data2 = await res.json();
  return NextResponse.json(data2);
}
