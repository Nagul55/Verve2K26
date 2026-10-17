import { NextRequest, NextResponse } from "next/server";
import { verifyYoupiWebhook } from "@/lib/payment/youpi";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-gateway-signature");

    // In local development/test mode, if webhook secret is default, we log and allow or verify
    const isValid = verifyYoupiWebhook(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === "production") {
      console.error("[YouPI Webhook] Invalid signature rejected");
      return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("[YouPI Webhook] Received event:", payload.event, "for orderId:", payload.orderId);

    if (payload.event === "SUCCESS") {
      const { orderId, amount, utr, paymentId } = payload;
      const adminClient = getAdminClient();

      // Find registration by payment_id or order_id
      // Update registration status to PAID
      try {
        await adminClient
          .from("registrations")
          .update({
            payment_status: "PAID",
            payment_id: paymentId,
            utr_number: utr,
            amount_paid: parseFloat(amount || "0")
          })
          .or(`id.eq.${orderId},payment_id.eq.${paymentId}`);
      } catch (dbErr: any) {
        console.warn("[YouPI Webhook] Note: updating registrations table:", dbErr.message);
      }

      console.log(`[YouPI Webhook] Payment confirmed! Order: ${orderId}, UTR: ${utr}, Amount: ₹${amount}`);
    }

    return NextResponse.json({ received: true, status: "SUCCESS" });
  } catch (err: any) {
    console.error("[YouPI Webhook Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
