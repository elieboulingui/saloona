import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/utils/prisma"
import Link from "next/link"
import Image from "next/image"
import { Building2, MapPin, Users, Calendar, ShoppingBag, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateOrganizationButton } from "@/components/create-organization-button"
import { UserSheet } from "@/components/user-sheet"

export default async function AdminPage() {

    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    const userId = session.user.id

    // Récupérer les organisations dont l'utilisateur est membre
    const userOrganizations = await prisma.userOrganization.findMany({
        where: {
            userId,
        },
        include: {
            organization: {
                include: {
                    departments: {
                        include: {
                            department: true,
                        },
                    },
                    _count: {
                        select: {
                            appointments: true,
                            products: true,
                            users: true,
                        },
                    },
                },
            },
        },
    })

    if (userOrganizations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
                <div className="bg-amber-50 p-6 rounded-full mb-4">
                    <Building2 className="h-12 w-12 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Aucun salon trouvé</h1>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    Vous n'êtes membre d'aucun salon pour le moment. Veuillez contacter l'administrateur ou créer un nouveau
                    salon.
                </p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600">
                    <Link href="/register">Créer un salon</Link>
                </Button>
            </div>
        )
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
                            <h1 className="text-white font-bold text-lg">Mes Salons</h1>
                            <p className="text-white/80 text-xs">Gerer l'ensemble de vos organisations</p>
                        </div>
                    </div>
                    <UserSheet salonId={""} />
                </div>
            </header>

            <div className="container mx-auto p-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userOrganizations.map((membership) => (
                        <Link href={`/admin/${membership.organization.id}`} key={membership.organization.id}>
                            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-amber-200">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            {membership.organization.logo ? (
                                                <Image
                                                    src={membership.organization.logo || "/placeholder.svg"}
                                                    alt={membership.organization.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-amber-500" />
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                    <CardTitle className="text-xl mt-2">{membership.organization.name}</CardTitle>
                                    <CardDescription className="flex items-center text-sm">
                                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                        {membership.organization.address}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {membership.organization.departments.slice(0, 3).map((od) => (
                                            <Badge key={od.departmentId} variant="secondary" className="text-xs">
                                                {od.department.label}
                                            </Badge>
                                        ))}
                                        {membership.organization.departments.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{membership.organization.departments.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {membership.organization.description || "Aucune description disponible"}
                                    </p>
                                </CardContent>
                                <CardFooter className="border-t pt-4">
                                    <div className="w-full grid grid-cols-3 gap-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users className="h-4 w-4 text-amber-500 mb-1" />
                                            <span className="text-xs text-muted-foreground">{membership.organization._count.users} Staff</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Calendar className="h-4 w-4 text-amber-500 mb-1" />
                                            <span className="text-xs text-muted-foreground">
                                                {membership.organization._count.appointments} RDV
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <ShoppingBag className="h-4 w-4 text-amber-500 mb-1" />
                                            <span className="text-xs text-muted-foreground">
                                                {membership.organization._count.products} Produits
                                            </span>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
            <CreateOrganizationButton />

        </>
    )
}
