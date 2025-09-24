import { tables } from "@/lib/data";
import { TableGrid } from "@/components/captain/table-grid";

export default function TableManagementPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Table Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View the status of all tables at a glance.
        </p>
      </header>
      <TableGrid initialTables={tables} />
    </div>
  );
}
