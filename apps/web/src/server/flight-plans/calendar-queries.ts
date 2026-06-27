import { prisma } from "@/lib/prisma";

export type CalendarDay = {
  date: string; // YYYY-MM-DD
  flightPlans: Array<{
    id: string;
    code: string;
    title: string;
    permissionStatus: string;
    operationDate: Date | null;
  }>;
};

export async function getCalendarData(
  year: number,
  month: number,
): Promise<CalendarDay[]> {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const flightPlans = await prisma.flightPlan.findMany({
    where: {
      deletedAt: null,
      operationDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: {
      id: true,
      code: true,
      title: true,
      permissionStatus: true,
      operationDate: true,
    },
    orderBy: { operationDate: "asc" },
  });

  // Group by date
  const grouped = new Map<string, CalendarDay["flightPlans"]>();

  for (const fp of flightPlans) {
    if (!fp.operationDate) continue;
    const dateKey = fp.operationDate.toISOString().slice(0, 10);
    const existing = grouped.get(dateKey) ?? [];
    existing.push(fp);
    grouped.set(dateKey, existing);
  }

  return Array.from(grouped.entries()).map(([date, plans]) => ({
    date,
    flightPlans: plans,
  }));
}
