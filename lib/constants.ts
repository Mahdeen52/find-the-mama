export const AREAS = [
  "Dhanmondi", "Mirpur", "Gulshan", "Banani", "Uttara",
  "Mohammadpur", "Bashundhara", "Motijheel", "Old Dhaka", "Farmgate"
] as const;

export const SPECIALTIES = ["Dahi Fuchka", "Chatpati", "Chola", "Spicy Fuchka", "Tok Jhal Fuchka"] as const;
export const PRICE_RANGES = ["BUDGET", "MODERATE", "PREMIUM"] as const;
export const DHAKA_CENTER: [number, number] = [23.7808, 90.4070];

export const AREA_CENTERS: Record<(typeof AREAS)[number], [number, number]> = {
  Dhanmondi: [23.7465, 90.3760], Mirpur: [23.8069, 90.3687], Gulshan: [23.7925, 90.4140],
  Banani: [23.7937, 90.4043], Uttara: [23.8688, 90.4000], Mohammadpur: [23.7585, 90.3583],
  Bashundhara: [23.8198, 90.4520], Motijheel: [23.7270, 90.4212], "Old Dhaka": [23.7165, 90.3975],
  Farmgate: [23.7581, 90.3891]
};

export const DEFAULT_HOURS = Object.fromEntries(
  ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => [day, { open: "16:00", close: "22:00", closed: false }])
);
