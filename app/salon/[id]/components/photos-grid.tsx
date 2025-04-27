import Image from "next/image"

interface PhotosGridProps {
  coverImage: string | null
  count?: number
}

export function PhotosGrid({ coverImage, count = 9 }: PhotosGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square relative rounded-lg overflow-hidden">
          <Image
            src={i === 0 ? coverImage || "/placeholder.svg" : "/placeholder.svg"}
            alt={`Photo ${i + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
