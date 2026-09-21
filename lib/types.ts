export type Hours = Record<string, { open: string; close: string; closed?: boolean }>;

export type User = {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  photoUrl: string | null;
  languagePref: string;
  contributionPoints: number;
  badges: string[];
  isAdmin?: boolean;
  role?: "USER" | "MODERATOR" | "ADMIN";
  trustScore?: number;
  isTrustedContributor?: boolean;
  status?: "ACTIVE" | "SUSPENDED" | "BANNED";
};

export type ProfileStats = {
  points: number;
  badges: string[];
  nextBadge: { id: string; name: string; points: number; remaining: number } | null;
  counts: { vendors: number; reviews: number; photos: number };
  recentActivity: Array<{ id: string; action: string; entityType: string; entityId: string; pointsEarned: number; createdAt: string }>;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  hygieneRating: number;
  tasteRating: number;
  valueRating: number;
  photos: string[];
  createdAt: string;
  user: Pick<User, "id" | "name" | "photoUrl">;
};

export type Photo = { id: string; photoUrl: string; caption: string | null; isPrimary: boolean };

export type Vendor = {
  id: string;
  name: string;
  description: string;
  address: string;
  area: string;
  zone: string;
  lat: number;
  lng: number;
  phone: string | null;
  specialties: string[];
  operatingHours: Hours;
  priceRange: "BUDGET" | "MODERATE" | "PREMIUM";
  ratingAvg: number;
  ratingCount: number;
  hygieneScore: number;
  isVerified: boolean;
  verificationLevel: number;
  weightedRatingAvg?: number;
  trustedReviewCount?: number;
  status: string;
  createdAt: string;
  distance?: number;
  photos: Photo[];
  reviews?: Review[];
  addedBy?: Pick<User, "id" | "name">;
};

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };
