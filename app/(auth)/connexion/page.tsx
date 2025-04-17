"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, Loader } from "lucide-react"
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertDanger } from "@/components/alert-danger";

export default function Page() {

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();
    setIsLoading(true)

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setErrorMessage("Email ou mot de passe incorrect !");
      setIsLoading(false)
    }else{
      router.push("/admin/")
    }
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-semibold mb-2">Connectez à votre compte</h1>
          <p className="text-gray-600 mb-6">Bienvenue ! Veuillez vous connecter pour continuer.</p>
            {errorMessage && (
              <AlertDanger message={errorMessage}/>
             )}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  disabled={isLoading}  
                  name="email" 
                  placeholder="Votre email" 
                  required 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Mot de passe
                </label>
                <Link href="/mot-de-passe-oublie" className="text-sm text-gray-600 hover:text-gray-900">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  name="password"
                  placeholder="Mot de passe" 
                  className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 flex justify-center items-center text-black py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Connexion
              {isLoading && <Loader className="animate-spin" size={20} />}
            </button>
            
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Vous n'avez pas encore de compte ?{" "}
            <Link href="/inscription" className="text-black font-extrabold hover:underline">
              S'inscrire maintenant
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
