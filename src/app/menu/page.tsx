import { LocationVerifier } from "@/components/customer/location-verifier";
import { MenuView } from "@/components/customer/menu-view";
import { menuItems } from "@/lib/data";

export default function MenuPage() {
  return (
    <>
      <LocationVerifier />
      <MenuView menuItems={menuItems} />
    </>
  );
}
