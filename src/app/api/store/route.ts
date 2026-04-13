import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  
  if (!key || !key.match(/^[a-zA-Z0-9_-]+$/)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }
  
  const filePath = path.join(process.cwd(), 'data', `${key}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    return NextResponse.json(null); 
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  
  if (!key || !key.match(/^[a-zA-Z0-9_-]+$/)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }
  
  const filePath = path.join(process.cwd(), 'data', `${key}.json`);
  const isAppendable = ['orders', 'ratings', 'logs', 'help', 'tasks'].includes(key);

  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    let newData = await request.json();
    
    if (isAppendable && !Array.isArray(newData)) {
      // If we're sending a single item to an appendable key, handle it
      try {
        const existingRaw = await fs.readFile(filePath, 'utf-8');
        const existingData = JSON.parse(existingRaw);
        if (Array.isArray(existingData)) {
          newData = [newData, ...existingData];
        } else {
          newData = [newData];
        }
      } catch {
        newData = [newData];
      }
    } else if (isAppendable && Array.isArray(newData)) {
      // Even if sending an array, we should ideally merge with server if it's an 'add' operation.
      // But for simplicity in this file-based system, we'll trust the client if they send an array,
      // UNLESS they use a special header or param. Let's add an 'action' param.
      const action = url.searchParams.get('action');
      if (action === 'add') {
         try {
           const existingRaw = await fs.readFile(filePath, 'utf-8');
           const existingData = JSON.parse(existingRaw);
           if (Array.isArray(existingData)) {
             // Avoid duplicates by ID if possible
             const newItems = Array.isArray(newData) ? newData : [newData];
             const existingIds = new Set(existingData.map(item => item.id));
             const uniqueNew = newItems.filter(item => !existingIds.has(item.id));
             newData = [...uniqueNew, ...existingData];
           }
         } catch {
           if (!Array.isArray(newData)) newData = [newData];
         }
      }
    }
    
    await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, count: Array.isArray(newData) ? newData.length : 1 });
  } catch (err) {
    console.error(`POST /api/store?key=${key} error:`, err);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
