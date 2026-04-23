import { Order, formatDate, formatSom, paidAmount, paymentStatus, remainingAmount, Payment } from "@/lib/orders";
import { CountdownBadge } from "./CountdownBadge";
import { PaymentDialog } from "./PaymentDialog";
import { Button } from "@/components/ui/button";
import { Phone, Scissors, Calendar, Trash2, Play, Check, Wallet, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  order: Order;
  onUpdateStatus: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
  onAddPayment: (orderId: string, payment: Payment) => void;
  onRemovePayment: (orderId: string, paymentId: string) => void;
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

const paymentLabels = {
  unpaid: "To'lanmagan",
  partial: "Qisman",
  paid: "To'langan",
} as const;

const paymentStyles = {
  unpaid: "bg-destructive/15 text-destructive",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  paid: "bg-success/20 text-success",
} as const;

export function OrderCard({ order, onUpdateStatus, onDelete, onAddPayment, onRemovePayment }: Props) {
  const pStatus = paymentStatus(order);
  const paid = paidAmount(order);
  const remaining = remainingAmount(order);
  const progress = order.price > 0 ? Math.min(100, (paid / order.price) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft transition-all hover:shadow-elegant animate-slide-up">
      <div className="absolute top-0 right-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusStyles[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${paymentStyles[pStatus]}`}>
                <Wallet className="inline h-3 w-3 mr-1 -mt-0.5" />
                {paymentLabels[pStatus]}
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

        {/* Payment progress */}
        {order.price > 0 && (
          <div className="rounded-xl bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">To'langan: <span className="font-semibold text-success">{formatSom(paid)}</span></span>
              <span className="text-muted-foreground">Qoldiq: <span className="font-semibold text-destructive">{formatSom(remaining)}</span></span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-gradient-to-r from-success to-success/70 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

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
          {remaining > 0 && order.price > 0 && (
            <Button
              onClick={() => {
                onAddPayment(order.id, {
                  id: crypto.randomUUID(),
                  amount: remaining,
                  method: "cash",
                  date: new Date().toISOString(),
                  note: "To'liq to'landi",
                });
                toast.success("To'liq to'lov belgilandi 💰");
              }}
              variant="outline"
              className="flex-1 border-success/40 text-success hover:bg-success/10 hover:text-success"
            >
              <BadgeCheck className="h-4 w-4 mr-1" /> To'landi
            </Button>
          )}
          <PaymentDialog order={order} onAddPayment={onAddPayment} onRemovePayment={onRemovePayment} />
          <Button onClick={() => onDelete(order.id)} variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
