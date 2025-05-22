"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { AlertModal } from "../components/alert-modal"
import { DepartmentDialog } from "./department-dialog"

interface Department {
  id: string
  name: string
  description: string | null
  image: string | null
  organizationId: string
  departmentOrganisationId : string
}

interface DepartmentsClientProps {
  initialDepartments: {
    id: string
    departmentId: string
    organisationId: string
    department: {
      label: string
      icon: string | null
      id: string
    }
  }[]
  salonId: string
}

export default function DepartmentsClient({ salonId, initialDepartments }: DepartmentsClientProps) {

  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Transformer initialDepartments (venant d’une relation pivot) en Department[]
  useEffect(() => {
    const transformed = initialDepartments.map((item) => ({
      id: item.department.id,
      name: item.department.label,
      description: null, // ou item.department.description si dispo
      image: null, // ou item.department.image si dispo
      organizationId: item.organisationId,
      departmentOrganisationId : item.id
    }))
    setDepartments(transformed)
    setLoading(false)
  }, [initialDepartments])

  const onDelete = async (id: string) => {

    try {

      setIsDeleting(true)

      const response = await fetch(`/api/organizations/${salonId}/departments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erreur lors de la suppression du département")

      setDepartments((prev) => prev.filter((department) => department.id !== id))
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {loading || isDeleting ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">Aucun département trouvé</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter des départements
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <Card key={department.id} className="overflow-hidden">
              {department.image && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={department.image || "/placeholder.svg"}
                    alt={department.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="flex justify-between items-center">
                <h2 className="text-md font-bold">{department.name}</h2>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(department.departmentOrganisationId)}
                  disabled={isDeleting && deleteId === department.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
           <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter des départements
            </Button>
        </div>
      )}

      <DepartmentDialog
        open={open}
        onClose={() => setOpen(false)}
        salonId={salonId}
        existingDepartments={departments}
      />

      <AlertModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && onDelete(deleteId)}
        title="Supprimer le département"
        description="Êtes-vous sûr de vouloir supprimer ce département ? Cette action est irréversible et supprimera également tous les services associés à ce département."
      />
    </div>
  )
}
