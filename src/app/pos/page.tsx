import { PrintView } from "@/components/pos/print-view";
import { orders } from "@/lib/data";

export default function PrintCenterPage() {
  const ordersToPrint = orders.filter(
    (order) => order.status === "served" || order.status === "billed"
  );

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Print Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate and print KOTs and customer bills.
        </p>
      </header>
      <PrintView orders={ordersToPrint} />
    </div>
  );
}
