import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, FinanceTransactionType } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing organizationId parameter' },
        { status: 400 }
      );
    }

    // Récupère uniquement les transactions de type "EXPENSE" (dépenses)
    const expenses = await prisma.financeTransaction.findMany({
      where: {
        organizationId,
        type: FinanceTransactionType.EXPENSE,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
