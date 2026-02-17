import React, { useMemo } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCartStore } from "../../src/store/cartStore";
import { calcTotalsKes } from "../../src/lib/money";

import { useTheme } from "../../src/theme/useTheme"; // <-- adjust if needed
import QuickBar from "../../src/components/ui/QuickBar"; // <-- adjust if needed

import Card from "../../src/components/ui/card";
import ScalePress from "../../src/components/ui/ScalePress";
import SummaryRow from "../../src/components/ui/SummaryRow";
import GradientButton from "../../src/components/ui/GradientButton";

export default function Cart() {
  const router = useRouter();
  const { t } = useTheme();

  const items = useCartStore((s) => s.items);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const getLinesForTotals = useCartStore((s) => s.getLinesForTotals);

  const styles = useMemo(() => makeStyles(t), [t]);

  // Testing discount (10%) and delivery fee (0 here; added in Checkout)
  const totals = useMemo(() => {
    return calcTotalsKes({
      lines: getLinesForTotals(),
      discountPercent: 10,
      deliveryFeeKes: 0,
    });
    // items triggers recompute when qty changes (and your store updates items array)
  }, [items, getLinesForTotals]);

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <QuickBar title="Cart" />

        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={44} color={t.colors.text} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add a juice and come back here.</Text>

          <GradientButton
            title="Browse juices"
            onPress={() => router.push("/(shop)/categories")}
            style={{ marginTop: t.space.md, alignSelf: "stretch" }}
            right={<Ionicons name="chevron-forward" size={18} color="#fff" />}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <QuickBar title="Cart" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: t.space.xl }}
      >
        {/* Header actions */}
        <View style={styles.headerRow}>
          <Text style={styles.hTitle}>Your Cart</Text>
          <Pressable onPress={clear} hitSlop={10}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        {/* Cart items */}
        <View style={{ gap: t.space.md, marginTop: t.space.md }}>
          {items.map((i) => (
            <Card key={i.key}>
              <View style={styles.itemRow}>
                <Image source={{ uri: i.image }} style={styles.itemImage} />

                <View style={styles.itemBody}>
                  <View style={styles.itemTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {i.name}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {i.sizeLabel} • KES {i.unitPriceKes} each
                      </Text>
                    </View>

                    <Pressable onPress={() => remove(i.key)} hitSlop={10}>
                      <Ionicons name="trash" size={18} color={t.colors.text} />
                    </Pressable>
                  </View>

                  {/* Qty controls */}
                  <View style={styles.qtyRow}>
                    <ScalePress onPress={() => dec(i.key)} disabled={i.quantity <= 1}>
                      <View style={styles.iconBtn}>
                        <Ionicons name="remove" size={16} color={t.colors.text} />
                      </View>
                    </ScalePress>

                    <View style={styles.qtyPill}>
                      <Text style={styles.qtyText}>{i.quantity}</Text>
                    </View>

                    <ScalePress onPress={() => inc(i.key)}>
                      <View style={styles.iconBtn}>
                        <Ionicons name="add" size={16} color={t.colors.text} />
                      </View>
                    </ScalePress>

                    <View style={{ flex: 1 }} />

                    <Text style={styles.lineTotal}>KES {i.unitPriceKes * i.quantity}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Totals */}
        <Card style={{ marginTop: t.space.lg, padding: t.space.md, gap: t.space.sm }}>
          <SummaryRow label="Subtotal" value={`KES ${totals.subtotalKes}`} />
          <SummaryRow label="Discount (10% test)" value={`- KES ${totals.discountKes}`} />
          <SummaryRow label="Delivery" value="Select at checkout" />

          <View style={styles.divider} />

          <SummaryRow
            label="Total (excl. delivery)"
            value={`KES ${totals.discountedSubtotalKes}`}
            strong
          />
        </Card>

        {/* Checkout CTA */}
        <View style={{ height: t.space.md }} />

        <GradientButton
          title="Continue to checkout"
          subtitle={`KES ${totals.discountedSubtotalKes} + delivery`}
          onPress={() => router.push("/(shop)/checkout")}
          right={
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="card" size={18} color="#fff" />
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
          }
        />
      </ScrollView>
    </View>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.colors.bg,
      paddingHorizontal: t.space.md,
    },

    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: t.space.sm,
    },
    hTitle: { color: t.colors.text, fontSize: 20, fontWeight: "900" },
    clearText: { color: t.colors.text, fontWeight: "900" },

    emptyWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: t.space.sm,
      paddingBottom: t.space.xl,
    },
    emptyTitle: { color: t.colors.text, fontSize: 18, fontWeight: "900" },
    emptySub: { color: t.colors.muted, textAlign: "center" },

    itemRow: { flexDirection: "row" },
    itemImage: { width: 110, height: 110, backgroundColor: t.colors.soft },
    itemBody: { flex: 1, padding: t.space.md, gap: t.space.sm },

    itemTop: { flexDirection: "row", alignItems: "flex-start", gap: t.space.sm },
    itemName: { color: t.colors.text, fontWeight: "900", fontSize: 16 },
    itemMeta: { color: t.colors.muted, marginTop: 2 },

    qtyRow: { flexDirection: "row", alignItems: "center", gap: t.space.sm },

    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.soft,
      borderWidth: 1,
      borderColor: t.colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    qtyPill: {
      minWidth: 54,
      height: 42,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.text, // dark pill
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.space.sm,
    },
    qtyText: { color: t.colors.bg, fontWeight: "900" },

    lineTotal: { color: t.colors.text, fontWeight: "900" },

    divider: {
      height: 1,
      backgroundColor: t.colors.border,
      marginVertical: t.space.sm,
    },
  });
}
