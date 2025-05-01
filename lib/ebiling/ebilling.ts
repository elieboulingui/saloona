"use server"
import axios, { AxiosError } from "axios"
import { encode as base64Encode } from "base-64"

const username = process.env.USERNAME
const sharedkey = process.env.SHAREKEY
const domain = "https://stg.billing-easy.com/api/v1/"

const credentials = `${username}:${sharedkey}`
const encodedCredentials = base64Encode(credentials) // Changed 'base64.encode' to 'base64Encode'

const requestHeaders = {
  "Content-type": "application/json",
  Accept: "application/json",
  Authorization: "Basic " + encodedCredentials,
}

const api = axios.create({
  baseURL: domain,
  headers: requestHeaders,
})

// Format de l'objet pour la création de la facture
interface InvoiceData {
  amount: number
  payer_msisdn: string
  payer_email: string
  short_description: string
  external_reference: string
  description?: string
  expiry_period?: string
  payment_system_name?: string
}

interface PushUssdData {
  bill_id: string
  payer_msisdn: string
  payment_system_name?: string //airtelmoney || moovmoney4
}

interface PayoutRequireData {
  payee_msisdn: string
  amount: string
  external_reference: string
  payout_type: string
}

interface PropertyName {
  payment_system_name: string
  payer_pin: string
  payer_client_id: string
  payer_client_secret_key: string
  payouts: PayoutRequireData
}

export async function CreateInvoice(data: InvoiceData) {
  try {

    const { payer_msisdn, amount, short_description, payer_email, description, external_reference, expiry_period } =
      data

    const response = await api.post("/merchant/e_bills.json", {
      payer_msisdn,
      amount : amount,
      short_description,
      payer_email,
      description,
      external_reference,
      expiry_period,
    })

    return response.data

  } catch (error) {
    console.log(error)
  }
}

export async function MakePushUSSD(data: PushUssdData) {
  const { payer_msisdn, bill_id, payment_system_name } = data
  try {
    const response = await api.post(`/merchant/e_bills/${bill_id}/ussd_push`, { payer_msisdn, payment_system_name })
    return response.data
  } catch (error) {
    console.error("Erreur lors du Push ussd :", error)
    throw error
  }
}

export async function GetInvoice(bill_id: string) {
  try {
    const response = await api.get(`/merchant/e_bills/${bill_id}.json`)

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Erreur lors de la recuperation de la facture :", error.response?.data)
      return { success: false }
    } else {
      console.error("Erreur inattendue :", error)
      return { success: false }
    }
  }
}

export async function CreatePayout(data: PropertyName) {
  try {
    const response = await api.get("/merchant/payouts", { data })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Erreur lors de la création du paiement :", error.response?.data)
      return { success: false }
    } else {
      console.error("Erreur inattendue :", error)
      return { success: false }
    }
  }
}

