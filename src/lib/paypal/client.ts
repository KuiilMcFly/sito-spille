import { getPayPalClientId } from "@/lib/paypal/config";

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = getPayPalClientId();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");

  const response = await fetch(PAYPAL_API_BASE + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal auth failed");
  }

  const data = await response.json();
  return data.access_token as string;
}

export async function createPayPalOrder(
  amount: number,
  currency: string,
  orderNumber: string
) {
  const token = await getAccessToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const response = await fetch(PAYPAL_API_BASE + "/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderNumber,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: "Ordine " + orderNumber + " - Valeria Senpai Spille",
        },
      ],
      application_context: {
        brand_name: "Valeria Senpai Spille Custom",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: siteUrl + "/pagamento/esito?status=success",
        cancel_url: siteUrl + "/pagamento/esito?status=cancelled",
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "PayPal order creation failed");
  }

  const approvalLink = data.links?.find(
    (link: { rel: string; href: string }) => link.rel === "approve"
  );

  return {
    paypalOrderId: data.id as string,
    approvalUrl: approvalLink?.href as string,
    raw: data,
  };
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const token = await getAccessToken();

  const response = await fetch(
    PAYPAL_API_BASE + "/v2/checkout/orders/" + paypalOrderId + "/capture",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "PayPal capture failed");
  }

  return data;
}

export async function verifyPayPalWebhook(
  headers: Headers,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const token = await getAccessToken();

  const response = await fetch(
    PAYPAL_API_BASE + "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  );

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}
