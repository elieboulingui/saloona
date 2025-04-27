import Image from "next/image"

interface TeamMemberProps {
  id: string
  name: string
  role: string
  image: string
}

export function TeamCard({ id, name, role, image }: TeamMemberProps) {
  return (
    <div key={id} className="text-center border py-3 rounded-lg">
      <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden mb-3 bg-gray-100">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
      </div>
      <h3 className="font-medium">{name}</h3>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  )
}
