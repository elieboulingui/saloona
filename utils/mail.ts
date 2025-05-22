import nodemailer from "nodemailer"

export async function sendMail({
  to,
  name,
  subject,
  body,
}: {
  to: string;
  name: string;
  subject: string;
  body: string;
}) {
  const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });

  try {
    // Vérification de la configuration du transport
    await transport.verify();
  } catch (error) {
    console.error("Erreur de configuration du transport:", error);
    return {
      status: "error", message: "Erreur de configuration du transport d'email",
      error,
    };
  }

  try {
    // Envoi de l'email
    const sendResult = await transport.sendMail({
      from: `"Dread In Gabon " <${SMTP_EMAIL}>`, // Utilisation d'un nom d'expéditeur
      to,
      subject,
      html: body,
    });

    console.log("Email envoyé avec succès:", sendResult);

    return {
      status: "success",
      message: "Email envoyé avec succès",
      result: sendResult,
    };

  } catch (error) {

    console.error("Erreur lors de l'envoi de l'email:", error);

    return {
      status: "error",
      message: "Erreur lors de l'envoi de l'email",
      error,
    };
    
  }
}
