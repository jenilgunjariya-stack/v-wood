import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_FILE = path.join(process.cwd(), 'data', 'orders.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // File doesn't exist, create it as empty array
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring orders data file:', err);
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const orders = JSON.parse(content);
    return NextResponse.json(orders, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataFile();
    const newOrder = await request.json();
    
    // Read existing orders
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    let orders = JSON.parse(content);
    
    if (!Array.isArray(orders)) orders = [];
    
    // Check if it's a single order (most common case for POST /api/orders)
    // or an array of orders (rare, but handle it)
    if (Array.isArray(newOrder)) {
      // Merge unique orders by ID
      const existingIds = new Set(orders.map((o: any) => o.id));
      const uniqueNew = newOrder.filter((o: any) => !existingIds.has(o.id));
      orders = [...uniqueNew, ...orders];
    } else {
      // Single order: prevent duplicate if it somehow exists
      if (!orders.find((o: any) => o.id === newOrder.id)) {
        orders = [newOrder, ...orders];
      } else {
        // Update existing order if it's already there (e.g. status update)
        orders = orders.map((o: any) => o.id === newOrder.id ? newOrder : o);
      }
    }
    
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return NextResponse.json({ success: true, count: Array.isArray(newOrder) ? newOrder.length : 1 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save orders' }, { status: 500 });
  }
}
