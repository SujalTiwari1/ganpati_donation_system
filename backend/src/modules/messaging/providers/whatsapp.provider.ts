

import axios, { type AxiosError, type AxiosInstance } from 'axios';

import FormData from 'form-data';

import { whatsappConfig } from '../../../config/whatsapp.config';

import type { IMessagingProvider } from '../interfaces';

import type {
  MessagingResult,
  SendDocumentPayload,
  SendTextPayload,
  SendTemplatePayload,
  WhatsAppUploadResponse,
  WhatsAppSendMessageResponse,
  WhatsAppErrorResponse,
} from '../types';

import { WHATSAPP_ENDPOINTS, WHATSAPP_MESSAGES } from '../messaging.constants';

import { InternalServerError } from '../../../shared/errors';

// ─── Diagnostic helpers ─────────────────────────────────────────────────────

/** Generates a short, human-readable correlation ID for each WA operation. */
function makeCorrelationId(): string {
  return 'WA-' + Math.floor(10_000_000 + Math.random() * 89_999_999);
}

/** Safe token summary – never logs the raw value. */
function tokenSummary(token: string | undefined): object {
  if (!token) return { exists: false, length: 0, last4: 'N/A' };
  return {
    exists: true,
    length: token.length,
    last4: token.slice(-4),
  };
}

/** Extracts every meaningful field out of an Axios error response. */
function extractAxiosError(error: AxiosError<WhatsAppErrorResponse>): object {
  const metaErr = error.response?.data?.error;
  return {
    httpStatus:      error.response?.status,
    httpStatusText:  error.response?.statusText,
    axiosErrorCode:  error.code,
    axiosErrorName:  error.name,
    axiosErrorMsg:   error.message,
    metaErrorCode:   metaErr?.code,
    metaErrorMsg:    metaErr?.message,
    metaErrorType:   metaErr?.type,
    metaErrorSub:    (metaErr as any)?.error_subcode,
    fbtrace_id:      (metaErr as any)?.fbtrace_id,
    rawResponseData: error.response?.data,
  };
}

/** Prints the final structured diagnostic report to stdout. */
function printReport(r: {
  correlationId: string;
  receiptGenerated: boolean;
  receiptExists: boolean;
  receiptSizeKB?: number;
  phoneNumberIdOk: boolean;
  businessAccountIdOk: boolean;
  uploadEndpointOk: boolean;
  uploadRequestOk: boolean;
  uploadResponseOk: boolean;
  uploadHttpStatus?: number;
  metaErrorCode?: number;
  metaErrorMsg?: string;
  templateReady: string;
}): void {
  const ok  = (v: boolean | undefined) => (v ? '✅' : '❌');
  const lines = [
    '',
    '====================================',
    'WhatsApp Integration Report',
    '====================================',
    `Receipt Generated        ${ok(r.receiptGenerated)}`,
    `Receipt Exists           ${ok(r.receiptExists)}`,
    `Receipt Size             ${r.receiptSizeKB !== undefined ? r.receiptSizeKB.toFixed(1) + ' KB' : 'N/A'}`,
    `Phone Number ID          ${ok(r.phoneNumberIdOk)}`,
    `Business Account ID      ${ok(r.businessAccountIdOk)}`,
    `Upload Endpoint          ${ok(r.uploadEndpointOk)}`,
    `Upload Request           ${ok(r.uploadRequestOk)}`,
    `Upload Response          ${ok(r.uploadResponseOk)}`,
    `HTTP Status              ${r.uploadHttpStatus ?? 'N/A'}`,
    `Meta Error Code          ${r.metaErrorCode ?? 'N/A'}`,
    `Meta Error Message       ${r.metaErrorMsg ?? 'N/A'}`,
    `Template Ready           ${r.templateReady}`,
    `Correlation ID           ${r.correlationId}`,
    '====================================',
    '',
  ];
  console.log(lines.join('\n'));
}

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

  public async uploadMedia(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    const correlationId = makeCorrelationId();

    // ── 1. Log active configuration (no raw token) ────────────────────────
    const phoneIdOk  = !!whatsappConfig.phoneNumberId;
    const bizIdOk   = !!whatsappConfig.businessAccountId;
    const endpoint   = `/${whatsappConfig.phoneNumberId}/${WHATSAPP_ENDPOINTS.MEDIA}`;
    const baseUrl    = `https://graph.facebook.com/${whatsappConfig.apiVersion}`;

    console.log(`[${correlationId}] ── WhatsApp Configuration ──────────────────────────────`);
    console.log(`[${correlationId}]   GRAPH_API_VERSION  : ${whatsappConfig.apiVersion}`);
    console.log(`[${correlationId}]   PHONE_NUMBER_ID    : ${whatsappConfig.phoneNumberId || '⚠ MISSING'}`);
    console.log(`[${correlationId}]   BUSINESS_ACCT_ID   : ${whatsappConfig.businessAccountId || '⚠ MISSING'}`);
    console.log(`[${correlationId}]   TEMPLATE_NAME      : ${whatsappConfig.templateName}`);
    console.log(`[${correlationId}]   TEMPLATE_LANGUAGE  : ${whatsappConfig.templateLanguage}`);
    console.log(`[${correlationId}]   ACCESS_TOKEN       :`, tokenSummary(whatsappConfig.accessToken));

    // ── 2. Check for common ID-swap mistake ──────────────────────────────
    if (
      whatsappConfig.phoneNumberId &&
      whatsappConfig.businessAccountId &&
      whatsappConfig.phoneNumberId === whatsappConfig.businessAccountId
    ) {
      console.error(`[${correlationId}] 🚨 CRITICAL: PHONE_NUMBER_ID === BUSINESS_ACCOUNT_ID – IDs are swapped!`);
    }

    // ── 3. Validate the buffer before touching the network ───────────────
    const sizeBytes = file.length;
    const sizeKB    = sizeBytes / 1024;
    const sizeMB    = sizeKB   / 1024;
    const bufferOk  = sizeBytes > 0;

    console.log(`[${correlationId}] ── Receipt Buffer ──────────────────────────────────────`);
    console.log(`[${correlationId}]   fileName      : ${fileName}`);
    console.log(`[${correlationId}]   mimeType      : ${mimeType}`);
    console.log(`[${correlationId}]   extension     : ${fileName.split('.').pop() ?? 'unknown'}`);
    console.log(`[${correlationId}]   sizeBytes     : ${sizeBytes}`);
    console.log(`[${correlationId}]   sizeKB        : ${sizeKB.toFixed(2)} KB`);
    console.log(`[${correlationId}]   sizeMB        : ${sizeMB.toFixed(4)} MB`);
    console.log(`[${correlationId}]   bufferOk      : ${bufferOk ? '✅' : '❌ EMPTY BUFFER'}`);

    if (!bufferOk) {
      printReport({
        correlationId,
        receiptGenerated: true, receiptExists: false, receiptSizeKB: 0,
        phoneNumberIdOk: phoneIdOk, businessAccountIdOk: bizIdOk,
        uploadEndpointOk: false, uploadRequestOk: false, uploadResponseOk: false,
        templateReady: 'Not Executed',
      });
      throw new InternalServerError('Receipt PDF buffer is empty – cannot upload.');
    }

    // ── 4. Build FormData and log each field (no binary) ─────────────────
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    console.log(`[${correlationId}]   FormData field appended: messaging_product = whatsapp`);

    formData.append('type', mimeType);
    console.log(`[${correlationId}]   FormData field appended: type = ${mimeType}`);

    formData.append('file', file, {
      filename:    fileName,
      contentType: mimeType,
      knownLength: file.length,
    });
    console.log(`[${correlationId}]   FormData field appended: file = <binary, ${sizeBytes} bytes, contentType=${mimeType}>`);

    // ── 5. Log the upload request details ────────────────────────────────
    const uploadUrl = `${baseUrl}${endpoint}`;
    console.log(`[${correlationId}] ── Upload Request ──────────────────────────────────────`);
    console.log(`[${correlationId}]   Method            : POST`);
    console.log(`[${correlationId}]   Full URL          : ${uploadUrl}`);
    console.log(`[${correlationId}]   Phone Number ID   : ${whatsappConfig.phoneNumberId}`);
    console.log(`[${correlationId}]   Graph API Version : ${whatsappConfig.apiVersion}`);
    console.log(`[${correlationId}]   Timeout           : ${whatsappConfig.timeout} ms`);
    console.log(`[${correlationId}]   Content-Type Header: ${formData.getHeaders()['content-type']}`);

    // ── 6. Execute and time the request ──────────────────────────────────
    const uploadStart = Date.now();
    let uploadHttpStatus: number | undefined;
    let metaErrorCode: number | undefined;
    let metaErrorMsg: string | undefined;

    try {
      const response = await this.client.post<WhatsAppUploadResponse>(
        endpoint,
        formData,
        { headers: formData.getHeaders() },
      );
      const elapsed = Date.now() - uploadStart;

      console.log(`[${correlationId}] ── Upload Response ─────────────────────────────────────`);
      console.log(`[${correlationId}]   HTTP Status  : ${response.status} ${response.statusText}`);
      console.log(`[${correlationId}]   Elapsed      : ${elapsed} ms`);
      console.log(`[${correlationId}]   Response body: ${JSON.stringify(response.data)}`);

      const mediaId = response.data?.id;
      if (!mediaId) {
        console.error(`[${correlationId}] ⚠ Upload response missing 'id' field – full body logged above.`);
      } else {
        console.log(`[${correlationId}]   mediaId      : ${mediaId} ✅`);
      }

      printReport({
        correlationId,
        receiptGenerated: true, receiptExists: true, receiptSizeKB: sizeKB,
        phoneNumberIdOk: phoneIdOk, businessAccountIdOk: bizIdOk,
        uploadEndpointOk: true, uploadRequestOk: true,
        uploadResponseOk: !!mediaId, uploadHttpStatus: response.status,
        templateReady: mediaId ? 'Pending' : 'Not Executed',
      });

      return mediaId;
    } catch (error) {
      const elapsed = Date.now() - uploadStart;

      console.error(`[${correlationId}] ── Upload FAILED (${elapsed} ms) ──────────────────────`);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsAppErrorResponse>;
        const details    = extractAxiosError(axiosError);
        uploadHttpStatus  = axiosError.response?.status;
        metaErrorCode     = axiosError.response?.data?.error?.code;
        metaErrorMsg      = axiosError.response?.data?.error?.message;

        console.error(`[${correlationId}]   Full diagnostic:`, JSON.stringify(details, null, 2));

        // Common-mistake checks
        if (uploadHttpStatus === 401) {
          console.error(`[${correlationId}] 🔑 Likely cause: ACCESS_TOKEN is expired or invalid (HTTP 401).`);
        }
        if (uploadHttpStatus === 400 && metaErrorCode === 100) {
          console.error(`[${correlationId}] 🆔 Likely cause: Wrong PHONE_NUMBER_ID – check your .env.`);
        }
        if ((error as any).code === 'ECONNABORTED') {
          console.error(`[${correlationId}] ⏱ Network timeout after ${elapsed} ms.`);
        }
        if ((error as any).code === 'ECONNRESET') {
          console.error(`[${correlationId}] 🔌 Connection reset by Meta server.`);
        }

        printReport({
          correlationId,
          receiptGenerated: true, receiptExists: true, receiptSizeKB: sizeKB,
          phoneNumberIdOk: phoneIdOk, businessAccountIdOk: bizIdOk,
          uploadEndpointOk: true, uploadRequestOk: true,
          uploadResponseOk: false, uploadHttpStatus,
          metaErrorCode, metaErrorMsg,
          templateReady: 'Not Executed',
        });

        throw new InternalServerError(
          axiosError.response?.data?.error?.message ?? WHATSAPP_MESSAGES.MEDIA_UPLOAD_FAILED,
        );
      }

      printReport({
        correlationId,
        receiptGenerated: true, receiptExists: true, receiptSizeKB: sizeKB,
        phoneNumberIdOk: phoneIdOk, businessAccountIdOk: bizIdOk,
        uploadEndpointOk: true, uploadRequestOk: true,
        uploadResponseOk: false,
        templateReady: 'Not Executed',
      });

      throw error;
    }
  }
  private async sendDocumentMessage(
    recipient: string,
    mediaId: string,
    caption?: string,
    filename?: string,
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
            filename,
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

    return this.sendDocumentMessage(recipient, mediaId, payload.caption, payload.fileName);
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

  async sendTemplate(payload: SendTemplatePayload): Promise<MessagingResult> {
    const correlationId = makeCorrelationId();
    const recipient     = this.normalizePhoneNumber(payload.recipient);

    // ── Log full template payload (no sensitive data) ─────────────────────
    const templatePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: payload.templateName,
        language: { code: payload.languageCode },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'document',
                document: { id: payload.mediaId, filename: payload.fileName },
              },
            ],
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: payload.donorName },
              { type: 'text', text: payload.amount    },
            ],
          },
        ],
      },
    };

    console.log(`[${correlationId}] ── Template Payload ────────────────────────────────────`);
    console.log(`[${correlationId}]   templateName     : ${payload.templateName}`);
    console.log(`[${correlationId}]   languageCode     : ${payload.languageCode}`);
    console.log(`[${correlationId}]   mediaId          : ${payload.mediaId}`);
    console.log(`[${correlationId}]   fileName         : ${payload.fileName}`);
    console.log(`[${correlationId}]   donorName ({{1}}): ${payload.donorName}`);
    console.log(`[${correlationId}]   amount    ({{2}}): ${payload.amount}`);
    console.log(`[${correlationId}]   recipient        : ${recipient}`);
    console.log(`[${correlationId}]   fullPayload      :`, JSON.stringify(templatePayload, null, 2));

    const sendStart = Date.now();

    try {
      const response = await this.client.post<WhatsAppSendMessageResponse>(
        `/${whatsappConfig.phoneNumberId}/${WHATSAPP_ENDPOINTS.MESSAGES}`,
        templatePayload,
      );
      const elapsed = Date.now() - sendStart;

      console.log(`[${correlationId}] ── Template Send Response (${elapsed} ms) ──────────────`);
      console.log(`[${correlationId}]   HTTP Status    : ${response.status}`);
      console.log(`[${correlationId}]   Response body  : ${JSON.stringify(response.data)}`);

      return {
        success: true,
        providerName: 'whatsapp',
        providerMessageId: response.data.messages[0]?.id,
        providerMediaId: payload.mediaId,
      };
    } catch (error) {
      const elapsed = Date.now() - sendStart;
      console.error(`[${correlationId}] ── Template Send FAILED (${elapsed} ms) ────────────────`);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsAppErrorResponse>;
        const details    = extractAxiosError(axiosError);
        console.error(`[${correlationId}]   Full diagnostic:`, JSON.stringify(details, null, 2));

        if (axiosError.response?.status === 401) {
          console.error(`[${correlationId}] 🔑 Likely cause: ACCESS_TOKEN is expired or invalid (HTTP 401).`);
        }
        if ((axiosError.response?.data?.error as any)?.code === 132001) {
          console.error(`[${correlationId}] 🗂 Error 132001: Template name or language mismatch.`);
          console.error(`[${correlationId}]   Sent name='${payload.templateName}', lang='${payload.languageCode}'.`);
          console.error(`[${correlationId}]   Verify these match exactly in WhatsApp Manager.`);
        }

        return {
          success: false,
          providerName: 'whatsapp',
          providerMediaId: payload.mediaId,
          error: axiosError.response?.data?.error?.message ?? WHATSAPP_MESSAGES.DOCUMENT_SEND_FAILED,
        };
      }

      return {
        success: false,
        providerName: 'whatsapp',
        providerMediaId: payload.mediaId,
        error: WHATSAPP_MESSAGES.DOCUMENT_SEND_FAILED,
      };
    }
  }
}
