import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');
    const collection = db.collection('products');

    const productId = params.id;
    
    // Validate ID
    if (!productId || productId === 'undefined') {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(productId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await collection.findOne({ _id: objectId });
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Don't delete if product has sales
    if (product.totalSales > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with sales history' },
        { status: 400 }
      );
    }

    // Delete the product
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      productId: productId
    });

  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
