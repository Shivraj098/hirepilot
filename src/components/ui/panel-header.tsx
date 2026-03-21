import { ReactNode } from "react";

export default function PanelHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex justify-between items-center mb-4">

      <h2 className="font-semibold">
        {title}
      </h2>

      {actions && (
        <div>
          {actions}
        </div>
      )}

    </div>
  );
}