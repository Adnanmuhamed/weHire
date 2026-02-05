import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/profile/resume
 * 
 * Get the current user's resume URL from their profile.
 * Protected endpoint - requires authentication.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: {
        resumeUrl: true,
      },
    });

    return NextResponse.json({
      resumeUrl: profile?.resumeUrl || null,
    });
  } catch (error) {
    console.error('Failed to fetch resume URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume URL' },
      { status: 500 }
    );
  }
}

