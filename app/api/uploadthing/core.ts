import { createUploadthing, type FileRouter } from "uploadthing/next"
 
const f = createUploadthing()
 
export const ourFileRouter = {
  // Définir les différents endpoints pour les téléchargements
  image: f({ image: { maxFileSize: "4MB" } })
    .middleware(() => {
      return { userId: "user_id" } // Vous pouvez ajouter des métadonnées ici
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Téléchargement de la photo du candidat terminé", file.url)
      return { uploadedBy: metadata.userId }
    }), 
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter
