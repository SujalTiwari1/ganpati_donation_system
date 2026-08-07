export interface SendTextPayload {

    recipient: string;

    message: string;

}

export interface SendDocumentPayload {

    recipient: string;

    fileName: string;

    mimeType: string;

    file: Buffer;

    caption?: string;

}

export interface SendTemplatePayload {

    recipient: string;

    templateName: string;

    languageCode: string;

    mediaId: string;

    fileName: string;

    donorName: string;

    amount: string;

}
export interface MessagingResult {
    success: boolean;

    providerMessageId?: string;

    providerMediaId?: string;

    providerName: "whatsapp";

    error?: string;
}