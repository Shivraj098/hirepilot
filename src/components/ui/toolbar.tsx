import { ReactNode } from "react";

export default function Toolbar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
      flex
      items-center
      justify-between
      gap-2
    "
    >
      {children}
    </div>
  );
}