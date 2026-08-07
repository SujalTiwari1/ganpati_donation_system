import type {

    MessagingResult,

    SendDocumentPayload,

    SendTextPayload,

    SendTemplatePayload,

} from "../types";

export interface IMessagingProvider {

    sendText(

        payload: SendTextPayload

    ): Promise<MessagingResult>;

    sendDocument(

        payload: SendDocumentPayload

    ): Promise<MessagingResult>;

    uploadMedia(

        file: Buffer,

        fileName: string,

        mimeType: string

    ): Promise<string>;

    sendTemplate(

        payload: SendTemplatePayload

    ): Promise<MessagingResult>;

}