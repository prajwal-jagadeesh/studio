import { LocationVerifier } from "@/components/customer/location-verifier";
import { MenuView } from "@/components/customer/menu-view";
import { getMenuItems } from "@/services/get-menu";
import { getTables } from "@/services/get-tables";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QrCode } from "lucide-react";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const menuItems = await getMenuItems();
  const tables = await getTables();
  
  const tableId = searchParams?.tableId as string;
  const table = tables.find(t => t.id === tableId);

  if (!table) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <QrCode className="h-4 w-4" />
          <AlertTitle>Invalid Table QR Code</AlertTitle>
          <AlertDescription>
            The table could not be identified. Please scan a valid QR code from a table to begin your order.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <LocationVerifier />
      <MenuView menuItems={menuItems} table={table} />
    </>
  );
}
