import React from "react";
import { Metadata } from "next";
import { ForgotPasswordClient } from "@/features/auth/components/ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Forgot Password | Eventrix",
  description: "Reset your Eventrix account password using email verification.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
