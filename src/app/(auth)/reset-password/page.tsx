import React from "react";
import { Metadata } from "next";
import { ResetPasswordClient } from "@/features/auth/components/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password | Eventrix",
  description: "Set a new secure password for your Eventrix account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
