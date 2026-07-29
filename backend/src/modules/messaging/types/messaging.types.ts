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
export interface MessagingResult {
    success: boolean;

    providerMessageId?: string;

    providerMediaId?: string;

    providerName: "whatsapp";

    error?: string;
}