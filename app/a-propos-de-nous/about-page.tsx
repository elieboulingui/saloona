"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Send, MapPin, Phone, Mail, Clock, Building, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici, vous pourriez ajouter la logique pour envoyer le formulaire
    console.log("Form submitted:", formData)
   
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  return (
    <div className="min-h-screen bg-background">
              {/* Navigation */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href={"/"}>
            <div className="flex items-center">
              <Image
                src="/logo-black.png"
                alt="Saloona Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            </Link>

            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#features" className="text-gray-600 hover:text-amber-500 transition-colors">
                Fonctionnalités
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-amber-500 transition-colors">
                Témoignages
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-amber-500 transition-colors">
                Tarifs
              </a>
              <a href="#faq" className="text-gray-600 hover:text-amber-500 transition-colors">
                FAQ
              </a>
              <Link href="/a-propos-de-nous" className="text-gray-600 hover:text-amber-500 transition-colors">
                Qui sommes nous ?
              </Link>

            </nav>
            <div className="flex items-center gap-3">
              <Link href="/connexion" className="hidden md:block">
                <Button variant="outline" className="ml-4 rounded-full">
                  Se connecter
                </Button>
              </Link>
              <Link href="/inscription">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full">Essayer gratuitement</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-primary/90 to-primary py-20">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <motion.h1
            className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            À propos de Saloona
          </motion.h1>
          <motion.p
            className="max-w-2xl text-lg md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Découvrez l&apos;entreprise qui révolutionne la gestion des salons de coiffure au Gabon
          </motion.p>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Samba Tech Pro</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground">
              L&apos;innovation technologique au service de la beauté
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="mb-6 text-2xl font-semibold">Notre entreprise</h3>
              <p className="mb-4">
                Samba Tech Pro est une entreprise gabonaise spécialisée dans le développement de solutions digitales
                innovantes. Notre mission est de transformer les industries traditionnelles grâce à la technologie, en
                commençant par révolutionner la gestion des salons de coiffure avec notre application Saloona.
              </p>
              <p className="mb-6">
                Fondée avec la vision de digitaliser l&apos;économie locale, nous concevons des applications web et
                mobiles, des systèmes d&apos;automatisation et des solutions d&apos;intégration adaptées aux besoins
                spécifiques du marché africain.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Forme juridique</h4>
                    <p className="text-sm text-muted-foreground">SARL</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Capital</h4>
                    <p className="text-sm text-muted-foreground">2 000 000 FCFA</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative min-h-[300px] overflow-hidden rounded-xl"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Bureaux de Samba Tech Pro"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Contactez-nous</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground">
              Vous avez des questions ou souhaitez en savoir plus sur nos services ? N&apos;hésitez pas à nous
              contacter.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">

            <motion.div
              className="order-1 md:order-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="mb-6 text-2xl font-semibold">Informations de contact</h3>

              <div className="mb-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Adresse</h4>
                    <p className="text-muted-foreground">Libreville, centre ville, non loin du consulat de France</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Téléphone</h4>
                    <p className="text-muted-foreground">+241 77 12 34 56</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-muted-foreground">contact@sambatechpro.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Heures d&apos;ouverture</h4>
                    <p className="text-muted-foreground">Lun - Ven: 8h00 - 17h00</p>
                  </div>
                </div>
              </div>

           
            </motion.div>

            <div className="h-[300px] w-full overflow-hidden rounded-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63835.97374986196!2d9.420255!3d0.390908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x107f3b91d79e5b75%3A0x4e2919f0f0faa6d0!2sLibreville%2C%20Gabon!5e0!3m2!1sfr!2sfr!4v1714499677!5m2!1sfr!2sfr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation de Samba Tech Pro"
                ></iframe>
              </div>
            
          </div>
        </div>
      </section>
    </div>
  )
}
