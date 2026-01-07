import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const bundleData = await request.json();

    // Validate required fields
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

    // Create products for PostgreSQL
    const productsToInsert = [];

    for (const pair of bundleData.shoePairs) {
      const productName = `${bundleData.baseName} - ${pair.color}`;

      productsToInsert.push({
        // Product identity
        name: productName,
        description: bundleData.description?.trim() || `${pair.color} ${bundleData.baseName}`,

        // Bundle grouping
        bundleId: bundleId,
        baseName: bundleData.baseName.trim(),
        color: pair.color,
        size: pair.size,

        // Pricing
        price: bundleData.price,
        sellingPrice: bundleData.sellingPrice,
        expectedProfit: bundleData.sellingPrice - bundleData.price,

        // Categories
        genderCategory: bundleData.genderCategory || 'neutral',
        ageGroup: bundleData.ageGroup || 'adult',

        // Sizes (array for Prisma)
        sizes: [pair.size],

        // Inventory
        stockCount: bundleData.stockPerItem || 1,
        originalStock: bundleData.stockPerItem || 1,

        // Image
        imageFile: bundleData.imageFile,
      });
    }

    // Insert all products in PostgreSQL
    const result = await prisma.product.createMany({
      data: productsToInsert,
    });

    console.log(`✅ Created ${result.count} bulk products`);

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: `Created ${productsToInsert.length} products successfully`,
        count: productsToInsert.length,
        bundleId: bundleId,
      },
      { status: 201 }
    );

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
