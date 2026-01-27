import { create } from "zustand";

function makeKey(productId, sizeLabel) {
  return `${productId}__${sizeLabel}`;
}

export const useCartStore = create((set, get) => ({
  items: [], // { key, productId, name, image, sizeLabel, unitPriceKes, quantity }

  addItem: ({ productId, name, image, sizeLabel, unitPriceKes, quantity }) => {
    const key = makeKey(productId, sizeLabel);
    const qtyToAdd = Math.max(1, Number(quantity || 1));

    set((state) => {
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + qtyToAdd } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { key, productId, name, image, sizeLabel, unitPriceKes, quantity: qtyToAdd },
        ],
      };
    });
  },

  setQty: (key, quantity) => {
    const q = Math.max(1, Number(quantity || 1));
    set((state) => ({
      items: state.items.map((i) => (i.key === key ? { ...i, quantity: q } : i)),
    }));
  },

  inc: (key) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.key === key ? { ...i, quantity: i.quantity + 1 } : i
      ),
    }));
  },

  dec: (key) => {
    set((state) => ({
      items: state.items
        .map((i) =>
          i.key === key ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
        ),
    }));
  },

  remove: (key) => {
    set((state) => ({ items: state.items.filter((i) => i.key !== key) }));
  },

  clear: () => set({ items: [] }),

  // Derived helpers
  getLinesForTotals: () => {
    return get().items.map((i) => ({
      unitPriceKes: i.unitPriceKes,
      quantity: i.quantity,
    }));
  },
}));
