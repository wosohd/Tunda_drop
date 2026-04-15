import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseAdmin } from "../_shared/supabase.ts";

type MpesaCallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: Array<{
          Name?: string;
          Value?: string | number;
        }>;
      };
    };
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as MpesaCallbackBody;
    const callback = payload?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      return json({ error: "Invalid callback payload." }, 400);
    }

    const supabaseAdmin = createSupabaseAdmin();

    const { data: payment, error: paymentLookupError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("checkout_request_id", callback.CheckoutRequestID)
      .single();

    if (paymentLookupError || !payment) {
      return json({ error: "Payment not found." }, 404);
    }

    const metadataItems = callback.CallbackMetadata?.Item ?? [];
    const metadata = Object.fromEntries(
      metadataItems
        .filter((item) => item?.Name)
        .map((item) => [item.Name as string, item.Value ?? null]),
    );

    const success = callback.ResultCode === 0;

    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: success ? "succeeded" : "failed",
        merchant_request_id: callback.MerchantRequestID ?? payment.merchant_request_id ?? null,
        result_code:
          callback.ResultCode !== undefined && callback.ResultCode !== null
            ? String(callback.ResultCode)
            : null,
        result_desc: callback.ResultDesc ?? null,
        raw_callback: payload,
        external_customer_reference:
          typeof metadata.MpesaReceiptNumber === "string"
            ? metadata.MpesaReceiptNumber
            : null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      return json({ error: paymentUpdateError.message }, 500);
    }

    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: success ? "succeeded" : "failed",
        status: success ? "paid" : "payment_failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.order_id);

    if (orderUpdateError) {
      return json({ error: orderUpdateError.message }, 500);
    }

    return json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      500,
    );
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}