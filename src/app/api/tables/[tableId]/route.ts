import { NextResponse } from 'next/server';
import { tables, orders } from '@/lib/data';
import type { Table } from '@/lib/data';

export async function PATCH(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  const table = tables.find(t => t.id === params.tableId);
  if (!table) {
    return NextResponse.json({ message: 'Table not found' }, { status: 404 });
  }

  const body: { status: Table['status'] } = await request.json();

  // When a table is made available, clear the order.
  if (body.status === 'available') {
      table.currentOrderId = null;
  }
  
  table.status = body.status;

  // If the order is billed, set table status to billing
  const order = orders.find(o => o.tableId === params.tableId);
  if (order && order.status === 'billed') {
    table.status = 'billing';
  }

  return NextResponse.json(table, { status: 200 });
}
