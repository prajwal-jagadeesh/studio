"use server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MenuItem } from "@/lib/data";

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const menuDocRef = doc(db, "menu_items", "menu_master");
    const menuDocSnap = await getDoc(menuDocRef);

    if (menuDocSnap.exists()) {
      // Assuming the document has a field 'items' which is an array of menu items.
      const data = menuDocSnap.data();
      if (data && Array.isArray(data.items)) {
        return data.items as MenuItem[];
      }
      console.warn("Menu document does not contain an 'items' array.");
      return [];
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching menu items: ", error);
    // Returning static data as a fallback in case of an error
    return [];
  }
}
