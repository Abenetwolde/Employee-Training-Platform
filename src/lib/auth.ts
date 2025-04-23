import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign, verify } from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function createSession(userId: string) {
  try {
    console.log('Creating session for user ID:', userId);
    
    // Delete any existing sessions for this user
    console.log('Deleting existing sessions for user ID:', userId);
    await prisma.session.deleteMany({
      where: { userId }
    });
    console.log('Existing sessions deleted');

    // Create a new session
    console.log('Generating JWT token for user ID:', userId);
    const token = sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
    console.log('JWT token generated');
    
    console.log('Creating new session in database');
    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });
    console.log('Session created in database:', session.id);

    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

export async function getSession(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    
    const session = await prisma.session.findFirst({
      where: {
        token,
        userId: decoded.userId,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) return null;
    
    // Fetch user separately
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    
    return { ...session, user };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  const session = await getSession(token);
  return session?.user || null;
}

export async function login(employeeId: string) {
  try {
    console.log('Login attempt for employee ID:', employeeId);
    
    // Find user by employee ID
    let user = await prisma.user.findUnique({
      where: { employeeId }
    });
    
    console.log('User lookup result:', user ? 'User found' : 'User not found');

    // If user doesn't exist, create a new one
    if (!user) {
      console.log('Creating new user for employee ID:', employeeId);
      user = await prisma.user.create({
        data: {
          employeeId,
          name: `Employee ${employeeId}`,
          role: 'employee'
        }
      });
      console.log('New user created:', user.id);
    }

    // Create a new session
    console.log('Creating session for user:', user.id);
    const session = await createSession(user.id);
    console.log('Session created:', session.id);
    
    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    console.log('Session cookie set');

    return user;
  } catch (error) {
    console.error('Login error details:', error);
    throw new Error('Authentication failed');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (token) {
    await prisma.session.deleteMany({
      where: { token }
    });
  }
  
  cookieStore.delete('session');
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
} 