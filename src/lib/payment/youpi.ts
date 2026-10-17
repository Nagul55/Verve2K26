import crypto from 'node:crypto';

const YOUPI_API_URL = process.env.YOUPI_API_URL || 'http://localhost:6100';
const YOUPI_CHECKOUT_URL = process.env.YOUPI_CHECKOUT_URL || 'http://localhost:7000';
const YOUPI_WEBHOOK_SECRET = process.env.YOUPI_WEBHOOK_SECRET || 'youpi_dev_webhook_secret_key_12345';
const YOUPI_MERCHANT_ID = process.env.YOUPI_MERCHANT_ID || '00000000-0000-0000-0000-000000000001';

export interface InitiatePaymentParams {
  orderId: string;
  amount: number; // in INR (e.g. 150)
  festName: string;
  customer: {
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentSessionResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount?: string;
  currency?: string;
  status?: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Initiates a UPI payment session through the local/hosted YouPI-PG instance.
 */
export async function initiateYoupiPayment(params: InitiatePaymentParams): Promise<PaymentSessionResponse> {
  try {
    const formattedAmount = Number(params.amount).toFixed(2);

    const payload = {
      orderId: params.orderId,
      amount: formattedAmount,
      currency: 'INR',
      returnUrl: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registrations?payment_success=true`,
      customer: {
        fullName: params.customer.fullName,
        email: params.customer.email,
        phoneNumber: params.customer.phoneNumber || '9999999999'
      },
      metadata: {
        festName: params.festName,
        source: 'Eventrix_Fest_Portal',
        ...(params.metadata || {})
      },
      autoActivate: true
    };

    const res = await fetch(`${YOUPI_API_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Merchant-Id': YOUPI_MERCHANT_ID
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `YouPI-PG error (${res.status}): ${errText}` };
    }

    const data = await res.json();
    return {
      success: true,
      paymentId: data.paymentId,
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      checkoutUrl: data.checkoutUrl || `${YOUPI_CHECKOUT_URL}/checkout/${data.paymentId}`
    };
  } catch (err: any) {
    console.error('Failed to initiate YouPI payment:', err);
    return {
      success: false,
      error: `Could not connect to YouPI Payment Gateway: ${err.message}. Make sure the gateway is running on ${YOUPI_API_URL}.`
    };
  }
}

/**
 * Checks the live status of a payment session from YouPI-PG.
 */
export async function checkYoupiPaymentStatus(paymentId: string) {
  try {
    const res = await fetch(`${YOUPI_API_URL}/api/v1/checkout/${paymentId}/state`);
    if (res.ok) {
      return await res.json();
    }
    const fallbackRes = await fetch(`${YOUPI_API_URL}/api/v1/payments/${paymentId}`);
    if (fallbackRes.ok) return await fallbackRes.json();
    return null;
  } catch (err) {
    console.error('Failed to query YouPI payment status:', err);
    return null;
  }
}

/**
 * For Local Testing & Dev: Injects a synthetic banking observation to simulate 100% instant successful UPI payment!
 */
export async function simulatePaymentSuccess(paymentId: string, amount: number) {
  try {
    // 1. Ensure Developer Test Mode is active
    await fetch(`${YOUPI_API_URL}/api/v1/admin/dev/test-mode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-id': YOUPI_MERCHANT_ID
      },
      body: JSON.stringify({ enabled: true })
    }).catch(() => {});

    // 2. Format bank SMS content with matching amount and valid 12-digit reference
    const formattedAmt = Number(amount).toFixed(2);
    const refId = Date.now().toString().slice(-12).padStart(12, '9');

    const res = await fetch(`${YOUPI_API_URL}/api/v1/admin/dev/simulator/inject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-id': YOUPI_MERCHANT_ID
      },
      body: JSON.stringify({
        paymentSessionId: paymentId,
        source: 'SMS',
        sender: 'HDFCBK',
        content: `A/C XX9999 credited with Rs ${formattedAmt} CR. Ref ${refId}`
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Simulator injection response:', text);
      return { success: false, error: text };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error('Simulator error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Verifies the HMAC-SHA256 signature sent with YouPI webhooks.
 */
export function verifyYoupiWebhook(rawBody: string, signatureHeader?: string | null): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const expectedSig = signatureHeader.replace('sha256=', '');
  const computedHash = crypto
    .createHmac('sha256', YOUPI_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedSig));
}
