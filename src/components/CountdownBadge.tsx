import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/orders";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  dueDate: string;
  completedDate?: string;
  status: "pending" | "in_progress" | "completed";
}

export function CountdownBadge({ dueDate, completedDate, status }: Props) {
  const [, tick] = useState(0);

  useEffect(() => {
    if (status === "completed") return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (status === "completed") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-success">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm font-semibold">Tugatildi</span>
      </div>
    );
  }

  const t = timeLeft(dueDate, completedDate);

  if (t.overdue) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-destructive/15 px-4 py-2 text-destructive animate-pulse-glow">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-semibold">
          Kechikdi: {t.days}k {t.hours}s {t.minutes}d
        </span>
      </div>
    );
  }

  const isUrgent = t.days === 0 && t.hours < 24;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        isUrgent
          ? "bg-warning/20 text-warning-foreground border border-warning/40"
          : "bg-primary/10 text-primary border border-primary/20"
      }`}
    >
      <Clock className="h-5 w-5 shrink-0" />
      <div className="flex items-baseline gap-2 font-mono">
        <TimeUnit value={t.days} label="kun" />
        <span className="opacity-40">:</span>
        <TimeUnit value={t.hours} label="soat" />
        <span className="opacity-40">:</span>
        <TimeUnit value={t.minutes} label="daq" />
        <span className="opacity-40">:</span>
        <TimeUnit value={t.seconds} label="son" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-lg font-bold tabular-nums">{value.toString().padStart(2, "0")}</span>
      <span className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">{label}</span>
    </div>
  );
}
