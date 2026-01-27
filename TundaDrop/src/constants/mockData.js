export const CATEGORIES = [
  { id: "pulpy_thick", title: "Pulpy / Thick", emoji: "🥭" },
  { id: "clear_light", title: "Clear / Light", emoji: "🍉" },
  { id: "citrus_zesty", title: "Citrus & Zesty", emoji: "🍊" },
  { id: "detox_health", title: "Detox / Health", emoji: "🥬" },
  { id: "cocktails_specials", title: "Cocktails / Specials", emoji: "🍹" },
];

export const PRODUCTS = [
  // Pulpy / Thick
  {
    id: "mango_pulp_classic",
    name: "Mango Pulp Classic",
    category: "pulpy_thick",
    description: "Thick mango juice, rich and naturally sweet.",
    characteristics: ["pulpy", "thick", "tropical"],
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 250 },
      { sizeLabel: "500ml", litres: 0.5, price: 350 },
      { sizeLabel: "1L", litres: 1.0, price: 650 },
    ],
  },
  {
    id: "avocado_banana_cream",
    name: "Avocado Banana Cream",
    category: "pulpy_thick",
    description: "Creamy blend, filling and smooth.",
    characteristics: ["pulpy", "creamy", "thick"],
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 270 },
      { sizeLabel: "500ml", litres: 0.5, price: 380 },
      { sizeLabel: "1L", litres: 1.0, price: 700 },
    ],
  },
  {
    id: "strawberry_banana_smooth",
    name: "Strawberry Banana Smooth",
    category: "pulpy_thick",
    description: "Smooth fruity blend with a thick texture.",
    characteristics: ["berry", "pulpy", "thick"],
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 260 },
      { sizeLabel: "500ml", litres: 0.5, price: 370 },
      { sizeLabel: "1L", litres: 1.0, price: 680 },
    ],
  },

  // Clear / Light
  {
    id: "apple_refresh",
    name: "Apple Refresh",
    category: "clear_light",
    description: "Light, crisp apple juice.",
    characteristics: ["clear", "light", "refreshing"],
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 200 },
      { sizeLabel: "500ml", litres: 0.5, price: 300 },
      { sizeLabel: "1L", litres: 1.0, price: 550 },
    ],
  },
  {
    id: "watermelon_chill",
    name: "Watermelon Chill",
    category: "clear_light",
    description: "Hydrating watermelon juice, very light.",
    characteristics: ["light", "hydrating", "clear"],
    image: "https://images.unsplash.com/photo-1568909344668-6f14aef31e07?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 190 },
      { sizeLabel: "500ml", litres: 0.5, price: 290 },
      { sizeLabel: "1L", litres: 1.0, price: 530 },
    ],
  },
  {
    id: "pineapple_pure",
    name: "Pineapple Pure",
    category: "clear_light",
    description: "Bright pineapple juice with a clean finish.",
    characteristics: ["light", "tropical", "clear"],
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 210 },
      { sizeLabel: "500ml", litres: 0.5, price: 310 },
      { sizeLabel: "1L", litres: 1.0, price: 560 },
    ],
  },

  // Citrus & Zesty
  {
    id: "orange_classic",
    name: "Orange Classic",
    category: "citrus_zesty",
    description: "Fresh orange juice with natural sweetness.",
    characteristics: ["citrus", "zesty", "refreshing"],
    image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 180 },
      { sizeLabel: "500ml", litres: 0.5, price: 270 },
      { sizeLabel: "1L", litres: 1.0, price: 500 },
    ],
  },
  {
    id: "lemon_ginger_kick",
    name: "Lemon Ginger Kick",
    category: "citrus_zesty",
    description: "Tangy lemon with ginger warmth.",
    characteristics: ["citrus", "ginger", "zesty"],
    image: "https://images.unsplash.com/photo-1542444459-db47a0b0a9a3?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 190 },
      { sizeLabel: "500ml", litres: 0.5, price: 280 },
      { sizeLabel: "1L", litres: 1.0, price: 520 },
    ],
  },
  {
    id: "passion_citrus_splash",
    name: "Passion Citrus Splash",
    category: "citrus_zesty",
    description: "Passion fruit with a bright citrus edge.",
    characteristics: ["citrus", "tropical", "tangy"],
    image: "https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 200 },
      { sizeLabel: "500ml", litres: 0.5, price: 290 },
      { sizeLabel: "1L", litres: 1.0, price: 540 },
    ],
  },

  // Detox / Health
  {
    id: "carrot_orange_boost",
    name: "Carrot Orange Boost",
    category: "detox_health",
    description: "Carrot + orange blend, smooth and energizing.",
    characteristics: ["detox", "vitamin", "smooth"],
    image: "https://images.unsplash.com/photo-1542444459-db47a0b0a9a3?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 220 },
      { sizeLabel: "500ml", litres: 0.5, price: 330 },
      { sizeLabel: "1L", litres: 1.0, price: 600 },
    ],
  },
  {
    id: "beetroot_apple_cleanse",
    name: "Beetroot Apple Cleanse",
    category: "detox_health",
    description: "Beetroot balanced with apple for a clean taste.",
    characteristics: ["detox", "earthy", "clean"],
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 230 },
      { sizeLabel: "500ml", litres: 0.5, price: 340 },
      { sizeLabel: "1L", litres: 1.0, price: 620 },
    ],
  },
  {
    id: "green_detox_mix",
    name: "Green Detox Mix",
    category: "detox_health",
    description: "Cucumber + celery + apple (light and fresh).",
    characteristics: ["detox", "green", "light"],
    image: "https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 240 },
      { sizeLabel: "500ml", litres: 0.5, price: 350 },
      { sizeLabel: "1L", litres: 1.0, price: 640 },
    ],
  },

  // Cocktails / Specials
  {
    id: "tropical_cocktail",
    name: "Tropical Cocktail",
    category: "cocktails_specials",
    description: "Mango + pineapple + passion blend.",
    characteristics: ["cocktail", "tropical", "sweet"],
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 260 },
      { sizeLabel: "500ml", litres: 0.5, price: 380 },
      { sizeLabel: "1L", litres: 1.0, price: 680 },
    ],
  },
  {
    id: "berry_blast_cocktail",
    name: "Berry Blast Cocktail",
    category: "cocktails_specials",
    description: "Mixed berry blend, rich and smooth.",
    characteristics: ["cocktail", "berry", "rich"],
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 270 },
      { sizeLabel: "500ml", litres: 0.5, price: 390 },
      { sizeLabel: "1L", litres: 1.0, price: 700 },
    ],
  },
  {
    id: "sunrise_mix",
    name: "Sunrise Mix",
    category: "cocktails_specials",
    description: "Orange + carrot + mango layered taste.",
    characteristics: ["cocktail", "citrus", "pulpy"],
    image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=1200&q=60",
    variants: [
      { sizeLabel: "300ml", litres: 0.3, price: 250 },
      { sizeLabel: "500ml", litres: 0.5, price: 370 },
      { sizeLabel: "1L", litres: 1.0, price: 670 },
    ],
  },
];
