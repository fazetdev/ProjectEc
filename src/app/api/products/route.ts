import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');
    const products = await db.collection('products').find({}).toArray();
    return NextResponse.json(products);
  } catch (error) {
    console.error('DATABASE_GET_ERROR:', error);
    return NextResponse.json({
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('shoetracker');
    
    const stock = parseInt(body.stockCount) || 0;
    
    const newProduct = {
      ...body,
      price: parseFloat(body.price) || 0,
      sellingPrice: parseFloat(body.sellingPrice) || 0,
      stockCount: stock,
      originalStock: stock,
      dateAdded: new Date().toISOString(),
      totalSales: 0,
      actualProfit: 0,
      isSold: false,
      lastSaleDate: null,
      lastSalePrice: 0
    };

    const result = await db.collection('products').insertOne(newProduct);
    
    return NextResponse.json({ 
      success: true, 
      productId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error('DATABASE_POST_ERROR:', error);
    return NextResponse.json({
      error: 'Failed to add product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
