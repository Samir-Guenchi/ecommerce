import { API_URL } from '../config/api.config';

/**
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
};

/**
 * Public Storefront API (resolve stores by domain)
 */
export const storefrontAPI = {
  /**
   * Get store by domain with all active products
   */
  getStoreByDomain: async (
    domain: string
  ): Promise<{ store: any; products: any[] }> => {
    const response = await fetch(`${API_URL}/storefront/${domain}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Get a single product for a store domain
   */
  getProductForStore: async (
    domain: string,
    productId: number
  ): Promise<{ store: any; product: any }> => {
    const response = await fetch(
      `${API_URL}/storefront/${domain}/products/${productId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return handleResponse(response);
  },

  /**
   * Create a transaction for a store (records transaction under the seller)
   */
  createTransactionForStore: async (
    domain: string,
    data: {
      amount: number;
      orderId?: number | null;
      paymentMethodId?: number | null;
      transactionType?: string;
      status?: string;
      transactionReference?: string;
    }
  ): Promise<{ message: string; transaction: any }> => {
    const response = await fetch(`${API_URL}/storefront/${domain}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Create an order for a store
   */
  createOrderForStore: async (
    domain: string,
    data: {
      productId: number;
      quantity?: number;
      fullName: string;
      phone: string;
      wilaya: string;
      commune: string;
      deliveryType: 'stop_desk' | 'domicile';
      shippingAddress?: string;
    }
  ): Promise<{ message: string; order: any; transaction: any }> => {
    const response = await fetch(`${API_URL}/storefront/${domain}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Track an event for a store
   */
  trackEventForStore: async (
    domain: string,
    eventType: string,
    eventData?: Record<string, any>
  ): Promise<{ message: string; event: any }> => {
    const response = await fetch(`${API_URL}/storefront/${domain}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, eventData }),
    });
    return handleResponse(response);
  },
};


