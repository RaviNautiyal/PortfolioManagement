import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/stocks/[stockId] - Retrieve a specific stock
export async function GET(request, { params }) {
  try {
    const stockId = params.stockId;
    const { db } = await connectToDatabase();
    
    let stock = null;
    
    // First try to find by ObjectId
    if (ObjectId.isValid(stockId)) {
      stock = await db.collection('stocks').findOne({ _id: new ObjectId(stockId) });
    }
    
    // If not found, try to find by symbol
    if (!stock) {
      stock = await db.collection('stocks').findOne({ symbol: stockId });
    }
    
    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

// PUT /api/stocks/[stockId] - Update a specific stock
export async function PUT(request, { params }) {
  try {
    const stockId = params.stockId;
    const body = await request.json();
    
    // Validate ObjectId
    if (!ObjectId.isValid(stockId)) {
      return NextResponse.json(
        { error: 'Invalid stock ID' },
        { status: 400 }
      );
    }
    
    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, ...updateData } = body;
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('stocks').updateOne(
      { _id: new ObjectId(stockId) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // Fetch the updated stock
    const updatedStock = await db.collection('stocks').findOne({ _id: new ObjectId(stockId) });
    
    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      stock: updatedStock
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

// DELETE /api/stocks/[stockId] - Delete a specific stock
export async function DELETE(request, { params }) {
  try {
    const stockId = params.stockId;
    
    // Validate ObjectId
    if (!ObjectId.isValid(stockId)) {
      return NextResponse.json(
        { error: 'Invalid stock ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if stock exists
    const stock = await db.collection('stocks').findOne({ _id: new ObjectId(stockId) });
    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }
    
    // Delete the stock
    await db.collection('stocks').deleteOne({ _id: new ObjectId(stockId) });
    
    return NextResponse.json({
      success: true,
      message: 'Stock deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      { error: 'Failed to delete stock' },
      { status: 500 }
    );
  }
} 