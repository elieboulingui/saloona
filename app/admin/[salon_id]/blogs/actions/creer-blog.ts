'use server';

import { prisma } from "@/utils/prisma";

interface CreateBlogData {
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  image: string;
  categoryId: string;
  organizationId?: string; // salonId
}

export async function creerBlog(data: CreateBlogData) {
  const {
    title,
    excerpt,
    content,
    date,
    readingTime,
    image,
    categoryId,
    organizationId,
  } = data;

  if (!organizationId) {
    throw new Error("organizationId est requis");
  }

  try {
    const newBlog = await prisma.blog.create({
      data: {
        title,
        excerpt,
        content,
        date: new Date(date),
        readingTime,
        image,
        categoryId,
        organizationId, // guaranteed to be a string
      },
    });

    return newBlog;
  } catch (error) {
    console.error("Erreur serveur (creerBlog):", error);
    throw new Error("Erreur lors de la création du blog.");
  }
}
