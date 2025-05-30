import Header from "@/components/header"
import Link from "next/link"

export default function PrivacyPage() {
    const sections = [
        {
            title: "1. Données collectées",
            content: (
                <div className="space-y-6">
                    <p>
                        Nous collectons les données suivantes, de manière directe ou indirecte, lorsque vous utilisez l'Application
                    </p>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-800">Données fournies directement par l'utilisateur :</h3>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Nom, prénom</li>
                                <li>Adresse e-mail</li>
                                <li>Numéro de téléphone</li>
                                <li>Photo de profil (facultative)</li>
                                <li>Informations liées aux réservations (prestations choisies, salons visités, horaires, etc.)</li>
                                <li>Données de paiement (via prestataire externe sécurisé)</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Données collectées automatiquement :</h3>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Identifiants de connexion</li>
                                <li>Historique de navigation dans l'Application</li>
                                <li>Données de localisation (avec votre consentement)</li>
                                <li>Informations techniques (modèle de téléphone, version de l'OS, langue, etc.)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "2. Finalités du traitement",
            content: (
                <div className="space-y-6">
                    <p>Les données personnelles sont collectées pour les finalités suivantes</p>
                    <div className="space-y-6">
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Créer et gérer votre compte utilisateur</li>
                            <li>Permettre la réservation de prestations et la communication avec les salons partenaires</li>
                            <li>Vous envoyer des notifications et rappels de rendez-vous</li>
                            <li>Améliorer l'expérience utilisateur</li>
                            <li>Gérer les paiements sécurisés</li>
                            <li>Réaliser des statistiques d'utilisation</li>
                            <li>Respecter nos obligations légales et réglementaires</li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            title: "3. Base légale du traitement",
            content: (
                <div className="space-y-6">
                    <p>Les traitements reposent sur</p>
                    <div className="space-y-6">
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Votre consentement (ex. : géolocalisation, envoi de notifications)</li>
                            <li>L'exécution du contrat (ex. : gestion de votre compte, réservations)</li>
                            <li>L'intérêt légitime de Saloona (ex. : prévention des fraudes, amélioration des services)</li>
                            <li>Le respect d'une obligation légale (ex. : conservation des factures)</li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            title: "4. Destinataires des données",
            content: (
                <div className="space-y-4">
                    <p>Vos données sont destinées uniquement à</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>L'équipe interne de Saloona</li>
                        <li>Les salons partenaires avec lesquels vous réservez des prestations</li>
                        <li>Nos sous-traitants techniques (hébergement, paiement, envoi de notifications)</li>
                        <li>Les autorités administratives ou judiciaires, si la loi l'exige</li>
                    </ul>
                    <p>Les prestataires externes s'engagent à respecter la confidentialité et la sécurité de vos données.</p>
                </div>
            ),
        },
        {
            title: "5. Durée de conservation",
            content: (
                <div className="space-y-6">
                    <p>Les données personnelles sont conservées pour les durées suivantes</p>
                    <div className="space-y-6">
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Données de compte : 3 ans après la dernière activité</li>
                            <li>Données de réservation : 5 ans à des fins comptables</li>
                            <li>Données de paiement : conservées uniquement par notre prestataire certifié</li>
                            <li>Données de localisation : uniquement pendant l'usage actif de l'application</li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            title: "6. Sécurité des données",
            content: (
                <p>
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
                    contre tout accès non autorisé, modification, divulgation ou destruction (chiffrement, pare-feu, accès
                    restreint aux données, audits de sécurité, etc.).
                </p>
            ),
        },
        {
            title: "7. Vos droits",
            content: (
                <div className="space-y-4">
                    <p>Conformément au RGPD, vous disposez des droits suivants</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Droit d'accès à vos données</li>
                        <li>Droit de rectification</li>
                        <li>Droit à l'effacement (« droit à l'oubli »)</li>
                        <li>Droit à la limitation du traitement</li>
                        <li>Droit d'opposition</li>
                        <li>Droit à la portabilité</li>
                        <li>Droit de retirer votre consentement à tout moment</li>
                    </ul>
                    <p>
                        Vous pouvez exercer vos droits à l'adresse suivante :
                        <a href="mailto:rgpd@saloona.com" className="text-orange-500 hover:text-orange-600 ml-1 font-medium">
                            rgpd@saloona.com
                        </a>
                    </p>
                </div>
            ),
        },
        {
            title: "8. Cookies et technologies similaires",
            content: (
                <div className="space-y-4">
                    <p>
                        Nous utilisons des cookies et des technologies similaires uniquement si vous y consentez, notamment pour
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Améliorer l'expérience utilisateur</li>
                        <li>Mesurer l'audience</li>
                        <li>Assurer le fonctionnement des services</li>
                    </ul>
                    <p>Vous pouvez gérer vos préférences depuis les réglages de l'application ou de votre appareil.</p>
                </div>
            ),
        },
        {
            title: "9. Modification de la politique de confidentialité",
            content: (
                <p>
                    Saloona se réserve le droit de modifier la présente politique à tout moment. Toute modification substantielle
                    sera notifiée aux utilisateurs via l'Application ou par e-mail. L'utilisation continue des services après la
                    mise à jour vaut acceptation des nouvelles conditions.
                </p>
            ),
        },
    ]

    return (

        <div>
            <Header />

            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">

                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-amber-600 mb-4">Politique de Confidentialité</h1>
                        <p className="text-lg text-gray-600">Dernière mise à jour : 27 mai 2025</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-amber-100">
                        <p className="leading-relaxed">
                            La présente Politique de Confidentialité décrit comment Saloona, soutenu par SAMBA TECH PRO, collecte,
                            utilise, partage et protège les données personnelles de ses utilisateurs dans le cadre de l'utilisation de
                            l'application mobile et du site web associés (ci-après « l'Application »).
                        </p>
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

                    <div className="mt-12 bg-white rounded-xl shadow-md p-8 border border-amber-100">
                        <h2 className="text-2xl font-semibold text-amber-600 mb-6">Contact :</h2>
                        <p className="text-gray-700 mb-4">Pour toute question relative à la gestion de vos données personnelles</p>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="mr-3 text-orange-500">📧</span>
                                <a href="mailto:contact@saloona.com" className="text-orange-500 hover:text-orange-600 font-medium">
                                    contact@saloona.com
                                </a>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-3 text-orange-500">🏢</span>
                                <span>Libreville, avenue Ange MBA</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} Saloona. Tous droits réservés.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
