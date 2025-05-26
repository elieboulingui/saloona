'use server'

import { auth } from "@/auth"
import { prisma } from "@/utils/prisma"
import { redirect } from "next/navigation"

export async function getUserOrganizations() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  const userId = session.user.id

  const userOrganizations = await prisma.userOrganization.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          departments: {
            include: { department: true },
          },
          _count: {
            select: {
              appointments: true,
              products: true,
              users: true,
            },
          },
        },
      },
    },
  })

  return userOrganizations
}
