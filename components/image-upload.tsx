"use client"

import { useState } from "react"
import Image from "next/image"
import { UploadButton } from "@/utils/uploadthing"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  onLoading?: (isLoading: boolean) => void
}

export function ImageUpload({ value, onChange, disabled, onLoading }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleStartUpload = () => {
    setIsUploading(true)
    if (onLoading) onLoading(true)
  }

  const handleUploadComplete = (res: { url: string }[]) => {
    setIsUploading(false)
    if (onLoading) onLoading(false)
    onChange(res[0].url)
  }

  const handleUploadError = (error: Error) => {
    setIsUploading(false)
    if (onLoading) onLoading(false)
    console.error("Erreur d'upload:", error.message)
    alert(`Erreur lors de l'upload: ${error.message}`)
  }

  const handleRemoveImage = () => {
    onChange("")
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
          <Image src={value || "/placeholder.svg"} alt="Image téléchargée" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className={`${isUploading ? "opacity-50" : ""}`}>
          <UploadButton
            endpoint="image"
            onUploadBegin={handleStartUpload}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            disabled={disabled || isUploading}
            className="ut-button:bg-amber-500 ut-button:hover:bg-amber-600 ut-button:ut-readying:bg-amber-400 ut-button:ut-uploading:bg-amber-400"
          />
          {isUploading && (
            <div className="flex items-center justify-center mt-2 text-amber-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Chargement en cours...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

