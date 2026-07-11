import { Suspense } from "react";
import { getStoreBranding } from "@/lib/settings";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const branding = await getStoreBranding();

  return (
    <Suspense>
      <LoginForm siteTitle={branding.fullTitle} />
    </Suspense>
  );
}
