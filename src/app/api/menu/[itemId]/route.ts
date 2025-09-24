import { NextResponse } from 'next/server';
import { menuItems } from '@/lib/data';
import type { MenuItem } from '@/lib/data';

// GET /api/menu/[itemId] - Fetches a single menu item
export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const item = menuItems.find(i => i.id === params.itemId);
  if (!item) {
    return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
  }
  return NextResponse.json(item);
}

// PATCH /api/menu/[itemId] - Updates a menu item
export async function PATCH(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const itemIndex = menuItems.findIndex(i => i.id === params.itemId);
  if (itemIndex === -1) {
    return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
  }

  try {
    const updates: Partial<MenuItem> = await request.json();
    
    // Merge updates, but don't allow changing the ID
    const { id, ...restOfUpdates } = updates;
    menuItems[itemIndex] = { ...menuItems[itemIndex], ...restOfUpdates };

    return NextResponse.json(menuItems[itemIndex], { status: 200 });
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/menu/[itemId] - Deletes a menu item
export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const itemIndex = menuItems.findIndex(i => i.id === params.itemId);
  if (itemIndex === -1) {
    return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
  }

  menuItems.splice(itemIndex, 1);

  return NextResponse.json({ message: 'Menu item deleted successfully' }, { status: 200 });
}
