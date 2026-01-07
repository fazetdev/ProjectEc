import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
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

    // Get the product from PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: saleData.productId }
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

    // Update the product in PostgreSQL
    const updatedProduct = await prisma.product.update({
      where: { id: saleData.productId },
      data: {
        stockCount: newStockCount,
        totalSales: newTotalSales,
        actualProfit: newActualProfit,
        lastSaleDate: new Date(),
        lastSalePrice: saleData.salePrice,
        isSold: newStockCount === 0, // Mark as sold if stock reaches 0
        dateSold: newStockCount === 0 ? new Date() : product.dateSold
      }
    });

    // Create sales record in PostgreSQL
    const saleRecord = await prisma.sale.create({
      data: {
        productId: saleData.productId,
        productName: product.name,
        salePrice: saleData.salePrice,
        costPrice: product.price,
        profit: profitThisSale,
        quantity: 1,
        saleDate: new Date(),
        timestamp: BigInt(Date.now())
      }
    });

    // Return success with updated product data
    return NextResponse.json({
      success: true,
      message: 'Sale recorded successfully',
      product: updatedProduct
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to record sale:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record sale',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
