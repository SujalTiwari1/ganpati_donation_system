import axios, {
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import { whatsappConfig } from "../../../config/whatsapp.config";

export const whatsappClient = axios.create({
    baseURL: `https://graph.facebook.com/${whatsappConfig.apiVersion}`,

    timeout: whatsappConfig.timeout,

    headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        Accept: "application/json",
    },
});

whatsappClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error) => Promise.reject(error)
);

whatsappClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => Promise.reject(error)
);