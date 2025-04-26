import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth.config'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    // Clean up database records if needed
    if (session?.user?.id) {
      await prisma.session.deleteMany({
        where: {
          userId: session.user.id
        }
      })
      
     
    }

    // Clear the auth cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': `next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
        },
      }
    )

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    )
  }
}