import React, { useMemo } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOrdersStore } from "../../../src/store/ordersStore";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

const STATUS_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const getById = useOrdersStore((s) => s.getById);
  const order = useMemo(() => getById(id), [id]);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
        <Ionicons name="alert-circle-outline" size={40} color="#111827" />
        <Text style={{ fontSize: 18, fontWeight: "900" }}>Order not found</Text>
        <Pressable
          onPress={() => router.replace("/(orders)/orders")}
          style={{
            marginTop: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 18,
            backgroundColor: "#111827",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>Back to orders</Text>
        </Pressable>
      </View>
    );
  }

  const currentIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((s) => s.key === order.status)
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 20, fontWeight: "900" }}>Order</Text>
      <Text style={{ color: "#444", marginTop: 6 }}>{order.id}</Text>
      <Text style={{ color: "#444", marginTop: 2 }}>{formatDate(order.createdAt)}</Text>

      {/* Status timeline (stub) */}
      <View
        style={{
          marginTop: 14,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#EEF1FF",
          backgroundColor: "#fff",
          padding: 14,
          gap: 10,
        }}
      >
        <Text style={{ fontWeight: "900" }}>Status</Text>
        <View style={{ gap: 10 }}>
          {STATUS_STEPS.map((s, idx) => {
            const done = idx <= currentIndex;
            return (
              <View key={s.key} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: done ? "#111827" : "#F4F6FF",
                    borderWidth: 1,
                    borderColor: done ? "#111827" : "#E7EBFF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#C7CBD6" }} />
                  )}
                </View>
                <Text style={{ fontWeight: "900", color: done ? "#111827" : "#444" }}>
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Items */}
      <View
        style={{
          marginTop: 14,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#EEF1FF",
          backgroundColor: "#fff",
          padding: 14,
          gap: 12,
        }}
      >
        <Text style={{ fontWeight: "900" }}>Items</Text>
        <View style={{ gap: 10 }}>
          {order.items.map((it, idx) => (
            <View key={`${it.name}-${idx}`} style={{ flexDirection: "row", gap: 10 }}>
              <Image
                source={{ uri: it.image }}
                style={{ width: 56, height: 56, borderRadius: 16 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "900" }} numberOfLines={1}>
                  {it.name}
                </Text>
                <Text style={{ color: "#444", marginTop: 2 }}>
                  {it.sizeLabel} • KES {it.unitPriceKes} • x{it.quantity}
                </Text>
              </View>
              <Text style={{ fontWeight: "900" }}>
                KES {it.unitPriceKes * it.quantity}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Delivery */}
      <View
        style={{
          marginTop: 14,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#EEF1FF",
          backgroundColor: "#fff",
          padding: 14,
          gap: 8,
        }}
      >
        <Text style={{ fontWeight: "900" }}>Delivery</Text>
        <Text style={{ color: "#444" }}>
          {order.delivery.zoneTitle} • {order.delivery.rangeLabel} • KES {order.delivery.feeKes}
        </Text>
        <Text style={{ color: "#444" }}>{order.delivery.address}</Text>
        <Text style={{ color: "#444" }}>{order.delivery.phone}</Text>
      </View>

      {/* Payment + totals */}
      <View
        style={{
          marginTop: 14,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#EEF1FF",
          backgroundColor: "#fff",
          padding: 14,
          gap: 8,
        }}
      >
        <Text style={{ fontWeight: "900" }}>Payment & totals</Text>
        <Row label="Payment method" value={order.payment.method.toUpperCase()} />
        <Row label="Subtotal" value={`KES ${order.pricing.subtotalKes}`} />
        <Row label={`Discount (${order.pricing.discountPercent}% test)`} value={`- KES ${order.pricing.discountKes}`} />
        <Row label="Delivery" value={`KES ${order.pricing.deliveryFeeKes}`} />
        <View style={{ height: 1, backgroundColor: "#EEF1FF", marginVertical: 6 }} />
        <Row label="Total" value={`KES ${order.pricing.totalKes}`} strong />
      </View>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

function Row({ label, value, strong }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: "#444", fontWeight: strong ? "900" : "700" }}>{label}</Text>
      <Text style={{ fontWeight: strong ? "900" : "800" }}>{value}</Text>
    </View>
  );
}
