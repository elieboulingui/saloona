import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, FinanceTransactionType } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing organizationId parameter' },
        { status: 400 }
      )
    }

    const walletWithTransactions = await prisma.wallet.findUnique({
      where: { organizationId },
      include: {
        transaction: {
          where: {
            type: {
              in: [FinanceTransactionType.REVENUE, FinanceTransactionType.EXPENSE],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // S'il n'y a pas de wallet, retourner une liste vide au lieu d'une erreur
    const financeTransactions = walletWithTransactions?.transaction ?? []

    return NextResponse.json(financeTransactions)
  } catch (error) {
    console.error('Error fetching finance transactions:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
