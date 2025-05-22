"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

export function ProCtaSection() {
    const features = [
        "Gestion des rendez-vous en ligne",
        "Gestion de votre équipe simplifiée",
        "Statistiques et rapports détaillés",
        "Point de vente intégré",
        "Gestion des clients et de leur historique",
    ]

    return (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-amber-50 to-green-50">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-medium">
                            Pour les professionnels
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold leading-tight">Développez votre activité avec Saloona</h2>
                        <p className="text-lg text-gray-600">
                            Rejoignez des milliers de professionnels qui font confiance à Saloona pour gérer leur salon de beauté.
                            Notre plateforme tout-en-un vous permet de vous concentrer sur ce que vous faites le mieux.
                        </p>

                        <ul className="space-y-3">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <div className="bg-amber-100 rounded-full p-1 mr-3">
                                        <Check className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <Link href="/business">
                                <Button className="bg-amber-500 hover:bg-amber-600 rounded-full py-6 px-8 text-base w-full sm:w-auto">
                                    Démarrer gratuitement
                                </Button>
                            </Link>
                            <Button variant="outline" className="rounded-full py-6 px-8 text-base w-full sm:w-auto">
                                Demander une démo
                            </Button>
                        </div>

                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-xl overflow-hidden">
                            <Image
                                src="/saloon.png"
                                alt="Dashboard Saloona"
                                width={800}
                                height={600}
                                className="rounded-2xl"
                            />
                        </div>

                        <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg z-20 hidden md:block">
                            <div className="flex items-center">
                                <div className="bg-green-100 rounded-full p-2 mr-3">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium">Facile à utiliser</p>
                                    <p className="text-sm text-gray-500">Prise en main en quelques minutes</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-6 -left-6 bg-amber-50 h-full w-full rounded-xl -z-10"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
