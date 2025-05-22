"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import HeaderAuth from "../components/header-auth"
import { departments } from "@/data"


// Schéma de validation pour l'étape 1 - Informations du salon
const salonInfoSchema = z.object({
  salonName: z.string().min(3, "Le nom du salon doit contenir au moins 3 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  description: z.string().optional(),
  departmentIds: z.array(z.string()).min(1, "Veuillez sélectionner au moins un département"),
})

// Schéma de validation pour l'étape 2 - Informations du propriétaire
const ownerInfoSchema = z.object({
  fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  gender: z.enum(["monsieur", "madame"], {
    required_error: "Veuillez sélectionner votre genre",
  }),
})

// Schéma de validation pour l'étape 3 - Mot de passe
const passwordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

// Type pour les données complètes
type SalonRegistrationData = z.infer<typeof salonInfoSchema> &
  z.infer<typeof ownerInfoSchema> &
  z.infer<typeof passwordSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [formData, setFormData] = useState<Partial<SalonRegistrationData>>({})
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

  // Formulaire étape 1 - Informations du salon
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isValid: isValidStep1 },
    setValue: setValueStep1,
    trigger: triggerStep1,
  } = useForm<z.infer<typeof salonInfoSchema>>({
    resolver: zodResolver(salonInfoSchema),
    mode: "onChange",
    defaultValues: {
      salonName: formData.salonName || "",
      address: formData.address || "",
      description: formData.description || "",
      departmentIds: formData.departmentIds || [],
    },
  })

  // Formulaire étape 2 - Informations du propriétaire
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2, isValid: isValidStep2 },
    setValue: setValueStep2,
  } = useForm<z.infer<typeof ownerInfoSchema>>({
    resolver: zodResolver(ownerInfoSchema),
    mode: "onChange",
    defaultValues: {
      fullName: formData.fullName || "",
      email: formData.email || "",
      phone: formData.phone || "",
      gender: formData.gender || undefined,
    },
  })

  // Formulaire étape 3 - Mot de passe
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: errorsStep3, isValid: isValidStep3 },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  })

  // Update form value when selectedDepartments changes
  useEffect(() => {
    setValueStep1("departmentIds", selectedDepartments)
    if (selectedDepartments.length > 0) {
      triggerStep1("departmentIds")
    }
  }, [selectedDepartments, setValueStep1, triggerStep1])

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

  // Gestion de l'étape 1 - Informations du salon
  const onSubmitStep1 = (data: z.infer<typeof salonInfoSchema>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(2)
  }

  // Gestion de l'étape 2 - Informations du propriétaire
  const onSubmitStep2 = (data: z.infer<typeof ownerInfoSchema>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(3)
  }

  // Gestion de l'étape 3 - Mot de passe et soumission finale
  const onSubmitStep3 = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsSubmitting(true)

      // Combiner les données des trois étapes
      const completeData = {
        ...formData,
        ...data,
        departmentIds: selectedDepartments,
      }

      // Appel API pour l'enregistrement
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Une erreur est survenue lors de l'inscription")
      }

      // Succès
      setRegistrationSuccess(true)
      toast.success("Inscription réussie!")
    } catch (error) {
      console.error("Erreur d'inscription:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const variants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  }

  // Affichage du message de succès
  if (registrationSuccess) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md overflow-hidden py-0">
            <CardHeader className="bg-amber-500 text-white text-center pb-12 relative">
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg">
                <div className="bg-green-500 rounded-full p-2">
                  <Check className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-16 pb-8 text-center">
              <CardTitle className="text-2xl mb-2">Félicitations!</CardTitle>
              <CardDescription className="text-base mb-6">
                Votre compte a été créé avec succès. Vous serez contacté par notre équipe très prochainement.
              </CardDescription>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => router.push("/")}>
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[90vh] lg:items-center items-start justify-center bg-gray-50">

      <div className="w-full max-w-md">
        <div className="flex flex-col gap-4 mb-6">
          <HeaderAuth title="Inscription" description="Enregistrer votre salon simplement"/>

          {/* Indicateur d'étapes amélioré */}
          <div className="flex items-center justify-between mb-2 px-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center z-50">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    step === stepNumber
                      ? "bg-amber-500 text-white shadow-md"
                      : step > stepNumber
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500",
                  )}
                >
                  {step > stepNumber ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                <span
                  className={cn("text-xs mt-1", step === stepNumber ? "text-amber-500 font-medium" : "text-gray-500")}
                >
                  {stepNumber === 1 ? "Salon" : stepNumber === 2 ? "Propriétaire" : "Sécurité"}
                </span>
              </div>
            ))}

            {/* Lignes de connexion entre les étapes */}
            <div className="absolute left-0 right-0 flex justify-center">
              <div className="w-2/3 flex">
                <div className={cn("h-0.5 flex-1 mb-5", step > 1 ? "bg-green-500" : "bg-gray-200")} />
                <div className={cn("h-0.5 flex-1 mb-5", step > 2 ? "bg-green-500" : "bg-gray-200")} />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4 mt-5 px-4">
                  <form id="step1-form" onSubmit={handleSubmitStep1(onSubmitStep1)}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="salonName">Nom du salon</Label>
                        <Input
                          id="salonName"
                          placeholder="Entrez le nom de votre salon"
                          {...registerStep1("salonName")}
                        />
                        {errorsStep1.salonName && (
                          <p className="text-sm text-red-500">{errorsStep1.salonName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" placeholder="Adresse complète du salon" {...registerStep1("address")} />
                        {errorsStep1.address && <p className="text-sm text-red-500">{errorsStep1.address.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Décrivez brièvement votre salon"
                          {...registerStep1("description")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="mb-2 block">Départements</Label>
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
                        {errorsStep1.departmentIds && (
                          <p className="text-sm text-red-500 mt-2">{errorsStep1.departmentIds.message}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex justify-end mt-6 px-4">
                  <Button
                    type="submit"
                    form="step1-form"
                    className="bg-amber-500 hover:bg-amber-600 text-white w-full"
                    disabled={!isValidStep1}
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4 mt-5 px-4">
                  <form id="step2-form" onSubmit={handleSubmitStep2(onSubmitStep2)}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Genre</Label>
                        <RadioGroup
                          defaultValue={formData.gender}
                          onValueChange={(value) => setValueStep2("gender", value as "monsieur" | "madame")}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monsieur" id="monsieur" />
                            <Label htmlFor="monsieur" className="cursor-pointer">
                              Monsieur
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="madame" id="madame" />
                            <Label htmlFor="madame" className="cursor-pointer">
                              Madame
                            </Label>
                          </div>
                        </RadioGroup>
                        {errorsStep2.gender && <p className="text-sm text-red-500">{errorsStep2.gender.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input id="fullName" placeholder="Votre nom et prénom" {...registerStep2("fullName")} />
                        {errorsStep2.fullName && <p className="text-sm text-red-500">{errorsStep2.fullName.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="votre@email.com" {...registerStep2("email")} />
                        {errorsStep2.email && <p className="text-sm text-red-500">{errorsStep2.email.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" placeholder="+241 XX XX XX XX" {...registerStep2("phone")} />
                        {errorsStep2.phone && <p className="text-sm text-red-500">{errorsStep2.phone.message}</p>}
                      </div>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-2 mt-6 gap-3 px-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    form="step2-form"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={!isValidStep2}
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4 mt-5 px-4">
                  <form id="step3-form" onSubmit={handleSubmitStep3(onSubmitStep3)}>
                    <div className="space-y-4">
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                        <h3 className="font-medium text-amber-800 mb-1">Sécurisez votre compte</h3>
                        <p className="text-sm text-amber-700">
                          Choisissez un mot de passe fort pour protéger votre compte. Il doit contenir au moins 8
                          caractères.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input id="password" type="password" {...registerStep3("password")} />
                        {errorsStep3.password && <p className="text-sm text-red-500">{errorsStep3.password.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input id="confirmPassword" type="password" {...registerStep3("confirmPassword")} />
                        {errorsStep3.confirmPassword && (
                          <p className="text-sm text-red-500">{errorsStep3.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-2 mt-6 gap-3 px-4">
                  <Button variant="outline"  onClick={() => setStep(2)} disabled={isSubmitting}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    form="step3-form"
                    className={cn(
                      "bg-amber-500 hover:bg-amber-600 text-white",
                      isSubmitting && "opacity-70 cursor-not-allowed",
                    )}
                    disabled={!isValidStep3 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Inscription...
                      </span>
                    ) : (
                      "S'inscrire"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
