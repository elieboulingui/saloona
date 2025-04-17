"use client"

import * as React from "react"

import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader, Mail, Terminal } from "lucide-react"

export default function ForgetPass() {

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await axios.post('/api/request-reset-password', { email });
      setSuccessMessage("Un email de confirmation a été envoyé.");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || "Une erreur s'est produite.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div>
            <h1 className="text-xl font-semibold mb-2">Mot de passe oublié</h1>
            <p className="text-gray-600 mb-6">Veuillez renseigner votre email , un code vous sera envoyé.</p>
          </div>
          <div>
            {successMessage && (
              <Alert className="border-green-600 mb-4">
                <Terminal className="h-4 w-4" color="#22c55e" />
                <AlertTitle className="text-green-500 font-semibold">Succes !</AlertTitle>
                <AlertDescription>
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive" className="mt-4 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading} id="email" name="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
          </div>
          <div className="flex flex-col justify-between gap-5 py-4">
          <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit} 
                className="w-full flex justify-center items-center gap-1 bg-amber-500 text-black py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Reinitialiser le mot de passe
                {isLoading && <Loader className="animate-spin" size={20} />}
              </button>
            <Link href={"/connexion"} className="text-center text-sm">Je me souviens de mon mot de passe ! <br /> <span className="text-blue-500">Connectez vous ici !</span></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
