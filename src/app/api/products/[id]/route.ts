import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params

  if (!id) {
    return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('shoetracker')

    const product = await db
      .collection('products')
      .findOne({ _id: new ObjectId(id) })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
