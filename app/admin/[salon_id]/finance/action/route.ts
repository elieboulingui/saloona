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

export async function createExpense({
  amount,
  description,
  category,
  date,
  organizationId,
}: CreateExpenseProps) {
  try {
    // 🔍 Récupérer le wallet lié à l'organisation
    let wallet = await prisma.wallet.findUnique({
      where: { organizationId },
    })

    // ➕ Si pas de wallet, en créer un pour cette organisation
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          organizationId,
          balance: 0,
          currency: 'XOF', // ou la devise que tu veux par défaut
        },
      })
    }

    // 💸 Créer la transaction de type EXPENSE
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

    // Optionnel : revalidation du cache si tu utilises `revalidatePath(...)`

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
