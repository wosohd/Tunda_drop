import { defineArrayMember, defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "characteristics",
      title: "Characteristics",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
        }),
      ],
      description: "Examples: pulpy, light, citrus, detox, tropical.",
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description:
        "Preferred product image. If empty, the app will use External Image URL.",
    }),
    defineField({
      name: "externalImageUrl",
      title: "External Image URL",
      type: "url",
      description:
        "Optional image URL, e.g. Unsplash. Used if no Sanity Main Image is uploaded.",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: "variants",
      title: "Variants",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: "productVariant",
          title: "Product Variant",
          type: "object",
          fields: [
            defineField({
              name: "sizeLabel",
              title: "Size Label",
              type: "string",
              description: "Examples: 300ml, 500ml, 1L.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "litres",
              title: "Litres",
              type: "number",
              description: "Examples: 0.3, 0.5, 1.",
              validation: (Rule) => Rule.required().positive(),
            }),
            defineField({
              name: "priceKes",
              title: "Price in KES",
              type: "number",
              validation: (Rule) => Rule.required().positive(),
            }),
            defineField({
              name: "isAvailable",
              title: "Available",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "sizeLabel",
              price: "priceKes",
            },
            prepare({ title, price }) {
              return {
                title,
                subtitle: price ? `KES ${price}` : "No price set",
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "isCustomizable",
      title: "Customizable",
      type: "boolean",
      description:
        "Use this for Custom Mix / Cocktail where customers can request mixed flavors.",
      initialValue: false,
    }),
    defineField({
      name: "customizationNote",
      title: "Customization Note",
      type: "text",
      rows: 3,
      description:
        "Example: Choose two or more available flavors for your custom cocktail.",
      hidden: ({ document }) => !document?.isCustomizable,
    }),
    defineField({
      name: "isFeatured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "mainImage",
      category: "category.title",
    },
    prepare({ title, media, category }) {
      return {
        title,
        media,
        subtitle: category || "No category",
      };
    },
  },
});