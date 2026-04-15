import { supabase } from "../../lib/supabase";

export async function listOrders(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      payment_status,
      payment_method,
      total_kes,
      delivery_zone_title,
      created_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load orders.");
  }

  return data ?? [];
}