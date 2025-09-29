import { LocationVerifier } from "@/components/customer/location-verifier";
import { MenuView } from "@/components/customer/menu-view";
import { getMenuItems } from "@/services/get-menu";

export default async function MenuPage() {
  const menuItems = await getMenuItems();
  
  return (
    <>
      <LocationVerifier />
      <MenuView menuItems={menuItems} />
    </>
  );
}
