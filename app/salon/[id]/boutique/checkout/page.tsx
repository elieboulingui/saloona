"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, CreditCard, ChevronRight, Loader2, User, ShoppingBag, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProductCartStore } from "@/store/cart-store"

export default function CheckoutPage() {

  const {id} = useParams()

  const router = useRouter()
  const { items: cart, total, clearCart } = useProductCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // États du formulaire
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Validation du formulaire
  const isNameValid = firstName.trim().length >= 3
  const isPhoneValid = /^[0-9]{8,9}$/.test(phoneNumber.trim())
  const isAddressValid = address.trim().length >= 5

  const canProceedToStep2 = isNameValid && isPhoneValid && isAddressValid

  // Frais de livraison
  const deliveryFee = 2000

  // Soumettre la commande
  const handleSubmitOrder = async () => {
    if (!canProceedToStep2) return

    setIsSubmitting(true)
    setError(null)

    try {
      const orderData = {
        firstName,
        phoneNumber,
        address,
        additionalInfo,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        totalAmount: total() + deliveryFee,
        deliveryFee,
      }

      const response = await fetch(`/api/organizations/${id}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la création de la commande")
      }

        // Rediriger vers la page de confirmation avec l'ID de la commande
        clearCart()
        router.push(`/salon/${id}/boutique/confirmation/${data.data.id}`)
        
    } catch (error) {
      console.error("Erreur lors de la soumission de la commande:", error)
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue lors de la soumission de votre commande",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Si le panier est vide, rediriger vers la boutique
  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-gray-50">
        <header className="bg-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Link href={`/salon/${id}/boutique`}>
              <motion.div whileTap={{ scale: 0.9 }} className="p-2 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </motion.div>
            </Link>
            <h1 className="text-black font-bold text-xl">Paiement</h1>
          </div>
        </header>

        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Votre panier est vide</p>
            <Button
              className="bg-amber-500 hover:bg-amber-600"
              onClick={() => router.push(`/salon/${id}/boutique`)}
            >
              Retourner à la boutique
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3,
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/salon/${id}/boutique`}>
            <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">Paiement</h1>
            <p className="text-white/80 text-xs">Étape {step} sur 2</p>
          </div>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex gap-1">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 w-6 rounded-full ${s === step ? "bg-white" : s < step ? "bg-white/60" : "bg-white/30"}`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-6 max-w-lg mx-auto"
            >
              <div className="text-center mb-6">
                <div className="bg-amber-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold">Vos informations</h2>
                <p className="text-gray-500 text-sm mt-1">Entrez vos coordonnées pour la livraison</p>
              </div>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                      Nom complet
                    </label>
                    <Input
                      id="firstName"
                      placeholder="Entrez votre nom complet"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`bg-white ${!isNameValid && firstName ? "border-red-300" : ""}`}
                    />
                    {!isNameValid && firstName && (
                      <p className="text-red-500 text-xs mt-1">Le nom doit contenir au moins 3 caractères</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                      Numéro de téléphone
                    </label>
                    <Input
                      id="phoneNumber"
                      placeholder="Ex: 077123456"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`bg-white ${!isPhoneValid && phoneNumber ? "border-red-300" : ""}`}
                    />
                    {!isPhoneValid && phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">Entrez un numéro de téléphone valide (8-9 chiffres)</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Adresse de livraison
                    </label>
                    <Input
                      id="address"
                      placeholder="Entrez votre adresse complète"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`bg-white ${!isAddressValid && address ? "border-red-300" : ""}`}
                    />
                    {!isAddressValid && address && (
                      <p className="text-red-500 text-xs mt-1">L'adresse doit contenir au moins 5 caractères</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">
                      Informations complémentaires (optionnel)
                    </label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Instructions de livraison, points de repère, etc."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={3}
                      className="bg-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full bg-amber-500 hover:bg-amber-600"
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
              >
                Continuer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-6 max-w-lg mx-auto"
            >
              <div className="text-center mb-6">
                <div className="bg-amber-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold">Récapitulatif de la commande</h2>
                <p className="text-gray-500 text-sm mt-1">Vérifiez votre commande avant de confirmer</p>
              </div>

              {/* Informations personnelles */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="font-bold flex items-center">
                      <User className="h-4 w-4 mr-2 text-amber-500" />
                      Informations personnelles
                    </h3>
                    <Button variant="ghost" size="sm" className="text-amber-500 h-8 px-2" onClick={() => setStep(1)}>
                      Modifier
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Nom:</div>
                    <div className="font-medium text-right">{firstName}</div>

                    <div className="text-gray-500">Téléphone:</div>
                    <div className="font-medium text-right">{phoneNumber}</div>

                    <div className="text-gray-500">Adresse:</div>
                    <div className="font-medium text-right">{address}</div>

                    {additionalInfo && (
                      <>
                        <div className="text-gray-500">Informations:</div>
                        <div className="font-medium text-right">{additionalInfo}</div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Articles */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold flex items-center pb-2 border-b">
                    <ShoppingBag className="h-4 w-4 mr-2 text-amber-500" />
                    Articles ({cart.length})
                  </h3>

                  <div className="space-y-3 max-h-60 overflow-auto">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="bg-gray-50">
                              Qté: {item.quantity}
                            </Badge>
                            <p className="text-amber-600 font-bold text-sm">
                              {(item.price * item.quantity).toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Récapitulatif des prix */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-medium">{total().toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison:</span>
                    <span className="font-medium">{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-amber-600">{(total() + deliveryFee).toLocaleString()} FCFA</span>
                  </div>
                </CardContent>
              </Card>

              {/* Méthode de paiement */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-bold flex items-center pb-2 border-b mb-3">
                    <CreditCard className="h-4 w-4 mr-2 text-amber-500" />
                    Méthode de paiement
                  </h3>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-sm text-amber-800">
                      Le paiement se fera à la livraison (espèces ou Mobile Money)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Message d'erreur */}
              {error && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-red-800 text-sm">{error}</div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      Confirmer
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
