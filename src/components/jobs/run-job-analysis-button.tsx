"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { analyzeJobForUser } from "@/server/actions/resume.actions";

export default function RunJobAnalysisButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleRun = async () => {
    setLoading(true);
    try {
      await analyzeJobForUser(jobId);
      showToast(
        "Analysis complete",
        "ai",
        "Job intelligence, match score, and skill gap updated",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Analysis failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRun}
      loading={loading}
      loadingText="Analyzing..."
      variant="ai"
      size="sm"
      icon={<Sparkles className="w-3.5 h-3.5" />}
    >
      Run AI Analysis
    </Button>
  );
}
