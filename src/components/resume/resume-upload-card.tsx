"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, FileText, ArrowRight } from "lucide-react";
import { createResume } from "@/server/actions/resume.actions";
import { uploadResume } from "@/server/actions/upload-resume";
import { useToast } from "@/components/ui/toast-context";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import ResumeDropzone from "./resume-dropzone";
import LoadingOverlay from "@/components/ui/loading-overlay";

const STEPS = [
  { label: "Uploading file", icon: FileText },
  { label: "Parsing content", icon: FileText },
  { label: "Running AI analysis", icon: Sparkles },
  { label: "Calculating ATS score", icon: Sparkles },
];

export default function ResumeUploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleUpload() {
    if (!file || !title.trim()) return;

    try {
      setLoading(true);
      setStep(0);

      const resume = await createResume(title.trim());
      if (!resume?.id) throw new Error("Failed to create resume");

      setStep(1);
      const version = await uploadResume(file, resume.id);
      if (!version) throw new Error("Upload failed");

      setStep(2);
      await new Promise((r) => setTimeout(r, 600));

      setStep(3);
      await new Promise((r) => setTimeout(r, 400));

      showToast(
        "Resume uploaded successfully",
        "ai",
        "AI analysis is running in the background"
      );

      router.push(`/dashboard/resumes/${resume.id}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Upload failed",
        "error"
      );
    } finally {
      setLoading(false);
      setStep(0);
    }
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl ai-gradient border border-[--ai-border]">
              <Sparkles className="w-4 h-4 text-[--ai]" />
            </div>
            <span className="text-xs font-medium text-[--ai] uppercase tracking-wide">
              AI Powered
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Upload your resume
          </h1>
          <p className="text-muted-foreground text-sm">
            HirePilot will parse, analyze, and score your resume automatically.
          </p>
        </div>

        {/* What happens next */}
        <div className="grid grid-cols-2 gap-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border"
            >
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs text-muted-foreground font-medium">
                  {i + 1}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            label="Resume title"
            placeholder="e.g. Software Engineer Resume 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            hint="Give it a memorable name to identify it later"
          />

          <ResumeDropzone
            onFileSelect={(f) => !loading && setFile(f)}
            disabled={loading}
          />

          <Button
            disabled={!file || !title.trim() || loading}
            className="w-full"
            size="lg"
            loading={loading}
            loadingText={STEPS[step]?.label ?? "Processing..."}
            icon={<Sparkles className="w-4 h-4" />}
            iconRight={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}
            onClick={handleUpload}
            type="button"
          >
            Upload & Analyze
          </Button>
        </div>
      </motion.div>

      {loading && (
        <LoadingOverlay
          text={STEPS[step]?.label ?? "Processing..."}
          step={step}
          totalSteps={STEPS.length}
        />
      )}
    </div>
  );
}