import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Order, Payment, loadOrders, paidAmount, paymentStatus, remainingAmount, saveOrders, formatSom } from "@/lib/orders";
import { OrderCard } from "@/components/OrderCard";
import { NewOrderDialog } from "@/components/NewOrderDialog";
import { Toaster } from "@/components/ui/sonner";
import { Scissors, Package, Loader, CheckCircle2, AlertTriangle, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tikuvchi — Buyurtmalar boshqaruvi" },
      { name: "description", content: "Tikuvchilar uchun buyurtmalarni qabul qilish, muddatlarni kuzatish va tugatish vaqtini real-time ko'rsatuvchi platforma." },
    ],
  }),
});

function Index() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed" | "overdue">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOrders(loadOrders());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveOrders(orders);
  }, [orders, mounted]);

  const stats = useMemo(() => {
    const now = Date.now();
    const totalRevenue = orders.reduce((sum, o) => sum + paidAmount(o), 0);
    const totalOutstanding = orders.reduce((sum, o) => sum + remainingAmount(o), 0);
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      inProgress: orders.filter((o) => o.status === "in_progress").length,
      completed: orders.filter((o) => o.status === "completed").length,
      overdue: orders.filter((o) => o.status !== "completed" && new Date(o.dueDate).getTime() < now).length,
      unpaid: orders.filter((o) => paymentStatus(o) !== "paid").length,
      totalRevenue,
      totalOutstanding,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = [...orders];
    if (filter === "overdue") {
      list = list.filter((o) => o.status !== "completed" && new Date(o.dueDate).getTime() < now);
    } else if (filter !== "all") {
      list = list.filter((o) => o.status === filter);
    }
    return list.sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (b.status === "completed" && a.status !== "completed") return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [orders, filter]);

  const createOrder = (order: Order) => setOrders((prev) => [order, ...prev]);

  const updateStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              completedDate: status === "completed" ? new Date().toISOString() : undefined,
            }
          : o
      )
    );
    if (status === "completed") toast.success("Buyurtma tugatildi! 🎉");
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success("Buyurtma o'chirildi");
  };

  const addPayment = (orderId: string, payment: Payment) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, payments: [...(o.payments ?? []), payment] } : o
      )
    );
  };

  const removePayment = (orderId: string, paymentId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, payments: (o.payments ?? []).filter((p) => p.id !== paymentId) }
          : o
      )
    );
    toast.success("To'lov o'chirildi");
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="border-b bg-gradient-to-br from-card via-card to-secondary/30 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Tikuvchi Studio</h1>
              <p className="text-xs text-muted-foreground">Buyurtmalar boshqaruvi</p>
            </div>
          </div>
          <NewOrderDialog onCreate={createOrder} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Har bir <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">tikilgan ko'ylak</span> — vaqtida tayyor
          </h2>
          <p className="mt-3 text-muted-foreground">
            Buyurtmalarni qabul qiling, muddatlarni kuzating va tugatishgacha qancha vaqt qolganini real vaqtda ko'ring.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard icon={Package} label="Jami" value={stats.total} active={filter === "all"} onClick={() => setFilter("all")} />
          <StatCard icon={Package} label="Kutilmoqda" value={stats.pending} active={filter === "pending"} onClick={() => setFilter("pending")} />
          <StatCard icon={Loader} label="Jarayonda" value={stats.inProgress} active={filter === "in_progress"} onClick={() => setFilter("in_progress")} />
          <StatCard icon={CheckCircle2} label="Tugagan" value={stats.completed} active={filter === "completed"} onClick={() => setFilter("completed")} variant="success" />
          <StatCard icon={AlertTriangle} label="Kechikdi" value={stats.overdue} active={filter === "overdue"} onClick={() => setFilter("overdue")} variant="destructive" />
        </section>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Scissors className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-1">Buyurtmalar yo'q</h3>
            <p className="text-muted-foreground text-sm">
              {filter === "all" ? "Birinchi buyurtmangizni qo'shing" : "Bu bo'limda buyurtma topilmadi"}
            </p>
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} onDelete={deleteOrder} />
            ))}
          </section>
        )}
      </main>

      <footer className="border-t mt-16 py-6 text-center text-sm text-muted-foreground">
        Tikuvchi Studio · Hunarmandlar uchun zamonaviy yechim
      </footer>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  active,
  onClick,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "success" | "destructive";
}) {
  const variantClasses = {
    default: active ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-elegant" : "bg-card hover:bg-secondary",
    success: active ? "bg-success text-success-foreground shadow-elegant" : "bg-card hover:bg-success/10",
    destructive: active ? "bg-destructive text-destructive-foreground shadow-elegant" : "bg-card hover:bg-destructive/10",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${variantClasses[variant]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 opacity-70" />
        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </button>
  );
}
