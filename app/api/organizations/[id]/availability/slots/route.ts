import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { parseISO, format } from "date-fns"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    const {id : organizationId} = await params
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const barberIdParam = searchParams.get("barberId")

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Convertir le paramètre de date en objet Date
    const selectedDate = parseISO(dateParam)
    const formattedDate = format(selectedDate, "yyyy-MM-dd")

    // Récupérer les informations de disponibilité de l'organisation
    const availability = await prisma.organizationAvailability.findUnique({
      where: {
        organizationId: organizationId,
      },
    })

    if (!availability) {
      return NextResponse.json(
        { error: "Aucune information de disponibilité trouvée pour cette organisation" },
        { status: 404 },
      )
    }

    // Vérifier si le salon est ouvert ce jour-là
    const dayOfWeek = selectedDate.getDay() // 0 = dimanche, 1 = lundi, etc.
    let isOpen = false

    switch (dayOfWeek) {
      case 0: // Dimanche
        isOpen = availability.sundayOpen
        break
      case 1: // Lundi
        isOpen = availability.mondayOpen
        break
      case 2: // Mardi
        isOpen = availability.tuesdayOpen
        break
      case 3: // Mercredi
        isOpen = availability.wednesdayOpen
        break
      case 4: // Jeudi
        isOpen = availability.thursdayOpen
        break
      case 5: // Vendredi
        isOpen = availability.fridayOpen
        break
      case 6: // Samedi
        isOpen = availability.saturdayOpen
        break
    }

    if (!isOpen) {
      return NextResponse.json({ slots: [], message: "Le salon est fermé ce jour-là" })
    }

    // Générer tous les créneaux possibles de la journée
    const openingTime = availability.openingTime // Minutes depuis minuit
    const closingTime = availability.closingTime // Minutes depuis minuit
    const appointmentInterval = availability.appointmentInterval || 15 // Intervalle entre les rendez-vous en minutes

    // Récupérer tous les rendez-vous pour la date sélectionnée
    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId,
        date: {
          equals: new Date(formattedDate),
        },
        ...(barberIdParam && barberIdParam !== "unassigned" ? { barberId: barberIdParam } : {}),
      },
      select: {
        id: true,
        hourAppointment: true,
        estimatedTime: true,
        barberId: true,
      },
    })

    // Générer tous les créneaux possibles
    const allSlots = []
    for (let minutes = openingTime; minutes < closingTime; minutes += appointmentInterval) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      allSlots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`)
    }

    // Marquer les créneaux occupés
    const occupiedSlots = new Set<string>()

    appointments.forEach((appointment) => {
      if (!appointment.hourAppointment) return

      // Extraire l'heure et les minutes du rendez-vous
      const [hours, minutes] = appointment.hourAppointment.split(":").map(Number)

      // Calculer le temps en minutes depuis minuit
      const startMinutes = hours * 60 + minutes

      // Calculer la durée du rendez-vous (en minutes)
      const duration =
        typeof appointment.estimatedTime === "number"
          ? appointment.estimatedTime
          : Number.parseInt(appointment.estimatedTime) || 30 // Valeur par défaut si non définie

      // Marquer tous les créneaux occupés par ce rendez-vous
      for (let i = 0; i < duration; i += appointmentInterval) {
        const currentMinutes = startMinutes + i
        const currentHours = Math.floor(currentMinutes / 60)
        const currentMins = currentMinutes % 60
        const timeSlot = `${currentHours.toString().padStart(2, "0")}:${currentMins.toString().padStart(2, "0")}`

        if (currentMinutes < closingTime) {
          occupiedSlots.add(timeSlot)
        }
      }
    })

    // Filtrer les créneaux disponibles
    const availableSlots = allSlots.filter((slot) => !occupiedSlots.has(slot))

    return NextResponse.json({
      slots: availableSlots,
      openingTime,
      closingTime,
      appointmentInterval,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux disponibles:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des créneaux disponibles" },
      { status: 500 },
    )
  }
}
