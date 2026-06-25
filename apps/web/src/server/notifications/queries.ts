import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Get notifications for the currently authenticated user.
 * Returns unread first, then recent read ones, with pagination.
 */
export async function getMyNotifications(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const session = await auth();
  if (!session?.user?.id) return { notifications: [], total: 0 };

  const where = { userId: session.user.id, deletedAt: null };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total };
}

/**
 * Count unread notifications for the current user.
 */
export async function countUnreadNotifications(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, read: false, deletedAt: null },
  });
}
