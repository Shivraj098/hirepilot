export default function Timeline({
  items,
}: {
  items: { id: string; label: string; time?: string }[];
}) {
  return (
    <div className="space-y-4">

      {items.map((item) => (

        <div
          key={item.id}
          className="
          border-l
          pl-4
          space-y-1
        "
        >
          <p className="font-medium">
            {item.label}
          </p>

          {item.time && (
            <p className="text-xs text-muted-foreground">
              {item.time}
            </p>
          )}

        </div>

      ))}

    </div>
  );
}