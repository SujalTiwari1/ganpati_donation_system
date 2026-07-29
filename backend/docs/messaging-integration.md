# Messaging Integration

## 1. Objective

Integrate the existing Messaging module into the donation transaction workflow while preserving the current Clean Architecture design, keeping each service focused on a single responsibility, and ensuring messaging failures do not affect transaction success.

---

## 2. Previous Architecture

Previously, transaction creation ended at database persistence and audit recording. Receipt generation and messaging were not part of the transaction business flow, so the workflow looked like:

```
Client Request
↓
TransactionController
↓
TransactionService
↓
TransactionRepository
```

TransactionService handled transaction validation, duplicate checks, receipt sequencing, and persistence only.

---

## 3. New Architecture

The new workflow integrates receipt generation and WhatsApp delivery after the database transaction commits:

```
Client Request
↓
TransactionController
↓
TransactionService
↓
TransactionRepository
↓
ReceiptService
↓
MessagingService
↓
WhatsAppProvider
↓
Meta WhatsApp API
```

---

## 4. Detailed Flow

1. Client sends a donation transaction request.
2. `TransactionController` forwards the request to `TransactionService.create`.
3. `TransactionService` validates the request and resolves related entities (building, festival, donor).
4. `TransactionService` begins a Prisma transaction and persists the new transaction record.
5. `TransactionService` records audit metadata and commits the transaction.
6. After commit, `TransactionService` calls `ReceiptService.generateReceipt`.
7. `ReceiptService` loads transaction details, renders the receipt HTML template, and generates a PDF buffer.
8. `ReceiptService` returns a `ReceiptDocument` containing:
   - `buffer`
   - `fileName`
   - `mimeType`
9. `TransactionService` passes the receipt document to `MessagingService.sendDocument`.
10. `MessagingService` delegates to `WhatsAppProvider` and sends the document to Meta WhatsApp.
11. `TransactionService` returns the successful transaction response to the client regardless of WhatsApp delivery result.

---

## 5. Responsibilities

- `TransactionService`
  - validates input
  - creates and commits the transaction
  - orchestrates receipt generation and messaging
  - logs messaging failures without failing the transaction

- `ReceiptService`
  - loads transaction data
  - generates PDF receipts
  - returns receipt metadata and buffer
  - does not call messaging or external providers

- `MessagingService`
  - exposes `sendText` and `sendDocument`
  - validates whether messaging is enabled
  - delegates delivery to `IMessagingProvider`

- `WhatsAppProvider`
  - normalizes recipient phone numbers
  - uploads media to Meta WhatsApp
  - sends WhatsApp document and text messages
  - returns provider-level result objects

---

## 6. Error Handling Strategy

Messaging failure is treated as an external side effect and must not rollback the transaction.

Workflow:

```
Transaction Saved ✅
↓
Receipt Generated ✅
↓
WhatsApp Failed ❌
↓
Log Failure
↓
Return Transaction Success
```

If WhatsApp delivery fails, `TransactionService` logs the error and continues returning the transaction success response. This keeps transaction success independent from external messaging availability.

---

## 7. Dependency Injection

Existing shared objects are used for DI.

- `transaction.service.ts` receives:
  - `TransactionRepository`
  - `ReceiptService`
  - `MessagingService`

- The messaging module is injected via `src/modules/messaging/container.ts`.
- No new direct `new MessagingService(...)` or `new WhatsAppProvider(...)` calls were introduced in business services.

---

## 8. Sequence Diagram

```
Client
↓
TransactionController
↓
TransactionService
↓
TransactionRepository
↓
ReceiptService
↓
MessagingService
↓
WhatsAppProvider
↓
Meta WhatsApp API
```

---

## 9. Future Improvements

Potential enhancements:

- Retry mechanism for WhatsApp failures
- Background queue for delivery using BullMQ, RabbitMQ, or Kafka
- Provider factory for multi-channel delivery (WhatsApp, SMS, Email)
- Audit logs for delivery attempts
- Metrics and observability for message success/failure
- Separate notification service for non-blocking side effects

---

## 10. Summary

This integration keeps the donation workflow transaction-first while adding receipt generation and WhatsApp delivery in a decoupled, post-commit manner. `ReceiptService` remains responsible only for PDF creation, `MessagingService` remains the messaging boundary, and `TransactionService` orchestrates the flow without allowing external messaging failure to break transaction success.
