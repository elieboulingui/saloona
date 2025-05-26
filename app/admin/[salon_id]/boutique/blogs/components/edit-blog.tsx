"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "./delete-dialog";

interface BlogPost {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  image: string;
  category?: { id: string; name: string };
  categoryId?: string;
}

interface EditBlogProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  categories: { id: string; name: string }[];
  onSave: (post: BlogPost) => Promise<void>;
  onDelete?: (postId: number) => Promise<void>;
  salonId?: string;
}

export function EditBlog({ isOpen, onClose, post, categories, onSave, onDelete, salonId }: EditBlogProps) {
  const [formData, setFormData] = useState<Omit<BlogPost, 'category'> & { categoryId: string }>({
    title: "",
    excerpt: "",
    content: "",
    date: new Date().toISOString().split('T')[0],
    readingTime: "3 min",
    image: "",
    categoryId: categories.length > 0 ? categories[0].id : ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        readingTime: post.readingTime,
        image: post.image,
        categoryId: post.category?.id || (categories.length > 0 ? categories[0].id : "")
      });
    }
  }, [post, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoryId: value }));
  };

  const handleImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.title || !formData.excerpt || !formData.categoryId) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      const postData = {
        ...formData,
        id: post?.id,
        organizationId: salonId
      };

      await onSave(postData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post?.id || !onDelete) return;
    
    try {
      await onDelete(post.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const isFormDisabled = isLoading || isUploading;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{post ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
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
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
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

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              {post?.id && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isFormDisabled}
                  className="mr-auto"
                >
                  Supprimer
                </Button>
              )}
              
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
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {post?.id && onDelete && (
        <DeleteDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Supprimer l'article"
          description="Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible."
        />
      )}
    </>
  );
}