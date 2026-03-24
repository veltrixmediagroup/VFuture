"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AdminLoginAnimation,
  type AdminLoginAnimationState,
} from "@/components/auth/admin-login-animation";
import { GoogleBrandIcon } from "@/components/common/brand-icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const PasswordInput = ({
    value,
    onChange,
    placeholder,
    showPassword,
    onToggleShowPassword
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleShowPassword: () => void;
  }) => (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        type={showPassword ? "text" : "password"}
        required
        placeholder={placeholder}
        className="h-11 rounded-xl pr-10"
      />
      <button
        type="button"
        onClick={onToggleShowPassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 p-1"
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
  const [animationState, setAnimationState] = useState<AdminLoginAnimationState>("idle");
  const [attemptKey, setAttemptKey] = useState(0);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<Extract<AdminLoginAnimationState, "success" | "error"> | null>(null);
  const authError = searchParams.get("error");

  useEffect(() => {
    if (authError === "google_not_allowed") {
      toast.error("EMAIL GOOGLE CHƯA NẰM TRONG DANH SÁCH ĐƯỢC CẤP QUYỀN QUẢN TRỊ.");
    }

    if (authError === "missing_user") {
      toast.error("KHÔNG THỂ XÁC MINH THÔNG TIN TÀI KHOẢN GOOGLE.");
    }
  }, [authError]);

  const beginLoading = () => {
    setAttemptKey((value) => value + 1);
    setAnimationState("loading");
    setResultType(null);
    setResultMessage("");
  };

  const finishAttempt = (
    state: Extract<AdminLoginAnimationState, "success" | "error">,
    message: string,
  ) => {
    setResultType(state);
    setResultMessage(message);
    setAnimationState(state);
  };

  const handleAnimationResultComplete = (state: Extract<AdminLoginAnimationState, "success" | "error">) => {
    const fallbackMessage =
      state === "success"
        ? "ĐĂNG NHẬP THÀNH CÔNG. ĐANG CHUYỂN VÀO TRANG QUẢN TRỊ."
        : "THÔNG TIN ĐĂNG NHẬP KHÔNG CHÍNH XÁC.";
    const message = resultMessage || fallbackMessage;

    if (state === "success") {
      toast.success(message);
      window.setTimeout(() => {
        router.push(next);
        router.refresh();
      }, 300);
      return;
    }

    toast.error(message);
    window.setTimeout(() => {
      setAnimationState("idle");
      setResultType(null);
      setResultMessage("");
    }, 250);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    beginLoading();

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      finishAttempt("success", "ĐĂNG NHẬP THÀNH CÔNG. ĐANG CHUYỂN VÀO TRANG QUẢN TRỊ.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      finishAttempt("error", "THÔNG TIN ĐĂNG NHẬP KHÔNG CHÍNH XÁC HOẶC TÀI KHOẢN CHƯA ĐƯỢC CẤP QUYỀN.");
      return;
    }

    finishAttempt("success", "ĐĂNG NHẬP THÀNH CÔNG. ĐANG CHUYỂN VÀO TRANG QUẢN TRỊ.");
  };

  const onGoogleLogin = async () => {
    setGoogleLoading(true);
    beginLoading();

    const supabase = createClient();
    if (!supabase) {
      setGoogleLoading(false);
      finishAttempt("success", "ĐĂNG NHẬP THÀNH CÔNG. ĐANG CHUYỂN VÀO TRANG QUẢN TRỊ.");
      return;
    }

    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });
    setGoogleLoading(false);

    if (error) {
      finishAttempt("error", "KHÔNG THỂ BẮT ĐẦU ĐĂNG NHẬP GOOGLE. VUI LÒNG THỬ LẠI.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[0_20px_60px_rgba(2,6,23,0.15)]">
        <div className="mb-6 text-center">
          <AdminLoginAnimation
            state={animationState}
            attemptKey={attemptKey}
            onResultComplete={handleAnimationResultComplete}
          />
          <div className="flex flex-col items-center">
            <h1 className="font-heading text-2xl font-bold uppercase tracking-[0.08em] text-foreground">
              ĐĂNG NHẬP QUẢN TRỊ
            </h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            placeholder="EMAIL QUẢN TRỊ"
            className="h-11 rounded-xl"
          />
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="MẬT KHẨU"
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
          />
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
            {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </Button>
        </form>

        <div className="mt-3 flex items-center justify-between text-sm">
          <Link
            href="/auth/register"
            className="font-medium uppercase tracking-[0.08em] text-muted-foreground transition hover:text-foreground"
          >
            TẠO TÀI KHOẢN
          </Link>
          <Link
            href="/auth/forgot-password"
            className="font-medium uppercase tracking-[0.08em] text-muted-foreground transition hover:text-foreground"
          >
            QUÊN MẬT KHẨU?
          </Link>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          HOẶC
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          onClick={onGoogleLogin}
          disabled={googleLoading}
          variant="outline"
          className="h-11 w-full rounded-xl border-border bg-background"
        >
          <GoogleBrandIcon className="mr-2 size-[18px]" />
          {googleLoading ? "ĐANG CHUYỂN HƯỚNG..." : "ĐĂNG NHẬP VỚI GOOGLE"}
        </Button>
      </section>
    </main>
  );
}
