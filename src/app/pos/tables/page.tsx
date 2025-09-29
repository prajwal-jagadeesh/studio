import { TableGrid } from "@/components/pos/table-grid";

export default function TableManagementPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Table Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Add, delete, and view table status. Print KOTs or bills.
        </p>
      </header>
      <TableGrid />
    </div>
  );
}
