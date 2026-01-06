import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 GET /api/products - Attempting connection');
    const client = await clientPromise;
    console.log('✅ MongoDB client obtained');
    
    const db = client.db('shoetracker');
    console.log('✅ Database accessed');
    
    const products = await db.collection('products').find({}).toArray();
    console.log(`✅ Found ${products.length} products`);
    
    return NextResponse.json(products);
    
  } catch (error) {
    console.error('❌ GET /api/products failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error.message,
        hint: 'Check MONGODB_URI environment variable'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');
    const collection = db.collection('products');

    const productData = await request.json();

    if (!productData.name || !productData.name.trim()) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!productData.price || productData.price <= 0) {
      return NextResponse.json(
        { error: 'Valid purchase price is required' },
        { status: 400 }
      );
    }

    if (!productData.sellingPrice || productData.sellingPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid selling price is required' },
        { status: 400 }
      );
    }

    if (!productData.stockCount || productData.stockCount < 1) {
      return NextResponse.json(
        { error: 'Valid stock count is required (minimum 1)' },
        { status: 400 }
      );
    }

    const productToInsert = {
      name: productData.name.trim(),
      description: productData.description?.trim() || '',
      price: productData.price,
      sellingPrice: productData.sellingPrice,
      expectedProfit: productData.sellingPrice - productData.price,
      actualProfit: 0,
      totalSales: 0,
      lastSaleDate: null,
      lastSalePrice: 0,
      genderCategory: productData.genderCategory || 'neutral',
      ageGroup: productData.ageGroup || 'neutral',
      sizes: productData.sizes || [],
      stockCount: productData.stockCount,
      originalStock: productData.stockCount,
      isSold: false,
      dateAdded: new Date().toISOString(),
      dateSold: null,
      imageFile: productData.imageFile || '',
    };

    const result = await collection.insertOne(productToInsert);

    return NextResponse.json(
      {
        ...productToInsert,
        _id: result.insertedId
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ POST /api/products failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add product to database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
