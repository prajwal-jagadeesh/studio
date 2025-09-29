import { LocationVerifier } from "@/components/customer/location-verifier";
import { MenuView } from "@/components/customer/menu-view";
import { getMenuItems } from "@/services/get-menu";
import { getTables } from "@/services/get-tables";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const menuItems = await getMenuItems();
  const tables = await getTables();
  
  const tableId = searchParams?.tableId as string;
  const table = tables.find(t => t.id === tableId);

  return (
    <>
      <LocationVerifier />
      <MenuView menuItems={menuItems} table={table} />
    </>
  );
}
