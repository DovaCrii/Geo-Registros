"use client";

import type { ReactNode } from "react";

import { TrendDownIcon, TrendNeutralIcon, TrendUpIcon } from "@/components/ui/linear-icons";
import { uiCardRadius, uiSurface } from "@/components/ui/design-tokens";

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
    up: <TrendUpIcon className="h-3.5 w-3.5" />,
    down: <TrendDownIcon className="h-3.5 w-3.5" />,
    neutral: <TrendNeutralIcon className="h-3.5 w-3.5" />,
  };

  return (
    <div
      className={`${uiCardRadius} ${uiSurface} p-5 transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-accent dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-300">
            {icon}
          </div>
        )}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColor[trend.direction]}`}
          >
            <span aria-hidden="true">{trendIcon[trend.direction]}</span>
            {trend.value}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="font-heading text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
