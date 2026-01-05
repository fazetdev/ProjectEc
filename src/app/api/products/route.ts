import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');
    const products = await db.collection('products').find({}).toArray();
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');
    const collection = db.collection('products');
    
    // Parse the request body
    const productData = await request.json();
    
    // Validate required fields
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
    
    // Set default values for optional fields
    const productToInsert = {
      name: productData.name.trim(),
      description: productData.description?.trim() || '',
      price: productData.price,
      sellingPrice: productData.sellingPrice,
      expectedProfit: productData.sellingPrice - productData.price,
      actualProfit: 0, // Will update when sold
      totalSales: 0, // Track how many sold
      lastSaleDate: null, // When last sold
      lastSalePrice: 0, // Last actual sale price
      genderCategory: productData.genderCategory || 'neutral',
      ageGroup: productData.ageGroup || 'neutral',
      sizes: productData.sizes || [],
      stockCount: productData.stockCount,
      originalStock: productData.stockCount, // Keep original for tracking
      isSold: false, // Individual item sold status
      dateAdded: new Date().toISOString(),
      dateSold: null, // When fully out of stock
      imageFile: productData.imageFile || '',
    };
    
    // Insert the product
    const result = await collection.insertOne(productToInsert);
    
    // Return the created product with its ID
    return NextResponse.json(
      {
        ...productToInsert,
        _id: result.insertedId
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Failed to add product:', error);
    return NextResponse.json(
      { error: 'Failed to add product to database' },
      { status: 500 }
    );
  }
}
