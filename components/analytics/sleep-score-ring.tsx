"use client";

import { motion } from "framer-motion";

interface SleepScoreRingProps {
  score: number;
  label: string;
  color: string;
  breakdown: {
    durationScore: number;
    consistencyScore: number;
    qualityScore: number;
  };
}

export function SleepScoreRing({
  score,
  label,
  color,
  breakdown,
}: SleepScoreRingProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel flex flex-col items-center gap-5 rounded-2xl p-6">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 10px ${color}90)` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-4xl font-semibold tracking-tight"
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-base font-medium" style={{ color }}>
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Sleep Score</p>
      </div>

      <div className="grid w-full grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
        <BreakdownItem label="Duration" value={breakdown.durationScore} />
        <BreakdownItem label="Consistency" value={breakdown.consistencyScore} />
        <BreakdownItem label="Quality" value={breakdown.qualityScore} />
      </div>
    </div>
  );
}

function BreakdownItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-sm font-medium tabular-nums">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
