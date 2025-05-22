"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

// Types pour les articles et vidéos
interface BlogPost {
    id: string
    title: string
    excerpt: string
    image: string
    category: string
    readTime: string
    date: string
}

interface VideoTip {
    id: string
    title: string
    thumbnail: string
    duration: string
    category: string
}

// Données simulées
const blogPosts: BlogPost[] = [
    {
        id: "1",
        title: "Comment prendre soin de vos cheveux bouclés",
        excerpt: "Découvrez les meilleures techniques pour entretenir vos boucles naturelles...",
        image: "/placeholder.svg?height=200&width=300",
        category: "Cheveux",
        readTime: "5 min",
        date: "12 avril 2023",
    },
    {
        id: "2",
        title: "Les tendances maquillage de l'été",
        excerpt: "Les couleurs et techniques qui feront sensation cette saison...",
        image: "/placeholder.svg?height=200&width=300",
        category: "Maquillage",
        readTime: "4 min",
        date: "28 mars 2023",
    },
    {
        id: "3",
        title: "Routine de soins pour une peau éclatante",
        excerpt: "Les étapes essentielles pour une peau saine et lumineuse...",
        image: "/placeholder.svg?height=200&width=300",
        category: "Soins",
        readTime: "7 min",
        date: "15 février 2023",
    },
]

const videoTips: VideoTip[] = [
    {
        id: "1",
        title: "Comment réaliser un chignon parfait en 5 minutes",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "4:30",
        category: "Coiffure",
    },
    {
        id: "2",
        title: "Tutoriel maquillage naturel pour tous les jours",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "7:15",
        category: "Maquillage",
    },
    {
        id: "3",
        title: "Massage facial anti-âge à faire soi-même",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "5:45",
        category: "Bien-être",
    },
]

export function BlogSection() {

    return (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-amber-50 to-white">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">Astuces & Inspirations</h2>
                        <p className="text-gray-600 max-w-2xl">
                            Découvrez nos conseils beauté, tutoriels et articles pour prendre soin de vous au quotidien.
                        </p>
                    </div>
                    <Button variant="link" className="hidden md:flex items-center text-amber-600 mt-4 md:mt-0">
                        Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>


                <div className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {blogPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="overflow-hidden border-none shadow-sm h-full py-0">
                                    <div className="relative h-48">
                                        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                                        <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                                            {post.category}
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>{post.readTime} de lecture</span>
                                            <span className="mx-2">•</span>
                                            <span>{post.date}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <Button variant="link" className="flex md:hidden items-center text-amber-600 mt-6 mx-auto">
                    Voir plus <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </section>
    )
}
