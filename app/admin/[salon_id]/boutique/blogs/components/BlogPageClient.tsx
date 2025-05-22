"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Loader2, Calendar, Edit, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { BlogsDialog } from "./blog-dialog";
import { DeleteDialog } from "./delete-dialog";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  image: string;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

interface BlogPageClientProps {
  salonId?: string;
}

export default function BlogPageClient({ salonId }: BlogPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "Nouvelle collection printemps",
      excerpt: "Découvrez nos dernières tendances pour la saison",
      content: "Contenu détaillé de l'article sur la nouvelle collection...",
      date: "2023-03-15",
      readingTime: "3 min",
      image: "/bg-5.png",
      category: { id: "1", name: "Nouveautés" }
    },
    {
      id: 2,
      title: "Événement spécial clients fidèles",
      excerpt: "Une soirée exclusive réservée à nos meilleurs clients",
      content: "Détails sur l'événement spécial pour les clients fidèles...",
      date: "2023-04-02",
      readingTime: "4 min",
      image: "/bg-4.png",
      category: { id: "2", name: "Événements" }
    }
  ]);
  
  const categories: Category[] = [
    { id: "1", name: "Nouveautés" },
    { id: "2", name: "Événements" },
    { id: "3", name: "Interviews" },
    { id: "4", name: "Conseils" },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory ? post.category.id === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  const handleAddPost = () => {
    setSelectedPost(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDeletePost = (postId: number) => {
    setBlogPosts(blogPosts.filter(post => post.id !== postId));
    setShowDeleteDialog(false);
  };

  const handleDialogSuccess = (newPostData: any) => {
    if (dialogMode === "create") {
      const newPost: BlogPost = {
        ...newPostData,
        id: Math.max(...blogPosts.map(p => p.id), 0) + 1,
        category: categories.find(cat => cat.id === newPostData.categoryId) || categories[0]
      };
      setBlogPosts([...blogPosts, newPost]);
    } else {
      setBlogPosts(blogPosts.map(post => 
        post.id === newPostData.id ? {
          ...newPostData,
          category: categories.find(cat => cat.id === newPostData.categoryId) || post.category
        } : post
      ));
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Le Blog du Salon</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Actualités, tendances et conseils de nos experts en beauté et coiffure
        </p>
      </div>

      <div className="space-y-4">
        {/* Search and filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un article..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge
              variant="outline"
              className={`cursor-pointer whitespace-nowrap ${
                selectedCategory === null ? "bg-amber-100 text-amber-800" : ""
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              Tous les articles
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className={`cursor-pointer whitespace-nowrap ${
                  selectedCategory === category.id ? "bg-amber-100 text-amber-800" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Blog posts grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <Card className="overflow-hidden border shadow-sm h-full flex flex-col">
                    <div className="relative h-48 w-full bg-gray-100">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
                          <Calendar className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="bg-white p-1.5 rounded-full shadow-sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="h-3.5 w-3.5 text-amber-500" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="bg-white p-1.5 rounded-full shadow-sm"
                          onClick={() => {
                            setSelectedPost(post);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {post.category.name}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.readingTime}
                        </div>
                      </div>
                      <h3 className="font-medium text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-auto">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(post.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p>Aucun article trouvé</p>
            {(searchTerm || selectedCategory) && (
              <Button variant="link" className="mt-2 text-amber-500" onClick={() => {
                setSearchTerm("")
                setSelectedCategory(null)
              }}>
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Floating action button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg"
        onClick={handleAddPost}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Blog Dialog */}
      <BlogsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        post={selectedPost}
        mode={dialogMode}
        categories={categories}
        onSuccess={handleDialogSuccess}
        salonId={salonId}
      />

      {/* Delete Dialog */}
      {selectedPost && (
        <DeleteDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={async () => handleDeletePost(selectedPost.id)}
          title="Supprimer l'article"
          description="Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible."
        />
      )}
    </div>
  );
}