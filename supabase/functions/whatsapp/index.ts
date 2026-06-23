import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/whatsapp\//, "");

    if (path === "send" && req.method === "POST") {
      const { lead_id, content } = await req.json();
      if (!lead_id || !content) {
        return new Response(
          JSON.stringify({ error: "lead_id and content required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: lead } = await supabase.from("leads").select("phone").eq("id", lead_id).single();
      if (!lead) {
        return new Response(
          JSON.stringify({ error: "Lead not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.from("messages").insert({
        lead_id,
        content,
        direction: "outgoing",
      });

      await supabase.from("lead_activities").insert({
        lead_id,
        type: "message",
        description: `Отправлено сообщение: ${content.substring(0, 100)}`,
      });

      return new Response(
        JSON.stringify({ success: true, message: "Message queued" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "session" && req.method === "GET") {
      const { data } = await supabase.from("whatsapp_sessions").select("*").limit(1).maybeSingle();
      return new Response(
        JSON.stringify({ session: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
