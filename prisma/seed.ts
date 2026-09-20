import { PrismaClient } from "@prisma/client";
import { DEMO_VENDORS } from "../lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({ where: { phone: "+8801711000000" }, create: { phone: "+8801711000000", email: "admin@findthemama.bd", name: "Mama Admin", isAdmin: true, isVerified: true, contributionPoints: 250, badges: ["founder", "super-taster"] }, update: { name: "Mama Admin", isAdmin: true, isVerified: true } });
  const reviewer = await prisma.user.upsert({ where: { phone: "+8801812000000" }, create: { phone: "+8801812000000", email: "foodie@example.com", name: "Dhaka Foodie", isVerified: true, contributionPoints: 85, badges: ["reviewer"] }, update: { name: "Dhaka Foodie", isVerified: true } });

  for (const item of DEMO_VENDORS) {
    const existing = await prisma.vendor.findFirst({ where: { name: item.name, area: item.area } });
    const vendorData = {
      name: item.name, description: item.description, area: item.area, zone: item.zone,
      lat: item.lat, lng: item.lng, address: item.address, operatingHours: item.operatingHours,
      specialties: item.specialties, phone: item.phone, priceRange: item.priceRange,
      ratingAvg: item.ratingAvg, ratingCount: item.ratingCount, hygieneScore: item.hygieneScore,
      isVerified: item.isVerified, verificationLevel: item.verificationLevel, addedById: admin.id
    };
    const vendor = existing ? await prisma.vendor.update({ where: { id: existing.id }, data: vendorData }) : await prisma.vendor.create({ data: { ...vendorData, createdAt: new Date(item.createdAt) } });
    await prisma.photo.deleteMany({ where: { vendorId: vendor.id, userId: admin.id } });
    await prisma.photo.create({ data: { vendorId: vendor.id, userId: admin.id, photoUrl: item.photos[0].photoUrl, caption: item.photos[0].caption, isPrimary: true } });
    await prisma.review.upsert({ where: { vendorId_userId: { vendorId: vendor.id, userId: reviewer.id } }, create: {
      vendorId: vendor.id, userId: reviewer.id, rating: item.ratingAvg >= 4.7 ? 5 : 4,
      comment: item.id === "demo-fuchka-club" ? "The doi fuchka is creamy, crisp and beautifully balanced. A Gulshan favourite." : "Crispy shells, lively tok and generous filling—an excellent evening stop.",
      photos: [], hygieneRating: Math.round(item.hygieneScore), tasteRating: item.ratingAvg >= 4.6 ? 5 : 4, valueRating: 4
    }, update: { rating: item.ratingAvg >= 4.7 ? 5 : 4, comment: item.id === "demo-fuchka-club" ? "The doi fuchka is creamy, crisp and beautifully balanced. A Gulshan favourite." : "Crispy shells, lively tok and generous filling—an excellent evening stop.", hygieneRating: Math.round(item.hygieneScore), tasteRating: item.ratingAvg >= 4.6 ? 5 : 4, valueRating: 4 } });
  }
  console.log(`Seeded ${DEMO_VENDORS.length} Dhaka fuchkawalas, led by Fuchka Club Gulshan 2.`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
