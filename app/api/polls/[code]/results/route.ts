import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

interface Params {
  params: {
    code: string;
  };
}

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    // Get the code from the URL directly since params might be a Promise
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    // Get the code which is the segment before 'results'
    const code = pathSegments[pathSegments.length - 2];
    
    if (!code || code === 'undefined' || code === '[code]') {
      return NextResponse.json(
        { error: 'Poll code is required' },
        { status: 400 }
      );
    }

    // Get poll with vote counts
    const poll = await prisma.poll.findUnique({
      where: { code },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
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

    // Calculate total votes
    const totalVotes = poll.options.reduce(
      (sum, option) => sum + option._count.votes,
      0
    );

    // Format results
    const results = poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      votes: option._count.votes,
      percentage:
        totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        question: poll.title,
        totalVotes,
        results,
        isActive: poll.is_active && new Date(poll.ends_at) > new Date(),
      },
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch poll results' },
      { status: 500 }
    );
  }
}
