import clsx from "clsx";

export default function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning";
}) {
  const styles = {
    default: "bg-muted text-foreground",
    success: "bg-green-500/10 text-green-600",
    danger: "bg-red-500/10 text-red-600",
    warning: "bg-yellow-500/10 text-yellow-700",
  };

  return (
    <span
      className={clsx(
        "px-2 py-0.5 text-xs rounded-md border",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
}