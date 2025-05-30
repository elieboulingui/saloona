'use server'

import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'

interface CreateExpenseProps {
  amount: number
  description: string
  category: string
  date: string // Format: "YYYY-MM-DD"
  organizationId: string
}

// HTTP POST handler for the route
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { amount, description, category, date, organizationId } = body as CreateExpenseProps

    // Find or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { organizationId },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          organizationId,
          balance: 0,
          currency: 'XOF',
        },
      })
    }

    await prisma.financeTransaction.create({
      data: {
        type: 'EXPENSE',
        amount,
        description,
        category,
        date: new Date(date),
        organizationId,
        walletId: wallet.id,
      },
    })

    // Optionally revalidate path or cache here if needed

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error)
    return new Response(JSON.stringify({ success: false, error: 'Erreur serveur' }), { status: 500 })
  }
}
