import QRCode from 'qrcode';

/**
 * Generates a Base64 encoded PNG of the QR code.
 * The payload contains the participant ID which the Admin scanner will read.
 */
export const generateTicketQR = async (participantId: string, subEventId?: string): Promise<string> => {
  try {
    // The data that will be read by the scanner
    const payload = JSON.stringify({ 
      pid: participantId, 
      event_id: subEventId || null,
      sub_event_id: subEventId || null,
      eventId: subEventId || null
    });
    
    // Returns a base64 Data URI (data:image/png;base64,...)
    const qrDataUri = await QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return qrDataUri;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Could not generate QR ticket');
  }
};
