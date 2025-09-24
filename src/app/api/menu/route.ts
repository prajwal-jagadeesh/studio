import { NextResponse } from 'next/server';
import { menuItems } from '@/lib/data';
import type { MenuItem } from '@/lib/data';

// GET /api/menu - Fetches all menu items
export async function GET() {
  return NextResponse.json(menuItems);
}

// POST /api/menu - Creates a new menu item
export async function POST(request: Request) {
  try {
    const newItemData: Omit<MenuItem, 'id' | 'imageUrl' | 'imageHint'> = await request.json();

    if (!newItemData.name || !newItemData.description || !newItemData.price || !newItemData.category) {
      return NextResponse.json({ message: 'Invalid menu item data' }, { status: 400 });
    }

    const newMenuItem: MenuItem = {
      id: `M${menuItems.length + 1}`,
      ...newItemData,
      // Provide default placeholder images for new items
      imageUrl: 'https://picsum.photos/seed/new/600/400',
      imageHint: 'new dish',
    };

    menuItems.push(newMenuItem);

    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu item:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
