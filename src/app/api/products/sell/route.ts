import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');
    const productsCollection = db.collection('products');
    
    // Parse the request body
    const saleData = await request.json();
    
    // Validate required fields
    if (!saleData.productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (!saleData.salePrice || saleData.salePrice <= 0) {
      return NextResponse.json(
        { error: 'Valid sale price is required' },
        { status: 400 }
      );
    }
    
    // Get the product
    const product = await productsCollection.findOne({
      _id: new ObjectId(saleData.productId)
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (product.stockCount <= 0) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      );
    }
    
    // Calculate profit for this sale
    const profitThisSale = saleData.salePrice - product.price;
    const newStockCount = product.stockCount - 1;
    const newTotalSales = product.totalSales + 1;
    const newActualProfit = product.actualProfit + profitThisSale;
    
    // Update the product
    const updateResult = await productsCollection.updateOne(
      { _id: new ObjectId(saleData.productId) },
      {
        $set: {
          stockCount: newStockCount,
          totalSales: newTotalSales,
          actualProfit: newActualProfit,
          lastSaleDate: new Date().toISOString(),
          lastSalePrice: saleData.salePrice,
          isSold: newStockCount === 0, // Mark as sold if stock reaches 0
          dateSold: newStockCount === 0 ? new Date().toISOString() : product.dateSold
        }
      }
    );
    
    // Create sales record in separate collection
    const salesCollection = db.collection('sales');
    const saleRecord = {
      productId: saleData.productId,
      productName: product.name,
      salePrice: saleData.salePrice,
      costPrice: product.price,
      profit: profitThisSale,
      quantity: 1,
      saleDate: new Date().toISOString(),
      timestamp: new Date().getTime()
    };
    
    await salesCollection.insertOne(saleRecord);
    
    // Return success with updated product data
    return NextResponse.json({
      success: true,
      message: 'Sale recorded successfully',
      product: {
        ...product,
        stockCount: newStockCount,
        totalSales: newTotalSales,
        actualProfit: newActualProfit,
        lastSaleDate: new Date().toISOString(),
        lastSalePrice: saleData.salePrice
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Failed to record sale:', error);
    return NextResponse.json(
      { error: 'Failed to record sale' },
      { status: 500 }
    );
  }
}
