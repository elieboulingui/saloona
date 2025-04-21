"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"

import { departments } from "@/data"
import { cn } from "@/lib/utils"

interface Department {
    id: string
    name: string
    description: string | null
    image: string | null
    organizationId: string
    departmentOrganisationId: string
}

interface DepartmentDialogProps {
    open: boolean
    onClose: () => void
    salonId: string
    existingDepartments: Department[]
}

export function DepartmentDialog({
    open,
    onClose,
    salonId,
    existingDepartments,
}: DepartmentDialogProps) {

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
    })
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])


    // Handle department selection
    const toggleDepartment = (departmentId: string) => {
        setSelectedDepartments((prev) => {
            if (prev.includes(departmentId)) {
                return prev.filter((id) => id !== departmentId)
            } else {
                return [...prev, departmentId]
            }
        })
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setLoading(true)

            const response = await fetch(`/api/organizations/${salonId}/departments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ departmentIds: selectedDepartments }),
            })

            if (!response.ok) {
                throw new Error("Erreur lors de l'ajout des départements")
            }

            const newDepartments = await response.json()

            setSelectedDepartments([])
            onClose()
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (existingDepartments && existingDepartments.length > 0) {
            const existingIds = existingDepartments.map(dep => dep.id) // ici on prend l'ID du département source
            setSelectedDepartments(existingIds)
        }
    }, [existingDepartments])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un département</DialogTitle>
                    <DialogDescription>Ajouter un nouveau département pour organiser vos services</DialogDescription>
                </DialogHeader>


                <div className="space-y-2">
                    {departments.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            {departments.map((department) => (
                                <div
                                    key={department.id}
                                    className={cn(
                                        "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                                        selectedDepartments.includes(department.id)
                                            ? "border-amber-500 bg-amber-50"
                                            : "border-gray-200 hover:border-amber-200",
                                    )}
                                    onClick={() => toggleDepartment(department.id)}
                                >
                                    <div
                                        className={cn(
                                            "w-5 h-5 rounded-full mr-2 flex items-center justify-center border-2 transition-all",
                                            selectedDepartments.includes(department.id)
                                                ? "border-amber-500 bg-amber-500"
                                                : "border-gray-300",
                                        )}
                                    >
                                        {selectedDepartments.includes(department.id) && (
                                            <Check className="h-3 w-3 text-white" />
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
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Création..." : "Ajouter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
