"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";

type Props = {
  onFileSelect: (file: File) => void;
};

export default function ResumeDropzone({ onFileSelect }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      setFileName(file.name);
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

return (
  <motion.div layout className="space-y-2">

    <motion.div
      whileHover={{ scale: 1.01 }}
      animate={{
        boxShadow: isDragActive
          ? "0 0 0 2px rgba(59,130,246,0.6)"
          : "0 0 0 1px rgba(0,0,0,0)",
      }}
      className="rounded-xl"
    >
      <div
        {...getRootProps()}
        className={`
          border-2
          border-dashed
          rounded-xl
          h-44
          flex
          flex-col
          items-center
          justify-center
          gap-3
          text-center
          cursor-pointer
          transition-all
          duration-150

          ${
            isDragActive
              ? "border-blue-500 bg-blue-500/5"
              : "border-border bg-muted/30 hover:bg-muted/40"
          }
        `}
      >
        <input {...getInputProps()} />

        {fileName ? (
          <>
            <FileText className="w-7 h-7" />

            <p className="text-sm font-medium">
              {fileName}
            </p>

            <p className="text-xs text-muted-foreground">
              Drop another file to replace
            </p>
          </>
        ) : (
          <>
            <Upload className="w-7 h-7" />

            <p className="text-sm font-medium">
              Drag & drop resume
            </p>

            <p className="text-xs text-muted-foreground">
              PDF or DOCX • Max 5MB
            </p>
          </>
        )}

      </div>
    </motion.div>

  </motion.div>
);
}
