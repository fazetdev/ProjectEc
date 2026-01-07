import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const products = await sql`
      SELECT *, 
        EXTRACT(DAY FROM NOW() - "dateAdded") as "daysInShop"
      FROM products 
      ORDER BY "dateAdded" DESC
    `;
    
    // Convert decimal strings to numbers
    const parsedProducts = products.map(product => ({
      ...product,
      price: parseFloat(product.price),
      sellingPrice: parseFloat(product.sellingPrice),
      expectedProfit: parseFloat(product.expectedProfit),
      actualProfit: parseFloat(product.actualProfit),
      lastSalePrice: product.lastSalePrice ? parseFloat(product.lastSalePrice) : 0,
      daysInShop: parseInt(product.daysInShop) || 0,
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
    
    // Validate required fields
    if (!body.shoeCode || !body.shoeCode.trim()) {
      return NextResponse.json(
        { error: 'Shoe Code is required (e.g., ML-SH-001)' },
        { status: 400 }
      );
    }

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!body.price || body.price <= 0) {
      return NextResponse.json(
        { error: 'Valid purchase price is required' },
        { status: 400 }
      );
    }

    if (!body.sellingPrice || body.sellingPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid selling price is required' },
        { status: 400 }
      );
    }

    // Check if shoe code already exists
    const existing = await sql`
      SELECT id FROM products WHERE shoe_code = ${body.shoeCode.trim()}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Shoe Code already exists. Use a unique code.' },
        { status: 400 }
      );
    }

    const stock = parseInt(body.stockCount) || 1;
    
    // Auto-create table if it doesn't exist with new columns
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        shoe_code VARCHAR(20) UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(12,2),
        selling_price DECIMAL(12,2),
        expected_profit DECIMAL(12,2),
        actual_profit DECIMAL(12,2) DEFAULT 0,
        total_sales INTEGER DEFAULT 0,
        last_sale_date TIMESTAMP,
        last_sale_price DECIMAL(12,2) DEFAULT 0,
        gender_category TEXT DEFAULT 'neutral',
        age_group TEXT DEFAULT 'neutral',
        sizes TEXT[],
        stock_count INTEGER,
        original_stock INTEGER,
        is_sold BOOLEAN DEFAULT false,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_sold TIMESTAMP,
        image_file TEXT,
        color TEXT,
        condition TEXT DEFAULT 'new',
        location TEXT,
        notes TEXT,
        bundle_id TEXT,
        base_name TEXT
      )
    `;

    const result = await sql`
      INSERT INTO products (
        shoe_code, name, description, price, selling_price, expected_profit, 
        stock_count, original_stock, gender_category, age_group, sizes, 
        image_file, color, condition, location, notes
      ) VALUES (
        ${body.shoeCode.trim()},
        ${body.name.trim()}, 
        ${body.description || ''}, 
        ${parseFloat(body.price)}, 
        ${parseFloat(body.sellingPrice)},
        ${parseFloat(body.sellingPrice) - parseFloat(body.price)},
        ${stock},
        ${stock},
        ${body.genderCategory || 'neutral'},
        ${body.ageGroup || 'neutral'},
        ${body.sizes || []},
        ${body.imageFile || ''},
        ${body.color || ''},
        ${body.condition || 'new'},
        ${body.location || ''},
        ${body.notes || ''}
      ) RETURNING id
    `;

    return NextResponse.json({ 
      success: true, 
      id: result[0].id,
      shoeCode: body.shoeCode.trim()
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Neon POST Error:', error);
    return NextResponse.json({ 
      error: 'Failed to add product',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
