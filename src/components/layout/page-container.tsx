import { ReactNode } from "react";
import clsx from "clsx";

export default function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "px-8 py-8",
        "max-w-7xl mx-auto w-full",
        className
      )}
    >
      {children}
    </div>
  );
}