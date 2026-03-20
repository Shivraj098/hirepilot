import clsx from "clsx";

export default function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border/60",
        "bg-card",
        "p-5",
        "space-y-1",
        "transition-all duration-200",
        "hover:shadow-md",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}