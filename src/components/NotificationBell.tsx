import { useEffect, useMemo, useState } from "react";
import { Order, paymentStatus, remainingAmount, formatSom, timeLeft } from "@/lib/orders";
import { Bell, AlertTriangle, Clock, Wallet, CheckCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  orders: Order[];
}

type Notif = {
  id: string;
  type: "overdue" | "due_soon" | "unpaid";
  title: string;
  description: string;
  orderId: string;
  ts: number;
};

const READ_KEY = "tailor_notifs_read_v1";

function loadRead(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRead(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_KEY, JSON.stringify(ids));
}

export function NotificationBell({ orders }: Props) {
  const [read, setRead] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    setRead(loadRead());
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const notifications = useMemo<Notif[]>(() => {
    const list: Notif[] = [];
    for (const o of orders) {
      // Overdue / due-soon
      if (o.status !== "completed") {
        const tl = timeLeft(o.dueDate);
        if (tl.overdue) {
          list.push({
            id: `overdue-${o.id}`,
            type: "overdue",
            title: `${o.customerName} — muddati o'tdi`,
            description: `${o.garmentType} · ${tl.days > 0 ? `${tl.days} kun ` : ""}${tl.hours} soat kechikdi`,
            orderId: o.id,
            ts: new Date(o.dueDate).getTime(),
          });
        } else if (tl.totalMs <= 24 * 60 * 60 * 1000) {
          list.push({
            id: `duesoon-${o.id}`,
            type: "due_soon",
            title: `${o.customerName} — muddati yaqin`,
            description: `${o.garmentType} · ${tl.hours} soat ${tl.minutes} daqiqa qoldi`,
            orderId: o.id,
            ts: new Date(o.dueDate).getTime(),
          });
        }
      }

      // Unpaid completed orders
      if (o.status === "completed" && paymentStatus(o) !== "paid" && o.price > 0) {
        const rem = remainingAmount(o);
        list.push({
          id: `unpaid-${o.id}`,
          type: "unpaid",
          title: `${o.customerName} — to'lov qoldig'i`,
          description: `Tugatilgan, lekin ${formatSom(rem)} qarz`,
          orderId: o.id,
          ts: o.completedDate ? new Date(o.completedDate).getTime() : Date.now(),
        });
      }
    }
    return list.sort((a, b) => {
      const order = { overdue: 0, due_soon: 1, unpaid: 2 } as const;
      if (order[a.type] !== order[b.type]) return order[a.type] - order[b.type];
      return a.ts - b.ts;
    });
  }, [orders]);

  const unreadCount = notifications.filter((n) => !read.includes(n.id)).length;

  const markAllRead = () => {
    const ids = notifications.map((n) => n.id);
    setRead(ids);
    saveRead(ids);
  };

  const markRead = (id: string) => {
    if (read.includes(id)) return;
    const next = [...read, id];
    setRead(next);
    saveRead(next);
  };

  const iconFor = (t: Notif["type"]) => {
    if (t === "overdue") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (t === "due_soon") return <Clock className="h-4 w-4 text-amber-500" />;
    return <Wallet className="h-4 w-4 text-primary" />;
  };

  const tintFor = (t: Notif["type"]) => {
    if (t === "overdue") return "bg-destructive/10 border-destructive/20";
    if (t === "due_soon") return "bg-amber-500/10 border-amber-500/20";
    return "bg-primary/10 border-primary/20";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-2xl"
          aria-label="Bildirishnomalar"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="font-semibold">Bildirishnomalar</span>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({notifications.length})
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Barchasi
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Hozircha bildirishnomalar yo'q
            </div>
          ) : (
            <ul className="p-2 space-y-1.5">
              {notifications.map((n) => {
                const isRead = read.includes(n.id);
                return (
                  <li
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${tintFor(n.type)} ${
                      isRead ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <div className="mt-0.5">{iconFor(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {n.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {n.description}
                        </div>
                      </div>
                      {!isRead && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
