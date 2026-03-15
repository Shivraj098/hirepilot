"use client";
import { useToast } from "@/components/ui/toast-context";
import { Loader2 } from "lucide-react";
import { createResume } from "@/server/actions/resume.actions";
import { uploadResume } from "@/server/actions/upload-resume";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";
import ResumeDropzone from "./ResumeDropzone";
import { useState } from "react";

export default function ResumeUploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  

  const router = useRouter();
  const { showToast } = useToast();

  async function handleUpload() {
    if (!file || !title) return;

    try {
      setLoading(true);

      const resume = await createResume(title);

      if (!resume?.id) {
        throw new Error("Failed to create resume");
      }

      const version = await uploadResume(file, resume.id);

      if (!version) {
        throw new Error("Upload failed");
      }

      showToast("Resume uploaded", "success");

router.push(`/dashboard/${resume.id}`);
    } catch (err) {
      console.error(err);
      showToast("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 , scale: 0.98}}
      animate={{ opacity: 1, y: 0 , scale: 1 }}
      transition={{ duration: 0.15 }}
      className="w-full"
    >
      <div className="relative">

        <Card
          className="
            p-10
            space-y-8
            rounded-2xl
            border-border/60
            shadow-sm
            bg-background
          "
        >

          {/* Header */}

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Upload Resume
            </h1>

            <p className="text-sm text-muted-foreground max-w-md">
              Import your existing resume. HirePilot will parse, analyze,
              and generate an optimized version for job applications.
            </p>
          </div>

          {/* Title */}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Resume title
            </label>

            <Input
              placeholder="My Resume 2026"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              disabled={loading}
            />
          </div>

          {/* Dropzone */}

          <ResumeDropzone
            onFileSelect={(f) =>
              !loading && setFile(f)
            }
          />

          {/* Button */}

          <div className="flex justify-end">
            <Button
              disabled={!file || !title || loading}
              className="min-w-[140px]"
              onClick={handleUpload}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading
                </span>
              ) : (
                "Upload Resume"
              )}
            </Button>
          </div>

        </Card>

        {/* Overlay */}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="
              absolute
              inset-0
              rounded-2xl
              bg-background/80
              backdrop-blur-sm
              flex
              items-center
              justify-center
              z-10
            "
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />

              <p className="text-sm text-muted-foreground">
                Processing resume with AI...
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}