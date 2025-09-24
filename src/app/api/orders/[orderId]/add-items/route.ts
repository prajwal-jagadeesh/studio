
import { NextResponse } from 'next/server';
import { orders } from '@/lib/data';
import type { OrderItem } from '@/lib/data';

// POST /api/orders/[orderId]/add-items - Adds items to an existing order
export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const itemsToAdd: OrderItem[] = await request.json();

    if (!itemsToAdd || itemsToAdd.length === 0) {
      return NextResponse.json({ message: 'No items to add' }, { status: 400 });
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const existingOrder = orders[orderIndex];
    
    // Guardrail: Prevent adding items to a finalized order
    if (existingOrder.status === 'billed' || existingOrder.status === 'closed') {
        return NextResponse.json({ message: `Cannot add items to a ${existingOrder.status} order.` }, { status: 403 });
    }

    // Add or merge new items
    itemsToAdd.forEach(newItem => {
      const existingItemIndex = existingOrder.items.findIndex(item => item.menuId === newItem.menuId);
      if (existingItemIndex > -1) {
        existingOrder.items[existingItemIndex].qty += newItem.qty;
      } else {
        existingOrder.items.push(newItem);
      }
    });

    // Recalculate total
    existingOrder.total = existingOrder.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    // Set status to pending if it was something else, to trigger KOT printing
    existingOrder.status = "pending";


    orders[orderIndex] = existingOrder;

    return NextResponse.json(existingOrder, { status: 200 });

  } catch (error) {
    console.error('Failed to add items to order:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
