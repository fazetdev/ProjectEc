import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing product ID' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT * FROM products WHERE id = ${parseInt(id)}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Convert decimal strings to numbers
    const product = {
      ...result[0],
      price: parseFloat(result[0].price),
      sellingPrice: parseFloat(result[0].sellingPrice),
      expectedProfit: parseFloat(result[0].expectedProfit),
      actualProfit: parseFloat(result[0].actualProfit),
      lastSalePrice: result[0].lastSalePrice ? parseFloat(result[0].lastSalePrice) : 0,
    };

    return NextResponse.json(product);
    
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const result = await sql`
      SELECT id FROM products WHERE id = ${parseInt(id)}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await sql`
      DELETE FROM products WHERE id = ${parseInt(id)}
    `;

    // Also delete related sales records
    await sql`
      DELETE FROM sales WHERE "productId" = ${parseInt(id)}
    `;

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
