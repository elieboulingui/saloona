"use server"
import { prisma } from "@/utils/prisma";

interface UpdateBlogInput {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  image: string;
  categoryId: string;
  organizationId: string;
}

export async function updateBlog(data: UpdateBlogInput) {
  try {
    const updated = await prisma.blog.update({
      where: { id: data.id },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        date: new Date(data.date),
        readingTime: data.readingTime,
        image: data.image,
        categoryId: data.categoryId,
        organizationId: data.organizationId,
      },
    });

    return updated;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du blog :", error);
    // Relancer l'erreur pour qu'elle soit gérée côté client
    throw new Error(
      error instanceof Error ? error.message : "Erreur inconnue lors de la mise à jour"
    );
  }
}
