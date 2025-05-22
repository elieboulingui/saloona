"use client"


import * as React from "react"

import { Button } from "@/components/ui/button"
import { redirect, useSearchParams } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
import { AlertCircle, Eye, EyeOff, Loader } from "lucide-react"
import { useState } from "react";
import Link from "next/link";

export default function RestPassPage() {

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async () => {

    setIsLoading(true)

    try {

      const response = await fetch(`/api/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }

  }

  if (!token) {
    redirect("/")
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex justify-center items-center">
        <Card className="lg:w-[450px] w-[350px]">
          <CardHeader>
            <CardTitle>Réinitialisation</CardTitle>
            <CardDescription>Changez votre mot de passe !</CardDescription>
          </CardHeader>
          {message ? (
            <CardContent>
              <Alert className="border-green-600">
                <AlertTitle className="text-green-500">Succès</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <Link href="/connexion" className="mt-4 flex justify-center bg-black text-white w-full py-2 px-4 rounded-md">
                Retour à la connexion
              </Link>
            </CardContent>
          ) : (
            <>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid w-full items-center gap-4 mt-4">
                  <div className="flex flex-col space-y-1.5 relative">
                    <div className="flex justify-between items-center relative">
                      <Label htmlFor="password">Nouveau mot de passe</Label>
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      id="password"
                      placeholder="Mot de passe"
                    />
                    <div className="absolute top-6 right-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>

                </div>
              </CardContent>
              <CardFooter className="flex flex-col justify-between gap-5">
                <Button disabled={isLoading} onClick={handleSubmit} className="w-full bg-amber-500 text-black">
                  Confirmez le nouveau mot de passe  {isLoading && <Loader className="animate-spin" size={20} />}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
