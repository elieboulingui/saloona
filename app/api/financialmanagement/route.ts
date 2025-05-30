import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, FinanceTransactionType } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Extraire organizationId des query params
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing organizationId parameter' },
        { status: 400 }
      )
    }

    // Récupérer le wallet lié à l'organisation avec ses transactions (revenus et dépenses)
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

    if (!walletWithTransactions) {
      return NextResponse.json(
        { error: 'Wallet not found for this organization' },
        { status: 404 }
      )
    }

    // Extraire les transactions financières
    const financeTransactions = walletWithTransactions.transaction
  console.log(financeTransactions)
    return NextResponse.json(financeTransactions)
  } catch (error) {
    console.error('Error fetching finance transactions:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
