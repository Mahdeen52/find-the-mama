import type { Hours, Vendor } from "@/lib/types";
import { haversineKm, isOpenNow } from "@/lib/utils";

type DemoVendor = Omit<Vendor, "priceRange"> & { priceRange: "BUDGET" | "MODERATE" | "PREMIUM" };
type SeedRow = {
  id: string; name: string; address: string; area: string; lat: number; lng: number;
  rating: number; count: number; specialties: string[]; price?: DemoVendor["priceRange"];
};

const imagePool = [
  "/seed/fuchka-stall-dhanmondi.png",
  "/seed/fuchka-stall-old-dhaka.png",
  "/seed/fuchka-stall-gulshan.png",
  "/seed/fuchka-stall-uttara.png"
];

const hourPresets = [
  { open: "14:30", close: "22:00", closed: [] as string[] },
  { open: "16:00", close: "00:30", closed: ["tue"] },
  { open: "12:00", close: "21:30", closed: ["mon"] },
  { open: "15:30", close: "23:00", closed: [] as string[] },
  { open: "17:00", close: "01:00", closed: ["wed"] },
  { open: "13:00", close: "20:30", closed: ["sun"] },
  { open: "11:30", close: "22:30", closed: [] as string[] },
  { open: "18:00", close: "02:00", closed: ["mon"] }
];
const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function hoursFor(index: number): Hours {
  const preset = hourPresets[index % hourPresets.length];
  return Object.fromEntries(days.map((day) => [day, {
    open: day === "fri" ? preset.open.replace(/\d\d$/, "00") : preset.open,
    close: day === "fri" && preset.close === "20:30" ? "22:30" : preset.close,
    closed: preset.closed.includes(day)
  }]));
}
const photo = (id: string, index: number) => [{ id: `photo-${id}`, photoUrl: imagePool[index % imagePool.length], caption: "Demo photo of a Bangladeshi fuchka stall", isPrimary: true }];

const rows: SeedRow[] = [
  { id: "rahim", name: "Rahim Mama's Fuchka", address: "Road 8A, Dhanmondi Lake", area: "Dhanmondi", lat: 23.7465, lng: 90.3760, rating: 4.8, count: 96, specialties: ["Dahi Fuchka", "Chatpati"] },
  { id: "lake-point", name: "Dhanmondi Lake Fuchka Point", address: "Rabindra Sarobar Gate 2", area: "Dhanmondi", lat: 23.7509, lng: 90.3687, rating: 4.6, count: 71, specialties: ["Spicy Fuchka", "Chola"] },
  { id: "shankar", name: "Shankar Tok-Jhal Corner", address: "Shankar Bus Stand", area: "Dhanmondi", lat: 23.7501, lng: 90.3612, rating: 4.5, count: 54, specialties: ["Tok Jhal Fuchka", "Chatpati"] },
  { id: "satmasjid", name: "Satmasjid Road Doi Fuchka", address: "Road 9A, Satmasjid Road", area: "Dhanmondi", lat: 23.7438, lng: 90.3722, rating: 4.4, count: 38, specialties: ["Dahi Fuchka", "Chola"], price: "MODERATE" },

  { id: "karim", name: "Karim Mama Fuchka Ghor", address: "Mirpur 10 Circle", area: "Mirpur", lat: 23.8069, lng: 90.3687, rating: 4.7, count: 88, specialties: ["Dahi Fuchka", "Tok Jhal Fuchka"] },
  { id: "rupnagar", name: "Rupnagar Tok-Jhal Mama", address: "Rupnagar R/A", area: "Mirpur", lat: 23.8242, lng: 90.3541, rating: 4.4, count: 43, specialties: ["Chatpati", "Chola"] },
  { id: "pallabi", name: "Pallabi Fuchka Station", address: "Pallabi Bus Stand", area: "Mirpur", lat: 23.8272, lng: 90.3665, rating: 4.6, count: 64, specialties: ["Spicy Fuchka", "Dahi Fuchka"] },
  { id: "mirpur-one", name: "Mirpur 1 Shah Ali Fuchka", address: "Shah Ali Market Gate", area: "Mirpur", lat: 23.7984, lng: 90.3531, rating: 4.3, count: 32, specialties: ["Tok Jhal Fuchka", "Chola"] },

  { id: "paanipuri", name: "Paanipuri — Gulshan Youth Club", address: "Road 103, Gulshan Youth Club", area: "Gulshan", lat: 23.7981, lng: 90.4182, rating: 4.7, count: 104, specialties: ["Tok Jhal Fuchka", "Chola"] },
  { id: "gulshan-one", name: "Gulshan 1 Lake Mama", address: "Gulshan Lake Park, Road 63", area: "Gulshan", lat: 23.7808, lng: 90.4162, rating: 4.6, count: 82, specialties: ["Dahi Fuchka", "Spicy Fuchka"], price: "MODERATE" },
  { id: "niketon", name: "Niketon Gate Fuchka Bari", address: "Niketon Gate 1", area: "Gulshan", lat: 23.7802, lng: 90.4094, rating: 4.5, count: 49, specialties: ["Chatpati", "Tok Jhal Fuchka"] },

  { id: "banani-eleven", name: "Banani Eleven Fuchka Mama", address: "Road 11, Banani", area: "Banani", lat: 23.7937, lng: 90.4043, rating: 4.6, count: 67, specialties: ["Tok Jhal Fuchka", "Chatpati"] },
  { id: "banani-lake", name: "Banani Lakeview Chotpoti", address: "Road 18, Banani Lake", area: "Banani", lat: 23.7985, lng: 90.4081, rating: 4.7, count: 75, specialties: ["Chatpati", "Dahi Fuchka"], price: "MODERATE" },
  { id: "kakoli", name: "Kakoli More Fuchka Cart", address: "Kakoli Bus Stand", area: "Banani", lat: 23.7977, lng: 90.4008, rating: 4.3, count: 36, specialties: ["Spicy Fuchka", "Chola"] },
  { id: "chairmanbari", name: "Chairman Bari Naga Fuchka", address: "Chairman Bari, Banani", area: "Banani", lat: 23.7894, lng: 90.3987, rating: 4.5, count: 58, specialties: ["Spicy Fuchka", "Tok Jhal Fuchka"] },

  { id: "azampur", name: "Azampur Hashem Mama", address: "Rajlaxmi Complex", area: "Uttara", lat: 23.8688, lng: 90.4000, rating: 4.5, count: 59, specialties: ["Dahi Fuchka", "Chola"] },
  { id: "sector-seven", name: "Sector 7 Park Fuchka", address: "Sector 7 Park Gate", area: "Uttara", lat: 23.8731, lng: 90.3978, rating: 4.7, count: 91, specialties: ["Tok Jhal Fuchka", "Chatpati"] },
  { id: "diabari", name: "Diabari Sunset Fuchka", address: "Diabari Lake Road", area: "Uttara", lat: 23.8884, lng: 90.3732, rating: 4.6, count: 77, specialties: ["Dahi Fuchka", "Spicy Fuchka"], price: "MODERATE" },
  { id: "housebuilding", name: "House Building Mama's Cart", address: "House Building Bus Stop", area: "Uttara", lat: 23.8748, lng: 90.4006, rating: 4.2, count: 29, specialties: ["Chatpati", "Chola"] },

  { id: "taher", name: "Abu Taher Mama's Fuchka", address: "Lalmatia Arat", area: "Mohammadpur", lat: 23.7577, lng: 90.3658, rating: 4.8, count: 143, specialties: ["Dahi Fuchka", "Chatpati", "Chola"] },
  { id: "townhall", name: "Town Hall Babul Mama", address: "Town Hall Market", area: "Mohammadpur", lat: 23.7585, lng: 90.3583, rating: 4.4, count: 41, specialties: ["Spicy Fuchka", "Chatpati"] },
  { id: "japan-garden", name: "Japan Garden City Fuchka", address: "Ring Road, Japan Garden City", area: "Mohammadpur", lat: 23.7657, lng: 90.3587, rating: 4.6, count: 69, specialties: ["Dahi Fuchka", "Tok Jhal Fuchka"] },
  { id: "bosila", name: "Bosila Bridge Mama", address: "Bosila Bridge Approach", area: "Mohammadpur", lat: 23.7458, lng: 90.3439, rating: 4.3, count: 34, specialties: ["Chola", "Chatpati"] },

  { id: "bashundhara-gate", name: "Bashundhara Gate Fuchka Bari", address: "Bashundhara Main Gate", area: "Bashundhara", lat: 23.8198, lng: 90.4520, rating: 4.5, count: 52, specialties: ["Dahi Fuchka", "Tok Jhal Fuchka"] },
  { id: "jamuna", name: "Jamuna Future Park Fuchka", address: "JFP North Gate", area: "Bashundhara", lat: 23.8133, lng: 90.4241, rating: 4.6, count: 86, specialties: ["Spicy Fuchka", "Dahi Fuchka"], price: "MODERATE" },
  { id: "nsu", name: "NSU Campus Mama", address: "Bashundhara Avenue, NSU Gate", area: "Bashundhara", lat: 23.8159, lng: 90.4255, rating: 4.7, count: 112, specialties: ["Tok Jhal Fuchka", "Chatpati"] },
  { id: "block-c", name: "Block C Evening Fuchka", address: "Road 4, Block C", area: "Bashundhara", lat: 23.8178, lng: 90.4352, rating: 4.3, count: 31, specialties: ["Chola", "Dahi Fuchka"] },

  { id: "kamala", name: "Motijheel Kamala Cart Mama", address: "Shapla Chattar", area: "Motijheel", lat: 23.7270, lng: 90.4212, rating: 4.6, count: 61, specialties: ["Chatpati", "Chola"] },
  { id: "dilkusha", name: "Dilkusha Office Para Fuchka", address: "Dilkusha Commercial Area", area: "Motijheel", lat: 23.7282, lng: 90.4174, rating: 4.4, count: 47, specialties: ["Tok Jhal Fuchka", "Spicy Fuchka"] },
  { id: "stadium", name: "Stadium Gate Doi Fuchka", address: "Bangabandhu Stadium Gate", area: "Motijheel", lat: 23.7279, lng: 90.4134, rating: 4.5, count: 72, specialties: ["Dahi Fuchka", "Chatpati"] },
  { id: "fakirapool", name: "Fakirapool Rafiq Mama", address: "Fakirapool Water Tank", area: "Motijheel", lat: 23.7339, lng: 90.4178, rating: 4.2, count: 27, specialties: ["Chola", "Spicy Fuchka"] },

  { id: "jummon", name: "Jummon Fuchka — Old Dhaka", address: "Armanitola School Road", area: "Old Dhaka", lat: 23.7151, lng: 90.4011, rating: 4.8, count: 119, specialties: ["Spicy Fuchka", "Chola"] },
  { id: "chawk", name: "Chawkbazar Salam Mama", address: "Shahi Mosque Lane", area: "Old Dhaka", lat: 23.7165, lng: 90.3975, rating: 4.5, count: 73, specialties: ["Spicy Fuchka", "Chola"] },
  { id: "wari", name: "Wari Baldha Garden Fuchka", address: "Baldha Garden Gate", area: "Old Dhaka", lat: 23.7189, lng: 90.4189, rating: 4.6, count: 83, specialties: ["Dahi Fuchka", "Chatpati"] },
  { id: "lalbagh", name: "Lalbagh Fort Tok Corner", address: "Lalbagh Fort South Gate", area: "Old Dhaka", lat: 23.7190, lng: 90.3881, rating: 4.4, count: 55, specialties: ["Tok Jhal Fuchka", "Spicy Fuchka"] },

  { id: "anondo", name: "Farmgate Anondo Fuchka", address: "Ananda Cinema Hall Lane", area: "Farmgate", lat: 23.7581, lng: 90.3891, rating: 4.4, count: 46, specialties: ["Dahi Fuchka", "Chatpati"] },
  { id: "tejkunipara", name: "Tejkunipara Rafiq Mama", address: "Indira Road", area: "Farmgate", lat: 23.7621, lng: 90.3847, rating: 4.3, count: 35, specialties: ["Tok Jhal Fuchka", "Chatpati"] },
  { id: "khamarbari", name: "Khamarbari Krishibid Fuchka", address: "Krishibid Institution Gate", area: "Farmgate", lat: 23.7592, lng: 90.3827, rating: 4.6, count: 68, specialties: ["Spicy Fuchka", "Dahi Fuchka"] },
  { id: "green-road", name: "Green Road Fuchka Express", address: "Green Road Overbridge", area: "Farmgate", lat: 23.7544, lng: 90.3872, rating: 4.5, count: 51, specialties: ["Chola", "Tok Jhal Fuchka"], price: "MODERATE" }
];

const generated = rows.map((item, index): DemoVendor => ({
  id: `demo-${item.id}`,
  name: item.name,
  description: "A community-listed Dhaka fuchka stop serving crisp shells, fresh fillings and bold tamarind water.",
  address: item.address, area: item.area, zone: item.area, lat: item.lat, lng: item.lng,
  phone: `+88017${String(10000000 + index).slice(-8)}`,
  specialties: item.specialties, operatingHours: hoursFor(index), priceRange: item.price || "BUDGET",
  ratingAvg: item.rating, ratingCount: item.count, hygieneScore: Math.max(3.8, item.rating - 0.2),
  isVerified: true, verificationLevel: item.rating >= 4.7 ? "trusted" : "community", status: "ACTIVE",
  createdAt: new Date(Date.UTC(2026, 7, 1 + index)).toISOString(), reviews: [],
  photos: photo(item.id, index)
}));

const fuchkaClub: DemoVendor = {
  id: "demo-fuchka-club", name: "Fuchka Club — Gulshan 2",
  description: "Featured demo listing at House 5, Road 36. Known for doi fuchka, naga fuchka and late-night service. The 4.9 rating is demo community data.",
  address: "House 5, Road 36, Gulshan 2", area: "Gulshan", zone: "Gulshan", lat: 23.7959, lng: 90.4143,
  phone: "+8801700000000", specialties: ["Dahi Fuchka", "Spicy Fuchka", "Chatpati"],
  operatingHours: Object.fromEntries(days.map((day) => [day, { open: "16:00", close: "04:00", closed: false }])),
  priceRange: "MODERATE", ratingAvg: 4.9, ratingCount: 128, hygieneScore: 4.8, isVerified: true,
  verificationLevel: "featured", status: "ACTIVE", createdAt: "2026-09-01T12:00:00.000Z", reviews: [],
  photos: [{ id: "photo-club", photoUrl: "/seed/fuchka-stall-gulshan.png", caption: "Demo photo of a modern Gulshan fuchka stall", isPrimary: true }]
};

export const DEMO_VENDORS: DemoVendor[] = [fuchkaClub, ...generated];

export function queryDemoVendors(url: string) {
  const params = new URL(url).searchParams;
  const area = params.get("area"); const q = params.get("q")?.toLowerCase();
  const minRating = Number(params.get("minRating")) || 0; const price = params.get("priceRange");
  const specialties = params.get("specialties")?.split(",").filter(Boolean) || [];
  const lat = Number(params.get("lat")); const lng = Number(params.get("lng"));
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && params.has("lat") && params.has("lng");
  const sort = params.get("sort") || "rating"; const limit = Math.min(Number(params.get("limit")) || 20, 50); const offset = Number(params.get("offset")) || 0;
  const result: Vendor[] = DEMO_VENDORS.filter((vendor) => (!area || vendor.area === area) && vendor.ratingAvg >= minRating && (!price || vendor.priceRange === price) && (!q || `${vendor.name} ${vendor.area} ${vendor.specialties.join(" ")}`.toLowerCase().includes(q)) && (!specialties.length || specialties.every((item) => vendor.specialties.includes(item))) && (!params.get("openNow") || isOpenNow(vendor.operatingHours))).map((vendor) => ({ ...vendor, ...(hasCoords && { distance: haversineKm(lat, lng, vendor.lat, vendor.lng) }) }));
  result.sort((a, b) => sort === "distance" && hasCoords ? (a.distance ?? 999) - (b.distance ?? 999) : sort === "recentlyAdded" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : sort === "area" ? a.area.localeCompare(b.area) || b.ratingAvg - a.ratingAvg : b.ratingAvg - a.ratingAvg);
  return result.slice(offset, offset + limit);
}

export function nearbyDemoVendors(lat: number, lng: number, radius: number) {
  return DEMO_VENDORS.map((vendor) => ({ ...vendor, distance: haversineKm(lat, lng, vendor.lat, vendor.lng) })).filter((vendor) => vendor.distance <= radius).sort((a, b) => a.distance - b.distance);
}
