'use client'
import { useEffect, useState } from "react";
import BoutiqueAdminPageClient from "./components/product-client-page";

const Page = () => {
  const [salonId, setSalonId] = useState<string | null>(null);

  useEffect(() => {
    const match = window.location.href.match(/\/admin\/([^/]+)\/services\/departments/);
    if (match) {
      setSalonId(match[1]);
    }
  }, []);

  if (!salonId) return <div>Chargement...</div>;

  return <BoutiqueAdminPageClient salonId={salonId} />;
};

export default Page;
