import { Resend } from 'resend';

// The RESEND_API_KEY will need to be added to .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTicketEmail = async (
  email: string, 
  fullName: string, 
  qrDataUri: string
) => {
  try {
    // Strip the "data:image/png;base64," prefix for the attachment
    const base64Data = qrDataUri.split(',')[1];

    const { data, error } = await resend.emails.send({
      from: 'Verve26 Tickets <onboarding@resend.dev>', // Default testing domain
      to: [email],
      subject: '🎟️ Your Official Verve26 Ticket',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h1 style="color: #2563eb;">Welcome to Verve26, ${fullName}!</h1>
          <p style="font-size: 16px; color: #333;">Your registration is completely confirmed.</p>
          <p style="font-size: 16px; color: #333;">Please find your official Entry Ticket attached to this email.</p>
          <div style="background-color: #fef08a; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #854d0e;">
              IMPORTANT: You must present the attached QR code at the entrance to be scanned by our coordinators.
            </p>
          </div>
          <p style="color: #666;">See you at the fest!</p>
          <p style="color: #666; font-weight: bold;">- The Verve26 Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'verve26-ticket.png',
          content: base64Data,
        }
      ]
    });

    if (error) {
      console.error('Resend API Error:', error);
      throw new Error('Failed to send email via Resend');
    }

    return data;
  } catch (error) {
    console.error('Error sending ticket email:', error);
    throw new Error('Failed to dispatch email');
  }
};
