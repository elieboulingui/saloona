export interface Organization {
    id: string
    name: string
    logo: string | null
    imageCover: string | null
    departments: { label: string; id: string }[]
    address: string
    verificationStatus: string
    OrganizationAvailability:
      | {
          openingTime: number
          closingTime: number
        }[]
      | null
  }
  