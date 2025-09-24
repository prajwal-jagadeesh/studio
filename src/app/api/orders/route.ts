import { NextResponse } from 'next/server';
import type { Order, OrderItem } from '@/lib/data';
import { orders as initialOrders } from '@/lib/data';

// In-memory "database"
let orders: Order[] = [...initialOrders];

// GET /api/orders - Fetches all orders
export async function GET() {
  return NextResponse.json(orders);
}

// POST /api/orders - Creates a new order
export async function POST(request: Request) {
  try {
    const body: { tableId: string; tableName: string; items: OrderItem[] } = await request.json();

    if (!body.tableId || !body.tableName || !body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'Invalid order data' }, { status: 400 });
    }

    const total = body.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const newOrder: Order = {
      id: `O${orders.length + 1}`,
      tableId: body.tableId,
      tableName: body.tableName,
      items: body.items,
      total: total,
      status: 'pending',
      createdAt: new Date(),
    };

    orders.push(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
