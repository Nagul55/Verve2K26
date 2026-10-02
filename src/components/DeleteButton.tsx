"use client";

import React, { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  id: string;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  itemType: string;
}

export function DeleteButton({ id, onDelete, itemType }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      startTransition(async () => {
        const { success, error } = await onDelete(id);
        if (success) {
          router.refresh();
        } else {
          alert(`Error deleting ${itemType}: ${error}`);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 font-bold text-xs uppercase hover:text-red-700 transition-colors editorial-label flex items-center gap-1 disabled:opacity-50"
      title={`Delete ${itemType}`}
    >
      <Trash2 className="w-3.5 h-3.5" /> {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
