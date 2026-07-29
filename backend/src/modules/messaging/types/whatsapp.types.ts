export interface WhatsAppUploadResponse {

    id: string;

}


export interface WhatsAppSendMessageResponse {

    messaging_product: string;

    contacts: {

        input: string;

        wa_id: string;

    }[];

    messages: {

        id: string;

    }[];

}

export interface WhatsAppErrorResponse {

    error: {

        message: string;

        type: string;

        code: number;

        fbtrace_id: string;

    };

}