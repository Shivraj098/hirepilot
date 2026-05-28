import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hover = false,
  onClick,
}: CardProps) {
  const isInteractive = !!onClick || hover;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground",
        isInteractive && [
          "cursor-pointer",
          "transition-all duration-150",
          "hover:border-border/80 hover:bg-card/80",
        ],
        className
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}