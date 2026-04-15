import { supabase } from "../../lib/supabase";

export async function getOrderById(orderId, userId) {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  let query = supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        product_name,
        size_label,
        unit_price_kes,
        quantity,
        line_total_kes,
        image_url
      ),
      payments (
        id,
        provider,
        method,
        status,
        amount_kes,
        provider_reference,
        created_at,
        completed_at
      )
    `)
    .eq("id", orderId)
    .single();

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to load order.");
  }

  return data;
}