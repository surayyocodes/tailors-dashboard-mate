export type OrderStatus = "pending" | "in_progress" | "completed";

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
}

const STORAGE_KEY = "tailor_orders_v1";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
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
