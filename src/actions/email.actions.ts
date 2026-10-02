"use server";

import { Resend } from "resend";
import QRCode from "qrcode";

export async function sendTicketEmail(participantEmail: string, participantName: string, selectedEvents: any[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. Email skipped.");
    return { success: false, error: "Missing API Key" };
  }

  const resend = new Resend(apiKey);

  try {
    // Generate QR codes for each event
    const eventsWithQRs = await Promise.all(
      selectedEvents.map(async (event) => {
        // Generate a secure payload (in production this would be signed)
        const payload = JSON.stringify({
          participant: participantName,
          email: participantEmail,
          eventId: event.event_id,
          eventName: event.name
        });
        
        const qrDataUrl = await QRCode.toDataURL(payload, {
          color: { dark: "#080B18", light: "#F8F8FA" },
          margin: 2
        });

        return { ...event, qrDataUrl };
      })
    );

    // Build the HTML template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8F8FA; color: #080B18; padding: 40px 20px;">
        <div style="background-color: #080B18; padding: 30px; text-align: center;">
          <h1 style="color: #A98BFF; margin: 0; font-size: 32px; letter-spacing: 2px;">VERVE26</h1>
          <p style="color: #E7DFFF; margin-top: 10px; font-size: 12px; letter-spacing: 4px;">OFFICIAL TICKET</p>
        </div>
        
        <div style="background-color: #FFFFFF; padding: 40px 30px; border: 1px solid #D9D9DF; margin-top: -10px;">
          <h2 style="margin-top: 0;">Registration Confirmed!</h2>
          <p>Hi <strong>${participantName}</strong>,</p>
          <p>Your registration for Verve26 is confirmed. Below are your individual event tickets. Present these QR codes at the respective venues.</p>
          
          <hr style="border: none; border-top: 1px solid #D9D9DF; margin: 30px 0;" />
          
          ${eventsWithQRs.map(event => `
            <div style="margin-bottom: 40px;">
              <div style="display: inline-block; background-color: #E7DFFF; color: #24134F; padding: 4px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                ${event.category}
              </div>
              <h3 style="margin: 0 0 5px 0;">${event.name}</h3>
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #596078;">
                📅 ${event.event_date} | ⏰ ${event.start_time} | 📍 ${event.venue}
              </p>
              <img src="${event.qrDataUrl}" alt="QR Ticket" style="width: 150px; height: 150px; border: 1px solid #D9D9DF; padding: 10px; border-radius: 8px;" />
            </div>
          `).join('')}
          
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #596078;">
          <p>If you plan to participate in a team event, make sure your team leader adds your Registration Email on the Team Portal.</p>
          <p>Need help? Contact support@verve26.com</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Verve26 <onboarding@resend.dev>', // Free tier must use onboarding domain
      to: participantEmail,
      subject: 'Your Verve26 Tickets are Confirmed!',
      html: htmlContent,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to generate QR or send email:", err);
    return { success: false, error: err.message };
  }
}
