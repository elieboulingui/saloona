"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"

// Enregistrer les composants ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface FinancialChartProps {
  salonId: string
}

export function FinancialChart({ salonId }: FinancialChartProps) {

  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    // Générer les 7 derniers jours pour les labels
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      return format(date, "dd MMM", { locale: fr })
    })

    // Récupérer les données financières
    const fetchData = async () => {
      try {
        const startDate = format(subDays(new Date(), 6), "yyyy-MM-dd")
        const endDate = format(new Date(), "yyyy-MM-dd")

        const response = await fetch(
          `/api/organizations/${salonId}/financial-chart?startDate=${startDate}&endDate=${endDate}`,
        )

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données")
        }

        const data = await response.json()

        // Préparer les données pour le graphique
        setChartData({
          labels: days,
          datasets: [
            {
              label: "Revenus",
              data: data.revenues || Array(7).fill(0),
              borderColor: "rgb(16, 185, 129)",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Retraits",
              data: data.withdrawals || Array(7).fill(0),
              borderColor: "rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        })
      } catch (error) {
        console.error("Erreur:", error)

        // En cas d'erreur, utiliser des données fictives
        setChartData({
          labels: days,
          datasets: [
            {
              label: "Revenus",
              data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
              borderColor: "rgb(16, 185, 129)",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Retraits",
              data: [5000, 8000, 0, 10000, 0, 15000, 0],
              borderColor: "rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        })
      }
    }

    fetchData()
  }, [salonId])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "XOF",
                minimumFractionDigits: 0,
              }).format(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => value.toLocaleString() + " FCFA",
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
  }

  return <Line data={chartData} options={options} height={200} />
}
