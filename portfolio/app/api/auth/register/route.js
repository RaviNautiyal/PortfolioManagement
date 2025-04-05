import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
      balance: 100000, // Starting balance of $100,000
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Special case: If this is the first user, make them an admin
    const userCount = await db.collection('users').countDocuments({});
    if (userCount === 0) {
      newUser.role = 'admin';
    }
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        ...userWithoutPassword,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 