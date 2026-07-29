import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import { whatsappConfig } from "../config/whatsapp.config";

export const whatsappClient = axios.create({
    baseURL: `https://graph.facebook.com/${whatsappConfig.apiVersion}`,
    timeout: whatsappConfig.timeout,
    headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        Accept: "application/json",
    },
});

/**
 * Request Interceptor
 */
whatsappClient.interceptors.request.use(
    (
        config: InternalAxiosRequestConfig
    ): InternalAxiosRequestConfig => {

        // Future:
        // Logger
        // Correlation ID
        // Metrics
        // Tracing

        return config;
    },

    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 */
whatsappClient.interceptors.response.use(

    (
        response: AxiosResponse
    ): AxiosResponse => {

        // Future:
        // Metrics
        // Logging

        return response;
    },

    (error: AxiosError) => {

        // Future:
        // Retry Policy
        // Error Mapping
        // Rate Limit Handling

        return Promise.reject(error);
    }
);