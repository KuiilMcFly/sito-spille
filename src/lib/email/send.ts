import { getStoreBranding } from "@/lib/settings";

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  total: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const branding = await getStoreBranding();
  const totalFormatted = params.total.toFixed(2) + " EUR";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: branding.fullTitle + " <noreply@valeriasenpai.it>",
      to: params.to,
      subject: "Conferma ordine " + params.orderNumber,
      html:
        "<h1>Grazie per il tuo ordine!</h1>" +
        "<p>Il tuo ordine <strong>" +
        params.orderNumber +
        "</strong> e stato ricevuto.</p>" +
        "<p>Totale: <strong>" +
        totalFormatted +
        "</strong></p>" +
        "<p>Ti aggiorneremo quando la spilla sara in produzione.</p>",
    }),
  });
}

export async function sendAdminNewOrderEmail(params: {
  orderNumber: string;
  customerEmail: string;
  total: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.STORE_NOTIFICATION_EMAIL;
  if (!apiKey || !adminEmail) return;

  const branding = await getStoreBranding();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: branding.fullTitle + " <noreply@valeriasenpai.it>",
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
    }),
  });
}
