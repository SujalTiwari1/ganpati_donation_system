import { whatsappClient } from "../clients";
import { WhatsAppProvider } from "./whatsapp.provider";

export const whatsappProvider = new WhatsAppProvider(
    whatsappClient
);

export * from "./whatsapp.provider";