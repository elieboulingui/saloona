import Image from "next/image"

interface PhotoGalleryProps {
  coverImage: string | null
  isDesktop?: boolean
}

export function PhotoGallery({ coverImage, isDesktop = false }: PhotoGalleryProps) {
  if (isDesktop) {
    return (
      <div className="mb-12">
        <div className="grid grid-cols-12 gap-2 h-[400px]">
          <div className="col-span-8 relative rounded-lg overflow-hidden">
            <Image
              src={coverImage || "/placeholder.svg?height=400&width=600"}
              alt="Salon cover"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="col-span-4 grid grid-rows-2 gap-2">
            <div className="relative rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?height=200&width=200" alt="Salon interior" fill className="object-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?height=200&width=200" alt="Salon interior" fill className="object-cover" />
              <div className="absolute inset-0 flex items-end justify-end p-3">
                <button className="bg-white text-black text-sm font-medium py-2 px-3 rounded-lg">
                  Afficher toutes les images
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] w-full">
      <Image
        src={coverImage || "/placeholder.svg?height=400&width=600"}
        alt="Salon cover"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">1/6</div>
    </div>
  )
}
