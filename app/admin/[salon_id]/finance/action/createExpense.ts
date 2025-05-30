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

export async function createExpense(data: CreateExpenseProps) {
  try {
    const { amount, description, category, date, organizationId } = data

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
    // ex: revalidatePath('/expenses')

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
