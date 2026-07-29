// =============================================
// WhatsApp API Endpoints
// =============================================

export const WHATSAPP_ENDPOINTS = {
    MEDIA: "media",
    MESSAGES: "messages",
} as const;

// =============================================
// Document Configuration
// =============================================

export const WHATSAPP_DOCUMENT = {
    FILE_NAME: "Donation-Receipt.pdf",
    MIME_TYPE: "application/pdf",
} as const;

// =============================================
// Module Messages
// =============================================

export const WHATSAPP_MESSAGES = {
    SUCCESS: "WhatsApp message sent successfully.",

    DISABLED: "WhatsApp messaging is disabled.",

    INVALID_PHONE_NUMBER: "Invalid WhatsApp phone number.",

    MEDIA_UPLOAD_FAILED: "Failed to upload media to WhatsApp.",

    DOCUMENT_SEND_FAILED:
        "Failed to send WhatsApp document.",

    TEXT_SEND_FAILED:
        "Failed to send WhatsApp text message.",
} as const;