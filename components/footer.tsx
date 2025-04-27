import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mt-4 max-w-xs">
              Saloona est la plateforme de réservation de services de beauté et bien-être la plus populaire en Afrique.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-medium text-white mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              
              <li>
                <Link href="/business" className="text-gray-400 hover:text-white transition-colors">
                  Pour les professionnels
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog & Astuces
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-medium text-white mb-4">Domaines</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/coiffure" className="text-gray-400 hover:text-white transition-colors">
                  Coiffure
                </Link>
              </li>
              <li>
                <Link href="/services/soins" className="text-gray-400 hover:text-white transition-colors">
                  Soins esthétiques
                </Link>
              </li>
              <li>
                <Link href="/services/massage" className="text-gray-400 hover:text-white transition-colors">
                  Massage
                </Link>
              </li>
              <li>
                <Link href="/services/barbe" className="text-gray-400 hover:text-white transition-colors">
                  Barbe
                </Link>
              </li>
              <li>
                <Link href="/services/manucure" className="text-gray-400 hover:text-white transition-colors">
                  Manucure & Pédicure
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">Email:</span>
                <a href="mailto:contact@saloona.com" className="text-gray-400 hover:text-white transition-colors">
                  contact@saloona.com
                </a>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">Téléphone:</span>
                <a href="tel:+24177123456" className="text-gray-400 hover:text-white transition-colors">
                  +241 77 12 34 56
                </a>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">Adresse:</span>
                <span className="text-gray-400">Boulevard Triomphal, Immeuble Concorde, Libreville, Gabon</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Saloona. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
