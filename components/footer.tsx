import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto max-w-6xl px-4 pb-8">
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Saloona. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
              Contact
            </Link>
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
