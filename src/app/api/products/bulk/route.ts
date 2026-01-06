import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');
    const collection = db.collection('products');

    // Parse the request body
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

    // Create products - ALL GET SAME IMAGE
    const productsToInsert = [];
    
    for (const pair of bundleData.shoePairs) {
      const productName = `${bundleData.baseName} - ${pair.color}`;
      
      const productToInsert = {
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
        
        // Sales tracking
        actualProfit: 0,
        totalSales: 0,
        lastSaleDate: null,
        lastSalePrice: 0,
        
        // Categories
        genderCategory: bundleData.genderCategory || 'neutral',
        ageGroup: bundleData.ageGroup || 'adult',
        
        // Inventory
        stockCount: bundleData.stockPerItem || 1,
        originalStock: bundleData.stockPerItem || 1,
        
        // Timestamps
        dateAdded: new Date().toISOString(),
        dateSold: null,
        
        // Image - SAME FOR ALL SHOES IN BUNDLE
        imageFile: bundleData.imageFile,
      };

      productsToInsert.push(productToInsert);
    }

    // Insert all products
    const result = await collection.insertMany(productsToInsert);

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: `Created ${productsToInsert.length} products successfully`,
        count: productsToInsert.length,
        bundleId: bundleId,
        productIds: Object.values(result.insertedIds)
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Failed to create bulk products:', error);
    return NextResponse.json(
      { error: 'Failed to create bulk products' },
      { status: 500 }
    );
  }
}
