"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SleepSession } from "@prisma/client";

import { buildLast7DaysSeries } from "@/lib/sleep-analytics";
import { formatDuration } from "@/lib/utils";

interface SleepChartProps {
  sessions: Pick<SleepSession, "startTime" | "durationMin">[];
}

export function SleepChart({ sessions }: SleepChartProps) {
  const data = buildLast7DaysSeries(sessions).map((d) => ({
    ...d,
    hours: Math.round((d.minutes / 60) * 100) / 100,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(239 84% 67%)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="hsl(239 84% 67%)" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            tickFormatter={(value: number) => `${value}h`}
            width={36}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="hours"
            fill="url(#sleepBarGradient)"
            radius={[6, 6, 6, 6]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Manually-typed rather than importing recharts' internal TooltipProps
 * generics — those live at an internal path that has moved between minor
 * versions before. This shape is all we actually consume.
 */
interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const minutes = Math.round(payload[0].value * 60);

  return (
    <div className="glass-panel rounded-lg border border-white/10 px-3 py-2 text-xs shadow-glow-sm">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {minutes > 0 ? formatDuration(minutes) : "No data"}
      </p>
    </div>
  );
}
