const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    id: "girls",
    name: "Girls Fashion",
    iconName: "woman",
    iconFamily: "Ionicons",
    bgColor: "#FFF0F5",
    badge: "50% OFF",
  },
  {
    id: "boys",
    name: "Boys Fashion",
    iconName: "man",
    iconFamily: "Ionicons",
    bgColor: "#F0F8FF",
    badge: "Trending",
  },
  {
    id: "infants",
    name: "Baby & Infants",
    iconName: "happy",
    iconFamily: "Ionicons",
    bgColor: "#FFF8DC",
    badge: "Pure Cotton",
  },
  {
    id: "footwear",
    name: "Kids Footwear",
    iconName: "footsteps",
    iconFamily: "Ionicons",
    bgColor: "#F0FFF0",
    badge: "Light Up",
  },
  {
    id: "toys",
    name: "Learning Toys",
    iconName: "game-controller",
    iconFamily: "Ionicons",
    bgColor: "#FDF5E6",
    badge: "New",
  },
  {
    id: "care",
    name: "Baby Skin Care",
    iconName: "shield-checkmark",
    iconFamily: "Ionicons",
    bgColor: "#F5F5DC",
    badge: "Organic",
  },
];

const BANNERS = [
  {
    id: "b1",
    title: "🌟 TinyTots Mega Kids Carnival",
    subtitle: "Flat 50% OFF on Festive Frocks & Sherwanis",
    tag: "Carnival Special",
    code: "KIDS50",
    bannerImageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&auto=format&fit=crop&q=80",
    bgColor: "#FF6B8B",
    iconName: "sparkles",
  },
  {
    id: "b2",
    title: "🚀 Express 1-Day Dispatch",
    subtitle: "Pure Organic Cotton Sets for Newborns",
    tag: "Free Shipping",
    code: "TINYVIP",
    bannerImageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80",
    bgColor: "#6C5CE7",
    iconName: "rocket",
  },
  {
    id: "b3",
    title: "👟 Light-Up LED Sneakers",
    subtitle: "Ultra Comfort Cushioned Soles for Toddlers",
    tag: "New Arrival",
    code: "GLOW20",
    bannerImageUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80",
    bgColor: "#00CEC9",
    iconName: "flash",
  },
];

const PRODUCTS = [
  {
    id: "p1",
    name: "Pink Floral Princess Party Dress",
    category: "girls",
    price: 799,
    originalPrice: 1599,
    rating: 4.8,
    reviewsCount: 1420,
    imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "50% OFF",
    ageGroup: "2-5 Yrs",
    isDealOfDay: true,
    freeDelivery: true,
    specifications: "100% Breathable Cotton Lining, Layered Satin Tulle, Gentle on Sensitive Skin",
  },
  {
    id: "p2",
    name: "Gentleman 3-Piece Tuxedo Suit & Bow",
    category: "boys",
    price: 999,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 980,
    imageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "50% OFF",
    ageGroup: "3-7 Yrs",
    isDealOfDay: true,
    freeDelivery: true,
    specifications: "Blazer + Trousers + Crisp Inner Shirt + Bowtie included",
  },
  {
    id: "p3",
    name: "Organic Bamboo Newborn Romper Set (Pack of 3)",
    category: "infants",
    price: 499,
    originalPrice: 999,
    rating: 4.9,
    reviewsCount: 2300,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "50% OFF",
    ageGroup: "0-12 M",
    isDealOfDay: false,
    freeDelivery: true,
    specifications: "Hypoallergenic Organic Cotton, Easy Diaper Snap Buttons",
  },
  {
    id: "p4",
    name: "ColorPop LED Light-Up Toddler Sneakers",
    category: "footwear",
    price: 649,
    originalPrice: 1299,
    rating: 4.7,
    reviewsCount: 840,
    imageUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "50% OFF",
    ageGroup: "1-4 Yrs",
    isDealOfDay: true,
    freeDelivery: true,
    specifications: "Non-slip rubber sole, Rechargeable battery, Breathable mesh fabric",
  },
  {
    id: "p5",
    name: "Montessori Wooden Educational Animal Puzzle",
    category: "toys",
    price: 349,
    originalPrice: 699,
    rating: 4.8,
    reviewsCount: 1650,
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "50% OFF",
    ageGroup: "1-5 Yrs",
    isDealOfDay: false,
    freeDelivery: true,
    specifications: "Eco-friendly non-toxic natural wood paint, Smooth rounded edges",
  },
  {
    id: "p6",
    name: "Natural Calendula Tear-Free Baby Wash & Lotion Set",
    category: "care",
    price: 429,
    originalPrice: 650,
    rating: 4.9,
    reviewsCount: 3120,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "34% OFF",
    ageGroup: "All Ages",
    isDealOfDay: false,
    freeDelivery: true,
    specifications: "Dermatologically tested, No parabens, No artificial fragrances",
  },
  {
    id: "p7",
    name: "Summer Sunflower Flutter Sleeve Dress",
    category: "girls",
    price: 549,
    originalPrice: 1099,
    rating: 4.6,
    reviewsCount: 720,
    imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "50% OFF",
    ageGroup: "2-6 Yrs",
    isDealOfDay: false,
    freeDelivery: true,
    specifications: "Super light summer cotton, Matching fabric headband included",
  },
  {
    id: "p8",
    name: "Dino Adventure Cotton Graphic Tee & Denim Shorts",
    category: "boys",
    price: 599,
    originalPrice: 1199,
    rating: 4.7,
    reviewsCount: 890,
    imageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80",
    isAssured: true,
    discount: "50% OFF",
    ageGroup: "2-8 Yrs",
    isDealOfDay: false,
    freeDelivery: true,
    specifications: "100% Combed Cotton, Soft stretch elastic waistband",
  },
];

async function main() {
  console.log("🌱 Starting SQLite database seeding with Prisma...");

  // 1. Seed Categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        iconName: cat.iconName,
        iconFamily: cat.iconFamily,
        bgColor: cat.bgColor,
        badge: cat.badge || null,
      },
      create: {
        id: cat.id,
        name: cat.name,
        iconName: cat.iconName,
        iconFamily: cat.iconFamily,
        bgColor: cat.bgColor,
        badge: cat.badge || null,
      },
    });
  }
  console.log(`✅ Seeded ${CATEGORIES.length} Categories`);

  // 2. Seed Banners
  for (const b of BANNERS) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: {
        title: b.title,
        subtitle: b.subtitle || null,
        tag: b.tag || null,
        code: b.code || null,
        bannerImageUrl: b.bannerImageUrl,
        bgColor: b.bgColor || "#FF6B8B",
        iconName: b.iconName || "sparkles",
      },
      create: {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || null,
        tag: b.tag || null,
        code: b.code || null,
        bannerImageUrl: b.bannerImageUrl,
        bgColor: b.bgColor || "#FF6B8B",
        iconName: b.iconName || "sparkles",
      },
    });
  }
  console.log(`✅ Seeded ${BANNERS.length} Banners`);

  // 3. Seed Products
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating || 4.5,
        reviewsCount: p.reviewsCount || 0,
        imageUrl: p.imageUrl,
        isAssured: p.isAssured !== false,
        discount: p.discount || "20% OFF",
        ageGroup: p.ageGroup || "2-5 Yrs",
        isDealOfDay: !!p.isDealOfDay,
        freeDelivery: p.freeDelivery !== false,
        specifications: p.specifications || "",
      },
      create: {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating || 4.5,
        reviewsCount: p.reviewsCount || 0,
        imageUrl: p.imageUrl,
        isAssured: p.isAssured !== false,
        discount: p.discount || "20% OFF",
        ageGroup: p.ageGroup || "2-5 Yrs",
        isDealOfDay: !!p.isDealOfDay,
        freeDelivery: p.freeDelivery !== false,
        specifications: p.specifications || "",
      },
    });
  }
  console.log(`✅ Seeded ${PRODUCTS.length} Products`);

  // 4. Seed Default User
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);
  const user = await prisma.user.upsert({
    where: { email: "madhu@example.com" },
    update: {},
    create: {
      name: "Madhumathi",
      email: "madhu@example.com",
      passwordHash: defaultPasswordHash,
      pincode: "641001",
      phone: "+91 98765 43210",
      role: "admin",
      sparksBalance: 680,
    },
  });
  console.log(`✅ Seeded User: ${user.name} (${user.email})`);

  // 5. Seed Notifications
  const count = await prisma.notification.count();
  if (count === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          title: "🎉 TinyTots Kids Festival is LIVE!",
          message: "Up to 50% OFF on Party Wear, Frocks & Smart Suits.",
          type: "promo",
          isRead: false,
          time: "2h ago",
        },
        {
          userId: user.id,
          title: "📦 Order Shipped!",
          message: "Your order #TT-84920 has been dispatched via 1-Day Express.",
          type: "order",
          isRead: false,
          time: "5h ago",
        },
        {
          userId: user.id,
          title: "⭐ 680 Sparks Credited",
          message: "Sparks points credited to your TinyTots VIP Kids Club Account.",
          type: "rewards",
          isRead: true,
          time: "1d ago",
        },
      ],
    });
    console.log("✅ Seeded Notifications");
  }

  console.log("🎉 SQLite Database seeded successfully with Prisma!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
