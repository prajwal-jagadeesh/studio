import { NextResponse } from 'next/server';
import { tables } from '@/lib/data';

// GET /api/tables - Fetches all tables
export async function GET() {
  return NextResponse.json(tables);
}
