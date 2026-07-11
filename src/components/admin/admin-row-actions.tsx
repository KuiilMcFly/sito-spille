"use client";

import Link from "next/link";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";

type AdminRowActionsProps = {
  editHref: string;
  deleteApiUrl: string;
  resourceLabel: string;
};

export function AdminRowActions({ editHref, deleteApiUrl, resourceLabel }: AdminRowActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <Link href={editHref} className="text-brand-400 hover:underline">
        Modifica
      </Link>
      <DeleteResourceButton
        apiUrl={deleteApiUrl}
        resourceLabel={resourceLabel}
        variant="link"
      />
    </div>
  );
}
