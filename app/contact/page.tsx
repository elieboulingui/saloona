import Link from 'next/link';
import ContactForm from "./components/ContactForm";

export default function Contact() {
    return (
        <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-amber-600 hover:text-amber-800 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour à l'accueil
                    </Link>
                </div>
                {/* Titre */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Contactez-nous
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Une question ? Une demande particulière ? Nous sommes là pour vous aider.
                    </p>
                </div>

                {/* Bloc formulaire + image */}
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Contact Form */}
                        <div className="p-8">
                            <ContactForm />
                        </div>

                        {/* Image Section */}
                        <div className="relative">
                            <img
                                src="/saloon.png"
                                alt="Salon de coiffure"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Coordonnées - en bas et centré */}
                <div className="mt-16 flex justify-center">
                    <div className="bg-amber-50/90 p-6 rounded-t-lg shadow-lg w-full max-w-2xl border-t-4 border-amber-500">
                        <h2 className="text-2xl font-bold mb-4 text-amber-900">Nos coordonnées</h2>
                        <div className="space-y-4">
                            {/* Adresse */}
                            <div className="flex items-start">
                                <div className="bg-amber-100 p-2 rounded-full mr-3">
                                    <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="text-amber-800">
                                    <p>Libreville, Gabon</p>
                                    <p>Quartier Nombakélé</p>
                                </div>
                            </div>

                            {/* Téléphone */}
                            <div className="flex items-start">
                                <div className="bg-amber-100 p-2 rounded-full mr-3">
                                    <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="text-amber-800">
                                    <p>+241 77 80 88 64</p>
                                    <p>+241 76 53 54 42</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start">
                                <div className="bg-amber-100 p-2 rounded-full mr-3">
                                    <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-amber-800">
                                    <p>contact@samba-tech-pro.ga</p>
                                    <p>gabin@samba-tech-pro.ga</p>
                                </div>
                            </div>

                            {/* Horaires */}
                            <div className="flex items-start">
                                <div className="bg-amber-100 p-2 rounded-full mr-3">
                                    <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-amber-800">
                                    <p>Lun - Ven : 8h00 - 18h00</p>
                                    <p>Sam : 9h00 - 13h00</p>
                                </div>
                            </div>

                            {/* Site web */}
                            <div className="flex items-start">
                                <div className="bg-amber-100 p-2 rounded-full mr-3">
                                    <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.21.895-4.21 2.343-5.657A8 8 0 1020 12h-2a6 6 0 01-6-6z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V2" />
                                    </svg>
                                </div>
                                <span className="text-amber-800">www.samba-tech-pro.ga</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
