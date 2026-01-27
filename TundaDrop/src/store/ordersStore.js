import { create } from "zustand";

function makeId() {
  return `ord_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export const useOrdersStore = create((set, get) => ({
  orders: [], // newest first

  addOrder: (order) => {
    const id = makeId();
    const createdAt = new Date().toISOString();

    const newOrder = {
      id,
      createdAt,
      status: "pending",
      ...order,
    };

    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },

  getById: (id) => get().orders.find((o) => o.id === id),

  clearOrders: () => set({ orders: [] }),

  // Optional: update status later (admin/rider flow)
  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));
