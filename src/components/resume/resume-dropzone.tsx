"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface ResumeDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ResumeDropzone({
  onFileSelect,
  disabled = false,
}: ResumeDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const err = fileRejections[0]?.errors?.[0]?.message ?? "Invalid file";
        setError(err);
        return;
      }

      const f = acceptedFiles[0];
      if (!f) return;

      if (f.size > MAX_SIZE) {
        setError("File must be under 5MB");
        return;
      }

      setFile(f);
      onFileSelect(f);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled,
    maxSize: MAX_SIZE,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl",
          "h-36 flex flex-col items-center justify-center gap-2",
          "cursor-pointer transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragActive
            ? "border-[--ai] bg-[--ai-muted]"
            : file
              ? "border-[--success]/40 bg-[--success]/5"
              : error
                ? "border-destructive/40 bg-destructive/5"
                : "border-border bg-muted/30 hover:bg-muted/50 hover:border-border/80",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 text-[--success]">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              {!disabled && (
                <button
                  onClick={removeFile}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted transition-colors"
                  type="button"
                  aria-label="Remove file"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              key="drag"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-[--ai]"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Drop it here</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your resume here
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PDF or DOCX · Max 5MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs text-destructive px-1">{error}</p>}
    </div>
  );
}
