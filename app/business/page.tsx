"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  ShoppingBag,
  Users,
  Bell,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
      <section className="relative bg-gradient-to-r from-amber-50 to-amber-100 py-10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Transformez la gestion de votre salon de coiffure
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Nous vous offrons une solution complète pour gérer vos réservations, votre boutique, votre file
                d'attente et votre équipe. Augmentez votre chiffre d'affaires et fidélisez vos clients.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white text-lg py-6 px-8 rounded-full">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="text-lg py-6 px-8 rounded-full">
                  Demander une démo
                </Button>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Essai gratuit de 14 jours, aucune carte de crédit requise</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden ">
                <Image
                  src="/saloon.png"
                  alt="Dashboard Saloona"
                  width={800}
                  height={600}
                  className="rounded-2xl"
                />

              </div>
              <div className="absolute bottom-20 -right-6 bg-white rounded-lg shadow-lg p-4 w-48">
                <div className="text-amber-500 font-bold">+32%</div>
                <div className="text-sm text-gray-600">Augmentation des réservations</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tout ce dont votre salon a besoin</h2>
            <p className="text-xl text-gray-600">
              Une plateforme complète pour gérer tous les aspects de votre salon de coiffure
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Feature 1 - Réservations */}
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Système de réservation intelligent</h3>
              <p className="text-gray-600 mb-6">
                Permettez à vos clients de réserver en ligne 24h/24, 7j/7. Réduisez les rendez-vous manqués grâce aux
                rappels automatiques.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Réservation en ligne 24/7</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Rappels automatiques par SMS</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Gestion des disponibilités</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 2 - Boutique */}
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <ShoppingBag className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Boutique en ligne intégrée</h3>
              <p className="text-gray-600 mb-6">
                Vendez vos produits en ligne et augmentez votre chiffre d'affaires. Gérez facilement votre inventaire et
                vos commandes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Catalogue de produits personnalisable</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Gestion des stocks simplifiée</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Paiements sécurisés</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 3 - File d'attente */}
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gestion de file d'attente</h3>
              <p className="text-gray-600 mb-6">
                Optimisez l'expérience client avec notre système de file d'attente virtuelle. Réduisez les temps
                d'attente et améliorez la satisfaction.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">File d'attente virtuelle</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Notifications en temps réel</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Estimation des temps d'attente</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 4 - Gestion du staff */}
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gestion d'équipe efficace</h3>
              <p className="text-gray-600 mb-6">
                Gérez facilement les plannings de votre équipe, suivez les performances et optimisez la répartition des
                tâches.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Plannings automatisés</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Suivi des performances</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Gestion des congés</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 5 - Communication */}
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Bell className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Communication client</h3>
              <p className="text-gray-600 mb-6">
                Restez en contact avec vos clients grâce à des notifications personnalisées et des campagnes marketing
                ciblées.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Notifications automatiques</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Campagnes marketing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Fidélisation client</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 6 - Analytiques */}
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-amber-600"
                >
                  <path d="M3 3v18h18"></path>
                  <path d="M18 17V9"></path>
                  <path d="M13 17V5"></path>
                  <path d="M8 17v-3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Analytiques et rapports</h3>
              <p className="text-gray-600 mb-6">
                Prenez des décisions éclairées grâce à des rapports détaillés et des analyses en temps réel de votre
                activité.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Tableaux de bord personnalisables</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Rapports financiers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Analyse des tendances</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Des résultats concrets pour votre salon
            </h2>
            <p className="text-xl text-gray-600">
              Nos clients constatent une amélioration significative de leur activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 text-center shadow-lg"
            >
              <div className="text-4xl font-bold text-amber-500 mb-2">+32%</div>
              <p className="text-gray-600">Augmentation des réservations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 text-center shadow-lg"
            >
              <div className="text-4xl font-bold text-amber-500 mb-2">-45%</div>
              <p className="text-gray-600">Réduction des rendez-vous manqués</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 text-center shadow-lg"
            >
              <div className="text-4xl font-bold text-amber-500 mb-2">+28%</div>
              <p className="text-gray-600">Augmentation du chiffre d'affaires</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 text-center shadow-lg"
            >
              <div className="text-4xl font-bold text-amber-500 mb-2">+65%</div>
              <p className="text-gray-600">Amélioration de la satisfaction client</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ce que nos clients disent</h2>
            <p className="text-xl text-gray-600">Découvrez comment Saloona a transformé l'activité de ces salons</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <Image
                    src="/placeholder.svg?height=60&width=60&text=S"
                    alt="Sophie Martin"
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sophie Martin</h4>
                  <p className="text-gray-500">Salon Élégance, Libreville</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Depuis que nous utilisons Saloona, notre nombre de réservations a augmenté de 40%. Les clients adorent
                pouvoir réserver en ligne et recevoir des rappels automatiques."
              </p>
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                ))}
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <Image
                    src="/placeholder.svg?height=60&width=60&text=J"
                    alt="Jean Dupont"
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Jean Dupont</h4>
                  <p className="text-gray-500">Afro Style, Owendo</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "La gestion de notre file d'attente est devenue un jeu d'enfant. Nos clients sont beaucoup plus
                satisfaits et nous avons pu optimiser notre temps de travail."
              </p>
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                ))}
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <Image
                    src="/placeholder.svg?height=60&width=60&text=M"
                    alt="Marie Koumba"
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Marie Koumba</h4>
                  <p className="text-gray-500">Locks & Beauty, Akanda</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Notre boutique en ligne nous a permis d'augmenter nos ventes de produits de 35%. C'est une source de
                revenus supplémentaire que nous n'avions pas exploitée avant."
              </p>
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-xl text-gray-600">Tout ce que vous devez savoir sur Saloona</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "Combien coute le logiciel?",
                answer:
                  "L'application est totalement gratuite. Nous prenons une commission de 10% sur chaque réservation et l'achat de produit effectuée via notre plateforme. Il n'y a pas de frais cachés. Ces frais sont supportes par le client pass par le salon.",
              },
              {
                question: "Est-ce que je peux supprimer mon compte à tout moment ?",
                answer:
                  "Oui, vous pouvez supprimer votre compte à tout moment. Nous ne vous demandons pas de vous engager sur une période minimale. Vous pouvez également suspendre votre compte si vous le souhaitez.",
              },
              {
                question: "Comment Saloona peut-il m'aider à augmenter mes réservations ?",
                answer:
                  "Saloona vous permet d'offrir à vos clients la possibilité de réserver en ligne 24h/24, 7j/7. Les rappels automatiques réduisent les rendez-vous manqués, et notre système de file d'attente optimise votre planning pour maximiser le nombre de clients que vous pouvez servir.",
              },
              {
                question: "Puis-je intégrer Saloona à mon site web existant ?",
                answer:
                  "Absolument ! Nous fournissons des widgets de réservation que vous pouvez facilement intégrer à votre site web existant. Vous pouvez également partager un lien direct vers votre page de réservation Saloona.",
              },
              {
                question: "Comment fonctionne la boutique en ligne ?",
                answer:
                  "La boutique en ligne vous permet de créer un catalogue de produits, de gérer votre inventaire et de vendre directement à vos clients. Vous pouvez accepter les paiements en ligne et suivre vos commandes facilement depuis le tableau de bord Saloona.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="mb-4"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 transition-colors"
                >
                  <span className="font-medium text-left text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-amber-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-6 bg-white rounded-b-lg border border-t-0 border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Prêt à transformer votre salon de coiffure ?</h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez des milliers de salons qui utilisent Saloona pour développer leur activité et améliorer
              l'expérience client.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-white text-amber-600 hover:bg-gray-100 text-lg py-6 px-8">
                  Commencer l'essai gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

            </div>
            <p className="mt-6 text-sm text-white/80">Aucune carte de crédit requise. Essai gratuit de 14 jours.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Saloona</h3>
              <p className="text-gray-400 mb-4">La solution complète pour les salons de coiffure modernes.</p>
              <div className="flex space-x-4">

                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                  </svg>
                </a>

              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Témoignages
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Guide d'utilisation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Ressources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Tutoriels
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Carrières
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Saloona. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
