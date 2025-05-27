"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface NavFinanceProps {
    salonId: string
}

const NavFinance = ({ salonId }: NavFinanceProps) => {

    const pathname = usePathname()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (

        <>
            {/* Header */}
            <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <Link href={`/admin/${salonId}`}>
                        <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full">
                            <ArrowLeft className="h-5 w-5 text-white" />
                        </motion.div>
                    </Link>
                    <div>
                        <h1 className="text-white font-bold text-xl">Gestion Financière</h1>
                        <p className="text-white/80 text-xs">Gérez vos finances en toute simplicité</p>
                    </div>
                </div>
            </header>

        </>

    );
}

export default NavFinance;