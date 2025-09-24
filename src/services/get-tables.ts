"use server";
import { tables } from "@/lib/data";
import type { Table } from "@/lib/data";

export async function getTables(): Promise<Table[]> {
  // In a real app, you would fetch this from a database.
  // For now, we're returning the static data.
  return Promise.resolve(tables);
}
