import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Trash2, Plus } from "lucide-react";
import {
  Order,
  Payment,
  PaymentMethod,
  formatDateTime,
  formatSom,
  paidAmount,
  paymentMethodLabels,
  remainingAmount,
} from "@/lib/orders";
import { toast } from "sonner";

interface Props {
  order: Order;
  onAddPayment: (orderId: string, payment: Payment) => void;
  onRemovePayment: (orderId: string, paymentId: string) => void;
}

export function PaymentDialog({ order, onAddPayment, onRemovePayment }: Props) {
  const [open, setOpen] = useState(false);
  const remaining = useMemo(() => remainingAmount(order), [order]);
  const paid = useMemo(() => paidAmount(order), [order]);

  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState<string>("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("To'lov summasini kiriting");
      return;
    }
    const payment: Payment = {
      id: crypto.randomUUID(),
      amount: value,
      method,
      date: new Date().toISOString(),
      note: note.trim() || undefined,
    };
    onAddPayment(order.id, payment);
    toast.success("To'lov qo'shildi");
    setAmount("");
    setNote("");
  };

  const fillFull = () => setAmount(String(remaining));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Wallet className="h-4 w-4" />
          To'lov
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">To'lovlar — {order.customerName}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="rounded-xl bg-secondary/50 p-3">
            <div className="text-xs text-muted-foreground">Jami narx</div>
            <div className="font-bold text-foreground">{formatSom(order.price)}</div>
          </div>
          <div className="rounded-xl bg-success/10 p-3">
            <div className="text-xs text-muted-foreground">To'langan</div>
            <div className="font-bold text-success">{formatSom(paid)}</div>
          </div>
          <div className="rounded-xl bg-destructive/10 p-3">
            <div className="text-xs text-muted-foreground">Qoldiq</div>
            <div className="font-bold text-destructive">{formatSom(remaining)}</div>
          </div>
        </div>

        {remaining > 0 && (
          <form onSubmit={submit} className="space-y-3 mt-2 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Yangi to'lov</Label>
              <Button type="button" variant="ghost" size="sm" onClick={fillFull}>
                To'liq ({formatSom(remaining)})
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Summa (so'm)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100000"
                />
              </div>
              <div>
                <Label>Usul</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentMethodLabels).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Izoh (ixtiyoriy)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Masalan: oldindan to'lov" />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-1" /> To'lovni saqlash
            </Button>
          </form>
        )}

        <div className="space-y-2 mt-2">
          <Label className="text-base font-semibold">To'lovlar tarixi</Label>
          {(order.payments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Hali to'lov yo'q</p>
          ) : (
            <ul className="space-y-2">
              {[...(order.payments ?? [])]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{formatSom(p.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {paymentMethodLabels[p.method]} · {formatDateTime(p.date)}
                      </div>
                      {p.note && <div className="text-xs text-muted-foreground italic mt-0.5">"{p.note}"</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => onRemovePayment(order.id, p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
