"use client"

import { use, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserDialog } from "./user-dialog"
import { Users, Loader2, Search, Plus, UserPlus, UserCog, MoreVertical, Trash2, Edit, ArrowLeft, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UsersPageClientProps {
  salonId: string
} 

export default function UsersPageClient({ salonId }: UsersPageClientProps) {

  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")

  // Récupérer les utilisateurs
  const { data: users = [], error, isLoading, mutate } = useSWR(`/api/organizations/${salonId}/users`, fetcher)

  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers =
    users &&
    users.filter(
      (user: any) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm),
    )

  // Fonction pour ouvrir le dialogue de création d'utilisateur
  const handleCreateUser = () => {
    setSelectedUser(null)
    setDialogMode("create")
    setIsDialogOpen(true)
  }

  // Fonction pour ouvrir le dialogue d'édition d'utilisateur
  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await fetch(`/api/organizations/${salonId}/users/${userId}`, {
          method: "DELETE",
        })
        mutate()
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error)
      }
    }
  }

  // Fonction pour obtenir la couleur du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200"
      case "BARBER":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "CLIENT":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur"
      case "BARBER":
        return "Coiffeur"
      case "CLIENT":
        return "Client"
      default:
        return role
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Link href={`/admin/${salonId}`}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Gestion du Staff</h1>
            <p className="text-white/80 text-xs">Gestion des comptes utilisateurs</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="bg-white/20 p-2 rounded-full text-white"
          onClick={handleCreateUser}
        >
          <UserPlus className="h-5 w-5" />
        </motion.button>
      </header>

      <main className="flex-1 p-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Recherche..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User list */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
              >
                <Loader2 className="h-8 w-8 text-amber-500" />
              </motion.div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Une erreur est survenue lors du chargement des utilisateurs
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredUsers.map((user: any, index: number) => (
                  <motion.div key={user.id} variants={itemVariants} layout exit={{ opacity: 0, y: -20 }}>
                    <Card className="border overflow-hidden">
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            
                            <div>
                              <div className="flex items-center">
                                <span className="font-bold text-sm">{user.name || "Sans nom"}</span>
                                
                                <Badge
                                  variant="outline"
                                  className={`ml-2 text-xs ${getRoleColor(user.role)}`}
                                >
                                  {getRoleLabel(user.role)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <motion.button whileTap={{ scale: 0.9 }} className="p-2 rounded-full hover:bg-gray-100">
                                  <MoreVertical className="h-5 w-5 text-gray-500" />
                                </motion.button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                               
                                <DropdownMenuItem onClick={() => router.push(`/admin/${salonId}/users/${user.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
              >
                <Users className="h-8 w-8 text-gray-400" />
              </motion.div>
              <p>Aucun utilisateur trouvé</p>
              {searchTerm && (
                <Button variant="link" className="mt-2 text-amber-500" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Floating action button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-4 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg"
          onClick={handleCreateUser}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </main>

      {/* User Dialog */}
      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={selectedUser}
        mode={dialogMode}
        salonId={salonId}
        onSuccess={() => {
          setIsDialogOpen(false)
          mutate()
        }}
      />

      {/* Style pour masquer la navigation mobile */}
      <style jsx global>{`
        nav.fixed.bottom-0 {
          display: none;
        }
      `}</style>
    </div>
  )
}
