"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Filter, Search, X } from "lucide-react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import { useState, useMemo } from "react"

// Types pour les articles et vidéos
interface BlogPost {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  readTime: string
  date: string
  type: "article"
}

interface VideoTip {
  id: string
  title: string
  thumbnail: string
  duration: string
  category: string
  type: "video"
}

type ContentItem = BlogPost | VideoTip

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
    type: "article",
  },
  {
    id: "2",
    title: "Les tendances maquillage de l'été",
    excerpt: "Les couleurs et techniques qui feront sensation cette saison...",
    image: "/placeholder.svg?height=200&width=300",
    category: "Maquillage",
    readTime: "4 min",
    date: "28 mars 2023",
    type: "article",
  },
  {
    id: "3",
    title: "Routine de soins pour une peau éclatante",
    excerpt: "Les étapes essentielles pour une peau saine et lumineuse...",
    image: "/placeholder.svg?height=200&width=300",
    category: "Soins",
    readTime: "7 min",
    date: "15 février 2023",
    type: "article",
  },
  {
    id: "4",
    title: "Comment choisir la couleur de vos cheveux",
    excerpt: "Découvrez les tendances et conseils pour choisir la couleur de vos cheveux...",
    image: "/placeholder.svg?height=200&width=300",
    category: "Cheveux",
    readTime: "6 min",
    date: "12 avril 2023",
    type: "article",
  },
]

const videoTips: VideoTip[] = [
  {
    id: "5",
    title: "Comment réaliser un chignon parfait en 5 minutes",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "4:30",
    category: "Coiffure",
    type: "video",
  },
  {
    id: "6",
    title: "Tutoriel maquillage naturel pour tous les jours",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "7:15",
    category: "Maquillage",
    type: "video",
  },
  {
    id: "7",
    title: "Massage facial anti-âge à faire soi-même",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "5:45",
    category: "Bien-être",
    type: "video",
  },
  {
    id: "8",
    title: "Comment choisir la couleur de vos cheveux",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "6:30",
    category: "Cheveux",
    type: "video",
  },
]

export default function Blog() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Combiner tous les contenus
  const allContent: ContentItem[] = [...blogPosts, ...videoTips]

  // Obtenir toutes les catégories uniques
  const allCategories = useMemo(() => {
    const categories = new Set(allContent.map((item) => item.category))
    return Array.from(categories).sort()
  }, [])

  // Filtrer le contenu
  const filteredContent = useMemo(() => {
    return allContent.filter((item) => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(item.category)
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(item.type)
      const searchMatch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.type === "article" && (item as BlogPost).excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      return categoryMatch && typeMatch && searchMatch
    })
  }, [selectedCategories, selectedTypes, searchQuery])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedTypes([])
  }

  const renderContentCard = (item: ContentItem) => {
    if (item.type === "article") {
      const post = item as BlogPost
      return (
        <Card key={post.id} className="overflow-hidden border-none shadow-sm h-full py-0">
          <div className="relative h-48">
            <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
            <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
              {post.category}
            </div>
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Article
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
      )
    } else {
      const video = item as VideoTip
      return (
        <Card key={video.id} className="overflow-hidden border-none shadow-sm h-full py-0">
          <div className="relative h-48">
            <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
            <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
              {video.category}
            </div>
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Vidéo
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{video.duration}</span>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  return (
    <div className="">
      <Header />

      <div className="py-16 px-4 md:px-8 bg-gradient-to-br from-amber-50 to-white container mx-auto max-w-6xl">
        {/* Section des filtres et recherche */}
        <div className="mb-12">
          {/* Header avec titre et compteur */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Découvrez nos contenus</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredContent.length} résultat{filteredContent.length > 1 ? "s" : ""} trouvé
                  {filteredContent.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article ou une vidéo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Filtres élégants */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
                {(selectedCategories.length > 0 || selectedTypes.length > 0) && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    {selectedCategories.length + selectedTypes.length} filtre
                    {selectedCategories.length + selectedTypes.length > 1 ? "s" : ""} actif
                    {selectedCategories.length + selectedTypes.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {(selectedCategories.length > 0 || selectedTypes.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Effacer tout
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Filtres par type de contenu */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
                  Type de contenu
                </h3>
                <div className="flex gap-3">
                  {[
                    { key: "article", label: "Articles", icon: "📝", color: "from-amber-500 to-amber-600" },
                    { key: "video", label: "Vidéos", icon: "🎥", color: "from-amber-500 to-amber-600" },
                  ].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => toggleType(type.key)}
                      className={`group relative overflow-hidden px-2 py-2 rounded-xl border-2 transition-all duration-300 ${
                        selectedTypes.includes(type.key)
                          ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg transform scale-100`
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                        <Badge
                          variant="secondary"
                          className={`ml-2 px-2 py-0.5 text-xs ${
                            selectedTypes.includes(type.key) ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {allContent.filter((item) => item.type === type.key).length}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtres par catégorie */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  Catégories
                </h3>
                <div className="flex flex-wrap gap-3">
                  {allCategories.map((category) => {
                    const categoryIcons = {
                      Cheveux: "💇‍♀️",
                      Maquillage: "💄",
                      Soins: "✨",
                      Coiffure: "💅",
                      "Bien-être": "🧘‍♀️",
                    }

                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`group relative overflow-hidden px-2 py-2 rounded-xl border-2 transition-all duration-300 ${
                          selectedCategories.includes(category)
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg transform scale-105"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {categoryIcons[category as keyof typeof categoryIcons] || "🏷️"}
                          </span>
                          <span className="font-medium">{category}</span>
                          <Badge
                            variant="secondary"
                            className={`ml-2 px-2 py-0.5 text-xs ${
                              selectedCategories.includes(category)
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {allContent.filter((item) => item.category === category).length}
                          </Badge>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille de contenu filtré */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
          {filteredContent.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {renderContentCard(item)}
            </motion.div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun contenu trouvé</p>
              <p className="text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
            </div>
            <Button onClick={clearAllFilters} variant="outline">
              Effacer tous les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
