import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/server/notifications/email-service";

export type NotificationType =
  | "PERMISSION_TRANSITION"
  | "DOCUMENT_ATTACHED"
  | "DOCUMENT_REMOVED"
  | "NOTE_ADDED";

type CreateNotificationParams = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
};

/**
 * Create a single notification for a specific user.
 */
export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link ?? null,
    },
  });
}

/**
 * Create a notification for all active users (broadcast).
 * Optionally exclude a specific user ID (the one who triggered the action).
 * Also sends email notifications in the background.
 */
export async function broadcastNotification(
  params: Omit<CreateNotificationParams, "userId">,
  excludeUserId?: string,
) {
  const users = await prisma.user.findMany({
    where: {
      active: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true, email: true, fullName: true },
  });

  if (users.length === 0) return [];

  // In-app notifications
  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link ?? null,
    })),
  });

  // Email notifications (fire & forget — does not block response)
  for (const user of users) {
    if (!user.email) continue;

    sendNotificationEmail({
      to: user.email,
      recipientName: user.fullName,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
    }).catch(() => {
      // silently ignore — email errors already logged in service
    });
  }
}
