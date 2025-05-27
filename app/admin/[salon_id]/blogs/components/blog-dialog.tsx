"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Badge } from "@/components/ui/badge";

import { creerBlog } from "../actions/creer-blog";
import { updateBlog } from "../actions/updateBlog";

interface BlogPost {
  id?: string; // string pour correspondre à Prisma id
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  image: string;
  category?: { id: string; name: string };
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface BlogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | any;
  mode: "create" | "edit";
  onSuccess: (post: BlogPost) => void;
  salonId?: string;
}

export function BlogsDialog({
  isOpen,
  onClose,
  post,
  mode,
  onSuccess,
  salonId,
}: BlogDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<
    Omit<BlogPost, "category"> & { categoryId: string }
  >({
    title: "",
    excerpt: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    readingTime: "3 min",
    image: "",
    categoryId: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    if (!salonId) return;

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await fetch(`/api/categories?id=${salonId}`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [salonId]);

  // Set formData when opening dialog or when categories are loaded
  useEffect(() => {
    if (post && mode === "edit") {
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        readingTime: post.readingTime,
        image: post.image,
        categoryId: post.category?.id || categories[0]?.id || "",
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        title: "",
        excerpt: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        readingTime: "3 min",
        image: "",
        categoryId: categories[0]?.id || "",
      }));
    }
  }, [post, mode, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.title || !formData.excerpt || !formData.categoryId) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      if (!salonId) {
        throw new Error("Salon non spécifié");
      }

      const postData = {
        ...formData,
        organizationId: salonId,
      };

      let result;

      if (mode === "create") {
        // Création
        result = await creerBlog(postData);
      } else {
        // Modification
        if (!post?.id) {
          throw new Error("ID de l'article manquant pour la modification");
        }
        result = await updateBlog({
          id: post.id,
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          date: postData.date,
          readingTime: postData.readingTime,
          image: postData.image,
          categoryId: postData.categoryId,
          organizationId: postData.organizationId,
        });
      }

      onSuccess(result as any);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const isFormDisabled = isLoading || isUploading || isCategoriesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouvel article" : "Modifier l'article"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre de l'article"
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="readingTime">Temps de lecture</Label>
              <Input
                id="readingTime"
                name="readingTime"
                value={formData.readingTime}
                onChange={handleChange}
                placeholder="Ex: 3 min"
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Résumé *</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Résumé court de l'article"
              rows={2}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Contenu détaillé de l'article"
              rows={5}
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Catégorie *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={handleCategoryChange}
              disabled={isFormDisabled}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isCategoriesLoading
                      ? "Chargement..."
                      : "Sélectionner une catégorie"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image de l'article</Label>
            <ImageUpload
              value={formData.image}
              onChange={handleImageChange}
              disabled={isFormDisabled}
              onLoading={setIsUploading}
            />
            {formData.image && (
              <div className="mt-2">
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Clock className="h-3 w-3" />
                  <span>L'image sera visible sur la carte de l'article</span>
                </Badge>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isFormDisabled}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600"
              disabled={isFormDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : mode === "create" ? (
                "Publier"
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
