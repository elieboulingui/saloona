import { formatTime } from "@/lib/utils"
import { Clock, MapPin } from "lucide-react"

interface OrganizationAvailability {
  openingTime: number
  closingTime: number
  mondayOpen: boolean
  thursdayOpen: boolean
  wednesdayOpen: boolean
  fridayOpen: boolean
  sundayOpen: boolean
  saturdayOpen: boolean
  tuesdayOpen: boolean
}

interface OrganizationInfoProps {
  description: string | null
  address: string
  availability: OrganizationAvailability[] | null
}

export function OrganizationInfo({ description, address, availability }: OrganizationInfoProps) {
  // Vérifier si les données de disponibilité existent
  const hasAvailability = availability && availability.length > 0

  return (
    <div className="space-y-8">
      {description && (
        <div className="mb-8">
          <p className="text-gray-600">{description}</p>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-3 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-gray-500" />
          Adresse
        </h3>
        <p className="text-gray-600 mb-2">{address}</p>
        <div className="h-60 bg-gray-200 rounded-lg">
          {/* Map placeholder - to be replaced with actual map */}
          <div className="h-full w-full flex items-center justify-center text-gray-400">Carte</div>
        </div>
      </div>

      {hasAvailability && (
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Horaires d'ouverture
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="flex justify-between pr-4">
              <span>Lundi</span>
              <span className={!availability[0].mondayOpen ? "text-red-500" : ""}>
                {availability[0].mondayOpen
                  ? `${formatTime(availability[0].openingTime)} - ${formatTime(availability[0].closingTime)}`
                  : "Fermé"}
              </span>
            </div>
            <div className="flex justify-between pr-4">
              <span>Mardi</span>
              <span className={!availability[0].tuesdayOpen ? "text-red-500" : ""}>
                {availability[0].tuesdayOpen
                  ? `${formatTime(availability[0].openingTime)} - ${formatTime(availability[0].closingTime)}`
                  : "Fermé"}
              </span>
            </div>
            <div className="flex justify-between pr-4">
              <span>Mercredi</span>
              <span className={!availability[0].wednesdayOpen ? "text-red-500" : ""}>
                {availability[0].wednesdayOpen
                  ? `${formatTime(availability[0].openingTime)} - ${formatTime(availability[0].closingTime)}`
                  : "Fermé"}
              </span>
            </div>
            <div className="flex justify-between pr-4">
              <span>Jeudi</span>
              <span className={!availability[0].thursdayOpen ? "text-red-500" : ""}>
                {availability[0].thursdayOpen
                  ? `${formatTime(availability[0].openingTime)} - ${formatTime(availability[0].closingTime)}`
                  : "Fermé"}
              </span>
            </div>
            <div className="flex justify-between pr-4">
              <span>Vendredi</span>
              <span className={!availability[0].fridayOpen ? "text-red-500" : ""}>
                {availability[0].fridayOpen
                  ? `${formatTime(availability[0].openingTime)} - ${formatTime(availability[0].closingTime)}`
                  : "Fermé"}
              </span>
            </div>
            <div className="flex justify-between pr-4">
              <span>Samedi</span>
              <span className={!availability[0].saturdayOpen ? "text-red-500" : ""}>
                {availability[0].saturdayOpen
                  ? `${formatTime(availability[0].openingTime)} - ${formatTime(availability[0].closingTime)}`
                  : "Fermé"}
              </span>
            </div>
            <div className="flex justify-between pr-4">
              <span>Dimanche</span>
              <span className={!availability[0].sundayOpen ? "text-red-500" : ""}>
                {availability[0].sundayOpen
                  ? `${formatTime(availability[0].openingTime)} - ${formatTime(availability[0].closingTime)}`
                  : "Fermé"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
