import type { Prisma } from "@prisma/client";

export const POINT_RULES = {
  add_vendor: 20,
  add_review: 5,
  add_photo: 3
} as const;

export const BADGE_LEVELS = [
  { id: "trailblazer", name: "Trailblazer", points: 20, description: "Listed your first neighbourhood mama" },
  { id: "taste-tester", name: "Taste Tester", points: 50, description: "Shared enough details to guide other foodies" },
  { id: "neighbourhood-guide", name: "Neighbourhood Guide", points: 100, description: "A trusted voice in the local fuchka map" },
  { id: "dhaka-legend", name: "Dhaka Legend", points: 250, description: "One of the community's top contributors" }
] as const;

const normalizeBadges = (value: Prisma.JsonValue) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export async function awardContribution(
  tx: Prisma.TransactionClient,
  input: { userId: string; action: keyof typeof POINT_RULES; entityType: string; entityId: string }
) {
  const points = POINT_RULES[input.action];
  await tx.activityLog.create({ data: { ...input, pointsEarned: points } });
  const user = await tx.user.update({ where: { id: input.userId }, data: { contributionPoints: { increment: points } } });
  const earned = BADGE_LEVELS.filter((badge) => user.contributionPoints >= badge.points).map((badge) => badge.id);
  const badges = [...new Set([...normalizeBadges(user.badges), ...earned])];
  if (badges.length !== normalizeBadges(user.badges).length) await tx.user.update({ where: { id: input.userId }, data: { badges } });
  return { points, total: user.contributionPoints, badges };
}

export function nextBadge(points: number) {
  const badge = BADGE_LEVELS.find((item) => points < item.points);
  return badge ? { id: badge.id, name: badge.name, points: badge.points, remaining: badge.points - points } : null;
}
