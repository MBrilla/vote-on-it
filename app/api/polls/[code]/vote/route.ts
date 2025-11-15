import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { z } from 'zod';
import { notifyPollUpdate } from '../../../../../app/api/sse/route';

const voteSchema = z.object({
  optionId: z.string().uuid('Invalid option ID'),
  voterId: z.string().min(1, 'Voter ID is required'),
});

export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    // Extract code from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const code = pathSegments[pathSegments.indexOf('polls') + 1];
    
    if (!code || code === 'undefined' || code === '[code]') {
      return NextResponse.json(
        { success: false, error: 'Poll code is required' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { optionId, voterId } = voteSchema.parse(body);

    // Check if poll exists and is active
    const poll = await prisma.poll.findUnique({
      where: { code },
      include: {
        options: {
          select: { id: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if poll is still active
    const endsAt = new Date(poll.ends_at);
    const now = new Date();
    if (!poll.is_active || endsAt < now) {
      return NextResponse.json(
        { success: false, error: 'This poll is no longer active' },
        { status: 400 }
      );
    }

    // Check if the option exists in this poll
    const optionExists = poll.options.some((option: { id: string }) => option.id === optionId);
    if (!optionExists) {
      return NextResponse.json(
        { success: false, error: 'Invalid option for this poll' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        poll_id: poll.id,
        voter_id: voterId,
      },
    });

    if (existingVote) {
      // Update existing vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          option_id: optionId,
          created_at: new Date(),
        },
      });
    } else {
      // Record the vote
      await prisma.vote.create({
        data: {
          poll_id: poll.id,
          option_id: optionId,
          voter_id: voterId,
        },
      });

      // Notify all connected clients
      console.log('Notifying clients about vote update for poll:', code);
      notifyPollUpdate(code);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Vote recorded successfully',
      },
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
