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
  
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    const data = await request.json();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
