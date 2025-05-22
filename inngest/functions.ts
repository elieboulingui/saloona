import { sendMail } from "@/utils/mail";
import { inngest } from "./client";
import { prisma } from "@/utils/prisma"
import webpush from "web-push"

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const sendEmailInngest = inngest.createFunction(

  { id: "sender-mail-user" },
  { event: "email/sender" },

  async ({ event }) => {

    const { email, displayName, subject, emailbody } = event.data as {
      email: string,
      displayName: string,
      subject: string,
      emailbody: string
    };

    // Envoi de l'email
    const emailResult = await sendMail({
      to: email,
      name: displayName,
      subject: subject,
      body: emailbody,
    });

    // Retourner le statut de l'email
    return emailResult;
  }
);

// Ajouter cette nouvelle fonction Inngest pour envoyer des notifications de transaction
export const sendTransactionNotification = inngest.createFunction(
  { id: "transaction-notification" },
  { event: "transaction/status.updated" },

  async ({ event, step }) => {

    const { transactionId, status, appointmentId, clientName, phoneNumber, appointmentStatus, serviceName } = event.data

    // Récupérer les utilisateurs admin et coiffeurs pour leur envoyer des notifications
    const users = await step.run("fetch-admin-users", async () => {
      return await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "BARBER"] },
          notificationsEnabled: true,
        },
        select: {
          id: true,
          name: true,
          pushSubscription: true,
        },
      })
    })

    // Créer un message approprié en fonction du statut
    let title = "Mise à jour de transaction"
    let message = ""

    if (status === "processed" || status === "paid") {
      title = "Paiement confirmé"
      message = `Le paiement de ${clientName} pour ${serviceName || "un service"} a été confirmé.`
    } else if (status === "pending" || status === "ready") {
      title = "Paiement en attente"
      message = `Un paiement est en attente pour ${clientName}.`
    } else if (["failed", "expired", "cancelled"].includes(status)) {
      title = "Paiement échoué"
      message = `Le paiement de ${clientName} a échoué (${status}).`
    }

    // Créer les notifications en base de données
    const notifications = await step.run("create-notifications", async () => {
      return await Promise.all(
        users.map(async (user) => {
          return await prisma.notification.create({
            data: {
              title,
              message,
              type: "transaction",
              data: JSON.stringify({
                transactionId,
                appointmentId,
                status,
              }),
              userId: user.id,
            },
          })
        }),
      )
    })

    // Envoyer les notifications push aux utilisateurs qui ont un pushSubscription
    const pushResults = await step.run("send-push-notifications", async () => {

      const results = []

      for (const user of users.filter((u) => u.pushSubscription)) {
        try {
          if(!user.pushSubscription){
            console.error(`L'utilisateur non souscris aux notifications ${user.id}:`,)
            return 
          }
          const subscription = JSON.parse(user.pushSubscription)
          const payload = JSON.stringify({
            title,
            message,
            type: "transaction",
            data: {
              transactionId,
              appointmentId,
              status,
            },
            notificationId: notifications.find((n) => n.userId === user.id)?.id,
          })

          // Configuration des clés VAPID pour Web Push
          const vapidKeys = {
            publicKey: "BNWiGTUJozjVWT3WJ1GzAbz74V9XGl_G3oFeiyxJcCO60L-F672BxqJ7IaPp4VAVE2LPpPKeptsfLzTRe2Zdnc8",
            privateKey: "TN6isMLosDI7pU-CZXUpt4H565brs_E29pTGgx5Vdas",
          }

          webpush.setVapidDetails("mailto:contact@dreadingabon.com", vapidKeys.publicKey, vapidKeys.privateKey)

          await webpush.sendNotification(subscription, payload)
          results.push({ userId: user.id, success: true })

        } catch (error) {
          console.error(`Erreur lors de l'envoi de la notification push à l'utilisateur ${user.id}:`, error)
          results.push({ userId: user.id, success: false, error: error })
        }
      }

      return results
    })

    return {
      notificationsCreated: notifications.length,
      pushNotificationsSent: pushResults?.filter((r) => r.success).length,
      pushNotificationsFailed: pushResults?.filter((r) => !r.success).length,
    }
  },
)



