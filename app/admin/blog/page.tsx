import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {  ArrowLeft } from "lucide-react"

import { UserSheet } from "@/components/user-sheet"

export default async function AdminBlogPage() {

    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    return (

        <>
            <header className="bg-amber-500 shadow-md">
                <div className="p-4 flex items-center justify-between container mx-auto max-w-6xl">
                    <div className="flex gap-2 items-center">
                        <Link href="/">
                            <div className="bg-black/20 p-2 rounded-full mr-3">
                                <ArrowLeft className="h-5 w-5 text-white" />
                            </div>
                        </Link>
                        <div>
                            <h1 className="text-white font-bold text-lg">Blog</h1>
                            <p className="text-white/80 text-xs">Ecrivez des articles et astuces </p>
                        </div>
                    </div>
                    <UserSheet salonId={""} />
                </div>
            </header>

        </>
    )
}
