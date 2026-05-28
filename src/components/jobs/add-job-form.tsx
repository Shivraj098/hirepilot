"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Sparkles,
  Link as LinkIcon,
  MapPin,
  Building2,
  FileText,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-context";
import { createJob } from "@/server/actions/job.actions";
import { importJobFromUrl } from "@/server/actions/import-job-from-url";
import { cn } from "@/lib/utils";

type Mode = "manual" | "url";

export default function AddJobForm() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("manual");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    jobLink: "",
    description: "",
  });
  const { showToast } = useToast();

  const reset = () => {
    setForm({
      title: "",
      company: "",
      location: "",
      jobLink: "",
      description: "",
    });
    setUrl("");
    setMode("manual");
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) {
      showToast("Title, company and description are required", "error");
      return;
    }

    setLoading(true);
    try {
      await createJob({
        title: form.title,
        company: form.company,
        description: form.description,
        location: form.location || undefined,
        jobLink: form.jobLink || undefined,
      });
      showToast(
        "Job added successfully",
        "success",
        "AI analysis running in background",
      );
      handleClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to add job",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      showToast("Please enter a job URL", "error");
      return;
    }

    setLoading(true);
    try {
      await importJobFromUrl(url);
      showToast(
        "Job imported successfully",
        "ai",
        "AI extracted job details automatically",
      );
      handleClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to import job",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={<Plus className="w-4 h-4" />}
        size="md"
      >
        Add Job
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-sm font-semibold">Add Job</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mode switcher */}
                <div className="px-5 pt-4">
                  <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
                    <button
                      onClick={() => setMode("manual")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                        mode === "manual"
                          ? "bg-background text-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Manual
                    </button>
                    <button
                      onClick={() => setMode("url")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                        mode === "url"
                          ? "bg-background text-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Import from URL
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                  <AnimatePresence mode="wait">
                    {mode === "url" ? (
                      <motion.form
                        key="url"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        onSubmit={handleUrlImport}
                        className="space-y-4"
                      >
                        <div className="p-3 rounded-xl ai-gradient border border-[--ai-border] flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-[--ai] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-[--ai]">
                              AI Import
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Paste a job posting URL and AI will extract the
                              title, company, description and skills
                              automatically.
                            </p>
                          </div>
                        </div>

                        <Input
                          label="Job posting URL"
                          type="url"
                          placeholder="https://jobs.company.com/role/..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          icon={<LinkIcon className="w-3.5 h-3.5" />}
                          disabled={loading}
                        />

                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleClose}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            loading={loading}
                            loadingText="Importing..."
                            icon={<Sparkles className="w-4 h-4" />}
                          >
                            Import Job
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="manual"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        onSubmit={handleManualSubmit}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Job title"
                            placeholder="Software Engineer"
                            value={form.title}
                            onChange={(e) =>
                              setForm({ ...form, title: e.target.value })
                            }
                            icon={<Briefcase className="w-3.5 h-3.5" />}
                            disabled={loading}
                          />
                          <Input
                            label="Company"
                            placeholder="Acme Corp"
                            value={form.company}
                            onChange={(e) =>
                              setForm({ ...form, company: e.target.value })
                            }
                            icon={<Building2 className="w-3.5 h-3.5" />}
                            disabled={loading}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Location"
                            placeholder="Remote / New York"
                            value={form.location}
                            onChange={(e) =>
                              setForm({ ...form, location: e.target.value })
                            }
                            icon={<MapPin className="w-3.5 h-3.5" />}
                            disabled={loading}
                          />
                          <Input
                            label="Job URL"
                            placeholder="https://..."
                            value={form.jobLink}
                            onChange={(e) =>
                              setForm({ ...form, jobLink: e.target.value })
                            }
                            icon={<LinkIcon className="w-3.5 h-3.5" />}
                            disabled={loading}
                          />
                        </div>

                        <Textarea
                          label="Job description"
                          placeholder="Paste the full job description here — the more detail, the better the AI analysis..."
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          rows={5}
                          disabled={loading}
                          hint="Paste the complete job posting for best AI analysis results"
                        />

                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleClose}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            loading={loading}
                            loadingText="Adding job..."
                            icon={<Plus className="w-4 h-4" />}
                          >
                            Add Job
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
