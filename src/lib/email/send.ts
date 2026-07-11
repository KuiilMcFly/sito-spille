import { getStoreBranding } from "@/lib/settings";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import type { Enums } from "@/types/database";

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const branding = await getStoreBranding();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: branding.fullTitle + " <noreply@valeriasenpai.it>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  total: number;
  discountAmount?: number;
  promotionName?: string | null;
}) {
  const totalFormatted = params.total.toFixed(2) + " EUR";
  let extra = "";
  if (params.discountAmount && params.discountAmount > 0) {
    extra =
      "<p>Sconto applicato" +
      (params.promotionName ? " (" + params.promotionName + ")" : "") +
      ": <strong>-" +
      params.discountAmount.toFixed(2) +
      " EUR</strong></p>";
  }

  await sendEmail({
    to: params.to,
    subject: "Conferma ordine " + params.orderNumber,
    html:
      "<h1>Grazie per il tuo ordine!</h1>" +
      "<p>Il tuo ordine <strong>" +
      params.orderNumber +
      "</strong> e stato ricevuto e pagato.</p>" +
      extra +
      "<p>Totale: <strong>" +
      totalFormatted +
      "</strong></p>" +
      "<p>Puoi seguire lo stato dal tuo account. Ti avviseremo quando la spilla sara in produzione e quando verra spedita.</p>",
  });
}

export async function sendAdminNewOrderEmail(params: {
  orderNumber: string;
  customerEmail: string;
  total: number;
}) {
  const adminEmail = process.env.STORE_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject: "Nuovo ordine " + params.orderNumber,
    html:
      "<h1>Nuovo ordine ricevuto</h1>" +
      "<p>Ordine: <strong>" +
      params.orderNumber +
      "</strong></p>" +
      "<p>Cliente: " +
      params.customerEmail +
      "</p>" +
      "<p>Totale: " +
      params.total.toFixed(2) +
      " EUR</p>",
  });
}

export async function sendOrderStatusEmail(params: {
  to: string;
  orderNumber: string;
  status: Enums<"order_status">;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  const label = ORDER_STATUS_LABELS[params.status] || params.status;
  let body =
    "<h1>Aggiornamento ordine " +
    params.orderNumber +
    "</h1>" +
    "<p>Il tuo ordine e ora: <strong>" +
    label +
    "</strong></p>";

  if (params.status === "shipped") {
    body += "<p>Il pacco e stato spedito.</p>";
    if (params.trackingNumber) {
      body += "<p>Tracking: <strong>" + params.trackingNumber + "</strong></p>";
    }
    if (params.trackingUrl) {
      body +=
        "<p><a href=\"" +
        params.trackingUrl +
        "\">Segui la spedizione</a></p>";
    }
  }

  if (params.status === "in_production") {
    body += "<p>La tua spilla e entrata in produzione.</p>";
  }

  if (params.status === "delivered") {
    body += "<p>Il ordine risulta consegnato. Grazie per aver scelto il nostro negozio!</p>";
  }

  if (params.status === "cancelled") {
    body += "<p>L ordine e stato annullato. Per assistenza contattaci.</p>";
  }

  if (params.status === "refunded") {
    body += "<p>E stato emesso un rimborso per questo ordine.</p>";
  }

  body += "<p>Puoi vedere tutti i dettagli dal tuo account.</p>";

  await sendEmail({
    to: params.to,
    subject: "Ordine " + params.orderNumber + " - " + label,
    html: body,
  });
}

export async function sendWelcomeEmail(params: { to: string; name?: string | null }) {
  const greeting = params.name ? "Ciao " + params.name : "Ciao";
  await sendEmail({
    to: params.to,
    subject: "Benvenuto nel nostro negozio",
    html:
      "<h1>" +
      greeting +
      "!</h1>" +
      "<p>Il tuo account e stato creato. Puoi salvare i preferiti, seguire gli ordini e acquistare piu velocemente.</p>",
  });
}
