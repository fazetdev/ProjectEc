import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
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
    const products = await sql`
      SELECT * FROM products WHERE id = ${parseInt(saleData.productId)}
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];

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
    await sql`
      UPDATE products 
      SET 
        "stockCount" = ${newStockCount},
        "totalSales" = ${newTotalSales},
        "actualProfit" = ${newActualProfit},
        "lastSaleDate" = CURRENT_TIMESTAMP,
        "lastSalePrice" = ${saleData.salePrice},
        "isSold" = ${newStockCount === 0},
        "dateSold" = ${newStockCount === 0 ? new Date() : product.dateSold}
      WHERE id = ${parseInt(saleData.productId)}
    `;

    // Create sales table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        "productId" INTEGER,
        "productName" TEXT,
        "salePrice" DECIMAL(12,2),
        "costPrice" DECIMAL(12,2),
        "profit" DECIMAL(12,2),
        "quantity" INTEGER DEFAULT 1,
        "saleDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "timestamp" BIGINT
      )
    `;

    // Create sales record
    await sql`
      INSERT INTO sales (
        "productId", "productName", "salePrice", "costPrice", "profit", "quantity", "timestamp"
      ) VALUES (
        ${parseInt(saleData.productId)},
        ${product.name},
        ${saleData.salePrice},
        ${product.price},
        ${profitThisSale},
        1,
        ${Date.now()}
      )
    `;

    // Return success
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
