import { sanityClient } from "./sanity";

const PRODUCT_FIELDS = `
  _id,
  "id": slug.current,
  name,
  "slug": slug.current,
  description,
  characteristics,
  isCustomizable,
  customizationNote,
  isFeatured,
  isActive,
  sortOrder,
  "category": category->categoryId,
  "categoryTitle": category->title,
  "image": mainImage.asset->url,
  variants[]{
    _key,
    sizeLabel,
    litres,
    "price": priceKes,
    isAvailable
  }
`;

export async function getBusinessSettings() {
  return sanityClient.fetch(`
    *[_type == "businessSettings"][0]{
      appName,
      tagline,
      supportPhone,
      supportEmail,
      openingHours,
      deliveryNote,
      promoText,
      orderingNotice,
      defaultCurrency,
      isOrderingEnabled,
      isDeliveryEnabled
    }
  `);
}

export async function getCategories() {
  return sanityClient.fetch(`
    *[_type == "category" && isActive == true] | order(sortOrder asc){
      _id,
      title,
      "id": categoryId,
      "slug": slug.current,
      emoji,
      description,
      sortOrder,
      isActive
    }
  `);
}

export async function getProducts() {
  return sanityClient.fetch(`
    *[_type == "product" && isActive == true] | order(sortOrder asc){
      ${PRODUCT_FIELDS}
    }
  `);
}

export async function getFeaturedProducts() {
  return sanityClient.fetch(`
    *[
      _type == "product" &&
      isActive == true &&
      isFeatured == true
    ] | order(sortOrder asc){
      ${PRODUCT_FIELDS}
    }
  `);
}

export async function getProductsByCategory(categoryId) {
  return sanityClient.fetch(
    `
      *[
        _type == "product" &&
        isActive == true &&
        category->categoryId == $categoryId
      ] | order(sortOrder asc){
        ${PRODUCT_FIELDS}
      }
    `,
    { categoryId }
  );
}

export async function getProductBySlug(slug) {
  return sanityClient.fetch(
    `
      *[_type == "product" && slug.current == $slug][0]{
        ${PRODUCT_FIELDS}
      }
    `,
    { slug }
  );
}

export async function getMixableProducts() {
  return sanityClient.fetch(`
    *[
      _type == "product" &&
      isActive == true &&
      isCustomizable != true
    ] | order(sortOrder asc){
      _id,
      "id": slug.current,
      name,
      "slug": slug.current,
      "category": category->categoryId,
      "categoryTitle": category->title
    }
  `);
}