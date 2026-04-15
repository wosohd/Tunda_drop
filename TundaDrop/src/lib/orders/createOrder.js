import { mapCartToOrderPayload } from "./mapCartToOrderPayload";

// Adjust this import to match your real Supabase client file.
// Example alternatives:
// import { supabase } from "../../../lib/supabase";
// import { supabase } from "../../lib/supabase";
import { supabase } from "../../lib/supabase";

export async function createOrder({
  user,
  items,
  zoneId,
  address,
  phone,
  paymentMethod,
}) {
  const { orderRow, orderItemsRows, totals, zone } = mapCartToOrderPayload({
    user,
    items,
    zoneId,
    address,
    phone,
    paymentMethod,
  });

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert(orderRow)
    .select()
    .single();

  if (orderError) {
    throw new Error(orderError.message || "Failed to create order.");
  }

  const rowsWithOrderId = orderItemsRows.map((item) => ({
    ...item,
    order_id: createdOrder.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(rowsWithOrderId);

  if (itemsError) {
    // Best-effort rollback for this step.
    // Later, we can move this whole flow into an Edge Function / RPC for stronger atomicity.
    await supabase.from("orders").delete().eq("id", createdOrder.id);
    throw new Error(itemsError.message || "Failed to save order items.");
  }

  return {
    order: createdOrder,
    totals,
    zone,
  };
}