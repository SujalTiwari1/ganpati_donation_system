import type {

    MessagingResult,

    SendDocumentPayload,

    SendTextPayload,

} from "../types";

export interface IMessagingProvider {

    sendText(

        payload: SendTextPayload

    ): Promise<MessagingResult>;

    sendDocument(

        payload: SendDocumentPayload

    ): Promise<MessagingResult>;

}