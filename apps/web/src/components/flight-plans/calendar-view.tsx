"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

type CalendarDay = {
  date: string;
  flightPlans: Array<{
    id: string;
    code: string;
    title: string;
    permissionStatus: string;
    operationDate: Date | null;
  }>;
};

const STATUS_DOT: Record<string, string> = {
  DRAFT: "bg-slate-400",
  IN_REVIEW: "bg-amber-400",
  READY_FOR_SUBMISSION: "bg-amber-400",
  SUBMITTED: "bg-amber-400",
  AUTHORIZED: "bg-emerald-500",
  OBSERVED: "bg-rose-500",
  REJECTED: "bg-rose-500",
  EXPIRED: "bg-slate-500",
  CLOSED: "bg-emerald-500",
  CANCELLED: "bg-slate-400",
};

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function CalendarView({ data }: { data: CalendarDay[] }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    for (const day of data) {
      map.set(day.date, day);
    }
    return map;
  }, [data]);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const weeks = useMemo(() => {
    const cells: Array<{ day: number | null; dateKey?: string; flightPlans?: CalendarDay["flightPlans"] }[]> = [];
    let week: typeof cells[0] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push({ day: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = dayMap.get(dateKey);

      week.push({
        day,
        dateKey,
        flightPlans: dayData?.flightPlans,
      });

      if (week.length === 7) {
        cells.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      cells.push(week);
    }

    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfWeek, dayMap]);

  function prevMonth() {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-950/45 dark:shadow-xl dark:shadow-slate-950/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800/60">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {MONTHS[currentMonth - 1]} {currentYear}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          →
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/60">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((cell, ci) => {
              const isToday =
                cell.day !== null &&
                cell.dateKey === today.toISOString().slice(0, 10);

              return (
                <div
                  key={ci}
                  className={`min-h-[80px] border-r border-slate-100 p-1.5 last:border-r-0 dark:border-slate-800/60 ${
                    isToday ? "bg-accent/5 dark:bg-cyan-500/10" : ""
                  }`}
                >
                  {cell.day !== null && (
                    <>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          isToday
                            ? "bg-accent text-white dark:bg-cyan-400 dark:text-slate-950"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {cell.day}
                      </span>

                      {cell.flightPlans && cell.flightPlans.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {cell.flightPlans.slice(0, 3).map((fp) => (
                            <Link
                              key={fp.id}
                              href={`/flight-plans/${fp.id}`}
                              className="group flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight text-slate-600 transition hover:bg-accent/10 hover:text-accent-strong dark:text-slate-400 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-200"
                              title={fp.title}
                            >
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                  STATUS_DOT[fp.permissionStatus] ?? "bg-slate-400"
                                }`}
                              />
                              <span className="truncate">{fp.code}</span>
                            </Link>
                          ))}
                          {cell.flightPlans.length > 3 && (
                            <p className="px-1 text-[9px] text-slate-400">
                              +{cell.flightPlans.length - 3} más
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
