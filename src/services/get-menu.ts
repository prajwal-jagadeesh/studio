"use server";
import { menuItems } from "@/lib/data";
import type { MenuItem } from "@/lib/data";

export async function getMenuItems(): Promise<MenuItem[]> {
  // In a real app, you would fetch this from a database.
  // For now, we're returning the static data.
  return Promise.resolve(menuItems);
}
