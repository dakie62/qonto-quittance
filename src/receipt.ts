import PDFDocument from "pdfkit";
import { config } from "./config.js";

interface ReceiptData {
  period: string;
  paymentDate: string;
  rentAmount: number;
}

const MONTHS_FR: Record<string, string> = {
  "01": "Janvier",
  "02": "Février",
  "03": "Mars",
  "04": "Avril",
  "05": "Mai",
  "06": "Juin",
  "07": "Juillet",
  "08": "Août",
  "09": "Septembre",
  "10": "Octobre",
  "11": "Novembre",
  "12": "Décembre",
};

export function formatPeriod(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${MONTHS_FR[month]} ${date.getFullYear()}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function generateReceipt(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { landlord, property, tenant } = config;
    const pageWidth = doc.page.width - 100;

    // === HEADER ===
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("QUITTANCE DE LOYER", { align: "center" });

    doc.moveDown(0.3);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Période : ${data.period}`, { align: "center" });

    doc.moveDown(0.8);
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .strokeColor("#2c3e50")
      .lineWidth(2)
      .stroke();
    doc.moveDown(1);

    // === BAILLEUR ===
    doc.fontSize(13).font("Helvetica-Bold").text("BAILLEUR");
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(landlord.companyName)
      .text(`${landlord.legalForm} au capital de ${landlord.capital}`)
      .text(`Siège : ${landlord.address}`)
      .text(`SIRET : ${landlord.siret}`)
      .text(`RCS : ${landlord.rcs}`);

    if (landlord.tva) {
      doc.text(`TVA : ${landlord.tva}`);
    }

    doc.text(`Représentée par : ${landlord.representative}`);

    doc.moveDown(1);

    // === LOCATAIRES ===
    doc.fontSize(13).font("Helvetica-Bold").text("LOCATAIRE(S)");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text(tenant.names);

    doc.moveDown(1);

    // === BIEN LOUÉ ===
    doc.fontSize(13).font("Helvetica-Bold").text("BIEN LOUÉ");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text(property.address);
    if (property.description) {
      doc.text(property.description);
    }

    doc.moveDown(1);

    // === DÉTAIL DU PAIEMENT ===
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .strokeColor("#bdc3c7")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.8);

    doc.fontSize(13).font("Helvetica-Bold").text("DÉTAIL DU PAIEMENT");
    doc.moveDown(0.5);

    const col1 = 50;
    const col2 = 350;
    const colWidth = pageWidth - 300;

    doc.fontSize(10).font("Helvetica");
    let y = doc.y;

    doc.text("Loyer nu :", col1, y);
    doc.text(formatCurrency(data.rentAmount), col2, y, {
      align: "right",
      width: colWidth,
    });
    y += 20;

    doc.text("Charges récupérables :", col1, y);
    doc.text(formatCurrency(0), col2, y, { align: "right", width: colWidth });
    y += 20;

    doc
      .moveTo(col1, y)
      .lineTo(50 + pageWidth, y)
      .strokeColor("#bdc3c7")
      .lineWidth(0.5)
      .stroke();
    y += 10;

    doc.font("Helvetica-Bold");
    doc.text("Total reçu :", col1, y);
    doc.text(formatCurrency(data.rentAmount), col2, y, {
      align: "right",
      width: colWidth,
    });
    y += 20;

    doc.font("Helvetica");
    doc.text(`Date du paiement : ${formatDate(data.paymentDate)}`, col1, y);
    y += 15;
    doc.text("Mode de paiement : Virement bancaire", col1, y);

    doc.y = y + 30;

    // === MENTION LÉGALE ===
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .strokeColor("#bdc3c7")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.8);

    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        "Cette quittance annule tous les reçus qui auraient pu être établis précédemment " +
          "en cas de paiement partiel du montant ci-dessus. Elle est délivrée sous réserve " +
          "de tous droits et sans novation de la part du bailleur.",
        { align: "justify" },
      );

    doc.moveDown(2);

    // === SIGNATURE ===
    const today = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Fait à ${landlord.city}, le ${today}`, { align: "right" });

    doc.moveDown(1);
    doc.font("Helvetica-Bold").text(landlord.companyName, { align: "right" });
    doc
      .font("Helvetica")
      .text(`Représentée par ${landlord.representative}`, { align: "right" });

    // === FOOTER ===
    const footer = `${landlord.companyName} — SIRET ${landlord.siret} — ${landlord.rcs} — ${landlord.address}`;
    doc
      .fontSize(7)
      .font("Helvetica")
      .text(footer, 50, doc.page.height - 70, { align: "center", lineBreak: false });

    doc.end();
  });
}
