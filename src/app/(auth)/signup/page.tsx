"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const passwordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const strengthColors = [
  "",
  "bg-destructive",
  "bg-[--warning]",
  "bg-[--warning]",
  "bg-[--success]",
  "bg-[--success]",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const strength = passwordStrength(form.password);

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

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/signin?registered=true");
    } else {
      setServerError(data.error ?? "Something went wrong");
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
          <h1 className="text-4xl font-semibold text-primary-foreground leading-tight">
            Your AI-powered
            <br />
            career co-pilot
          </h1>

          <div className="space-y-3">
            {[
              "ATS score analysis across all resume sections",
              "AI-powered resume tailoring for each job",
              "Real-time skill gap identification",
              "Interview preparation with STAR method drafts",
              "Job pipeline tracking and insights",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-primary-foreground/70 text-sm">
                  {feature}
                </span>
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
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">HirePilot</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Free forever — no credit card required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              disabled={loading}
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              disabled={loading}
              autoComplete="email"
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                error={errors.password}
                disabled={loading}
                autoComplete="new-password"
              />

              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-200",
                          i < strength
                            ? strengthColors[strength]
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              error={errors.confirmPassword}
              disabled={loading}
              autoComplete="new-password"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {showPassword ? "Hide" : "Show"} passwords
              </button>
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
              loadingText="Creating account..."
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-foreground font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}