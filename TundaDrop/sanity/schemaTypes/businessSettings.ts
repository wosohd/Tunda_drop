import { defineField, defineType } from "sanity";

export const businessSettings = defineType({
  name: "businessSettings",
  title: "Business Settings",
  type: "document",
  fields: [
    defineField({
      name: "appName",
      title: "App Name",
      type: "string",
      initialValue: "TundaDrop",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      initialValue: "Fresh juices delivered fast.",
    }),
    defineField({
      name: "supportPhone",
      title: "Support Phone",
      type: "string",
      description: "Customer support phone number shown in the app.",
    }),
    defineField({
      name: "supportEmail",
      title: "Support Email",
      type: "string",
      description: "Customer support email shown in the app.",
    }),
    defineField({
      name: "openingHours",
      title: "Opening Hours",
      type: "string",
      description: "Example: Mon-Sat, 8:00 AM - 8:00 PM.",
      initialValue: "Mon-Sat, 8:00 AM - 8:00 PM",
    }),
    defineField({
      name: "deliveryNote",
      title: "Delivery Note",
      type: "text",
      rows: 3,
      description: "Short delivery message shown around checkout or home.",
      initialValue: "Delivery fees depend on your selected zone.",
    }),
    defineField({
      name: "promoText",
      title: "Promo Text",
      type: "string",
      description: "Short promo message shown in the app.",
      initialValue: "Fresh juice, made to order.",
    }),
    defineField({
      name: "orderingNotice",
      title: "Ordering Notice",
      type: "text",
      rows: 3,
      description:
        "Optional message for customers, e.g. delays, holidays, or special opening notices.",
    }),
    defineField({
      name: "defaultCurrency",
      title: "Default Currency",
      type: "string",
      initialValue: "KES",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isOrderingEnabled",
      title: "Ordering Enabled",
      type: "boolean",
      description:
        "Turn this off if the business is temporarily not accepting orders.",
      initialValue: true,
    }),
    defineField({
      name: "isDeliveryEnabled",
      title: "Delivery Enabled",
      type: "boolean",
      description:
        "Turn this off if delivery is temporarily unavailable.",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "appName",
      subtitle: "tagline",
    },
  },
});