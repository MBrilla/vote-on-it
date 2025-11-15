import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { z } from 'zod';

const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  endsAt: z.string().datetime(),
  options: z.array(z.string().min(1, 'Option text is required')).min(2, 'At least 2 options are required').max(10, 'Maximum 10 options allowed'),
});

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    
    const result = createPollSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.format() },
        { status: 400 }
      );
    }
    
    const { title, description, endsAt, options } = result.data;

    // Generate a random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        code,
        ends_at: new Date(endsAt),
        options: {
          create: options.map(option => ({
            text: option,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...poll,
        code: poll.code, // Ensure code is included in the response
        // Convert dates to ISO string for JSON serialization
        created_at: poll.created_at.toISOString(),
        ends_at: poll.ends_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}
