import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Login request received');
    const body = await request.json();
    console.log('Request body:', body);
    
    const result = loginSchema.safeParse(body);
    console.log('Schema validation result:', result.success ? 'Valid' : 'Invalid');

    if (!result.success) {
      console.log('Schema validation failed:', result.error.format());
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { employeeId } = result.data;
    console.log('Processing login for employee ID:', employeeId);
    
    try {
      console.log('Calling login function for employee ID:', employeeId);
      const user = await login(employeeId);
      console.log('Login successful for user:', user.id);
      
      return NextResponse.json({ 
        success: true, 
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          role: user.role
        }
      });
    } catch (loginError) {
      console.error('Login error:', loginError);
      return NextResponse.json(
        { error: 'Authentication failed', message: loginError instanceof Error ? loginError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Request processing failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 