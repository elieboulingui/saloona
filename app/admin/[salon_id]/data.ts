// Mock data for appointments with additional details
export const mockAppointments = [
    {
      id: "1",
      name: "Sophie Martin",
      service: "Démarrage",
      time: "09:00",
      date: new Date(2025, 2, 31), // March 31, 2025
      status: "confirmed",
      phone: "+33 6 12 34 56 78",
      arrivalTime: "08:45",
      startTime: "09:10",
      endTime: "11:15",
      notes: "Première fois pour des dreads, cheveux mi-longs",
      stylist: "Marie Koné",
    },
    {
      id: "2",
      name: "Thomas Dubois",
      service: "Réparation",
      time: "11:00",
      date: new Date(2025, 2, 31), // March 31, 2025
      status: "confirmed",
      phone: "+33 6 23 45 67 89",
      arrivalTime: "10:50",
      startTime: "11:20",
      endTime: "12:30",
      notes: "Réparation de 5 dreads abîmées",
      stylist: "Marie Koné",
    },
    {
      id: "3",
      name: "Emma Petit",
      service: "Reprise",
      time: "14:00",
      date: new Date(2025, 3, 1), // April 1, 2025
      status: "confirmed",
      phone: "+33 6 34 56 78 90",
      arrivalTime: "13:45",
      startTime: "14:05",
      endTime: "15:10",
      notes: "Reprise des racines, dreads depuis 3 mois",
      stylist: "Jean Kouassi",
    },
    {
      id: "4",
      name: "Lucas Bernard",
      service: "Démarrage",
      time: "16:00",
      date: new Date(2025, 3, 1), // April 1, 2025
      status: "confirmed",
      phone: "+33 6 45 67 89 01",
      arrivalTime: "15:50",
      startTime: "16:15",
      endTime: "18:30",
      notes: "Cheveux courts, souhaite des dreads fines",
      stylist: "Marie Koné",
    },
  ]
  
  // Mock data for waiting clients
  export const initialWaitingClients = [
    {
      id: "W001",
      name: "Jean Kouassi",
      phone: "+241 07 12 34 56",
      arrivalTime: "08:45",
      inChair: false,
    },
    {
      id: "W002",
      name: "Marie Koné",
      phone: "+241 05 23 45 67",
      arrivalTime: "09:10",
      inChair: false,
    },
    {
      id: "W003",
      name: "Paul Diallo",
      phone: "+241 01 34 56 78",
      arrivalTime: "09:25",
      inChair: false,
    },
    {
      id: "W004",
      name: "Aya Touré",
      phone: "+241 07 45 67 89",
      arrivalTime: "09:40",
      inChair: false,
    },
    {
      id: "W005",
      name: "Olivier Bamba",
      phone: "+241 05 56 78 90",
      arrivalTime: "10:05",
      inChair: false,
    },
  ]
  
  // Mock data for transactions
  export const mockTransactions = [
    {
      id: "T001",
      type: "payment",
      amount: 15000,
      date: new Date(2025, 2, 31, 11, 15), // March 31, 2025, 11:15
      status: "completed",
      description: "Paiement pour service Démarrage Dreads",
      client: "Sophie Martin",
      paymentMethod: "Mobile Money",
    },
    {
      id: "T002",
      type: "payment",
      amount: 10000,
      date: new Date(2025, 2, 31, 12, 30), // March 31, 2025, 12:30
      status: "completed",
      description: "Paiement pour service Réparation",
      client: "Thomas Dubois",
      paymentMethod: "Espèces",
    },
    {
      id: "T003",
      type: "withdrawal",
      amount: 20000,
      date: new Date(2025, 2, 31, 18, 0), // March 31, 2025, 18:00
      status: "completed",
      description: "Retrait pour achat de fournitures",
      recipient: "Marie Koné",
      mobileNumber: "+241 07 12 34 56",
    },
    {
      id: "T004",
      type: "payment",
      amount: 10000,
      date: new Date(2025, 3, 1, 15, 10), // April 1, 2025, 15:10
      status: "completed",
      description: "Paiement pour service Reprise",
      client: "Emma Petit",
      paymentMethod: "Mobile Money",
    },
    {
      id: "T005",
      type: "payment",
      amount: 15000,
      date: new Date(2025, 3, 1, 18, 30), // April 1, 2025, 18:30
      status: "completed",
      description: "Paiement pour service Démarrage Dreads",
      client: "Lucas Bernard",
      paymentMethod: "Carte bancaire",
    },
    {
      id: "T006",
      type: "withdrawal",
      amount: 35000,
      date: new Date(2025, 3, 1, 19, 0), // April 1, 2025, 19:00
      status: "pending",
      description: "Retrait pour salaire hebdomadaire",
      recipient: "Jean Kouassi",
      mobileNumber: "+241 05 67 89 01",
    },
    {
      id: "T007",
      type: "payment",
      amount: 8000,
      date: new Date(2025, 3, 2, 10, 45), // April 2, 2025, 10:45
      status: "completed",
      description: "Paiement pour service Coupe",
      client: "Aminata Diallo",
      paymentMethod: "Mobile Money",
    },
    {
      id: "T008",
      type: "payment",
      amount: 12000,
      date: new Date(2025, 3, 2, 14, 20), // April 2, 2025, 14:20
      status: "completed",
      description: "Paiement pour service Coloration Dreads",
      client: "Olivier Koffi",
      paymentMethod: "Espèces",
    },
    {
      id: "T009",
      type: "payment",
      amount: 18000,
      date: new Date(2025, 3, 3, 11, 30), // April 3, 2025, 11:30
      status: "completed",
      description: "Paiement pour service Extensions Dreads",
      client: "Fatou Camara",
      paymentMethod: "Mobile Money",
    },
    {
      id: "T010",
      type: "withdrawal",
      amount: 15000,
      date: new Date(2025, 3, 3, 17, 45), // April 3, 2025, 17:45
      status: "completed",
      description: "Retrait pour achat de produits capillaires",
      recipient: "Marie Koné",
      mobileNumber: "+241 07 12 34 56",
    },
    {
      id: "T011",
      type: "payment",
      amount: 10000,
      date: new Date(2025, 3, 4, 9, 15), // April 4, 2025, 09:15
      status: "completed",
      description: "Paiement pour service Entretien & Reprise",
      client: "Ibrahim Touré",
      paymentMethod: "Carte bancaire",
    },
    {
      id: "T012",
      type: "payment",
      amount: 15000,
      date: new Date(2025, 3, 4, 16, 0), // April 4, 2025, 16:00
      status: "completed",
      description: "Paiement pour service Démarrage Dreads",
      client: "Sylvie Kouamé",
      paymentMethod: "Mobile Money",
    },
    {
      id: "T013",
      type: "withdrawal",
      amount: 50000,
      date: new Date(2025, 3, 5, 18, 30), // April 5, 2025, 18:30
      status: "pending",
      description: "Retrait pour loyer du salon",
      recipient: "Marie Koné",
      mobileNumber: "+241 07 12 34 56",
    },
    {
      id: "T014",
      type: "payment",
      amount: 8000,
      date: new Date(2025, 3, 6, 13, 45), // April 6, 2025, 13:45
      status: "completed",
      description: "Paiement pour service Coupe",
      client: "Paul Bamba",
      paymentMethod: "Espèces",
    },
    {
      id: "T015",
      type: "payment",
      amount: 12000,
      date: new Date(2025, 3, 7, 10, 30), // April 7, 2025, 10:30
      status: "completed",
      description: "Paiement pour service Coloration Dreads",
      client: "Aya Konaté",
      paymentMethod: "Mobile Money",
    },
  ]
  
  