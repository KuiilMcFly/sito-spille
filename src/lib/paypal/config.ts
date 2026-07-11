export function getPayPalClientId(): string {
  return (
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENT_ID ||
    ""
  );
}

export function isPayPalConfigured(): boolean {
  const clientId = getPayPalClientId();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
  return clientId.length > 0 && clientSecret.length > 0;
}

export function getPayPalMerchantEmail(): string {
  return process.env.PAYPAL_MERCHANT_EMAIL || "walice345@gmail.com";
}
