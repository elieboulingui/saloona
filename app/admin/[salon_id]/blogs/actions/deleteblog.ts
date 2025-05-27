"use server";

import { prisma } from "@/utils/prisma";

export async function supprimerBlog(postId: string) {
  try {
    await prisma.blog.delete({
      where: { id: postId },
    });
  } catch (error) {
    console.error("Erreur serveur (supprimerBlog):", error);
    throw new Error("Erreur lors de la suppression du blog.");
  }
}
