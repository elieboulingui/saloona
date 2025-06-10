"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import MenuMobile from "@/components/menu-mobile-sheet"
import Link from "next/link"

export default function Header() {

    return (
        <div className="flex flex-col sticky top-0 z-40">
            {/* Header */}
            <header className="bg-white z-40 sticky top-0  py-4 px-4 md:px-4 lg:px-4 container mx-auto max-w-6xl flex items-center justify-between rounded-b-md">
                <Link href="/">
                    <Image src="/logo-black.png" alt="Saloona Logo" width={120} height={50} className="h-10 w-auto" />
                </Link>
                <div className="flex gap-3">
                    <Link href={"/connexion"}>
                        <Button variant="outline" className="hidden hover:cursor-pointer md:flex rounded-full py-4 px-6">
                            Se connecter
                        </Button>
                    </Link>
                    <Link href="/business">
                        <Button className="hidden md:flex hover:cursor-pointer bg-amber-500 hover:bg-amber-600  rounded-full py-4 px-6">
                            Je suis un professionnel
                        </Button>
                    </Link>
                    <MenuMobile />
                </div>
            </header>
        </div>
    )
}