import { Order, formatDate } from "@/lib/orders";
import { CountdownBadge } from "./CountdownBadge";
import { Button } from "@/components/ui/button";
import { Phone, Scissors, Calendar, Trash2, Play, Check } from "lucide-react";

interface Props {
  order: Order;
  onUpdateStatus: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
}

const statusLabels: Record<Order["status"], string> = {
  pending: "Kutilmoqda",
  in_progress: "Jarayonda",
  completed: "Tugatildi",
};

const statusStyles: Record<Order["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-accent text-accent-foreground",
  completed: "bg-success/20 text-success",
};

export function OrderCard({ order, onUpdateStatus, onDelete }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft transition-all hover:shadow-elegant animate-slide-up">
      <div className="absolute top-0 right-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusStyles[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              <span className="text-xs text-muted-foreground">#{order.id.slice(0, 6)}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{order.customerName}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Scissors className="h-3.5 w-3.5" />
                {order.garmentType}
              </span>
              {order.phone && (
                <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" />
                  {order.phone}
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {order.price.toLocaleString("uz-UZ")}
            </div>
            <div className="text-xs text-muted-foreground">so'm</div>
          </div>
        </div>

        {order.notes && (
          <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground italic">
            "{order.notes}"
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-secondary/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              Boshlangan
            </div>
            <div className="font-semibold text-foreground">{formatDate(order.startDate)}</div>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              Topshirish
            </div>
            <div className="font-semibold text-foreground">{formatDate(order.dueDate)}</div>
          </div>
        </div>

        <CountdownBadge dueDate={order.dueDate} completedDate={order.completedDate} status={order.status} />

        <div className="flex flex-wrap gap-2 pt-2">
          {order.status === "pending" && (
            <Button onClick={() => onUpdateStatus(order.id, "in_progress")} className="flex-1" variant="default">
              <Play className="h-4 w-4 mr-1" /> Boshlash
            </Button>
          )}
          {order.status === "in_progress" && (
            <Button onClick={() => onUpdateStatus(order.id, "completed")} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
              <Check className="h-4 w-4 mr-1" /> Tugatish
            </Button>
          )}
          {order.status === "completed" && (
            <Button onClick={() => onUpdateStatus(order.id, "in_progress")} variant="outline" className="flex-1">
              Qayta ochish
            </Button>
          )}
          <Button onClick={() => onDelete(order.id)} variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
