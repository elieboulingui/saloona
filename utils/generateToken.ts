import crypto from "crypto";

export function generateConfirmationToken(): string {
  // Génère un token sécurisé en utilisant des octets aléatoires
  const token = crypto.randomBytes(32).toString("hex");

  // Retourne le token pour l'utiliser dans le lien de confirmation
  return token;
}
