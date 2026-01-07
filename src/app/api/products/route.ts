import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 GET /api/products - PostgreSQL');
    
    const products = await prisma.product.findMany({
      orderBy: { dateAdded: 'desc' }
    });
    
    console.log(`✅ Found ${products.length} products`);
    
    return NextResponse.json(products);
    
  } catch (error: any) {
    console.error('DATABASE_GET_ERROR:', error);
    return NextResponse.json({
      error: 'Failed to fetch products',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
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

    const stock = parseInt(body.stockCount) || 1;
    if (stock < 1) {
      return NextResponse.json(
        { error: 'Valid stock count is required (minimum 1)' },
        { status: 400 }
      );
    }

    // Create product in PostgreSQL
    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || '',
        price: parseFloat(body.price),
        sellingPrice: parseFloat(body.sellingPrice),
        expectedProfit: parseFloat(body.sellingPrice) - parseFloat(body.price),
        genderCategory: body.genderCategory || 'neutral',
        ageGroup: body.ageGroup || 'neutral',
        sizes: body.sizes || [],
        stockCount: stock,
        originalStock: stock,
        imageFile: body.imageFile || '',
      }
    });

    console.log('✅ Product created:', product.id);
    
    return NextResponse.json({ 
      success: true, 
      productId: product.id,
      product: product
    }, { status: 201 });

  } catch (error: any) {
    console.error('DATABASE_POST_ERROR:', error);
    return NextResponse.json({
      error: 'Failed to add product',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
