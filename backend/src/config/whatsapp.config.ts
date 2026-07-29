    // src/config/whatsapp.config.ts

import { env } from "./env";

export const whatsappConfig = {
    enabled: env.WHATSAPP_ENABLED,

    apiVersion: env.WHATSAPP_API_VERSION,

    accessToken: env.WHATSAPP_ACCESS_TOKEN,

    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,

    businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,

    verifyToken: env.WHATSAPP_VERIFY_TOKEN,

    timeout: env.WHATSAPP_TIMEOUT,

    defaultCountryCode: env.WHATSAPP_DEFAULT_COUNTRY_CODE,
} as const;