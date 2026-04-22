import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Order } from "@/lib/orders";
import { toast } from "sonner";

interface Props {
  onCreate: (order: Order) => void;
}

export function NewOrderDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    garmentType: "Ko'ylak",
    notes: "",
    startDate: today,
    dueDate: defaultDue,
    price: "",
  });

  const reset = () => {
    setForm({
      customerName: "",
      phone: "",
      garmentType: "Ko'ylak",
      notes: "",
      startDate: today,
      dueDate: defaultDue,
      price: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      toast.error("Mijoz ismini kiriting");
      return;
    }
    const order: Order = {
      id: crypto.randomUUID(),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      garmentType: form.garmentType.trim(),
      notes: form.notes.trim(),
      startDate: new Date(form.startDate).toISOString(),
      dueDate: new Date(form.dueDate).toISOString(),
      status: "pending",
      price: Number(form.price) || 0,
    };
    onCreate(order);
    toast.success("Buyurtma qo'shildi!");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-elegant bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
          <Plus className="h-5 w-5 mr-2" /> Yangi buyurtma
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Yangi buyurtma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Mijoz ismi *</Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Aziza" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 123 45 67" />
            </div>
          </div>

          <div>
            <Label>Buyum turi</Label>
            <Input value={form.garmentType} onChange={(e) => setForm({ ...form, garmentType: e.target.value })} placeholder="Ko'ylak / Shim / Kostyum" />
          </div>

          <div>
            <Label>Izohlar</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="O'lchamlar, mato, dizayn..." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Boshlash sanasi</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <Label>Topshirish *</Label>
              <Input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Narx (so'm)</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="500000" />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Buyurtmani saqlash
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
