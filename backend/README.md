# Backend Receipt and WhatsApp Sync

This backend now keeps the transaction record aligned with receipt generation and WhatsApp delivery state.

## What Changed

- Transaction creation still runs through the existing `TransactionService -> ReceiptService -> MessagingService -> WhatsAppProvider` flow.
- Receipt generation now updates `receiptGenerated` after the PDF is created.
- WhatsApp delivery state is stored on the transaction row and updated both synchronously after send and asynchronously from Meta webhooks.
- A dedicated webhook module handles Meta verification and delivery/read/failure callbacks.

## Transaction Flow

```text
POST /api/v1/transactions
  -> create transaction in DB
  -> commit
  -> generate receipt PDF
  -> update receiptGenerated
  -> upload PDF to Meta
  -> send WhatsApp document
  -> update whatsappStatus and message metadata
```

## WhatsApp Status Lifecycle

```text
PENDING -> SENT -> DELIVERED -> READ
PENDING -> FAILED
PENDING -> SKIPPED
```

Status meanings:

- `PENDING`: receipt exists and the message is waiting to be delivered.
- `SENT`: WhatsApp accepted the document send request.
- `DELIVERED`: Meta reported delivery.
- `READ`: Meta reported that the recipient read the message.
- `FAILED`: send or webhook failure.
- `SKIPPED`: messaging is disabled, so no delivery attempt was made.

## Transaction Fields

The transaction model now stores:

- `receiptGenerated`
- `whatsappStatus`
- `providerMessageId`
- `providerMediaId`
- `whatsappDeliveredAt`
- `whatsappReadAt`
- `whatsappFailureReason`

## Webhook Endpoints

### Verification

- `GET /api/v1/webhooks/whatsapp`

Meta sends:

- `hub.mode`
- `hub.challenge`
- `hub.verify_token`

The request is accepted only when `hub.mode === subscribe` and the token matches `WHATSAPP_VERIFY_TOKEN`.

### Status Events

- `POST /api/v1/webhooks/whatsapp`

Supported Meta statuses:

- `sent`
- `delivered`
- `read`
- `failed`

The webhook looks up the transaction by `providerMessageId` and updates the matching row.

## Environment Variables

Required WhatsApp settings:

- `WHATSAPP_ENABLED`
- `WHATSAPP_API_VERSION`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_DEFAULT_COUNTRY_CODE`
- `WHATSAPP_TIMEOUT`

## Related Documentation

- [WhatsApp webhook details](docs/whatsapp-webhook.md)

## Notes

- Receipt generation failure does not roll back the transaction.
- WhatsApp send failure does not roll back the transaction.
- Webhook processing always returns `200` after logging and applying any status updates it can resolve.