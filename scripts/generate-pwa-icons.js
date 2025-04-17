const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

// Assurez-vous que le dossier icons existe
const iconsDir = path.join(__dirname, "../public/icons")
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Chemin vers l'image source (remplacez par votre logo)
const sourceImage = path.join(__dirname, "../public/logo.png")

// Tailles d'icônes à générer
const sizes = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512]

// Générer les icônes
async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`))

      console.log(`✅ Icône ${size}x${size} générée`)
    }

    // Générer les icônes Apple spécifiques
    await sharp(sourceImage).resize(180, 180).toFile(path.join(iconsDir, "apple-icon-180x180.png"))

    await sharp(sourceImage).resize(152, 152).toFile(path.join(iconsDir, "apple-icon-152x152.png"))

    await sharp(sourceImage).resize(167, 167).toFile(path.join(iconsDir, "apple-icon-167x167.png"))

    // Générer les favicons
    await sharp(sourceImage).resize(32, 32).toFile(path.join(iconsDir, "favicon-32x32.png"))

    await sharp(sourceImage).resize(16, 16).toFile(path.join(iconsDir, "favicon-16x16.png"))

    console.log("✅ Toutes les icônes ont été générées avec succès!")
  } catch (error) {
    console.error("❌ Erreur lors de la génération des icônes:", error)
  }
}

generateIcons()

