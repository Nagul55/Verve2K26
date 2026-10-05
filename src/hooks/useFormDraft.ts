"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseFormDraftOptions<T> {
  key: string;
  initialValues: T;
  excludeKeys?: (keyof T)[];
  daysToLive?: number;
  showRestoredToast?: boolean;
}

const DEFAULT_TTL_DAYS = 7;

export function useFormDraft<T extends Record<string, any>>({
  key,
  initialValues,
  excludeKeys = [],
  daysToLive = DEFAULT_TTL_DAYS,
  showRestoredToast = false,
}: UseFormDraftOptions<T>) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [isRestored, setIsRestored] = useState(false);
  const isInitialized = useRef(false);

  // 1. On Mount: Restore draft from localStorage if valid & not expired
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const { data, savedAt } = parsed || {};

        if (savedAt && Date.now() - savedAt < daysToLive * 24 * 60 * 60 * 1000) {
          if (data && typeof data === "object") {
            const sanitizedData = { ...data };
            // Strip any excluded keys in case they were persisted
            excludeKeys.forEach((k) => delete sanitizedData[k]);

            const hasValues = Object.values(sanitizedData).some(
              (val) => val !== "" && val !== null && val !== undefined
            );

            if (hasValues) {
              setFormData((prev) => ({ ...prev, ...sanitizedData }));
              setIsRestored(true);
              if (showRestoredToast) {
                toast.info("Draft restored", { id: `${key}_restored` });
              }
            }
          }
        } else {
          // Expired draft, purge it
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error(`Error restoring draft for ${key}:`, e);
    } finally {
      isInitialized.current = true;
    }
  }, [key]);

  // 2. Auto-Save draft whenever formData updates (excluding sensitive keys)
  useEffect(() => {
    if (!isInitialized.current) return;

    try {
      const draftData: Record<string, any> = { ...formData };
      excludeKeys.forEach((k) => delete draftData[k as string]);

      const hasValues = Object.values(draftData).some(
        (val) => val !== "" && val !== null && val !== undefined
      );

      if (hasValues) {
        localStorage.setItem(
          key,
          JSON.stringify({
            data: draftData,
            savedAt: Date.now(),
          })
        );
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error(`Error saving draft for ${key}:`, e);
    }
  }, [key, formData, excludeKeys]);

  // Helper to clear draft from storage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error clearing draft for ${key}:`, e);
    }
  }, [key]);

  // Helper to reset form state and clear draft
  const resetForm = useCallback(
    (newValues?: Partial<T>) => {
      clearDraft();
      setFormData(newValues ? ({ ...initialValues, ...newValues } as T) : initialValues);
    },
    [clearDraft, initialValues]
  );

  return {
    formData,
    setFormData,
    clearDraft,
    resetForm,
    isRestored,
  };
}
