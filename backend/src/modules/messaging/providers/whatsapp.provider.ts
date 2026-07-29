import axios, { type AxiosError, type AxiosInstance } from 'axios';

import FormData from 'form-data';

import { whatsappConfig } from '../../../config/whatsapp.config';

import type { IMessagingProvider } from '../interfaces';

import type {
  MessagingResult,
  SendDocumentPayload,
  SendTextPayload,
  WhatsAppUploadResponse,
  WhatsAppSendMessageResponse,
  WhatsAppErrorResponse,
} from '../types';

import { WHATSAPP_ENDPOINTS, WHATSAPP_MESSAGES } from '../messaging.constants';

import { InternalServerError } from '../../../shared/errors';

export class WhatsAppProvider implements IMessagingProvider {
  constructor(private readonly client: AxiosInstance) {}

  private normalizePhoneNumber(phoneNumber: string): string {
    let normalized = phoneNumber.trim();

    normalized = normalized.replace(/\s+/g, '');

    normalized = normalized.replace(/-/g, '');

    normalized = normalized.replace(/[()]/g, '');

    normalized = normalized.replace(/^\+/, '');

    if (!normalized.startsWith(whatsappConfig.defaultCountryCode)) {
      normalized = whatsappConfig.defaultCountryCode + normalized;
    }

    return normalized;
  }

  private async uploadMedia(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    const formData = new FormData();

    formData.append('messaging_product', 'whatsapp');

    formData.append('type', mimeType);

    formData.append('file', file, {
      filename: fileName,
      contentType: mimeType,
    });

    try {
      const response = await this.client.post<WhatsAppUploadResponse>(
        `/${whatsappConfig.phoneNumberId}/${WHATSAPP_ENDPOINTS.MEDIA}`,
        formData,
        {
          headers: formData.getHeaders(),
        },
      );

      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsAppErrorResponse>;

        throw new InternalServerError(
          axiosError.response?.data.error.message ?? WHATSAPP_MESSAGES.MEDIA_UPLOAD_FAILED,
        );
      }

      throw error;
    }
  }
  private async sendDocumentMessage(
    recipient: string,
    mediaId: string,
    caption?: string,
  ): Promise<MessagingResult> {
    try {
      const response = await this.client.post<WhatsAppSendMessageResponse>(
        `/${whatsappConfig.phoneNumberId}/${WHATSAPP_ENDPOINTS.MESSAGES}`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'document',
          document: {
            id: mediaId,
            caption,
          },
        },
      );

      return {
        success: true,
        providerName: 'whatsapp',
        providerMessageId: response.data.messages[0]?.id,
        providerMediaId: mediaId,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsAppErrorResponse>;

        return {
          success: false,
          providerName: 'whatsapp',
          providerMediaId: mediaId,
          error: axiosError.response?.data.error.message ?? WHATSAPP_MESSAGES.DOCUMENT_SEND_FAILED,
        };
      }

      return {
        success: false,
        providerName: 'whatsapp',
        providerMediaId: mediaId,
        error: WHATSAPP_MESSAGES.DOCUMENT_SEND_FAILED,
      };
    }
  }
  async sendDocument(payload: SendDocumentPayload): Promise<MessagingResult> {
    const recipient = this.normalizePhoneNumber(payload.recipient);

    const mediaId = await this.uploadMedia(payload.file, payload.fileName, payload.mimeType);

    return this.sendDocumentMessage(recipient, mediaId, payload.caption);
  }
  async sendText(payload: SendTextPayload): Promise<MessagingResult> {
    const recipient = this.normalizePhoneNumber(payload.recipient);

    try {
      const response = await this.client.post<WhatsAppSendMessageResponse>(
        `/${whatsappConfig.phoneNumberId}/${WHATSAPP_ENDPOINTS.MESSAGES}`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: {
            preview_url: false,
            body: payload.message,
          },
        },
      );

      return {
        success: true,
        providerName: 'whatsapp',
        providerMessageId: response.data.messages[0]?.id,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsAppErrorResponse>;
        // console.dir(axiosError.response?.data, {
        //   depth: null,
        // });
        // console.log(JSON.stringify(axiosError.response?.data, null, 2));
        return {
          success: false,
          providerName: 'whatsapp',
          error: axiosError.response?.data.error.message ?? WHATSAPP_MESSAGES.TEXT_SEND_FAILED,
        };
      }

      return {
        success: false,
        providerName: 'whatsapp',
        error: WHATSAPP_MESSAGES.TEXT_SEND_FAILED,
      };
    }
  }
}
