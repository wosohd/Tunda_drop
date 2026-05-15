import React, { useMemo } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCartStore } from "../../src/store/cartStore";
import { calcTotalsKes } from "../../src/lib/money";
import { useThemeTokens } from "../../src/theme/useTheme";

import ScreenShell from "../../src/components/ui/ScreenShell";
import GlassCard from "../../src/components/ui/GlassCard";
import TChip from "../../src/components/ui/TChip";
import ScalePress from "../../src/components/ui/ScalePress";
import SummaryRow from "../../src/components/ui/SummaryRow";
import GradientButton from "../../src/components/ui/GradientButton";

function getCustomMixText(item) {
  const flavors = item?.customization?.selectedFlavors ?? [];

  return flavors
    .map((flavor) => flavor?.name)
    .filter(Boolean)
    .join(" + ");
}

function getCustomMixNote(item) {
  return item?.customization?.note?.trim?.() || "";
}

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

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const softBorder = isDarkMode ? "#334155" : "#E7EBFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#111827";
  const mutedTextColor = isDarkMode ? "#CBD5E1" : "#64748B";

  const totals = useMemo(() => {
    return calcTotalsKes({
      lines: getLinesForTotals(),
      discountPercent: 10,
      deliveryFeeKes: 0,
    });
  }, [items, getLinesForTotals]);

  if (items.length === 0) {
    return (
      <ScreenShell scroll={false}>
        <View style={styles.emptyWrap}>
          <GlassCard
            style={{
              width: "100%",
              alignItems: "center",
              paddingVertical: 28,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 28,
                backgroundColor: isDarkMode ? "#111827" : "#F4F6FF",
                borderWidth: 1,
                borderColor: softBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="cart-outline" size={38} color={textColor} />
            </View>

            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Add a fresh juice, cocktail, or custom mix and come back here.
            </Text>

            <GradientButton
              title="Browse juices"
              onPress={() => router.push("/(shop)/categories")}
              style={{ marginTop: 14, alignSelf: "stretch" }}
              right={<Ionicons name="chevron-forward" size={18} color="#fff" />}
            />
          </GlassCard>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell contentContainerStyle={{ paddingHorizontal: 0 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.hTitle}>Your Cart</Text>
          <Text style={styles.hSub}>
            Review your fresh picks before checkout.
          </Text>
        </View>

        <Pressable onPress={clear} hitSlop={10}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: isDarkMode ? "#111827" : "#F4F6FF",
              borderWidth: 1,
              borderColor: softBorder,
            }}
          >
            <Text style={styles.clearText}>Clear</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ gap: 12, marginTop: 14 }}>
        {items.map((i) => {
          const customMixText = getCustomMixText(i);
          const customMixNote = getCustomMixNote(i);
          const hasCustomMix = Boolean(customMixText);

          return (
            <GlassCard
              key={i.key}
              padding={0}
              radius={24}
              style={{ overflow: "hidden" }}
            >
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
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 14,
                          backgroundColor: isDarkMode ? "#111827" : "#F8FAFC",
                          borderWidth: 1,
                          borderColor: softBorder,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="trash" size={17} color={textColor} />
                      </View>
                    </Pressable>
                  </View>

                  <View style={styles.chipRow}>
                    <TChip label={i.sizeLabel} icon="cube-outline" />

                    {hasCustomMix ? (
                      <TChip label="Custom mix" icon="flask" variant="success" />
                    ) : null}
                  </View>

                  {hasCustomMix ? (
                    <View
                      style={{
                        padding: 10,
                        borderRadius: 16,
                        backgroundColor: isDarkMode
                          ? "rgba(20,83,45,0.26)"
                          : "#F0FDF4",
                        borderWidth: 1,
                        borderColor: isDarkMode ? "#166534" : "#BBF7D0",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <Ionicons
                          name="flask"
                          size={16}
                          color={isDarkMode ? "#BBF7D0" : "#166534"}
                        />

                        <Text
                          style={{
                            color: isDarkMode ? "#BBF7D0" : "#166534",
                            fontWeight: "900",
                          }}
                        >
                          Mix: {customMixText}
                        </Text>
                      </View>

                      {customMixNote ? (
                        <Text
                          style={{
                            color: isDarkMode ? "#D1FAE5" : "#166534",
                            marginTop: 6,
                            lineHeight: 19,
                            fontWeight: "700",
                          }}
                        >
                          Note: {customMixNote}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={styles.qtyRow}>
                    <ScalePress onPress={() => dec(i.key)} disabled={i.quantity <= 1}>
                      <View style={styles.iconBtn}>
                        <Ionicons name="remove" size={16} color={textColor} />
                      </View>
                    </ScalePress>

                    <View style={styles.qtyPill}>
                      <Text style={styles.qtyText}>{i.quantity}</Text>
                    </View>

                    <ScalePress onPress={() => inc(i.key)}>
                      <View style={styles.iconBtn}>
                        <Ionicons name="add" size={16} color={textColor} />
                      </View>
                    </ScalePress>

                    <View style={{ flex: 1 }} />

                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: softBorder,
                      }}
                    >
                      <Text style={styles.lineTotal}>
                        KES {i.unitPriceKes * i.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </GlassCard>
          );
        })}
      </View>

      <GlassCard style={{ marginTop: 16, gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <Ionicons name="receipt" size={18} color={textColor} />

          <Text style={{ color: textColor, fontWeight: "950", fontSize: 16 }}>
            Order summary
          </Text>
        </View>

        <SummaryRow label="Subtotal" value={`KES ${totals.subtotalKes}`} />
        <SummaryRow
          label="Discount (10% test)"
          value={`- KES ${totals.discountKes}`}
        />
        <SummaryRow label="Delivery" value="Select at checkout" />

        <View style={styles.divider} />

        <SummaryRow
          label="Total (excl. delivery)"
          value={`KES ${totals.discountedSubtotalKes}`}
          strong
        />
      </GlassCard>

      <View style={{ height: 12 }} />

      <GradientButton
        title="Continue to checkout"
        subtitle={`KES ${totals.discountedSubtotalKes} + delivery`}
        onPress={() => router.push("/checkout")}
        right={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="card" size={18} color="#fff" />
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        }
      />

      <View style={{ height: 10 }} />

      <ScalePress onPress={() => router.push("/(shop)/categories")}>
        <GlassCard
          style={{
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: softBorder,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: textColor, fontWeight: "950", fontSize: 16 }}>
              Continue browsing drinks
            </Text>

            <Text
              style={{
                color: mutedTextColor,
                marginTop: 3,
                fontWeight: "700",
              }}
            >
              Add more juices before checkout.
            </Text>
          </View>

          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: isDarkMode ? "#FFFFFF" : "#111827",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="grid-outline"
              size={18}
              color={isDarkMode ? "#111827" : "#FFFFFF"}
            />
          </View>
        </GlassCard>
      </ScalePress>

      <View style={{ height: 28 }} />
    </ScreenShell>
  );
}

function makeStyles(t) {
  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const softBorder = isDarkMode ? "#334155" : "#E7EBFF";
  const softCardBg = isDarkMode ? "#111827" : "#FFFFFF";

  return StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
      gap: 12,
    },
    hTitle: {
      color: t.text,
      fontSize: 23,
      fontWeight: "950",
    },
    hSub: {
      color: t.mutedText,
      marginTop: 4,
      lineHeight: 19,
    },
    clearText: {
      color: t.text,
      fontWeight: "900",
    },

    emptyWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 24,
    },
    emptyTitle: {
      color: t.text,
      fontSize: 20,
      fontWeight: "950",
      marginTop: 14,
    },
    emptySub: {
      color: t.mutedText,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
      maxWidth: 280,
    },

    itemRow: {
      flexDirection: "row",
    },
    itemImage: {
      width: 112,
      minHeight: 152,
      backgroundColor: t.chipBg,
    },
    itemBody: {
      flex: 1,
      padding: 14,
      gap: 10,
    },

    itemTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    itemName: {
      color: t.text,
      fontWeight: "950",
      fontSize: 16,
    },
    itemMeta: {
      color: t.mutedText,
      marginTop: 3,
      fontWeight: "700",
    },

    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 18,
      backgroundColor: softCardBg,
      borderWidth: 1,
      borderColor: softBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    qtyPill: {
      minWidth: 54,
      height: 42,
      borderRadius: 18,
      backgroundColor: isDarkMode ? "#FFFFFF" : "#111827",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    qtyText: {
      color: isDarkMode ? "#111827" : "#FFFFFF",
      fontWeight: "950",
    },

    lineTotal: {
      color: t.text,
      fontWeight: "950",
    },

    divider: {
      height: 1,
      backgroundColor: t.border,
      marginVertical: 8,
    },
  });
}
