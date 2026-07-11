import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabasePublicEnv()) {
    return NextResponse.next({ request });
  }

  const { url, key } = getSupabasePublicEnv();

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient<Database>(url!, key!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAdminRoute =
      request.nextUrl.pathname.startsWith("/admin") &&
      !request.nextUrl.pathname.startsWith("/admin/login");

    if (isAdminRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && user) {
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(url);
      }
    }

    if (request.nextUrl.pathname === "/admin/login" && user) {
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    }

    const isAccountRoute = request.nextUrl.pathname.startsWith("/account");
    const isAuthRoute =
      request.nextUrl.pathname === "/accedi" ||
      request.nextUrl.pathname === "/registrati";

    if (isAccountRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/accedi";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && user) {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const url = request.nextUrl.clone();
      url.pathname = adminProfile?.role === "admin" ? "/admin" : "/account";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware session update failed:", error);
    return NextResponse.next({ request });
  }
}
