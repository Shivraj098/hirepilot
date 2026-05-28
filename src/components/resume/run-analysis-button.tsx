"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { runResumeAnalysis } from "@/server/actions/analysis.action";

export default function RunAnalysisButton({
  resumeId,
}: {
  resumeId: string;
}) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleRun = async () => {
    setLoading(true);
    try {
      await runResumeAnalysis(resumeId);
      showToast("Analysis complete", "ai", "ATS score and insights updated");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Analysis failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRun}
      loading={loading}
      loadingText="Analyzing with AI..."
      variant="ai"
      icon={<Sparkles className="w-4 h-4" />}
    >
      Run AI Analysis
    </Button>
  );
}