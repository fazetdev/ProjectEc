import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const bundleData = await request.json();

    // Validation
    if (!bundleData.baseName || !bundleData.baseName.trim()) {
      return NextResponse.json(
        { error: 'Bundle design name is required' },
        { status: 400 }
      );
    }

    if (!bundleData.price || bundleData.price <= 0) {
      return NextResponse.json(
        { error: 'Valid purchase price is required' },
        { status: 400 }
      );
    }

    if (!bundleData.sellingPrice || bundleData.sellingPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid selling price is required' },
        { status: 400 }
      );
    }

    if (!bundleData.shoePairs || !Array.isArray(bundleData.shoePairs) || bundleData.shoePairs.length === 0) {
      return NextResponse.json(
        { error: 'At least one shoe pair is required' },
        { status: 400 }
      );
    }

    if (!bundleData.imageFile) {
      return NextResponse.json(
        { error: 'Bundle image filename is required' },
        { status: 400 }
      );
    }

    // Validate each shoe pair
    for (const pair of bundleData.shoePairs) {
      if (!pair.size || !pair.color) {
        return NextResponse.json(
          { error: 'Each shoe must have both size and color' },
          { status: 400 }
        );
      }
    }

    // Generate unique bundle ID
    const bundleId = crypto.randomUUID();

    // Create all products
    for (const pair of bundleData.shoePairs) {
      const productName = `${bundleData.baseName} - ${pair.color}`;
      
      await sql`
        INSERT INTO products (
          name, description, "bundleId", "baseName", color, size,
          price, "sellingPrice", "expectedProfit",
          "genderCategory", "ageGroup", sizes, "stockCount", "originalStock", "imageFile"
        ) VALUES (
          ${productName},
          ${bundleData.description?.trim() || `${pair.color} ${bundleData.baseName}`},
          ${bundleId},
          ${bundleData.baseName.trim()},
          ${pair.color},
          ${pair.size},
          ${bundleData.price},
          ${bundleData.sellingPrice},
          ${bundleData.sellingPrice - bundleData.price},
          ${bundleData.genderCategory || 'neutral'},
          ${bundleData.ageGroup || 'adult'},
          ${[pair.size]},
          ${bundleData.stockPerItem || 1},
          ${bundleData.stockPerItem || 1},
          ${bundleData.imageFile}
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Created ${bundleData.shoePairs.length} products successfully`,
      count: bundleData.shoePairs.length,
      bundleId: bundleId,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create bulk products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create bulk products',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
