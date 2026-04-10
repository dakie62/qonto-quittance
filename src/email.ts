import nodemailer from "nodemailer";
import { config } from "./config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmail.user,
    pass: config.gmail.appPassword,
  },
});

export async function sendReceipt(
  pdfBuffer: Buffer,
  period: string,
): Promise<void> {
  await transporter.sendMail({
    from: `"${config.landlord.companyName}" <${config.gmail.user}>`,
    to: config.tenant.emails,
    cc: config.gmail.user,
    subject: `Quittance de loyer — ${period}`,
    text: [
      "Madame, Monsieur,",
      "",
      `Veuillez trouver ci-joint votre quittance de loyer pour la période : ${period}.`,
      "",
      "Cordialement,",
      config.landlord.companyName,
      `Représentée par ${config.landlord.representative}`,
    ].join("\n"),
    attachments: [
      {
        filename: `quittance-${period.replace(/\s/g, "-").toLowerCase()}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
