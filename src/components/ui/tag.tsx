export default function Tag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="
      px-2 py-1
      text-xs
      border
      border-border
      rounded-md
    "
    >
      {children}
    </span>
  );
}