import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { UserRole } from "@/lib/types/content";

export type AuthContext = {
  userId: string | null;
  email: string | null;
  role: UserRole;
  bypass: boolean;
};

export async function getAuthContext(): Promise<AuthContext> {
  // Production: Supabase is REQUIRED
  if (!hasSupabaseEnv) {
    return {
      userId: null,
      email: null,
      role: "editor",
      bypass: false, // No bypass in production
    };
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return {
      userId: null,
      email: null,
      role: "editor",
      bypass: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      email: null,
      role: "editor",
      bypass: false,
    };
  }

  const appRole = user.app_metadata?.role as UserRole | undefined;
  if (appRole && (appRole === "admin" || appRole === "editor" || appRole === "senior_admin")) {
    return {
      userId: user.id,
      email: user.email ?? null,
      role: appRole,
      bypass: false,
    };
  }

  const { data: profile } = (await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()) as { data: { role: UserRole } | null };

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile?.role ?? "editor",
    bypass: false,
  };
}

export async function requireAdminAccess() {
  const auth = await getAuthContext();

  if (!auth.userId && !auth.bypass) {
    redirect("/auth/login?next=/admin");
  }

  if (auth.role !== "admin" && auth.role !== "senior_admin" && auth.role !== "editor") {
    redirect("/");
  }
}
