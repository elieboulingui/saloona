import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('id');

  if (!organizationId) {
    return NextResponse.json({ error: 'Missing salonId' }, { status: 400 });
  }

  try {
    const blogPosts = await prisma.blog.findMany({
      where: { organizationId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(blogPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
