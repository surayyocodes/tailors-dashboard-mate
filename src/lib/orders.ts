export type OrderStatus = "pending" | "in_progress" | "completed";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type PaymentMethod = "cash" | "click" | "payme" | "uzcard" | "humo" | "transfer" | "other";

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string; // ISO
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  garmentType: string;
  notes: string;
  startDate: string; // ISO
  dueDate: string; // ISO
  completedDate?: string; // ISO
  status: OrderStatus;
  price: number;
  payments?: Payment[];
}

const STORAGE_KEY = "tailor_orders_v1";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as Order[]) : [];
    // Backward compatibility: ensure payments array exists
    return list.map((o) => ({ ...o, payments: o.payments ?? [] }));
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function timeLeft(dueDate: string, completedDate?: string) {
  const target = new Date(dueDate).getTime();
  const now = completedDate ? new Date(completedDate).getTime() : Date.now();
  const diff = target - now;
  const overdue = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((abs / (1000 * 60)) % 60);
  const seconds = Math.floor((abs / 1000) % 60);
  return { days, hours, minutes, seconds, overdue, totalMs: diff };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function paidAmount(order: Order): number {
  return (order.payments ?? []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function remainingAmount(order: Order): number {
  return Math.max(0, (order.price || 0) - paidAmount(order));
}

export function paymentStatus(order: Order): PaymentStatus {
  const paid = paidAmount(order);
  if (paid <= 0) return "unpaid";
  if (paid >= (order.price || 0)) return "paid";
  return "partial";
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Naqd",
  click: "Click",
  payme: "Payme",
  uzcard: "Uzcard",
  humo: "Humo",
  transfer: "Bank o'tkazma",
  other: "Boshqa",
};

export function formatSom(value: number): string {
  return `${(value || 0).toLocaleString("uz-UZ")} so'm`;
}
