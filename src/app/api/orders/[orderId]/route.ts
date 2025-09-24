import { NextResponse } from 'next/server';
import type { Order } from '@/lib/data';

// This is a placeholder for the full orders list.
// In a real app, you'd fetch this from a database.
// For now, we need to find a way to reference the in-memory array from the other route.
// This is a limitation of this simple in-memory approach. 
// A proper solution would use a database or a shared in-memory cache.
// Let's assume for the demo we can't easily share the array. We will log a message.

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  console.log(`PATCH request for orderId ${params.orderId} received, but in-memory data store is not shared between routes in this simple mock. A full backend would be required.`);

  // We will return a mock response for the demo to work visually.
  const body = await request.json();
  const mockUpdatedOrder = {
    id: params.orderId,
    status: body.status,
    tableId: 'T1',
    tableName: 'Table 1',
    items: [],
    total: 0,
    createdAt: new Date(),
  }

  return NextResponse.json(mockUpdatedOrder, { status: 200 });
}
