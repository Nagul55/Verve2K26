"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-600 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-600 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-600 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-eventrix-black shrink-0" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-eventrix-black group-[.toaster]:border group-[.toaster]:border-[#E2E2E8] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:font-sans group-[.toaster]:text-xs group-[.toaster]:font-semibold group-[.toaster]:gap-3 group-[.toaster]:items-center",
          title: "group-[.toast]:text-eventrix-black group-[.toast]:font-semibold group-[.toast]:text-xs",
          description: "group-[.toast]:text-eventrix-muted group-[.toast]:text-xs",
        },
        duration: 3500,
      }}
      {...props}
    />
  )
}

export { Toaster }
