import React, { useMemo } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCartStore } from "../../src/store/cartStore";
import { calcTotalsKes } from "../../src/lib/money";
import { useThemeTokens } from "../../src/theme/useTheme";

import Card from "../../src/components/ui/card";
import ScalePress from "../../src/components/ui/ScalePress";
import SummaryRow from "../../src/components/ui/SummaryRow";
import GradientButton from "../../src/components/ui/GradientButton";

export default function Cart() {
  const router = useRouter();
  const t = useThemeTokens();

  const items = useCartStore((s) => s.items);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const getLinesForTotals = useCartStore((s) => s.getLinesForTotals);

  const styles = useMemo(() => makeStyles(t), [t]);

  const totals = useMemo(() => {
    return calcTotalsKes({
      lines: getLinesForTotals(),
      discountPercent: 10,
      deliveryFeeKes: 0,
    });
  }, [items, getLinesForTotals]);

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={44} color={t.text} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add a juice and come back here.</Text>

          <GradientButton
            title="Browse juices"
            onPress={() => router.push("/(shop)/categories")}
            style={{ marginTop: 12, alignSelf: "stretch" }}
            right={<Ionicons name="chevron-forward" size={18} color="#fff" />}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <Text style={styles.hTitle}>Your Cart</Text>
          <Pressable onPress={clear} hitSlop={10}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
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
                      <Ionicons name="trash" size={18} color={t.text} />
                    </Pressable>
                  </View>

                  <View style={styles.qtyRow}>
                    <ScalePress onPress={() => dec(i.key)} disabled={i.quantity <= 1}>
                      <View style={styles.iconBtn}>
                        <Ionicons name="remove" size={16} color={t.text} />
                      </View>
                    </ScalePress>

                    <View style={styles.qtyPill}>
                      <Text style={styles.qtyText}>{i.quantity}</Text>
                    </View>

                    <ScalePress onPress={() => inc(i.key)}>
                      <View style={styles.iconBtn}>
                        <Ionicons name="add" size={16} color={t.text} />
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

        <Card style={{ marginTop: 16, padding: 14, gap: 8 }}>
          <SummaryRow label="Subtotal" value={`KES ${totals.subtotalKes}`} />
          <SummaryRow label="Discount (10% test)" value={`- KES ${totals.discountKes}`} />
          <SummaryRow label="Delivery" value="Select at checkout" />
          <View style={styles.divider} />
          <SummaryRow label="Total (excl. delivery)" value={`KES ${totals.discountedSubtotalKes}`} strong />
        </Card>

        <View style={{ height: 12 }} />

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
      backgroundColor: t.bg,
      paddingHorizontal: 16,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    hTitle: { color: t.text, fontSize: 20, fontWeight: "900" },
    clearText: { color: t.text, fontWeight: "900" },

    emptyWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      paddingBottom: 24,
    },
    emptyTitle: { color: t.text, fontSize: 18, fontWeight: "900" },
    emptySub: { color: t.mutedText, textAlign: "center" },

    itemRow: { flexDirection: "row" },
    itemImage: { width: 110, height: 110, backgroundColor: t.chipBg },
    itemBody: { flex: 1, padding: 14, gap: 10 },

    itemTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    itemName: { color: t.text, fontWeight: "900", fontSize: 16 },
    itemMeta: { color: t.mutedText, marginTop: 2 },

    qtyRow: { flexDirection: "row", alignItems: "center", gap: 10 },

    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 18,
      backgroundColor: t.chipBg,
      borderWidth: 1,
      borderColor: t.chipBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    qtyPill: {
      minWidth: 54,
      height: 42,
      borderRadius: 18,
      backgroundColor: t.text,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    qtyText: { color: t.bg, fontWeight: "900" },

    lineTotal: { color: t.text, fontWeight: "900" },

    divider: {
      height: 1,
      backgroundColor: t.border,
      marginVertical: 8,
    },
  });
}
