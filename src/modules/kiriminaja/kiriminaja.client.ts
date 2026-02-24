import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Logger } from '@utils/index';

/**
 * KiriminAja HTTP Client
 * Sandbox    : https://tdev.kiriminaja.com
 * Production : https://client.kiriminaja.com
 *
 * Auth: Bearer token via header Authorization
 */
class KiriminAjaClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL =
      process.env.KIRIMINAJA_ENV === 'production'
        ? 'https://client.kiriminaja.com'
        : 'https://tdev.kiriminaja.com';

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Inject API Key di setiap request
    this.client.interceptors.request.use((config) => {
      const apiKey = process.env.KIRIMINAJA_API_KEY;
      if (!apiKey) {
        throw new Error('KIRIMINAJA_API_KEY is not set in environment variables');
      }
      config.headers['Authorization'] = `Bearer ${apiKey}`;

      Logger.debug('[KiriminAja] →  Request', {
        method: config.method?.toUpperCase(),
        url: `${baseURL}${config.url}`,
        params: config.params,
        body: config.data,
      });

      return config;
    });

    // Log response & normalise error
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        Logger.debug('[KiriminAja] ←  Response', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        const errData = error.response?.data;
        Logger.error('[KiriminAja] ✗  API Error', {
          status: error.response?.status,
          url: error.config?.url,
          data: errData,
        });
        // Lempar pesan error dari KiriminAja agar bisa ditangkap service
        const message =
          errData?.text || errData?.message || error.message || 'KiriminAja API error';
        throw new Error(message);
      },
    );
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const res = await this.client.get<T>(path, { params });
    return res.data;
  }

  async post<T>(path: string, body?: Record<string, any>): Promise<T> {
    const res = await this.client.post<T>(path, body);
    return res.data;
  }
}

// Singleton – satu instance dipakai seluruh aplikasi
export const kiriminAjaClient = new KiriminAjaClient();