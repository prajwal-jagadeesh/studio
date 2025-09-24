import { NextResponse } from 'next/server';
import { orders } from '@/lib/data';
import type { Order } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const order = orders.find(o => o.id === params.orderId);
  if (!order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json(order);
}


export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const order = orders.find(o => o.id === params.orderId);
  if (!order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  const body: { status: Order['status'] } = await request.json();
  order.status = body.status;

  return NextResponse.json(order, { status: 200 });
}
