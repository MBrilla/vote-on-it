import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    // Get the code from the URL directly since params might be a Promise
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const code = pathSegments[pathSegments.length - 1];
    
    if (!code || code === 'undefined' || code === '[code]') {
      return NextResponse.json(
        { success: false, error: 'Poll code is required' },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { code },
      include: {
        options: {
          select: {
            id: true,
            text: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Calculate time remaining
    const endsAt = new Date(poll.ends_at);
    const now = new Date();
    const isActive = poll.is_active && endsAt > now;

    return NextResponse.json({
      success: true,
      data: {
        ...poll,
        is_active: isActive,
        ends_at: endsAt.toISOString(),
        created_at: poll.created_at.toISOString(),
        time_remaining: isActive ? Math.max(0, endsAt.getTime() - now.getTime()) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}
