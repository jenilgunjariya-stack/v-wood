import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

// Default products if no data file exists yet
const DEFAULT_PRODUCTS = [
  {
    id: "minimalist-horizon-oak",
    name: "Minimalist Horizon",
    price: 8999,
    description: "A sleek, wood-crafted wall clock that brings a touch of nature and simplicity to any modern living space.",
    style: "Minimalist",
    category: "Wall Clock",
    imageUrl: "https://picsum.photos/seed/clock1/600/600",
    specifications: ["Diameter: 12 inches", "Material: Oak Wood", "Movement: Silent Quartz", "Weight: 1.2 lbs"],
    stock: 15,
    shape: "Round",
    color: "Oak"
  },
  {
    id: "mid-century-solaris-flare",
    name: "Solaris Flare",
    price: 18500,
    description: "Inspired by the mid-century modern aesthetic, the Solaris Flare features a stunning sunburst design with brass accents.",
    style: "Mid-Century",
    category: "Wall Clock",
    imageUrl: "https://picsum.photos/seed/clock2/600/600",
    specifications: ["Diameter: 24 inches", "Material: Brass & Walnut", "Movement: Precision Quartz", "Weight: 3.5 lbs"],
    stock: 8,
    shape: "Round",
    color: "Walnut",
    discountPrice: 15999
  },
  {
    id: "industrial-iron-foundry",
    name: "Iron Foundry",
    price: 14200,
    description: "A bold industrial piece with exposed gears and a rugged metal finish, perfect for loft-style interiors.",
    style: "Industrial",
    category: "Wall Clock",
    imageUrl: "https://picsum.photos/seed/clock3/600/600",
    specifications: ["Diameter: 18 inches", "Material: Distressed Iron", "Movement: Mechanical Gear", "Weight: 5.0 lbs"],
    stock: 5,
    shape: "Square",
    color: "Charcoal"
  }
];

async function ensureDataFile() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // File doesn't exist, create it with defaults
      await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const products = JSON.parse(content);
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(DEFAULT_PRODUCTS);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataFile();
    const products = await request.json();
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return NextResponse.json({ success: true, count: products.length });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save products' }, { status: 500 });
  }
}
