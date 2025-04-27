export interface OrganizationDetails {
  id: string
  name: string
  logo: string | null
  imageCover: string | null
  description: string | null
  phone: string | null
  departments: { label: string; id: string; icon: string }[]
  services: {
    name: string
    id: string
    image: string
    description: string
    price: string
    durationMin: string
    durationMax: string
    departmentId: string
  }[]
  address: string
  verificationStatus: string
  OrganizationAvailability:
    | {
        openingTime: number
        closingTime: number
        mondayOpen: boolean
        thursdayOpen: boolean
        wednesdayOpen: boolean
        fridayOpen: boolean
        sundayOpen: boolean
        saturdayOpen: boolean
        tuesdayOpen: boolean
      }[]
    | null
}

export interface Service {
  name: string
  id: string
  image: string
  description: string
  price: string
  durationMin: string
  durationMax: string
  departmentId: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  image: string
}

export interface Review {
  id: string
  author: string
  rating: number
  comment: string
  date: string
}
