export interface WhatsAppWebhookVerificationQuery {
  'hub.mode'?: string;
  'hub.challenge'?: string;
  'hub.verify_token'?: string;
}

export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppWebhookStatusValue {
  id: string;
  status: WhatsAppMessageStatus;
  timestamp?: string;
  recipient_id?: string;
  conversation?: {
    id?: string;
    expiration_timestamp?: string;
    origin?: {
      type?: string;
    };
  };
  pricing?: {
    billable?: boolean;
    pricing_model?: string;
    category?: string;
  };
  errors?: Array<{
    code?: number;
    title?: string;
    message?: string;
  }>;
}

export interface WhatsAppWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        messages?: Array<{
          id?: string;
          from?: string;
          timestamp?: string;
          type?: string;
        }>;
        statuses?: WhatsAppWebhookStatusValue[];
      };
    }>;
  }>;
}
