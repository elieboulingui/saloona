"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { departments } from "@/data"
import { createOrganization } from "../actions/create-organization"
import { toast } from "sonner"


// Schéma de validation simplifié - seulement les informations du salon
const salonInfoSchema = z.object({
  salonName: z.string().min(3, "Le nom du salon doit contenir au moins 3 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  description: z.string().optional(),
  departmentIds: z.array(z.string()).min(1, "Veuillez sélectionner au moins un département"),
})

export default function CreateOrganisationPage() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<z.infer<typeof salonInfoSchema>>({
    resolver: zodResolver(salonInfoSchema),
    mode: "onChange",
  })

  // Handle department selection
  const toggleDepartment = (departmentId: string) => {
    const newSelectedDepartments = selectedDepartments.includes(departmentId)
      ? selectedDepartments.filter((id) => id !== departmentId)
      : [...selectedDepartments, departmentId]

    setSelectedDepartments(newSelectedDepartments)
    setValue("departmentIds", newSelectedDepartments)
    trigger("departmentIds")
  }

  const onSubmit = (data: z.infer<typeof salonInfoSchema>) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("salonName", data.salonName)
        formData.append("address", data.address)
        if (data.description) {
          formData.append("description", data.description)
        }

        // Ajouter tous les départements sélectionnés
        data.departmentIds.forEach((id) => {
          formData.append("departmentIds", id)
        })

        await createOrganization(formData)

        toast.message(
        "Votre salon a été créé et vous y avez été ajouté comme propriétaire.",
        )
      } catch (error) {
        toast.error("Une erreur est survenue lors de la création du salon.",
        )
      }
    })
  }

  return (
    <>
      <header className="bg-amber-500 shadow-md">
        <div className="p-4 flex items-center justify-between container mx-auto max-w-6xl">
          <div className="flex gap-2 items-center">
            <Link href="/admin">
              <div className="bg-black/20 p-2 rounded-full mr-3">
                <ArrowLeft className="h-5 w-5 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-white font-bold text-lg">Créer un salon</h1>
              <p className="text-white/80 text-xs">Ajoutez un nouveau salon à votre collection</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[80vh] lg:items-center items-start justify-center bg-gray-50 py-8">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-600 font-bold text-lg">1</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Informations du salon</h2>
                <p className="text-sm text-gray-500 mt-1">Renseignez les détails de votre salon</p>
              </div>

              <form id="salon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salonName">Nom du salon *</Label>
                  <Input
                    id="salonName"
                    placeholder="Entrez le nom de votre salon"
                    disabled={isPending}
                    {...register("salonName")}
                  />
                  {errors.salonName && <p className="text-sm text-red-500">{errors.salonName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    placeholder="Adresse complète du salon"
                    disabled={isPending}
                    {...register("address")}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez brièvement votre salon"
                    disabled={isPending}
                    rows={3}
                    {...register("description")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="block">Départements *</Label>
                  {departments.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {departments.map((department) => (
                        <div
                          key={department.id}
                          className={cn(
                            "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                            selectedDepartments.includes(department.id)
                              ? "border-amber-500 bg-amber-50"
                              : "border-gray-200 hover:border-amber-200",
                            isPending && "opacity-50 cursor-not-allowed",
                          )}
                          onClick={() => !isPending && toggleDepartment(department.id)}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full mr-2 flex items-center justify-center border-2 transition-all",
                              selectedDepartments.includes(department.id)
                                ? "border-amber-500 bg-amber-500"
                                : "border-gray-300",
                            )}
                          >
                            {selectedDepartments.includes(department.id) && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                          <span className="text-sm">{department.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600">
                      Aucun département disponible. Veuillez contacter l'administrateur.
                    </p>
                  )}
                  {errors.departmentIds && <p className="text-sm text-red-500 mt-2">{errors.departmentIds.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white w-full mt-6"
                  disabled={!isValid || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    "Créer le salon"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

