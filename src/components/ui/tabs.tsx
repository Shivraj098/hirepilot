"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type Tab = {
  label: string;
  value: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
};

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  urlParam?: string;
  className?: string;
}

export default function Tabs({
  tabs,
  defaultValue,
  urlParam,
  className,
}: TabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlValue = urlParam ? searchParams.get(urlParam) : null;
  const initialValue = urlValue ?? defaultValue ?? tabs[0]?.value ?? "";

  const [localActive, setLocalActive] = useState(initialValue);

  // If urlParam provided use URL as source of truth, else use local state
  const activeTab = urlParam ? (urlValue ?? initialValue) : localActive;

  const handleTabChange = (value: string) => {
    if (urlParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(urlParam, value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      setLocalActive(value);
    }
  };

  const current = tabs.find((t) => t.value === activeTab);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className="flex gap-0.5 p-1 bg-muted/50 rounded-xl w-fit max-w-full overflow-x-auto"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            role="tab"
            aria-selected={activeTab === tab.value}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5",
              "text-sm rounded-lg whitespace-nowrap",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === tab.value
                ? "bg-background text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon && (
              <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>
            )}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0.5 text-xs rounded-md",
                  activeTab === tab.value
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/50 text-muted-foreground",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
