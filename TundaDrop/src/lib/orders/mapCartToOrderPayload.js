import { DELIVERY_ZONES } from "../../constants/deliveryZones";
import { calcTotalsKes } from "../money";

const DISCOUNT_PERCENT_TEST = 10;

export function mapCartToOrderPayload({
  user,
  items,
  zoneId,
  address,
  phone,
  paymentMethod,
}) {
  if (!user?.id) {
    throw new Error("User is required to create an order.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId);

  if (!zone) {
    throw new Error("Please select a valid delivery zone.");
  }

  const cleanAddress = String(address || "").trim();
  const cleanPhone = String(phone || "").trim();

  if (cleanAddress.length < 6) {
    throw new Error("Please enter a valid delivery address.");
  }

  if (cleanPhone.length < 9) {
    throw new Error("Please enter a valid phone number.");
  }

  if (!["mpesa", "card"].includes(paymentMethod)) {
    throw new Error("Please select a valid payment method.");
  }

  const lines = items.map((item) => ({
    unitPriceKes: Number(item.unitPriceKes || 0),
    quantity: Number(item.quantity || 0),
  }));

  const totals = calcTotalsKes({
    lines,
    discountPercent: DISCOUNT_PERCENT_TEST,
    deliveryFeeKes: zone.feeKes,
  });

  const orderRow = {
    user_id: user.id,
    status: "pending",
    payment_method: paymentMethod,
    payment_status: "pending",
    currency: "KES",

    subtotal_kes: totals.subtotalKes,
    discount_kes: totals.discountKes,
    delivery_fee_kes: totals.deliveryFeeKes,
    total_kes: totals.totalKes,

    delivery_zone_id: zone.id,
    delivery_zone_title: zone.title,
    delivery_range_label: zone.rangeLabel ?? null,
    delivery_address: cleanAddress,
    customer_phone: cleanPhone,
  };

  const orderItemsRows = items.map((item) => ({
    product_name: item.name,
    size_label: item.sizeLabel,
    unit_price_kes: Number(item.unitPriceKes || 0),
    quantity: Number(item.quantity || 1),
    image_url: item.image ?? null,
  }));

  return {
    orderRow,
    orderItemsRows,
    totals,
    zone,
  };
}