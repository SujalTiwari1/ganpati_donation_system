import { whatsappClient } from "./clients";
import { WhatsAppProvider } from "./providers";
import { MessagingService } from "./messaging.service";

const whatsappProvider = new WhatsAppProvider(
    whatsappClient
);

export const messagingService =
    new MessagingService(
        whatsappProvider
    );