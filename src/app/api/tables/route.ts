import { NextResponse } from 'next/server';
import { tables } from '@/lib/data';
import type { Table } from '@/lib/data';

// GET /api/tables - Fetches all tables
export async function GET() {
  return NextResponse.json(tables);
}

// POST /api/tables - Creates a new table
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'Table name is required' }, { status: 400 });
    }

    const newTable: Table = {
      id: `T${tables.length + 1}`,
      name,
      status: 'available',
      currentOrderId: null,
    };

    tables.push(newTable);

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error('Failed to create table:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
