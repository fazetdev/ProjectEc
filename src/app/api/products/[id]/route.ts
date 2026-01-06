import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET({ params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('shoetracker');

    const product = await db
      .collection('products')
      .findOne({ _id: new ObjectId(params.id) });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: (error as Error).message },
      { status: 500 }
    );
  }
}
