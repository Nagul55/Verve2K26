"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { getFestById, registerForEvents } from "./event.actions";
import { initiateYoupiPayment, checkYoupiPaymentStatus, simulatePaymentSuccess } from "@/lib/payment/youpi";

export async function createFestPaymentSession(festId: string, subEventIds: string[]) {
  const { user, profile } = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Please log in to register." };
  }

  const fest = await getFestById(festId);
  if (!fest) {
    return { success: false, error: "Fest not found." };
  }

  // Extract fee from column or description tag
  let fee = 0;
  if (typeof (fest as any).registration_fee === 'number') {
    fee = (fest as any).registration_fee;
  } else if (fest.description) {
    const match = fest.description.match(/\[REGISTRATION_FEE:\s*([0-9.]+)\]/i);
    if (match) fee = parseFloat(match[1]);
  }

  // Free fest
  if (!fee || fee <= 0) {
    return { success: true, isFree: true, amount: 0 };
  }

  // Unique Order ID
  const orderId = `ORD_${festId.split('-')[0].toUpperCase()}_${user.id.split('-')[0].toUpperCase()}_${Date.now()}`;

  const paymentRes = await initiateYoupiPayment({
    orderId,
    amount: fee,
    festName: fest.name,
    customer: {
      fullName: profile?.full_name || user.user_metadata?.full_name || user.email || 'Participant',
      email: user.email || '',
      phoneNumber: profile?.mobile || user.user_metadata?.mobile || '9894997192'
    },
    metadata: {
      festId,
      subEventIds,
      userId: user.id
    }
  });

  if (!paymentRes.success) {
    return { success: false, error: paymentRes.error };
  }

  return {
    success: true,
    isFree: false,
    orderId,
    amount: fee,
    paymentId: paymentRes.paymentId,
    checkoutUrl: paymentRes.checkoutUrl
  };
}

/**
 * Checks if the YouPI payment succeeded, then confirms registration.
 */
export async function verifyAndCompletePaidRegistration(
  paymentId: string,
  festId: string,
  subEventIds: string[],
  teamNames?: Record<string, string>,
  teamMembers?: Record<string, string>
) {
  // Query status from YouPI Gateway
  const statusRes = await checkYoupiPaymentStatus(paymentId);
  const isPaid = statusRes?.status === 'SUCCESS' || statusRes?.status === 'PROCESSING';

  if (!isPaid) {
    return { 
      success: false, 
      error: `Payment status is ${statusRes?.status || 'PENDING'}. Please complete UPI payment first.` 
    };
  }

  // Register for fest
  const regRes = await registerForEvents(festId, subEventIds, teamNames, teamMembers);
  return regRes;
}

/**
 * Developer helper: Simulates payment success via synthetic banking SMS for local testing.
 */
export async function testSimulateYoupiPayment(paymentId: string, amount: number) {
  return await simulatePaymentSuccess(paymentId, amount);
}
