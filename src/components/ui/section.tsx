import { ReactNode } from "react";
import clsx from "clsx";

export default function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "space-y-4",
        className
      )}
    >
      {children}
    </section>
  );
}