"use client";

import type { ReactNode } from "react";

interface MetricCardProps {
  icon?: ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export function MetricCard({
  icon,
  value,
  label,
  trend,
  className = "",
}: MetricCardProps) {
  const trendColor = {
    up: "text-status-success",
    down: "text-status-danger",
    neutral: "text-slate-400 dark:text-slate-500",
  };

  const trendIcon = {
    up: "\u2191",
    down: "\u2193",
    neutral: "\u2192",
  };

  return (
    <div
      className={`rounded-lg border border-border-soft bg-white p-4 shadow-sm dark:bg-surface-elevated dark:shadow-none ${className}`}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
            {icon}
          </div>
        )}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor[trend.direction]}`}
          >
            {trendIcon[trend.direction]}
            {trend.value}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="font-heading text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
