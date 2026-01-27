import { create } from "zustand";
import { DELIVERY_ZONES } from "../constants/deliveryZones";

export const useCheckoutStore = create((set) => ({
  // Defaults
  zoneId: DELIVERY_ZONES[0].id, // Zone A
  address: "",
  phone: "",
  paymentMethod: "mpesa", // "mpesa" | "card"

  setZoneId: (zoneId) => set({ zoneId }),
  setAddress: (address) => set({ address }),
  setPhone: (phone) => set({ phone }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  reset: () =>
    set({
      zoneId: DELIVERY_ZONES[0].id,
      address: "",
      phone: "",
      paymentMethod: "mpesa",
    }),
}));
