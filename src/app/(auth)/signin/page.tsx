"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function SigninPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setServerError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-primary-foreground font-semibold">
            HirePilot
          </span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-primary-foreground leading-tight">
              Land your next role
              <br />
              with AI precision
            </h1>
            <p className="text-primary-foreground/60 text-lg leading-relaxed">
              AI-powered resume optimization, job tracking, and career intelligence — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "ATS Score", value: "94%" },
              { label: "Match Rate", value: "3.2×" },
              { label: "Resumes", value: "Unlimited" },
              { label: "AI Features", value: "12+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10"
              >
                <p className="text-primary-foreground/50 text-xs">
                  {stat.label}
                </p>
                <p className="text-primary-foreground font-semibold text-lg">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-foreground/30 text-sm">
          © 2026 HirePilot
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">HirePilot</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              error={errors.email}
              disabled={loading}
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                error={errors.password}
                disabled={loading}
                autoComplete="current-password"
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            {serverError && (
              <div className="px-3 py-2.5 rounded-xl bg-destructive/8 border border-destructive/20">
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              loadingText="Signing in..."
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-foreground font-medium hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}