"use client";

import { ArrowRight, ChevronRight, MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useState } from "react";
import Link from "next/link";

const MenuMobile = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden border-1 rounded-full p-5 bg-amber-500">
                    <MenuIcon className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Pour les clients</h2>
                    </div>

                    <div className="space-y-4">
                        <Link href="/connexion" className="w-full">
                            <Button variant="link" className="w-full justify-between text-purple-600">
                                Connectez-vous ou inscrivez-vous
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/aide-et-assistance" className="w-full">
                            <Button variant="link" className="w-full justify-between">
                                Aide et assistance
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>

                    </div>

                    <div className="mt-8">
                        <Link href="/business" className="w-full">
                        <Button variant="outline" className="w-full justify-between">
                            Pour les professionnels
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        </Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default MenuMobile;