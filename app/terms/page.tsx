import Link from "next/link";

export default function ConditionUtilisation() {
    const sections = [
        {
            title: "1. Objet",
            content: (
                <p>
                    Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et
                    conditions dans lesquelles les utilisateurs (ci-après « Utilisateurs ») accèdent et utilisent l'application
                    Saloona (ci-après « l'Application »), éditée par la société SAMBA TECH PRO, dont le siège social est situé à
                    Libreville à l'avenue Ange MBA, immatriculée au Registre du Commerce et des Sociétés sous le numéro [numéro].
                </p>
            ),
        },
        {
            title: "2. Acceptation des CGU",
            content: (
                <p>
                    En accédant et en utilisant l'Application, l'Utilisateur reconnaît avoir pris connaissance des présentes CGU
                    et les accepter sans réserve. Si l'Utilisateur n'accepte pas tout ou partie des CGU, il est invité à ne pas
                    utiliser l'Application.
                </p>
            ),
        },
        {
            title: "3. Description des services",
            content: (
                <>
                    <p className="mb-4">L'Application permet aux Utilisateurs de</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Rechercher des salons de beauté et de bien-être partenaires</li>
                        <li>
                            Réserver des prestations en ligne (coiffure, onglerie, soins du visage, massothérapie, maquillage,
                            épilation, etc.)
                        </li>
                        <li>Gérer leurs rendez-vous et leur historique de prestations</li>
                        <li>Recevoir des notifications et des rappels liés à leurs réservations</li>
                    </ul>
                    <p className="mt-4">
                        Les services sont fournis sous réserve de la disponibilité des professionnels partenaires et peuvent être
                        modifiés à tout moment.
                    </p>
                </>
            ),
        },
        {
            title: "4. Inscription et compte utilisateur",
            content: (
                <p>
                    Pour accéder à certaines fonctionnalités de l'Application, l'Utilisateur doit créer un compte en fournissant
                    des informations exactes, complètes et à jour. L'Utilisateur est responsable de la confidentialité de ses
                    identifiants et s'engage à informer immédiatement Saloona de toute utilisation non autorisée de son compte.
                </p>
            ),
        },
        {
            title: "5. Obligations de l'utilisateur",
            content: (
                <>
                    <p className="mb-4">L'Utilisateur s'engage à</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Utiliser l'Application conformément aux lois et règlements en vigueur</li>
                        <li>Ne pas perturber le fonctionnement de l'Application ou porter atteinte à son intégrité</li>
                        <li>Ne pas utiliser l'Application à des fins frauduleuses ou illicites</li>
                        <li>Respecter les droits des autres utilisateurs et des professionnels partenaires</li>
                    </ul>
                </>
            ),
        },
        {
            title: "6. Propriété intellectuelle",
            content: (
                <p>
                    L'ensemble des éléments composant l'Application (textes, images, logos, marques, etc.) est protégé par les
                    lois en vigueur sur la propriété intellectuelle et est la propriété exclusive de Saloona ou de ses
                    partenaires. Toute reproduction, représentation, modification ou exploitation non autorisée est strictement
                    interdite.
                </p>
            ),
        },
        {
            title: "7. Données personnelles",
            content: (
                <p>
                    Saloona s'engage à protéger les données personnelles des Utilisateurs conformément à la réglementation en
                    vigueur, notamment le Règlement Général sur la Protection des Données (RGPD). Pour plus d'informations,
                    veuillez consulter notre{" "}
                    <a href="/privacy" className="text-orange-500 hover:text-orange-600 font-medium">
                        Politique de confidentialité
                    </a>
                    .
                </p>
            ),
        },
        {
            title: "8. Responsabilité",
            content: (
                <p>
                    Saloona met tout en œuvre pour assurer le bon fonctionnement de l'Application, mais ne peut garantir une
                    disponibilité ininterrompue ou l'absence d'erreurs. Saloona ne saurait être tenue responsable des dommages
                    directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser l'Application, sauf en cas de
                    faute lourde ou intentionnelle de sa part.
                </p>
            ),
        },
        {
            title: "9. Modifications des CGU",
            content: (
                <p>
                    Saloona se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront informés de
                    toute modification par une notification au sein de l'Application. L'utilisation continue de l'application
                    après la modification des CGU vaut acceptation des nouvelles conditions.
                </p>
            ),
        },
        {
            title: "10. Loi applicable et juridiction compétente",
            content: (
                <p>
                    Les présentes CGU sont régies par le droit français. En cas de litige relatif à l'interprétation ou à
                    l'exécution des présentes CGU, les tribunaux compétents seront ceux du ressort du siège social de Saloona,
                    sauf disposition légale contraire.
                </p>
            ),
        },
        {
            title: "11. Contact",
            content: (
                <p>
                    Pour toute question relative aux présentes CGU ou à l'Application, vous pouvez contacter Saloona à l'adresse
                    suivante :{" "}
                    <a href="mailto:contact@saloona.com" className="text-orange-500 hover:text-orange-600 font-medium">
                        contact@saloona.com
                    </a>
                </p>
            ),
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                <Link href="/" className="absolute top-4 left-4 bg-amber-500 text-white font-medium px-4 py-2 rounded-full shadow-md hover:bg-amber-600 transition-colors flex items-center">
                    <span className="mr-1">←</span> Retour
                </Link>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-amber-600 mb-4">Conditions Générales d'Utilisation</h1>
                    <p className="text-lg text-gray-600">Dernière mise à jour : 27 mai 2025</p>
                </div>

                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-amber-100">
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold text-amber-600 mb-4">{section.title}</h2>
                                <div className="text-gray-700">{section.content}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">

                    <div className="mt-12 text-center">

                        <Link
                            href="/"
                            className="inline-block bg-orange-500 text-white font-medium px-8 py-3 rounded-full shadow-md hover:bg-orange-600 transition-colors">

                            <span className="mr-1">←</span> Retour à l'accueil
                        </Link>
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Saloona. Tous droits réservés.</p>
                </div>
            </div>
        </div>
    )
}
