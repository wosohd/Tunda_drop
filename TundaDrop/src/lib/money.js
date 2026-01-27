export function roundKes(value) {
  return Math.round(value);
}

export function calcSubtotalKes(lines) {
  return roundKes(
    lines.reduce((sum, l) => sum + l.unitPriceKes * l.quantity, 0)
  );
}

export function calcDiscountKes(subtotalKes, discountPercent) {
  if (discountPercent <= 0) return 0;
  return roundKes(subtotalKes * (discountPercent / 100));
}

export function calcTotalsKes({ lines, discountPercent, deliveryFeeKes }) {
  const subtotalKes = calcSubtotalKes(lines);
  const discountKes = calcDiscountKes(subtotalKes, discountPercent);

  const discountedSubtotalKes = Math.max(0, subtotalKes - discountKes);
  const totalKes = discountedSubtotalKes + roundKes(deliveryFeeKes);

  return {
    subtotalKes,
    discountKes,
    discountedSubtotalKes,
    deliveryFeeKes: roundKes(deliveryFeeKes),
    totalKes,
  };
}
