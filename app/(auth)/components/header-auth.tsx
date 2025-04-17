"use client"
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderAuthProps {
  title : string,
  description : string
}

const HeaderAuth = ({title, description} : HeaderAuthProps) => {
  return (
    <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
      <div className="flex gap-2 items-center">
        <Link href="/">
          <motion.div whileTap={{ scale: 0.9 }} className="bg-black/20 p-2 rounded-full mr-3">
            <ArrowLeft className="h-5 w-5 text-white" />
          </motion.div>
        </Link>
       <div>
       <h1 className="text-white font-bold text-lg">{title}</h1>
       <p className="text-white/80 text-xs">{description}</p>
       </div>
      </div>
    </header>
  );
}

export default HeaderAuth;