import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const products = await sql`SELECT * FROM products ORDER BY "dateAdded" DESC`;
    
    // Convert decimal strings to numbers
    const parsedProducts = products.map(product => ({
      ...product,
      price: parseFloat(product.price),
      sellingPrice: parseFloat(product.sellingPrice),
      expectedProfit: parseFloat(product.expectedProfit),
      actualProfit: parseFloat(product.actualProfit),
      lastSalePrice: product.lastSalePrice ? parseFloat(product.lastSalePrice) : 0,
    }));
    
    return NextResponse.json(parsedProducts);
  } catch (error) {
    console.error('Neon GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auto-create table if it doesn't exist (First run helper)
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(12,2),
        "sellingPrice" DECIMAL(12,2),
        "expectedProfit" DECIMAL(12,2),
        "actualProfit" DECIMAL(12,2) DEFAULT 0,
        "totalSales" INTEGER DEFAULT 0,
        "lastSaleDate" TIMESTAMP,
        "lastSalePrice" DECIMAL(12,2) DEFAULT 0,
        "genderCategory" TEXT DEFAULT 'neutral',
        "ageGroup" TEXT DEFAULT 'neutral',
        sizes TEXT[],
        "stockCount" INTEGER,
        "originalStock" INTEGER,
        "isSold" BOOLEAN DEFAULT false,
        "dateAdded" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "dateSold" TIMESTAMP,
        "imageFile" TEXT,
        "bundleId" TEXT,
        "baseName" TEXT,
        "color" TEXT,
        "size" TEXT
      )
    `;

    const result = await sql`
      INSERT INTO products (
        name, description, price, "sellingPrice", "expectedProfit", "stockCount", "originalStock",
        "genderCategory", "ageGroup", sizes, "imageFile"
      ) VALUES (
        ${body.name}, 
        ${body.description || ''}, 
        ${parseFloat(body.price)}, 
        ${parseFloat(body.sellingPrice)},
        ${parseFloat(body.sellingPrice) - parseFloat(body.price)},
        ${parseInt(body.stockCount) || 1},
        ${parseInt(body.stockCount) || 1},
        ${body.genderCategory || 'neutral'},
        ${body.ageGroup || 'neutral'},
        ${body.sizes || []},
        ${body.imageFile || ''}
      ) RETURNING id
    `;

    return NextResponse.json({ 
      success: true, 
      id: result[0].id 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Neon POST Error:', error);
    return NextResponse.json({ 
      error: 'Failed to add product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
