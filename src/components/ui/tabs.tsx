"use client";

import { ReactNode, useState } from "react";
import clsx from "clsx";

export type Tab = {
  label: string;
  value: string;
  content: ReactNode;
};

export default function Tabs({
  tabs,
  defaultValue,
}: {
  tabs: Tab[];
  defaultValue?: string;
}) {
  const [active, setActive] = useState(
    defaultValue ?? tabs[0].value
  );

  const current = tabs.find(
    (t) => t.value === active
  );

  return (
    <div className="space-y-4">

      <div className="flex gap-2 border-b border-border">

        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={clsx(
              "px-3 py-2 text-sm",
              "border-b-2",
              active === tab.value
                ? "border-foreground"
                : "border-transparent text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}

      </div>

      <div>
        {current?.content}
      </div>

    </div>
  );
}