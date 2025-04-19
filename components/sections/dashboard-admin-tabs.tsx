"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

export const DashboardAdminTabs: FC = () => {
  const pathname = usePathname();

  const tabs = [
    { label: "Categories", href: "/dashboard/admin/categories" },
    { label: "Prices", href: "/dashboard/admin/prices" },
  ];

  return (
    <nav className="flex border-b border-neutral-light" aria-label="Admin navigation">
      <div className="flex space-x-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 font-medium text-sm inline-flex items-center transition-colors
                ${
                  isActive
                    ? "text-brand-medium border-b-2 border-brand-medium -mb-px"
                    : "text-neutral-darker hover:text-neutral-black hover:bg-neutral-lightest"
                }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
