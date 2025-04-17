"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Terminal } from "lucide-react"

export default function ForgetPass() {

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const handleSubmit = async()=>{
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
    <Card className="lg:w-[450px] w-full border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl">Mot de passe oublié</CardTitle>
          <CardDescription className="text-md lg:text-xl">Vous avez oublie votre mot de passe !</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <Alert className="border-green-600">
              <Terminal className="h-4 w-4" color="#22c55e"/>
              <AlertTitle className="text-green-500 font-semibold">Succes !</AlertTitle>
              <AlertDescription>
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
           
          <div className="grid w-full items-center gap-4 mt-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name" className="text-md">Renseignez votre email</Label>
              <Input disabled={isLoading} id="name" type="email" className="py-6" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Votre email" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col justify-between gap-5">
          <Button disabled={isLoading} onClick={handleSubmit} className="w-full py-6">Reinitialiser le mot de passe</Button>
          <Link href={"/connexion"} className="text-center text-sm">Je me souviens de mon mot de passe ! <br /> <span className="text-blue-500">Connectez vous ici !</span></Link>
        </CardFooter>
      </Card>
  )
}
