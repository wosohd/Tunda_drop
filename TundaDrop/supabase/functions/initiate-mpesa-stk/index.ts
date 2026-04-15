import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseAdmin, createSupabaseAnon } from "../_shared/supabase.ts";
import { initiateStkPush } from "../_shared/mpesa.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return json({ error: "Missing Authorization header." }, 401);
    }

    const supabaseUserClient = createSupabaseAnon(authHeader);
    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Unauthorized." }, 401);
    }

    const { orderId, phone } = await req.json();

    if (!orderId) {
      return json({ error: "orderId is required." }, 400);
    }

    const supabaseAdmin = createSupabaseAdmin();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return json({ error: "Order not found." }, 404);
    }

    if (order.payment_status === "succeeded" || order.status === "paid") {
      return json({ error: "Order is already paid." }, 409);
    }

    const { data: existingPayment, error: existingPaymentError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .eq("provider", "mpesa")
      .eq("method", "stk_push")
      .eq("status", "processing")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPaymentError) {
      return json({ error: existingPaymentError.message }, 500);
    }

    if (existingPayment) {
      return json({
        success: true,
        paymentId: existingPayment.id,
        orderId: order.id,
        checkoutRequestId: existingPayment.checkout_request_id ?? null,
        merchantRequestId: existingPayment.merchant_request_id ?? existingPayment.provider_reference ?? null,
        responseCode: existingPayment.result_code ?? "0",
        responseDescription: existingPayment.result_desc ?? "An STK request is already in progress.",
        customerMessage: "An STK Push is already in progress for this order.",
      });
    }

    const msisdn = String(phone || order.customer_phone || "").trim();
    if (!msisdn) {
      return json({ error: "Phone number is required." }, 400);
    }

    const { data: payment, error: paymentInsertError } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: order.id,
        provider: "mpesa",
        method: "stk_push",
        status: "processing",
        amount_kes: order.total_kes,
      })
      .select()
      .single();

    if (paymentInsertError || !payment) {
      return json(
        { error: paymentInsertError?.message || "Failed to create payment row." },
        500,
      );
    }

    const stkResponse = await initiateStkPush({
      amountKes: order.total_kes,
      phone: msisdn,
      accountReference: order.order_number || order.id,
      transactionDesc: `TundaDrop ${order.order_number || order.id}`,
    });

    const checkoutRequestId = stkResponse.CheckoutRequestID ?? null;
    const merchantRequestId = stkResponse.MerchantRequestID ?? null;
    const responseCode = stkResponse.ResponseCode ?? null;
    const responseDescription = stkResponse.ResponseDescription ?? null;
    const customerMessage = stkResponse.CustomerMessage ?? null;

    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        provider_reference: merchantRequestId,
        merchant_request_id: merchantRequestId,
        checkout_request_id: checkoutRequestId,
        result_code: responseCode ? String(responseCode) : null,
        result_desc: responseDescription,
        raw_response: stkResponse,
        status: responseCode === "0" ? "processing" : "failed",
        initiated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      return json({ error: paymentUpdateError.message }, 500);
    }

    const nextOrderStatus = responseCode === "0" ? "awaiting_payment" : "payment_failed";
    const nextPaymentStatus = responseCode === "0" ? "processing" : "failed";

    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: nextOrderStatus,
        payment_status: nextPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (orderUpdateError) {
      return json({ error: orderUpdateError.message }, 500);
    }

    return json({
      success: responseCode === "0",
      paymentId: payment.id,
      orderId: order.id,
      checkoutRequestId,
      merchantRequestId,
      responseCode,
      responseDescription,
      customerMessage,
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