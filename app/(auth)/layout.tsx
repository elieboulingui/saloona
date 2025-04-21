import { auth } from "@/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import HeaderAuth from "./components/header-auth";

export const metadata: Metadata = {
  title: "Saloona Authentification",
  description: "Page d'authentification",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth()

  if (session?.user) return redirect("/admin")

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {children}
    </div>
  );
}
